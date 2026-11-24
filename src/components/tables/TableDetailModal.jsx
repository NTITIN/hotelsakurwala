import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  X,
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  CreditCard,
  ChefHat,
  Tag,
  User,
  Phone,
  Users,
  Lock,
  ShieldAlert,
  Percent,
  CheckCircle2,
  Clock,
  Edit2
} from 'lucide-react';
import { ManagerOverrideModal } from '../common/ManagerOverrideModal';
import { AddEditTableModal } from './AddEditTableModal';

export const TableDetailModal = ({
  isOpen,
  onClose,
  table,
  onOpenPrintInvoice,
  onOpenPaymentModal
}) => {
  const {
    hotelInfo,
    categories,
    menu,
    activeOrders,
    createOrderForTable,
    addItemToOrder,
    updateItemQuantity,
    removeItemFromOrder,
    updateOrderGuestDetails,
    setOrderDiscount,
    calculateBillTotals
  } = useHotel();

  const { currentUser, isAuthorizedToPrint } = useAuth();
  const { addToast } = useToast();

  const [searchDish, setSearchDish] = useState('');
  const [selectedCat, setSelectedCat] = useState('ALL');
  const [isOverrideOpen, setIsOverrideOpen] = useState(false);
  const [isEditTableOpen, setIsEditTableOpen] = useState(false);

  if (!isOpen || !table) return null;

  // Retrieve or create active order for this table
  let order = table.orderId ? activeOrders[table.orderId] : null;

  const totals = calculateBillTotals(order);

  // Filter menu items for POS
  const availableMenuItems = menu.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchDish.toLowerCase()) ||
      item.category.toLowerCase().includes(searchDish.toLowerCase());
    const matchesCat = selectedCat === 'ALL' || item.category === selectedCat;
    return matchesSearch && matchesCat && item.available;
  });

  const handleAddItem = (item) => {
    addItemToOrder(table.id, item);
  };

  const handleSendKOT = () => {
    if (!order || order.items.length === 0) {
      addToast('Cannot send empty order to kitchen.', 'warning', 'No Items');
      return;
    }
    addToast(
      `KOT for Table ${table.number} sent to Kitchen & Bar (Items: ${order.items.reduce((s, i) => s + i.quantity, 0)})`,
      'success',
      'Kitchen Order Ticket Generated'
    );
  };

  const handlePrintClick = () => {
    if (!order || order.items.length === 0) {
      addToast('Cannot print invoice for an empty table order.', 'warning', 'No Items');
      return;
    }

    if (isAuthorizedToPrint) {
      // Current user is ADMIN or MANAGER -> authorized!
      onOpenPrintInvoice(table, order, totals, currentUser);
    } else {
      // Current user is WAITER or unauthorized -> strictly enforce rule!
      setIsOverrideOpen(true);
    }
  };

  const handleOverrideSuccess = (manager) => {
    onOpenPrintInvoice(table, order, totals, manager);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-6xl shadow-2xl overflow-hidden flex flex-col h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-brand-600 text-white font-bold flex items-center justify-center text-lg shadow-md shadow-brand-600/30">
              {table.number}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-slate-900 dark:text-white text-lg font-['Outfit']">
                  {table.name}
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  {table.section}
                </span>
                <span className="text-xs text-slate-400">
                  Capacity: {table.capacity} Guests
                </span>
                <button
                  onClick={() => setIsEditTableOpen(true)}
                  className="p-1 rounded-md text-slate-400 hover:text-amber-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                  title="Edit table details (number, capacity, section)"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Active Order: <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{order?.id || 'New Bill'}</span> • Server: {order?.serverName || currentUser?.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Split 2 columns (Left: Menu Picker, Right: Active Bill) */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
          {/* LEFT: Menu Selection Catalog (60%) */}
          <div className="lg:w-7/12 flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/40 overflow-hidden">
            {/* Search & Category Tabs */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-900">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchDish}
                  onChange={(e) => setSearchDish(e.target.value)}
                  placeholder="Quick search dishes to add to table..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Category pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                <button
                  onClick={() => setSelectedCat('ALL')}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    selectedCat === 'ALL'
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  All Items
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCat(cat.name)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                      selectedCat === cat.name
                        ? 'bg-brand-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Items Grid */}
            <div className="p-4 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availableMenuItems.map((item) => {
                const isVeg = item.type === 'veg' || item.type === 'vegan';
                return (
                  <button
                    key={item.id}
                    onClick={() => handleAddItem(item)}
                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:border-brand-400 dark:hover:border-brand-500 text-left transition transform hover:scale-[1.01] flex flex-col justify-between shadow-sm group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          {item.category}
                        </span>
                        <span
                          className={`w-3 h-3 border flex items-center justify-center rounded-xs ${
                            isVeg ? 'border-emerald-600' : 'border-rose-600'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                            }`}
                          />
                        </span>
                      </div>
                      <div className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-brand-600 dark:group-hover:text-brand-400 transition">
                        {item.name}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 dark:text-white text-sm font-['Outfit']">
                        {hotelInfo.currency}{item.price}
                      </span>
                      <span className="p-1 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 group-hover:bg-brand-600 group-hover:text-white transition">
                        <Plus className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Active Order Bill / Items / Settlement (40%) */}
          <div className="lg:w-5/12 flex flex-col h-full bg-white dark:bg-slate-900">
            {/* Guest details mini-bar */}
            <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 flex items-center gap-2 text-xs">
              <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Guest Name (e.g. Mr. Sharma)"
                value={order?.guestName || ''}
                onChange={(e) => updateOrderGuestDetails(table.id, { guestName: e.target.value })}
                className="bg-transparent border-b border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 px-1 py-0.5 text-xs flex-1"
              />
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="number"
                min="1"
                placeholder="Guests"
                value={order?.guestCount || 2}
                onChange={(e) => updateOrderGuestDetails(table.id, { guestCount: Number(e.target.value) || 1 })}
                className="w-12 bg-transparent border-b border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 px-1 py-0.5 text-xs text-center"
              />
            </div>

            {/* Order Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {!order || order.items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <ChefHat className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-2" />
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Table is currently empty
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Select dishes from the menu catalog on the left to start dining
                  </p>
                </div>
              ) : (
                order.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-900 dark:text-white truncate">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {hotelInfo.currency}{item.price} each
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
                      <button
                        onClick={() => updateItemQuantity(table.id, item.id, -1)}
                        className="p-1 hover:text-rose-600 transition"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-bold text-slate-900 dark:text-white min-w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateItemQuantity(table.id, item.id, 1)}
                        className="p-1 hover:text-brand-600 transition"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Item Total */}
                    <div className="font-extrabold text-slate-900 dark:text-white text-sm font-['Outfit'] min-w-16 text-right">
                      {hotelInfo.currency}{item.price * item.quantity}
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeItemFromOrder(table.id, item.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Calculations & Tax Breakdown */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal ({order?.items?.reduce((s, i) => s + i.quantity, 0) || 0} items)</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {hotelInfo.currency}{totals.subtotal}
                </span>
              </div>

              {/* Discount Selector */}
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Percent className="w-3 h-3 text-brand-500" /> Discount:
                </span>
                <div className="flex items-center gap-1">
                  {[0, 5, 10, 15].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => setOrderDiscount(table.id, pct)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition ${
                        order?.discountPercent === pct
                          ? 'bg-brand-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                  {totals.discountAmount > 0 && (
                    <span className="text-emerald-600 font-bold ml-1">
                      -{hotelInfo.currency}{totals.discountAmount}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>CGST ({(hotelInfo.taxRate / 2).toFixed(1)}%) + SGST ({(hotelInfo.taxRate / 2).toFixed(1)}%)</span>
                <span>{hotelInfo.currency}{totals.totalTax}</span>
              </div>

              {hotelInfo.enableServiceCharge && (
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Service Charge ({hotelInfo.serviceChargeRate}%)</span>
                  <span>{hotelInfo.currency}{totals.serviceCharge}</span>
                </div>
              )}

              {/* Grand Total */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-baseline">
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  Grand Total
                </span>
                <span className="font-extrabold text-2xl text-brand-600 dark:text-brand-400 font-['Outfit']">
                  {hotelInfo.currency}{totals.grandTotal}
                </span>
              </div>
            </div>

            {/* Action Buttons: KOT, Print Invoice (Strict Permission), Checkout */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {/* Kitchen KOT */}
                <button
                  onClick={handleSendKOT}
                  disabled={!order || order.items.length === 0}
                  className="py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition disabled:opacity-40"
                >
                  <ChefHat className="w-4 h-4 text-amber-500" />
                  <span>Send KOT</span>
                </button>

                {/* PRINT INVOICE BUTTON: STRICTLY ENFORCED */}
                <button
                  onClick={handlePrintClick}
                  disabled={!order || order.items.length === 0}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-sm disabled:opacity-40 ${
                    isAuthorizedToPrint
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800'
                      : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800 hover:bg-rose-100'
                  }`}
                  title={
                    isAuthorizedToPrint
                      ? 'Print Table Invoice'
                      : 'Printing restricted: Requires Manager or Admin authorization'
                  }
                >
                  {isAuthorizedToPrint ? (
                    <>
                      <Printer className="w-4 h-4 text-brand-400" />
                      <span>Print Invoice</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 text-rose-600" />
                      <span>Print (Mgr Only)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Settle & Checkout */}
              <button
                onClick={() => onOpenPaymentModal(table, order, totals)}
                disabled={!order || order.items.length === 0}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-600/30 transition transform active:scale-[0.99] disabled:opacity-40"
              >
                <CreditCard className="w-4 h-4" />
                <span>Settle Bill & Collect Payment</span>
              </button>

              {/* Security info disclaimer */}
              {!isAuthorizedToPrint && (
                <div className="text-[10px] text-rose-600 dark:text-rose-400 text-center flex items-center justify-center gap-1 pt-1">
                  <ShieldAlert className="w-3 h-3" />
                  <span>Only Admin & Manager can print table invoices.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Supervisor/Manager Override Modal if Waiter tries to print */}
      <ManagerOverrideModal
        isOpen={isOverrideOpen}
        onClose={() => setIsOverrideOpen(false)}
        onSuccess={handleOverrideSuccess}
        title="Manager Approval to Print Table Invoice"
      />

      {/* Edit Table Modal */}
      <AddEditTableModal
        isOpen={isEditTableOpen}
        onClose={() => setIsEditTableOpen(false)}
        tableToEdit={table}
      />
    </div>
  );
};
