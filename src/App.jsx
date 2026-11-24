import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HotelProvider, useHotel } from './context/HotelContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { LoginPage } from './components/auth/LoginPage';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { TableGrid } from './components/tables/TableGrid';
import { TableDetailModal } from './components/tables/TableDetailModal';
import { MenuManagement } from './components/menu/MenuManagement';
import { AddEditMenuItemModal } from './components/menu/AddEditMenuItemModal';
import { CategoryManagerModal } from './components/menu/CategoryManagerModal';
import { InvoicePrintModal } from './components/billing/InvoicePrintModal';
import { PaymentModal } from './components/billing/PaymentModal';
import { InvoiceHistory } from './components/billing/InvoiceHistory';
import { EditInvoiceModal } from './components/billing/EditInvoiceModal';
import { SalesReports } from './components/reports/SalesReports';
import { AccountsAndLedgers } from './components/accounting/AccountsAndLedgers';
import { HotelSettings } from './components/settings/HotelSettings';

const MainApplication = () => {
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, tables, menu, invoices, settings

  // Modal states
  const [selectedTable, setSelectedTable] = useState(null);
  const [isTableDetailOpen, setIsTableDetailOpen] = useState(false);

  const [printModalState, setPrintModalState] = useState({
    isOpen: false,
    table: null,
    order: null,
    totals: null,
    authorizedBy: null,
    completedInvoice: null
  });

  const [paymentModalState, setPaymentModalState] = useState({
    isOpen: false,
    table: null,
    order: null,
    totals: null
  });

  const [invoiceToEdit, setInvoiceToEdit] = useState(null);

  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  // If not logged in, show the Login Page
  if (!currentUser) {
    return <LoginPage />;
  }

  const handleOpenTable = (table) => {
    setSelectedTable(table);
    setIsTableDetailOpen(true);
  };

  const handleOpenPrintInvoice = (table, order, totals, authorizedBy) => {
    setPrintModalState({
      isOpen: true,
      table,
      order,
      totals,
      authorizedBy,
      completedInvoice: null
    });
  };

  const handleOpenPaymentModal = (table, order, totals) => {
    setPaymentModalState({
      isOpen: true,
      table,
      order,
      totals
    });
  };

  const handlePaymentComplete = (completedInvoice, shouldPrint) => {
    setIsTableDetailOpen(false);
    setSelectedTable(null);

    if (shouldPrint && completedInvoice) {
      setPrintModalState({
        isOpen: true,
        table: null,
        order: null,
        totals: null,
        authorizedBy: currentUser,
        completedInvoice
      });
    }
  };

  const handleReprintInvoice = (invoice, authorizedBy) => {
    setPrintModalState({
      isOpen: true,
      table: null,
      order: null,
      totals: null,
      authorizedBy: authorizedBy || currentUser,
      completedInvoice: invoice
    });
  };

  const handleOpenEditInvoice = (invoice) => {
    setInvoiceToEdit(invoice);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
      {/* Top Navigation Bar */}
      <Header />

      {/* Main Container: Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="no-print hidden md:flex">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* Mobile Tab Switcher */}
          <div className="md:hidden flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 no-scrollbar">
            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'tables', label: 'Tables & POS' },
              { id: 'menu', label: 'Menu & Prices' },
              { id: 'invoices', label: 'Invoices' },
              { id: 'reports', label: 'Reports' },
              { id: 'accounts', label: 'Accounts & P&L' },
              { id: 'settings', label: 'Settings' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? 'bg-brand-600 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Active Tab View */}
          {activeTab === 'dashboard' && (
            <DashboardOverview
              setActiveTab={setActiveTab}
              onSelectTable={handleOpenTable}
              onOpenAddMenu={() => setIsAddMenuOpen(true)}
              onEditInvoice={handleOpenEditInvoice}
              onReprintInvoice={handleReprintInvoice}
            />
          )}

          {activeTab === 'tables' && (
            <TableGrid onSelectTable={handleOpenTable} />
          )}

          {activeTab === 'menu' && <MenuManagement />}

          {activeTab === 'invoices' && (
            <InvoiceHistory
              onReprintInvoice={handleReprintInvoice}
              onNavigateToReports={() => setActiveTab('reports')}
            />
          )}

          {activeTab === 'reports' && (
            <SalesReports onReprintInvoice={handleReprintInvoice} />
          )}

          {activeTab === 'accounts' && <AccountsAndLedgers />}

          {activeTab === 'settings' && <HotelSettings />}
        </main>
      </div>

      {/* Modals */}
      <TableDetailModal
        isOpen={isTableDetailOpen}
        onClose={() => {
          setIsTableDetailOpen(false);
          setSelectedTable(null);
        }}
        table={selectedTable}
        onOpenPrintInvoice={handleOpenPrintInvoice}
        onOpenPaymentModal={handleOpenPaymentModal}
      />

      <InvoicePrintModal
        isOpen={printModalState.isOpen}
        onClose={() =>
          setPrintModalState((prev) => ({ ...prev, isOpen: false }))
        }
        table={printModalState.table}
        order={printModalState.order}
        totals={printModalState.totals}
        authorizedBy={printModalState.authorizedBy}
        completedInvoice={printModalState.completedInvoice}
        onOpenEdit={handleOpenEditInvoice}
      />

      <PaymentModal
        isOpen={paymentModalState.isOpen}
        onClose={() =>
          setPaymentModalState((prev) => ({ ...prev, isOpen: false }))
        }
        table={paymentModalState.table}
        order={paymentModalState.order}
        totals={paymentModalState.totals}
        onPaymentComplete={handlePaymentComplete}
      />

      {/* Edit Invoice Modal */}
      <EditInvoiceModal
        isOpen={Boolean(invoiceToEdit)}
        onClose={() => setInvoiceToEdit(null)}
        invoice={invoiceToEdit}
        onSaveSuccess={() => setInvoiceToEdit(null)}
        onSaveAndPrint={(updatedInv) => {
          setInvoiceToEdit(null);
          handleReprintInvoice(updatedInv, currentUser);
        }}
      />

      {/* Quick Add Menu Item Modal */}
      <AddEditMenuItemModal
        isOpen={isAddMenuOpen}
        onClose={() => setIsAddMenuOpen(false)}
        onOpenCategoryModal={() => {
          setIsAddMenuOpen(false);
          setIsCategoryOpen(true);
        }}
      />

      {/* Quick Category Manager Modal */}
      <CategoryManagerModal
        isOpen={isCategoryOpen}
        onClose={() => setIsCategoryOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <HotelProvider>
          <MainApplication />
        </HotelProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
