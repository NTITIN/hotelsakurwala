import React, { useState, useMemo } from 'react';
import { useHotel } from '../../context/HotelContext';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  Plus,
  Layers,
  Edit2,
  Trash2,
  Clock,
  Sparkles,
  Filter,
  CheckCircle2,
  XCircle,
  Lock,
  ArrowUpDown
} from 'lucide-react';
import { AddEditMenuItemModal } from './AddEditMenuItemModal';
import { CategoryManagerModal } from './CategoryManagerModal';

export const MenuManagement = () => {
  const { menu, categories, deleteMenuItem, toggleItemAvailability, hotelInfo } = useHotel();
  const { isAuthorizedToManageMenu, currentUser } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL'); // ALL, veg, non-veg
  const [sortBy, setSortBy] = useState('default'); // default, price-asc, price-desc, name

  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    return menu
      .filter((item) => {
        const matchesSearch =
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory =
          selectedCategory === 'ALL' || item.category === selectedCategory;

        const matchesType =
          typeFilter === 'ALL' || item.type === typeFilter;

        return matchesSearch && matchesCategory && matchesType;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return 0;
      });
  }, [menu, searchTerm, selectedCategory, typeFilter, sortBy]);

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsAddEditModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setIsAddEditModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-['Outfit']">
              Menu & Price Catalog
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
              {menu.length} Dishes
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure dishes, categories, pricing, and live kitchen stock
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold flex items-center gap-2 transition"
          >
            <Layers className="w-4 h-4 text-amber-500" />
            <span>Categories ({categories.length})</span>
          </button>

          {isAuthorizedToManageMenu ? (
            <button
              onClick={handleAddNew}
              className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-md shadow-brand-600/30 transition transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Menu Item</span>
            </button>
          ) : (
            <div className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs flex items-center gap-1.5 border border-slate-200 dark:border-slate-700">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Menu Editing Restricted ({currentUser?.role})</span>
            </div>
          )}
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Bar (6 cols) */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by dish name, category, or ingredients..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Type Filter (3 cols) */}
          <div className="md:col-span-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              <option value="ALL">All Dietary Types</option>
              <option value="veg">🟢 Pure Vegetarian</option>
              <option value="non-veg">🔴 Non-Vegetarian</option>
              <option value="vegan">🌱 Vegan</option>
              <option value="beverage">🍹 Mocktails & Beverages</option>
            </select>
          </div>

          {/* Sort By (3 cols) */}
          <div className="md:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              <option value="default">Sort: Default Order</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Name: Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Category Pills Slider */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === 'ALL'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Categories ({menu.length})
          </button>

          {categories.map((cat) => {
            const count = menu.filter((i) => i.category === cat.name).length;
            const isSelected = selectedCategory === cat.name;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{cat.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-white/25 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Menu Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400">
          <UtensilsCrossed className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No dishes found</h3>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search keyword or selected category filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const isVeg = item.type === 'veg' || item.type === 'vegan';
            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border transition duration-200 flex flex-col justify-between bg-white dark:bg-slate-900 ${
                  !item.available
                    ? 'opacity-65 border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50'
                    : 'border-slate-200/80 dark:border-slate-800 hover:shadow-md'
                }`}
              >
                <div>
                  {/* Category & Veg/Non-Veg Tag */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2 py-0.5 rounded-md border border-brand-200 dark:border-brand-800/40">
                      {item.category}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {/* Veg / Non-Veg Icon */}
                      <span
                        className={`w-3.5 h-3.5 border flex items-center justify-center rounded-sm ${
                          isVeg ? 'border-emerald-600' : 'border-rose-600'
                        }`}
                        title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                          }`}
                        />
                      </span>
                      <span className="text-[11px] font-medium text-slate-500 capitalize">
                        {item.type}
                      </span>
                    </div>
                  </div>

                  {/* Title and Price */}
                  <div className="flex items-start justify-between gap-2 mt-1">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug">
                      {item.name}
                    </h3>
                    <div className="font-extrabold text-slate-900 dark:text-white text-lg font-['Outfit'] whitespace-nowrap">
                      {hotelInfo.currency}{item.price}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {item.description || 'Delicately prepared with house-special ingredients and spices.'}
                  </p>
                </div>

                {/* Footer Controls: Prep time, Stock Toggle, Edit/Delete */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{item.prepTime || '15 mins'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* In Stock toggle */}
                    <button
                      onClick={() => toggleItemAvailability(item.id)}
                      disabled={!isAuthorizedToManageMenu}
                      className={`text-[11px] font-medium px-2 py-1 rounded-lg border transition ${
                        item.available
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                          : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                      }`}
                    >
                      {item.available ? 'In Stock' : '86’d'}
                    </button>

                    {/* Edit button */}
                    {isAuthorizedToManageMenu && (
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        title="Edit dish & price"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Delete button */}
                    {isAuthorizedToManageMenu && (
                      <button
                        onClick={() => deleteMenuItem(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                        title="Delete dish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      <AddEditMenuItemModal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        editItem={editingItem}
        onOpenCategoryModal={() => {
          setIsAddEditModalOpen(false);
          setIsCategoryModalOpen(true);
        }}
      />

      {/* Category Manager Modal */}
      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />
    </div>
  );
};
