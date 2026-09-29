import React from 'react';
import type { Trip, User } from '../../types';
import { StorageService } from '../../services/storage';
import confetti from 'canvas-confetti';
import { X, Check, XCircle, MapPin, Clock, Bell } from 'lucide-react';

interface PendingInvitesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onInviteAccepted: (trip: Trip) => void;
  onInviteRejected: (tripId: string) => void;
}

export const PendingInvitesModal: React.FC<PendingInvitesModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onInviteAccepted,
  onInviteRejected,
}) => {
  if (!isOpen) return null;

  const pendingTrips = StorageService.getUserPendingInvites(currentUser.id);

  const handleAccept = (tripId: string) => {
    const updated = StorageService.approveTripInvite(tripId, currentUser.id);
    if (updated) {
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#2563eb', '#38bdf8', '#10b981', '#6366f1'],
        });
      } catch (e) {
        // graceful ignore
      }
      onInviteAccepted(updated);
    }
  };

  const handleReject = (tripId: string) => {
    StorageService.rejectTripInvite(tripId, currentUser.id);
    onInviteRejected(tripId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">הזמנות רכיבה הממתינות לאישורך</h2>
              <p className="text-xs text-slate-400">חברים לרכיבה שיתפו איתך נסיעות שהיית חלק מהן</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {pendingTrips.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500 text-xl">
                🏍️
              </div>
              <div className="text-sm font-semibold text-slate-300">אין הזמנות ממתינות כרגע</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                כשמוביל הנסיעה ייצור נסיעה חדשה ויסמן אותך כשותף, היא תופיע כאן מיד לאישורך.
              </p>
            </div>
          ) : (
            pendingTrips.map((trip) => (
              <div
                key={trip.id}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 hover:border-slate-700 transition-all"
              >
                {/* Inviter Info */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={trip.creatorAvatar}
                      alt={trip.creatorName}
                      className="w-8 h-8 rounded-full object-cover border border-blue-500"
                    />
                    <div>
                      <div className="text-xs text-slate-400">הוזמנת על ידי:</div>
                      <div className="text-xs font-bold text-slate-100">{trip.creatorName}</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-0.5 rounded-full">
                    {trip.date}
                  </span>
                </div>

                {/* Trip Details */}
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">{trip.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 italic bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    "{trip.originalPrompt}"
                  </p>
                </div>

                {/* Quick Stats Pill */}
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <span className="flex items-center gap-1 font-semibold text-sky-400">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{trip.totalKm} ק"מ</span>
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-slate-300">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{trip.durationHours} שעות</span>
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
                  <button
                    onClick={() => handleAccept(trip.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition"
                  >
                    <Check className="w-4 h-4" />
                    <span>אשר והוסף ל'הנסיעות שלי'</span>
                  </button>
                  <button
                    onClick={() => handleReject(trip.id)}
                    className="flex items-center justify-center gap-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 text-xs rounded-xl transition border border-slate-800"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>דחה</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
