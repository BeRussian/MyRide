import React, { useState, useRef, useEffect } from 'react';
import type { User } from '../../types';
import { ChevronDown, Check, Shield, User as UserIcon, Users } from 'lucide-react';

interface UserSwitcherProps {
  currentUser: User;
  allUsers: User[];
  onSelectUser: (userId: string) => void;
  onOpenEditProfile?: () => void;
  onOpenFriends?: () => void;
}

export const UserSwitcher: React.FC<UserSwitcherProps> = ({
  currentUser,
  allUsers,
  onSelectUser,
  onOpenEditProfile,
  onOpenFriends,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (userId: string) => {
    onSelectUser(userId);
    setIsOpen(false);
  };

  // Get motorcycle model (Ninja 400, MT-07, etc.)
  const getBikeModel = (user: User) => {
    return user.bikeModel || user.bike.split(' ')[0];
  };

  return (
    <div className="relative" ref={containerRef} dir="rtl">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl border transition-all duration-200 select-none ${
          isOpen
            ? 'bg-slate-800 border-blue-500/70 shadow-lg shadow-blue-500/10'
            : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 shadow-sm'
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {/* User Avatar */}
        <div className="relative shrink-0">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-700/80"
          />
          {currentUser.isAdmin && (
            <span className="absolute -bottom-1 -left-1 w-3 h-3 bg-amber-500 rounded-full flex items-center justify-center text-[7px] text-slate-950 font-black">
              ★
            </span>
          )}
        </div>

        {/* User Info (Name + Bike Model / Role) */}
        <div className="flex flex-col text-right leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-white tracking-tight">
              {currentUser.name}
            </span>
            {currentUser.isAdmin ? (
              <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1 py-0.2 rounded font-medium">
                אדמין
              </span>
            ) : (
              <span
                dir="ltr"
                className="text-[10px] text-sky-400 font-mono font-bold px-1.5 py-0.5 rounded bg-sky-950/40 border border-sky-800/40"
              >
                {getBikeModel(currentUser)}
              </span>
            )}
          </div>
        </div>

        {/* Custom Chevron Arrow with smooth rotation */}
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-blue-400' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu Popover */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 mt-2 w-72 bg-[#0c101d] border border-slate-800/90 rounded-2xl shadow-2xl shadow-black/80 backdrop-blur-xl z-50 p-1.5 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="px-3 py-2 border-b border-slate-800/60 mb-1 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">החלף משתמש פעיל</span>
            <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
              {allUsers.length} פרופילים
            </span>
          </div>

          {/* List of Users */}
          <div className="space-y-1">
            {allUsers.map((user) => {
              const isSelected = user.id === currentUser.id;
              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleSelect(user.id)}
                  role="option"
                  aria-selected={isSelected}
                  className={`w-full flex items-center justify-between p-2 rounded-xl transition text-right group ${
                    isSelected
                      ? 'bg-blue-600/15 border border-blue-500/30 text-white'
                      : 'hover:bg-slate-800/70 border border-transparent text-slate-300'
                  }`}
                >
                  {/* Right side: Avatar + User Details */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-xl object-cover ring-1 ring-slate-800 shrink-0"
                    />
                    <div className="min-w-0 text-right">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white truncate">
                          {user.name}
                        </span>
                        {user.isAdmin && (
                          <Shield className="w-3 h-3 text-amber-400 shrink-0" />
                        )}
                      </div>
                      <div
                        dir="ltr"
                        className="text-[10px] text-sky-400 font-mono font-semibold truncate text-right mt-0.5"
                      >
                        {getBikeModel(user)} • <span className="text-slate-400 font-normal">{user.bike}</span>
                      </div>
                    </div>
                  </div>

                  {/* Left side: Selected Checkmark */}
                  <div className="shrink-0 pl-1">
                    {isSelected ? (
                      <div className="w-5 h-5 rounded-full bg-blue-600/30 flex items-center justify-center border border-blue-500/50">
                        <Check className="w-3 h-3 text-blue-400" />
                      </div>
                    ) : (
                      <span className="w-5 h-5 block" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Profile & Friends Actions */}
          <div className="pt-2 mt-1 border-t border-slate-800/80 flex items-center gap-1.5 px-1">
            {onOpenEditProfile && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenEditProfile();
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl transition border border-slate-800"
              >
                <UserIcon className="w-3.5 h-3.5 text-blue-400" />
                <span>ערוך פרופיל</span>
              </button>
            )}
            {onOpenFriends && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenFriends();
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl transition border border-slate-800"
              >
                <Users className="w-3.5 h-3.5 text-sky-400" />
                <span>חברים ({currentUser.friends?.length || 0})</span>
              </button>
            )}
          </div>

        </div>
      )}
    </div>
  );
};
