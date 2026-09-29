import React, { useState } from 'react';
import type { Trip, User, StopReview, TripPhoto } from '../../types';
import { StorageService } from '../../services/storage';
import { InteractiveMap } from '../Map/InteractiveMap';
import {
  X,
  Star,
  MapPin,
  Calendar,
  Users,
  Image as ImageIcon,
  Send,
  Upload,
  Edit3,
  Trash2,
  Check
} from 'lucide-react';

interface TripDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  currentUser: User;
  onTripUpdated: (updatedTrip: Trip) => void;
  onTripDeleted?: () => void;
}

export const TripDetailModal: React.FC<TripDetailModalProps> = ({
  isOpen,
  onClose,
  trip,
  currentUser,
  onTripUpdated,
  onTripDeleted,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'stops' | 'photos'>('overview');
  const [isEditingMode, setIsEditingMode] = useState(false);

  // Edit fields
  const [editTitle, setEditTitle] = useState(trip.title);
  const [editDate, setEditDate] = useState(trip.date);
  const [editStartTime, setEditStartTime] = useState(trip.startTime || '06:00');

  // Trip general rating form state
  const [tripStars, setTripStars] = useState(5);
  const [tripComment, setTripComment] = useState('');
  const [isSubmittingTripRating, setIsSubmittingTripRating] = useState(false);

  // Stop rating state
  const [selectedStopForRating, setSelectedStopForRating] = useState<string | null>(null);
  const [stopStars, setStopStars] = useState(5);
  const [stopComment, setStopComment] = useState('');

  if (!isOpen) return null;

  const allUsers = StorageService.getUsers();
  const participantUsers = allUsers.filter((u) => trip.participants.includes(u.id));

  const handleSaveEdit = () => {
    const updated: Trip = {
      ...trip,
      title: editTitle,
      date: editDate,
      startTime: editStartTime,
    };
    StorageService.updateTrip(updated);
    onTripUpdated(updated);
    setIsEditingMode(false);
  };

  const handleDeleteFromMyTrips = () => {
    if (confirm(`האם להסיר את הנסיעה "${trip.title}" מרשימת הנסיעות שלך? (הנסיעה תישמר אצל שאר החברים).`)) {
      StorageService.removeTripForUser(trip.id, currentUser.id);
      if (onTripDeleted) onTripDeleted();
      onClose();
    }
  };

  const handleAddTripReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripComment.trim()) return;
    setIsSubmittingTripRating(true);

    const review = {
      id: `rev-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      stars: tripStars,
      comment: tripComment,
      createdAt: new Date().toLocaleDateString('he-IL')
    };

    StorageService.addReviewToTrip(trip.id, review);
    const updated = StorageService.getTripById(trip.id);
    if (updated) onTripUpdated(updated);

    setTripComment('');
    setIsSubmittingTripRating(false);
  };

  const handleAddStopReview = (stopId: string) => {
    if (!stopComment.trim()) return;

    const review: StopReview = {
      id: `srev-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      stars: stopStars,
      comment: stopComment,
      createdAt: new Date().toLocaleDateString('he-IL')
    };

    StorageService.addReviewToStop(trip.id, stopId, review);
    const updated = StorageService.getTripById(trip.id);
    if (updated) onTripUpdated(updated);

    setSelectedStopForRating(null);
    setStopComment('');
  };

  const handleUploadPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (result) {
        const newPhoto: TripPhoto = {
          id: `photo-${Date.now()}`,
          url: result,
          caption: `תמונה שהועלתה על ידי ${currentUser.name}`,
          uploadedBy: currentUser.id,
          uploadedByName: currentUser.name,
          uploadedAt: new Date().toLocaleDateString('he-IL')
        };
        StorageService.addPhotoToTrip(trip.id, newPhoto);
        const updated = StorageService.getTripById(trip.id);
        if (updated) onTripUpdated(updated);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <span className="text-xl">🏍️</span>
            </div>
            <div>
              {isEditingMode ? (
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="bg-slate-950 border border-blue-500 rounded-xl px-2.5 py-1 text-xs font-bold text-white focus:outline-none"
                    placeholder="כותרת"
                  />
                  <input
                    type="text"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="bg-slate-950 border border-blue-500 rounded-xl px-2 py-1 text-xs text-white focus:outline-none w-36"
                    placeholder="תאריך"
                  />
                  <input
                    type="text"
                    value={editStartTime}
                    onChange={(e) => setEditStartTime(e.target.value)}
                    className="bg-slate-950 border border-blue-500 rounded-xl px-2 py-1 text-xs text-white focus:outline-none w-20 font-mono"
                    placeholder="שעת יציאה"
                  />
                </div>
              ) : (
                <h2 className="text-base sm:text-lg font-bold text-white">{trip.title}</h2>
              )}
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-sky-400" />
                  <span>{trip.date}</span>
                </span>
                {trip.startTime && (
                  <>
                    <span>•</span>
                    <span className="text-slate-300">יציאה: {trip.startTime}</span>
                  </>
                )}
                {trip.weather && (
                  <>
                    <span>•</span>
                    <span className="text-sky-300 bg-slate-800 px-2 py-0.5 rounded-full font-medium">
                      ☀️ {trip.weather.label}
                    </span>
                  </>
                )}
                <span>•</span>
                <span>נוצר על ידי {trip.creatorName}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Edit / Delete Buttons */}
            {isEditingMode ? (
              <button
                onClick={handleSaveEdit}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow"
              >
                <Check className="w-3.5 h-3.5" />
                <span>שמור שינויים</span>
              </button>
            ) : (
              <button
                onClick={() => setIsEditingMode(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition border border-slate-700"
                title="ערוך פרטי נסיעה"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">עריכה</span>
              </button>
            )}

            <button
              onClick={handleDeleteFromMyTrips}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
              title="הסר נסיעה זו מהנסיעות שלי"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center px-6 bg-slate-950 border-b border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 border-b-2 transition ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            מפת מסלול וסקירה
          </button>
          <button
            onClick={() => setActiveTab('stops')}
            className={`flex items-center gap-1.5 py-3 px-4 border-b-2 transition ${
              activeTab === 'stops'
                ? 'border-blue-500 text-blue-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>תחנות ועצירות ({trip.waypoints.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`flex items-center gap-1.5 py-3 px-4 border-b-2 transition ${
              activeTab === 'photos'
                ? 'border-blue-500 text-blue-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>גלריית תמונות ({trip.photos?.length || 0})</span>
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Quick Stat Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl text-center">
                  <div className="text-[11px] text-slate-400">מרחק מצטבר</div>
                  <div className="text-lg font-bold text-sky-400 mt-0.5">{trip.totalKm} ק"מ</div>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl text-center">
                  <div className="text-[11px] text-slate-400">זמן רכיבה</div>
                  <div className="text-lg font-bold text-slate-100 mt-0.5">{trip.durationHours} שעות</div>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl text-center">
                  <div className="text-[11px] text-slate-400">רוכבים שאישרו</div>
                  <div className="text-lg font-bold text-emerald-400 mt-0.5">{trip.participants.length}</div>
                </div>
              </div>

              {/* Map */}
              <div>
                <InteractiveMap
                  waypoints={trip.waypoints}
                  routeCoordinates={trip.routeCoordinates}
                  height={360}
                  className="rounded-2xl"
                />
              </div>

              {/* Riders Row */}
              <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
                <div className="text-xs font-bold text-slate-300 mb-2.5 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span>רוכבים שהשתתפו ברכיבה:</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {participantUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full"
                    >
                      <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full object-cover border border-slate-700" />
                      <span className="text-xs font-semibold text-slate-200">{user.name}</span>
                      <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                        {user.bike.split(' ')[0]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Original User Prompt Box */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
                <div className="text-xs font-bold text-slate-400 mb-1">תיאור הרכיבה המקורי שהוזן:</div>
                <p className="text-xs text-slate-300 italic leading-relaxed">
                  "{trip.originalPrompt}"
                </p>
              </div>

              {/* Trip Reviews Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>דירוגי הנסיעה הכללית ({trip.reviews?.length || 0})</span>
                </h3>

                {/* Add Review Form */}
                <form onSubmit={handleAddTripReview} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300">
                      איך הייתה הרכיבה שלך, {currentUser.name.split(' ')[0]}?
                    </span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setTripStars(star)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`w-4 h-4 transition ${
                              star <= tripStars ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tripComment}
                      onChange={(e) => setTripComment(e.target.value)}
                      placeholder="הוסף חוות דעת אישית (למשל: נסיעה מעולה, קצב זורם, מזג אוויר תענוג...)"
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={!tripComment.trim() || isSubmittingTripRating}
                      className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>פרסם דירוג</span>
                    </button>
                  </div>
                </form>

                {/* Reviews List */}
                <div className="space-y-2">
                  {trip.reviews && trip.reviews.length > 0 ? (
                    trip.reviews.map((rev) => (
                      <div key={rev.id} className="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl flex items-start gap-3">
                        <img src={rev.userAvatar} alt={rev.userName} className="w-8 h-8 rounded-full object-cover border border-slate-700" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-slate-200">{rev.userName}</span>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: rev.stars }).map((_, i) => (
                                <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-slate-300">{rev.comment}</p>
                          <div className="text-[10px] text-slate-500 mt-1">{rev.createdAt}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-500 text-center py-3">טרם הוזנו חוות דעת נוספות.</div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: STOPS */}
          {activeTab === 'stops' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300">
                  כל העצירות לאורך המסלול (באפשרותך לדרג כל בית קפה או נקודת עניין):
                </span>
              </div>

              <div className="space-y-2.5">
                {trip.waypoints.map((wp, idx) => {
                  const isRatingThis = selectedStopForRating === wp.id;
                  const reviews = wp.reviews || [];

                  return (
                    <div
                      key={wp.id}
                      className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-xs font-bold text-sky-400">
                            {idx + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white">{wp.name}</span>
                              {wp.category === 'cafe' && (
                                <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                                  ☕ עצירת קפה
                                </span>
                              )}
                              {wp.category === 'wash' && (
                                <span className="text-[10px] bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full font-bold">
                                  🚿 שטיפה
                                </span>
                              )}
                              {wp.category === 'twisties' && (
                                <span className="text-[10px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full font-bold">
                                  🏍️ פיתולים
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              {wp.time && (
                                <span className="text-[11px] font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                                  הגעה: {wp.time}
                                </span>
                              )}
                              {wp.stopDurationMinutes ? (
                                <span className="text-[11px] text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                                  שהייה: {wp.stopDurationMinutes} דק'
                                </span>
                              ) : null}
                              <span className="text-xs text-slate-400">{wp.description}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedStopForRating(isRatingThis ? null : wp.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-200 rounded-xl transition border border-slate-700"
                        >
                          <Star className="w-3.5 h-3.5 text-amber-400" />
                          <span>{isRatingThis ? 'בטל' : 'דרג עצירה זו'}</span>
                        </button>
                      </div>

                      {/* Expandable Rating Box for this stop */}
                      {isRatingThis && (
                        <div className="bg-slate-900 border border-blue-500/40 p-3.5 rounded-2xl space-y-2 mt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-300">
                              דרג את {wp.name}:
                            </span>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <button key={s} type="button" onClick={() => setStopStars(s)}>
                                  <Star
                                    className={`w-4 h-4 ${
                                      s <= stopStars ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={stopComment}
                              onChange={(e) => setStopComment(e.target.value)}
                              placeholder={`חוות דעת על ${wp.name} (קפה, שירות, חניה...)`}
                              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                            />
                            <button
                              onClick={() => handleAddStopReview(wp.id)}
                              disabled={!stopComment.trim()}
                              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl transition shadow"
                            >
                              שמור דירוג
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Reviews for this stop */}
                      {reviews.length > 0 && (
                        <div className="space-y-1.5 pt-1 border-t border-slate-800">
                          {reviews.map((r) => (
                            <div key={r.id} className="flex items-center justify-between text-xs bg-slate-900 p-2.5 rounded-xl border border-slate-800/80">
                              <div className="flex items-center gap-2">
                                <img src={r.userAvatar} alt={r.userName} className="w-5 h-5 rounded-full object-cover" />
                                <span className="font-semibold text-slate-200">{r.userName}:</span>
                                <span className="text-slate-400">{r.comment}</span>
                              </div>
                              <div className="flex items-center gap-0.5 text-amber-400">
                                {Array.from({ length: r.stars }).map((_, i) => (
                                  <Star key={i} className="w-3 h-3 fill-amber-400" />
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: PHOTOS */}
          {activeTab === 'photos' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">תמונות מהרכיבה</h3>
                  <p className="text-xs text-slate-400">כל משתתף ברכיבה יכול להוסיף תמונות משלו</p>
                </div>
                <label className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs shadow-md cursor-pointer transition">
                  <Upload className="w-3.5 h-3.5" />
                  <span>הוסף תמונה חדשה</span>
                  <input type="file" accept="image/*" onChange={handleUploadPhoto} className="hidden" />
                </label>
              </div>

              {trip.photos && trip.photos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {trip.photos.map((photo) => (
                    <div key={photo.id} className="relative group rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 aspect-video shadow-md">
                      <img src={photo.url} alt={photo.caption || 'רכיבה'} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2.5">
                        <div className="text-xs font-semibold text-slate-100">{photo.caption}</div>
                        <div className="text-[10px] text-slate-400">הועלה על ידי {photo.uploadedByName}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 text-xs">
                  עדיין לא הועלו תמונות לנסיעה זו.
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
