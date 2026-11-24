import React, { useState, useEffect } from 'react';
import { useHotel } from '../../context/HotelContext';
import { useToast } from '../../context/ToastContext';
import {
  X,
  Grid,
  Users,
  Tag,
  Trash2,
  Save,
  Plus,
  Edit2,
  AlertCircle
} from 'lucide-react';

export const AddEditTableModal = ({ isOpen, onClose, tableToEdit = null }) => {
  const { tables, addTable, updateTable, deleteTable } = useHotel();
  const { addToast } = useToast();

  const [number, setNumber] = useState('');
  const [name, setName] = useState('');
  const [section, setSection] = useState('Main Dining');
  const [customSection, setCustomSection] = useState('');
  const [capacity, setCapacity] = useState('4');

  // Existing unique sections
  const existingSections = Array.from(new Set(tables.map((t) => t.section))).filter(Boolean);

  useEffect(() => {
    if (tableToEdit) {
      setNumber(String(tableToEdit.number));
      setName(tableToEdit.name || `Table ${tableToEdit.number}`);
      setSection(tableToEdit.section || 'Main Dining');
      setCustomSection('');
      setCapacity(String(tableToEdit.capacity || 4));
    } else {
      // Suggest next available table number
      const maxNum = Math.max(0, ...tables.map((t) => t.number || 0));
      const nextNum = maxNum + 1;
      setNumber(String(nextNum));
      setName(`Table ${nextNum}`);
      setSection(existingSections[0] || 'Main Dining');
      setCustomSection('');
      setCapacity('4');
    }
  }, [tableToEdit, isOpen, tables]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    const numVal = Number(number);
    if (!numVal || numVal <= 0) {
      addToast('Please enter a valid table number greater than 0', 'error', 'Invalid Number');
      return;
    }

    const finalSection = section === 'CUSTOM' ? customSection.trim() || 'Main Dining' : section;
    const finalCapacity = Number(capacity) || 4;
    const finalName = name.trim() || `Table ${numVal}`;

    if (tableToEdit) {
      const res = updateTable({
        id: tableToEdit.id,
        number: numVal,
        name: finalName,
        section: finalSection,
        capacity: finalCapacity
      });
      if (res) onClose();
    } else {
      const res = addTable({
        number: numVal,
        name: finalName,
        section: finalSection,
        capacity: finalCapacity
      });
      if (res) onClose();
    }
  };

  const handleDelete = () => {
    if (!tableToEdit) return;
    if (window.confirm(`Are you sure you want to remove ${tableToEdit.name} from the floor?`)) {
      if (deleteTable(tableToEdit.id)) {
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400">
              {tableToEdit ? <Edit2 className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-base">
                {tableToEdit ? `Edit ${tableToEdit.name}` : 'Add New Dining Table'}
              </h2>
              <p className="text-xs text-slate-500">
                {tableToEdit
                  ? 'Update table number, seating capacity or dining section'
                  : 'Assign a new table to your hotel floor layout'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {tableToEdit?.status === 'occupied' && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                This table is currently <strong>occupied</strong> with an active order. Changes will sync with the live bill.
              </span>
            </div>
          )}

          {/* Table Number & Capacity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Table Number *
              </label>
              <input
                type="number"
                min="1"
                value={number}
                onChange={(e) => {
                  const val = e.target.value;
                  setNumber(val);
                  if (!tableToEdit || name.startsWith('Table ')) {
                    setName(`Table ${val}`);
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold focus:ring-2 focus:ring-brand-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Seating Capacity *
              </label>
              <div className="relative">
                <Users className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Table Display Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Display Name / Title
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Table 05, VIP Terrace 01, Garden Cabana"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              required
            />
          </div>

          {/* Dining Section / Area */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Floor / Dining Section
            </label>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              {existingSections.map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
              <option value="CUSTOM">+ Add New Section...</option>
            </select>
          </div>

          {/* Custom Section input if CUSTOM chosen */}
          {section === 'CUSTOM' && (
            <div className="animate-in fade-in">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                New Section Name
              </label>
              <input
                type="text"
                value={customSection}
                onChange={(e) => setCustomSection(e.target.value)}
                placeholder="e.g. Poolside Cabana, Banquet Hall, Courtyard"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                required
              />
            </div>
          )}

          {/* Quick Capacity Suggestions */}
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
              Quick Capacity Preset:
            </span>
            <div className="flex gap-2">
              {[2, 4, 6, 8, 10, 12].map((cap) => (
                <button
                  key={cap}
                  type="button"
                  onClick={() => setCapacity(String(cap))}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border transition ${
                    Number(capacity) === cap
                      ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  {cap}p
                </button>
              ))}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            {tableToEdit ? (
              <button
                type="button"
                onClick={handleDelete}
                className="p-2.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 transition flex items-center gap-1.5 text-xs font-semibold"
                title="Remove table from floor"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-600/30 transition transform active:scale-95 flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>{tableToEdit ? 'Save Changes' : 'Create Table'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
