import React from 'react';
import { useBilling } from '../../context/BillingContext';
import { Header } from '../Layout/Header';
import {
  FileText,
  IndianRupee,
  TrendingUp,
  FileClock,
  Printer,
  Edit2,
  Trash2,
  PlusCircle,
} from 'lucide-react';
import type { Invoice } from '../../types/billing';

export const Dashboard: React.FC = () => {
  const {
    invoices,
    setActiveView,
    setSelectedInvoiceForPrint,
    setEditingInvoice,
    deleteInvoice,
  } = useBilling();

  const totalSales = invoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
  const draftsCount = invoices.filter((inv) => inv.status === 'Draft').length;

  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const thisMonthSales = invoices
    .filter((inv) => (inv.date || '').startsWith(currentMonth))
    .reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);

  const formatCurrency = (num: number) => {
    return '₹' + (num || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handlePrint = (inv: Invoice) => {
    setSelectedInvoiceForPrint(inv);
  };

  const handleEdit = (inv: Invoice) => {
    setEditingInvoice(inv);
    setActiveView('new-invoice');
  };

  const handleDelete = (id: string, invNo: string) => {
    if (window.confirm(`Are you sure you want to delete Invoice #${invNo}?`)) {
      deleteInvoice(id);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <Header
        title="Dashboard"
        subtitle="Yash Polymers — Invoice Overview"
        showNewInvoiceButton={true}
      />

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Invoices */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Invoices</p>
            <p className="text-2xl font-bold text-slate-800 mt-0.5">{invoices.length}</p>
          </div>
        </div>

        {/* Total Sales */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Sales</p>
            <p className="text-2xl font-bold text-slate-800 mt-0.5">
              {formatCurrency(totalSales)}
            </p>
          </div>
        </div>

        {/* This Month */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">This Month</p>
            <p className="text-2xl font-bold text-slate-800 mt-0.5">
              {formatCurrency(thisMonthSales || totalSales)}
            </p>
          </div>
        </div>

        {/* Drafts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
            <FileClock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Drafts</p>
            <p className="text-2xl font-bold text-slate-800 mt-0.5">{draftsCount}</p>
          </div>
        </div>
      </div>

      {/* Recent Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">Recent Invoices</h2>
          {invoices.length > 0 && (
            <button
              onClick={() => setActiveView('invoices')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              View All History →
            </button>
          )}
        </div>

        {invoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-3.5">Invoice No</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Party</th>
                  <th className="px-6 py-3.5">Amount</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {invoices.slice(0, 10).map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition group">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      #{inv.invoiceNo}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium whitespace-nowrap">
                      {inv.date}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800 uppercase max-w-xs truncate">
                      {inv.buyer?.name || 'CASH SALE'}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">
                      {formatCurrency(inv.grandTotal)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          inv.status === 'Final'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handlePrint(inv)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="View & Print Bill"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(inv)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                          title="Edit Invoice"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(inv.id, inv.invoiceNo)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                          title="Delete Invoice"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 px-4">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xs">
              <PlusCircle className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No invoices yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Your system is clean and ready. Add your company details in Settings, create parties in Party Master, and generate your first invoice!
            </p>
            <button
              onClick={() => {
                setEditingInvoice(null);
                setActiveView('new-invoice');
              }}
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition"
            >
              <span>+ Create First Invoice</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
