import React, { useState } from 'react';
import type { Trip, User } from '../../types';
import { StorageService } from '../../services/storage';
import { MapPin, Calendar, Clock, Star, Trash2, Image as ImageIcon } from 'lucide-react';
import { ConfirmDeleteModal } from '../Common/ConfirmDeleteModal';

interface RideListProps {
  trips: Trip[];
  activeTripId: string | null;
  currentUser?: User;
  onSelectTrip: (trip: Trip) => void;
  onDeleteTrip: (tripId: string) => void;
}

export const RideList: React.FC<RideListProps> = ({
  trips,
  activeTripId,
  currentUser: _currentUser,
  onSelectTrip,
  onDeleteTrip,
}) => {
  const [tripToDelete, setTripToDelete] = useState<Trip | null>(null);
  const allUsers = StorageService.getUsers();

  if (trips.length === 0) {
    return (
      <div className="p-8 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-xl text-slate-500">
          🏍️
        </div>
        <div className="text-xs font-semibold text-slate-300">אין נסיעות ביומן כרגע</div>
        <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
          לחץ על "נסיעה חדשה" למעלה כדי להזין את סיפור הרכיבה של יום שישי.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-2.5">
      {trips.map((trip) => {
        const isActive = trip.id === activeTripId;
        const participantUsers = allUsers.filter((u) => trip.participants.includes(u.id));
        const avgRating = trip.reviews && trip.reviews.length > 0
          ? (trip.reviews.reduce((acc, r) => acc + r.stars, 0) / trip.reviews.length).toFixed(1)
          : null;

        const isUserInTrip = _currentUser ? trip.participants.includes(_currentUser.id) : true;

        return (
          <div
            key={trip.id}
            onClick={() => onSelectTrip(trip)}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
              isActive
                ? 'bg-[#141b2d] border-blue-500/80 shadow-lg shadow-blue-500/10'
                : 'bg-[#0f1422] border-slate-800/80 hover:border-slate-700 hover:bg-[#121828]'
            }`}
          >
            {/* Top row: date & weather */}
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <Calendar className="w-3 h-3 text-sky-400" />
                <span>{trip.date}</span>
                {trip.startTime && <span>• {trip.startTime}</span>}
              </div>

              <div className="flex items-center gap-2">
                {!isUserInTrip && (
                  <span className="text-[9px] bg-blue-950/70 text-blue-300 border border-blue-500/40 px-2 py-0.5 rounded-full font-bold">
                    לא משתתף
                  </span>
                )}
                {trip.weather && (
                  <span className="text-[10px] bg-slate-900 text-sky-300 border border-slate-800 px-2 py-0.5 rounded-full font-medium">
                    ☀️ {trip.weather.temp}°C
                  </span>
                )}
                {avgRating && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded-md font-bold flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5 fill-amber-300" /> {avgRating}
                  </span>
                )}
                {isUserInTrip && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTripToDelete(trip);
                    }}
                    title="הסר מהנסיעות שלי"
                    className="text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 p-1.5 rounded-lg transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Title */}
            <h3 className={`text-xs font-bold leading-snug mb-1 transition ${isActive ? 'text-blue-400' : 'text-white'}`}>
              {trip.title}
            </h3>

            {/* Prompt snippet */}
            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-2.5">
              {trip.originalPrompt}
            </p>

            {/* Bottom Row: Stats & Riders */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 font-semibold text-sky-400">
                  <MapPin className="w-3 h-3" />
                  <span>{trip.totalKm} ק"מ</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{trip.durationHours} ש'</span>
                </span>
                {trip.photos && trip.photos.length > 0 && (
                  <span className="flex items-center gap-1 text-slate-400">
                    <ImageIcon className="w-3 h-3" />
                    <span>{trip.photos.length}</span>
                  </span>
                )}
              </div>

              {/* Rider avatars */}
              <div className="flex items-center -space-x-1 space-x-reverse">
                {participantUsers.map((u) => (
                  <img
                    key={u.id}
                    src={u.avatar}
                    alt={u.name}
                    title={`${u.name} (${u.bike})`}
                    className="w-5 h-5 rounded-full object-cover border border-slate-900"
                  />
                ))}
              </div>
            </div>

          </div>
        );
      })}

      {/* Confirmation Modal Before Deleting */}
      <ConfirmDeleteModal
        isOpen={!!tripToDelete}
        onClose={() => setTripToDelete(null)}
        onConfirm={() => {
          if (tripToDelete) {
            onDeleteTrip(tripToDelete.id);
            setTripToDelete(null);
          }
        }}
        tripTitle={tripToDelete?.title}
        tripSubtitle={tripToDelete ? `${tripToDelete.date} • ${tripToDelete.totalKm} ק"מ` : undefined}
        warningNote="לא יהיה ניתן לשחזר אותה אחר כך."
      />
    </div>
  );
};
