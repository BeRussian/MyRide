import React, { useState } from 'react';
import type { User, Trip, TripPhoto, Waypoint, TripWeather } from '../../types';
import { StorageService } from '../../services/storage';
import { parsePromptToRoute } from '../../services/routeParser';
import type { ParsedRouteResult } from '../../services/routeParser';
import { InteractiveMap } from '../Map/InteractiveMap';
import {
  X,
  Sparkles,
  Compass,
  Users,
  Image as ImageIcon,
  CheckCircle,
  Upload,
  Clock,
  Sun,
  CloudSun,
  Thermometer,
  CloudRain,
  Star,
  MapPin
} from 'lucide-react';

interface TripCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onTripCreated: (trip: Trip) => void;
}

const DEFAULT_TEST_PROMPT =
  'יום שישי 12/9 רכיבה , יצאנו ב6 בבוקר מקריית אונו, נסענו עד לבית שמש ומשם לנס הרים, עברו את כל נס הרים עד ירושליים, משם המשכנו לבית זית, לבית קפה מעולה שנקרא דרן הגפן , לאחר מכן חזרנו דרך נס הרים ומשם הביתה לקריית אונו.';

export const TripCreatorModal: React.FC<TripCreatorModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onTripCreated,
}) => {
  const [promptText, setPromptText] = useState(DEFAULT_TEST_PROMPT);
  const [creationStep, setCreationStep] = useState<'input' | 'customize'>('input');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // User-controlled ride states
  const [tripTitle, setTripTitle] = useState('');
  const [tripDate, setTripDate] = useState('יום שישי, 12 בספטמבר 2026');
  const [tripStartTime, setTripStartTime] = useState('06:00');
  const [selectedWeather, setSelectedWeather] = useState<TripWeather>({
    condition: 'sunny',
    temp: 24,
    label: 'בהיר ואידיאלי לרכיבה (24°C)'
  });

  // Waypoints state (fully editable by user)
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [totalKm, setTotalKm] = useState(95);
  const [durationHours, setDurationHours] = useState(3.5);

  // Overall User Rating & Review
  const [overallTripStars, setOverallTripStars] = useState<number>(5);
  const [overallTripComment, setOverallTripComment] = useState<string>('רכיבה פנטסטית, כבישים פתוחים וקפה מעולה.');

  // Stop-specific ratings set during creation
  const [stopRatings, setStopRatings] = useState<Record<string, { stars: number; comment: string }>>({});

  // Buddies & Photos
  const [selectedInvitedUsers, setSelectedInvitedUsers] = useState<string[]>(['user-b']);
  const [uploadedPhotos, setUploadedPhotos] = useState<{ id: string; url: string; name: string }[]>([]);

  const otherUsers = StorageService.getUsers().filter((u) => u.id !== currentUser.id && !u.isAdmin);

  if (!isOpen) return null;

  const handleToggleInvite = (userId: string) => {
    setSelectedInvitedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
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

  const handleRunAIAnalysis = () => {
    if (!promptText.trim()) return;
    setIsAnalyzing(true);

    setTimeout(() => {
      const result: ParsedRouteResult = parsePromptToRoute(promptText);

      setTripTitle(result.title);
      setTripDate(result.date);
      setTripStartTime(result.startTime);
      setWaypoints(result.waypoints);
      setRouteCoordinates(result.routeCoordinates);
      setTotalKm(result.totalKm);
      setDurationHours(result.durationHours);

      // Pre-fill cafe rating prompt if a cafe was detected
      const cafeStop = result.waypoints.find((w) => w.category === 'cafe');
      if (cafeStop) {
        setStopRatings({
          [cafeStop.id]: {
            stars: 5,
            comment: 'קפה מעולה, אווירה פסטורלית בבוסתן וגפנים!'
          }
        });
      }

      setIsAnalyzing(false);
      setCreationStep('customize');
    }, 550);
  };

  const handleWaypointTimeChange = (id: string, newTime: string) => {
    setWaypoints((prev) => prev.map((w) => (w.id === id ? { ...w, time: newTime } : w)));
  };

  const handleWaypointDurationChange = (id: string, duration: number) => {
    setWaypoints((prev) =>
      prev.map((w) => (w.id === id ? { ...w, stopDurationMinutes: duration } : w))
    );
  };

  const handleStopRatingChange = (id: string, stars: number, comment: string) => {
    setStopRatings((prev) => ({
      ...prev,
      [id]: { stars, comment }
    }));
  };

  const handleFinalSubmit = () => {
    const newTripPhotos: TripPhoto[] = uploadedPhotos.map((p) => ({
      id: p.id,
      url: p.url,
      caption: 'צילום מהרכיבה',
      uploadedBy: currentUser.id,
      uploadedByName: currentUser.name,
      uploadedAt: tripDate
    }));

    if (newTripPhotos.length === 0) {
      newTripPhotos.push({
        id: `photo-def-${Date.now()}`,
        url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80',
        caption: 'מנוחה בבית זית',
        uploadedBy: currentUser.id,
        uploadedByName: currentUser.name,
        uploadedAt: tripDate
      });
    }

    const finalWaypoints: Waypoint[] = waypoints.map((wp) => {
      const rating = stopRatings[wp.id];
      if (rating) {
        return {
          ...wp,
          reviews: [
            {
              id: `srev-${Date.now()}-${wp.id}`,
              userId: currentUser.id,
              userName: currentUser.name,
              userAvatar: currentUser.avatar,
              stars: rating.stars,
              comment: rating.comment,
              createdAt: tripDate
            }
          ]
        };
      }
      return wp;
    });

    const newTrip: Trip = {
      id: `trip-${Date.now()}`,
      title: tripTitle || 'רכיבת שישי מותאמת אישית',
      originalPrompt: promptText,
      date: tripDate,
      startTime: tripStartTime,
      weather: selectedWeather,
      creatorId: currentUser.id,
      creatorName: currentUser.name,
      creatorAvatar: currentUser.avatar,
      participants: [currentUser.id],
      pendingInvites: selectedInvitedUsers,
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
      photos: newTripPhotos,
      status: 'published'
    };

    StorageService.saveTrip(newTrip);
    onTripCreated(newTrip);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {creationStep === 'input' ? 'יצירת נסיעה חדשה עם ה-AI' : 'לוח בקרת מסלול והתאמה אישית'}
              </h2>
              <p className="text-xs text-slate-400">
                {creationStep === 'input'
                  ? 'ה-AI מחלץ את הצירים והעצירות על פי הפרומפט שלך'
                  : 'קבע שעות הגעה, זמן שהייה בכל נקודה, מזג אוויר ודירוג אישי'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {creationStep === 'input' ? (
            /* STEP 1: PROMPT INPUT */
            <div className="space-y-5">
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <span>הזן את סיפור הרכיבה שלך (פרומפט חופשי):</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setPromptText(DEFAULT_TEST_PROMPT)}
                    className="text-[11px] text-blue-400 hover:text-blue-300 underline underline-offset-2 transition font-medium"
                  >
                    טען את פרומפט הנסיעה לבדיקה מהירה
                  </button>
                </div>
                <textarea
                  rows={5}
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="הקלד כאן... לדוגמה: יום שישי 12/9 רכיבה, יצאנו ב6 בבוקר מקריית אונו..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition leading-relaxed shadow-inner"
                />
              </div>

              {/* Informative Guidance Box */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 space-y-1.5">
                <div className="font-bold text-blue-400 flex items-center gap-1.5">
                  <Compass className="w-4 h-4" />
                  <span>איך זה עובד?</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  ה-AI יחלץ את כל העצירות (כולל <strong>בית שמש, כביש נס הרים, בית זית וקפה דרך הגפן</strong>), וישרטט עבורך את קו המסלול על גבי מפת OpenStreetMap חופשית ללא סימני מים. לאחר מכן תוכל לדייק את שעות ההגעה והדירוג האישי שלך.
                </p>
              </div>

              {/* Analyze Button */}
              <button
                type="button"
                onClick={handleRunAIAnalysis}
                disabled={isAnalyzing || !promptText.trim()}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-sm rounded-2xl shadow-xl shadow-blue-500/20 transition flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>מפענח את כביש נס הרים, בית שמש, בית זית והצירים...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>בנה מסלול ועבור להתאמה ודירוג</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* STEP 2: USER CUSTOMIZATION */
            <div className="space-y-6">
              
              {/* 1. Interactive Map Display */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-blue-400" />
                    <span>מפת המסלול שפוענחה (ללא סימני מים):</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {totalKm} ק"מ • {waypoints.length} נקודות ציון
                  </span>
                </div>

                <InteractiveMap
                  waypoints={waypoints}
                  routeCoordinates={routeCoordinates}
                  height={340}
                  className="rounded-2xl"
                />
              </div>

              {/* 2. Ride Info & Weather Selector */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">כותרת הנסיעה:</label>
                    <input
                      type="text"
                      value={tripTitle}
                      onChange={(e) => setTripTitle(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">תאריך הרכיבה:</label>
                    <input
                      type="text"
                      value={tripDate}
                      onChange={(e) => setTripDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">שעת יציאה:</label>
                    <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      <input
                        type="text"
                        value={tripStartTime}
                        onChange={(e) => setTripStartTime(e.target.value)}
                        placeholder="06:00"
                        className="bg-transparent text-xs text-white focus:outline-none w-full font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Weather Chooser */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-2">
                    מזג אוויר באותו יום:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { cond: 'sunny' as const, label: 'שמש ונעים (24°C)', icon: Sun, temp: 24 },
                      { cond: 'partly-cloudy' as const, label: 'מעונן חלקית (21°C)', icon: CloudSun, temp: 21 },
                      { cond: 'hot' as const, label: 'שרב/חם (30°C)', icon: Thermometer, temp: 30 },
                      { cond: 'rainy' as const, label: 'גשם קל (18°C)', icon: CloudRain, temp: 18 },
                    ].map((w) => {
                      const Icon = w.icon;
                      const isSelected = selectedWeather.condition === w.cond;
                      return (
                        <button
                          key={w.cond}
                          type="button"
                          onClick={() => setSelectedWeather({ condition: w.cond, label: w.label, temp: w.temp })}
                          className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-semibold transition ${
                            isSelected
                              ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <Icon className="w-4 h-4 text-blue-400" />
                          <span>{w.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 3. Stops & Times Editor */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-blue-400" />
                      <span>תחנות ועצירות שזוהו – קבע שעות ודרג את המקומות:</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      סמן כמה זמן שהיתם בכל מקום ודרג את בית הקפה או העצירה
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {waypoints.map((wp, idx) => {
                    const currentRating = stopRatings[wp.id] || { stars: 5, comment: '' };
                    const isCafeOrHighlight = wp.category === 'cafe' || wp.name.includes('דרך הגפן');

                    return (
                      <div
                        key={wp.id}
                        className={`p-3.5 rounded-2xl border transition ${
                          isCafeOrHighlight
                            ? 'bg-slate-950 border-amber-500/40'
                            : 'bg-slate-950 border-slate-800'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          
                          {/* Stop Info */}
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-xs font-bold text-sky-400">
                              {idx + 1}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-white">{wp.name}</span>
                                {isCafeOrHighlight && (
                                  <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold px-2 py-0.5 rounded-full">
                                    ☕ בית קפה
                                  </span>
                                )}
                                {wp.category === 'twisties' && (
                                  <span className="text-[10px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-bold px-2 py-0.5 rounded-full">
                                    🏍️ פיתולים
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400">{wp.description}</div>
                            </div>
                          </div>

                          {/* Time & Duration Inputs */}
                          <div className="flex items-center gap-2 text-xs">
                            <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 px-2.5 py-1.5 rounded-xl">
                              <span className="text-slate-400 text-[10px]">הגעה:</span>
                              <input
                                type="text"
                                value={wp.time || ''}
                                onChange={(e) => handleWaypointTimeChange(wp.id, e.target.value)}
                                className="bg-transparent w-12 text-white font-mono text-center focus:outline-none"
                              />
                            </div>

                            <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 px-2.5 py-1.5 rounded-xl">
                              <span className="text-slate-400 text-[10px]">עצירה:</span>
                              <select
                                value={wp.stopDurationMinutes || 0}
                                onChange={(e) => handleWaypointDurationChange(wp.id, Number(e.target.value))}
                                className="bg-transparent text-white focus:outline-none cursor-pointer text-xs"
                              >
                                <option value={0} className="bg-slate-900">מעבר רציף</option>
                                <option value={15} className="bg-slate-900">15 דק'</option>
                                <option value={30} className="bg-slate-900">30 דק'</option>
                                <option value={45} className="bg-slate-900">45 דק'</option>
                                <option value={60} className="bg-slate-900">שעה</option>
                              </select>
                            </div>
                          </div>

                        </div>

                        {/* Stop Rating Form for Cafes / Key Stops */}
                        {isCafeOrHighlight && (
                          <div className="mt-3 pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-slate-900/60 p-2.5 rounded-xl">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-amber-400">
                                דרג את {wp.name.split(' ')[0]}:
                              </span>
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <button
                                    key={s}
                                    type="button"
                                    onClick={() => handleStopRatingChange(wp.id, s, currentRating.comment)}
                                    className="focus:outline-none"
                                  >
                                    <Star
                                      className={`w-4 h-4 ${
                                        s <= currentRating.stars
                                          ? 'text-amber-400 fill-amber-400'
                                          : 'text-slate-700'
                                      }`}
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>
                            <input
                              type="text"
                              value={currentRating.comment}
                              onChange={(e) => handleStopRatingChange(wp.id, currentRating.stars, e.target.value)}
                              placeholder="חוות דעת על בית הקפה (למשל: קפה מעולה, אווירה פסטורלית בבוסתן...)"
                              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 4. Overall Trip Rating & Summary */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span>איך אתה מדרג את הנסיעה הכללית?</span>
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setOverallTripStars(star)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= overallTripStars ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
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
                  placeholder="כתוב סיכום קצר על הנסיעה שיישמר בהיסטוריה..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* 5. Buddies Selection */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold text-white">חברים שרכבו איתך (יקבלו הזמנה לאישור):</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {otherUsers.map((user) => {
                    const isSelected = selectedInvitedUsers.includes(user.id);
                    return (
                      <div
                        key={user.id}
                        onClick={() => handleToggleInvite(user.id)}
                        className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition ${
                          isSelected
                            ? 'bg-blue-600/20 border-blue-500/60 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
                          <div>
                            <div className="text-xs font-bold text-slate-200">{user.name}</div>
                            <div className="text-[10px] text-slate-400">{user.bike}</div>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-4 h-4 accent-blue-600 rounded"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 6. Photos */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-white">תמונות מהטיול:</span>
                  </div>
                  <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-200 rounded-xl cursor-pointer transition border border-slate-700">
                    <Upload className="w-3.5 h-3.5 text-blue-400" />
                    <span>בחר תמונות מהמכשיר</span>
                    <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>

                {uploadedPhotos.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
                    {uploadedPhotos.map((photo) => (
                      <div key={photo.id} className="relative aspect-video rounded-xl overflow-hidden border border-slate-700 group">
                        <img src={photo.url} alt="upload preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setUploadedPhotos((prev) => prev.filter((p) => p.id !== photo.id))}
                          className="absolute top-1 left-1 bg-black/70 hover:bg-rose-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCreationStep('input')}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition"
                >
                  חזרה לעריכת פרומפט
                </button>
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-xl shadow-blue-500/20 transition flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>שמור נסיעה והזמן את החברים</span>
                </button>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
};
