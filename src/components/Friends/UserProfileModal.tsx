import React from 'react';
import type { User, Trip } from '../../types';
import { StorageService } from '../../services/storage';
import { X, MapPin, Calendar, Clock, UserCheck, UserPlus, Check, Compass } from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: User | null;
  currentUser: User;
  onSelectTripPreview?: (trip: Trip) => void;
  onFriendshipChanged?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  targetUser,
  currentUser,
  onSelectTripPreview,
  onFriendshipChanged,
}) => {
  if (!isOpen || !targetUser) return null;

  const isSelf = targetUser.id === currentUser.id;
  const areFriends = StorageService.areFriends(currentUser.id, targetUser.id);
  const requests = StorageService.getUserFriendRequests(currentUser.id);
  const hasSentRequest = requests.outgoing.some((r) => r.toUserId === targetUser.id);
  const hasIncomingRequest = requests.incoming.find((r) => r.fromUserId === targetUser.id);

  const riderTrips = StorageService.getUserTrips(targetUser.id);
  const totalKmRidden = riderTrips.reduce((acc, t) => acc + (t.totalKm || 0), 0);

  const handleSendFriendRequest = () => {
    StorageService.sendFriendRequest(currentUser.id, targetUser.id);
    onFriendshipChanged?.();
  };

  const handleAcceptRequest = () => {
    if (hasIncomingRequest) {
      StorageService.acceptFriendRequest(hasIncomingRequest.id);
      onFriendshipChanged?.();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" dir="rtl">
      <div className="bg-[#0b101d] border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[88vh]">
        
        {/* Cover / Header Banner */}
        <div className="h-28 bg-gradient-to-r from-blue-900/40 via-slate-900 to-sky-950/60 p-4 flex items-start justify-between relative border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-sky-400 bg-slate-950/60 border border-slate-800 px-2.5 py-0.5 rounded-full">
              פרופיל רוכב קהילה
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-900/60 hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Info Row */}
        <div className="px-6 pb-4 pt-0 relative flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-10 border-b border-slate-800/80 bg-slate-900/40">
          <div className="flex items-end gap-3.5">
            <img
              src={targetUser.avatar}
              alt={targetUser.name}
              className="w-20 h-20 rounded-2xl object-cover ring-4 ring-[#0b101d] shadow-xl bg-slate-800 shrink-0"
            />
            <div className="mb-1 text-right">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">{targetUser.name}</h3>
                <span
                  dir="ltr"
                  className="text-xs text-sky-400 font-mono font-bold px-2 py-0.5 rounded-lg bg-sky-950/60 border border-sky-800/50"
                >
                  {targetUser.bikeModel || targetUser.bike}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">{targetUser.role} • {targetUser.bike}</p>
            </div>
          </div>

          {/* Friendship Action Button */}
          <div className="mb-1">
            {isSelf ? (
              <span className="text-[11px] text-slate-400 px-3 py-1 bg-slate-800/60 rounded-xl">זהו הפרופיל שלך</span>
            ) : areFriends ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold">
                <UserCheck className="w-3.5 h-3.5" />
                <span>חברים מאושרים לרכיבה</span>
              </div>
            ) : hasIncomingRequest ? (
              <button
                onClick={handleAcceptRequest}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-md"
              >
                <Check className="w-3.5 h-3.5" />
                <span>אשר בקשת חברות</span>
              </button>
            ) : hasSentRequest ? (
              <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl font-medium">
                בקשת חברות ממתינה לאישור
              </span>
            ) : (
              <button
                onClick={handleSendFriendRequest}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-md"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>שלח הצעת חברות</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3 px-6 py-3 bg-slate-950/40 border-b border-slate-800/60 text-center">
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60">
            <span className="text-[10px] text-slate-400 font-semibold block">סך קילומטרים</span>
            <span className="text-sm font-black text-sky-400 font-mono">{totalKmRidden} ק"מ</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60">
            <span className="text-[10px] text-slate-400 font-semibold block">נסיעות ביומן</span>
            <span className="text-sm font-black text-white font-mono">{riderTrips.length}</span>
          </div>
        </div>

        {/* Rider's Trips */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-200">
              הנסיעות של {targetUser.name} ({riderTrips.length})
            </h4>
            <span className="text-[11px] text-slate-500">לחץ לצפייה במסלול המלא על המפה</span>
          </div>

          {riderTrips.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              הרוכב עדיין לא יצא לנסיעות רשומות ביומן.
            </div>
          ) : (
            <div className="space-y-2.5">
              {riderTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="p-3 bg-slate-900/70 hover:bg-slate-800/70 border border-slate-800/80 rounded-2xl transition flex items-center justify-between group"
                >
                  <div className="min-w-0 flex-1 pl-3 text-right">
                    <h5 className="text-xs font-bold text-white group-hover:text-blue-400 transition truncate">
                      {trip.title}
                    </h5>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                      <span className="flex items-center gap-1 text-sky-400 font-semibold">
                        <MapPin className="w-3 h-3" />
                        <span>{trip.totalKm} ק"מ</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{trip.date}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{trip.durationHours} שעות</span>
                      </span>
                    </div>
                  </div>

                  {onSelectTripPreview && (
                    <button
                      onClick={() => {
                        onSelectTripPreview(trip);
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>הצג במפה</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
