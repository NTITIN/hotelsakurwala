import React, { useState, useEffect } from 'react';
import { useHotel } from '../../context/HotelContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  X,
  Edit2,
  Trash2,
  Plus,
  Minus,
  Save,
  Printer,
  Receipt,
  User,
  Phone,
  CreditCard,
  Banknote,
  QrCode,
  Tag,
  AlertTriangle,
  Percent
} from 'lucide-react';

export const EditInvoiceModal = ({
  isOpen,
  onClose,
  invoice,
  onSaveSuccess,
  onSaveAndPrint
}) => {
  const { menu, hotelInfo, updateInvoice } = useHotel();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [section, setSection] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [paymentRef, setPaymentRef] = useState('');
  const [items, setItems] = useState([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [editReason, setEditReason] = useState('');
  const [selectedNewMenuItem, setSelectedNewMenuItem] = useState('');

  useEffect(() => {
    if (invoice) {
      setGuestName(invoice.guestName || '');
      setGuestPhone(invoice.guestPhone || '');
      setTableNumber(invoice.tableNumber !== undefined ? String(invoice.tableNumber) : '1');
      setSection(invoice.section || 'Main Dining');
      setPaymentMethod(invoice.paymentMethod || 'UPI');
      setPaymentRef(invoice.paymentRef || '');
      setDiscountPercent(invoice.discountPercent || 0);
      setEditReason(invoice.editReason || '');
      setItems(
        (invoice.items || []).map((i) => ({
          name: i.name,
          price: Number(i.price || i.rate || 0),
          quantity: Number(i.quantity || 1)
        }))
      );
    }
  }, [invoice, isOpen]);

  if (!isOpen || !invoice) return null;

  // Calculation helpers
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = Math.round((subtotal * (Number(discountPercent) || 0)) / 100);
  const taxableAmount = Math.max(0, subtotal - discountAmount);

  const halfTaxRate = hotelInfo.taxRate / 2;
  const cgst = Math.round(((taxableAmount * halfTaxRate) / 100) * 100) / 100;
  const sgst = Math.round(((taxableAmount * halfTaxRate) / 100) * 100) / 100;
  const serviceCharge = hotelInfo.enableServiceCharge
    ? Math.round(((taxableAmount * hotelInfo.serviceChargeRate) / 100) * 100) / 100
    : 0;
  const grandTotal = Math.round(taxableAmount + cgst + sgst + serviceCharge);

  // Item handlers
  const handleQuantityChange = (index, delta) => {
    setItems((prev) =>
      prev
        .map((item, idx) => {
          if (idx === index) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const handlePriceChange = (index, newPrice) => {
    const val = Number(newPrice);
    setItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, price: val >= 0 ? val : 0 } : item))
    );
  };

  const handleRemoveItem = (index) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleAddNewItem = () => {
    if (!selectedNewMenuItem) return;
    const menuItem = menu.find((m) => m.name === selectedNewMenuItem);
    if (!menuItem) return;

    // Check if already in list
    const existingIndex = items.findIndex((i) => i.name === menuItem.name);
    if (existingIndex > -1) {
      handleQuantityChange(existingIndex, 1);
    } else {
      setItems((prev) => [
        ...prev,
        {
          name: menuItem.name,
          price: menuItem.price,
          quantity: 1
        }
      ]);
    }

    setSelectedNewMenuItem('');
  };

  const preparePayload = () => {
    if (items.length === 0) {
      addToast('Invoice must contain at least 1 item.', 'error', 'Validation Error');
      return null;
    }

    return {
      ...invoice,
      guestName: guestName.trim() || 'Guest',
      guestPhone: guestPhone.trim(),
      tableNumber: Number(tableNumber) || invoice.tableNumber,
      tableName: `Table ${tableNumber || invoice.tableNumber}`,
      section,
      paymentMethod,
      paymentRef: paymentRef.trim() || invoice.paymentRef,
      discountPercent: Number(discountPercent) || 0,
      editReason: editReason.trim() || 'Invoice items and details revised',
      items: items.map((i) => ({
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        amount: i.price * i.quantity
      }))
    };
  };

  const handleSaveOnly = (e) => {
    e.preventDefault();
    const payload = preparePayload();
    if (!payload) return;

    const saved = updateInvoice(payload, currentUser);
    if (onSaveSuccess) onSaveSuccess(saved);
    onClose();
  };

  const handleSaveAndPrintClick = (e) => {
    e.preventDefault();
    const payload = preparePayload();
    if (!payload) return;

    const saved = updateInvoice(payload, currentUser);
    if (onSaveAndPrint) onSaveAndPrint(saved);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Edit2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-slate-900 dark:text-white text-base">
                  Edit Invoice #{invoice.invoiceNumber}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  REVISING
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Modify guest details, adjust item quantities/prices, or update payment mode
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

        {/* Modal Form Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Section 1: Guest & Table Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Guest Name
              </label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                placeholder="Guest Name"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Guest Phone
              </label>
              <input
                type="text"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                placeholder="+91 98..."
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Table #
              </label>
              <input
                type="number"
                min="1"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Section
              </label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="Main Dining">Main Dining</option>
                <option value="Garden Terrace">Garden Terrace</option>
                <option value="Rooftop Lounge">Rooftop Lounge</option>
                <option value="Private Dining">Private Dining</option>
              </select>
            </div>
          </div>

          {/* Section 2: Payment Method & Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Settled Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="UPI">📱 UPI / QR Code</option>
                <option value="CARD">💳 Credit / Debit Card</option>
                <option value="CASH">💵 Cash</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Payment Reference / Note
              </label>
              <input
                type="text"
                value={paymentRef}
                onChange={(e) => setPaymentRef(e.target.value)}
                placeholder="e.g. UPI/394829384, VISA-9921"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Section 3: Itemized Dishes List with Add Dish capability */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
                <Receipt className="w-4 h-4 text-brand-500" />
                Billed Items ({items.length})
              </label>
              <span className="text-[11px] text-slate-400">
                Adjust quantities, rates, or add dishes
              </span>
            </div>

            {/* Add Item Dropdown Bar */}
            <div className="flex gap-2">
              <select
                value={selectedNewMenuItem}
                onChange={(e) => setSelectedNewMenuItem(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">-- Add another dish from menu --</option>
                {menu.map((dish) => (
                  <option key={dish.id} value={dish.name}>
                    {dish.name} - {hotelInfo.currency}{dish.price} ({dish.category})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddNewItem}
                disabled={!selectedNewMenuItem}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-1 shadow-xs disabled:opacity-40 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            {/* Items Table */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="p-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/40 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900 dark:text-white truncate">
                      {item.name}
                    </div>
                  </div>

                  {/* Editable Rate */}
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400 text-[11px]">{hotelInfo.currency}</span>
                    <input
                      type="number"
                      min="0"
                      value={item.price}
                      onChange={(e) => handlePriceChange(index, e.target.value)}
                      className="w-16 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-semibold text-right"
                    />
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(index, -1)}
                      className="p-1 hover:text-rose-600 transition"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-bold text-slate-900 dark:text-white min-w-4 text-center">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(index, 1)}
                      className="p-1 hover:text-brand-600 transition"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Line Total */}
                  <div className="font-extrabold text-slate-900 dark:text-white text-xs font-['Outfit'] min-w-16 text-right">
                    {hotelInfo.currency}{(item.price * item.quantity).toFixed(2)}
                  </div>

                  {/* Delete Item */}
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Discount & Financial Summary */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <Percent className="w-3.5 h-3.5 text-brand-500" />
                Discount Percentage:
              </span>
              <div className="flex items-center gap-1.5">
                {[0, 5, 10, 15, 20].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setDiscountPercent(pct)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition ${
                      discountPercent === pct
                        ? 'bg-brand-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 space-y-1.5">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {hotelInfo.currency}{subtotal.toFixed(2)}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount ({discountPercent}%):</span>
                  <span>-{hotelInfo.currency}{discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Taxable Amount:</span>
                <span>{hotelInfo.currency}{taxableAmount.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>CGST ({(hotelInfo.taxRate / 2).toFixed(1)}%) + SGST ({(hotelInfo.taxRate / 2).toFixed(1)}%):</span>
                <span>{hotelInfo.currency}{(cgst + sgst).toFixed(2)}</span>
              </div>

              {serviceCharge > 0 && (
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Service Charge ({hotelInfo.serviceChargeRate}%):</span>
                  <span>{hotelInfo.currency}{serviceCharge.toFixed(2)}</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-300 dark:border-slate-700 flex justify-between items-baseline font-bold">
                <span className="text-sm text-slate-900 dark:text-white">Revised Grand Total:</span>
                <span className="text-xl font-extrabold text-brand-600 dark:text-brand-400 font-['Outfit']">
                  {hotelInfo.currency}{grandTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Section 5: Reason for Revision */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Revision Reason / Manager Note
            </label>
            <input
              type="text"
              value={editReason}
              onChange={(e) => setEditReason(e.target.value)}
              placeholder="e.g. Corrected guest name & adjusted item quantity per request"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveOnly}
              className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5 text-amber-400" />
              <span>Save Changes</span>
            </button>

            <button
              type="button"
              onClick={handleSaveAndPrintClick}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-brand-600/30 transition flex items-center gap-2 transform active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Save & Print Revised Invoice</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
