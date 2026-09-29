import React, { useEffect } from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tripTitle?: string;
  tripSubtitle?: string;
  warningNote?: string;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  tripTitle,
  tripSubtitle,
  warningNote = 'לא יהיה ניתן לשחזר אותה אחר כך.',
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="bg-[#0b101d] border border-rose-500/40 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl shadow-rose-950/40 p-6 space-y-5 animate-in zoom-in-95 duration-150 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close corner button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Warning Icon Badge */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 shadow-lg shadow-rose-500/20">
            <Trash2 className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-white tracking-tight">
              האם אתה בטוח שאתה רוצה למחוק את הנסיעה הזאת?
            </h3>
            <p className="text-xs text-rose-400 font-semibold flex items-center justify-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{warningNote}</span>
            </p>
          </div>
        </div>

        {/* Trip Preview Pill */}
        {tripTitle && (
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-1 text-right">
            <span className="text-[10px] text-slate-500 font-semibold block">נסיעה שנבחרה למחיקה:</span>
            <div className="text-xs font-bold text-white leading-snug">{tripTitle}</div>
            {tripSubtitle && (
              <div className="text-[11px] text-slate-400 font-mono">{tripSubtitle}</div>
            )}
          </div>
        )}

        {/* Notice text */}
        <p className="text-[11px] text-slate-400 text-center leading-relaxed">
          מחיקת הנסיעה תסיר אותה מיומן הרכיבות האישי שלך ולא תופיע יותר במפה.
          אם השתתפו רוכבים נוספים, הנסיעה תישמר אצלם בלבד.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold border border-slate-800 transition text-center"
          >
            ביטול
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-2.5 px-4 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-xl text-xs font-extrabold transition shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>מחק נסיעה</span>
          </button>
        </div>

      </div>
    </div>
  );
};
