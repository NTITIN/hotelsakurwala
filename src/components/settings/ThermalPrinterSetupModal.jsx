import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  injectThermalPageStyle,
  buildEscPos58mm,
  buildFeedPaperEscPos,
  printViaWebBluetooth,
  printViaWebSerial,
  PRINTER_SPECS
} from '../../utils/thermalPrinter';
import {
  X,
  Printer,
  Bluetooth,
  Usb,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Info,
  ChevronRight,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export const ThermalPrinterSetupModal = ({ isOpen, onClose }) => {
  const { hotelInfo, setHotelInfo } = useHotel();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [connectedDevice, setConnectedDevice] = useState(null);
  const [connectionType, setConnectionType] = useState(null); // 'bluetooth', 'usb', or null
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  if (!isOpen) return null;

  // 1. Connect via Web Bluetooth
  const handleConnectBluetooth = async () => {
    setIsConnecting(true);
    try {
      const dummyTest = buildFeedPaperEscPos(1);
      const res = await printViaWebBluetooth(dummyTest);
      setConnectedDevice(res.deviceName);
      setConnectionType('bluetooth');
      addToast(
        `Connected to ${res.deviceName} via Bluetooth successfully!`,
        'success',
        'Bluetooth Connected'
      );
    } catch (err) {
      if (err.name !== 'NotFoundError') {
        addToast(
          err.message || 'Bluetooth connection failed. Make sure printer is ON and Bluetooth is enabled.',
          'error',
          'Bluetooth Error'
        );
      }
    } finally {
      setIsConnecting(false);
    }
  };

  // 2. Connect via Web Serial (USB-C Cable)
  const handleConnectUsb = async () => {
    setIsConnecting(true);
    try {
      const dummyTest = buildFeedPaperEscPos(1);
      const res = await printViaWebSerial(dummyTest);
      setConnectedDevice(res.deviceName);
      setConnectionType('usb');
      addToast(
        'Connected to SHREYANS 588 via USB Serial Cable!',
        'success',
        'USB Connected'
      );
    } catch (err) {
      if (err.name !== 'NotFoundError') {
        addToast(
          err.message || 'USB connection failed. Plug the USB-C cable into your PC.',
          'error',
          'USB Cable Error'
        );
      }
    } finally {
      setIsConnecting(false);
    }
  };

  // 3. Print 58mm Test Receipt
  const handlePrintTestReceipt = async () => {
    setIsTesting(true);
    const testData = buildEscPos58mm({
      hotelInfo,
      invoiceNum: 'TEST-588-01',
      tableName: 'Test Table 01',
      section: 'Main Dining',
      guestName: 'Setup Test Guest',
      cashierName: currentUser?.name || 'Admin',
      isTestSlip: true
    });

    if (connectionType === 'bluetooth') {
      try {
        await printViaWebBluetooth(testData);
        addToast('58mm Test Slip printed via Bluetooth!', 'success', 'Test Complete');
      } catch (err) {
        fallbackBrowserPrintTest();
      }
    } else if (connectionType === 'usb') {
      try {
        await printViaWebSerial(testData);
        addToast('58mm Test Slip printed via USB Cable!', 'success', 'Test Complete');
      } catch (err) {
        fallbackBrowserPrintTest();
      }
    } else {
      // Standard Browser Print with exact 58mm dimensions
      fallbackBrowserPrintTest();
    }
    setIsTesting(false);
  };

  const fallbackBrowserPrintTest = () => {
    injectThermalPageStyle('58mm');
    addToast(
      'Triggering 58mm Test Slip via system print dialog...',
      'info',
      'Printing Test Slip'
    );
    window.print();
  };

  // 4. Feed Paper 3 Lines
  const handleFeedPaper = async () => {
    const feedData = buildFeedPaperEscPos(3);
    if (connectionType === 'bluetooth') {
      try {
        await printViaWebBluetooth(feedData);
        addToast('Advanced 3 lines of paper.', 'success', 'Paper Fed');
      } catch (e) {
        addToast('Could not feed paper. Reconnect printer.', 'error');
      }
    } else if (connectionType === 'usb') {
      try {
        await printViaWebSerial(feedData);
        addToast('Advanced 3 lines of paper via USB.', 'success', 'Paper Fed');
      } catch (e) {
        addToast('Could not feed paper. Check USB connection.', 'error');
      }
    } else {
      addToast(
        'Connect via Bluetooth or USB first to test live paper feed.',
        'warning',
        'Direct Connection Required'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 text-white flex items-center justify-center shadow-md shadow-brand-500/20 font-bold">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-slate-900 dark:text-white text-base">
                  SHREYANS 58mm Thermal Printer Setup
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  Model 588
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hardware Connection, Bluetooth Pairing &amp; ESC/POS Configuration
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Active Status Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-brand-950/40 via-slate-900 to-slate-900 border border-brand-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-semibold text-brand-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Hardware Configured for Your Printer</span>
                </div>
                <div className="text-base font-bold text-white mt-0.5">
                  SHREYANS Mini Mobile Receipt Printer (58mm Bill Smart 588)
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  58mm Roll Width • 32 Columns • Inkless Thermal • Bluetooth + USB-C
                </div>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-700/60">
              <span className="text-[11px] text-slate-400">Status:</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {connectedDevice ? `Connected (${connectedDevice})` : 'Ready to Connect'}
              </span>
            </div>
          </div>

          {/* Connection Methods Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Select How You Want to Connect:
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Method 1: Bluetooth Wireless */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400">
                      <Bluetooth className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300 border border-brand-300 dark:border-brand-800">
                      Wireless (Recommended)
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    Bluetooth Direct Connect
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Connect wireless directly from Chrome/Edge without installing driver software. Pairing PIN: <strong className="text-amber-600 font-mono">0000</strong> or <strong className="text-amber-600 font-mono">1234</strong>.
                  </p>
                </div>

                <button
                  onClick={handleConnectBluetooth}
                  disabled={isConnecting}
                  className="w-full py-2.5 px-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition shadow-sm disabled:opacity-50"
                >
                  <Bluetooth className="w-4 h-4" />
                  <span>{isConnecting ? 'Searching Device...' : 'Connect Bluetooth (588)'}</span>
                </button>
              </div>

              {/* Method 2: USB-C Cable Wired */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                      <Usb className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                      Wired USB
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    USB-C Cable Connect
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Plug the USB-C cable into your PC. Ideal for stationary billing counter setups with 100% reliable continuous connection.
                  </p>
                </div>

                <button
                  onClick={handleConnectUsb}
                  disabled={isConnecting}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition shadow-sm disabled:opacity-50"
                >
                  <Usb className="w-4 h-4" />
                  <span>Connect USB Cable</span>
                </button>
              </div>
            </div>
          </div>

          {/* Test & Verification Station */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  Test Your SHREYANS 588 Printer Now
                </h4>
              </div>
              <span className="text-[11px] text-amber-700 dark:text-amber-300 font-semibold">
                Instant Verification
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Verify paper alignment, thermal darkness, and feed speed before real dining bills:
            </p>

            <div className="flex flex-wrap gap-2.5 pt-1">
              <button
                onClick={handlePrintTestReceipt}
                disabled={isTesting}
                className="py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition transform active:scale-95 disabled:opacity-50"
              >
                <Printer className="w-4 h-4" />
                <span>Print 58mm Test Receipt Slip</span>
              </button>

              <button
                onClick={handleFeedPaper}
                className="py-2.5 px-3.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-amber-50 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Advance Paper (3 lines)</span>
              </button>
            </div>
          </div>

          {/* Physical Setup Step-by-Step Guide */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Quick Physical Setup (3 Simple Steps):
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <span className="w-6 h-6 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-xs mb-2">
                  1
                </span>
                <strong className="text-slate-900 dark:text-white block mb-1">
                  Power ON
                </strong>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Press &amp; hold the Power button for 2-3 seconds until the green LED turns ON.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <span className="w-6 h-6 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-xs mb-2">
                  2
                </span>
                <strong className="text-slate-900 dark:text-white block mb-1">
                  Insert 58mm Paper
                </strong>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Open lid, insert 58mm thermal roll with smooth thermal side facing up towards the tear bar. Pull 1 inch out &amp; close.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <span className="w-6 h-6 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-xs mb-2">
                  3
                </span>
                <strong className="text-slate-900 dark:text-white block mb-1">
                  Pair &amp; Print
                </strong>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                  In Windows Bluetooth, pair with "588" or "MTP-II" (PIN: <strong>0000</strong> or <strong>1234</strong>). Click Print in the app!
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>58mm Zero-Margin Print CSS Active</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 transition"
          >
            Done / Close Wizard
          </button>
        </div>

      </div>
    </div>
  );
};
