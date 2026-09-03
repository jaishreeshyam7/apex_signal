import React from 'react';
import { BillingProvider, useBilling } from './context/BillingContext';
import { Login } from './components/Auth/Login';
import { Sidebar } from './components/Layout/Sidebar';
import { Dashboard } from './components/Dashboard/Dashboard';
import { NewInvoice } from './components/Invoice/NewInvoice';
import { InvoiceHistory } from './components/Invoice/InvoiceHistory';
import { PartyMaster } from './components/Masters/PartyMaster';
import { ItemMaster } from './components/Masters/ItemMaster';
import { CompanySettings } from './components/Settings/CompanySettings';
import { InvoicePrintView } from './components/Invoice/InvoicePrintView';

const MainAppContent: React.FC = () => {
  const {
    user,
    activeView,
    selectedInvoiceForPrint,
    setSelectedInvoiceForPrint,
    companyDetails,
  } = useBilling();

  if (!user) {
    return <Login />;
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'new-invoice':
        return <NewInvoice />;
      case 'invoices':
        return <InvoiceHistory />;
      case 'parties':
        return <PartyMaster />;
      case 'items':
        return <ItemMaster />;
      case 'settings':
        return <CompanySettings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-800">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-slate-50/50">
        {renderView()}
      </main>

      {/* Print / PDF Modal Overlay */}
      {selectedInvoiceForPrint && (
        <InvoicePrintView
          invoice={selectedInvoiceForPrint}
          companyDetails={companyDetails}
          onClose={() => setSelectedInvoiceForPrint(null)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <BillingProvider>
      <MainAppContent />
    </BillingProvider>
  );
}
