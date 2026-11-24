import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  injectThermalPageStyle,
  buildEscPos58mm,
  printViaWebBluetooth,
  PRINTER_SPECS
} from '../../utils/thermalPrinter';
import {
  X,
  Printer,
  FileText,
  Building2,
  CheckCircle,
  QrCode,
  Download,
  Share2,
  Lock,
  ShieldCheck,
  Edit2,
  Smartphone,
  Bluetooth,
  HelpCircle,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const InvoicePrintModal = ({
  isOpen,
  onClose,
  table,
  order,
  totals,
  authorizedBy,
  completedInvoice = null,
  onOpenEdit = null
}) => {
  const { hotelInfo } = useHotel();
  const { currentUser, isAuthorizedToPrint } = useAuth();
  const { addToast } = useToast();

  // Default to 58mm for the connected SHREYANS Mini Mobile Thermal Printer
  const [printFormat, setPrintFormat] = useState(hotelInfo.defaultPrinterPaper || '58mm'); // '58mm', '80mm', or 'a4'
  const [showBluetoothGuide, setShowBluetoothGuide] = useState(false);
  const [isBluetoothSending, setIsBluetoothSending] = useState(false);

  if (!isOpen) return null;

  // Determine invoice data
  const invoiceNum =
    completedInvoice?.invoiceNumber ||
    `INV-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`;

  const printOfficer = authorizedBy || currentUser;

  const invoiceItems = completedInvoice?.items || order?.items || [];
  const grandTotal = completedInvoice?.grandTotal || totals?.grandTotal || 0;
  const subtotal = completedInvoice?.subtotal || totals?.subtotal || 0;
  const totalTax = completedInvoice ? completedInvoice.cgst + completedInvoice.sgst : totals?.totalTax || 0;
  const cgst = completedInvoice?.cgst !== undefined ? completedInvoice.cgst : totals?.cgst || 0;
  const sgst = completedInvoice?.sgst !== undefined ? completedInvoice.sgst : totals?.sgst || 0;
  const serviceCharge = completedInvoice?.serviceCharge !== undefined ? completedInvoice.serviceCharge : totals?.serviceCharge || 0;
  const discountAmount = completedInvoice?.discountAmount !== undefined ? completedInvoice.discountAmount : totals?.discountAmount || 0;
  const tableName = completedInvoice?.tableName || table?.name || `Table ${table?.number}`;
  const section = completedInvoice?.section || table?.section || 'Main Dining';
  const guestName = completedInvoice?.guestName || order?.guestName || 'Guest';
  const paymentMode = completedInvoice?.paymentMode || 'Cash / UPI';

  // Standard Browser Print with exact 58mm / 80mm / A4 page injection
  const handleNativePrint = () => {
    // Inject exact dimensions for the chosen format
    injectThermalPageStyle(printFormat);

    addToast(
      printFormat === '58mm'
        ? `Sending 58mm receipt to SHREYANS Mini Mobile Printer...`
        : `Sending ${printFormat} print job to printer...`,
      'success',
      'Sent to Printer'
    );

    // Short timeout to allow page CSS to apply smoothly
    setTimeout(() => {
      window.print();
    }, 50);
  };

  // Direct Web Bluetooth ESC/POS Print (for Chrome / Edge on PC & Android)
  const handleDirectBluetoothPrint = async () => {
    try {
      setIsBluetoothSending(true);
      const rawEscPos = buildEscPos58mm({
        hotelInfo,
        invoiceNum,
        tableName,
        section,
        guestName,
        cashierName: printOfficer?.name || 'Admin',
        items: invoiceItems,
        subtotal,
        taxRate: hotelInfo.taxRate,
        cgst,
        sgst,
        serviceCharge,
        discountAmount,
        grandTotal,
        isTestSlip: false
      });

      const result = await printViaWebBluetooth(rawEscPos);
      addToast(
        `Successfully printed via Bluetooth to ${result.deviceName}!`,
        'success',
        'Bluetooth Print Successful'
      );
    } catch (err) {
      console.warn('Bluetooth print fallback:', err);
      addToast(
        err.message || 'Bluetooth connection cancelled. Using standard Print dialog instead.',
        'info',
        'Using Standard Print'
      );
      // Fallback to native print
      handleNativePrint();
    } finally {
      setIsBluetoothSending(false);
    }
  };

  // Quick 58mm Test Slip Print for Shreyans 588
  const handlePrintTestSlip = () => {
    injectThermalPageStyle('58mm');
    addToast(
      'Printing 58mm Test Alignment Slip on SHREYANS 588...',
      'success',
      'Test Slip Triggered'
    );
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[95vh]">
        
        {/* Top Controls Toolbar (Hidden in Print) */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/60 no-print">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                  Invoice Print &amp; POS Station
                </h2>
                {completedInvoice?.isEdited && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                    REVISED
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Auth: {printOfficer?.name} ({printOfficer?.role})
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Edit Invoice Button if completed invoice */}
            {completedInvoice && onOpenEdit && (
              <button
                onClick={() => {
                  onClose();
                  onOpenEdit(completedInvoice);
                }}
                className="px-2.5 py-1.5 rounded-xl border border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 text-xs font-semibold flex items-center gap-1.5 transition"
                title="Edit this invoice"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Edit Invoice</span>
              </button>
            )}

            {/* Paper Size Format Selector (58mm Default for Shreyans) */}
            <div className="flex items-center bg-slate-200 dark:bg-slate-700/80 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setPrintFormat('58mm')}
                className={`px-3 py-1 rounded-lg transition flex items-center gap-1.5 ${
                  printFormat === '58mm'
                    ? 'bg-brand-600 text-white shadow-xs font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-900'
                }`}
                title="SHREYANS Mini Mobile Receipt Printer (58mm Bill Smart 588)"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>58mm Mini</span>
                <span className="hidden md:inline-block text-[9px] bg-white/20 px-1 rounded">588</span>
              </button>

              <button
                onClick={() => setPrintFormat('80mm')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  printFormat === '80mm'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                80mm POS
              </button>

              <button
                onClick={() => setPrintFormat('a4')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  printFormat === 'a4'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                A4 Tax Bill
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Shreyans 588 Hardware Status Banner (Hidden in Print) */}
        {printFormat === '58mm' && (
          <div className="px-5 py-2.5 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border-b border-emerald-500/20 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300 no-print">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                Connected Model: <strong className="text-emerald-300 font-semibold">SHREYANS Mini Mobile 58mm Bill Smart (588)</strong>
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.2 rounded bg-emerald-900/60 text-emerald-300 text-[10px] font-mono border border-emerald-500/30">
                2-Inch Thermal Roll
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowBluetoothGuide(!showBluetoothGuide)}
                className="text-amber-400 hover:text-amber-300 text-xs font-semibold flex items-center gap-1 hover:underline"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Pairing / Paper Guide</span>
                {showBluetoothGuide ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
          </div>
        )}

        {/* Collapsible Bluetooth & Paper Guide (Hidden in Print) */}
        {showBluetoothGuide && printFormat === '58mm' && (
          <div className="p-4 bg-slate-900/90 border-b border-slate-700 text-xs text-slate-300 space-y-2 no-print animate-in fade-in">
            <div className="font-bold text-amber-300 flex items-center gap-1.5">
              <Bluetooth className="w-4 h-4 text-brand-400" />
              <span>SHREYANS 58mm Bill Smart (588) Setup Guide:</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] pt-1">
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                <strong className="text-white block mb-0.5">1. Turn ON Bluetooth:</strong>
                Turn ON the Shreyans printer (Power LED lights green). In Windows Settings → Bluetooth &amp; Devices → Add Device → Select "588" or "MTP-II". (Pairing PIN: <code className="text-amber-300 font-bold">0000</code> or <code className="text-amber-300 font-bold">1234</code>).
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                <strong className="text-white block mb-0.5">2. Print Dialog Settings:</strong>
                When the Windows Print dialog opens, set Paper Size to <strong className="text-amber-300">58mm x 210mm</strong> (or Roll Paper 58mm) and Margins to <strong className="text-amber-300">None / Minimum</strong>.
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                <strong className="text-white block mb-0.5">3. Web Bluetooth Direct:</strong>
                On Chrome/Edge, click the <strong className="text-brand-300">"Direct Bluetooth (ESC/POS)"</strong> button below to print directly via wireless GATT without opening the system dialog!
              </div>
            </div>
          </div>
        )}

        {/* Main Preview Container */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100 dark:bg-slate-950 flex justify-center items-start">
          
          {/* ========================================================
              FORMAT 1: 58mm DEDICATED SHREYANS MINI THERMAL RECEIPT
              ======================================================== */}
          {printFormat === '58mm' && (
            <div
              id="printable-invoice"
              data-format="58mm"
              className="format-58mm receipt-paper-58mm p-3 rounded-sm text-slate-900 border border-slate-300 shadow-xl transition-all"
            >
              {/* Jagged tear paper roll top */}
              <div className="receipt-tear-top -mx-3 mb-2" />

              {/* RESTAURANT HEADER */}
              <div className="text-center pb-2 border-b border-dashed border-slate-700">
                <h1 className="text-sm font-extrabold uppercase tracking-wide leading-tight text-slate-950">
                  {hotelInfo.name}
                </h1>
                <p className="text-[10px] text-slate-700 mt-0.5 font-sans leading-tight">
                  {hotelInfo.tagline}
                </p>
                <p className="text-[9px] text-slate-600 leading-tight mt-0.5">
                  {hotelInfo.address}
                </p>
                <p className="text-[9px] text-slate-600 mt-0.5">
                  Tel: {hotelInfo.phone}
                </p>
              </div>

              {/* SALES RECEIPT / TAX INVOICE HEADER (Matches Shreyans Sample!) */}
              <div className="py-1.5 text-center border-b border-dashed border-slate-700 font-bold text-xs uppercase tracking-wider text-slate-950">
                {completedInvoice?.isEdited ? 'TAX INVOICE (REVISED)' : 'SALES RECEIPT'}
              </div>

              {/* METADATA: COLON ALIGNED (Exact match to Shreyans sample!) */}
              <div className="py-2 border-b border-dashed border-slate-700 space-y-0.5 text-[10px] font-mono leading-tight">
                <div className="flex justify-between">
                  <span className="text-slate-600">Date</span>
                  <span className="font-bold">: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Receipt #</span>
                  <span className="font-bold">: {invoiceNum}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Table</span>
                  <span className="font-bold">: {tableName} ({section})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Guest</span>
                  <span>: {guestName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Cashier</span>
                  <span>: {printOfficer?.name || 'Admin'}</span>
                </div>
                {completedInvoice?.isEdited && (
                  <div className="text-[9px] text-amber-900 font-bold pt-1">
                    * Amended: {completedInvoice.editedBy || 'Manager'}
                  </div>
                )}
              </div>

              {/* 58MM ITEMS TABLE (Clean 3-column layout matching Shreyans) */}
              <div className="py-2 border-b border-dashed border-slate-700">
                {/* Header: Item | Qty | Amount */}
                <div className="flex justify-between font-bold pb-1 text-[10px] border-b border-slate-400">
                  <span className="flex-1 text-left">Item</span>
                  <span className="w-8 text-center">Qty</span>
                  <span className="w-16 text-right">Amount</span>
                </div>

                <div className="divide-y divide-slate-100 py-1 space-y-1 text-[10px] font-mono">
                  {invoiceItems.map((item, idx) => {
                    const itemAmt = ((item.price || item.rate || 0) * item.quantity).toFixed(2);
                    return (
                      <div key={idx} className="pt-1 leading-snug">
                        <div className="flex justify-between items-baseline">
                          <span className="flex-1 font-semibold text-slate-900 pr-1 break-words">
                            {item.name}
                          </span>
                          <span className="w-8 text-center text-slate-800">
                            {item.quantity}
                          </span>
                          <span className="w-16 text-right font-bold text-slate-950">
                            {itemAmt}
                          </span>
                        </div>
                        {item.quantity > 1 && (
                          <div className="text-[9px] text-slate-500 pl-1">
                            ({item.quantity} × {hotelInfo.currency}{(item.price || item.rate || 0).toFixed(2)})
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* TOTALS & TAX BREAKDOWN (Matches sample from Shreyans 588) */}
              <div className="py-2 border-b border-dashed border-slate-700 space-y-1 text-[10px] font-mono">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{hotelInfo.currency}{subtotal.toFixed(2)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-slate-800 font-semibold">
                    <span>Discount</span>
                    <span>-{hotelInfo.currency}{discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>CGST ({(hotelInfo.taxRate / 2).toFixed(1)}%)</span>
                  <span>{hotelInfo.currency}{cgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>SGST ({(hotelInfo.taxRate / 2).toFixed(1)}%)</span>
                  <span>{hotelInfo.currency}{sgst.toFixed(2)}</span>
                </div>

                {serviceCharge > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Service ({hotelInfo.serviceChargeRate}%)</span>
                    <span>{hotelInfo.currency}{serviceCharge.toFixed(2)}</span>
                  </div>
                )}

                {/* BOLD PROMINENT TOTAL (Matching Shreyans Sample!) */}
                <div className="pt-1.5 mt-1 border-t-2 border-slate-900 flex justify-between font-extrabold text-sm text-slate-950">
                  <span>TOTAL</span>
                  <span className="text-base font-black">{hotelInfo.currency}{grandTotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-[9px] text-slate-500 pt-0.5">
                  <span>Payment:</span>
                  <span className="font-semibold text-slate-800">{paymentMode}</span>
                </div>
              </div>

              {/* OPTIONAL COMPACT 58MM UPI QR CODE */}
              {hotelInfo.showQrOn58mm && (
                <div className="py-2 text-center border-b border-dashed border-slate-700">
                  <div className="inline-block p-1 bg-white border border-slate-300 rounded mb-1">
                    {/* Compact 58mm SVG QR code */}
                    <svg className="w-20 h-20 mx-auto" viewBox="0 0 100 100" fill="currentColor">
                      <rect x="5" y="5" width="28" height="28" fill="none" stroke="#000000" strokeWidth="5"/>
                      <rect x="12" y="12" width="14" height="14" fill="#000000"/>
                      <rect x="67" y="5" width="28" height="28" fill="none" stroke="#000000" strokeWidth="5"/>
                      <rect x="74" y="12" width="14" height="14" fill="#000000"/>
                      <rect x="5" y="67" width="28" height="28" fill="none" stroke="#000000" strokeWidth="5"/>
                      <rect x="12" y="74" width="14" height="14" fill="#000000"/>
                      <rect x="38" y="10" width="8" height="8" fill="#000000"/>
                      <rect x="50" y="15" width="6" height="6" fill="#000000"/>
                      <rect x="42" y="28" width="6" height="10" fill="#000000"/>
                      <rect x="15" y="45" width="10" height="6" fill="#000000"/>
                      <rect x="30" y="42" width="8" height="8" fill="#000000"/>
                      <rect x="45" y="45" width="12" height="12" fill="#000000"/>
                      <rect x="65" y="40" width="8" height="6" fill="#000000"/>
                      <rect x="80" y="48" width="12" height="6" fill="#000000"/>
                      <rect x="38" y="65" width="14" height="6" fill="#000000"/>
                      <rect x="60" y="65" width="8" height="15" fill="#000000"/>
                      <rect x="75" y="75" width="15" height="8" fill="#000000"/>
                      <rect x="45" y="80" width="10" height="10" fill="#000000"/>
                    </svg>
                  </div>
                  <p className="text-[9px] font-bold text-slate-800">
                    Scan &amp; Pay: {hotelInfo.currency}{grandTotal.toFixed(2)}
                  </p>
                  <p className="text-[8px] text-slate-500 font-mono">
                    UPI: {hotelInfo.upiId}
                  </p>
                </div>
              )}

              {/* FOOTER MESSAGE (Matching Shreyans 588 sample) */}
              <div className="pt-2 text-center text-[9px] text-slate-600 space-y-0.5">
                <p className="font-bold text-slate-800">
                  Thank you for your visit!
                </p>
                <p className="font-medium">
                  Please visit us again!
                </p>
                {hotelInfo.showFssaiGstinOn58mm && (
                  <div className="text-[8px] text-slate-500 pt-1 border-t border-dotted border-slate-300">
                    <div>GSTIN: {hotelInfo.gstin}</div>
                    <div>FSSAI: {hotelInfo.fssai}</div>
                  </div>
                )}
                <div className="text-[7px] text-slate-400 font-mono pt-0.5">
                  POS: SHREYANS 588 • Auth: {printOfficer?.id || 'ADM'}
                </div>
              </div>

              {/* Jagged tear paper roll bottom */}
              <div className="receipt-tear-bottom -mx-3 mt-3" />
            </div>
          )}

          {/* ========================================================
              FORMAT 2: 80mm STANDARD DESKTOP THERMAL POS
              ======================================================== */}
          {printFormat === '80mm' && (
            <div
              id="printable-invoice"
              data-format="80mm"
              className="format-80mm bg-white text-slate-900 shadow-xl w-[360px] p-6 text-xs receipt-font border-t-8 border-brand-600 transition-all"
            >
              <div className="text-center pb-4 border-b border-dashed border-slate-400">
                <h1 className="text-lg font-bold uppercase tracking-wider">{hotelInfo.name}</h1>
                <p className="text-[11px] text-slate-600 mt-0.5">{hotelInfo.tagline}</p>
                <p className="text-[10px] text-slate-600 leading-tight mt-1">{hotelInfo.address}</p>
                <p className="text-[10px] text-slate-600 mt-0.5">Tel: {hotelInfo.phone}</p>
                <div className="flex justify-center gap-3 text-[10px] font-semibold text-slate-700 mt-1">
                  <span>GSTIN: {hotelInfo.gstin}</span>
                  <span>FSSAI: {hotelInfo.fssai}</span>
                </div>
              </div>

              <div className="py-3 border-b border-dashed border-slate-400 space-y-1 text-[11px]">
                <div className="flex justify-between font-bold">
                  <span>{completedInvoice?.isEdited ? 'TAX INVOICE (REVISED)' : 'TAX INVOICE'}</span>
                  <span>#{invoiceNum}</span>
                </div>
                <div className="flex justify-between">
                  <span>Table: <strong>{tableName}</strong> ({section})</span>
                  <span>Date: {new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Guest: {guestName}</span>
                  <span>Time: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Cashier: {printOfficer?.name}</span>
                  <span className="font-semibold text-slate-900">{paymentMode}</span>
                </div>
              </div>

              <div className="py-3 border-b border-dashed border-slate-400">
                <div className="flex justify-between font-bold pb-1 text-[11px] border-b border-slate-300">
                  <span className="w-1/2">Item Description</span>
                  <span className="w-12 text-center">Qty</span>
                  <span className="w-16 text-right">Rate</span>
                  <span className="w-16 text-right">Amount</span>
                </div>
                <div className="divide-y divide-slate-100 py-1 space-y-1">
                  {invoiceItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-[11px] pt-1">
                      <span className="w-1/2 truncate pr-1">{item.name}</span>
                      <span className="w-12 text-center">{item.quantity}</span>
                      <span className="w-16 text-right">{(item.price || item.rate || 0).toFixed(2)}</span>
                      <span className="w-16 text-right font-semibold">
                        {((item.price || item.rate || 0) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="py-3 border-b border-dashed border-slate-400 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{hotelInfo.currency}{subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount</span>
                    <span>-{hotelInfo.currency}{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>CGST ({(hotelInfo.taxRate / 2).toFixed(1)}%)</span>
                  <span>{hotelInfo.currency}{cgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>SGST ({(hotelInfo.taxRate / 2).toFixed(1)}%)</span>
                  <span>{hotelInfo.currency}{sgst.toFixed(2)}</span>
                </div>
                {serviceCharge > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Service Charge ({hotelInfo.serviceChargeRate}%)</span>
                    <span>{hotelInfo.currency}{serviceCharge.toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-300 flex justify-between font-extrabold text-sm">
                  <span>GRAND TOTAL</span>
                  <span className="text-base">{hotelInfo.currency}{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-3 text-center text-[10px] text-slate-600 space-y-1">
                <p className="font-semibold whitespace-pre-line">{hotelInfo.receiptFooter}</p>
                <p className="text-[9px] text-slate-400 font-mono">
                  Software: Hotel POS • Auth ID: {printOfficer?.id || 'ADM'}
                </p>
              </div>
            </div>
          )}

          {/* ========================================================
              FORMAT 3: A4 FORMAL CORPORATE TAX BILL
              ======================================================== */}
          {printFormat === 'a4' && (
            <div
              id="printable-invoice"
              data-format="a4"
              className="format-a4 bg-white text-slate-900 shadow-xl w-full max-w-xl p-8 text-sm border border-slate-200 transition-all"
            >
              <div className="flex justify-between items-start border-b-2 border-brand-600 pb-4">
                <div>
                  <h1 className="text-xl font-bold uppercase text-slate-900">{hotelInfo.name}</h1>
                  <p className="text-xs text-slate-600">{hotelInfo.tagline}</p>
                  <p className="text-xs text-slate-600 mt-1 max-w-xs">{hotelInfo.address}</p>
                  <p className="text-xs text-slate-600">Tel: {hotelInfo.phone} • Email: {hotelInfo.email}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs uppercase tracking-wider font-bold px-2.5 py-1 rounded bg-slate-100 text-slate-800 inline-block mb-1">
                    TAX INVOICE
                  </div>
                  <div className="text-sm font-bold text-slate-900">#{invoiceNum}</div>
                  <div className="text-xs text-slate-500">Date: {new Date().toLocaleDateString()}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block">Billed To:</span>
                  <strong className="text-sm text-slate-900 block">{guestName}</strong>
                  <span className="text-slate-600">Table: {tableName} ({section})</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block">Statutory Registration:</span>
                  <span className="font-mono text-slate-800 block">GSTIN: {hotelInfo.gstin}</span>
                  <span className="font-mono text-slate-800 block">FSSAI: {hotelInfo.fssai}</span>
                </div>
              </div>

              <div className="py-4">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-300 text-slate-600 font-semibold">
                      <th className="text-left py-2">Item</th>
                      <th className="text-center py-2 w-16">Qty</th>
                      <th className="text-right py-2 w-24">Rate</th>
                      <th className="text-right py-2 w-28">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoiceItems.map((item, idx) => (
                      <tr key={idx} className="py-2">
                        <td className="py-2 font-medium">{item.name}</td>
                        <td className="py-2 text-center">{item.quantity}</td>
                        <td className="py-2 text-right">{hotelInfo.currency}{(item.price || item.rate || 0).toFixed(2)}</td>
                        <td className="py-2 text-right font-semibold">{hotelInfo.currency}{((item.price || item.rate || 0) * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-slate-200 pt-4 flex justify-between items-start">
                <div className="max-w-xs text-xs text-slate-500">
                  <p className="font-semibold text-slate-700">Payment Summary:</p>
                  <p>Mode: {paymentMode}</p>
                  <p className="mt-1">Authorized Print Officer: {printOfficer?.name} ({printOfficer?.role})</p>
                </div>
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{hotelInfo.currency}{subtotal.toFixed(2)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Discount:</span>
                      <span>-{hotelInfo.currency}{discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>CGST ({(hotelInfo.taxRate / 2).toFixed(1)}%):</span>
                    <span>{hotelInfo.currency}{cgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>SGST ({(hotelInfo.taxRate / 2).toFixed(1)}%):</span>
                    <span>{hotelInfo.currency}{sgst.toFixed(2)}</span>
                  </div>
                  <div className="border-t-2 border-slate-900 pt-2 flex justify-between font-bold text-base text-slate-900">
                    <span>Grand Total:</span>
                    <span>{hotelInfo.currency}{grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Action Buttons (Hidden in Print) */}
        <div className="px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 no-print">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span>Active Preset:</span>
            <strong className="text-slate-800 dark:text-slate-200">
              {printFormat === '58mm'
                ? 'SHREYANS 58mm Bill Smart'
                : printFormat === '80mm'
                ? '80mm POS Thermal'
                : 'A4 Tax Document'}
            </strong>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Test Slip button for Shreyans 588 */}
            {printFormat === '58mm' && (
              <button
                type="button"
                onClick={handlePrintTestSlip}
                className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition"
                title="Print test slip on SHREYANS 588"
              >
                <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Test Slip</span>
              </button>
            )}

            {/* Direct Bluetooth button if on 58mm */}
            {printFormat === '58mm' && (
              <button
                type="button"
                disabled={isBluetoothSending}
                onClick={handleDirectBluetoothPrint}
                className="px-3.5 py-2 rounded-xl border border-brand-500/40 bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-brand-300 text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                title="Connect via Bluetooth and print wirelessly"
              >
                <Bluetooth className="w-3.5 h-3.5 text-brand-500" />
                <span>{isBluetoothSending ? 'Sending...' : 'Direct Bluetooth'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Close
            </button>

            {/* Primary Print Button */}
            <button
              onClick={handleNativePrint}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-amber-600 hover:from-brand-500 hover:to-amber-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-brand-600/30 flex items-center gap-2 transition transform active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>
                {printFormat === '58mm' ? 'Print 58mm Receipt' : 'Print Invoice'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
