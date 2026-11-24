import React, { useState, useEffect } from 'react';
import { useHotel } from '../../context/HotelContext';
import { useToast } from '../../context/ToastContext';
import {
  X,
  Wallet,
  Plus,
  Save,
  Trash2,
  Calendar,
  CreditCard,
  Building2,
  FileText,
  DollarSign,
  Tag
} from 'lucide-react';

export const AddEditLedgerModal = ({ isOpen, onClose, entryToEdit = null }) => {
  const { hotelInfo, expenseCategories, addLedgerEntry, updateLedgerEntry } = useHotel();
  const { addToast } = useToast();

  const [type, setType] = useState('EXPENSE'); // 'EXPENSE' or 'INCOME'
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [reference, setReference] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (entryToEdit) {
      setType(entryToEdit.type || 'EXPENSE');
      setCategory(entryToEdit.category || expenseCategories[0]?.name || '');
      setTitle(entryToEdit.title || '');
      setVendorName(entryToEdit.vendorName || '');
      setAmount(entryToEdit.amount !== undefined ? String(entryToEdit.amount) : '');
      setPaymentMethod(entryToEdit.paymentMethod || 'UPI');
      setReference(entryToEdit.reference || '');
      setDate(entryToEdit.date || new Date().toISOString().slice(0, 10));
      setTime(entryToEdit.time || '12:00 PM');
      setNotes(entryToEdit.notes || '');
    } else {
      setType('EXPENSE');
      setCategory(expenseCategories[0]?.name || 'Food Raw Materials & Dairy');
      setTitle('');
      setVendorName('');
      setAmount('');
      setPaymentMethod('UPI');
      setReference('');
      setDate(new Date().toISOString().slice(0, 10));
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setNotes('');
    }
  }, [entryToEdit, isOpen, expenseCategories]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      addToast('Please enter a valid amount greater than 0', 'error', 'Invalid Amount');
      return;
    }

    if (!title.trim()) {
      addToast('Please enter a voucher title or description', 'error', 'Missing Title');
      return;
    }

    // Determine cost type (COGS vs OPEX vs REVENUE)
    const catObj = expenseCategories.find((c) => c.name === category);
    const costType = type === 'INCOME' ? 'REVENUE' : catObj?.type || 'OPEX';

    const payload = {
      type,
      category: type === 'INCOME' ? 'Catering & Other Revenue' : category,
      costType,
      title: title.trim(),
      vendorName: vendorName.trim() || (type === 'EXPENSE' ? 'Vendor' : 'Guest / Client'),
      amount: numAmount,
      paymentMethod,
      reference: reference.trim() || `REF-${Date.now().toString().slice(-4)}`,
      date,
      time,
      notes: notes.trim()
    };

    if (entryToEdit) {
      updateLedgerEntry({ ...payload, id: entryToEdit.id, voucherNumber: entryToEdit.voucherNumber });
    } else {
      addLedgerEntry(payload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-base">
                {entryToEdit ? `Edit Voucher #${entryToEdit.voucherNumber}` : 'Record Ledger Voucher'}
              </h2>
              <p className="text-xs text-slate-500">
                Post expense or non-dining income entry to hotel accounts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Type Toggle: Expense vs Income */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Entry Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('EXPENSE')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border ${
                  type === 'EXPENSE'
                    ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}
              >
                <span>🔴 Operating Expense (COGS / OPEX)</span>
              </button>

              <button
                type="button"
                onClick={() => setType('INCOME')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border ${
                  type === 'INCOME'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}
              >
                <span>🟢 Non-Dining Income / Event</span>
              </button>
            </div>
          </div>

          {/* Category Dropdown (if Expense) */}
          {type === 'EXPENSE' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Expense Account Ledger *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-brand-500 focus:outline-none"
                required
              >
                <optgroup label="Cost of Goods Sold (Direct Kitchen COGS)">
                  {expenseCategories
                    .filter((c) => c.type === 'COGS')
                    .map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                </optgroup>
                <optgroup label="Operating Expenses (OPEX)">
                  {expenseCategories
                    .filter((c) => c.type === 'OPEX')
                    .map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                </optgroup>
              </select>
            </div>
          )}

          {/* Title / Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Voucher Title & Narration *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Daily Meat & Fresh Seafood procurement, 19kg Commercial LPG"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
              required
            />
          </div>

          {/* Amount & Vendor / Recipient */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Amount ({hotelInfo.currency}) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                  {hotelInfo.currency}
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="2500"
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-extrabold focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {type === 'EXPENSE' ? 'Vendor / Paid To' : 'Received From'}
              </label>
              <input
                type="text"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                placeholder="e.g. Metro Cash & Carry, Bharat Gas, Staff Payroll"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Payment Method & Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Payment Mode
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="UPI">📱 UPI / QR Transfer</option>
                <option value="BANK_TRANSFER">🏦 Bank Transfer (NEFT/RTGS)</option>
                <option value="CARD">💳 Corporate Card</option>
                <option value="CASH">💵 Petty Cash</option>
                <option value="CHEQUE">📝 Bank Cheque</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Ref # / Bill / Transaction ID
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. NEFT-99124, CASH-VOUCH-01"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Voucher Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-brand-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Time
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="10:30 AM"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Internal Accounting Notes / Bill Memo
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Authorized by Manager, goods verified by kitchen head..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-brand-600/30 transition transform active:scale-95 flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{entryToEdit ? 'Save Voucher' : 'Post Voucher to Ledger'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
