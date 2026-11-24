import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHotel } from '../../context/HotelContext';
import { DEMO_USERS } from '../../constants/initialData';
import {
  ShieldCheck,
  Printer,
  Lock,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Building2,
  CheckCircle2,
  KeyRound,
  Mail,
  Eye,
  EyeOff,
  UserCheck
} from 'lucide-react';

export const LoginPage = () => {
  const { login, quickLogin } = useAuth();
  const { hotelInfo } = useHotel();

  // The single authorized master credential
  const masterUser = DEMO_USERS[0];

  const [email, setEmail] = useState(masterUser?.email || 'admin@hotel.com');
  const [password, setPassword] = useState(masterUser?.password || 'admin');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    const result = login(email, password);
    if (!result.success) {
      setErrorMsg(result.message);
    }
  };

  const handleAutoFillAndLogin = () => {
    setEmail(masterUser.email);
    setPassword(masterUser.password);
    setErrorMsg('');
    quickLogin(masterUser.role);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      {/* Background ambient lighting decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-500/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 text-white shadow-xl shadow-brand-500/25 mb-3.5 border border-white/10">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-1.5 font-['Outfit']">
            {hotelInfo.name}
          </h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Hotel POS, Table-wise Ordering & Restricted Billing Suite
          </p>
        </div>

        {/* Access Policy Pill */}
        <div className="mb-6 bg-amber-950/40 border border-amber-500/30 rounded-xl p-3 flex items-center justify-center gap-2.5 text-amber-200 text-xs sm:text-sm text-center">
          <Printer className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>
            <strong className="text-amber-300 font-semibold">Strict Billing Security:</strong> Authorized Admin credentials can print invoices, edit rates, and manage accounts.
          </span>
        </div>

        {/* Central Auth Container */}
        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
          
          {/* Highlighted Single Official Credential Card */}
          <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-brand-950/50 via-slate-900/60 to-slate-900 border border-brand-500/30 shadow-inner">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center border border-brand-500/30">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-brand-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Official Master Login Credential
                  </div>
                  <div className="text-white text-sm font-bold">
                    {masterUser.name} &bull; <span className="text-amber-400 font-semibold text-xs">{masterUser.title}</span>
                  </div>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-950/70 text-emerald-300 border border-emerald-500/30 self-start sm:self-center">
                <CheckCircle2 className="w-3 h-3" />
                Full Access & Print Allowed
              </span>
            </div>

            {/* Credential Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3.5 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-700/60">
                <span className="text-slate-400 text-[11px] block">Username / Email:</span>
                <span className="font-mono text-white font-bold select-all">{masterUser.email}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-700/60">
                <span className="text-slate-400 text-[11px] block">Password:</span>
                <span className="font-mono text-amber-300 font-bold select-all">{masterUser.password}</span>
              </div>
            </div>

            {/* Quick 1-Click Login Button */}
            <button
              type="button"
              onClick={handleAutoFillAndLogin}
              className="mt-3.5 w-full py-2.5 px-4 rounded-xl bg-brand-600/30 hover:bg-brand-600/40 text-brand-200 border border-brand-500/40 font-semibold text-xs flex items-center justify-center gap-2 transition hover:text-white"
            >
              <UserCheck className="w-4 h-4 text-brand-400" />
              <span>1-Click Auto Fill & Sign In Directly</span>
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@hotel.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="admin"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-amber-600 hover:from-brand-500 hover:to-amber-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-600/30 transition transform active:scale-[0.99]"
            >
              <Lock className="w-4 h-4" />
              <span>Authorize & Enter Station</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </form>

          {/* Feature Access Guarantee */}
          <div className="pt-2 border-t border-slate-700/60 text-center">
            <p className="text-[11px] text-slate-400">
              Logged in station has full authority for Table POS, KOTs, Invoices, Pricing, Day/Month/Year Reports &amp; Profit/Loss Ledgers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
