import React, { useState } from 'react';
import { useBilling } from '../../context/BillingContext';
import { Header } from '../Layout/Header';
import { Building2, Landmark, Save, CheckCircle2, Trash2 } from 'lucide-react';

export const CompanySettings: React.FC = () => {
  const { companyDetails, updateCompanyDetails, resetAllData } = useBilling();

  const [formData, setFormData] = useState({
    name: companyDetails.name,
    gstin: companyDetails.gstin,
    pan: companyDetails.pan,
    address: companyDetails.address,
    city: companyDetails.city,
    state: companyDetails.state,
    stateCode: companyDetails.stateCode,
    pincode: companyDetails.pincode,
    phone: companyDetails.phone,
    email: companyDetails.email,
    bankAccountHolder: companyDetails.bankDetails.accountHolder,
    bankName: companyDetails.bankDetails.bankName,
    bankAccountNumber: companyDetails.bankDetails.accountNumber,
    bankBranchAndIfsc: companyDetails.bankDetails.branchAndIfsc,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanyDetails({
      name: formData.name,
      gstin: formData.gstin,
      pan: formData.pan,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      stateCode: formData.stateCode,
      pincode: formData.pincode,
      phone: formData.phone,
      email: formData.email,
      bankDetails: {
        accountHolder: formData.bankAccountHolder,
        bankName: formData.bankName,
        accountNumber: formData.bankAccountNumber,
        branchAndIfsc: formData.bankBranchAndIfsc,
      },
      termsAndConditions: companyDetails.termsAndConditions,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to wipe all local data and start completely fresh?')) {
      resetAllData();
      alert('All local database records have been reset successfully!');
      window.location.reload();
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto w-full pb-20">
      <Header
        title="Company Settings"
        subtitle="Manage business profile, GSTIN, and Bank credentials"
      />

      {savedSuccess && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Company profile & bank settings updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Details Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h2 className="text-base font-bold text-slate-800 mb-6 flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building2 className="w-5 h-5 text-blue-600" />
            <span>Company Details</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Company Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Yash Polymers"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">GSTIN</label>
                <input
                  type="text"
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-semibold uppercase text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="07AJEPG9306L1Z2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">PAN</label>
                <input
                  type="text"
                  value={formData.pan}
                  onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-semibold uppercase text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="AJEPG9306L"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm uppercase text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="PKT- E, SEC-4, BAWANA INDUSTRIAL AREA, BAWANA"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Delhi, India"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Delhi"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">State Code</label>
                <input
                  type="text"
                  value={formData.stateCode}
                  onChange={(e) => setFormData({ ...formData, stateCode: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="07"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Pincode</label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="110039"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="9810293598"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="gargvikas144@gmail.com"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bank Details Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h2 className="text-base font-bold text-slate-800 mb-6 flex items-center gap-2 pb-3 border-b border-slate-100">
            <Landmark className="w-5 h-5 text-blue-600" />
            <span>Bank Details</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">A/c Holder's Name</label>
              <input
                type="text"
                value={formData.bankAccountHolder}
                onChange={(e) => setFormData({ ...formData, bankAccountHolder: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Yash Polymers"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm uppercase text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="STATE BANK OF INDIA"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">A/c Number</label>
                <input
                  type="text"
                  value={formData.bankAccountNumber}
                  onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="44204302050"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Branch & IFS Code</label>
              <input
                type="text"
                value={formData.bankBranchAndIfsc}
                onChange={(e) => setFormData({ ...formData, bankBranchAndIfsc: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm uppercase text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="INDERLOK & SBIN0006102"
              />
            </div>
          </div>
        </div>

        {/* Submit & Reset Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleResetData}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold rounded-xl transition"
          >
            <Trash2 className="w-4 h-4" />
            <span>Reset All Local Data to Clean Slate</span>
          </button>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition w-full sm:w-auto justify-center"
          >
            <Save className="w-4 h-4" />
            <span>Save Company Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
