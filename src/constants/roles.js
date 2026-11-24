export const ROLES = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  WAITER: "WAITER",
  CASHIER: "CASHIER"
};

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: {
    label: "Administrator",
    canPrintInvoices: true,
    canManageMenu: true,
    canManageCategories: true,
    canManageSettings: true,
    canManageTables: true,
    canApplyDiscounts: true,
    canSettleBills: true,
    canViewAnalytics: true,
    canReprintInvoices: true,
    badgeColor: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-800",
    description: "Unrestricted access: full billing, menu management, printer access, and system configurations."
  },
  [ROLES.MANAGER]: {
    label: "Floor Manager",
    canPrintInvoices: true,
    canManageMenu: true,
    canManageCategories: true,
    canManageSettings: false,
    canManageTables: true,
    canApplyDiscounts: true,
    canSettleBills: true,
    canViewAnalytics: true,
    canReprintInvoices: true,
    badgeColor: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800",
    description: "Authorized to print table invoices, authorize discounts, and manage daily menus & operations."
  },
  [ROLES.WAITER]: {
    label: "Steward / Waiter",
    canPrintInvoices: false, // EXPLICIT RESTRICTION
    canManageMenu: false,
    canManageCategories: false,
    canManageSettings: false,
    canManageTables: false,
    canApplyDiscounts: false,
    canSettleBills: false,
    canViewAnalytics: false,
    canReprintInvoices: false,
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800",
    description: "Can take customer orders and send tickets to the kitchen. Cannot print final invoices."
  },
  [ROLES.CASHIER]: {
    label: "Cashier",
    canPrintInvoices: false, // Strict: only Admin & Manager can print as requested
    canManageMenu: false,
    canManageCategories: false,
    canManageSettings: false,
    canManageTables: false,
    canApplyDiscounts: false,
    canSettleBills: true,
    canViewAnalytics: true,
    canReprintInvoices: false,
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800",
    description: "Handles payment collection and cash register. Requires Manager/Admin for printing invoices."
  }
};

/**
 * Checks if a given role is allowed to print table invoices.
 * STRICT ENFORCEMENT: ONLY Admin and Manager can print table invoices.
 */
export const canUserPrintInvoice = (role) => {
  return role === ROLES.ADMIN || role === ROLES.MANAGER;
};

/**
 * Checks if a given role is allowed to edit menu items, categories, or prices.
 */
export const canUserManageMenu = (role) => {
  return role === ROLES.ADMIN || role === ROLES.MANAGER;
};
