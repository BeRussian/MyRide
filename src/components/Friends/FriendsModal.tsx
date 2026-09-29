import React, { useState } from 'react';
import type { User, Trip } from '../../types';
import { StorageService } from '../../services/storage';
import {
  X,
  Users,
  UserPlus,
  Check,
  UserCheck,
  Search,
  Clock,
  Compass
} from 'lucide-react';

interface FriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onViewUserProfile: (user: User) => void;
  onSelectTripPreview?: (trip: Trip) => void;
  onDataChanged: () => void;
}

export const FriendsModal: React.FC<FriendsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onViewUserProfile,
  onDataChanged,
}) => {
  const [activeTab, setActiveTab] = useState<'my-friends' | 'requests' | 'discover'>('my-friends');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const allUsers = StorageService.getUsers();
  const friends = StorageService.getFriends(currentUser.id);
  const friendRequests = StorageService.getUserFriendRequests(currentUser.id);

  // Incoming requests users
  const incomingRequestItems = friendRequests.incoming.map((req) => {
    const sender = allUsers.find((u) => u.id === req.fromUserId);
    return { request: req, user: sender };
  }).filter((item): item is { request: typeof item.request; user: User } => !!item.user);

  // Non-friends (discoverable)
  const nonFriends = allUsers.filter(
    (u) =>
      u.id !== currentUser.id &&
      !currentUser.isAdmin &&
      !u.isAdmin &&
      !currentUser.friends?.includes(u.id)
  );

  const filteredDiscover = nonFriends.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.bike.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAccept = (requestId: string) => {
    StorageService.acceptFriendRequest(requestId);
    onDataChanged();
  };

  const handleReject = (requestId: string) => {
    StorageService.rejectFriendRequest(requestId);
    onDataChanged();
  };

  const handleSendRequest = (targetUserId: string) => {
    StorageService.sendFriendRequest(currentUser.id, targetUserId);
    onDataChanged();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" dir="rtl">
      <div className="bg-[#0b101d] border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[88vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-none">חברים ושותפי רכיבה</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">נהל את רשת החברים שלך, אשר בקשות והוסף שותפים לנסיעות</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 pt-3 border-b border-slate-800/80 gap-4 bg-slate-950/40">
          <button
            onClick={() => setActiveTab('my-friends')}
            className={`pb-2.5 text-xs font-bold transition flex items-center gap-1.5 border-b-2 ${
              activeTab === 'my-friends'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>החברים שלי ({friends.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`pb-2.5 text-xs font-bold transition flex items-center gap-1.5 border-b-2 relative ${
              activeTab === 'requests'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>בקשות ממתינות</span>
            {incomingRequestItems.length > 0 && (
              <span className="bg-blue-600 text-white text-[9px] font-black rounded-full px-1.5 py-0.2">
                {incomingRequestItems.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('discover')}
            className={`pb-2.5 text-xs font-bold transition flex items-center gap-1.5 border-b-2 ${
              activeTab === 'discover'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>גלה רוכבים ({nonFriends.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: My Friends */}
          {activeTab === 'my-friends' && (
            <div className="space-y-3">
              {friends.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <div className="text-2xl">👥</div>
                  <div className="text-xs font-bold text-slate-300">עדיין אין לך חברים מאושרים</div>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                    עבור ללשונית "גלה רוכבים" ושלח הצעת חברות לרוכבים בקהילה כדי לשתף איתם נסיעות.
                  </p>
                </div>
              ) : (
                friends.map((friend) => {
                  const trips = StorageService.getUserTrips(friend.id);
                  return (
                    <div
                      key={friend.id}
                      className="p-3 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center justify-between hover:border-slate-700 transition"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={friend.avatar}
                          alt={friend.name}
                          className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-700"
                        />
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{friend.name}</span>
                            <span
                              dir="ltr"
                              className="text-[10px] text-sky-400 font-mono font-bold px-1.5 py-0.5 rounded bg-sky-950/40 border border-sky-800/40"
                            >
                              {friend.bikeModel || friend.bike.split(' ')[0]}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            {friend.bike} • {trips.length} נסיעות
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onViewUserProfile(friend);
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition flex items-center gap-1"
                      >
                        <Compass className="w-3.5 h-3.5 text-blue-400" />
                        <span>צפה בפרופיל ונסיעות</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: Friend Requests */}
          {activeTab === 'requests' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-300 mb-2">
                  בקשות חברות שהתקבלו ({incomingRequestItems.length})
                </h4>
                {incomingRequestItems.length === 0 ? (
                  <div className="text-xs text-slate-500 py-4 text-center bg-slate-950/40 rounded-xl border border-slate-900">
                    אין בקשות חברות ממתינות כרגע.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {incomingRequestItems.map(({ request, user }) => (
                      <div
                        key={request.id}
                        className="p-3 bg-slate-900/80 border border-blue-500/30 rounded-2xl flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-10 h-10 rounded-xl object-cover ring-1 ring-blue-500/40"
                          />
                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">{user.name}</span>
                              <span
                                dir="ltr"
                                className="text-[10px] text-sky-400 font-mono font-bold px-1.5 py-0.5 rounded bg-sky-950/40 border border-sky-800/40"
                              >
                                {user.bikeModel || user.bike.split(' ')[0]}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400 block mt-0.5">
                              רוצה להצטרף לרשימת החברים שלך לרכיבות
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAccept(request.id)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1 shadow-sm"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>אשר</span>
                          </button>
                          <button
                            onClick={() => handleReject(request.id)}
                            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs rounded-xl transition"
                          >
                            דחה
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Outgoing Requests */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 mb-2">
                  בקשות ששלחת וממתינות לאישור ({friendRequests.outgoing.length})
                </h4>
                {friendRequests.outgoing.length === 0 ? (
                  <div className="text-[11px] text-slate-600 py-3 text-center">
                    אין בקשות פעילות ששלחת.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {friendRequests.outgoing.map((req) => {
                      const target = allUsers.find((u) => u.id === req.toUserId);
                      if (!target) return null;
                      return (
                        <div
                          key={req.id}
                          className="p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <img src={target.avatar} alt={target.name} className="w-7 h-7 rounded-lg object-cover" />
                            <span className="font-semibold text-white">{target.name}</span>
                            <span dir="ltr" className="text-[10px] text-slate-400 font-mono">
                              ({target.bikeModel || target.bike})
                            </span>
                          </div>
                          <span className="text-[11px] text-amber-400 font-medium">ממתין לאישור הרוכב...</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Discover Riders */}
          {activeTab === 'discover' && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="חפש רוכב לפי שם או דגם אופנוע..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-9 pl-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div className="space-y-2">
                {filteredDiscover.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-500">
                    לא נמצאו רוכבים נוספים.
                  </div>
                ) : (
                  filteredDiscover.map((rider) => {
                    const isPending = friendRequests.outgoing.some((r) => r.toUserId === rider.id);
                    return (
                      <div
                        key={rider.id}
                        className="p-3 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center justify-between hover:border-slate-700 transition"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={rider.avatar}
                            alt={rider.name}
                            className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-800"
                          />
                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">{rider.name}</span>
                              <span
                                dir="ltr"
                                className="text-[10px] text-sky-400 font-mono font-bold px-1.5 py-0.5 rounded bg-sky-950/40 border border-sky-800/40"
                              >
                                {rider.bikeModel || rider.bike.split(' ')[0]}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400 block mt-0.5">{rider.bike}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onViewUserProfile(rider)}
                            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl transition"
                          >
                            פרופיל
                          </button>
                          {isPending ? (
                            <span className="text-[11px] text-amber-400 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl font-medium">
                              בקשה נשלחה
                            </span>
                          ) : (
                            <button
                              onClick={() => handleSendRequest(rider.id)}
                              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1 shadow-sm"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                              <span>הוסף חבר</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
