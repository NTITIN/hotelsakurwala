import React, { useState, useMemo } from 'react';
import { useHotel } from '../../context/HotelContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Calendar,
  BarChart3,
  TrendingUp,
  FileSpreadsheet,
  Printer,
  DollarSign,
  Receipt,
  Users,
  CreditCard,
  QrCode,
  Banknote,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  PieChart
} from 'lucide-react';

export const SalesReports = ({ onReprintInvoice }) => {
  const { invoices, hotelInfo } = useHotel();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  // Active view: 'day', 'month', 'year'
  const [reportType, setReportType] = useState('day');

  // Today's date string YYYY-MM-DD
  const todayStr = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // Month selector (0-indexed 0 = Jan, 10 = Nov)
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const monthsList = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Available years from invoices
  const availableYears = useMemo(() => {
    const years = new Set(
      invoices.map((inv) => new Date(inv.settledAt || inv.printedAt).getFullYear())
    );
    years.add(currentYear);
    return Array.from(years).sort((a, b) => b - a);
  }, [invoices, currentYear]);

  // FILTERED INVOICES BASED ON REPORT TYPE
  const filteredData = useMemo(() => {
    if (reportType === 'day') {
      return invoices.filter((inv) => {
        const d = new Date(inv.settledAt || inv.printedAt);
        const invDateStr = d.toISOString().slice(0, 10);
        return invDateStr === selectedDate;
      });
    }

    if (reportType === 'month') {
      return invoices.filter((inv) => {
        const d = new Date(inv.settledAt || inv.printedAt);
        return d.getMonth() === Number(selectedMonth) && d.getFullYear() === Number(selectedYear);
      });
    }

    if (reportType === 'year') {
      return invoices.filter((inv) => {
        const d = new Date(inv.settledAt || inv.printedAt);
        return d.getFullYear() === Number(selectedYear);
      });
    }

    return invoices;
  }, [invoices, reportType, selectedDate, selectedMonth, selectedYear]);

  // SUMMARY CALCULATIONS
  const summary = useMemo(() => {
    const totalGross = filteredData.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
    const totalNet = filteredData.reduce((sum, inv) => sum + (inv.taxableAmount || 0), 0);
    const totalSubtotal = filteredData.reduce((sum, inv) => sum + (inv.subtotal || 0), 0);
    const totalTax = filteredData.reduce(
      (sum, inv) => sum + ((inv.cgst || 0) + (inv.sgst || 0)),
      0
    );
    const totalServiceCharge = filteredData.reduce(
      (sum, inv) => sum + (inv.serviceCharge || 0),
      0
    );
    const totalDiscounts = filteredData.reduce(
      (sum, inv) => sum + (inv.discountAmount || 0),
      0
    );
    const invoiceCount = filteredData.length;
    const aov = invoiceCount > 0 ? Math.round(totalGross / invoiceCount) : 0;

    // Payment modes
    const paymentModes = {
      UPI: 0,
      CARD: 0,
      CASH: 0
    };
    filteredData.forEach((inv) => {
      const mode = inv.paymentMethod || 'CASH';
      paymentModes[mode] = (paymentModes[mode] || 0) + inv.grandTotal;
    });

    return {
      totalGross,
      totalNet,
      totalSubtotal,
      totalTax,
      totalServiceCharge,
      totalDiscounts,
      invoiceCount,
      aov,
      paymentModes
    };
  }, [filteredData]);

  // MONTH-WISE DAY-BY-DAY BREAKDOWN
  const monthDaysBreakdown = useMemo(() => {
    if (reportType !== 'month') return [];

    const daysInMonth = new Date(Number(selectedYear), Number(selectedMonth) + 1, 0).getDate();
    const daysArr = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = `${selectedYear}-${String(Number(selectedMonth) + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayInvoices = filteredData.filter((inv) => {
        const invDateStr = new Date(inv.settledAt || inv.printedAt).toISOString().slice(0, 10);
        return invDateStr === dayStr;
      });

      const revenue = dayInvoices.reduce((sum, i) => sum + i.grandTotal, 0);
      const tax = dayInvoices.reduce((sum, i) => sum + (i.cgst + i.sgst), 0);

      daysArr.push({
        day,
        dateStr: dayStr,
        count: dayInvoices.length,
        revenue,
        tax,
        invoices: dayInvoices
      });
    }

    return daysArr;
  }, [reportType, filteredData, selectedYear, selectedMonth]);

  // YEAR-WISE MONTH-BY-MONTH BREAKDOWN
  const yearMonthsBreakdown = useMemo(() => {
    if (reportType !== 'year') return [];

    return monthsList.map((monthName, idx) => {
      const monthInvoices = filteredData.filter((inv) => {
        const d = new Date(inv.settledAt || inv.printedAt);
        return d.getMonth() === idx;
      });

      const revenue = monthInvoices.reduce((sum, i) => sum + i.grandTotal, 0);
      const tax = monthInvoices.reduce((sum, i) => sum + (i.cgst + i.sgst), 0);
      const subtotal = monthInvoices.reduce((sum, i) => sum + i.subtotal, 0);

      return {
        monthIndex: idx,
        monthName,
        count: monthInvoices.length,
        revenue,
        tax,
        subtotal
      };
    });
  }, [reportType, filteredData, monthsList]);

  // EXPORT TO CSV
  const handleExportCSV = () => {
    let headers = [];
    let rows = [];
    let fileName = `sales_report_${reportType}_${Date.now()}.csv`;

    if (reportType === 'day') {
      fileName = `daily_report_${selectedDate}.csv`;
      headers = [
        'Invoice Number',
        'Table',
        'Section',
        'Guest Name',
        'Time',
        'Subtotal',
        'Discount',
        'CGST',
        'SGST',
        'Service Charge',
        'Grand Total',
        'Payment Method',
        'Printed By'
      ];
      rows = filteredData.map((inv) => [
        inv.invoiceNumber,
        inv.tableNumber,
        `"${inv.section || ''}"`,
        `"${inv.guestName || ''}"`,
        `"${new Date(inv.settledAt).toLocaleTimeString()}"`,
        inv.subtotal,
        inv.discountAmount || 0,
        inv.cgst,
        inv.sgst,
        inv.serviceCharge,
        inv.grandTotal,
        inv.paymentMethod,
        `"${inv.printedBy || ''}"`
      ]);
    } else if (reportType === 'month') {
      fileName = `monthly_report_${monthsList[selectedMonth]}_${selectedYear}.csv`;
      headers = ['Date', 'Day', 'Bills Count', 'Gross Revenue', 'Taxes (GST)'];
      rows = monthDaysBreakdown.map((d) => [
        d.dateStr,
        `Day ${d.day}`,
        d.count,
        d.revenue,
        d.tax
      ]);
    } else if (reportType === 'year') {
      fileName = `annual_report_${selectedYear}.csv`;
      headers = ['Month', 'Bills Count', 'Subtotal', 'Taxes (GST)', 'Gross Revenue'];
      rows = yearMonthsBreakdown.map((m) => [
        m.monthName,
        m.count,
        m.subtotal,
        m.tax,
        m.revenue
      ]);
    }

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast(`Exported ${reportType}-wise report to CSV.`, 'success', 'Report Exported');
  };

  const handlePrintReport = () => {
    addToast('Opening print preview for sales statement...', 'info', 'Printing');
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Printable Report Header (visible only during window.print) */}
      <div className="hidden print:block text-center border-b border-slate-300 pb-4 mb-4">
        <h1 className="text-xl font-bold uppercase">{hotelInfo.name}</h1>
        <p className="text-xs text-slate-600">{hotelInfo.address} • GSTIN: {hotelInfo.gstin}</p>
        <h2 className="text-sm font-bold mt-2 uppercase tracking-wider text-slate-800">
          Official {reportType.toUpperCase()}-WISE Sales & Revenue Statement
        </h2>
        <p className="text-xs text-slate-500">
          Period: {reportType === 'day' ? selectedDate : reportType === 'month' ? `${monthsList[selectedMonth]} ${selectedYear}` : selectedYear} • Generated by: {currentUser?.name} ({currentUser?.role})
        </p>
      </div>

      {/* Top Header & Report Mode Switcher Bar */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-['Outfit']">
              Sales & Financial Reports
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800 uppercase">
              {reportType}-Wise
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Analyze daily registers, monthly turnover, and annual growth performance
          </p>
        </div>

        {/* 3 Main Mode Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setReportType('day')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              reportType === 'day'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-brand-500" />
            <span>Day-wise</span>
          </button>

          <button
            onClick={() => setReportType('month')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              reportType === 'month'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-amber-500" />
            <span>Month-wise</span>
          </button>

          <button
            onClick={() => setReportType('year')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              reportType === 'year'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span>Year-wise</span>
          </button>
        </div>
      </div>

      {/* Date & Period Selection Controls */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
        {/* Dynamic Period Inputs */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {reportType === 'day' && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Select Date:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                type="button"
                onClick={() => setSelectedDate(todayStr)}
                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => {
                  const y = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
                  setSelectedDate(y);
                }}
                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
              >
                Yesterday
              </button>
            </div>
          )}

          {reportType === 'month' && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Month & Year:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {monthsList.map((m, idx) => (
                  <option key={m} value={idx}>
                    {m}
                  </option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>
          )}

          {reportType === 'year' && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Fiscal / Calendar Year:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-4 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    Year {yr}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Action Buttons: Export & Print */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrintReport}
            className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-brand-400" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards for Period */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Gross Revenue
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
            {hotelInfo.currency}{summary.totalGross.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Net Sales: {hotelInfo.currency}{summary.totalNet.toLocaleString()}
          </div>
        </div>

        {/* Invoices Count & AOV */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Bills Settled / AOV
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
            {summary.invoiceCount} Bills
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Avg Ticket: {hotelInfo.currency}{summary.aov.toLocaleString()}
          </div>
        </div>

        {/* Total Taxes (GST) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Total Tax (GST)
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-['Outfit']">
            {hotelInfo.currency}{summary.totalTax.toFixed(2)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            CGST: {hotelInfo.currency}{(summary.totalTax / 2).toFixed(2)} • SGST: {hotelInfo.currency}{(summary.totalTax / 2).toFixed(2)}
          </div>
        </div>

        {/* Payment Modes Split */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Payment Collection
          </span>
          <div className="space-y-1 mt-2 text-xs">
            <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1">
                <QrCode className="w-3 h-3 text-blue-500" /> UPI:
              </span>
              <span className="font-bold">{hotelInfo.currency}{summary.paymentModes.UPI?.toLocaleString() || 0}</span>
            </div>
            <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1">
                <CreditCard className="w-3 h-3 text-purple-500" /> Card:
              </span>
              <span className="font-bold">{hotelInfo.currency}{summary.paymentModes.CARD?.toLocaleString() || 0}</span>
            </div>
            <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1">
                <Banknote className="w-3 h-3 text-emerald-500" /> Cash:
              </span>
              <span className="font-bold">{hotelInfo.currency}{summary.paymentModes.CASH?.toLocaleString() || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* MONTH-WISE VISUAL CHART (if month-wise is active) */}
      {reportType === 'month' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm no-print">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-base font-['Outfit']">
                Daily Sales Distribution ({monthsList[selectedMonth]} {selectedYear})
              </h2>
              <p className="text-xs text-slate-500">Day-by-day revenue peaks</p>
            </div>
            <span className="text-xs font-bold text-brand-600">
              Peak Day: Day {monthDaysBreakdown.reduce((max, d) => (d.revenue > max.revenue ? d : max), monthDaysBreakdown[0] || {}).day || 1}
            </span>
          </div>

          {/* SVG/CSS Bar Chart */}
          <div className="h-44 flex items-end gap-1.5 pt-4 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-2">
            {monthDaysBreakdown.map((d) => {
              const maxRev = Math.max(1, ...monthDaysBreakdown.map((x) => x.revenue));
              const heightPct = Math.round((d.revenue / maxRev) * 100);

              return (
                <div key={d.day} className="flex-1 min-w-[20px] flex flex-col items-center group relative">
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                    <div className="bg-slate-900 text-white text-[10px] font-semibold py-1 px-2 rounded-lg whitespace-nowrap shadow-lg">
                      Day {d.day}: {hotelInfo.currency}{d.revenue.toLocaleString()} ({d.count} bills)
                    </div>
                  </div>

                  {/* Bar */}
                  <div
                    className={`w-full rounded-t-md transition-all duration-300 ${
                      d.revenue > 0
                        ? 'bg-gradient-to-t from-brand-600 to-amber-500 group-hover:from-brand-500 group-hover:to-amber-400'
                        : 'bg-slate-100 dark:bg-slate-800'
                    }`}
                    style={{ height: `${Math.max(4, heightPct)}%` }}
                  />
                  <span className="text-[9px] text-slate-400 mt-1 font-mono">{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* YEAR-WISE VISUAL CHART (if year-wise is active) */}
      {reportType === 'year' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm no-print">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-base font-['Outfit']">
                Monthly Turnover Trend (Year {selectedYear})
              </h2>
              <p className="text-xs text-slate-500">Jan - Dec annual comparison</p>
            </div>
            <span className="text-xs font-bold text-emerald-600">
              Total Year Sales: {hotelInfo.currency}{summary.totalGross.toLocaleString()}
            </span>
          </div>

          <div className="h-44 flex items-end gap-3 pt-4 border-b border-slate-200 dark:border-slate-800 pb-2">
            {yearMonthsBreakdown.map((m) => {
              const maxRev = Math.max(1, ...yearMonthsBreakdown.map((x) => x.revenue));
              const heightPct = Math.round((m.revenue / maxRev) * 100);

              return (
                <div key={m.monthName} className="flex-1 flex flex-col items-center group relative">
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                    <div className="bg-slate-900 text-white text-[10px] font-semibold py-1 px-2 rounded-lg whitespace-nowrap shadow-lg">
                      {m.monthName}: {hotelInfo.currency}{m.revenue.toLocaleString()} ({m.count} bills)
                    </div>
                  </div>

                  {/* Bar */}
                  <div
                    className={`w-full rounded-t-lg transition-all duration-300 ${
                      m.revenue > 0
                        ? 'bg-gradient-to-t from-emerald-600 to-teal-500 group-hover:from-emerald-500 group-hover:to-teal-400'
                        : 'bg-slate-100 dark:bg-slate-800'
                    }`}
                    style={{ height: `${Math.max(6, heightPct)}%` }}
                  />
                  <span className="text-[10px] text-slate-500 font-semibold mt-1">
                    {m.monthName.slice(0, 3)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DETAILED DATA TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base font-['Outfit']">
              {reportType === 'day' && `Daily Invoices Register (${selectedDate})`}
              {reportType === 'month' && `Day-by-Day Revenue Breakdown (${monthsList[selectedMonth]} ${selectedYear})`}
              {reportType === 'year' && `Month-by-Month Statement (Year ${selectedYear})`}
            </h3>
            <p className="text-xs text-slate-500">
              Audit log of transactions and tax settlements
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          {/* DAY-WISE INVOICES TABLE */}
          {reportType === 'day' && (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3.5 pl-6">Invoice #</th>
                  <th className="py-3.5 px-3">Table</th>
                  <th className="py-3.5 px-3">Guest</th>
                  <th className="py-3.5 px-3">Payment</th>
                  <th className="py-3.5 px-3">Subtotal</th>
                  <th className="py-3.5 px-3">GST</th>
                  <th className="py-3.5 px-3 text-right">Grand Total</th>
                  <th className="py-3.5 pr-6 text-center no-print">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <Calendar className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                      <p className="font-semibold text-slate-600 dark:text-slate-300">
                        No transactions recorded for {selectedDate}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((inv) => (
                    <tr key={inv.invoiceNumber} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3.5 pl-6 font-mono font-bold text-slate-900 dark:text-white">
                        {inv.invoiceNumber}
                        <span className="block text-[10px] text-slate-400 font-sans">
                          {new Date(inv.settledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                        Table {inv.tableNumber}
                        <span className="text-[10px] text-slate-400 block">{inv.section}</span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300">
                        {inv.guestName}
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                        {inv.paymentMethod}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 dark:text-slate-400">
                        {hotelInfo.currency}{inv.subtotal}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 dark:text-slate-400">
                        {hotelInfo.currency}{(inv.cgst + inv.sgst).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-extrabold text-slate-900 dark:text-white text-sm font-['Outfit']">
                        {hotelInfo.currency}{inv.grandTotal.toLocaleString()}
                      </td>
                      <td className="py-3.5 pr-6 text-center no-print">
                        {onReprintInvoice && (
                          <button
                            onClick={() => onReprintInvoice(inv, currentUser)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition"
                            title="Print bill"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* MONTH-WISE DAY-BY-DAY TABLE */}
          {reportType === 'month' && (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3.5 pl-6">Date</th>
                  <th className="py-3.5 px-3">Day</th>
                  <th className="py-3.5 px-3">Bills Count</th>
                  <th className="py-3.5 px-3">GST Collected</th>
                  <th className="py-3.5 pr-6 text-right">Daily Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {monthDaysBreakdown.map((d) => (
                  <tr
                    key={d.day}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition ${
                      d.count > 0 ? 'font-medium' : 'text-slate-400 opacity-60'
                    }`}
                  >
                    <td className="py-3 pl-6 font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {d.dateStr}
                    </td>
                    <td className="py-3 px-3">Day {d.day}</td>
                    <td className="py-3 px-3">
                      {d.count > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-bold">
                          {d.count} Bills
                        </span>
                      ) : (
                        '0'
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                      {hotelInfo.currency}{d.tax.toFixed(2)}
                    </td>
                    <td className="py-3 pr-6 text-right font-extrabold text-slate-900 dark:text-white text-sm font-['Outfit']">
                      {hotelInfo.currency}{d.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* YEAR-WISE MONTH-BY-MONTH TABLE */}
          {reportType === 'year' && (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3.5 pl-6">Month</th>
                  <th className="py-3.5 px-3">Bills Count</th>
                  <th className="py-3.5 px-3">Subtotal</th>
                  <th className="py-3.5 px-3">GST Collected</th>
                  <th className="py-3.5 px-3">% Share</th>
                  <th className="py-3.5 pr-6 text-right">Total Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {yearMonthsBreakdown.map((m) => {
                  const sharePct = summary.totalGross > 0 ? Math.round((m.revenue / summary.totalGross) * 100) : 0;
                  return (
                    <tr
                      key={m.monthName}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition ${
                        m.count > 0 ? 'font-medium' : 'text-slate-400 opacity-60'
                      }`}
                    >
                      <td className="py-3.5 pl-6 font-bold text-slate-900 dark:text-white">
                        {m.monthName}
                      </td>
                      <td className="py-3.5 px-3">
                        {m.count > 0 ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold">
                            {m.count} Bills
                          </span>
                        ) : (
                          '0'
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 dark:text-slate-400">
                        {hotelInfo.currency}{m.subtotal.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 dark:text-slate-400">
                        {hotelInfo.currency}{m.tax.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {sharePct}%
                        </span>
                      </td>
                      <td className="py-3.5 pr-6 text-right font-extrabold text-slate-900 dark:text-white text-base font-['Outfit']">
                        {hotelInfo.currency}{m.revenue.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
