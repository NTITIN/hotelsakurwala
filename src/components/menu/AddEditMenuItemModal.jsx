import React, { useState, useEffect } from 'react';
import { useHotel } from '../../context/HotelContext';
import { useToast } from '../../context/ToastContext';
import { X, UtensilsCrossed, Plus, Clock, Tag } from 'lucide-react';

export const AddEditMenuItemModal = ({ isOpen, onClose, editItem = null, onOpenCategoryModal }) => {
  const { categories, addMenuItem, updateMenuItem, hotelInfo } = useHotel();
  const { addToast } = useToast();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState('veg');
  const [prepTime, setPrepTime] = useState('15 mins');
  const [description, setDescription] = useState('');
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    if (editItem) {
      setName(editItem.name || '');
      setCategory(editItem.category || (categories[0]?.name || ''));
      setPrice(editItem.price !== undefined ? String(editItem.price) : '');
      setType(editItem.type || 'veg');
      setPrepTime(editItem.prepTime || '15 mins');
      setDescription(editItem.description || '');
      setAvailable(editItem.available !== undefined ? editItem.available : true);
    } else {
      setName('');
      setCategory(categories[0]?.name || '');
      setPrice('');
      setType('veg');
      setPrepTime('15 mins');
      setDescription('');
      setAvailable(true);
    }
  }, [editItem, categories, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      addToast('Please enter an item name', 'error', 'Missing Field');
      return;
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      addToast('Please enter a valid price greater than 0', 'error', 'Invalid Price');
      return;
    }

    if (!category) {
      addToast('Please select a category', 'error', 'Missing Category');
      return;
    }

    const payload = {
      name: name.trim(),
      category,
      price: numPrice,
      type,
      prepTime: prepTime.trim() || '15 mins',
      description: description.trim(),
      available
    };

    if (editItem) {
      updateMenuItem({ ...payload, id: editItem.id });
    } else {
      addMenuItem(payload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-base">
                {editItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h2>
              <p className="text-xs text-slate-500">
                Define dish details, category, and pricing
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

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Item Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Dish / Item Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Truffle Mushroom Risotto"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              required
            />
          </div>

          {/* Category Dropdown + Quick Add */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Category *
              </label>
              <button
                type="button"
                onClick={onOpenCategoryModal}
                className="text-[11px] text-brand-600 dark:text-brand-400 hover:underline font-semibold flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Manage Categories
              </button>
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              required
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Price & Food Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Price ({hotelInfo.currency}) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                  {hotelInfo.currency}
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="350"
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none font-semibold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Dietary Preference
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="veg">🟢 Pure Vegetarian</option>
                <option value="non-veg">🔴 Non-Vegetarian</option>
                <option value="vegan">🌱 Vegan</option>
                <option value="beverage">🍹 Beverage / Mocktail</option>
              </select>
            </div>
          </div>

          {/* Prep Time & Stock Availability */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Avg Preparation Time
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={prepTime}
                  onChange={(e) => setPrepTime(e.target.value)}
                  placeholder="15 mins"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Availability Status
              </label>
              <div className="flex items-center gap-3 pt-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={available}
                    onChange={(e) => setAvailable(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {available ? 'In Stock (Active)' : '86’d (Out of Stock)'}
                </span>
              </div>
            </div>
          </div>

          {/* Description / Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description & Ingredients
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Fresh farm ingredients, spices, allergen notes..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold shadow-md shadow-brand-600/30 transition transform active:scale-95"
            >
              {editItem ? 'Save Changes' : 'Add to Menu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
