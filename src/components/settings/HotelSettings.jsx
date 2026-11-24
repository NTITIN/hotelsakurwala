import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ROLES } from '../../constants/roles';
import {
  Building2,
  Save,
  RotateCcw,
  Percent,
  Shield,
  Receipt,
  CheckCircle2,
  Lock,
  Sparkles,
  Printer,
  Bluetooth,
  Smartphone
} from 'lucide-react';

export const HotelSettings = () => {
  const { hotelInfo, setHotelInfo, resetAllDataToDemo } = useHotel();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({ ...hotelInfo });
  const isAdmin = currentUser?.role === ROLES.ADMIN;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!isAdmin) {
      addToast('Only System Administrators can change hotel profile & tax settings.', 'error', 'Permission Denied');
      return;
    }

    setHotelInfo({
      ...formData,
      taxRate: Number(formData.taxRate) || 5,
      serviceChargeRate: Number(formData.serviceChargeRate) || 5
    });
    addToast('Hotel configuration saved successfully.', 'success', 'Settings Saved');
  };

  const handleReset = () => {
    if (window.confirm('Reset all menu items, tables, and past invoices back to luxury demo state?')) {
      resetAllDataToDemo();
      setFormData({ ...hotelInfo });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-['Outfit']">
            Hotel & Billing Configuration
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Customize restaurant branding, tax rates, GSTIN, and receipt footer
          </p>
        </div>

        {!isAdmin && (
          <div className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-semibold flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            <span>Settings Locked (Admin Only)</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Hotel Identity */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-brand-500" />
            Hotel Identity & Location
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Hotel / Restaurant Name
              </label>
              <input
                type="text"
                name="name"
                disabled={!isAdmin}
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none disabled:opacity-60"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tagline / Specialty
              </label>
              <input
                type="text"
                name="tagline"
                disabled={!isAdmin}
                value={formData.tagline}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none disabled:opacity-60"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Physical Address (Appears on printed receipts)
              </label>
              <input
                type="text"
                name="address"
                disabled={!isAdmin}
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none disabled:opacity-60"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Contact Phone Number
              </label>
              <input
                type="text"
                name="phone"
                disabled={!isAdmin}
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Billing Email
              </label>
              <input
                type="email"
                name="email"
                disabled={!isAdmin}
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none disabled:opacity-60"
              />
            </div>
          </div>
        </div>

        {/* Taxes & Currency */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Percent className="w-5 h-5 text-amber-500" />
            Taxation & Currency Rules
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Currency Symbol
              </label>
              <select
                name="currency"
                disabled={!isAdmin}
                value={formData.currency}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none disabled:opacity-60 font-bold"
              >
                <option value="₹">₹ (Indian Rupee - INR)</option>
                <option value="$">$ (US Dollar - USD)</option>
                <option value="€">€ (Euro - EUR)</option>
                <option value="£">£ (British Pound - GBP)</option>
                <option value="AED">AED (UAE Dirham)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                GST / VAT Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                name="taxRate"
                disabled={!isAdmin}
                value={formData.taxRate}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none disabled:opacity-60 font-semibold"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Split equally: {(formData.taxRate / 2).toFixed(1)}% CGST + {(formData.taxRate / 2).toFixed(1)}% SGST
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Service Charge (%)
              </label>
              <input
                type="number"
                step="0.1"
                name="serviceChargeRate"
                disabled={!isAdmin}
                value={formData.serviceChargeRate}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none disabled:opacity-60 font-semibold"
              />
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="checkbox"
                  id="enableServiceCharge"
                  name="enableServiceCharge"
                  disabled={!isAdmin}
                  checked={formData.enableServiceCharge}
                  onChange={handleChange}
                  className="rounded text-brand-600"
                />
                <label htmlFor="enableServiceCharge" className="text-[11px] text-slate-600 dark:text-slate-400">
                  Enable Service Charge
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                GSTIN Number
              </label>
              <input
                type="text"
                name="gstin"
                disabled={!isAdmin}
                value={formData.gstin}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm uppercase font-mono disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                FSSAI License #
              </label>
              <input
                type="text"
                name="fssai"
                disabled={!isAdmin}
                value={formData.fssai}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                UPI Merchant ID (VPA)
              </label>
              <input
                type="text"
                name="upiId"
                disabled={!isAdmin}
                value={formData.upiId}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono disabled:opacity-60"
              />
            </div>
          </div>
        </div>

        {/* Thermal Printer Hardware Configuration (Shreyans 588) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Printer className="w-5 h-5 text-brand-500" />
              Thermal Receipt Printer Setup (Shreyans 588)
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Connected: 58mm Mobile Thermal
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Connected Printer Model
              </label>
              <input
                type="text"
                name="printerModel"
                disabled={!isAdmin}
                value={formData.printerModel || 'SHREYANS Mini Mobile (58mm Bill Smart 588)'}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Default Thermal Paper Format
              </label>
              <select
                name="defaultPrinterPaper"
                disabled={!isAdmin}
                value={formData.defaultPrinterPaper || '58mm'}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none disabled:opacity-60 font-medium"
              >
                <option value="58mm">58mm (2-inch Mini Mobile - Shreyans 588) [Recommended]</option>
                <option value="80mm">80mm (3-inch Desktop Thermal POS)</option>
                <option value="a4">A4 Formal Tax Invoice</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showQrOn58mm"
                name="showQrOn58mm"
                disabled={!isAdmin}
                checked={formData.showQrOn58mm !== false}
                onChange={handleChange}
                className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
              />
              <label htmlFor="showQrOn58mm" className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                Include Compact UPI QR Code on 58mm Receipt
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showFssaiGstinOn58mm"
                name="showFssaiGstinOn58mm"
                disabled={!isAdmin}
                checked={formData.showFssaiGstinOn58mm !== false}
                onChange={handleChange}
                className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
              />
              <label htmlFor="showFssaiGstinOn58mm" className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                Include GSTIN &amp; FSSAI on 58mm Receipt
              </label>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
            <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <Bluetooth className="w-4 h-4 text-brand-500" />
              <span>Quick Bluetooth Pairing for Shreyans 588:</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Turn ON printer → Open Windows Settings → <strong>Bluetooth &amp; devices</strong> → <strong>Add device</strong> → Select <strong>588</strong> or <strong>MTP-II</strong> (PIN: <code className="text-amber-600 font-mono font-bold">0000</code> or <code className="text-amber-600 font-mono font-bold">1234</code>). In Chrome/Edge Print dialog, choose Paper Size: <strong>58mm x 210mm</strong>, Margins: <strong>None</strong>.
            </p>
          </div>
        </div>

        {/* Receipt Footer Message */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-500" />
            Receipt Disclaimer & Thank You Note
          </h2>

          <div>
            <textarea
              rows={3}
              name="receiptFooter"
              disabled={!isAdmin}
              value={formData.receiptFooter}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none disabled:opacity-60"
            />
          </div>
        </div>

        {/* Save & Reset Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset to Demo Data</span>
          </button>

          {isAdmin && (
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-brand-600/30 flex items-center gap-2 transition transform active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
