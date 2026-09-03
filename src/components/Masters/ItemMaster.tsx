import React, { useState } from 'react';
import { useBilling } from '../../context/BillingContext';
import type { Item } from '../../types/billing';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';

export const ItemMaster: React.FC = () => {
  const { items, addItem, updateItem, deleteItem } = useBilling();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    hsn: '28365000',
    unit: 'KGS',
    rate: 16.50,
    gstRate: 18,
    description: '',
  });

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      hsn: '28365000',
      unit: 'KGS',
      rate: 16.00,
      gstRate: 18,
      description: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: Item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      hsn: item.hsn,
      unit: item.unit,
      rate: item.rate,
      gstRate: item.gstRate,
      description: item.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert('Item Name is required');
      return;
    }

    if (editingItem) {
      updateItem({
        ...editingItem,
        ...formData,
        rate: Number(formData.rate) || 0,
        gstRate: Number(formData.gstRate) || 18,
      });
    } else {
      addItem({
        ...formData,
        rate: Number(formData.rate) || 0,
        gstRate: Number(formData.gstRate) || 18,
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteItem(id);
    }
  };

  const formatCurrency = (num: number) => {
    return '₹' + (num || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const filteredItems = items.filter((i) =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.hsn.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Item Master</h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">Manage products, HSN codes, and pricing</p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0a152e] hover:bg-slate-800 text-white text-sm font-semibold rounded-xl shadow-md transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Item</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm mb-6 flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items by name, HSN..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
        </div>

        <span className="text-xs font-semibold text-slate-500">
          Total {filteredItems.length} Items
        </span>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-3.5">Item Name</th>
                <th className="px-6 py-3.5">HSN/SAC</th>
                <th className="px-6 py-3.5">Unit</th>
                <th className="px-6 py-3.5">Rate</th>
                <th className="px-6 py-3.5">GST %</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-6 py-4 font-bold text-slate-800 uppercase">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-600 font-semibold">
                    {item.hsn}
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-semibold uppercase">
                    {item.unit}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">
                    {formatCurrency(item.rate)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                      {item.gstRate}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                        title="Edit Item"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.name)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="Delete Item"
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
      </div>

      {/* Add / Edit Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 bg-[#0a152e] text-white flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingItem ? 'Edit Item' : 'Add New Item'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Item / Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="UNCOATED CALCIUM CARBONATE"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    HSN/SAC Code *
                  </label>
                  <input
                    type="text"
                    value={formData.hsn}
                    onChange={(e) => setFormData({ ...formData, hsn: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="28365000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Unit of Measurement
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="KGS">KGS</option>
                    <option value="MT">MT (Metric Ton)</option>
                    <option value="BAGS">BAGS</option>
                    <option value="PCS">PCS</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Default Rate (₹) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.rate}
                    onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="16.50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    GST Rate %
                  </label>
                  <select
                    value={formData.gstRate}
                    onChange={(e) => setFormData({ ...formData, gstRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value={18}>18% (Standard Chemicals/Polymers)</option>
                    <option value={5}>5% (Minerals / Limestone)</option>
                    <option value={12}>12%</option>
                    <option value={28}>28%</option>
                    <option value={0}>0% (Exempt)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-md"
                >
                  {editingItem ? 'Update Item' : 'Save Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
