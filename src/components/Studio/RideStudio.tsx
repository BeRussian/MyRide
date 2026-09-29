import React, { useState, useRef, useEffect } from 'react';
import type { User, Trip, TripPhoto, Waypoint, TripWeather, StopCategory } from '../../types';
import { StorageService } from '../../services/storage';
import { parsePromptToRoute, recalculateRouteCoordinates, ISRAELI_HOTSPOTS } from '../../services/routeParser';
import type { KnownLocation } from '../../services/routeParser';
import {
  Sparkles,
  Sun,
  CloudSun,
  Thermometer,
  CloudRain,
  Star,
  Check,
  X,
  Upload,
  Mic,
  Square,
  Lock,
  Trash2,
  ArrowUp,
  ArrowDown,
  Plus,
  MapPin,
  Clock,
  Search
} from 'lucide-react';

interface RideStudioProps {
  currentUser: User;
  onTripCreated: (newTrip: Trip) => void;
  onCancel: () => void;
  onRouteChange: (waypoints: Waypoint[], coordinates: [number, number][]) => void;
}

const DEFAULT_FRIDAY_PROMPT =
  'יום שישי. 26 לספטמבר יצאנו בשעה 6 בבוקר. מצומת של מחלף מסובים. לכיוון בית של יובל בקריית אונו , לקחת את האקדח שלו. משם נסענו לאריאל. המשכנו לצומת תפוח, לקחנו ימינה לכביש 60, המשכנו דרך מיכמש עד לירושלים מירושלים המשכנו למבשרת, שם ביצענו עצירה בקריית ענבים בקפה שנקרא הרים. לאחר שעה בקפה המשכנו לכיוון נס הרים, משם דרך כביש אחד עד לשטיפת האופנועים בחולון. בחולון סיימנו את הנסיעה';

const CATEGORY_OPTIONS: { cat: StopCategory; label: string; icon: string; badgeColor: string }[] = [
  { cat: 'start', label: 'יציאה', icon: '🏁', badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { cat: 'cafe', label: 'קפה', icon: '☕', badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { cat: 'twisties', label: 'פיתולים', icon: '🏍️', badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
  { cat: 'wash', label: 'שטיפה', icon: '🚿', badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  { cat: 'viewpoint', label: 'תצפית', icon: '🌄', badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { cat: 'gas', label: 'דלק', icon: '⛽', badgeColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  { cat: 'end', label: 'סיום', icon: '🏁', badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
  { cat: 'poi', label: 'עצירה', icon: '📍', badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30' }
];

export const RideStudio: React.FC<RideStudioProps> = ({
  currentUser,
  onTripCreated,
  onCancel,
  onRouteChange,
}) => {
  const [promptText, setPromptText] = useState(DEFAULT_FRIDAY_PROMPT);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasParsed, setHasParsed] = useState(false);

  // Voice Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recognitionRef = useRef<any>(null);

  // Form states
  const [tripTitle, setTripTitle] = useState('');
  const [tripDate, setTripDate] = useState('יום שישי, 26 בספטמבר 2026');
  const [tripStartTime, setTripStartTime] = useState('06:00');
  const [selectedWeather, setSelectedWeather] = useState<TripWeather>({
    condition: 'sunny',
    temp: 24,
    label: 'שמש נעימה וראות מעולה (24°C)'
  });

  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [totalKm, setTotalKm] = useState(144);
  const [durationHours, setDurationHours] = useState(3.6);

  const [overallTripStars, setOverallTripStars] = useState<number>(5);
  const [overallTripComment, setOverallTripComment] = useState<string>('רכיבה פנטסטית של יום שישי, כבישים פתוחים וקפה מעולה.');
  const [stopRatings, setStopRatings] = useState<Record<string, { stars: number; comment: string }>>({});

  // Buddies
  const friends = StorageService.getFriends(currentUser.id);
  const otherUsers = StorageService.getUsers().filter((u) => u.id !== currentUser.id && !u.isAdmin);
  const [selectedBuddies, setSelectedBuddies] = useState<string[]>(friends.map((u) => u.id));
  const [uploadedPhotos, setUploadedPhotos] = useState<{ id: string; url: string; name: string }[]>([]);

  // Add Stop Modal state
  const [isAddStopModalOpen, setIsAddStopModalOpen] = useState(false);
  const [insertStopAtIndex, setInsertStopAtIndex] = useState<number | null>(null);
  const [addStopSearch, setAddStopSearch] = useState('');
  const [addStopName, setAddStopName] = useState('');
  const [addStopCategory, setAddStopCategory] = useState<StopCategory>('poi');
  const [addStopDesc, setAddStopDesc] = useState('');
  const [addStopDuration, setAddStopDuration] = useState(15);
  const [addStopLat, setAddStopLat] = useState(32.0158);
  const [addStopLng, setAddStopLng] = useState(34.7874);

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleToggleBuddy = (userId: string) => {
    const isFriend = currentUser.friends?.includes(userId);
    if (!isFriend) return;

    setSelectedBuddies((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const startVoiceRecording = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      runSimulatedVoicePrompt();
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'he-IL';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsRecording(true);
        setRecordingSeconds(0);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + ' ';
        }
        if (transcript.trim()) {
          setPromptText(transcript.trim());
        }
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch {
      runSimulatedVoicePrompt();
    }
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsRecording(false);
  };

  const runSimulatedVoicePrompt = () => {
    setIsRecording(true);
    setRecordingSeconds(0);

    const fullPrompt = DEFAULT_FRIDAY_PROMPT;
    let charIdx = 0;
    setPromptText('');

    const typingInterval = setInterval(() => {
      if (charIdx < fullPrompt.length) {
        setPromptText((prev) => prev + fullPrompt.charAt(charIdx));
        charIdx++;
      } else {
        clearInterval(typingInterval);
        setIsRecording(false);
      }
    }, 20);
  };

  const handleRunAI = () => {
    if (!promptText.trim()) return;

    setIsAnalyzing(true);

    setTimeout(() => {
      const result = parsePromptToRoute(promptText);

      setTripTitle(result.title);
      setTripDate(result.date);
      setTripStartTime(result.startTime);
      setWaypoints(result.waypoints);
      setRouteCoordinates(result.routeCoordinates);
      setTotalKm(result.totalKm);
      setDurationHours(result.durationHours);

      onRouteChange(result.waypoints, result.routeCoordinates);

      setIsAnalyzing(false);
      setHasParsed(true);
    }, 400);
  };

  // Waypoint Editing Handlers
  const handleWaypointTimeChange = (id: string, newTime: string) => {
    setWaypoints((prev) => prev.map((w) => (w.id === id ? { ...w, time: newTime } : w)));
  };

  const handleWaypointDurationChange = (id: string, duration: number) => {
    setWaypoints((prev) => {
      const updated = prev.map((w) => (w.id === id ? { ...w, stopDurationMinutes: duration } : w));
      const { durationHours: newHours } = recalculateRouteCoordinates(updated);
      setDurationHours(newHours);
      return updated;
    });
  };

  const handleWaypointDescriptionChange = (id: string, desc: string) => {
    setWaypoints((prev) =>
      prev.map((w) => (w.id === id ? { ...w, description: desc } : w))
    );
  };

  const handleWaypointNameChange = (id: string, newName: string) => {
    setWaypoints((prev) =>
      prev.map((w) => (w.id === id ? { ...w, name: newName } : w))
    );
  };

  const handleWaypointCategoryChange = (id: string, newCategory: StopCategory) => {
    setWaypoints((prev) =>
      prev.map((w) => (w.id === id ? { ...w, category: newCategory } : w))
    );
  };

  const handleDeleteWaypoint = (id: string) => {
    setWaypoints((prev) => {
      const updated = prev.filter((w) => w.id !== id);
      if (updated.length > 0 && updated[0].category !== 'start') {
        updated[0] = { ...updated[0], category: 'start' };
      }
      const { routeCoordinates: newCoords, totalKm: newKm, durationHours: newHours } = recalculateRouteCoordinates(updated);
      setRouteCoordinates(newCoords);
      setTotalKm(newKm);
      setDurationHours(newHours);
      onRouteChange(updated, newCoords);
      return updated;
    });
  };

  const handleMoveWaypoint = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= waypoints.length) return;

    setWaypoints((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;

      if (updated.length > 0 && updated[0].category !== 'start') {
        updated[0] = { ...updated[0], category: 'start' };
      }

      const { routeCoordinates: newCoords, totalKm: newKm, durationHours: newHours } = recalculateRouteCoordinates(updated);
      setRouteCoordinates(newCoords);
      setTotalKm(newKm);
      setDurationHours(newHours);
      onRouteChange(updated, newCoords);
      return updated;
    });
  };

  const openAddStopModal = (insertIndex?: number) => {
    setInsertStopAtIndex(typeof insertIndex === 'number' ? insertIndex : null);
    setAddStopSearch('');
    setAddStopName('');
    setAddStopCategory('poi');
    setAddStopDesc('');
    setAddStopDuration(15);

    if (typeof insertIndex === 'number' && waypoints[insertIndex]) {
      setAddStopLat(waypoints[insertIndex].lat);
      setAddStopLng(waypoints[insertIndex].lng);
    } else if (waypoints.length > 0) {
      setAddStopLat(waypoints[waypoints.length - 1].lat);
      setAddStopLng(waypoints[waypoints.length - 1].lng);
    } else {
      setAddStopLat(32.0158);
      setAddStopLng(34.7874);
    }

    setIsAddStopModalOpen(true);
  };

  const handleSelectHotspot = (loc: KnownLocation) => {
    setAddStopName(loc.name);
    setAddStopCategory(loc.category);
    setAddStopDesc(loc.highlight || '');
    setAddStopDuration(loc.defaultStopDuration || (loc.category === 'cafe' ? 45 : 15));
    setAddStopLat(loc.lat);
    setAddStopLng(loc.lng);
  };

  const handleConfirmAddStop = () => {
    if (!addStopName.trim()) return;

    const newWp: Waypoint = {
      id: `wp-${Date.now()}`,
      name: addStopName.trim(),
      category: addStopCategory,
      lat: addStopLat,
      lng: addStopLng,
      time: '12:00',
      stopDurationMinutes: addStopDuration,
      description: addStopDesc.trim() || 'עצירת רכיבה מותאמת אישית',
      googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addStopName.split('(')[0].trim())}`,
      reviews: [],
      photos: []
    };

    setWaypoints((prev) => {
      const updated = [...prev];
      if (typeof insertStopAtIndex === 'number' && insertStopAtIndex >= 0 && insertStopAtIndex < updated.length) {
        updated.splice(insertStopAtIndex + 1, 0, newWp);
      } else {
        updated.push(newWp);
      }

      const { routeCoordinates: newCoords, totalKm: newKm, durationHours: newHours } = recalculateRouteCoordinates(updated);
      setRouteCoordinates(newCoords);
      setTotalKm(newKm);
      setDurationHours(newHours);
      onRouteChange(updated, newCoords);
      return updated;
    });

    setIsAddStopModalOpen(false);
  };

  const handleStopRatingChange = (id: string, stars: number, comment: string) => {
    setStopRatings((prev) => ({
      ...prev,
      [id]: { stars, comment }
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) {
          setUploadedPhotos((prev) => [
            ...prev,
            { id: `photo-${Date.now()}-${Math.random()}`, url: result, name: file.name }
          ]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePublish = () => {
    const finalPhotos: TripPhoto[] = uploadedPhotos.map((p) => ({
      id: p.id,
      url: p.url,
      caption: `צילום מהרכיבה של ${currentUser.name}`,
      uploadedBy: currentUser.id,
      uploadedByName: currentUser.name,
      uploadedAt: tripDate
    }));

    if (finalPhotos.length === 0) {
      finalPhotos.push({
        id: `photo-${Date.now()}`,
        url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80',
        caption: 'מנוחה ברכיבת שישי',
        uploadedBy: currentUser.id,
        uploadedByName: currentUser.name,
        uploadedAt: tripDate
      });
    }

    const finalWaypoints = waypoints.map((wp) => {
      const r = stopRatings[wp.id];
      if (r) {
        return {
          ...wp,
          reviews: [
            {
              id: `srev-${Date.now()}-${wp.id}`,
              userId: currentUser.id,
              userName: currentUser.name,
              userAvatar: currentUser.avatar,
              stars: r.stars,
              comment: r.comment,
              createdAt: tripDate
            }
          ]
        };
      }
      return wp;
    });

    const newTrip: Trip = {
      id: `trip-${Date.now()}`,
      title: tripTitle || 'רכיבת שישי',
      originalPrompt: promptText,
      date: tripDate,
      startTime: tripStartTime,
      weather: selectedWeather,
      creatorId: currentUser.id,
      creatorName: currentUser.name,
      creatorAvatar: currentUser.avatar,
      participants: [currentUser.id],
      pendingInvites: selectedBuddies,
      totalKm,
      durationHours,
      waypoints: finalWaypoints,
      routeCoordinates,
      reviews: overallTripComment.trim()
        ? [
            {
              id: `trev-${Date.now()}`,
              userId: currentUser.id,
              userName: currentUser.name,
              userAvatar: currentUser.avatar,
              stars: overallTripStars,
              comment: overallTripComment,
              createdAt: tripDate
            }
          ]
        : [],
      photos: finalPhotos,
      status: 'published'
    };

    onTripCreated(newTrip);
  };

  const filteredHotspots = ISRAELI_HOTSPOTS.filter((loc) =>
    addStopSearch.trim()
      ? loc.name.toLowerCase().includes(addStopSearch.toLowerCase()) ||
        loc.aliases.some((a) => a.toLowerCase().includes(addStopSearch.toLowerCase()))
      : true
  ).slice(0, 8);

  return (
    <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-5 text-right relative">
      
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <span>סטודיו רכיבה חכם (AI Studio)</span>
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            הזן תיאור חופשי או הקלט דיבור — ה-AI יבנה מסלול מפותל מלא, ותוכל לערוך ולהוסיף כל עצירה!
          </p>
        </div>
        <button
          onClick={onCancel}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          title="סגור סטודיו"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        
        {/* Prompt Input Box */}
        <div className="space-y-2">
          
          <div className="bg-[#111625] border border-slate-800/90 rounded-xl p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              
              <div className="flex items-center gap-2">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    isRecording ? 'bg-rose-500 animate-ping' : 'bg-blue-500'
                  }`}
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-200">
                    {isRecording ? 'מקליט דיבור בזמן אמת...' : 'הקלטה קולית / תיאור טקסטואלי'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {isRecording
                      ? `זמן הקלטה: 00:${recordingSeconds < 10 ? '0' : ''}${recordingSeconds}`
                      : 'דבר חופשי בעברית או הדבק מלל נסיעה'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5">
                {isRecording ? (
                  <button
                    type="button"
                    onClick={stopVoiceRecording}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30 transition animate-pulse"
                  >
                    <Square className="w-3 h-3 fill-white" />
                    <span>סיום ושרטוט</span>
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={startVoiceRecording}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition shadow-md shadow-blue-600/20"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>התחל להקליט</span>
                    </button>
                    <button
                      type="button"
                      onClick={runSimulatedVoicePrompt}
                      title="הדגמת מלל רכיבה לדוגמה"
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs rounded-xl border border-slate-700 transition"
                    >
                      <span>🎙️ טען פרומפט שישי</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Soundwave animation */}
            {isRecording && (
              <div className="flex items-center justify-center gap-1 py-1.5 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-[10px] text-rose-400 font-mono font-bold ml-2">קולט דיבור:</span>
                {[40, 75, 90, 60, 100, 85, 45, 95, 70, 50, 80, 60].map((h, i) => (
                  <span
                    key={i}
                    className="w-1 bg-rose-500 rounded-full animate-bounce"
                    style={{
                      height: `${Math.max(8, (h / 100) * 20)}px`,
                      animationDelay: `${(i % 5) * 100}ms`
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <textarea
            rows={4}
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            className="w-full bg-[#111625] border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition leading-relaxed resize-none font-sans"
            placeholder="מלל הנסיעה או התמלול הקולי יופיעו כאן..."
          />

          <button
            type="button"
            onClick={handleRunAI}
            disabled={isAnalyzing || !promptText.trim()}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5"
          >
            {isAnalyzing ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>מפענח את הנסיעה, העצירות והמסלול...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>פענח נסיעה והצג על המפה</span>
              </>
            )}
          </button>
        </div>

        {/* Customization Station (Appears after analysis) */}
        {hasParsed && (
          <div className="space-y-4 pt-2 border-t border-slate-800">
            
            {/* Header Data */}
            <div className="bg-[#111625] border border-slate-800 p-3.5 rounded-xl space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 font-semibold block mb-1">כותרת הנסיעה:</label>
                <input
                  type="text"
                  value={tripTitle}
                  onChange={(e) => setTripTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold block mb-1">תאריך:</label>
                  <input
                    type="text"
                    value={tripDate}
                    onChange={(e) => setTripDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold block mb-1">שעת יציאה:</label>
                  <input
                    type="text"
                    value={tripStartTime}
                    onChange={(e) => setTripStartTime(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono text-center"
                  />
                </div>
              </div>

              {/* Weather chooser */}
              <div>
                <label className="text-[10px] text-slate-400 font-semibold block mb-1.5">מזג אוויר:</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { cond: 'sunny' as const, label: 'שמש ונעים (24°C)', icon: Sun, temp: 24 },
                    { cond: 'partly-cloudy' as const, label: 'מעונן חלקית (21°C)', icon: CloudSun, temp: 21 },
                    { cond: 'hot' as const, label: 'חם (30°C)', icon: Thermometer, temp: 30 },
                    { cond: 'rainy' as const, label: 'גשם קל (18°C)', icon: CloudRain, temp: 18 },
                  ].map((w) => {
                    const Icon = w.icon;
                    const isSel = selectedWeather.condition === w.cond;
                    return (
                      <button
                        key={w.cond}
                        type="button"
                        onClick={() => setSelectedWeather({ condition: w.cond, label: w.label, temp: w.temp })}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition ${
                          isSel
                            ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 text-blue-400" />
                        <span>{w.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Waypoints & Stops Live Interactive Editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200">
                  תחנות ועצירות שזוהו ({waypoints.length}):
                </label>
                <button
                  type="button"
                  onClick={() => openAddStopModal()}
                  className="flex items-center gap-1 px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-[11px] font-bold rounded-lg transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>הוסף עצירה</span>
                </button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {waypoints.map((wp, idx) => {
                  const rating = stopRatings[wp.id] || { stars: 5, comment: '' };
                  const isCafe = wp.category === 'cafe' || wp.name.includes('קפה');

                  return (
                    <React.Fragment key={wp.id}>
                      <div
                        className={`p-3 rounded-xl border transition ${
                          isCafe ? 'bg-amber-950/20 border-amber-500/40' : 'bg-[#111625] border-slate-800'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          
                          {/* Number & Category Selector */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="w-5 h-5 rounded-md bg-slate-900 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-sky-400">
                              {idx + 1}
                            </span>
                            <select
                              value={wp.category}
                              onChange={(e) => handleWaypointCategoryChange(wp.id, e.target.value as StopCategory)}
                              className="bg-slate-900 border border-slate-700 text-white rounded px-1.5 py-0.5 text-[10px] focus:outline-none"
                              title="שנה קטגוריית עצירה"
                            >
                              {CATEGORY_OPTIONS.map((opt) => (
                                <option key={opt.cat} value={opt.cat}>
                                  {opt.icon} {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Editable Name & Description */}
                          <div className="flex-1 space-y-1">
                            <input
                              type="text"
                              value={wp.name}
                              onChange={(e) => handleWaypointNameChange(wp.id, e.target.value)}
                              className="w-full bg-slate-900/80 border border-slate-700/60 rounded px-2 py-0.5 text-xs font-bold text-white focus:outline-none focus:border-blue-500"
                              placeholder="שם העצירה..."
                            />
                            <input
                              type="text"
                              value={wp.description || ''}
                              onChange={(e) => handleWaypointDescriptionChange(wp.id, e.target.value)}
                              placeholder="ערוך תיאור עצירה..."
                              className="w-full bg-slate-900 border border-slate-700/60 rounded px-2 py-0.5 text-[10px] text-slate-300 focus:outline-none focus:border-blue-500 transition"
                            />
                          </div>

                          {/* Actions: Up, Down, Delete */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleMoveWaypoint(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1 text-slate-400 hover:text-white disabled:opacity-20 hover:bg-slate-800 rounded transition"
                              title="הזז תחנה למעלה"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveWaypoint(idx, 'down')}
                              disabled={idx === waypoints.length - 1}
                              className="p-1 text-slate-400 hover:text-white disabled:opacity-20 hover:bg-slate-800 rounded transition"
                              title="הזז תחנה למטה"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteWaypoint(wp.id)}
                              className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition"
                              title="מחק תחנה זו"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Times & Duration Row */}
                        <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-sky-400" />
                            <span>שעת הגעה:</span>
                            <input
                              type="text"
                              value={wp.time || ''}
                              onChange={(e) => handleWaypointTimeChange(wp.id, e.target.value)}
                              className="w-14 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-white font-mono text-center focus:outline-none"
                              placeholder="00:00"
                            />
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span>משך שהייה:</span>
                            <select
                              value={wp.stopDurationMinutes || 0}
                              onChange={(e) => handleWaypointDurationChange(wp.id, Number(e.target.value))}
                              className="bg-slate-900 border border-slate-700 rounded px-1 py-0.5 text-white focus:outline-none text-[10px]"
                            >
                              <option value={0}>מעבר רציף (0 דק')</option>
                              <option value={10}>10 דקות</option>
                              <option value={15}>15 דקות</option>
                              <option value={30}>30 דקות</option>
                              <option value={45}>45 דקות</option>
                              <option value={60}>שעה (60 דק')</option>
                            </select>
                          </div>
                        </div>

                        {/* Direct Cafe Rating */}
                        {isCafe && (
                          <div className="mt-2 pt-2 border-t border-slate-800 flex items-center gap-2">
                            <span className="text-[10px] font-bold text-amber-400 whitespace-nowrap">
                              דרג קפה:
                            </span>
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <button
                                  key={s}
                                  type="button"
                                  onClick={() => handleStopRatingChange(wp.id, s, rating.comment)}
                                  className="focus:outline-none"
                                >
                                  <Star
                                    className={`w-3.5 h-3.5 ${
                                      s <= rating.stars ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                            <input
                              type="text"
                              value={rating.comment}
                              onChange={(e) => handleStopRatingChange(wp.id, rating.stars, e.target.value)}
                              placeholder="חוות דעת על בית הקפה..."
                              className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-[10px] text-white focus:outline-none"
                            />
                          </div>
                        )}
                      </div>

                      {/* Subtle insert button between stops */}
                      {idx < waypoints.length - 1 && (
                        <div className="flex items-center justify-center my-0.5">
                          <button
                            type="button"
                            onClick={() => openAddStopModal(idx)}
                            className="text-[10px] text-slate-500 hover:text-blue-400 flex items-center gap-1 px-2.5 py-0.5 rounded-full hover:bg-blue-600/10 transition border border-dashed border-slate-800 hover:border-blue-500/40"
                            title="הוסף עצירה בין שתי התחנות הללו"
                          >
                            <Plus className="w-2.5 h-2.5" />
                            <span>הוסף עצירה כאן</span>
                          </button>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Add stop button at bottom */}
              <button
                type="button"
                onClick={() => openAddStopModal()}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-blue-500 text-blue-400 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>+ הוסף עצירה נוספת לסוף המסלול</span>
              </button>
            </div>

            {/* Overall Ride Review */}
            <div className="bg-[#111625] border border-slate-800 p-3 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">הדירוג והסיכום שלך לנסיעה:</span>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setOverallTripStars(s)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          s <= overallTripStars ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="text"
                value={overallTripComment}
                onChange={(e) => setOverallTripComment(e.target.value)}
                placeholder="למשל: רכיבה מעולה, אספלט מצוין בנס הרים, עצירת קפה נהדרת..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
              />
            </div>

            {/* Buddies / Participants Selection */}
            <div className="bg-[#111625] border border-slate-800 p-3 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">צרף רוכבים לנסיעה זו:</span>
                <span className="text-[10px] text-slate-400">
                  (רק חברים מאושרים ניתנים לצירוף)
                </span>
              </div>

              <div className="space-y-1.5">
                {otherUsers.map((user) => {
                  const isFriend = currentUser.friends?.includes(user.id);
                  const isChecked = selectedBuddies.includes(user.id);

                  return (
                    <div
                      key={user.id}
                      className={`flex items-center justify-between p-2 rounded-lg border transition ${
                        !isFriend
                          ? 'opacity-40 border-slate-900 bg-slate-950/40 cursor-not-allowed'
                          : isChecked
                          ? 'border-blue-500/40 bg-blue-950/10'
                          : 'border-slate-800/80 bg-slate-900/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full object-cover" />
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1">
                            <span>{user.name}</span>
                            {!isFriend && <Lock className="w-2.5 h-2.5 text-amber-500" />}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {user.bikeModel || user.bike}
                          </div>
                        </div>
                      </div>

                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={!isFriend}
                        onChange={() => handleToggleBuddy(user.id)}
                        className="w-4 h-4 accent-blue-600 rounded disabled:opacity-30"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Photos */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">תמונות מהרכיבה:</span>
              <label className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-xs font-medium text-slate-300 rounded-lg border border-slate-700 cursor-pointer flex items-center gap-1">
                <Upload className="w-3 h-3 text-sky-400" />
                <span>הוסף תמונה</span>
                <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            {uploadedPhotos.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {uploadedPhotos.map((photo) => (
                  <div key={photo.id} className="relative aspect-video rounded-lg overflow-hidden border border-slate-800">
                    <img src={photo.url} alt="upload" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            {/* Submit */}
            <button
              type="button"
              onClick={handlePublish}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>שמור נסיעה וסנכרן לענן</span>
            </button>

          </div>
        )}

      </div>

      {/* Add Stop Modal */}
      {isAddStopModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-700 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl text-right">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span>
                  {typeof insertStopAtIndex === 'number'
                    ? `הוספת עצירה בין תחנה ${insertStopAtIndex + 1} ל-${insertStopAtIndex + 2}`
                    : 'הוספת עצירה חדשה למסלול'}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddStopModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Suggestions from Hotspots */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-400 font-semibold block">
                בחירה מהירה ממוקדי רכיבה מובילים:
              </label>
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1">
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={addStopSearch}
                  onChange={(e) => setAddStopSearch(e.target.value)}
                  placeholder="חפש מקום (חולון, מסובים, קריית ענבים, נס הרים...)"
                  className="w-full bg-transparent text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {filteredHotspots.map((hotspot) => (
                  <button
                    key={hotspot.name}
                    type="button"
                    onClick={() => handleSelectHotspot(hotspot)}
                    className="px-2 py-1 bg-slate-900 hover:bg-blue-600/20 text-slate-300 hover:text-blue-300 text-[10px] rounded-lg border border-slate-800 hover:border-blue-500/40 transition"
                  >
                    {hotspot.name.split('(')[0].trim()}
                  </button>
                ))}
              </div>
            </div>

            {/* Stop Form Inputs */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div>
                <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                  שם העצירה:
                </label>
                <input
                  type="text"
                  value={addStopName}
                  onChange={(e) => setAddStopName(e.target.value)}
                  placeholder="למשל: שטיפת אופנועים בחולון"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                    סוג העצירה:
                  </label>
                  <select
                    value={addStopCategory}
                    onChange={(e) => setAddStopCategory(e.target.value as StopCategory)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c.cat} value={c.cat}>
                        {c.icon} {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                    משך שהייה (דקות):
                  </label>
                  <select
                    value={addStopDuration}
                    onChange={(e) => setAddStopDuration(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
                  >
                    <option value={0}>מעבר רציף (0 דק')</option>
                    <option value={10}>10 דקות</option>
                    <option value={15}>15 דקות</option>
                    <option value={30}>30 דקות</option>
                    <option value={45}>45 דקות</option>
                    <option value={60}>שעה (60 דק')</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                  תיאור העצירה:
                </label>
                <input
                  type="text"
                  value={addStopDesc}
                  onChange={(e) => setAddStopDesc(e.target.value)}
                  placeholder="למשל: שטיפה יסודית והסרת שרשרת וג'אנטים"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddStopModalOpen(false)}
                className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl transition"
              >
                בטל
              </button>
              <button
                type="button"
                onClick={handleConfirmAddStop}
                disabled={!addStopName.trim()}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition shadow-md flex items-center justify-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>הוסף למסלול</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
