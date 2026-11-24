import React, { useState, useMemo } from 'react';
import { useHotel } from '../../context/HotelContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Receipt,
  Search,
  Printer,
  Download,
  Filter,
  CheckCircle2,
  Lock,
  Calendar,
  CreditCard,
  Banknote,
  QrCode,
  FileSpreadsheet,
  Edit2,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { ManagerOverrideModal } from '../common/ManagerOverrideModal';
import { EditInvoiceModal } from './EditInvoiceModal';

export const InvoiceHistory = ({ onReprintInvoice, onNavigateToReports }) => {
  const { invoices, hotelInfo } = useHotel();
  const { isAuthorizedToPrint, currentUser } = useAuth();
  const { addToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [selectedInvoiceForOverride, setSelectedInvoiceForOverride] = useState(null);
  const [overrideActionType, setOverrideActionType] = useState('reprint'); // 'reprint' or 'edit'

  const [invoiceToEdit, setInvoiceToEdit] = useState(null);

  // Filter invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch =
        inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(inv.tableNumber).includes(searchTerm) ||
        inv.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.printedBy?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesMethod =
        methodFilter === 'ALL' || inv.paymentMethod === methodFilter;

      return matchesSearch && matchesMethod;
    });
  }, [invoices, searchTerm, methodFilter]);

  const totalCollected = filteredInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);

  const handleReprint = (inv) => {
    if (isAuthorizedToPrint) {
      onReprintInvoice(inv, currentUser);
    } else {
      setOverrideActionType('reprint');
      setSelectedInvoiceForOverride(inv);
    }
  };

  const handleEditClick = (inv) => {
    if (isAuthorizedToPrint) {
      setInvoiceToEdit(inv);
    } else {
      setOverrideActionType('edit');
      setSelectedInvoiceForOverride(inv);
    }
  };

  const handleExportCSV = () => {
    if (invoices.length === 0) {
      addToast('No invoices to export.', 'warning', 'Export Empty');
      return;
    }

    const headers = [
      'Invoice Number',
      'Table Number',
      'Section',
      'Guest Name',
      'Guest Phone',
      'Server Name',
      'Printed By',
      'Subtotal',
      'CGST',
      'SGST',
      'Service Charge',
      'Grand Total',
      'Payment Method',
      'Settled At',
      'Is Edited',
      'Edited By'
    ];

    const rows = invoices.map((inv) => [
      inv.invoiceNumber,
      inv.tableNumber,
      `"${inv.section || ''}"`,
      `"${inv.guestName || ''}"`,
      `"${inv.guestPhone || ''}"`,
      `"${inv.serverName || ''}"`,
      `"${inv.printedBy || ''}"`,
      inv.subtotal,
      inv.cgst,
      inv.sgst,
      inv.serviceCharge,
      inv.grandTotal,
      inv.paymentMethod,
      inv.settledAt,
      inv.isEdited ? 'Yes' : 'No',
      `"${inv.editedBy || ''}"`
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hotel_invoices_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('Invoices report downloaded as CSV.', 'success', 'Export Complete');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-['Outfit']">
              Invoices & Billing Audit Log
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {invoices.length} Bills
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Complete transaction ledger with edit, re-calculation, and reprint authorization controls
          </p>
        </div>

        {/* Export & Actions */}
        <div className="flex items-center gap-2.5">
          {onNavigateToReports && (
            <button
              onClick={onNavigateToReports}
              className="px-3.5 py-2.5 rounded-xl bg-brand-50 dark:bg-brand-950/40 hover:bg-brand-100 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 text-xs sm:text-sm font-semibold flex items-center gap-2 transition"
            >
              <BarChart3 className="w-4 h-4 text-brand-600" />
              <span>Day / Month / Year Reports</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold flex items-center gap-2 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export to CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Bill #, Table, Guest, or Staff..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Method Filter */}
        <div className="flex items-center gap-1.5 self-end md:self-auto overflow-x-auto no-scrollbar">
          {['ALL', 'UPI', 'CARD', 'CASH'].map((method) => (
            <button
              key={method}
              onClick={() => setMethodFilter(method)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                methodFilter === method
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {method === 'ALL' ? 'All Payments' : method}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3.5 pl-6">Invoice #</th>
                <th className="py-3.5 px-3">Table</th>
                <th className="py-3.5 px-3">Guest Details</th>
                <th className="py-3.5 px-3">Printed By</th>
                <th className="py-3.5 px-3">Items Summary</th>
                <th className="py-3.5 px-3">Payment</th>
                <th className="py-3.5 px-3 text-right">Grand Total</th>
                <th className="py-3.5 pr-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Receipt className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                    <p className="font-semibold text-slate-600 dark:text-slate-300">No invoices match your filter</p>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.invoiceNumber} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-4 pl-6 font-mono font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-1.5">
                        <span>{inv.invoiceNumber}</span>
                        {inv.isEdited && (
                          <span
                            className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                            title={`Edited by: ${inv.editedBy || 'Manager'}`}
                          >
                            REVISED
                          </span>
                        )}
                      </div>
                      <span className="block text-[10px] text-slate-400 font-sans mt-0.5">
                        {new Date(inv.settledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>

                    <td className="py-4 px-3 font-semibold text-slate-800 dark:text-slate-200">
                      Table {inv.tableNumber}
                      <span className="text-[10px] text-slate-400 font-normal block">{inv.section}</span>
                    </td>

                    <td className="py-4 px-3">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{inv.guestName}</div>
                      <div className="text-[10px] text-slate-400">{inv.guestPhone || `${inv.guestCount || 2} Guests`}</div>
                    </td>

                    <td className="py-4 px-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                        <Printer className="w-3 h-3 text-brand-500" />
                        {inv.printedBy}
                      </span>
                    </td>

                    <td className="py-4 px-3 text-slate-600 dark:text-slate-400 max-w-[200px]">
                      <div className="truncate">
                        {inv.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {inv.items.reduce((s, i) => s + i.quantity, 0)} total items
                      </div>
                    </td>

                    <td className="py-4 px-3">
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                        {inv.paymentMethod === 'UPI' && <QrCode className="w-3.5 h-3.5 text-blue-500" />}
                        {inv.paymentMethod === 'CARD' && <CreditCard className="w-3.5 h-3.5 text-purple-500" />}
                        {inv.paymentMethod === 'CASH' && <Banknote className="w-3.5 h-3.5 text-emerald-500" />}
                        {inv.paymentMethod}
                      </span>
                    </td>

                    <td className="py-4 px-3 text-right">
                      <div className="font-extrabold text-slate-900 dark:text-white text-base font-['Outfit']">
                        {hotelInfo.currency}{inv.grandTotal.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-emerald-600 font-semibold">PAID</div>
                    </td>

                    <td className="py-4 pr-6 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        {/* EDIT INVOICE BUTTON */}
                        <button
                          onClick={() => handleEditClick(inv)}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1 transition ${
                            isAuthorizedToPrint
                              ? 'bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          }`}
                          title={
                            isAuthorizedToPrint
                              ? 'Edit Invoice details, items or payment'
                              : 'Editing requires Manager or Admin authorization'
                          }
                        >
                          <Edit2 className="w-3.5 h-3.5 text-amber-600" />
                          <span>Edit</span>
                        </button>

                        {/* REPRINT INVOICE BUTTON */}
                        <button
                          onClick={() => handleReprint(inv)}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1 transition ${
                            isAuthorizedToPrint
                              ? 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200'
                              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                          }`}
                          title={
                            isAuthorizedToPrint
                              ? 'Reprint Invoice Receipt'
                              : 'Reprint requires Manager/Admin PIN'
                          }
                        >
                          {isAuthorizedToPrint ? (
                            <>
                              <Printer className="w-3.5 h-3.5 text-brand-600" />
                              <span>Print</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-3.5 h-3.5 text-rose-600" />
                              <span>Print (Mgr)</span>
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Invoice Modal */}
      <EditInvoiceModal
        isOpen={Boolean(invoiceToEdit)}
        onClose={() => setInvoiceToEdit(null)}
        invoice={invoiceToEdit}
        onSaveSuccess={() => {
          setInvoiceToEdit(null);
        }}
        onSaveAndPrint={(updatedInv) => {
          setInvoiceToEdit(null);
          onReprintInvoice(updatedInv, currentUser);
        }}
      />

      {/* Override Modal if Waiter attempts to reprint or edit */}
      {selectedInvoiceForOverride && (
        <ManagerOverrideModal
          isOpen={true}
          onClose={() => setSelectedInvoiceForOverride(null)}
          onSuccess={(mgr) => {
            if (overrideActionType === 'edit') {
              setInvoiceToEdit(selectedInvoiceForOverride);
            } else {
              onReprintInvoice(selectedInvoiceForOverride, mgr);
            }
            setSelectedInvoiceForOverride(null);
          }}
          title={
            overrideActionType === 'edit'
              ? 'Manager Authorization to Edit Invoice'
              : 'Manager Authorization to Reprint Invoice'
          }
        />
      )}
    </div>
  );
};
