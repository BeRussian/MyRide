import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import {
  X,
  Shield,
  UserPlus,
  Trash2,
  Users,
  Compass
} from 'lucide-react';
import { ConfirmDeleteModal } from '../Common/ConfirmDeleteModal';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged: () => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  onDataChanged,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'trips'>('users');
  
  // New User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserBike, setNewUserBike] = useState('');
  const [newUserRole, setNewUserRole] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [isAddingUser, setIsAddingUser] = useState(false);

  // Custom Delete Confirmation State
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    type: 'user' | 'trip';
    id: string;
    title: string;
  } | null>(null);

  if (!isOpen) return null;

  const allUsers = StorageService.getUsers();
  const allTrips = StorageService.getTrips();

  const handleDeleteUser = (userId: string, userName: string) => {
    setDeleteConfirmation({
      type: 'user',
      id: userId,
      title: userName,
    });
  };

  const handleDeleteTrip = (tripId: string, tripTitle: string) => {
    setDeleteConfirmation({
      type: 'trip',
      id: tripId,
      title: tripTitle,
    });
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserBike.trim()) return;

    StorageService.addUser(newUserName, newUserBike, newUserRole, newUserPhone);
    setNewUserName('');
    setNewUserBike('');
    setNewUserRole('');
    setNewUserPhone('');
    setIsAddingUser(false);
    onDataChanged();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">לוח בקרה למנהל מערכת (Admin Console)</h2>
                <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-bold border border-blue-500/30">
                  ניהול בלעדי
                </span>
              </div>
              <p className="text-xs text-slate-400">ניהול משתמשי הפלטפורמה, הוספת חברים ומחיקת נסיעות</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center px-6 bg-slate-950 border-b border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-1.5 py-3 px-4 border-b-2 transition ${
              activeTab === 'users'
                ? 'border-blue-500 text-blue-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>ניהול משתמשים ({allUsers.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('trips')}
            className={`flex items-center gap-1.5 py-3 px-4 border-b-2 transition ${
              activeTab === 'trips'
                ? 'border-blue-500 text-blue-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>כל הנסיעות במערכת ({allTrips.length})</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'users' && (
            <div className="space-y-4">
              
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  רשימת המשתמשים הפעילים:
                </span>
                <button
                  onClick={() => setIsAddingUser(!isAddingUser)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition shadow"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{isAddingUser ? 'בטל הוספה' : 'הוסף משתמש חדש'}</span>
                </button>
              </div>

              {/* Add User Form Drawer */}
              {isAddingUser && (
                <form onSubmit={handleCreateUser} className="bg-slate-950 border border-blue-500/30 p-4 rounded-2xl space-y-3">
                  <div className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4" />
                    <span>יצירת משתמש רוכב חדש:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="שם מלא (למשל: תומר לוי)"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      required
                      className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="דגם אופנוע (למשל: Kawasaki Z900)"
                      value={newUserBike}
                      onChange={(e) => setNewUserBike(e.target.value)}
                      required
                      className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="תפקיד / הערה (למשל: רוכב שבת קבוע)"
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="טלפון (למשל: 054-1234567)"
                      value={newUserPhone}
                      onChange={(e) => setNewUserPhone(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition shadow"
                    >
                      שמור משתמש
                    </button>
                  </div>
                </form>
              )}

              {/* Users List */}
              <div className="space-y-2">
                {allUsers.map((user) => {
                  const userTripsCount = allTrips.filter(t => t.participants && t.participants.includes(user.id)).length;
                  const isProtectedAdmin = user.id === 'admin';

                  return (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl hover:border-slate-700 transition"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{user.name}</span>
                            {user.isAdmin && (
                              <span className="text-[10px] bg-blue-500/20 text-blue-400 font-bold px-2 py-0.5 rounded-full border border-blue-500/30">
                                מנהל
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">{user.bike} • {user.role}</div>
                          <div className="text-[10px] text-slate-500">{user.phone} • {userTripsCount} רכיבות רשומות</div>
                        </div>
                      </div>

                      {!isProtectedAdmin ? (
                        <button
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-semibold transition"
                          title="מחק משתמש זה מהמערכת"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>מחק משתמש</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-mono">מוגן</span>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {activeTab === 'trips' && (
            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-300">
                כל הנסיעות הקיימות במסד הנתונים:
              </span>
              <div className="space-y-2">
                {allTrips.map((trip) => (
                  <div
                    key={trip.id}
                    className="flex items-center justify-between p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white">{trip.title}</h4>
                      <p className="text-[11px] text-slate-400">{trip.date} • {trip.totalKm} ק"מ • יוצר: {trip.creatorName}</p>
                      <div className="text-[10px] text-slate-500 mt-0.5">משתתפים: {trip.participants.length}</div>
                    </div>
                    <button
                      onClick={() => handleDeleteTrip(trip.id, trip.title)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-semibold transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>מחק נסיעה</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteConfirmation}
        onClose={() => setDeleteConfirmation(null)}
        onConfirm={() => {
          if (!deleteConfirmation) return;
          if (deleteConfirmation.type === 'user') {
            StorageService.deleteUser(deleteConfirmation.id);
          } else {
            StorageService.deleteTripCompletely(deleteConfirmation.id);
          }
          onDataChanged();
          setDeleteConfirmation(null);
        }}
        tripTitle={deleteConfirmation ? (deleteConfirmation.type === 'user' ? `משתמש: ${deleteConfirmation.title}` : deleteConfirmation.title) : undefined}
        warningNote={deleteConfirmation?.type === 'user' ? 'כל הנתונים והנסיעות של משתמש זה יוסרו מהמערכת.' : 'הנסיעה תימחק לצמיתות מכל הרוכבים במערכת.'}
      />
    </div>
  );
};
