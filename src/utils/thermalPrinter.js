/**
 * Thermal Printer Utilities for 58mm & 80mm Printers
 * Specifically calibrated for SHREYANS Mini Mobile Receipt Printer (58mm Bill Smart 588)
 */

// 58mm standard character width (Font A: 32 chars/line, Font B: 42 chars/line)
export const PRINTER_SPECS = {
  SHREYANS_588: {
    name: 'SHREYANS 58mm Bill Smart (588)',
    paperWidthMm: 58,
    printableWidthMm: 48,
    charsPerLine: 32,
    dotsPerLine: 384,
    defaultBluetoothPin: '0000 / 1234',
    bluetoothNamePrefixes: ['588', 'MTP', 'POS', 'BlueTooth', 'Printer', 'RPP', 'MPT']
  },
  THERMAL_80MM: {
    name: 'Standard 80mm POS Printer',
    paperWidthMm: 80,
    printableWidthMm: 72,
    charsPerLine: 48,
    dotsPerLine: 576
  }
};

/**
 * Injects a temporary <style> tag to enforce exact @page dimensions for thermal printers
 * Ensures Windows Print Dialog and browser automatically select 58mm without margins
 */
export const injectThermalPageStyle = (format = '58mm') => {
  const existing = document.getElementById('dynamic-thermal-page-style');
  if (existing) {
    existing.remove();
  }

  const style = document.createElement('style');
  style.id = 'dynamic-thermal-page-style';

  if (format === '58mm') {
    style.innerHTML = `
      @page {
        size: 58mm auto !important;
        margin: 0mm !important;
      }
      @media print {
        html, body {
          width: 58mm !important;
          margin: 0 !important;
          padding: 0 !important;
          background: #ffffff !important;
        }
        #printable-invoice {
          width: 58mm !important;
          max-width: 58mm !important;
          margin: 0 !important;
          padding: 2mm 3mm !important;
          box-sizing: border-box !important;
          font-size: 11px !important;
          line-height: 1.25 !important;
          color: #000000 !important;
          background: #ffffff !important;
          border: none !important;
          box-shadow: none !important;
        }
        #printable-invoice * {
          color: #000000 !important;
          text-shadow: none !important;
        }
      }
    `;
  } else if (format === '80mm') {
    style.innerHTML = `
      @page {
        size: 80mm auto !important;
        margin: 0mm !important;
      }
      @media print {
        html, body {
          width: 80mm !important;
          margin: 0 !important;
          padding: 0 !important;
          background: #ffffff !important;
        }
        #printable-invoice {
          width: 80mm !important;
          max-width: 80mm !important;
          margin: 0 !important;
          padding: 4mm 5mm !important;
          box-sizing: border-box !important;
          font-size: 12px !important;
          color: #000000 !important;
          background: #ffffff !important;
          border: none !important;
          box-shadow: none !important;
        }
      }
    `;
  } else {
    style.innerHTML = `
      @page {
        size: A4 portrait;
        margin: 12mm;
      }
    `;
  }

  document.head.appendChild(style);

  // Auto clean-up after printing finishes or is cancelled
  const cleanup = () => {
    const el = document.getElementById('dynamic-thermal-page-style');
    if (el) el.remove();
    window.removeEventListener('afterprint', cleanup);
  };
  window.addEventListener('afterprint', cleanup);
};

/**
 * Pad and format strings for 32-character 58mm thermal output
 */
export const formatThermalLine = (leftText = '', rightText = '', maxChars = 32) => {
  const left = String(leftText);
  const right = String(rightText);
  const spacesNeeded = Math.max(1, maxChars - left.length - right.length);
  return left + ' '.repeat(spacesNeeded) + right;
};

/**
 * Build Raw ESC/POS bytes for Shreyans 588 Bluetooth / USB Direct Printing
 */
export const buildEscPos58mm = ({
  hotelInfo = {},
  invoiceNum = '',
  tableName = '',
  section = '',
  guestName = '',
  cashierName = 'Admin',
  items = [],
  subtotal = 0,
  taxRate = 5,
  cgst = 0,
  sgst = 0,
  serviceCharge = 0,
  discountAmount = 0,
  grandTotal = 0,
  isTestSlip = false
}) => {
  const encoder = new TextEncoder();
  const chunks = [];

  const addBytes = (...bytes) => {
    chunks.push(new Uint8Array(bytes));
  };

  const addLine = (text = '') => {
    chunks.push(encoder.encode(text + '\n'));
  };

  // 1. Initialize printer (ESC @)
  addBytes(0x1B, 0x40);

  // 2. Set default character code page to PC437 / UTF-8
  addBytes(0x1B, 0x74, 0x00);

  // 3. Header: Centered & Emphasized
  addBytes(0x1B, 0x61, 0x01); // Align center
  addBytes(0x1B, 0x45, 0x01); // Bold ON
  addBytes(0x1D, 0x21, 0x01); // Double height
  addLine(hotelInfo.name || 'THE ROYAL GRAND PALACE');
  addBytes(0x1D, 0x21, 0x00); // Normal size
  addBytes(0x1B, 0x45, 0x00); // Bold OFF

  if (hotelInfo.tagline) addLine(hotelInfo.tagline);
  if (hotelInfo.address) addLine(hotelInfo.address);
  if (hotelInfo.phone) addLine('Tel: ' + hotelInfo.phone);

  const divider = '--------------------------------';
  addLine(divider);

  if (isTestSlip) {
    addBytes(0x1B, 0x45, 0x01); // Bold ON
    addLine('*** 58MM PRINTER TEST SLIP ***');
    addLine('SHREYANS 588 BILL SMART');
    addBytes(0x1B, 0x45, 0x00); // Bold OFF
    addLine(divider);
    addBytes(0x1B, 0x61, 0x00); // Align left
    addLine('Date      : ' + new Date().toLocaleString());
    addLine('Status    : CONNECTED & READY');
    addLine('Width     : 58mm (32 Columns)');
    addLine('Thermal   : High Contrast (No Ink)');
    addLine('Hardware  : SHREYANS Mobile 588');
    addLine(divider);
    addBytes(0x1B, 0x61, 0x01); // Align center
    addLine('Alignment: [==========] 100%');
    addLine('Test Successful! Ready for Billing.');
    addLine(divider);
    // Feed and cut
    addLine('\n\n\n');
    addBytes(0x1D, 0x56, 0x42, 0x00);
    return concatenateUint8Arrays(chunks);
  }

  // Regular Invoice Header
  addBytes(0x1B, 0x45, 0x01);
  addLine('TAX INVOICE');
  addBytes(0x1B, 0x45, 0x00);
  addLine(divider);

  // Align Left for metadata
  addBytes(0x1B, 0x61, 0x00);
  const now = new Date();
  const dateStr = now.toLocaleDateString();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  addLine('Date      : ' + dateStr + ' ' + timeStr);
  addLine('Receipt # : ' + invoiceNum);
  if (tableName) addLine('Table     : ' + tableName + (section ? ' (' + section + ')' : ''));
  if (guestName) addLine('Guest     : ' + guestName);
  if (cashierName) addLine('Cashier   : ' + cashierName);
  addLine(divider);

  // Column Header: 32 chars: "Item                 Qty  Amount"
  addBytes(0x1B, 0x45, 0x01);
  addLine(formatThermalLine('Item', 'Qty   Amount', 32));
  addBytes(0x1B, 0x45, 0x00);
  addLine(divider);

  // Items
  items.forEach((item) => {
    const qty = String(item.quantity || 1).padStart(3);
    const amt = Number((item.price || item.rate || 0) * (item.quantity || 1)).toFixed(2);
    const itemName = item.name || 'Dish';

    if (itemName.length <= 18) {
      addLine(formatThermalLine(itemName, `${qty} ${amt.padStart(8)}`, 32));
    } else {
      // Print long name on first line, and qty & amount on second line
      addLine(itemName.slice(0, 31));
      addLine(formatThermalLine(`  ${item.quantity} x ${(item.price || 0).toFixed(2)}`, amt.padStart(8), 32));
    }
  });

  addLine(divider);

  // Totals
  addLine(formatThermalLine('Subtotal', (hotelInfo.currency || 'Rs.') + subtotal.toFixed(2), 32));

  if (discountAmount > 0) {
    addLine(formatThermalLine('Discount', '-' + (hotelInfo.currency || 'Rs.') + discountAmount.toFixed(2), 32));
  }

  if (cgst > 0) {
    addLine(formatThermalLine(`CGST (${(taxRate / 2).toFixed(1)}%)`, (hotelInfo.currency || 'Rs.') + cgst.toFixed(2), 32));
  }
  if (sgst > 0) {
    addLine(formatThermalLine(`SGST (${(taxRate / 2).toFixed(1)}%)`, (hotelInfo.currency || 'Rs.') + sgst.toFixed(2), 32));
  }
  if (serviceCharge > 0) {
    addLine(formatThermalLine('Service Charge', (hotelInfo.currency || 'Rs.') + serviceCharge.toFixed(2), 32));
  }

  addLine(divider);

  // Grand Total - Double Height & Bold
  addBytes(0x1B, 0x45, 0x01); // Bold
  addBytes(0x1D, 0x21, 0x01); // Double height
  addLine(formatThermalLine('TOTAL', (hotelInfo.currency || 'Rs.') + grandTotal.toFixed(2), 32));
  addBytes(0x1D, 0x21, 0x00); // Normal
  addBytes(0x1B, 0x45, 0x00); // Bold off

  addLine(divider);

  // Centered Footer
  addBytes(0x1B, 0x61, 0x01); // Center
  if (hotelInfo.receiptFooter) {
    const footerLines = hotelInfo.receiptFooter.split('\n');
    footerLines.forEach((l) => addLine(l));
  } else {
    addLine('Thank you for your visit!');
    addLine('Please visit again!');
  }

  if (hotelInfo.gstin) addLine('GSTIN: ' + hotelInfo.gstin);
  if (hotelInfo.fssai) addLine('FSSAI: ' + hotelInfo.fssai);

  // Feed lines and cut
  addLine('\n\n\n');
  addBytes(0x1D, 0x56, 0x42, 0x00); // Partial cut

  return concatenateUint8Arrays(chunks);
};

export const buildFeedPaperEscPos = (lines = 3) => {
  const encoder = new TextEncoder();
  const chunks = [
    new Uint8Array([0x1B, 0x40]), // Init
    encoder.encode('\n'.repeat(lines))
  ];
  return concatenateUint8Arrays(chunks);
};

const concatenateUint8Arrays = (arrays) => {
  const totalLength = arrays.reduce((acc, curr) => acc + curr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
};

/**
 * Direct Web Bluetooth Connection & Print to Shreyans 588 / MPT-II thermal printer
 */
export const printViaWebBluetooth = async (rawEscPosData) => {
  if (!navigator.bluetooth) {
    throw new Error('Web Bluetooth is not supported in this browser. Please use the Print button to print via Windows Bluetooth driver.');
  }

  // Common thermal printer Bluetooth service UUIDs (standard SPP / vendor GATT)
  const PRINTER_SERVICES = [
    '000018f0-0000-1000-8000-00805f9b34fb', // Standard POS Bluetooth service
    'e7810a71-73ae-499d-8c15-faa9aef0c3f2', // MPT-II / 588 Bluetooth
    '49535343-fe7d-4ae5-8fa9-9fafd205e455',  // Microchip ISSP / Serial
    '0000e0ff-3c17-d293-8e48-14fe2e4da212'
  ];

  try {
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: PRINTER_SERVICES
    });

    const server = await device.gatt.connect();

    // Find printable write characteristic
    let writeChar = null;
    for (const serviceUuid of PRINTER_SERVICES) {
      try {
        const service = await server.getPrimaryService(serviceUuid);
        const chars = await service.getCharacteristics();
        writeChar = chars.find((c) => c.properties.write || c.properties.writeWithoutResponse);
        if (writeChar) break;
      } catch {
        // continue search
      }
    }

    if (!writeChar) {
      throw new Error(`Connected to ${device.name || 'Printer'}, but ESC/POS data channel was not detected. Please use the standard Print button with your Windows Bluetooth driver.`);
    }

    // Write data in chunks (BLE maximum transmission unit typically 20-100 bytes)
    const CHUNK_SIZE = 64;
    for (let i = 0; i < rawEscPosData.length; i += CHUNK_SIZE) {
      const chunk = rawEscPosData.slice(i, i + CHUNK_SIZE);
      if (writeChar.properties.writeWithoutResponse) {
        await writeChar.writeValueWithoutResponse(chunk);
      } else {
        await writeChar.writeValue(chunk);
      }
      await new Promise((r) => setTimeout(r, 25)); // Brief pause between chunks
    }

    return { success: true, deviceName: device.name || 'SHREYANS 588' };
  } catch (err) {
    throw err;
  }
};

/**
 * Direct Web Serial / USB Cable Connection & Print for Shreyans 588
 */
export const printViaWebSerial = async (rawEscPosData) => {
  if (!navigator.serial) {
    throw new Error('Web Serial is not supported in this browser. Please use Chrome/Edge or standard Windows Print (Ctrl+P).');
  }

  try {
    const port = await navigator.serial.requestPort();
    await port.open({ baudRate: 9600, dataBits: 8, stopBits: 1, parity: 'none' });

    const writer = port.writable.getWriter();
    await writer.write(rawEscPosData);
    writer.releaseLock();
    await port.close();

    return { success: true, deviceName: 'SHREYANS 588 (USB Serial)' };
  } catch (err) {
    throw err;
  }
};
