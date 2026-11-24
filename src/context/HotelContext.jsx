import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  DEFAULT_HOTEL_INFO,
  DEFAULT_CATEGORIES,
  DEFAULT_MENU,
  DEFAULT_TABLES,
  DEFAULT_ACTIVE_ORDERS,
  DEFAULT_INVOICES,
  DEFAULT_LEDGER_ENTRIES,
  EXPENSE_CATEGORIES
} from '../constants/initialData';
import { canUserPrintInvoice } from '../constants/roles';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const HotelContext = createContext(null);

const STORAGE_KEYS = {
  HOTEL_INFO: 'hotel_billing_info',
  CATEGORIES: 'hotel_billing_categories',
  MENU: 'hotel_billing_menu',
  TABLES: 'hotel_billing_tables',
  ACTIVE_ORDERS: 'hotel_billing_active_orders',
  INVOICES: 'hotel_billing_invoices',
  LEDGER_ENTRIES: 'hotel_billing_ledger_entries'
};

const getSavedOrDefault = (key, fallback) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
};

export const HotelProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [hotelInfo, setHotelInfo] = useState(() => {
    const saved = getSavedOrDefault(STORAGE_KEYS.HOTEL_INFO, DEFAULT_HOTEL_INFO);
    return {
      ...DEFAULT_HOTEL_INFO,
      ...saved,
      defaultPrinterPaper: saved.defaultPrinterPaper || '58mm',
      printerModel: saved.printerModel || 'SHREYANS Mini Mobile (58mm Bill Smart 588)',
      showQrOn58mm: saved.showQrOn58mm !== undefined ? saved.showQrOn58mm : true,
      showFssaiGstinOn58mm: saved.showFssaiGstinOn58mm !== undefined ? saved.showFssaiGstinOn58mm : true
    };
  });
  const [categories, setCategories] = useState(() => getSavedOrDefault(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES));
  const [menu, setMenu] = useState(() => getSavedOrDefault(STORAGE_KEYS.MENU, DEFAULT_MENU));
  const [tables, setTables] = useState(() => getSavedOrDefault(STORAGE_KEYS.TABLES, DEFAULT_TABLES));
  const [activeOrders, setActiveOrders] = useState(() => getSavedOrDefault(STORAGE_KEYS.ACTIVE_ORDERS, DEFAULT_ACTIVE_ORDERS));
  const [invoices, setInvoices] = useState(() => getSavedOrDefault(STORAGE_KEYS.INVOICES, DEFAULT_INVOICES));
  const [ledgerEntries, setLedgerEntries] = useState(() => getSavedOrDefault(STORAGE_KEYS.LEDGER_ENTRIES, DEFAULT_LEDGER_ENTRIES));

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HOTEL_INFO, JSON.stringify(hotelInfo));
  }, [hotelInfo]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(menu));
  }, [menu]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(tables));
  }, [tables]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ORDERS, JSON.stringify(activeOrders));
  }, [activeOrders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LEDGER_ENTRIES, JSON.stringify(ledgerEntries));
  }, [ledgerEntries]);

  // MENU & CATEGORY ACTIONS
  const addCategory = (categoryName, icon = 'UtensilsCrossed') => {
    const trimmed = categoryName.trim();
    if (!trimmed) {
      addToast('Category name cannot be empty', 'error', 'Validation Error');
      return false;
    }
    const exists = categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      addToast(`Category "${trimmed}" already exists`, 'warning', 'Duplicate Category');
      return false;
    }
    const newCat = {
      id: `cat-${Date.now()}`,
      name: trimmed,
      icon,
      color: 'from-amber-500 to-orange-600'
    };
    setCategories((prev) => [...prev, newCat]);
    addToast(`Category "${trimmed}" added successfully`, 'success', 'Category Created');
    return true;
  };

  const deleteCategory = (categoryId) => {
    const cat = categories.find((c) => c.id === categoryId);
    if (!cat) return;
    
    // Check if any items belong to this category
    const count = menu.filter((item) => item.category === cat.name).length;
    if (count > 0) {
      addToast(`Cannot delete "${cat.name}". It is used by ${count} menu item(s).`, 'error', 'Category In Use');
      return false;
    }
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    addToast(`Category "${cat.name}" removed`, 'info', 'Category Deleted');
    return true;
  };

  const addMenuItem = (itemData) => {
    const newItem = {
      id: `item-${Date.now()}`,
      name: itemData.name.trim(),
      category: itemData.category,
      price: Number(itemData.price) || 0,
      type: itemData.type || 'veg',
      description: itemData.description?.trim() || '',
      prepTime: itemData.prepTime || '15 mins',
      available: itemData.available !== undefined ? itemData.available : true
    };

    setMenu((prev) => [newItem, ...prev]);
    addToast(`Added "${newItem.name}" to menu at ${hotelInfo.currency}${newItem.price}`, 'success', 'Item Added');
    return newItem;
  };

  const updateMenuItem = (itemData) => {
    setMenu((prev) =>
      prev.map((item) =>
        item.id === itemData.id
          ? {
              ...item,
              ...itemData,
              price: Number(itemData.price) || item.price
            }
          : item
      )
    );
    addToast(`Updated "${itemData.name}"`, 'success', 'Item Updated');
  };

  const deleteMenuItem = (itemId) => {
    const item = menu.find((i) => i.id === itemId);
    setMenu((prev) => prev.filter((i) => i.id !== itemId));
    addToast(`Removed "${item?.name || 'item'}" from menu`, 'info', 'Item Deleted');
  };

  const toggleItemAvailability = (itemId) => {
    setMenu((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const nextState = !item.available;
          addToast(
            `"${item.name}" is now ${nextState ? 'Available' : 'Marked Out of Stock'}`,
            nextState ? 'success' : 'warning',
            'Stock Status'
          );
          return { ...item, available: nextState };
        }
        return item;
      })
    );
  };

  // TABLE MANAGEMENT ACTIONS (Add, Edit, Delete)
  const addTable = (tableData) => {
    const num = Number(tableData.number) || (Math.max(0, ...tables.map((t) => t.number || 0)) + 1);
    const exists = tables.some((t) => t.number === num);
    if (exists) {
      addToast(`Table #${num} already exists. Please choose a different number.`, 'error', 'Duplicate Table');
      return false;
    }

    const newTable = {
      id: `T-${String(num).padStart(2, '0')}-${Date.now().toString().slice(-4)}`,
      number: num,
      name: tableData.name?.trim() || `Table ${num}`,
      section: tableData.section?.trim() || 'Main Dining',
      capacity: Number(tableData.capacity) || 4,
      status: 'available',
      orderId: null
    };

    setTables((prev) => [...prev, newTable]);
    addToast(`Added "${newTable.name}" in ${newTable.section} (Seats ${newTable.capacity})`, 'success', 'Table Created');
    return newTable;
  };

  const updateTable = (tableData) => {
    const current = tables.find((t) => t.id === tableData.id);
    if (!current) return false;

    const num = Number(tableData.number) || current.number;
    const exists = tables.some((t) => t.id !== tableData.id && t.number === num);
    if (exists) {
      addToast(`Table #${num} is already used by another table.`, 'error', 'Duplicate Table Number');
      return false;
    }

    const updated = {
      ...current,
      number: num,
      name: tableData.name?.trim() || `Table ${num}`,
      section: tableData.section?.trim() || current.section,
      capacity: Number(tableData.capacity) || current.capacity
    };

    setTables((prev) => prev.map((t) => (t.id === tableData.id ? updated : t)));

    // Also sync table info in activeOrder if occupied
    if (updated.orderId && activeOrders[updated.orderId]) {
      setActiveOrders((prev) => ({
        ...prev,
        [updated.orderId]: {
          ...prev[updated.orderId],
          tableNumber: updated.number
        }
      }));
    }

    addToast(`Updated "${updated.name}" details.`, 'success', 'Table Updated');
    return updated;
  };

  const deleteTable = (tableId) => {
    const table = tables.find((t) => t.id === tableId);
    if (!table) return false;

    if (table.status === 'occupied' || table.orderId) {
      addToast(
        `Cannot delete ${table.name} while it is occupied with active dining. Settle the bill first.`,
        'error',
        'Table In Use'
      );
      return false;
    }

    setTables((prev) => prev.filter((t) => t.id !== tableId));
    addToast(`Removed "${table.name}" from floor layout.`, 'info', 'Table Removed');
    return true;
  };

  // TABLE & ORDER ACTIONS
  const createOrderForTable = (tableId, guestDetails = {}) => {
    const table = tables.find((t) => t.id === tableId);
    if (!table) return null;

    const orderId = `ORD-${Date.now().toString().slice(-5)}`;
    const newOrder = {
      id: orderId,
      tableId,
      tableNumber: table.number,
      guestName: guestDetails.guestName || `Guest at Table ${table.number}`,
      guestPhone: guestDetails.guestPhone || '',
      guestCount: guestDetails.guestCount || 2,
      serverName: currentUser?.name || 'Staff',
      serverId: currentUser?.id || 'usr-waiter',
      createdAt: new Date().toISOString(),
      status: 'in-progress',
      items: [],
      discountPercent: 0,
      notes: guestDetails.notes || ''
    };

    setActiveOrders((prev) => ({
      ...prev,
      [orderId]: newOrder
    }));

    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId ? { ...t, status: 'occupied', orderId } : t
      )
    );

    return newOrder;
  };

  const getTableOrder = (tableId) => {
    const table = tables.find((t) => t.id === tableId);
    if (!table || !table.orderId) return null;
    return activeOrders[table.orderId] || null;
  };

  const addItemToOrder = (tableId, menuItem, customNotes = '') => {
    const table = tables.find((t) => t.id === tableId);
    if (!table) return;

    let order = table.orderId ? activeOrders[table.orderId] : null;

    if (!order) {
      order = createOrderForTable(tableId);
    }

    setActiveOrders((prev) => {
      const currentOrder = prev[order.id];
      if (!currentOrder) return prev;

      const existingIndex = currentOrder.items.findIndex((i) => i.id === menuItem.id);
      let updatedItems = [...currentOrder.items];

      if (existingIndex > -1) {
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          quantity: updatedItems[existingIndex].quantity + 1,
          notes: customNotes || updatedItems[existingIndex].notes
        };
      } else {
        updatedItems.push({
          id: menuItem.id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: 1,
          notes: customNotes || ''
        });
      }

      return {
        ...prev,
        [order.id]: {
          ...currentOrder,
          items: updatedItems
        }
      };
    });

    addToast(`Added 1x ${menuItem.name} to Table ${table.number}`, 'info', 'Item Added');
  };

  const updateItemQuantity = (tableId, itemId, delta) => {
    const table = tables.find((t) => t.id === tableId);
    if (!table || !table.orderId) return;

    setActiveOrders((prev) => {
      const order = prev[table.orderId];
      if (!order) return prev;

      const updatedItems = order.items
        .map((item) => {
          if (item.id === itemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);

      return {
        ...prev,
        [table.orderId]: {
          ...order,
          items: updatedItems
        }
      };
    });
  };

  const removeItemFromOrder = (tableId, itemId) => {
    const table = tables.find((t) => t.id === tableId);
    if (!table || !table.orderId) return;

    setActiveOrders((prev) => {
      const order = prev[table.orderId];
      if (!order) return prev;

      return {
        ...prev,
        [table.orderId]: {
          ...order,
          items: order.items.filter((item) => item.id !== itemId)
        }
      };
    });
  };

  const updateOrderGuestDetails = (tableId, details) => {
    const table = tables.find((t) => t.id === tableId);
    if (!table || !table.orderId) return;

    setActiveOrders((prev) => {
      const order = prev[table.orderId];
      if (!order) return prev;

      return {
        ...prev,
        [table.orderId]: {
          ...order,
          ...details
        }
      };
    });
  };

  const setOrderDiscount = (tableId, percent) => {
    const table = tables.find((t) => t.id === tableId);
    if (!table || !table.orderId) return;

    setActiveOrders((prev) => {
      const order = prev[table.orderId];
      if (!order) return prev;

      return {
        ...prev,
        [table.orderId]: {
          ...order,
          discountPercent: Math.max(0, Math.min(100, Number(percent) || 0))
        }
      };
    });
    addToast(`Applied ${percent}% discount to Table ${table.number}`, 'info', 'Discount Updated');
  };

  // BILLING CALCULATIONS
  const calculateBillTotals = (order) => {
    if (!order || !order.items || order.items.length === 0) {
      return {
        subtotal: 0,
        discountPercent: 0,
        discountAmount: 0,
        taxableAmount: 0,
        taxRate: hotelInfo.taxRate,
        cgst: 0,
        sgst: 0,
        totalTax: 0,
        serviceCharge: 0,
        grandTotal: 0
      };
    }

    const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountPercent = order.discountPercent || 0;
    const discountAmount = Math.round((subtotal * discountPercent) / 100);
    const taxableAmount = Math.max(0, subtotal - discountAmount);

    const halfTaxRate = hotelInfo.taxRate / 2; // e.g. 2.5% CGST and 2.5% SGST
    const cgst = Math.round(((taxableAmount * halfTaxRate) / 100) * 100) / 100;
    const sgst = Math.round(((taxableAmount * halfTaxRate) / 100) * 100) / 100;
    const totalTax = cgst + sgst;

    const serviceCharge = hotelInfo.enableServiceCharge
      ? Math.round(((taxableAmount * hotelInfo.serviceChargeRate) / 100) * 100) / 100
      : 0;

    const grandTotal = Math.round(taxableAmount + totalTax + serviceCharge);

    return {
      subtotal,
      discountPercent,
      discountAmount,
      taxableAmount,
      taxRate: hotelInfo.taxRate,
      cgst,
      sgst,
      totalTax,
      serviceCharge,
      grandTotal
    };
  };

  // CHECK PERMISSION & PREPARE INVOICE FOR PRINTING
  // STRICT RULE: Only Admin and Manager can print table invoices!
  const checkCanPrint = (user = currentUser) => {
    if (!user) return false;
    return canUserPrintInvoice(user.role);
  };

  // Settle & Record Completed Bill
  const settleTableBill = (tableId, paymentDetails, authorizedBy = currentUser) => {
    const table = tables.find((t) => t.id === tableId);
    if (!table || !table.orderId) {
      addToast('No active order found for this table.', 'error', 'Billing Error');
      return null;
    }

    const order = activeOrders[table.orderId];
    if (!order || order.items.length === 0) {
      addToast('Cannot bill an empty order.', 'warning', 'Empty Order');
      return null;
    }

    const totals = calculateBillTotals(order);
    const newInvoiceNumber = `INV-${new Date().getFullYear()}-${String(invoices.length + 894).padStart(4, '0')}`;

    const completedInvoice = {
      invoiceNumber: newInvoiceNumber,
      tableNumber: table.number,
      tableName: table.name,
      section: table.section,
      guestName: order.guestName,
      guestPhone: order.guestPhone,
      guestCount: order.guestCount,
      serverName: order.serverName,
      printedBy: `${authorizedBy?.name || 'Staff'} (${authorizedBy?.role || 'ADMIN'})`,
      printedByRole: authorizedBy?.role || 'ADMIN',
      printedAt: new Date().toISOString(),
      settledAt: new Date().toISOString(),
      items: order.items.map((i) => ({
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        amount: i.price * i.quantity
      })),
      subtotal: totals.subtotal,
      discountPercent: totals.discountPercent,
      discountAmount: totals.discountAmount,
      taxableAmount: totals.taxableAmount,
      cgst: totals.cgst,
      sgst: totals.sgst,
      serviceCharge: totals.serviceCharge,
      grandTotal: totals.grandTotal,
      paymentMethod: paymentDetails.method || 'CASH',
      paymentRef: paymentDetails.reference || `PAY-${Date.now().toString().slice(-6)}`,
      status: 'paid'
    };

    // Add to invoices
    setInvoices((prev) => [completedInvoice, ...prev]);

    // Clear active order
    setActiveOrders((prev) => {
      const updated = { ...prev };
      delete updated[table.orderId];
      return updated;
    });

    // Reset table status to available
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId ? { ...t, status: 'available', orderId: null } : t
      )
    );

    addToast(
      `Table ${table.number} settled successfully! Bill #${newInvoiceNumber} for ${hotelInfo.currency}${totals.grandTotal}`,
      'success',
      'Bill Settled'
    );

    return completedInvoice;
  };

  // Update / Edit Existing Invoice
  const updateInvoice = (updatedInvoiceData, authorizedBy = currentUser) => {
    const subtotal = updatedInvoiceData.items.reduce(
      (sum, item) => sum + (Number(item.price || item.rate || 0) * Number(item.quantity || 1)),
      0
    );
    const discountPercent = Number(updatedInvoiceData.discountPercent) || 0;
    const discountAmount = Math.round((subtotal * discountPercent) / 100);
    const taxableAmount = Math.max(0, subtotal - discountAmount);

    const halfTaxRate = hotelInfo.taxRate / 2;
    const cgst = Math.round(((taxableAmount * halfTaxRate) / 100) * 100) / 100;
    const sgst = Math.round(((taxableAmount * halfTaxRate) / 100) * 100) / 100;
    const serviceCharge = hotelInfo.enableServiceCharge
      ? Math.round(((taxableAmount * hotelInfo.serviceChargeRate) / 100) * 100) / 100
      : 0;
    const grandTotal = Math.round(taxableAmount + cgst + sgst + serviceCharge);

    const fullUpdatedInvoice = {
      ...updatedInvoiceData,
      subtotal,
      discountPercent,
      discountAmount,
      taxableAmount,
      cgst,
      sgst,
      serviceCharge,
      grandTotal,
      isEdited: true,
      editedAt: new Date().toISOString(),
      editedBy: `${authorizedBy?.name || 'Manager'} (${authorizedBy?.role || 'MANAGER'})`,
      items: updatedInvoiceData.items.map((i) => ({
        ...i,
        name: i.name,
        price: Number(i.price || i.rate || 0),
        quantity: Number(i.quantity || 1),
        amount: Number(i.price || i.rate || 0) * Number(i.quantity || 1)
      }))
    };

    setInvoices((prev) =>
      prev.map((inv) =>
        inv.invoiceNumber === updatedInvoiceData.invoiceNumber ? fullUpdatedInvoice : inv
      )
    );

    addToast(
      `Invoice #${updatedInvoiceData.invoiceNumber} updated successfully. Total: ${hotelInfo.currency}${grandTotal}`,
      'success',
      'Invoice Modified'
    );

    return fullUpdatedInvoice;
  };

  // ACCOUNTS & LEDGERS ACTIONS (Profit & Loss / Expenses / Income)
  const addLedgerEntry = (entryData) => {
    const voucherNumber = `VOUCH-${new Date().getFullYear()}-${String(ledgerEntries.length + 101).padStart(3, '0')}`;
    const newEntry = {
      id: `LED-${Date.now()}`,
      voucherNumber: entryData.voucherNumber?.trim() || voucherNumber,
      type: entryData.type || 'EXPENSE',
      category: entryData.category || 'Food Raw Materials & Dairy',
      costType: entryData.costType || (entryData.type === 'INCOME' ? 'REVENUE' : 'OPEX'),
      title: entryData.title.trim(),
      vendorName: entryData.vendorName?.trim() || 'Vendor / Counterparty',
      amount: Number(entryData.amount) || 0,
      paymentMethod: entryData.paymentMethod || 'CASH',
      reference: entryData.reference?.trim() || `REF-${Date.now().toString().slice(-4)}`,
      date: entryData.date || new Date().toISOString().slice(0, 10),
      time: entryData.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      recordedBy: `${currentUser?.name || 'Manager'} (${currentUser?.role || 'MANAGER'})`,
      notes: entryData.notes?.trim() || ''
    };

    setLedgerEntries((prev) => [newEntry, ...prev]);
    addToast(
      `Recorded ${newEntry.type === 'EXPENSE' ? 'Expense' : 'Income'} of ${hotelInfo.currency}${newEntry.amount} [${newEntry.voucherNumber}]`,
      'success',
      'Voucher Logged'
    );
    return newEntry;
  };

  const updateLedgerEntry = (updatedData) => {
    setLedgerEntries((prev) =>
      prev.map((entry) =>
        entry.id === updatedData.id
          ? {
              ...entry,
              ...updatedData,
              amount: Number(updatedData.amount) || entry.amount
            }
          : entry
      )
    );
    addToast(`Updated Voucher #${updatedData.voucherNumber}`, 'success', 'Voucher Updated');
  };

  const deleteLedgerEntry = (entryId) => {
    const entry = ledgerEntries.find((e) => e.id === entryId);
    setLedgerEntries((prev) => prev.filter((e) => e.id !== entryId));
    addToast(`Deleted voucher #${entry?.voucherNumber || entryId}`, 'info', 'Voucher Removed');
  };

  const resetAllDataToDemo = () => {
    setHotelInfo(DEFAULT_HOTEL_INFO);
    setCategories(DEFAULT_CATEGORIES);
    setMenu(DEFAULT_MENU);
    setTables(DEFAULT_TABLES);
    setActiveOrders(DEFAULT_ACTIVE_ORDERS);
    setInvoices(DEFAULT_INVOICES);
    setLedgerEntries(DEFAULT_LEDGER_ENTRIES);
    addToast('System reset to luxury hotel demo state.', 'info', 'Data Reset');
  };

  return (
    <HotelContext.Provider
      value={{
        hotelInfo,
        setHotelInfo,
        categories,
        menu,
        tables,
        activeOrders,
        invoices,
        ledgerEntries,
        addLedgerEntry,
        updateLedgerEntry,
        deleteLedgerEntry,
        expenseCategories: EXPENSE_CATEGORIES,
        addTable,
        updateTable,
        deleteTable,
        addCategory,
        deleteCategory,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        toggleItemAvailability,
        createOrderForTable,
        getTableOrder,
        addItemToOrder,
        updateItemQuantity,
        removeItemFromOrder,
        updateOrderGuestDetails,
        setOrderDiscount,
        calculateBillTotals,
        checkCanPrint,
        settleTableBill,
        updateInvoice,
        resetAllDataToDemo
      }}
    >
      {children}
    </HotelContext.Provider>
  );
};

export const useHotel = () => {
  const context = useContext(HotelContext);
  if (!context) {
    throw new Error('useHotel must be used within a HotelProvider');
  }
  return context;
};
