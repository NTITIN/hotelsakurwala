import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHotel } from '../../context/HotelContext';
import { DEMO_USERS } from '../../constants/initialData';
import { ROLES, ROLE_PERMISSIONS } from '../../constants/roles';
import {
  Building2,
  Clock,
  Shield,
  Printer,
  ChevronDown,
  LogOut,
  Users,
  Sparkles,
  Check
} from 'lucide-react';

export const Header = () => {
  const { currentUser, logout, quickLogin } = useAuth();
  const { hotelInfo, tables } = useHotel();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const occupiedCount = tables.filter((t) => t.status === 'occupied').length;
  const currentRoleInfo = currentUser ? ROLE_PERMISSIONS[currentUser.role] : null;

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 px-4 sm:px-6 py-2.5 transition">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg leading-tight">
                {hotelInfo.name}
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
                POS & Billing
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              {hotelInfo.tagline}
            </p>
          </div>
        </div>

        {/* Center: Live Station Stats (Clock + Occupancy) */}
        <div className="hidden md:flex items-center gap-4 bg-slate-100 dark:bg-slate-800/60 px-3.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700/60 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <Clock className="w-4 h-4 text-brand-500" />
            <span className="font-mono font-medium">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" />

          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-600 dark:text-slate-300">
              <strong className="text-slate-900 dark:text-white">{occupiedCount}</strong> of {tables.length} Tables Active
            </span>
          </div>
        </div>

        {/* Right: User Role Pill + Instant Switcher Dropdown */}
        <div className="flex items-center gap-2 sm:gap-3">
          {currentUser && (
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 transition"
                title="Click to switch role or account"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-lg object-cover ring-2 ring-brand-500/20"
                />
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-semibold text-slate-900 dark:text-white leading-tight flex items-center gap-1.5">
                    {currentUser.name}
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="flex items-center gap-1 text-[10px]">
                    <span className={`px-1.5 py-0.2 rounded border font-semibold ${currentRoleInfo?.badgeColor}`}>
                      {currentUser.role}
                    </span>
                    {currentUser.role === ROLES.ADMIN || currentUser.role === ROLES.MANAGER ? (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                        <Printer className="w-2.5 h-2.5" /> Can Print
                      </span>
                    ) : (
                      <span className="text-rose-600 dark:text-rose-400 flex items-center gap-0.5">
                        🔒 No Print
                      </span>
                    )}
                  </div>
                </div>
              </button>

              {/* Admin Profile Dropdown */}
              {showRoleMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowRoleMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-700/60 mb-3">
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-12 h-12 rounded-xl object-cover ring-2 ring-brand-500/30"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 dark:text-white text-sm truncate">
                          {currentUser.name}
                        </div>
                        <div className="text-xs text-brand-600 dark:text-brand-400 font-medium">
                          {currentUser.title}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">
                          {currentUser.email}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 mb-3">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Active Privileges
                      </div>
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-[11px]">
                        <Check className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Table Invoice Printing (Admin Master)</span>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-[11px]">
                        <Check className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Menu & Category Management</span>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-[11px]">
                        <Check className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Table & Dining Section Master</span>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-[11px]">
                        <Check className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Sales Reports & P&L Ledgers</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setShowRoleMenu(false);
                        logout();
                      }}
                      className="w-full p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 flex items-center justify-center gap-2 text-xs font-semibold border border-rose-200 dark:border-rose-900/40 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out of Station</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Direct Sign Out icon button */}
          <button
            onClick={logout}
            className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-slate-200 dark:border-slate-800 transition"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
