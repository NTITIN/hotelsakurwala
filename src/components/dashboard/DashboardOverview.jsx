import React from 'react';
import { useHotel } from '../../context/HotelContext';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../constants/roles';
import {
  DollarSign,
  TrendingUp,
  Users,
  UtensilsCrossed,
  Receipt,
  Printer,
  Plus,
  ArrowUpRight,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  CheckCircle2,
  Edit2,
  Lock,
  BarChart3,
  Calculator
} from 'lucide-react';

export const DashboardOverview = ({
  setActiveTab,
  onSelectTable,
  onOpenAddMenu,
  onEditInvoice,
  onReprintInvoice
}) => {
  const { hotelInfo, tables, activeOrders, invoices, menu, calculateBillTotals } = useHotel();
  const { currentUser, isAuthorizedToPrint, isAuthorizedToManageMenu } = useAuth();

  // Metrics calculations
  const occupiedTables = tables.filter((t) => t.status === 'occupied');
  const availableTables = tables.filter((t) => t.status === 'available');
  const occupancyRate = Math.round((occupiedTables.length / (tables.length || 1)) * 100);

  // Total revenue from settled invoices
  const totalSettledRevenue = invoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);

  // Active in-progress revenue from occupied tables
  const activeUnsettledRevenue = Object.values(activeOrders).reduce((sum, order) => {
    const totals = calculateBillTotals(order);
    return sum + (totals.grandTotal || 0);
  }, 0);

  const averageBillValue = invoices.length > 0 ? Math.round(totalSettledRevenue / invoices.length) : 0;

  // Category sales breakdown
  const categoryCount = {};
  invoices.forEach((inv) => {
    inv.items.forEach((item) => {
      const menuItem = menu.find((m) => m.name === item.name);
      const cat = menuItem?.category || 'General';
      categoryCount[cat] = (categoryCount[cat] || 0) + item.amount;
    });
  });

  const categoryBreakdown = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome with Quick Actions */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-brand-950 p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-slate-700/60">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-semibold backdrop-blur-md mb-3 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Live Operations Console
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-['Outfit']">
              Welcome back, {currentUser?.name}!
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Logged in as <strong className="text-amber-300 font-semibold">{currentUser?.title}</strong> ({currentUser?.role}).
              {isAuthorizedToPrint ? (
                <span className="text-emerald-300 ml-1">
                  You are authorized to generate, edit, and print table invoices.
                </span>
              ) : (
                <span className="text-rose-300 ml-1">
                  Table invoice printing and editing are restricted to Admin & Manager roles.
                </span>
              )}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('tables')}
              className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-brand-600/30 transition transform active:scale-95"
            >
              <Users className="w-4 h-4" />
              <span>Floor POS & Tables</span>
            </button>

            {isAuthorizedToManageMenu && (
              <button
                onClick={onOpenAddMenu}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm backdrop-blur-md border border-white/15 flex items-center gap-2 transition"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Add Menu Item</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('invoices')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm backdrop-blur-md border border-white/15 flex items-center gap-2 transition"
            >
              <Receipt className="w-4 h-4 text-emerald-400" />
              <span>All Invoices</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm backdrop-blur-md border border-white/15 flex items-center gap-2 transition"
            >
              <BarChart3 className="w-4 h-4 text-amber-400" />
              <span>Sales Reports</span>
            </button>

            <button
              onClick={() => setActiveTab('accounts')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm backdrop-blur-md border border-white/15 flex items-center gap-2 transition"
            >
              <Calculator className="w-4 h-4 text-emerald-300" />
              <span>Accounts & P&L</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Settled Revenue */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Settled Revenue
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              {hotelInfo.currency}
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
            {hotelInfo.currency}{totalSettledRevenue.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{invoices.length} Paid Invoices Recorded</span>
          </div>
        </div>

        {/* Live Active Orders Value */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Active Dining Value
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
            {hotelInfo.currency}{activeUnsettledRevenue.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-600 dark:text-amber-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span>{occupiedTables.length} Tables currently dining</span>
          </div>
        </div>

        {/* Table Occupancy Rate */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Table Occupancy
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
            {occupancyRate}%
          </div>
          <div className="mt-2">
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-brand-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${occupancyRate}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>{occupiedTables.length} Occupied</span>
              <span>{availableTables.length} Available</span>
            </div>
          </div>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Avg Order Value
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
            {hotelInfo.currency}{averageBillValue.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-purple-600 dark:text-purple-400 font-medium">
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>{menu.length} Items on Active Menu</span>
          </div>
        </div>
      </div>

      {/* Floor Matrix & Recent Invoices Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Live Table Floor Matrix */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-lg font-['Outfit']">
                Live Table Status
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click any table to open the order & billing POS
              </p>
            </div>
            <button
              onClick={() => setActiveTab('tables')}
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
            >
              <span>Full Floor View</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {tables.slice(0, 8).map((table) => {
              const isOccupied = table.status === 'occupied';
              const order = table.orderId ? activeOrders[table.orderId] : null;
              const totals = order ? calculateBillTotals(order) : null;

              return (
                <button
                  key={table.id}
                  onClick={() => {
                    onSelectTable(table);
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition transform hover:scale-[1.02] flex flex-col justify-between min-h-[110px] ${
                    isOccupied
                      ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700/60 shadow-sm'
                      : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-brand-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {table.name}
                    </span>
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isOccupied ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                      }`}
                    />
                  </div>

                  <div className="my-2">
                    {isOccupied && order ? (
                      <div>
                        <div className="font-extrabold text-amber-700 dark:text-amber-400 text-base font-['Outfit']">
                          {hotelInfo.currency}{totals?.grandTotal || 0}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {order.guestName || `${order.items.length} items`}
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 font-medium">
                        Vacant • {table.capacity} seats
                      </div>
                    )}
                  </div>

                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    {table.section}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Available ({availableTables.length})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Occupied ({occupiedTables.length})
              </span>
            </div>
            <span>Total Tables: {tables.length}</span>
          </div>
        </div>

        {/* Right Column (5 cols): Revenue by Category & Print Rules */}
        <div className="lg:col-span-5 space-y-6">
          {/* Print Authority Card */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Table Invoice Printing Policy
                </h3>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isAuthorizedToPrint
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                }`}
              >
                {isAuthorizedToPrint ? 'YOU CAN PRINT' : 'RESTRICTED'}
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
              Per hotel compliance rules, <strong className="text-slate-800 dark:text-slate-200">only Admins and Managers</strong> are authorized to trigger print commands for table bills and tax invoices.
            </p>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Admin (Vikramaditya Roy):</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Print & Edit Authorized</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Manager (Priya Nair):</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Print & Edit Authorized</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Waiter (Rohan Deshmukh):</span>
                <span className="text-rose-600 dark:text-rose-400 font-semibold">Blocked (PIN Required)</span>
              </div>
            </div>
          </div>

          {/* Category Revenue Breakdown */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4">
              Top Selling Revenue Categories
            </h3>

            <div className="space-y-3.5">
              {categoryBreakdown.map(([catName, amount], index) => {
                const percent = Math.round((amount / (totalSettledRevenue || 1)) * 100);
                return (
                  <div key={catName}>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-700 dark:text-slate-300">{catName}</span>
                      <span className="text-slate-900 dark:text-white">
                        {hotelInfo.currency}{amount.toLocaleString()} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-brand-600 to-amber-500 h-2 rounded-full"
                        style={{ width: `${Math.min(100, percent)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Settled Invoices Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white text-lg font-['Outfit']">
              Recent Table Invoices
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Audit log of printed, settled, and revised bills
            </p>
          </div>
          <button
            onClick={() => setActiveTab('invoices')}
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            <span>View All ({invoices.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3 pl-2">Invoice #</th>
                <th className="pb-3">Table</th>
                <th className="pb-3">Guest</th>
                <th className="pb-3">Printed By</th>
                <th className="pb-3">Payment</th>
                <th className="pb-3 text-right">Amount</th>
                <th className="pb-3 text-center">Status</th>
                <th className="pb-3 pr-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {invoices.slice(0, 5).map((inv) => (
                <tr key={inv.invoiceNumber} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3.5 pl-2 font-mono font-bold text-slate-900 dark:text-white">
                    <div className="flex items-center gap-1.5">
                      <span>{inv.invoiceNumber}</span>
                      {inv.isEdited && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300">
                          REV
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 font-medium text-slate-800 dark:text-slate-200">
                    Table {inv.tableNumber}
                    <span className="text-[10px] text-slate-400 block">{inv.section}</span>
                  </td>
                  <td className="py-3.5 text-slate-600 dark:text-slate-400">
                    {inv.guestName}
                  </td>
                  <td className="py-3.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                      <Printer className="w-3 h-3 text-brand-500" />
                      {inv.printedBy}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {inv.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3.5 text-right font-extrabold text-slate-900 dark:text-white text-sm font-['Outfit']">
                    {hotelInfo.currency}{inv.grandTotal.toLocaleString()}
                  </td>
                  <td className="py-3.5 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                      <CheckCircle2 className="w-3 h-3" />
                      PAID
                    </span>
                  </td>
                  <td className="py-3.5 pr-2 text-right">
                    <div className="inline-flex items-center gap-1 justify-end">
                      {onEditInvoice && (
                        <button
                          onClick={() => onEditInvoice(inv)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition"
                          title="Edit this invoice"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onReprintInvoice && (
                        <button
                          onClick={() => onReprintInvoice(inv, currentUser)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/40 transition"
                          title="Print receipt"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
