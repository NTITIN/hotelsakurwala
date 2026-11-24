import React, { useState, useMemo } from 'react';
import { useHotel } from '../../context/HotelContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Wallet,
  Calculator,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
  Edit2,
  Trash2,
  FileSpreadsheet,
  Printer,
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Building2,
  CreditCard,
  QrCode,
  Banknote,
  PieChart,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { AddEditLedgerModal } from './AddEditLedgerModal';

export const AccountsAndLedgers = () => {
  const { invoices, ledgerEntries, deleteLedgerEntry, hotelInfo } = useHotel();
  const { currentUser, isAuthorizedToPrint } = useAuth();
  const { addToast } = useToast();

  // Active view: 'pnl' (Profit & Loss) or 'ledger' (General Ledger Book)
  const [activeSubTab, setActiveSubTab] = useState('pnl');

  // Period filter for P&L: 'today', 'this_month', 'last_month', 'this_year', 'all'
  const [period, setPeriod] = useState('this_month');

  // Ledger filter state
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerTypeFilter, setLedgerTypeFilter] = useState('ALL'); // ALL, COGS, OPEX, REVENUE
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [entryToEdit, setEntryToEdit] = useState(null);

  // Helper date boundaries
  const todayStr = new Date().toISOString().slice(0, 10);
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // FILTERED INVOICES & LEDGER ENTRIES FOR P&L CALCULATION
  const { pnlInvoices, pnlLedgerEntries } = useMemo(() => {
    let filteredInvs = invoices;
    let filteredVouchers = ledgerEntries;

    if (period === 'today') {
      filteredInvs = invoices.filter((inv) => {
        const d = new Date(inv.settledAt || inv.printedAt).toISOString().slice(0, 10);
        return d === todayStr;
      });
      filteredVouchers = ledgerEntries.filter((v) => v.date === todayStr);
    } else if (period === 'this_month') {
      filteredInvs = invoices.filter((inv) => {
        const d = new Date(inv.settledAt || inv.printedAt);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });
      filteredVouchers = ledgerEntries.filter((v) => {
        const d = new Date(v.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });
    } else if (period === 'last_month') {
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      filteredInvs = invoices.filter((inv) => {
        const d = new Date(inv.settledAt || inv.printedAt);
        return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
      });
      filteredVouchers = ledgerEntries.filter((v) => {
        const d = new Date(v.date);
        return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
      });
    } else if (period === 'this_year') {
      filteredInvs = invoices.filter((inv) => {
        const d = new Date(inv.settledAt || inv.printedAt);
        return d.getFullYear() === currentYear;
      });
      filteredVouchers = ledgerEntries.filter((v) => {
        const d = new Date(v.date);
        return d.getFullYear() === currentYear;
      });
    }

    return { pnlInvoices: filteredInvs, pnlLedgerEntries: filteredVouchers };
  }, [invoices, ledgerEntries, period, todayStr, currentMonth, currentYear]);

  // PROFIT & LOSS MATHEMATICAL COMPUTATIONS
  const pnlSummary = useMemo(() => {
    // 1. REVENUE
    const diningGrossSales = pnlInvoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
    const diningNetSales = pnlInvoices.reduce((sum, inv) => sum + (inv.subtotal || 0), 0);
    const serviceCharges = pnlInvoices.reduce((sum, inv) => sum + (inv.serviceCharge || 0), 0);
    const gstCollected = pnlInvoices.reduce((sum, inv) => sum + ((inv.cgst || 0) + (inv.sgst || 0)), 0);
    const nonDiningIncome = pnlLedgerEntries
      .filter((v) => v.type === 'INCOME')
      .reduce((sum, v) => sum + v.amount, 0);

    const totalOperatingRevenue = diningNetSales + serviceCharges + nonDiningIncome;

    // 2. COST OF GOODS SOLD (COGS)
    const cogsItems = pnlLedgerEntries.filter((v) => v.type === 'EXPENSE' && v.costType === 'COGS');
    const totalCOGS = cogsItems.reduce((sum, v) => sum + v.amount, 0);

    // Breakdown by COGS categories
    const cogsBreakdown = {};
    cogsItems.forEach((item) => {
      cogsBreakdown[item.category] = (cogsBreakdown[item.category] || 0) + item.amount;
    });

    // 3. GROSS PROFIT
    const grossProfit = totalOperatingRevenue - totalCOGS;
    const grossMargin = totalOperatingRevenue > 0 ? ((grossProfit / totalOperatingRevenue) * 100).toFixed(1) : 0;

    // 4. OPERATING EXPENSES (OPEX)
    const opexItems = pnlLedgerEntries.filter((v) => v.type === 'EXPENSE' && v.costType === 'OPEX');
    const totalOPEX = opexItems.reduce((sum, v) => sum + v.amount, 0);

    // Breakdown by OPEX categories
    const opexBreakdown = {};
    opexItems.forEach((item) => {
      opexBreakdown[item.category] = (opexBreakdown[item.category] || 0) + item.amount;
    });

    // 5. NET PROFIT / LOSS
    const netProfit = grossProfit - totalOPEX;
    const netMargin = totalOperatingRevenue > 0 ? ((netProfit / totalOperatingRevenue) * 100).toFixed(1) : 0;
    const isProfit = netProfit >= 0;

    return {
      diningGrossSales,
      diningNetSales,
      serviceCharges,
      gstCollected,
      nonDiningIncome,
      totalOperatingRevenue,
      totalCOGS,
      cogsBreakdown,
      grossProfit,
      grossMargin,
      totalOPEX,
      opexBreakdown,
      netProfit,
      netMargin,
      isProfit,
      invoicesCount: pnlInvoices.length,
      vouchersCount: pnlLedgerEntries.length
    };
  }, [pnlInvoices, pnlLedgerEntries]);

  // FILTERED LEDGER ENTRIES FOR GENERAL LEDGER VIEW
  const filteredLedgerEntries = useMemo(() => {
    return ledgerEntries.filter((entry) => {
      const matchesSearch =
        entry.voucherNumber?.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
        entry.title?.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
        entry.vendorName?.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
        entry.category?.toLowerCase().includes(ledgerSearch.toLowerCase());

      const matchesType =
        ledgerTypeFilter === 'ALL' ||
        entry.costType === ledgerTypeFilter ||
        (ledgerTypeFilter === 'INCOME' && entry.type === 'INCOME');

      return matchesSearch && matchesType;
    });
  }, [ledgerEntries, ledgerSearch, ledgerTypeFilter]);

  // EXPORT P&L TO CSV
  const handleExportPnLCSV = () => {
    const headers = ['Financial Category', 'Account Ledger / Head', `Amount (${hotelInfo.currency})`];
    const rows = [
      ['REVENUE', 'Restaurant Dining Sales (Net of Tax)', pnlSummary.diningNetSales],
      ['REVENUE', 'Service Charges Collected', pnlSummary.serviceCharges],
      ['REVENUE', 'Non-Dining Events / Catering Income', pnlSummary.nonDiningIncome],
      ['TOTAL REVENUE', 'Gross Operating Revenue [A]', pnlSummary.totalOperatingRevenue],
      ['COGS', 'Cost of Goods Sold [B]', pnlSummary.totalCOGS],
      ...Object.entries(pnlSummary.cogsBreakdown).map(([cat, amt]) => ['COGS DETAIL', cat, amt]),
      ['GROSS PROFIT', 'Gross Profit [C = A - B]', pnlSummary.grossProfit],
      ['GROSS MARGIN', 'Gross Margin %', `${pnlSummary.grossMargin}%`],
      ['OPEX', 'Total Operating Expenses [D]', pnlSummary.totalOPEX],
      ...Object.entries(pnlSummary.opexBreakdown).map(([cat, amt]) => ['OPEX DETAIL', cat, amt]),
      ['NET PROFIT', 'Net Operating Profit / Loss [E = C - D]', pnlSummary.netProfit],
      ['NET MARGIN', 'Net Profit Margin %', `${pnlSummary.netMargin}%`]
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => `"${e[0]}","${e[1]}",${e[2]}`)].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `profit_and_loss_${period}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('Profit & Loss statement exported to CSV.', 'success', 'Export Complete');
  };

  // EXPORT LEDGER TO CSV
  const handleExportLedgerCSV = () => {
    const headers = [
      'Voucher #',
      'Date',
      'Type',
      'Account Category',
      'Cost Classification',
      'Title / Description',
      'Vendor / Payee',
      'Payment Method',
      'Amount',
      'Recorded By'
    ];

    const rows = filteredLedgerEntries.map((e) => [
      e.voucherNumber,
      e.date,
      e.type,
      `"${e.category}"`,
      e.costType,
      `"${e.title}"`,
      `"${e.vendorName}"`,
      e.paymentMethod,
      e.amount,
      `"${e.recordedBy}"`
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `general_ledger_vouchers_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('General ledger exported to CSV.', 'success', 'Export Complete');
  };

  const handlePrintPnL = () => {
    addToast('Opening print preview for official P&L statement...', 'info', 'Printing');
    window.print();
  };

  const handleEditLedger = (entry) => {
    setEntryToEdit(entry);
    setIsAddEditModalOpen(true);
  };

  const handleAddNewLedger = () => {
    setEntryToEdit(null);
    setIsAddEditModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Official Print Header (Visible only when printing) */}
      <div className="hidden print:block text-center border-b border-slate-300 pb-4 mb-4">
        <h1 className="text-xl font-bold uppercase">{hotelInfo.name}</h1>
        <p className="text-xs text-slate-600">{hotelInfo.address} • GSTIN: {hotelInfo.gstin}</p>
        <h2 className="text-sm font-bold mt-2 uppercase tracking-wider text-slate-800">
          PROFIT & LOSS FINANCIAL STATEMENT
        </h2>
        <p className="text-xs text-slate-500">
          Period: {period.toUpperCase().replace('_', ' ')} • Generated by: {currentUser?.name} ({currentUser?.role})
        </p>
      </div>

      {/* Main Top Banner & Sub-tab Switcher */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-['Outfit']">
              Accounts & Ledgers
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Profit & Loss Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Calculate Gross & Net Profit, COGS (Food Cost), Operating Overheads, and General Ledgers
          </p>
        </div>

        {/* View Switcher: P&L vs General Ledger */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveSubTab('pnl')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeSubTab === 'pnl'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Calculator className="w-3.5 h-3.5 text-brand-500" />
              <span>Profit & Loss</span>
            </button>

            <button
              onClick={() => setActiveSubTab('ledger')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeSubTab === 'ledger'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Wallet className="w-3.5 h-3.5 text-amber-500" />
              <span>General Ledger ({ledgerEntries.length})</span>
            </button>
          </div>

          <button
            onClick={handleAddNewLedger}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md shadow-brand-600/30 transition transform active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Record Expense</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: PROFIT & LOSS STATEMENT */}
      {activeSubTab === 'pnl' && (
        <div className="space-y-6">
          {/* Period Selector & Export Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
              <span className="text-xs font-semibold text-slate-500">Period:</span>
              {[
                { id: 'today', label: 'Today' },
                { id: 'this_month', label: 'This Month (Nov 2026)' },
                { id: 'last_month', label: 'Last Month (Oct 2026)' },
                { id: 'this_year', label: 'Year 2026' },
                { id: 'all', label: 'All Time' }
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPeriod(p.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    period === p.id
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={handleExportPnLCSV}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={handlePrintPnL}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
              >
                <Printer className="w-3.5 h-3.5 text-brand-400" />
                <span>Print P&L</span>
              </button>
            </div>
          </div>

          {/* KPI Stat Cards: Revenue, COGS, Gross Profit, Net Profit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Revenue */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Operating Revenue [A]
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
                {hotelInfo.currency}{pnlSummary.totalOperatingRevenue.toLocaleString()}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Dining Sales + Service Charges
              </div>
            </div>

            {/* Cost of Goods Sold (COGS) */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Cost of Goods Sold (COGS) [B]
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 font-['Outfit']">
                {hotelInfo.currency}{pnlSummary.totalCOGS.toLocaleString()}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Food & Beverage Raw Stock
              </div>
            </div>

            {/* Gross Profit */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Gross Profit [C = A - B]
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400 font-['Outfit']">
                {hotelInfo.currency}{pnlSummary.grossProfit.toLocaleString()}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-semibold">
                Gross Margin: {pnlSummary.grossMargin}%
              </div>
            </div>

            {/* Net Operating Profit / Loss */}
            <div
              className={`p-5 rounded-2xl border shadow-xs transition ${
                pnlSummary.isProfit
                  ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                  : 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Net Profit / (Loss) [E]
                </span>
                {pnlSummary.isProfit ? (
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-rose-600" />
                )}
              </div>
              <div
                className={`text-2xl sm:text-3xl font-extrabold font-['Outfit'] ${
                  pnlSummary.isProfit ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'
                }`}
              >
                {hotelInfo.currency}{pnlSummary.netProfit.toLocaleString()}
              </div>
              <div
                className={`text-xs font-bold mt-1 ${
                  pnlSummary.isProfit ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
                }`}
              >
                Net Margin: {pnlSummary.netMargin}% {pnlSummary.isProfit ? '(Profitable)' : '(Net Loss)'}
              </div>
            </div>
          </div>

          {/* Visual Profitability Distribution Bar */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm no-print">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-2">
              Financial Breakdown & Cost Structure (% of Total Operating Revenue)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Benchmark: Healthy restaurants aim for Food Cost (COGS) below 35% and Net Margin above 25%
            </p>

            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-2xl h-6 flex overflow-hidden p-1 gap-1">
              {/* COGS Segment */}
              <div
                className="bg-amber-500 rounded-lg flex items-center justify-center text-[10px] font-extrabold text-white transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    pnlSummary.totalOperatingRevenue > 0
                      ? (pnlSummary.totalCOGS / pnlSummary.totalOperatingRevenue) * 100
                      : 35
                  )}%`
                }}
                title={`Food & Beverage COGS: ${hotelInfo.currency}${pnlSummary.totalCOGS}`}
              >
                COGS
              </div>

              {/* OPEX Segment */}
              <div
                className="bg-purple-500 rounded-lg flex items-center justify-center text-[10px] font-extrabold text-white transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    pnlSummary.totalOperatingRevenue > 0
                      ? (pnlSummary.totalOPEX / pnlSummary.totalOperatingRevenue) * 100
                      : 30
                  )}%`
                }}
                title={`Operating Expenses: ${hotelInfo.currency}${pnlSummary.totalOPEX}`}
              >
                OPEX
              </div>

              {/* Net Profit Segment */}
              {pnlSummary.isProfit && (
                <div
                  className="bg-emerald-500 rounded-lg flex items-center justify-center text-[10px] font-extrabold text-white transition-all"
                  style={{
                    width: `${Math.min(100, Number(pnlSummary.netMargin) || 35)}%`
                  }}
                  title={`Net Profit: ${hotelInfo.currency}${pnlSummary.netProfit}`}
                >
                  PROFIT
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                COGS / Raw Food Cost: <strong className="text-slate-800 dark:text-white">{hotelInfo.currency}{pnlSummary.totalCOGS.toLocaleString()}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                Operating Overhead (OPEX): <strong className="text-slate-800 dark:text-white">{hotelInfo.currency}{pnlSummary.totalOPEX.toLocaleString()}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Net Operating Profit: <strong className="text-emerald-600">{hotelInfo.currency}{pnlSummary.netProfit.toLocaleString()}</strong>
              </span>
            </div>
          </div>

          {/* Structured Income Statement Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base font-['Outfit']">
                  Income Statement & Ledger Account Breakdown
                </h3>
                <p className="text-xs text-slate-500">
                  Standardized Hospitality Financial Reporting format
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                {period.toUpperCase().replace('_', ' ')}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider bg-slate-50/40 dark:bg-slate-800/20">
                    <th className="py-3 pl-6">Accounting Head / Line Item</th>
                    <th className="py-3 px-3">Classification</th>
                    <th className="py-3 pr-6 text-right">Amount ({hotelInfo.currency})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {/* SECTION 1: REVENUE */}
                  <tr className="bg-slate-50/80 dark:bg-slate-800/50 font-bold text-slate-900 dark:text-white">
                    <td colSpan={2} className="py-2.5 pl-6">
                      1. OPERATING REVENUE & DINING INCOME
                    </td>
                    <td className="py-2.5 pr-6 text-right"></td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="py-2.5 pl-10 text-slate-700 dark:text-slate-300">
                      Restaurant Dining Sales (Food & Beverages Net)
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">Dining Invoices</td>
                    <td className="py-2.5 pr-6 text-right font-semibold text-slate-900 dark:text-white">
                      {hotelInfo.currency}{pnlSummary.diningNetSales.toLocaleString()}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="py-2.5 pl-10 text-slate-700 dark:text-slate-300">
                      Service Charges Collected
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">Service Fee</td>
                    <td className="py-2.5 pr-6 text-right font-semibold text-slate-900 dark:text-white">
                      {hotelInfo.currency}{pnlSummary.serviceCharges.toLocaleString()}
                    </td>
                  </tr>
                  {pnlSummary.nonDiningIncome > 0 && (
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="py-2.5 pl-10 text-slate-700 dark:text-slate-300">
                        Catering, Banquet Hall & Event Reservations
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">Event Ledger</td>
                      <td className="py-2.5 pr-6 text-right font-semibold text-slate-900 dark:text-white">
                        {hotelInfo.currency}{pnlSummary.nonDiningIncome.toLocaleString()}
                      </td>
                    </tr>
                  )}
                  <tr className="bg-emerald-50/40 dark:bg-emerald-950/20 font-bold text-slate-900 dark:text-white">
                    <td className="py-3 pl-6">TOTAL OPERATING REVENUE [A]</td>
                    <td className="py-3 px-3 text-emerald-600">Total Turnover</td>
                    <td className="py-3 pr-6 text-right text-sm font-extrabold text-emerald-700 dark:text-emerald-400 font-['Outfit']">
                      {hotelInfo.currency}{pnlSummary.totalOperatingRevenue.toLocaleString()}
                    </td>
                  </tr>

                  {/* SECTION 2: COGS */}
                  <tr className="bg-slate-50/80 dark:bg-slate-800/50 font-bold text-slate-900 dark:text-white">
                    <td colSpan={2} className="py-2.5 pl-6">
                      2. COST OF GOODS SOLD (DIRECT KITCHEN PROCUREMENT)
                    </td>
                    <td className="py-2.5 pr-6 text-right"></td>
                  </tr>
                  {Object.entries(pnlSummary.cogsBreakdown).map(([catName, amt]) => (
                    <tr key={catName} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="py-2 pl-10 text-slate-700 dark:text-slate-300">{catName}</td>
                      <td className="py-2 px-3 text-slate-500">Direct COGS</td>
                      <td className="py-2 pr-6 text-right font-semibold text-slate-900 dark:text-white">
                        {hotelInfo.currency}{amt.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-amber-50/40 dark:bg-amber-950/20 font-bold text-slate-900 dark:text-white">
                    <td className="py-3 pl-6">TOTAL COST OF GOODS SOLD [B]</td>
                    <td className="py-3 px-3 text-amber-600">Total COGS</td>
                    <td className="py-3 pr-6 text-right text-sm font-extrabold text-amber-700 dark:text-amber-400 font-['Outfit']">
                      {hotelInfo.currency}{pnlSummary.totalCOGS.toLocaleString()}
                    </td>
                  </tr>

                  {/* SECTION 3: GROSS PROFIT */}
                  <tr className="bg-blue-50/50 dark:bg-blue-950/30 font-extrabold text-blue-900 dark:text-blue-300 border-y-2 border-blue-200 dark:border-blue-800">
                    <td className="py-3 pl-6 text-sm">GROSS PROFIT [C = A - B]</td>
                    <td className="py-3 px-3">Margin: {pnlSummary.grossMargin}%</td>
                    <td className="py-3 pr-6 text-right text-base font-['Outfit']">
                      {hotelInfo.currency}{pnlSummary.grossProfit.toLocaleString()}
                    </td>
                  </tr>

                  {/* SECTION 4: OPEX */}
                  <tr className="bg-slate-50/80 dark:bg-slate-800/50 font-bold text-slate-900 dark:text-white">
                    <td colSpan={2} className="py-2.5 pl-6">
                      3. OPERATING OVERHEAD EXPENSES (OPEX)
                    </td>
                    <td className="py-2.5 pr-6 text-right"></td>
                  </tr>
                  {Object.entries(pnlSummary.opexBreakdown).map(([catName, amt]) => (
                    <tr key={catName} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="py-2 pl-10 text-slate-700 dark:text-slate-300">{catName}</td>
                      <td className="py-2 px-3 text-slate-500">Operating Overhead</td>
                      <td className="py-2 pr-6 text-right font-semibold text-slate-900 dark:text-white">
                        {hotelInfo.currency}{amt.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-purple-50/40 dark:bg-purple-950/20 font-bold text-slate-900 dark:text-white">
                    <td className="py-3 pl-6">TOTAL OPERATING EXPENSES [D]</td>
                    <td className="py-3 px-3 text-purple-600">Total OPEX</td>
                    <td className="py-3 pr-6 text-right text-sm font-extrabold text-purple-700 dark:text-purple-400 font-['Outfit']">
                      {hotelInfo.currency}{pnlSummary.totalOPEX.toLocaleString()}
                    </td>
                  </tr>

                  {/* SECTION 5: NET PROFIT / LOSS */}
                  <tr
                    className={`font-extrabold text-base border-t-4 ${
                      pnlSummary.isProfit
                        ? 'bg-emerald-100/60 dark:bg-emerald-950/50 text-emerald-950 dark:text-emerald-200 border-emerald-500'
                        : 'bg-rose-100/60 dark:bg-rose-950/50 text-rose-950 dark:text-rose-200 border-rose-500'
                    }`}
                  >
                    <td className="py-4 pl-6">
                      NET OPERATING PROFIT / (LOSS) [E = C - D]
                    </td>
                    <td className="py-4 px-3 font-semibold">
                      Net Margin: {pnlSummary.netMargin}%
                    </td>
                    <td className="py-4 pr-6 text-right text-xl font-['Outfit']">
                      {hotelInfo.currency}{pnlSummary.netProfit.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Statutory Tax Note */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
              <span>
                GST Tax Collected (Pass-through liability): <strong className="text-slate-700 dark:text-slate-300">{hotelInfo.currency}{pnlSummary.gstCollected.toFixed(2)}</strong> (CGST: {(pnlSummary.gstCollected / 2).toFixed(2)} + SGST: {(pnlSummary.gstCollected / 2).toFixed(2)})
              </span>
              <span>Based on {pnlSummary.invoicesCount} settled invoices & {pnlSummary.vouchersCount} ledger vouchers</span>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: GENERAL EXPENSE & INCOME LEDGER BOOK */}
      {activeSubTab === 'ledger' && (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={ledgerSearch}
                onChange={(e) => setLedgerSearch(e.target.value)}
                placeholder="Search by Voucher #, Description, or Vendor..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Classification Filter Tabs */}
            <div className="flex items-center gap-1.5 self-end md:self-auto overflow-x-auto no-scrollbar">
              {[
                { id: 'ALL', label: 'All Vouchers' },
                { id: 'COGS', label: 'Food COGS' },
                { id: 'OPEX', label: 'Operating OPEX' },
                { id: 'INCOME', label: 'Non-Dining Income' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setLedgerTypeFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    ledgerTypeFilter === f.id
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}

              <button
                onClick={handleExportLedgerCSV}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1 ml-2 transition"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3.5 pl-6">Voucher #</th>
                    <th className="py-3.5 px-3">Date & Time</th>
                    <th className="py-3.5 px-3">Description & Vendor</th>
                    <th className="py-3.5 px-3">Account Category</th>
                    <th className="py-3.5 px-3">Cost Type</th>
                    <th className="py-3.5 px-3">Payment</th>
                    <th className="py-3.5 px-3 text-right">Amount</th>
                    <th className="py-3.5 pr-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredLedgerEntries.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <Wallet className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                        <p className="font-semibold text-slate-600 dark:text-slate-300">No vouchers match your filter</p>
                      </td>
                    </tr>
                  ) : (
                    filteredLedgerEntries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3.5 pl-6 font-mono font-bold text-slate-900 dark:text-white">
                          {entry.voucherNumber}
                        </td>
                        <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300">
                          {entry.date}
                          <span className="text-[10px] text-slate-400 block">{entry.time}</span>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="font-bold text-slate-900 dark:text-white">{entry.title}</div>
                          <div className="text-[11px] text-slate-500">{entry.vendorName}</div>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                            {entry.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              entry.type === 'INCOME'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : entry.costType === 'COGS'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                : 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                            }`}
                          >
                            {entry.type === 'INCOME' ? 'REVENUE' : entry.costType}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {entry.paymentMethod}
                          </span>
                        </td>
                        <td
                          className={`py-3.5 px-3 text-right font-extrabold text-sm font-['Outfit'] ${
                            entry.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {entry.type === 'INCOME' ? '+' : '-'}{hotelInfo.currency}{entry.amount.toLocaleString()}
                        </td>
                        <td className="py-3.5 pr-6 text-center">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => handleEditLedger(entry)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition"
                              title="Edit voucher"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete voucher #${entry.voucherNumber}?`)) {
                                  deleteLedgerEntry(entry.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                              title="Delete voucher"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Ledger Voucher Modal */}
      <AddEditLedgerModal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        entryToEdit={entryToEdit}
      />
    </div>
  );
};
