import React from 'react';
import type { Trip, User } from '../../types';
import { StorageService } from '../../services/storage';
import { MapPin, Calendar, Clock, Star, Image as ImageIcon, Trash2 } from 'lucide-react';

interface TripCardProps {
  trip: Trip;
  currentUser: User;
  onOpenDetails: (trip: Trip) => void;
  onTripDeleted?: () => void;
}

export const TripCard: React.FC<TripCardProps> = ({
  trip,
  currentUser,
  onOpenDetails,
  onTripDeleted,
}) => {
  const allUsers = StorageService.getUsers();
  const participantUsers = allUsers.filter((u) => trip.participants.includes(u.id));

  const avgRating = trip.reviews && trip.reviews.length > 0
    ? (trip.reviews.reduce((acc, r) => acc + r.stars, 0) / trip.reviews.length).toFixed(1)
    : null;

  const coverImage = trip.photos && trip.photos.length > 0
    ? trip.photos[0].url
    : 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80';

  const isCreator = trip.creatorId === currentUser.id;

  const handleDeleteFromMyTrips = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`האם להסיר את הנסיעה "${trip.title}" מרשימת הנסיעות שלך? (היא תישאר אצל שאר החברים שהשתתפו).`)) {
      StorageService.removeTripForUser(trip.id, currentUser.id);
      if (onTripDeleted) onTripDeleted();
    }
  };

  return (
    <div
      onClick={() => onOpenDetails(trip)}
      className="group bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl overflow-hidden shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col relative"
    >
      {/* Cover Image & Badges */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-950">
        <img
          src={coverImage}
          alt={trip.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent" />

        {/* Date & Weather pill */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <div className="bg-slate-950/85 backdrop-blur-md border border-slate-700/60 px-2.5 py-1 rounded-full text-[11px] font-semibold text-slate-200 flex items-center gap-1 shadow">
            <Calendar className="w-3 h-3 text-sky-400" />
            <span>{trip.date}</span>
          </div>
          {trip.weather && (
            <div className="bg-slate-950/85 backdrop-blur-md border border-slate-700/60 px-2 py-1 rounded-full text-[10px] font-bold text-sky-300 shadow">
              ☀️ {trip.weather.temp}°C
            </div>
          )}
        </div>

        {/* Quick Delete button (hover) */}
        <button
          onClick={handleDeleteFromMyTrips}
          title="הסר נסיעה זו מהנסיעות שלי"
          className="absolute top-3 left-3 bg-slate-950/80 hover:bg-rose-600 text-slate-400 hover:text-white p-1.5 rounded-full border border-slate-700/60 backdrop-blur-md transition shadow"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        {/* Bottom row on cover: creator & ratings */}
        <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <img
              src={trip.creatorAvatar}
              alt={trip.creatorName}
              className="w-6 h-6 rounded-full object-cover border border-slate-700"
            />
            <span className="text-white font-medium drop-shadow-md text-xs">
              {isCreator ? 'נוצר על ידך' : `נוצר על ידי ${trip.creatorName.split(' ')[0]}`}
            </span>
          </div>

          {avgRating && (
            <div className="flex items-center gap-1 bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full font-bold text-xs shadow">
              <Star className="w-3 h-3 fill-slate-950" />
              <span>{avgRating} ({trip.reviews.length})</span>
            </div>
          )}
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition mb-1">
            {trip.title}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {trip.originalPrompt}
          </p>
        </div>

        {/* Stops Preview Tags */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {trip.waypoints.slice(0, 4).map((wp, i) => (
            <span
              key={i}
              className="text-[10px] bg-slate-950 text-slate-300 border border-slate-800 px-2 py-0.5 rounded-md"
            >
              {wp.name.split(' ')[0]}
            </span>
          ))}
          {trip.waypoints.length > 4 && (
            <span className="text-[10px] bg-slate-950 text-slate-500 px-1.5 py-0.5 rounded-md">
              +{trip.waypoints.length - 4} נוספות
            </span>
          )}
        </div>

        {/* Bottom Stats Footer */}
        <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-semibold text-sky-400">
              <MapPin className="w-3.5 h-3.5" />
              <span>{trip.totalKm} ק"מ</span>
            </span>
            <span className="flex items-center gap-1 font-semibold text-slate-300">
              <Clock className="w-3.5 h-3.5" />
              <span>{trip.durationHours} ש'</span>
            </span>
            {trip.photos && trip.photos.length > 0 && (
              <span className="flex items-center gap-1 text-slate-400">
                <ImageIcon className="w-3 h-3" />
                <span>{trip.photos.length}</span>
              </span>
            )}
          </div>

          {/* Participant avatars */}
          <div className="flex items-center -space-x-1.5 space-x-reverse">
            {participantUsers.map((u) => (
              <img
                key={u.id}
                src={u.avatar}
                alt={u.name}
                title={u.name}
                className="w-5 h-5 rounded-full object-cover border border-slate-900"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
