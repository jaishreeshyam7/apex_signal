import React, { useState } from 'react';
import { useBilling } from '../../context/BillingContext';
import type { Party } from '../../types/billing';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';

export const PartyMaster: React.FC = () => {
  const { parties, addParty, updateParty, deleteParty } = useBilling();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParty, setEditingParty] = useState<Party | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    gstin: '',
    state: 'Delhi',
    stateCode: '07',
    city: 'DELHI',
    address: '',
    phone: '',
    email: '',
  });

  const openAddModal = () => {
    setEditingParty(null);
    setFormData({
      name: '',
      gstin: '',
      state: 'Delhi',
      stateCode: '07',
      city: 'DELHI',
      address: '',
      phone: '',
      email: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (party: Party) => {
    setEditingParty(party);
    setFormData({
      name: party.name,
      gstin: party.gstin,
      state: party.state,
      stateCode: party.stateCode || '07',
      city: party.city,
      address: party.address,
      phone: party.phone || '',
      email: party.email || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert('Party Name is required');
      return;
    }

    if (editingParty) {
      updateParty({
        ...editingParty,
        ...formData,
      });
    } else {
      addParty(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteParty(id);
    }
  };

  const filteredParties = parties.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.gstin.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Party Master</h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">Manage customer & supplier accounts</p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0a152e] hover:bg-slate-800 text-white text-sm font-semibold rounded-xl shadow-md transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Party</span>
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
            placeholder="Search party by name, GSTIN..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
        </div>

        <span className="text-xs font-semibold text-slate-500">
          Total {filteredParties.length} Parties
        </span>
      </div>

      {/* Party Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-3.5">Name</th>
                <th className="px-6 py-3.5">GSTIN</th>
                <th className="px-6 py-3.5">State</th>
                <th className="px-6 py-3.5">City</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredParties.map((party) => (
                <tr key={party.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-6 py-4 font-bold text-slate-800 uppercase">
                    {party.name}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-600 font-semibold">
                    {party.gstin || '—'}
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">
                    {party.state}
                  </td>
                  <td className="px-6 py-4 text-slate-600 uppercase font-medium">
                    {party.city || '—'}
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(party)}
                        className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                        title="Edit Party"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(party.id, party.name)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="Delete Party"
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

      {/* Add / Edit Party Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 bg-[#0a152e] text-white flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingParty ? 'Edit Party' : 'Add New Party'}
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
                  Party / Company Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="VERMA POLYMER INDUSTRIES"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    GSTIN Number
                  </label>
                  <input
                    type="text"
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="07BMOPV7866E1Z8"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    State
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Delhi">Delhi (07)</option>
                    <option value="Haryana">Haryana (06)</option>
                    <option value="Uttar Pradesh">Uttar Pradesh (09)</option>
                    <option value="Rajasthan">Rajasthan (08)</option>
                    <option value="Punjab">Punjab (03)</option>
                    <option value="Gujarat">Gujarat (24)</option>
                    <option value="Maharashtra">Maharashtra (27)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="DELHI"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Full Billing / Shipping Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value.toUpperCase() })}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="PLOT NUMBER- 2220 BLOCK I ROAD NUMBER 86 DSIIDC INDUSTRIAL AREA NARELA DELHI"
                />
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
                  {editingParty ? 'Update Party' : 'Save Party'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
