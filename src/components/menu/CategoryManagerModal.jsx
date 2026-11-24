import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { X, Layers, Plus, Trash2, Tag, AlertCircle } from 'lucide-react';

export const CategoryManagerModal = ({ isOpen, onClose }) => {
  const { categories, addCategory, deleteCategory, menu } = useHotel();
  const [newCatName, setNewCatName] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e) => {
    e.preventDefault();
    if (addCategory(newCatName)) {
      setNewCatName('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-base">
                Manage Categories
              </h2>
              <p className="text-xs text-slate-500">
                Organize menu items into dining sections
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

        {/* Form to Add New Category */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="e.g. Seafood Delights, Sizzlers..."
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm flex items-center gap-1.5 shadow-md shadow-brand-600/30 transition transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </form>
        </div>

        {/* Existing Categories List */}
        <div className="p-6 overflow-y-auto space-y-2 flex-1">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Current Categories ({categories.length})
          </div>

          {categories.map((cat) => {
            const itemCount = menu.filter((item) => item.category === cat.name).length;
            return (
              <div
                key={cat.id}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
              >
                <div className="flex items-center gap-2.5">
                  <Tag className="w-4 h-4 text-brand-500" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                    {cat.name}
                  </span>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                  </span>
                </div>

                <button
                  onClick={() => deleteCategory(cat.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                  title={itemCount > 0 ? "Cannot delete category in use" : "Delete category"}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
