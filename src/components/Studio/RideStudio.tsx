import React, { useState, useRef, useEffect } from 'react';
import type { User, Trip, TripPhoto, Waypoint, TripWeather } from '../../types';
import { StorageService } from '../../services/storage';
import { parsePromptToRoute } from '../../services/routeParser';
import type { ParsedRouteResult } from '../../services/routeParser';
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
} from 'lucide-react';

interface RideStudioProps {
  currentUser: User;
  onTripCreated: (newTrip: Trip) => void;
  onCancel: () => void;
  onRouteChange: (waypoints: Waypoint[], coordinates: [number, number][]) => void;
}

const DEFAULT_FRIDAY_PROMPT =
  'יום שישי 12/9 רכיבה , יצאנו ב6 בבוקר מקריית אונו, נסענו עד לבית שמש ומשם לנס הרים, עברו את כל נס הרים עד ירושליים, משם המשכנו לבית זית, לבית קפה מעולה שנקרא דרן הגפן , לאחר מכן חזרנו דרך נס הרים ומשם הביתה לקריית אונו.';

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
  const [tripDate, setTripDate] = useState('יום שישי, 12 בספטמבר 2026');
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

  // Buddies (Filter by friends)
  const friends = StorageService.getFriends(currentUser.id);
  const otherUsers = StorageService.getUsers().filter((u) => u.id !== currentUser.id && !u.isAdmin);
  const [selectedBuddies, setSelectedBuddies] = useState<string[]>(friends.map((u) => u.id));
  const [uploadedPhotos, setUploadedPhotos] = useState<{ id: string; url: string; name: string }[]>([]);

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
    // Only approved friends can be added
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
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    setIsRecording(false);
    setTimeout(() => {
      handleRunAI();
    }, 300);
  };

  const runSimulatedVoicePrompt = () => {
    setIsRecording(true);
    setRecordingSeconds(0);
    setPromptText('');
    const fullText = DEFAULT_FRIDAY_PROMPT;
    let idx = 0;
    const interval = setInterval(() => {
      idx += 12;
      if (idx >= fullText.length) {
        setPromptText(fullText);
        clearInterval(interval);
        setIsRecording(false);
        setTimeout(() => {
          handleRunAI();
        }, 300);
      } else {
        setPromptText(fullText.slice(0, idx));
      }
    }, 60);
  };

  const handleRunAI = () => {
    if (!promptText.trim()) return;
    setIsAnalyzing(true);

    setTimeout(() => {
      const res: ParsedRouteResult = parsePromptToRoute(promptText);

      setTripTitle(res.title);
      setTripDate(res.date);
      setTripStartTime(res.startTime);
      setWaypoints(res.waypoints);
      setRouteCoordinates(res.routeCoordinates);
      setTotalKm(res.totalKm);
      setDurationHours(res.durationHours);

      const cafeStop = res.waypoints.find((w) => w.category === 'cafe' || w.name.includes('דרך הגפן'));
      if (cafeStop) {
        setStopRatings({
          [cafeStop.id]: {
            stars: 5,
            comment: 'קפה משובח ומאפים טריים בבוסתן, מומלץ מאוד לרוכבים.'
          }
        });
      }

      // Sync with persistent map in real time!
      onRouteChange(res.waypoints, res.routeCoordinates);

      setIsAnalyzing(false);
      setHasParsed(true);
    }, 500);
  };

  const handleWaypointTimeChange = (id: string, newTime: string) => {
    setWaypoints((prev) => prev.map((w) => (w.id === id ? { ...w, time: newTime } : w)));
  };

  const handleWaypointDurationChange = (id: string, duration: number) => {
    setWaypoints((prev) =>
      prev.map((w) => (w.id === id ? { ...w, stopDurationMinutes: duration } : w))
    );
  };

  const handleWaypointDescriptionChange = (id: string, desc: string) => {
    setWaypoints((prev) =>
      prev.map((w) => (w.id === id ? { ...w, description: desc } : w))
    );
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
        caption: 'מנוחה בבית זית',
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

    StorageService.saveTrip(newTrip);
    onTripCreated(newTrip);
  };

  return (
    <div className="h-full flex flex-col bg-[#0b0f19] border-r border-slate-800/80 overflow-y-auto">
      
      {/* Studio Header */}
      <div className="sticky top-0 z-20 bg-[#0b0f19]/95 backdrop-blur-md px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            סטודיו תכנון נסיעה ב-AI
          </h2>
        </div>
        <button
          onClick={onCancel}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition text-xs flex items-center gap-1 font-medium"
        >
          <X className="w-4 h-4" />
          <span>ביטול</span>
        </button>
      </div>

      <div className="p-5 space-y-5 flex-1">
        
        {/* Prompt & Voice Recording Station */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>סיפור הנסיעה (הקלטה קולית או כתיבה):</span>
            </label>
            <button
              type="button"
              onClick={() => setPromptText(DEFAULT_FRIDAY_PROMPT)}
              className="text-[11px] text-sky-400 hover:text-sky-300 font-medium transition"
            >
              טען פרומפט שישי
            </button>
          </div>

          {/* Voice Recording Banner / Studio Controller */}
          <div className="bg-[#0e1424] border border-blue-500/30 rounded-2xl p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center transition ${
                    isRecording
                      ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-600/40'
                      : 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block leading-none">
                    {isRecording ? 'מקליט סיפור רכיבה...' : 'הקלטה קולית של הנסיעה'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {isRecording
                      ? `זמן הקלטה: 00:${recordingSeconds < 10 ? '0' : ''}${recordingSeconds}`
                      : 'דבר חופשי בעברית או נגן הדגמה קולית'}
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
                      title="השמעת הקלטת הדגמה של רכיבת שישי מוקלטת"
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs rounded-xl border border-slate-700 transition"
                    >
                      <span>🎙️ הדגמת קול</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Soundwave animation while recording */}
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
            rows={3}
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

            {/* Waypoints & Stops List */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-200 block">
                תחנות ועצירות שזוהו ({waypoints.length}):
              </label>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {waypoints.map((wp, idx) => {
                  const rating = stopRatings[wp.id] || { stars: 5, comment: '' };
                  const isCafe = wp.category === 'cafe' || wp.name.includes('דרך הגפן');

                  return (
                    <div
                      key={wp.id}
                      className={`p-3 rounded-xl border transition ${
                        isCafe ? 'bg-amber-950/20 border-amber-500/40' : 'bg-[#111625] border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-slate-900 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-sky-400">
                            {idx + 1}
                          </span>
                          <div className="flex-1">
                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                              <span>{wp.name}</span>
                              {isCafe && (
                                <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold px-1.5 py-0.2 rounded-full">
                                  ☕ קפה
                                </span>
                              )}
                            </div>
                            <div className="mt-1">
                              <input
                                type="text"
                                value={wp.description || ''}
                                onChange={(e) => handleWaypointDescriptionChange(wp.id, e.target.value)}
                                placeholder="ערוך תיאור עצירה..."
                                className="w-full bg-slate-900 border border-slate-700/80 rounded px-2 py-0.5 text-[10px] text-slate-200 focus:outline-none focus:border-blue-500 transition"
                                title="לחץ לעריכת תיאור העצירה"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Times */}
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <input
                            type="text"
                            value={wp.time || ''}
                            onChange={(e) => handleWaypointTimeChange(wp.id, e.target.value)}
                            className="w-12 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-white font-mono text-center focus:outline-none"
                            placeholder="הגעה"
                          />
                          <select
                            value={wp.stopDurationMinutes || 0}
                            onChange={(e) => handleWaypointDurationChange(wp.id, Number(e.target.value))}
                            className="bg-slate-900 border border-slate-700 rounded px-1 py-0.5 text-white focus:outline-none text-[10px]"
                          >
                            <option value={0}>רציף</option>
                            <option value={15}>15 דק'</option>
                            <option value={30}>30 דק'</option>
                            <option value={45}>45 דק'</option>
                            <option value={60}>שעה</option>
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
                            placeholder="חוות דעת על המקום..."
                            className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-[10px] text-white focus:outline-none"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
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
                placeholder="כתוב סיכום קצר על הנסיעה..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
              />
            </div>

            {/* Buddies Invites - only approved friends! */}
            <div className="bg-[#111625] border border-slate-800 p-3 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">
                  הזמנת שותפים לרכיבה:
                </span>
                <span className="text-[10px] text-slate-400">
                  רק חברים מאושרים ניתנים להזמנה
                </span>
              </div>
              <div className="space-y-1.5">
                {otherUsers.map((user) => {
                  const isFriend = currentUser.friends?.includes(user.id);
                  const isSel = selectedBuddies.includes(user.id);
                  return (
                    <div
                      key={user.id}
                      onClick={() => {
                        if (isFriend) handleToggleBuddy(user.id);
                      }}
                      className={`flex items-center justify-between p-2 rounded-lg border transition ${
                        !isFriend
                          ? 'bg-slate-950/60 border-slate-800/60 opacity-60 cursor-not-allowed'
                          : isSel
                          ? 'bg-blue-600/20 border-blue-500/60 text-white cursor-pointer'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full object-cover" />
                        <div>
                          <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                            <span>{user.name}</span>
                            {isFriend ? (
                              <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1 py-0.2 rounded font-medium">
                                חבר מאושר
                              </span>
                            ) : (
                              <span className="text-[9px] bg-slate-800 text-slate-400 px-1 py-0.2 rounded flex items-center gap-0.5">
                                <Lock className="w-2.5 h-2.5" />
                                <span>דרוש אישור חברות</span>
                              </span>
                            )}
                          </div>
                          <div dir="ltr" className="text-[10px] text-slate-400 font-mono text-right">{user.bikeModel || user.bike}</div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={isSel && isFriend}
                        disabled={!isFriend}
                        onChange={() => {}}
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
              <span>שמור נסיעה והזמן שותפים</span>
            </button>

          </div>
        )}

      </div>
    </div>
  );
};
