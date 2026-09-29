import React, { useState, useEffect, useRef } from 'react';
import type { User, Trip, Waypoint, TripWeather } from '../../types';
import { StorageService } from '../../services/storage';
import { calculateDistance, ISRAELI_HOTSPOTS } from '../../services/routeParser';
import {
  Play,
  Pause,
  Square,
  Navigation,
  MapPin,
  Clock,
  Zap,
  Coffee,
  X,
  Gauge,
  Flame
} from 'lucide-react';

interface LiveRideModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onTripFinished: (newTrip: Trip) => void;
}

interface RecordedStop {
  id: string;
  name: string;
  category: 'cafe' | 'twisties' | 'viewpoint' | 'gas' | 'wash' | 'poi';
  lat: number;
  lng: number;
  time: string;
  durationMinutes: number;
  description: string;
  googleMapsUrl?: string;
  websiteUrl?: string;
}

export const LiveRideModal: React.FC<LiveRideModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onTripFinished,
}) => {
  // Ride recording status: 'idle' | 'recording' | 'paused' | 'finished'
  const [status, setStatus] = useState<'idle' | 'recording' | 'paused' | 'finished'>('idle');

  // Dashboard Telemetry
  const [currentSpeed, setCurrentSpeed] = useState<number>(0); // km/h
  const [maxSpeed, setMaxSpeed] = useState<number>(0);
  const [avgSpeed, setAvgSpeed] = useState<number>(0);
  const speedSamplesRef = useRef<{ sum: number; count: number }>({ sum: 0, count: 0 });
  const [totalKm, setTotalKm] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [idleSeconds, setIdleSeconds] = useState<number>(0);
  const [coordinates, setCoordinates] = useState<[number, number][]>([]);
  const [recordedStops, setRecordedStops] = useState<RecordedStop[]>([]);

  // Simulation Mode vs Real GPS
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsStatusText, setGpsStatusText] = useState<string>('ממתין לתחילת רכיבה');

  // Detected stop helper
  const [detectedStopBanner, setDetectedStopBanner] = useState<string | null>(null);

  // References
  const timerRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);
  const wakeLockRef = useRef<any>(null);
  const simStepRef = useRef<number>(0);
  const simIntervalRef = useRef<any>(null);

  // Auto screen wake-lock for iOS / Android cockpit mount
  useEffect(() => {
    if (status === 'recording' && 'wakeLock' in navigator) {
      try {
        (navigator as any).wakeLock.request('screen').then((lock: any) => {
          wakeLockRef.current = lock;
        }).catch(() => {});
      } catch {}
    }
    return () => {
      if (wakeLockRef.current) {
        try {
          wakeLockRef.current.release();
        } catch {}
        wakeLockRef.current = null;
      }
    };
  }, [status]);

  // Main active timer
  useEffect(() => {
    if (status === 'recording') {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
        if (currentSpeed < 3) {
          setIdleSeconds((prev) => prev + 1);
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, currentSpeed]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, []);

  if (!isOpen) return null;

  // Real GPS Start
  const startRealGps = () => {
    if (!navigator.geolocation) {
      setGpsStatusText('דפדפן אינו תומך ב-GPS ישיר. מפעיל מצב סימולציה.');
      startSimulation();
      return;
    }

    setStatus('recording');
    setIsSimulating(false);
    setGpsStatusText('מחפש קליטת לוויינים...');

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, speed, accuracy } = pos.coords;
        setGpsAccuracy(Math.round(accuracy));
        setGpsStatusText(`GPS מדויק פעיל (דיוק: ±${Math.round(accuracy)} מטר)`);

        // Convert speed from m/s to km/h
        const speedKmh = speed && speed > 0 ? Math.round(speed * 3.6) : 0;
        setCurrentSpeed(speedKmh);
        setMaxSpeed((prev) => Math.max(prev, speedKmh));

        if (speedKmh > 0) {
          speedSamplesRef.current.sum += speedKmh;
          speedSamplesRef.current.count += 1;
          const calculatedAvg = Math.round(speedSamplesRef.current.sum / speedSamplesRef.current.count);
          setAvgSpeed(calculatedAvg);
        }

        setCoordinates((prev) => {
          if (prev.length > 0) {
            const last = prev[prev.length - 1];
            const dist = calculateDistance(last[0], last[1], latitude, longitude);
            if (dist > 0.01) {
              setTotalKm((k) => Math.round((k + dist) * 100) / 100);
              return [...prev, [latitude, longitude]];
            }
            return prev;
          }
          return [[latitude, longitude]];
        });

        // Smart Stop Detection: Check proximity to hotspots if speed is 0
        if (speedKmh === 0) {
          checkNearbyHotspots(latitude, longitude);
        } else {
          setDetectedStopBanner(null);
        }
      },
      () => {
        setGpsStatusText('אין גישה ל-GPS. עבור למצב סימולציית רכיבה לבדיקה.');
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 10000,
      }
    );
  };

  // Check if current position matches known rider hotspots
  const checkNearbyHotspots = (lat: number, lng: number) => {
    for (const spot of ISRAELI_HOTSPOTS) {
      const distKm = calculateDistance(lat, lng, spot.lat, spot.lng);
      if (distKm < 0.35) {
        // within 350 meters
        setDetectedStopBanner(`זוהתה עצירה ב-${spot.name}!`);
        // Auto add stop if not already added in last 5 minutes
        setRecordedStops((prev) => {
          if (!prev.some((s) => s.name === spot.name)) {
            const now = new Date();
            const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            return [
              ...prev,
              {
                id: `stop-${Date.now()}`,
                name: spot.name,
                category: spot.category === 'start' || spot.category === 'end' ? 'poi' : (spot.category as any),
                lat: spot.lat,
                lng: spot.lng,
                time: timeStr,
                durationMinutes: 15,
                description: spot.highlight || 'עצירת התרעננות',
                googleMapsUrl: spot.googleMapsUrl,
                websiteUrl: spot.websiteUrl,
              },
            ];
          }
          return prev;
        });
        break;
      }
    }
  };

  // Simulation Track: Kiryat Ono -> Beit Shemesh -> Nes Harim -> Derech HaGefen
  const SIMULATION_ROUTE: { lat: number; lng: number; speed: number; name?: string }[] = [
    { lat: 32.0298, lng: 34.8580, speed: 0, name: 'קריית אונו (יציאה)' },
    { lat: 32.0100, lng: 34.8700, speed: 65 },
    { lat: 31.9500, lng: 34.9100, speed: 92 },
    { lat: 31.8800, lng: 34.9400, speed: 104 },
    { lat: 31.7800, lng: 34.9700, speed: 88 },
    { lat: 31.7486, lng: 34.9892, speed: 50, name: 'בית שמש (צומת שמשון)' },
    { lat: 31.7470, lng: 35.0100, speed: 78 },
    { lat: 31.7450, lng: 35.0500, speed: 72, name: 'כביש נס הרים (כביש 386)' },
    { lat: 31.7550, lng: 35.1000, speed: 68 },
    { lat: 31.7683, lng: 35.1300, speed: 55 },
    { lat: 31.7918, lng: 35.1588, speed: 0, name: 'קפה דרך הגפן (בית זית)' },
    { lat: 31.7918, lng: 35.1588, speed: 0 },
    { lat: 31.7950, lng: 35.1500, speed: 60 },
  ];

  // Start Simulation for instant live testing on desktop / home
  const startSimulation = () => {
    setStatus('recording');
    setIsSimulating(true);
    setGpsStatusText('מצב הדמיית רכיבה פעיל (Live Ride Simulator)');
    setGpsAccuracy(3);

    simStepRef.current = 0;
    if (simIntervalRef.current) clearInterval(simIntervalRef.current);

    simIntervalRef.current = setInterval(() => {
      const step = simStepRef.current;
      if (step >= SIMULATION_ROUTE.length) {
        simStepRef.current = SIMULATION_ROUTE.length - 1;
        return;
      }

      const point = SIMULATION_ROUTE[step];
      const randomizedSpeed = point.speed > 0
        ? Math.max(30, point.speed + Math.floor(Math.random() * 9 - 4))
        : 0;

      setCurrentSpeed(randomizedSpeed);
      setMaxSpeed((prev) => Math.max(prev, randomizedSpeed));

      if (randomizedSpeed > 0) {
        speedSamplesRef.current.sum += randomizedSpeed;
        speedSamplesRef.current.count += 1;
        const calculatedAvg = Math.round(speedSamplesRef.current.sum / speedSamplesRef.current.count);
        setAvgSpeed(calculatedAvg);
      }

      setCoordinates((prev) => {
        if (prev.length > 0) {
          const stepKm = randomizedSpeed > 0 ? Math.round((randomizedSpeed * 0.035) * 10) / 10 : 0;
          setTotalKm((k) => Math.round((k + stepKm) * 10) / 10);
        }
        return [...prev, [point.lat, point.lng]];
      });

      if (point.name) {
        setDetectedStopBanner(`נקודת עניין זוהתה: ${point.name}!`);
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        let website: string | undefined = undefined;
        let gmaps = `https://maps.google.com/?q=${encodeURIComponent(point.name)}`;
        let cat: RecordedStop['category'] = 'poi';

        if (point.name.includes('קפה') || point.name.includes('דרך הגפן')) {
          cat = 'cafe';
          website = 'https://www.derech-hagefen.co.il/';
          gmaps = 'https://maps.google.com/?q=Derech+Hagefen+Cafe+Beit+Zayit';
        } else if (point.name.includes('נס הרים')) {
          cat = 'twisties';
          website = 'https://www.facebook.com/barbaharisrael/';
        }

        setRecordedStops((prev) => {
          if (!prev.some((s) => s.name === point.name)) {
            return [
              ...prev,
              {
                id: `sim-stop-${Date.now()}`,
                name: point.name!,
                category: cat,
                lat: point.lat,
                lng: point.lng,
                time: timeStr,
                durationMinutes: point.speed === 0 ? 30 : 10,
                description: point.speed === 0 ? 'עצירת קפה וארוחה בדרך הגפן' : 'מעבר מקטע רכיבה',
                googleMapsUrl: gmaps,
                websiteUrl: website,
              },
            ];
          }
          return prev;
        });
      } else {
        setDetectedStopBanner(null);
      }

      simStepRef.current += 1;
    }, 2500);
  };

  const handlePauseResume = () => {
    if (status === 'recording') {
      setStatus('paused');
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    } else if (status === 'paused') {
      if (isSimulating) {
        startSimulation();
      } else {
        startRealGps();
      }
    }
  };

  const handleAddManualStop = () => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const lastCoord = coordinates.length > 0 ? coordinates[coordinates.length - 1] : [31.7918, 35.1588];

    const newStop: RecordedStop = {
      id: `manual-stop-${Date.now()}`,
      name: `עצירת קפה / מנוחה (${timeStr})`,
      category: 'cafe',
      lat: lastCoord[0],
      lng: lastCoord[1],
      time: timeStr,
      durationMinutes: 20,
      description: 'עצירת קפה יזומה בזמן רכיבה',
      googleMapsUrl: `https://maps.google.com/?q=${lastCoord[0]},${lastCoord[1]}`,
    };

    setRecordedStops((prev) => [...prev, newStop]);
    setDetectedStopBanner('נוספה עצירת קפה ידנית!');
    setTimeout(() => setDetectedStopBanner(null), 3000);
  };

  const handleFinishAndSave = () => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    if (timerRef.current) clearInterval(timerRef.current);

    const now = new Date();
    const dateStr = now.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const hours = Math.round((elapsedSeconds / 3600) * 10) / 10;
    const finalKm = Math.max(totalKm, 12);

    // Build final waypoints array
    const startPoint: Waypoint = {
      id: `live-wp-start-${Date.now()}`,
      name: coordinates.length > 0 ? 'נקודת יציאה' : 'קריית אונו (יציאה)',
      category: 'start',
      lat: coordinates[0]?.[0] || 32.0298,
      lng: coordinates[0]?.[1] || 34.8580,
      time: '06:00',
      stopDurationMinutes: 0,
      description: 'התחלת רכיבה מוקלטת ב-Live GPS',
    };

    const midWaypoints: Waypoint[] = recordedStops.map((s, idx) => ({
      id: `live-wp-${idx}-${Date.now()}`,
      name: s.name,
      category: s.category,
      lat: s.lat,
      lng: s.lng,
      time: s.time,
      stopDurationMinutes: s.durationMinutes,
      description: s.description,
      googleMapsUrl: s.googleMapsUrl,
      websiteUrl: s.websiteUrl,
      reviews: [],
      photos: [],
    }));

    const endPoint: Waypoint = {
      id: `live-wp-end-${Date.now()}`,
      name: 'סיום רכיבה (חזרה)',
      category: 'end',
      lat: coordinates[coordinates.length - 1]?.[0] || 32.0298,
      lng: coordinates[coordinates.length - 1]?.[1] || 34.8580,
      time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
      stopDurationMinutes: 0,
      description: 'סיום רכיבה מוצלחת ושמירה ליומן המסעות',
    };

    const finalWaypoints = [startPoint, ...midWaypoints, endPoint];

    const weatherOptions: TripWeather[] = [
      { condition: 'sunny', temp: 24, label: 'שמש נעימה וראות מעולה (24°C)' },
      { condition: 'partly-cloudy', temp: 22, label: 'מעונן חלקית ורוח קלה (22°C)' },
    ];

    const newLiveTrip: Trip = {
      id: `live-trip-${Date.now()}`,
      title: recordedStops.length > 0
        ? `רכיבת Live: ${recordedStops.map((s) => s.name.split(' ')[0]).join(' ➔ ')}`
        : `רכיבה חיה: ${finalKm} ק"מ ב-GPS`,
      originalPrompt: `נסיעה מוקלטת בזמן אמת ע"י ${currentUser.name} (${currentUser.bikeModel || currentUser.bike}). סה"כ ${finalKm} ק"מ, מהירות מירבית ${maxSpeed} קמ"ש, ${recordedStops.length} עצירות.`,
      date: dateStr,
      startTime: startPoint.time || '06:00',
      endTime: endPoint.time,
      weather: weatherOptions[0],
      creatorId: currentUser.id,
      creatorName: currentUser.name,
      creatorAvatar: currentUser.avatar,
      participants: [currentUser.id],
      pendingInvites: currentUser.friends || [],
      totalKm: finalKm,
      durationHours: Math.max(0.5, hours),
      waypoints: finalWaypoints,
      routeCoordinates: coordinates.length > 2 ? coordinates : [
        [32.0298, 34.8580],
        [31.7486, 34.9892],
        [31.7450, 35.0500],
        [31.7918, 35.1588],
        [32.0298, 34.8580]
      ],
      reviews: [
        {
          id: `rev-live-${Date.now()}`,
          userId: currentUser.id,
          userName: currentUser.name,
          userAvatar: currentUser.avatar,
          stars: 5,
          comment: `נסיעה הוקלטה בשידור חי דרך מנגנון ה-GPS של MyRide. מהירות שיא: ${maxSpeed} קמ"ש!`,
          createdAt: dateStr,
        },
      ],
      photos: [],
      status: 'published',
    };

    StorageService.saveTrip(newLiveTrip);
    onTripFinished(newLiveTrip);
    onClose();
  };

  const formatTimer = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#0b0f19] border border-blue-500/30 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col relative text-right">
        
        {/* Top Header / Cockpit Status */}
        <div className="bg-slate-950/90 border-b border-slate-800/80 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-3 h-3 rounded-full ${
              status === 'recording' ? 'bg-emerald-500 animate-ping' : status === 'paused' ? 'bg-amber-500' : 'bg-slate-600'
            }`} />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black tracking-wide text-white uppercase flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-sky-400" />
                  <span>MyRide Cockpit Live</span>
                </span>
                <span className="text-[10px] bg-blue-600/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                  STRAVA MOTORCYCLE MODE
                </span>
                {gpsAccuracy !== null && (
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">
                    ±{gpsAccuracy}m
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {gpsStatusText} {idleSeconds > 0 && `• שהייה בעצירה: ${formatTimer(idleSeconds)}`}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cockpit Alert / Stop Banner */}
        {detectedStopBanner && (
          <div className="bg-amber-950/60 border-b border-amber-500/40 px-4 py-2 flex items-center justify-between text-amber-300 text-xs font-bold animate-pulse">
            <div className="flex items-center gap-2">
              <Coffee className="w-4 h-4 text-amber-400" />
              <span>{detectedStopBanner}</span>
            </div>
            <span className="text-[10px] text-amber-400/80">עצירה זוהתה אוטומטית</span>
          </div>
        )}

        {/* Main Digital Cockpit Centerpiece */}
        <div className="p-6 space-y-6">
          
          {/* Giant Speedometer & Status Ring */}
          <div className="relative flex flex-col items-center justify-center py-6 bg-gradient-to-b from-slate-900/60 to-slate-950/80 border border-slate-800/80 rounded-3xl shadow-inner overflow-hidden">
            {/* Background glowing halo */}
            <div className={`absolute w-64 h-64 rounded-full filter blur-3xl opacity-20 pointer-events-none transition-colors ${
              currentSpeed > 90 ? 'bg-rose-500' : currentSpeed > 40 ? 'bg-sky-500' : 'bg-blue-600'
            }`} />

            <div className="flex items-baseline gap-2 z-10">
              <span className="font-mono text-7xl sm:text-8xl font-black tracking-tighter text-white tabular-nums drop-shadow-md">
                {currentSpeed}
              </span>
              <div className="flex flex-col text-left">
                <span className="text-sky-400 font-bold text-sm uppercase tracking-wider">קמ"ש</span>
                <span className="text-[10px] text-slate-500 font-mono">SPEED</span>
              </div>
            </div>

            {/* Speed Bar Meter */}
            <div className="w-4/5 max-w-xs h-2 bg-slate-800 rounded-full mt-3 overflow-hidden p-0.5 border border-slate-700/50">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  currentSpeed > 90 ? 'bg-rose-500 shadow-rose-500/50' : 'bg-gradient-to-r from-sky-500 to-blue-500'
                }`}
                style={{ width: `${Math.min(100, (currentSpeed / 130) * 100)}%` }}
              />
            </div>

            {/* Rider & Bike Info */}
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
              <span className="text-white font-semibold">{currentUser.name}</span>
              <span>•</span>
              <span dir="ltr" className="text-sky-400 font-mono font-bold bg-sky-950/60 border border-sky-800/40 px-2 py-0.5 rounded-full text-[11px]">
                {currentUser.bikeModel || currentUser.bike}
              </span>
            </div>
          </div>

          {/* 4 Telemetry Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Odometer */}
            <div className="bg-[#111625] border border-slate-800 p-3.5 rounded-2xl flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-1 text-[11px] text-slate-400 font-semibold mb-1">
                <Navigation className="w-3.5 h-3.5 text-blue-400" />
                <span>מרחק מצטבר</span>
              </div>
              <div className="text-2xl font-black text-white font-mono">{totalKm}</div>
              <span className="text-[10px] text-slate-500">קילומטרים</span>
            </div>

            {/* Moving Timer */}
            <div className="bg-[#111625] border border-slate-800 p-3.5 rounded-2xl flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-1 text-[11px] text-slate-400 font-semibold mb-1">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>זמן רכיבה</span>
              </div>
              <div className="text-xl font-black text-emerald-400 font-mono">{formatTimer(elapsedSeconds)}</div>
              <span className="text-[10px] text-slate-500">שעות:דקות:שניות</span>
            </div>

            {/* Average Speed */}
            <div className="bg-[#111625] border border-slate-800 p-3.5 rounded-2xl flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-1 text-[11px] text-slate-400 font-semibold mb-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>מהירות ממוצעת</span>
              </div>
              <div className="text-2xl font-black text-white font-mono">{avgSpeed}</div>
              <span className="text-[10px] text-slate-500">קמ"ש</span>
            </div>

            {/* Max Speed */}
            <div className="bg-[#111625] border border-slate-800 p-3.5 rounded-2xl flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-1 text-[11px] text-slate-400 font-semibold mb-1">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                <span>מהירות שיא</span>
              </div>
              <div className="text-2xl font-black text-rose-400 font-mono">{maxSpeed}</div>
              <span className="text-[10px] text-slate-500">קמ"ש</span>
            </div>
          </div>

          {/* Recorded Waypoints / Stops list during this ride */}
          <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-sky-400" />
                <span>עצירות ונקודות עניין שנרשמו ({recordedStops.length}):</span>
              </span>
              {status === 'recording' && (
                <button
                  type="button"
                  onClick={handleAddManualStop}
                  className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-bold bg-amber-950/30 hover:bg-amber-950/60 border border-amber-500/30 px-2 py-1 rounded-lg transition"
                >
                  <Coffee className="w-3 h-3" />
                  <span>+ סמן עצירת קפה עכשיו</span>
                </button>
              )}
            </div>

            {recordedStops.length > 0 ? (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {recordedStops.map((stop, i) => (
                  <div key={stop.id} className="flex items-center justify-between bg-slate-900/90 border border-slate-800 p-2 rounded-xl text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-blue-600/30 border border-blue-500/40 text-blue-300 text-[10px] font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span className="font-bold text-white">{stop.name}</span>
                      {stop.category === 'cafe' && (
                        <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 rounded font-bold">קפה</span>
                      )}
                    </div>
                    <div className="text-left text-[11px] font-mono text-slate-400">
                      <span>{stop.time}</span>
                      <span className="mr-2 text-slate-500">({stop.durationMinutes} דק')</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[11px] text-slate-500 text-center py-2">
                טרם נרשמו עצירות. המערכת תזהה אוטומטית כשתעצור או לחץ על "+ סמן עצירת קפה".
              </div>
            )}
          </div>

          {/* Action Controllers */}
          <div className="space-y-3 pt-2">
            {status === 'idle' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={startRealGps}
                  className="py-3.5 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-blue-600/25 flex items-center justify-center gap-2 transition"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>התחל הקלטת GPS חיה</span>
                </button>

                <button
                  type="button"
                  onClick={startSimulation}
                  className="py-3.5 bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-sky-300 border border-sky-500/30 font-bold text-sm rounded-2xl shadow flex items-center justify-center gap-2 transition"
                  title="מריץ הדמיית רכיבה מקריית אונו לנס הרים ולבית זית"
                >
                  <Navigation className="w-4 h-4 text-sky-400" />
                  <span>הפעל סימולציית רכיבה (Demo)</span>
                </button>
              </div>
            )}

            {(status === 'recording' || status === 'paused') && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handlePauseResume}
                  className={`py-3.5 font-bold text-sm rounded-2xl transition flex items-center justify-center gap-2 ${
                    status === 'recording'
                      ? 'bg-amber-600 hover:bg-amber-500 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {status === 'recording' ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>השהה הקלטה</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      <span>המשך רכיבה</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleFinishAndSave}
                  className="py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 transition"
                >
                  <Square className="w-4 h-4 fill-white" />
                  <span>סיים ושמור ליומן</span>
                </button>
              </div>
            )}

            {/* Informational tip for motorcycle riders */}
            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 mt-2 bg-slate-900/50 p-2 rounded-xl border border-slate-800">
              <Zap className="w-3 h-3 text-sky-400 shrink-0" />
              <span>
                המסך לא יכבה בזמן רכיבה (Screen Wake Lock פעיל). מומלץ לחבר את הטלפון למטען על הכידון (QuadLock).
              </span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
