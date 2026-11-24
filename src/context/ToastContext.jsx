import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

// Optional Web Audio feedback for actions
const playNotificationSound = (type) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.08); // A5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'error' || type === 'denied') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now); // A3
      osc.frequency.setValueAtTime(164.81, now + 0.1); // E3
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    }
  } catch {
    // Audio might be blocked by browser autoplay policy before user gesture
  }
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', title = '') => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2, 5);
    const newToast = { id, message, type, title };
    
    setToasts((prev) => [...prev, newToast]);
    playNotificationSound(type);

    setTimeout(() => {
      removeToast(id);
    }, 4500);

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast container floating on top right */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col space-y-3 pointer-events-none max-w-sm w-full px-4 print:hidden">
        {toasts.map((toast) => {
          let bgClass = "bg-white border-slate-200 text-slate-800 shadow-xl dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100";
          let icon = <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />;

          if (toast.type === 'success') {
            bgClass = "bg-emerald-50 border-emerald-200 text-emerald-950 shadow-emerald-500/10 shadow-lg dark:bg-emerald-950/80 dark:border-emerald-800 dark:text-emerald-100";
            icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />;
          } else if (toast.type === 'error' || toast.type === 'denied') {
            bgClass = "bg-rose-50 border-rose-200 text-rose-950 shadow-rose-500/10 shadow-lg dark:bg-rose-950/80 dark:border-rose-800 dark:text-rose-100";
            icon = <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />;
          } else if (toast.type === 'warning') {
            bgClass = "bg-amber-50 border-amber-200 text-amber-950 shadow-amber-500/10 shadow-lg dark:bg-amber-950/80 dark:border-amber-800 dark:text-amber-100";
            icon = <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />;
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md transition-all duration-300 transform translate-y-0 opacity-100 animate-in fade-in slide-in-from-right-4 ${bgClass}`}
            >
              <div className="mt-0.5">{icon}</div>
              <div className="flex-1 text-sm">
                {toast.title && <div className="font-semibold text-xs uppercase tracking-wider mb-0.5">{toast.title}</div>}
                <div className="leading-snug">{toast.message}</div>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
