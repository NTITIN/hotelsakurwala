import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ShieldCheck, Lock, X, KeyRound, AlertTriangle } from 'lucide-react';

export const ManagerOverrideModal = ({ isOpen, onClose, onSuccess, title = "Manager Authorization Required" }) => {
  const { verifyManagerPin, currentUser } = useAuth();
  const { addToast } = useToast();
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleVerify = (e) => {
    e.preventDefault();
    setErrorMsg('');
    const res = verifyManagerPin(pin.trim());
    if (res.success) {
      addToast(
        `Authorized by ${res.approver.name} (${res.approver.role})`,
        'success',
        'Manager Approval Granted'
      );
      onSuccess(res.approver);
      onClose();
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm shadow-2xl p-6 text-center">
        {/* Header Icon */}
        <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-200 dark:border-amber-800">
          <KeyRound className="w-7 h-7" />
        </div>

        <h3 className="font-bold text-slate-900 dark:text-white text-lg font-['Outfit']">
          {title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4 leading-relaxed">
          Current user <strong className="text-slate-700 dark:text-slate-300">({currentUser?.name} - {currentUser?.role})</strong> is not authorized to print invoices. Please have a Manager or Admin enter their 4-digit PIN.
        </p>

        {errorMsg && (
          <div className="mb-4 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 text-left">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <input
              type="password"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
              autoFocus
              className="w-44 mx-auto text-center tracking-[1em] font-mono text-2xl font-bold py-2.5 px-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              required
            />
            <div className="text-[10px] text-slate-400 mt-2">
              Demo Manager PIN: <span className="font-mono font-bold text-amber-600">1234</span> or Admin: <span className="font-mono font-bold text-amber-600">9999</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md shadow-amber-600/30 transition transform active:scale-95"
            >
              Authorize Print
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
