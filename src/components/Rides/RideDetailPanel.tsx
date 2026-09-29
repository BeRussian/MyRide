import React, { useState } from 'react';
import type { Trip, User, StopReview, TripPhoto } from '../../types';
import { StorageService } from '../../services/storage';
import {
  Calendar,
  Star,
  Edit3,
  Check,
  Send,
  Upload,
  X,
  ArrowRight,
  Trash2,
  MapPin,
  Globe,
  ExternalLink,
  UserPlus
} from 'lucide-react';
import { ConfirmDeleteModal } from '../Common/ConfirmDeleteModal';

interface RideDetailPanelProps {
  trip: Trip;
  currentUser: User;
  onTripUpdated: (updatedTrip: Trip) => void;
  onClose?: () => void;
  onDeleteTrip?: (tripId: string) => void;
}

export const RideDetailPanel: React.FC<RideDetailPanelProps> = ({
  trip,
  currentUser,
  onTripUpdated,
  onClose,
  onDeleteTrip,
}) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'reviews' | 'photos'>('timeline');
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Edit fields
  const [editTitle, setEditTitle] = useState(trip.title);
  const [editDate, setEditDate] = useState(trip.date);
  const [editStartTime, setEditStartTime] = useState(trip.startTime || '06:00');

  // Waypoint Description Editing
  const [editingStopId, setEditingStopId] = useState<string | null>(null);
  const [editingStopDescription, setEditingStopDescription] = useState<string>('');

  const isCreator = currentUser.id === trip.creatorId || currentUser.isAdmin;

  // Rating forms
  const [tripStars, setTripStars] = useState(5);
  const [tripComment, setTripComment] = useState('');
  const [selectedStopForRating, setSelectedStopForRating] = useState<string | null>(null);
  const [stopStars, setStopStars] = useState(5);
  const [stopComment, setStopComment] = useState('');

  const allUsers = StorageService.getUsers();
  const participantUsers = allUsers.filter((u) => trip.participants.includes(u.id));
  const isCurrentUserParticipant = trip.participants.includes(currentUser.id);
  const [isAddingRider, setIsAddingRider] = useState(false);

  const availableUsersToAdd = allUsers.filter(
    (u) => !trip.participants.includes(u.id) && !u.isAdmin
  );

  const handleAddParticipant = (userId: string) => {
    const updated = StorageService.addParticipantToTrip(trip.id, userId);
    if (updated) {
      onTripUpdated(updated);
    }
    setIsAddingRider(false);
  };

  const handleRemoveParticipant = (userId: string) => {
    const updated = StorageService.removeParticipantFromTrip(trip.id, userId);
    if (updated) {
      onTripUpdated(updated);
    }
  };

  const handleJoinTrip = () => {
    const updated = StorageService.addParticipantToTrip(trip.id, currentUser.id);
    if (updated) {
      onTripUpdated(updated);
    }
  };

  const handleStartEditStop = (stopId: string, currentDesc?: string) => {
    setEditingStopId(stopId);
    setEditingStopDescription(currentDesc || '');
  };

  const handleSaveStopDescription = (stopId: string) => {
    const updated = StorageService.updateWaypointDescription(trip.id, stopId, editingStopDescription);
    if (updated) {
      onTripUpdated(updated);
    }
    setEditingStopId(null);
  };

  const handleSaveEdit = () => {
    const updated: Trip = {
      ...trip,
      title: editTitle,
      date: editDate,
      startTime: editStartTime,
    };
    StorageService.updateTrip(updated);
    onTripUpdated(updated);
    setIsEditing(false);
  };

  const handleAddTripReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripComment.trim()) return;

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
          caption: `צילום מאת ${currentUser.name}`,
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
    <div className="h-full flex flex-col bg-[#0b0f19] border-r border-slate-800/80 overflow-y-auto">
      
      {/* Back to Rides List Navigation Bar */}
      {onClose && (
        <div className="sticky top-0 z-30 bg-[#0a0e1a]/95 backdrop-blur-md px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/15 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 rounded-xl text-xs font-bold transition shadow-sm group"
            title="חזרה לרשימת כל הנסיעות"
          >
            <ArrowRight className="w-4 h-4 text-blue-400 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
            <span>חזרה לכל הנסיעות</span>
          </button>
          <span className="text-[11px] text-slate-400 font-medium">פרטי נסיעה ומסלול</span>
        </div>
      )}

      {/* Top Header */}
      <div className="bg-[#0b0f19]/95 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="bg-slate-900 border border-blue-500 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none flex-1 font-bold"
                  placeholder="שם הנסיעה"
                />
                <button
                  onClick={handleSaveEdit}
                  className="p-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-0.5 text-[11px] text-slate-300 focus:outline-none w-28"
                  placeholder="תאריך"
                />
                <input
                  type="text"
                  value={editStartTime}
                  onChange={(e) => setEditStartTime(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-0.5 text-[11px] text-slate-300 focus:outline-none w-20"
                  placeholder="שעה"
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white leading-tight">{trip.title}</h2>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg text-xs flex items-center gap-1 transition hover:bg-slate-800"
                  title="ערוך פרטי נסיעה"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                {onDeleteTrip && (
                  <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="text-slate-400 hover:text-rose-400 p-1 rounded-lg text-xs flex items-center gap-1 transition hover:bg-rose-500/10"
                    title="מחק נסיעה מהיומן"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 mt-1">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-sky-400" />
              <span>{trip.date}</span>
            </span>
            {trip.startTime && <span>• יציאה: {trip.startTime}</span>}
            {trip.weather && (
              <span className="text-sky-300 bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800">
                ☀️ {trip.weather.temp}°C
              </span>
            )}
            <span>• {trip.totalKm} ק"מ</span>
          </div>
        </div>

        {onClose && (
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white mr-2">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center px-4 bg-slate-950 border-b border-slate-800 text-[11px] font-semibold">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`py-2.5 px-3 border-b-2 transition ${
            activeTab === 'timeline' ? 'border-blue-500 text-blue-400 font-bold' : 'border-transparent text-slate-400'
          }`}
        >
          ציר עצירות ({trip.waypoints.length})
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`py-2.5 px-3 border-b-2 transition ${
            activeTab === 'reviews' ? 'border-blue-500 text-blue-400 font-bold' : 'border-transparent text-slate-400'
          }`}
        >
          חוות דעת ({trip.reviews?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('photos')}
          className={`py-2.5 px-3 border-b-2 transition ${
            activeTab === 'photos' ? 'border-blue-500 text-blue-400 font-bold' : 'border-transparent text-slate-400'
          }`}
        >
          תמונות ({trip.photos?.length || 0})
        </button>
      </div>

      {/* Body Content */}
      <div className="p-4 space-y-4 flex-1">
        
        {/* TAB 1: TIMELINE */}
        {activeTab === 'timeline' && (
          <div className="space-y-4">
            
            {/* Rejoin Ride Banner (if user removed themselves or is not in trip) */}
            {!isCurrentUserParticipant && (
              <div className="bg-gradient-to-r from-blue-950/60 to-indigo-950/60 border border-blue-500/40 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-lg">
                <div>
                  <span className="text-xs font-bold text-white block">אינך רשום כרגע ברשימת הרוכבים בנסיעה זו</span>
                  <span className="text-[11px] text-slate-300">יצאת או הוסרת מהנסיעה? לחץ כאן כדי להצטרף חזרה לרכיבה</span>
                </div>
                <button
                  type="button"
                  onClick={handleJoinTrip}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition active:scale-95 shrink-0"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>הצטרף חזרה לנסיעה</span>
                </button>
              </div>
            )}

            {/* Riders Badge Row & Management */}
            <div className="bg-[#111625] border border-slate-800 p-3 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-semibold">
                  רוכבים שהשתתפו ({participantUsers.length}):
                </span>
                
                {availableUsersToAdd.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsAddingRider(!isAddingRider)}
                    className="flex items-center gap-1 text-[10px] text-sky-400 hover:text-sky-300 font-bold bg-sky-950/40 hover:bg-sky-950/70 border border-sky-500/30 px-2 py-0.5 rounded-lg transition"
                  >
                    <UserPlus className="w-3 h-3" />
                    <span>{isAddingRider ? 'סגור' : '+ הוסף רוכב'}</span>
                  </button>
                )}
              </div>

              {/* Add Rider Dropdown/Picker */}
              {isAddingRider && (
                <div className="bg-slate-900 border border-blue-500/40 rounded-xl p-2.5 space-y-1.5">
                  <span className="text-[10px] text-slate-300 font-semibold block">בחר רוכב להוספה לנסיעה:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {availableUsersToAdd.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => handleAddParticipant(u.id)}
                        className="flex items-center gap-1.5 bg-slate-950 hover:bg-blue-600/20 border border-slate-800 hover:border-blue-500/40 px-2.5 py-1 rounded-xl text-xs transition"
                      >
                        <img src={u.avatar} alt={u.name} className="w-4 h-4 rounded-full object-cover" />
                        <span className="text-white font-medium">{u.name}</span>
                        <span dir="ltr" className="text-[10px] text-sky-400 font-mono">
                          {u.bikeModel || u.bike.split(' ')[0]}
                        </span>
                        <UserPlus className="w-3 h-3 text-emerald-400 mr-1" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Current Riders Badges */}
              <div className="flex flex-wrap gap-2">
                {participantUsers.map((u) => {
                  const canRemove = currentUser.id === trip.creatorId || currentUser.isAdmin || u.id === currentUser.id;
                  return (
                    <div
                      key={u.id}
                      className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-full text-xs group"
                    >
                      <img src={u.avatar} alt={u.name} className="w-4 h-4 rounded-full object-cover" />
                      <span className="text-white font-medium">{u.name}</span>
                      <span
                        dir="ltr"
                        className="text-[10px] text-sky-400 font-mono px-1.5 py-0.5 rounded bg-sky-950/40 border border-sky-800/30"
                      >
                        {u.bikeModel || u.bike.split(' ')[0]}
                      </span>

                      {canRemove && participantUsers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveParticipant(u.id)}
                          className="text-slate-500 hover:text-rose-400 hover:bg-rose-500/20 p-0.5 rounded-full transition mr-0.5"
                          title={u.id === currentUser.id ? 'הסר אותי מהנסיעה' : `הסר את ${u.name} מהנסיעה`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Prompt Quote */}
            <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-[11px] text-slate-400 italic leading-relaxed">
              "{trip.originalPrompt}"
            </div>

            {/* Chronological Stop Timeline */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-200 block">עצירות ומקטעים:</span>

              <div className="relative border-r-2 border-slate-800 pr-4 mr-2 space-y-3">
                {trip.waypoints.map((wp, idx) => {
                  const isRatingThis = selectedStopForRating === wp.id;
                  const isEditingThisStop = editingStopId === wp.id;
                  const isCafe = wp.category === 'cafe' || wp.name.includes('דרך הגפן');
                  const googleMapsUrl = wp.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(wp.name.split('(')[0].trim())}`;

                  return (
                    <div key={wp.id} className="relative">
                      {/* Timeline dot */}
                      <div className="absolute -right-[23px] top-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-slate-950" />

                      <div className={`p-3.5 rounded-xl border text-xs transition ${
                        isCafe ? 'bg-amber-950/20 border-amber-500/40 shadow-sm' : 'bg-[#111625] border-slate-800'
                      }`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-1.5 font-bold text-white">
                              <span>{idx + 1}. {wp.name}</span>
                              {isCafe && (
                                <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded-full font-bold">
                                  ☕ קפה
                                </span>
                              )}
                              {wp.category === 'twisties' && (
                                <span className="text-[9px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-1.5 py-0.2 rounded-full font-bold">
                                  🏍️ פיתולים
                                </span>
                              )}
                              {wp.category === 'wash' && (
                                <span className="text-[9px] bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.2 rounded-full font-bold">
                                  🚿 שטיפה
                                </span>
                              )}
                            </div>

                            {/* Waypoint Description & Inline Editor */}
                            {isEditingThisStop ? (
                              <div className="mt-2 space-y-1.5 bg-slate-900/90 p-2.5 rounded-lg border border-blue-500/50">
                                <label className="text-[10px] text-blue-300 font-semibold block">
                                  עריכת תיאור העצירה:
                                </label>
                                <textarea
                                  rows={2}
                                  value={editingStopDescription}
                                  onChange={(e) => setEditingStopDescription(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-white focus:outline-none focus:border-blue-400 resize-none font-sans"
                                  placeholder="הזן תיאור מותאם אישית לעצירה זו..."
                                />
                                <div className="flex items-center gap-1.5 justify-end">
                                  <button
                                    type="button"
                                    onClick={() => setEditingStopId(null)}
                                    className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px]"
                                  >
                                    ביטול
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSaveStopDescription(wp.id)}
                                    className="px-2.5 py-0.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-[10px] font-bold flex items-center gap-1 shadow-sm"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>שמור תיאור</span>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-start justify-between gap-1 group/desc mt-1">
                                <div className="text-[11px] text-slate-300 leading-relaxed">
                                  {wp.description || <span className="text-slate-500 italic">ללא תיאור</span>}
                                </div>
                                {isCreator && (
                                  <button
                                    type="button"
                                    onClick={() => handleStartEditStop(wp.id, wp.description)}
                                    className="opacity-60 group-hover/desc:opacity-100 p-1 hover:bg-slate-800 text-slate-400 hover:text-blue-400 rounded transition shrink-0"
                                    title="ערוך תיאור של עצירה זו"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="text-left whitespace-nowrap shrink-0">
                            {wp.time && <div className="text-sky-400 font-mono text-[11px] font-bold">{wp.time}</div>}
                            {wp.stopDurationMinutes ? (
                              <div className="text-[10px] text-slate-400">שהייה: {wp.stopDurationMinutes} דק'</div>
                            ) : null}
                          </div>
                        </div>

                        {/* Integration Action Buttons: Google Maps & Cafe Website */}
                        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5">
                          <a
                            href={googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-900/90 hover:bg-blue-600/20 text-[10px] font-bold text-sky-400 hover:text-sky-300 border border-sky-500/30 rounded-lg transition shadow-sm"
                            title={`פתח את ${wp.name} ב-Google Maps`}
                          >
                            <MapPin className="w-3 h-3 text-sky-400" />
                            <span>פתח ב-Google Maps</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-60 mr-0.5" />
                          </a>

                          {wp.websiteUrl && (
                            <a
                              href={wp.websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-950/40 hover:bg-amber-900/60 text-[10px] font-bold text-amber-300 hover:text-amber-200 border border-amber-500/40 rounded-lg transition shadow-sm"
                              title={`מעבר לאתר של ${wp.name}`}
                            >
                              <Globe className="w-3 h-3 text-amber-400" />
                              <span>{isCafe ? 'לאתר בית הקפה' : 'לאתר הרשמי'}</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-60 mr-0.5" />
                            </a>
                          )}
                        </div>

                        {/* Direct Rating Toggle for Stop */}
                        <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                          <button
                            onClick={() => setSelectedStopForRating(isRatingThis ? null : wp.id)}
                            className="text-[10px] text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1"
                          >
                            <Star className="w-3 h-3" />
                            <span>{isRatingThis ? 'בטל דירוג' : 'דרג עצירה זו'}</span>
                          </button>

                          {wp.reviews && wp.reviews.length > 0 && (
                            <span className="text-[10px] text-amber-400 font-semibold">
                              ⭐ {wp.reviews.length} דירוגים
                            </span>
                          )}
                        </div>

                        {/* Inline Stop Rating Form */}
                        {isRatingThis && (
                          <div className="mt-2 pt-2 border-t border-slate-800 space-y-1.5">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <button key={s} type="button" onClick={() => setStopStars(s)}>
                                  <Star
                                    className={`w-3.5 h-3.5 ${
                                      s <= stopStars ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                            <div className="flex gap-1.5">
                              <input
                                type="text"
                                value={stopComment}
                                onChange={(e) => setStopComment(e.target.value)}
                                placeholder="חוות דעת על העצירה..."
                                className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[11px] text-white focus:outline-none"
                              />
                              <button
                                onClick={() => handleAddStopReview(wp.id)}
                                disabled={!stopComment.trim()}
                                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded text-[10px] font-bold"
                              >
                                שמור
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Display existing reviews for this stop */}
                        {wp.reviews && wp.reviews.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {wp.reviews.map((r) => (
                              <div key={r.id} className="text-[10px] bg-slate-900 p-1.5 rounded flex items-center justify-between">
                                <span className="text-slate-300"><strong>{r.userName}:</strong> {r.comment}</span>
                                <span className="text-amber-400">{'★'.repeat(r.stars)}</span>
                              </div>
                            ))}
                          </div>
                        )}

                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: REVIEWS */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            
            {/* Add Review */}
            <form onSubmit={handleAddTripReview} className="bg-[#111625] border border-slate-800 p-3 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">הוסף חוות דעת לרכיבה:</span>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} type="button" onClick={() => setTripStars(s)}>
                      <Star
                        className={`w-3.5 h-3.5 ${
                          s <= tripStars ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
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
                  placeholder="כתוב חוות דעת..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!tripComment.trim()}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-lg text-xs font-bold"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            {/* List */}
            <div className="space-y-2">
              {trip.reviews && trip.reviews.length > 0 ? (
                trip.reviews.map((r) => (
                  <div key={r.id} className="bg-[#111625] border border-slate-800 p-3 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{r.userName}</span>
                      <span className="text-amber-400">{'★'.repeat(r.stars)}</span>
                    </div>
                    <p className="text-slate-300 text-[11px]">{r.comment}</p>
                    <div className="text-[9px] text-slate-500">{r.createdAt}</div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500 text-center py-4">אין חוות דעת נוספות.</div>
              )}
            </div>

          </div>
        )}

        {/* TAB 3: PHOTOS */}
        {activeTab === 'photos' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">תמונות מהרכיבה:</span>
              <label className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 rounded-lg border border-slate-700 cursor-pointer flex items-center gap-1">
                <Upload className="w-3 h-3 text-sky-400" />
                <span>הוסף תמונה</span>
                <input type="file" accept="image/*" onChange={handleUploadPhoto} className="hidden" />
              </label>
            </div>

            {trip.photos && trip.photos.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {trip.photos.map((p) => (
                  <div key={p.id} className="relative aspect-video rounded-xl overflow-hidden border border-slate-800 group">
                    <img src={p.url} alt="ride" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition p-2 flex flex-col justify-end text-[10px] text-white">
                      <span>{p.caption}</span>
                      <span className="text-slate-400">מאת {p.uploadedByName}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-500 text-center py-6">טרם הועלו תמונות.</div>
            )}
          </div>
        )}

      </div>

      {/* Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          if (onDeleteTrip) {
            onDeleteTrip(trip.id);
            setIsDeleteModalOpen(false);
          }
        }}
        tripTitle={trip.title}
        tripSubtitle={`${trip.date} • ${trip.totalKm} ק"מ`}
        warningNote="לא יהיה ניתן לשחזר אותה אחר כך."
      />

    </div>
  );
};
