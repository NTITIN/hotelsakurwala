import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Clock,
  Plus,
  Filter,
  CheckCircle2,
  Receipt,
  Utensils,
  Sparkles,
  ChevronRight,
  Edit2,
  Grid
} from 'lucide-react';
import { AddEditTableModal } from './AddEditTableModal';

export const TableGrid = ({ onSelectTable }) => {
  const { tables, activeOrders, hotelInfo, calculateBillTotals } = useHotel();
  const { isAuthorizedToPrint, currentUser } = useAuth();

  const [selectedSection, setSelectedSection] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, available, occupied

  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [tableToEdit, setTableToEdit] = useState(null);

  const sections = ['ALL', ...new Set(tables.map((t) => t.section))];

  const filteredTables = tables.filter((table) => {
    const matchesSection =
      selectedSection === 'ALL' || table.section === selectedSection;
    const matchesStatus =
      statusFilter === 'ALL' || table.status === statusFilter;
    return matchesSection && matchesStatus;
  });

  const occupiedCount = tables.filter((t) => t.status === 'occupied').length;
  const availableCount = tables.filter((t) => t.status === 'available').length;

  const handleAddNewTable = () => {
    setTableToEdit(null);
    setIsAddEditModalOpen(true);
  };

  const handleEditTableClick = (e, table) => {
    e.stopPropagation(); // Don't trigger POS open
    setTableToEdit(table);
    setIsAddEditModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-['Outfit']">
              Table Floor Management & POS
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              {occupiedCount} Occupied
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage table layout, seating capacity, take orders, and prepare invoices
          </p>
        </div>

        {/* Live Counters & Add Table Button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="font-semibold text-emerald-800 dark:text-emerald-300">
              {availableCount} Available
            </span>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="font-semibold text-amber-800 dark:text-amber-300">
              {occupiedCount} Occupied
            </span>
          </div>

          {/* ADD TABLE BUTTON */}
          <button
            onClick={handleAddNewTable}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-md shadow-brand-600/30 transition transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Table</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Section Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar">
          {sections.map((section) => (
            <button
              key={section}
              onClick={() => setSelectedSection(section)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedSection === section
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {section === 'ALL' ? 'All Dining Areas' : section}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          {['ALL', 'available', 'occupied'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                statusFilter === st
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredTables.map((table) => {
          const isOccupied = table.status === 'occupied';
          const order = table.orderId ? activeOrders[table.orderId] : null;
          const totals = order ? calculateBillTotals(order) : null;

          return (
            <div
              key={table.id}
              onClick={() => onSelectTable(table)}
              className={`group cursor-pointer rounded-3xl p-5 border transition duration-200 flex flex-col justify-between shadow-sm hover:shadow-lg relative overflow-hidden ${
                isOccupied
                  ? 'bg-white dark:bg-slate-900 border-amber-300 dark:border-amber-700/60 ring-1 ring-amber-400/30'
                  : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-brand-400 dark:hover:border-brand-500'
              }`}
            >
              {/* Top Accent line if occupied */}
              {isOccupied && (
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 to-brand-500" />
              )}

              {/* Table Number & Status Indicator */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-9 h-9 rounded-xl font-bold flex items-center justify-center text-sm shadow-sm ${
                        isOccupied
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {table.number}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight">
                        {table.name}
                      </h3>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                        {table.section}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* EDIT TABLE BUTTON */}
                    <button
                      onClick={(e) => handleEditTableClick(e, table)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition"
                      title="Edit table details (number, capacity, section)"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5 ${
                        isOccupied
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isOccupied ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                        }`}
                      />
                      {isOccupied ? 'Dining' : 'Available'}
                    </span>
                  </div>
                </div>

                {/* Table Content Details */}
                <div className="py-2">
                  {isOccupied && order ? (
                    <div className="space-y-1.5 bg-amber-50/50 dark:bg-amber-950/20 p-3 rounded-2xl border border-amber-200/60 dark:border-amber-800/40">
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs text-slate-500 dark:text-slate-400">Current Bill:</span>
                        <span className="font-extrabold text-amber-700 dark:text-amber-400 text-lg font-['Outfit']">
                          {hotelInfo.currency}{totals?.grandTotal || 0}
                        </span>
                      </div>

                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {order.guestName}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <span>{order.items.reduce((s, i) => s + i.quantity, 0)} items</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          Dining
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-center">
                      <Users className="w-6 h-6 text-slate-300 dark:text-slate-600 mx-auto mb-1" />
                      <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        Seats {table.capacity} Guests
                      </div>
                      <div className="text-[11px] text-brand-600 dark:text-brand-400 mt-1 font-semibold group-hover:underline">
                        + Start New Order
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">
                  {table.capacity} Person Seating
                </span>

                <div className="flex items-center gap-1 font-semibold text-brand-600 dark:text-brand-400 group-hover:translate-x-0.5 transition">
                  <span>{isOccupied ? 'Open POS & Bill' : 'Assign Table'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Table Modal */}
      <AddEditTableModal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        tableToEdit={tableToEdit}
      />
    </div>
  );
};
