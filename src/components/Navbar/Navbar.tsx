import React from 'react';
import type { User } from '../../types';
import { StorageService } from '../../services/storage';
import { Compass, PlusCircle, Bell, Shield } from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  onUserChange: (user: User) => void;
  onOpenNewTripModal: () => void;
  onOpenInvitesModal: () => void;
  onOpenAdminModal: () => void;
  pendingInvitesCount: number;
  activeTab: 'my-trips' | 'feed';
  setActiveTab: (tab: 'my-trips' | 'feed') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onUserChange,
  onOpenNewTripModal,
  onOpenInvitesModal,
  onOpenAdminModal,
  pendingInvitesCount,
  activeTab,
  setActiveTab,
}) => {
  const allUsers = StorageService.getUsers();

  const handleSelectUser = (userId: string) => {
    const selected = allUsers.find((u) => u.id === userId);
    if (selected) {
      StorageService.setActiveUserId(userId);
      onUserChange(selected);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800 shadow-xl">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Brand / Logo (Sleek Cobalt & Titanium) */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-black text-xl border border-blue-400/30">
            🏍️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-white">
                My<span className="text-blue-500">Ride</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">פלטפורמת מסלולים ורכיבות משותפות</p>
          </div>
        </div>

        {/* Center Tabs */}
        <div className="flex items-center bg-slate-900 p-1 rounded-2xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('my-trips')}
            className={`px-3.5 py-1.5 rounded-xl transition ${
              activeTab === 'my-trips'
                ? 'bg-blue-600 text-white shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            הנסיעות שלי
          </button>
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition ${
              activeTab === 'feed'
                ? 'bg-blue-600 text-white shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>גילוי מסלולים</span>
          </button>
        </div>

        {/* User Switcher + Admin + Invites + New Trip */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Admin Dashboard Button (shows if user is admin) */}
          {currentUser.isAdmin && (
            <button
              onClick={onOpenAdminModal}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-bold transition shadow"
              title="פתח לוח בקרה לניהול משתמשים"
            >
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">ניהול אדמין</span>
            </button>
          )}

          {/* Pending Invites Notification Bell */}
          <button
            onClick={onOpenInvitesModal}
            className={`relative p-2 rounded-xl border transition ${
              pendingInvitesCount > 0
                ? 'bg-blue-600/20 border-blue-500/60 text-blue-400 hover:bg-blue-600/30 animate-pulse'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title={pendingInvitesCount > 0 ? `יש לך ${pendingInvitesCount} הזמנות הממתינות לאישורך!` : 'הזמנות'}
          >
            <Bell className="w-4 h-4" />
            {pendingInvitesCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border-2 border-slate-950">
                {pendingInvitesCount}
              </span>
            )}
          </button>

          {/* User Switcher Dropdown */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-2xl px-2.5 py-1.5 gap-2">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-7 h-7 rounded-xl object-cover border border-slate-700"
            />
            <div className="hidden md:block text-right">
              <div className="text-xs font-bold text-slate-200 leading-none">{currentUser.name}</div>
              <div className="text-[10px] text-blue-400 leading-tight mt-0.5">{currentUser.bike}</div>
            </div>
            
            <select
              value={currentUser.id}
              onChange={(e) => handleSelectUser(e.target.value)}
              className="bg-transparent text-xs text-slate-300 focus:outline-none cursor-pointer pr-1"
            >
              {allUsers.map((user) => (
                <option key={user.id} value={user.id} className="bg-slate-900 text-slate-200">
                  {user.isAdmin ? '🛡️ מנהל מערכת' : `👤 ${user.name.split(' ')[0]}`}
                </option>
              ))}
            </select>
          </div>

          {/* New Trip Button */}
          <button
            onClick={onOpenNewTripModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-blue-500/20 transition active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">נסיעה חדשה</span>
          </button>

        </div>

      </div>
    </header>
  );
};
