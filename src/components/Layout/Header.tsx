import React from 'react';
import { useBilling } from '../../context/BillingContext';
import { Plus } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showNewInvoiceButton?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showNewInvoiceButton = false,
}) => {
  const { setActiveView, setEditingInvoice } = useBilling();

  const handleNewInvoice = () => {
    setEditingInvoice(null);
    setActiveView('new-invoice');
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-200">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 font-medium mt-0.5">{subtitle}</p>}
      </div>

      {showNewInvoiceButton && (
        <button
          onClick={handleNewInvoice}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0a152e] hover:bg-slate-800 text-white text-sm font-semibold rounded-xl shadow-md transition duration-150 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ New Invoice</span>
        </button>
      )}
    </div>
  );
};
