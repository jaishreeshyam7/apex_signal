import React, { useState } from 'react';
import { useBilling } from '../../context/BillingContext';
import { Header } from '../Layout/Header';
import type { Invoice } from '../../types/billing';
import {
  Search,
  Printer,
  Edit2,
  Trash2,
} from 'lucide-react';

export const InvoiceHistory: React.FC = () => {
  const {
    invoices,
    setSelectedInvoiceForPrint,
    setEditingInvoice,
    deleteInvoice,
    setActiveView,
  } = useBilling();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Final' | 'Draft'>('All');

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.buyer?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.motorVehicleNo || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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
        title="Invoice History"
        subtitle="View, search, edit and print past invoices"
        showNewInvoiceButton={true}
      />

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Invoice No, Party..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {(['All', 'Final', 'Draft'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  statusFilter === status
                    ? 'bg-white text-blue-600 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <span className="text-xs font-semibold text-slate-500 ml-2">
            Showing {filteredInvoices.length} invoices
          </span>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-3.5">Invoice No</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Party (Buyer)</th>
                <th className="px-6 py-3.5">Vehicle No</th>
                <th className="px-6 py-3.5">Amount</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-6 py-4 font-bold text-slate-900">
                    #{inv.invoiceNo}
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium whitespace-nowrap">
                    {inv.date}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-800 uppercase max-w-xs truncate">
                    {inv.buyer?.name}
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-medium whitespace-nowrap">
                    {inv.motorVehicleNo || '—'}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">
                    {formatCurrency(inv.grandTotal)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        inv.status === 'Final'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
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
                        title="Print / View Invoice"
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

              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No invoices found matching "{searchQuery}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
