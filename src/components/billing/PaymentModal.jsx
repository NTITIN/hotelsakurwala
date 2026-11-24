import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  X,
  CreditCard,
  Banknote,
  QrCode,
  CheckCircle2,
  Receipt,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Split,
  Printer
} from 'lucide-react';

export const PaymentModal = ({
  isOpen,
  onClose,
  table,
  order,
  totals,
  onPaymentComplete
}) => {
  const { hotelInfo, settleTableBill } = useHotel();
  const { currentUser, isAuthorizedToPrint } = useAuth();
  const { addToast } = useToast();

  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'CASH', 'UPI', 'CARD', 'SPLIT'
  const [cashTendered, setCashTendered] = useState(String(totals?.grandTotal || ''));
  const [cardLast4, setCardLast4] = useState('');
  const [shouldPrintAfterSettlement, setShouldPrintAfterSettlement] = useState(isAuthorizedToPrint);

  if (!isOpen || !table || !order) return null;

  const grandTotal = totals.grandTotal;
  const numCash = Number(cashTendered) || 0;
  const changeDue = Math.max(0, numCash - grandTotal);

  const handleSettle = (e) => {
    e.preventDefault();

    if (paymentMethod === 'CASH' && numCash < grandTotal) {
      addToast(
        `Tendered cash (${hotelInfo.currency}${numCash}) is less than bill total (${hotelInfo.currency}${grandTotal})`,
        'error',
        'Insufficient Cash'
      );
      return;
    }

    const paymentDetails = {
      method: paymentMethod,
      reference:
        paymentMethod === 'CASH'
          ? `CASH-${Date.now().toString().slice(-4)}`
          : paymentMethod === 'CARD'
          ? `CARD-****${cardLast4 || '8890'}`
          : `UPI-${Date.now().toString().slice(-6)}`,
      tendered: paymentMethod === 'CASH' ? numCash : grandTotal,
      change: paymentMethod === 'CASH' ? changeDue : 0
    };

    const completedInvoice = settleTableBill(table.id, paymentDetails, currentUser);

    onPaymentComplete(completedInvoice, shouldPrintAfterSettlement);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-base">
                Settlement & Checkout
              </h2>
              <p className="text-xs text-slate-500">
                {table.name} ({table.section}) • Guest: {order.guestName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Total Banner */}
        <div className="p-6 bg-gradient-to-r from-brand-600 to-amber-600 text-white text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-200">
            Total Payable Amount
          </span>
          <div className="text-3xl sm:text-4xl font-extrabold tracking-tight font-['Outfit'] mt-1">
            {hotelInfo.currency}{grandTotal.toLocaleString()}
          </div>
          <div className="text-xs text-amber-100 mt-1">
            Includes {hotelInfo.taxRate}% GST ({hotelInfo.currency}{totals.totalTax}) + Service Charge
          </div>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSettle} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Payment Method Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Select Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('UPI')}
                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                  paymentMethod === 'UPI'
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-bold'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <QrCode className="w-5 h-5" />
                <span className="text-xs">UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                  paymentMethod === 'CARD'
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-bold'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span className="text-xs">Card / POS</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CASH')}
                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                  paymentMethod === 'CASH'
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-bold'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Banknote className="w-5 h-5" />
                <span className="text-xs">Cash</span>
              </button>
            </div>
          </div>

          {/* Dynamic Payment Fields */}
          {paymentMethod === 'UPI' && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center space-y-2">
              <div className="inline-block p-2 bg-white rounded-xl shadow-xs border border-slate-200">
                <svg className="w-28 h-28 mx-auto" viewBox="0 0 100 100" fill="currentColor">
                  <rect x="5" y="5" width="28" height="28" fill="none" stroke="#1e293b" strokeWidth="5"/>
                  <rect x="12" y="12" width="14" height="14" fill="#1e293b"/>
                  <rect x="67" y="5" width="28" height="28" fill="none" stroke="#1e293b" strokeWidth="5"/>
                  <rect x="74" y="12" width="14" height="14" fill="#1e293b"/>
                  <rect x="5" y="67" width="28" height="28" fill="none" stroke="#1e293b" strokeWidth="5"/>
                  <rect x="12" y="74" width="14" height="14" fill="#1e293b"/>
                  <rect x="38" y="10" width="8" height="8" fill="#1e293b"/>
                  <rect x="42" y="28" width="6" height="10" fill="#1e293b"/>
                  <rect x="30" y="42" width="8" height="8" fill="#1e293b"/>
                  <rect x="45" y="45" width="12" height="12" fill="#1e293b"/>
                  <rect x="60" y="65" width="8" height="15" fill="#1e293b"/>
                  <rect x="45" y="80" width="10" height="10" fill="#1e293b"/>
                </svg>
              </div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Scan via Google Pay, PhonePe, Paytm, or BHIM
              </p>
              <p className="text-[11px] text-slate-500 font-mono">
                VPA: {hotelInfo.upiId} • Table {table.number}
              </p>
            </div>
          )}

          {paymentMethod === 'CASH' && (
            <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Cash Tendered by Guest ({hotelInfo.currency})
                </label>
                <input
                  type="number"
                  min={grandTotal}
                  value={cashTendered}
                  onChange={(e) => setCashTendered(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-base focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  required
                />
              </div>

              {/* Quick Cash Buttons */}
              <div className="flex gap-2">
                {[grandTotal, Math.ceil(grandTotal / 500) * 500, Math.ceil(grandTotal / 1000) * 1000]
                  .filter((v, i, a) => a.indexOf(v) === i && v >= grandTotal)
                  .map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setCashTendered(String(amount))}
                      className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-xs font-semibold hover:bg-slate-300"
                    >
                      {hotelInfo.currency}{amount}
                    </button>
                  ))}
              </div>

              {/* Change calculation */}
              <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700 text-sm">
                <span className="font-semibold text-slate-600 dark:text-slate-400">
                  Change to Return:
                </span>
                <span className="font-extrabold text-emerald-600 text-base font-['Outfit']">
                  {hotelInfo.currency}{changeDue.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {paymentMethod === 'CARD' && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Card Last 4 Digits (Optional)
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={cardLast4}
                  onChange={(e) => setCardLast4(e.target.value)}
                  placeholder="e.g. 4242"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Please swipe or tap guest card on the EDC wireless terminal.
              </p>
            </div>
          )}

          {/* Print Invoice check (if authorized) */}
          {isAuthorizedToPrint && (
            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={shouldPrintAfterSettlement}
                onChange={(e) => setShouldPrintAfterSettlement(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
              />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Printer className="w-3.5 h-3.5 text-brand-500" />
                <span>Print 58mm thermal receipt on SHREYANS 588 after payment</span>
              </span>
            </label>
          )}

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition transform active:scale-[0.98]"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Complete Payment & Free Table</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
