import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHotel } from '../../context/HotelContext';
import { ROLES, ROLE_PERMISSIONS } from '../../constants/roles';
import {
  LayoutDashboard,
  Grid,
  UtensilsCrossed,
  Receipt,
  Settings,
  Printer,
  ShieldAlert,
  Flame,
  HelpCircle,
  BarChart3,
  Calculator
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { currentUser, isAuthorizedToPrint, isAuthorizedToManageMenu } = useAuth();
  const { tables, invoices } = useHotel();

  const occupiedTables = tables.filter((t) => t.status === 'occupied').length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      badge: null
    },
    {
      id: 'tables',
      label: 'Tables & POS',
      icon: <Grid className="w-5 h-5" />,
      badge: occupiedTables > 0 ? `${occupiedTables} Active` : null,
      badgeColor: 'bg-amber-500 text-white'
    },
    {
      id: 'menu',
      label: 'Menu & Pricing',
      icon: <UtensilsCrossed className="w-5 h-5" />,
      badge: !isAuthorizedToManageMenu ? 'View Only' : null,
      badgeColor: 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
    },
    {
      id: 'invoices',
      label: 'Invoices Ledger',
      icon: <Receipt className="w-5 h-5" />,
      badge: `${invoices.length}`,
      badgeColor: 'bg-brand-100 text-brand-800 dark:bg-brand-950/60 dark:text-brand-300'
    },
    {
      id: 'reports',
      label: 'Sales Reports',
      icon: <BarChart3 className="w-5 h-5" />,
      badge: 'Day/Mo/Yr',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
    },
    {
      id: 'accounts',
      label: 'Accounts & P&L',
      icon: <Calculator className="w-5 h-5" />,
      badge: 'P&L',
      badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
    },
    {
      id: 'settings',
      label: 'Hotel Settings',
      icon: <Settings className="w-5 h-5" />,
      badge: currentUser?.role !== ROLES.ADMIN ? 'Admin' : null,
      badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
    }
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between p-4 flex-shrink-0 transition">
      <div className="space-y-6">
        {/* Navigation list */}
        <nav className="space-y-1.5">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 px-3 mb-2">
            Main Operations
          </div>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}>
                    {item.icon}
                  </div>
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Print Authority Status Widget */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
          <div className="flex items-center gap-2 mb-2">
            <div
              className={`p-1.5 rounded-lg ${
                isAuthorizedToPrint
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
              }`}
            >
              {isAuthorizedToPrint ? <Printer className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                {isAuthorizedToPrint ? 'Print Authorized' : 'Print Blocked'}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                Current Role: <strong className="font-semibold text-brand-600 dark:text-brand-400">{currentUser?.role}</strong>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            {isAuthorizedToPrint
              ? 'You have permission to print official table invoices.'
              : 'Waiters & Cashiers cannot print table invoices without a Manager.'}
          </p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500 space-y-1">
        <div className="flex items-center justify-between">
          <span>Hotel POS Engine</span>
          <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400">
            v2.4 LTS
          </span>
        </div>
        <div className="text-[10px] text-slate-400">
          Role-Based Access Control Enabled
        </div>
      </div>
    </aside>
  );
};
