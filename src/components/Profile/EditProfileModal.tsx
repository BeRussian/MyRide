import React, { useState, useEffect } from 'react';
import type { User } from '../../types';
import { StorageService } from '../../services/storage';
import { X, Camera, Check, Sparkles, User as UserIcon } from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onProfileUpdated: (updatedUser: User) => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onProfileUpdated,
}) => {
  const [name, setName] = useState(currentUser.name);
  const [bikeModel, setBikeModel] = useState(currentUser.bikeModel || currentUser.bike.split(' ')[0]);
  const [bikeBrand, setBikeBrand] = useState(currentUser.bikeBrand || '');
  const [bikeFull, setBikeFull] = useState(currentUser.bike);
  const [role, setRole] = useState(currentUser.role);
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [phone, setPhone] = useState(currentUser.phone);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync state whenever active user changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setName(currentUser.name);
      setBikeModel(currentUser.bikeModel || (currentUser.bike.split(' ')[1] || currentUser.bike));
      setBikeBrand(currentUser.bikeBrand || (currentUser.bike.split(' ')[0] || ''));
      setBikeFull(currentUser.bike);
      setRole(currentUser.role);
      setAvatar(currentUser.avatar);
      setPhone(currentUser.phone);
      setSavedSuccess(false);
    }
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setAvatar(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: User = {
      ...currentUser,
      name: name.trim() || currentUser.name,
      bikeModel: bikeModel.trim() || 'Ninja 400',
      bikeBrand: bikeBrand.trim() || 'Kawasaki',
      bike: bikeFull.trim() || `${bikeBrand} ${bikeModel}`,
      role: role.trim() || 'רוכב מועדון',
      avatar,
      phone: phone.trim() || '050-0000000',
    };

    StorageService.updateUser(updated);
    onProfileUpdated(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" dir="rtl">
      <div className="bg-[#0b101d] border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <UserIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-none">עריכת פרופיל רוכב</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">עדכן את האופנוע, תמונת הפרופיל והפרטים האישיים</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto flex-1">
          
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative group">
              <img
                src={avatar}
                alt={name}
                className="w-20 h-20 rounded-2xl object-cover ring-2 ring-blue-500/50 shadow-xl"
              />
              <label
                htmlFor="avatar-file"
                className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition text-white"
              >
                <Camera className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] font-medium">החלף תמונה</span>
              </label>
              <input
                id="avatar-file"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Presets */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 font-medium">או בחר אווטאר:</span>
              <div className="flex items-center gap-1.5">
                {AVATAR_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatar(preset)}
                    className={`w-7 h-7 rounded-lg overflow-hidden border transition ${
                      avatar === preset ? 'border-blue-400 ring-1 ring-blue-400' : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={preset} alt="preset" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Name, Role & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                שם הרוכב
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                סגנון / תפקיד
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition"
                placeholder="לדוגמה: רוכב ספורט"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                טלפון ליצירת קשר
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition"
                placeholder="050-0000000"
              />
            </div>
          </div>

          {/* Motorcycle Details */}
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-400 flex items-center gap-1">
                🏍️ פרטי האופנוע שלך
              </span>
              <span className="text-[10px] text-slate-400">יוצג ליד שמך בראש המסך ובנסיעות</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  דגם האופנוע (מוצג בבולטות ליד השם)
                </label>
                <input
                  type="text"
                  value={bikeModel}
                  onChange={(e) => {
                    setBikeModel(e.target.value);
                    setBikeFull(`${bikeBrand} ${e.target.value}`);
                  }}
                  className="w-full bg-slate-950 border border-blue-500/50 rounded-xl px-3 py-2 text-xs text-sky-300 font-mono focus:outline-none focus:border-blue-400 transition"
                  placeholder="למשל: Ninja 400"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  יצרן האופנוע
                </label>
                <input
                  type="text"
                  value={bikeBrand}
                  onChange={(e) => {
                    setBikeBrand(e.target.value);
                    setBikeFull(`${e.target.value} ${bikeModel}`);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500 transition"
                  placeholder="למשל: Kawasaki, Yamaha, KTM"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                שם מלא ותיאור הכלי
              </label>
              <input
                type="text"
                value={bikeFull}
                onChange={(e) => setBikeFull(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500 transition"
                placeholder="למשל: Kawasaki Ninja 400 (Black)"
              />
            </div>
          </div>

          {/* Live Pill Preview */}
          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">תצוגה מקדימה בסרגל העליון:</span>
            <div className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl">
              <img src={avatar} alt="preview" className="w-6 h-6 rounded-lg object-cover" />
              <span className="text-xs font-bold text-white">{name || 'השם שלך'}</span>
              <span dir="ltr" className="text-[10px] text-sky-400 font-mono font-bold px-1.5 py-0.5 rounded bg-sky-950/40 border border-sky-800/40">
                {bikeModel || 'Ninja 400'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition rounded-xl"
            >
              ביטול
            </button>
            <button
              type="submit"
              disabled={savedSuccess}
              className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-600/20"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>נשמר בהצלחה!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>שמור שינויים</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
