import React, { useState, useEffect } from 'react';
import { useBilling } from '../../context/BillingContext';
import { Header } from '../Layout/Header';
import type { InvoiceItem, Invoice } from '../../types/billing';
import { numberToWordsINR } from '../../utils/numberToWords';
import { Plus, Trash2, Printer, ArrowLeft, Building, Truck, Package } from 'lucide-react';

export const NewInvoice: React.FC = () => {
  const {
    parties,
    items: masterItems,
    addInvoice,
    updateInvoice,
    getNextInvoiceNo,
    editingInvoice,
    setEditingInvoice,
    setActiveView,
    setSelectedInvoiceForPrint,
  } = useBilling();

  const isEditing = Boolean(editingInvoice);

  // Form State
  const [invoiceNo, setInvoiceNo] = useState(editingInvoice?.invoiceNo || getNextInvoiceNo());
  const [date, setDate] = useState(editingInvoice?.date || new Date().toISOString().split('T')[0]);
  const [eWayBillNo, setEWayBillNo] = useState(editingInvoice?.eWayBillNo || '-');
  const [deliveryNote] = useState(editingInvoice?.deliveryNote || '');
  const [paymentTerms, setPaymentTerms] = useState(editingInvoice?.paymentTerms || '15 Days');
  const [otherReferences] = useState(editingInvoice?.otherReferences || '');
  const [buyerOrderNo, setBuyerOrderNo] = useState(editingInvoice?.buyerOrderNo || '-');
  const [buyerOrderDate] = useState(editingInvoice?.buyerOrderDate || '');
  const [dispatchDocNo] = useState(editingInvoice?.dispatchDocNo || '-');
  const [deliveryNoteDate] = useState(editingInvoice?.deliveryNoteDate || '');
  const [dispatchedThrough, setDispatchedThrough] = useState(editingInvoice?.dispatchedThrough || '-');
  const [destination, setDestination] = useState(editingInvoice?.destination || 'DELHI');
  const [billOfLadingNo] = useState(editingInvoice?.billOfLadingNo || '-');
  const [motorVehicleNo, setMotorVehicleNo] = useState(editingInvoice?.motorVehicleNo || 'DL01LAD1631');
  const [termsOfDelivery] = useState(editingInvoice?.termsOfDelivery || '-');

  // Selected Buyer & Consignee
  const [selectedBuyerId, setSelectedBuyerId] = useState<string>(
    editingInvoice?.buyer?.id || parties[0]?.id || ''
  );
  const [isSameAsBuyer, setIsSameAsBuyer] = useState(
    editingInvoice ? editingInvoice.isSameAsBuyer : true
  );
  const [selectedConsigneeId, setSelectedConsigneeId] = useState<string>(
    editingInvoice?.consignee?.id || parties[0]?.id || ''
  );

  // Current active buyer object
  const currentBuyer = parties.find((p) => p.id === selectedBuyerId) || editingInvoice?.buyer || parties[0];
  const currentConsignee = isSameAsBuyer
    ? currentBuyer
    : parties.find((p) => p.id === selectedConsigneeId) || currentBuyer;

  // Invoice Items
  const [items, setItems] = useState<InvoiceItem[]>(
    editingInvoice?.items || [
      {
        id: 'row-1',
        itemId: masterItems[0]?.id || '',
        description: masterItems[0]?.name || 'UNCOATED CALCIUM CARBONATE',
        hsn: masterItems[0]?.hsn || '28365000',
        gstRate: masterItems[0]?.gstRate || 18,
        quantity: 2500,
        rate: masterItems[0]?.rate || 16.50,
        unit: masterItems[0]?.unit || 'KGS',
        amount: 41250,
      },
    ]
  );

  // State Tax check: If Delhi (07) => CGST+SGST, otherwise IGST
  const isBuyerDelhi = (currentBuyer?.state || '').toLowerCase().includes('delhi');
  const [isInterState, setIsInterState] = useState(!isBuyerDelhi);

  useEffect(() => {
    setIsInterState(!isBuyerDelhi);
    setDestination(currentBuyer?.city || 'DELHI');
  }, [selectedBuyerId]);

  // Recalculate row amounts
  const handleItemRowChange = (index: number, field: keyof InvoiceItem, value: any) => {
    setItems((prev) => {
      const updated = [...prev];
      const row = { ...updated[index], [field]: value };

      if (field === 'quantity' || field === 'rate') {
        const qty = field === 'quantity' ? Number(value) : row.quantity;
        const rt = field === 'rate' ? Number(value) : row.rate;
        row.amount = Math.round((qty || 0) * (rt || 0) * 100) / 100;
      }

      updated[index] = row;
      return updated;
    });
  };

  // Select item from master
  const handleSelectMasterItem = (index: number, masterItemId: string) => {
    const master = masterItems.find((m) => m.id === masterItemId);
    if (!master) return;

    setItems((prev) => {
      const updated = [...prev];
      const row = updated[index];
      const qty = row.quantity || 1;
      const rate = master.rate || 0;
      updated[index] = {
        ...row,
        itemId: master.id,
        description: master.name,
        hsn: master.hsn,
        unit: master.unit,
        rate: rate,
        gstRate: master.gstRate,
        amount: Math.round(qty * rate * 100) / 100,
      };
      return updated;
    });
  };

  const addRow = () => {
    const firstMaster = masterItems[0];
    const newRow: InvoiceItem = {
      id: `row-${Date.now()}`,
      itemId: firstMaster?.id || '',
      description: firstMaster?.name || 'CALCIUM CARBONATE',
      hsn: firstMaster?.hsn || '28365000',
      gstRate: firstMaster?.gstRate || 18,
      quantity: 1000,
      rate: firstMaster?.rate || 16.00,
      unit: firstMaster?.unit || 'KGS',
      amount: 16000,
    };
    setItems((prev) => [...prev, newRow]);
  };

  const removeRow = (index: number) => {
    if (items.length <= 1) {
      alert('Invoice must have at least one item.');
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Calculated totals
  const subtotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  
  // Tax rate (default 18%)
  const primaryGstRate = items[0]?.gstRate || 18;
  const halfGstRate = primaryGstRate / 2;

  let cgstTotal = 0;
  let sgstTotal = 0;
  let igstTotal = 0;

  if (!isInterState) {
    cgstTotal = Math.round((subtotal * halfGstRate) / 100 * 100) / 100;
    sgstTotal = Math.round((subtotal * halfGstRate) / 100 * 100) / 100;
  } else {
    igstTotal = Math.round((subtotal * primaryGstRate) / 100 * 100) / 100;
  }

  const totalTax = cgstTotal + sgstTotal + igstTotal;
  const grandTotal = Math.round((subtotal + totalTax) * 100) / 100;

  const amountInWords = numberToWordsINR(grandTotal);
  const taxInWords = numberToWordsINR(totalTax);

  // Save invoice handler
  const handleSave = (status: 'Final' | 'Draft', printAfterSave = false) => {
    if (!currentBuyer) {
      alert('Please select a Buyer.');
      return;
    }
    if (items.length === 0 || subtotal <= 0) {
      alert('Please add valid items with quantity and rate.');
      return;
    }

    const newInvoiceObj: Invoice = {
      id: editingInvoice?.id || `inv-${Date.now()}`,
      invoiceNo: invoiceNo.trim() || '340',
      date,
      eWayBillNo,
      deliveryNote,
      paymentTerms,
      otherReferences,
      buyerOrderNo,
      buyerOrderDate,
      dispatchDocNo,
      deliveryNoteDate,
      dispatchedThrough,
      destination,
      billOfLadingNo,
      motorVehicleNo,
      termsOfDelivery,
      buyer: currentBuyer,
      consignee: currentConsignee,
      isSameAsBuyer,
      items,
      subtotal,
      isInterState,
      cgstRate: isInterState ? 0 : halfGstRate,
      cgstTotal,
      sgstRate: isInterState ? 0 : halfGstRate,
      sgstTotal,
      igstRate: isInterState ? primaryGstRate : 0,
      igstTotal,
      totalTax,
      grandTotal,
      amountInWords,
      taxInWords,
      status,
      createdAt: editingInvoice?.createdAt || new Date().toISOString(),
    };

    if (isEditing) {
      updateInvoice(newInvoiceObj);
    } else {
      addInvoice(newInvoiceObj);
    }

    if (printAfterSave) {
      setSelectedInvoiceForPrint(newInvoiceObj);
    }

    setEditingInvoice(null);
    setActiveView('dashboard');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full pb-20">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => {
            setEditingInvoice(null);
            setActiveView('dashboard');
          }}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSave('Draft')}
            className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl transition"
          >
            Save as Draft
          </button>
          <button
            onClick={() => handleSave('Final', true)}
            className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-md transition"
          >
            <Printer className="w-4 h-4" />
            <span>Save & Print Tax Invoice</span>
          </button>
        </div>
      </div>

      <Header
        title={isEditing ? `Edit Invoice #${invoiceNo}` : 'Create New Tax Invoice'}
        subtitle="Generate GST compliant tax invoice for Yash Polymers"
      />

      <div className="space-y-6">
        {/* Card 1: Invoice & Transport Meta */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-600" />
            <span>Invoice & Transport Details</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Invoice No. *
              </label>
              <input
                type="text"
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Invoice Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Motor Vehicle No.
              </label>
              <input
                type="text"
                value={motorVehicleNo}
                onChange={(e) => setMotorVehicleNo(e.target.value.toUpperCase())}
                placeholder="DL01LAD1631"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Terms of Payment
              </label>
              <input
                type="text"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                placeholder="15 Days"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                e-Way Bill No.
              </label>
              <input
                type="text"
                value={eWayBillNo}
                onChange={(e) => setEWayBillNo(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Destination
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value.toUpperCase())}
                placeholder="DELHI"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Buyer's Order No.
              </label>
              <input
                type="text"
                value={buyerOrderNo}
                onChange={(e) => setBuyerOrderNo(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Dispatched Through
              </label>
              <input
                type="text"
                value={dispatchedThrough}
                onChange={(e) => setDispatchedThrough(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Buyer & Consignee Parties */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-600" />
            <span>Party / Customer Details</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Buyer (Bill to) */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Select Buyer (Bill to) *
              </label>
              <select
                value={selectedBuyerId}
                onChange={(e) => setSelectedBuyerId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none mb-3"
              >
                {parties.map((party) => (
                  <option key={party.id} value={party.id}>
                    {party.name} ({party.state})
                  </option>
                ))}
              </select>

              {currentBuyer && (
                <div className="text-xs space-y-1 text-slate-600 bg-white p-3 rounded-lg border border-slate-200/60">
                  <p className="font-bold text-slate-900 uppercase">{currentBuyer.name}</p>
                  <p>{currentBuyer.address}</p>
                  <p><span className="font-semibold text-slate-700">GSTIN:</span> {currentBuyer.gstin || '—'}</p>
                  <p><span className="font-semibold text-slate-700">State:</span> {currentBuyer.state} ({currentBuyer.stateCode || '07'})</p>
                </div>
              )}
            </div>

            {/* Consignee (Ship to) */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Consignee (Ship to)
                </label>
                <label className="flex items-center gap-1.5 text-xs text-blue-600 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSameAsBuyer}
                    onChange={(e) => setIsSameAsBuyer(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>Same as Buyer</span>
                </label>
              </div>

              {!isSameAsBuyer ? (
                <>
                  <select
                    value={selectedConsigneeId}
                    onChange={(e) => setSelectedConsigneeId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none mb-3"
                  >
                    {parties.map((party) => (
                      <option key={party.id} value={party.id}>
                        {party.name} ({party.state})
                      </option>
                    ))}
                  </select>

                  {currentConsignee && (
                    <div className="text-xs space-y-1 text-slate-600 bg-white p-3 rounded-lg border border-slate-200/60">
                      <p className="font-bold text-slate-900 uppercase">{currentConsignee.name}</p>
                      <p>{currentConsignee.address}</p>
                      <p><span className="font-semibold text-slate-700">GSTIN:</span> {currentConsignee.gstin || '—'}</p>
                      <p><span className="font-semibold text-slate-700">State:</span> {currentConsignee.state}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-xs text-slate-500 italic p-4 bg-white/60 rounded-lg border border-dashed border-slate-300 text-center">
                  Shipping details match Buyer (Bill to) address automatically.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card 3: Items & Goods Table */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              <span>Goods & Description of Items</span>
            </h2>

            <button
              onClick={addRow}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg border border-blue-200 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Item Row</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                  <th className="p-3 w-8">#</th>
                  <th className="p-3">Item Description</th>
                  <th className="p-3 w-28">HSN/SAC</th>
                  <th className="p-3 w-28 text-right">Quantity</th>
                  <th className="p-3 w-24">Unit</th>
                  <th className="p-3 w-28 text-right">Rate (₹)</th>
                  <th className="p-3 w-20 text-center">GST %</th>
                  <th className="p-3 w-32 text-right">Amount (₹)</th>
                  <th className="p-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {items.map((row, idx) => (
                  <tr key={row.id || idx} className="hover:bg-slate-50/60">
                    <td className="p-3 text-slate-400 font-bold">{idx + 1}</td>
                    <td className="p-3">
                      <div className="space-y-1">
                        <select
                          value={row.itemId || ''}
                          onChange={(e) => handleSelectMasterItem(idx, e.target.value)}
                          className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded text-slate-700"
                        >
                          <option value="">-- Pick from Item Master --</option>
                          {masterItems.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name} (HSN: {m.hsn})
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={row.description}
                          onChange={(e) => handleItemRowChange(idx, 'description', e.target.value.toUpperCase())}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-sm font-semibold uppercase text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="UNCOATED CALCIUM CARBONATE"
                          required
                        />
                      </div>
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={row.hsn}
                        onChange={(e) => handleItemRowChange(idx, 'hsn', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-sm text-center text-slate-800"
                        placeholder="28365000"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        step="any"
                        value={row.quantity}
                        onChange={(e) => handleItemRowChange(idx, 'quantity', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-sm text-right font-medium text-slate-800"
                        placeholder="2500"
                        required
                      />
                    </td>
                    <td className="p-3">
                      <select
                        value={row.unit}
                        onChange={(e) => handleItemRowChange(idx, 'unit', e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-sm uppercase text-slate-800"
                      >
                        <option value="KGS">KGS</option>
                        <option value="MT">MT</option>
                        <option value="BAGS">BAGS</option>
                        <option value="PCS">PCS</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        step="any"
                        value={row.rate}
                        onChange={(e) => handleItemRowChange(idx, 'rate', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-sm text-right font-medium text-slate-800"
                        placeholder="16.50"
                        required
                      />
                    </td>
                    <td className="p-3">
                      <select
                        value={row.gstRate}
                        onChange={(e) => handleItemRowChange(idx, 'gstRate', Number(e.target.value))}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-sm text-center text-slate-800"
                      >
                        <option value={18}>18%</option>
                        <option value={5}>5%</option>
                        <option value={12}>12%</option>
                        <option value={28}>28%</option>
                        <option value={0}>0%</option>
                      </select>
                    </td>
                    <td className="p-3 text-right font-bold text-slate-900">
                      ₹{row.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => removeRow(idx)}
                        className="p-1 text-slate-400 hover:text-red-500 rounded transition"
                        title="Remove Row"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Card 4: Summary & Tax Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tax Mode</h3>
              <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                  <input
                    type="radio"
                    name="taxMode"
                    checked={!isInterState}
                    onChange={() => setIsInterState(false)}
                    className="text-blue-600"
                  />
                  <span>Intra-State (CGST 9% + SGST 9%) - Delhi</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                  <input
                    type="radio"
                    name="taxMode"
                    checked={isInterState}
                    onChange={() => setIsInterState(true)}
                    className="text-blue-600"
                  />
                  <span>Inter-State (IGST 18%)</span>
                </label>
              </div>

              <div className="mt-4 p-4 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-slate-600 space-y-1">
                <p><span className="font-bold text-slate-800">Amount in Words:</span> {amountInWords}</p>
                <p><span className="font-bold text-slate-800">Tax in Words:</span> {taxInWords}</p>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-3 text-sm bg-slate-50 p-5 rounded-xl border border-slate-200">
              <div className="flex justify-between text-slate-600">
                <span>Taxable Amount (Subtotal):</span>
                <span className="font-semibold text-slate-800">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>

              {!isInterState ? (
                <>
                  <div className="flex justify-between text-slate-600">
                    <span>OUTPUT @ CGST ({halfGstRate}%):</span>
                    <span className="font-semibold text-slate-800">₹{cgstTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>OUTPUT @ SGST ({halfGstRate}%):</span>
                    <span className="font-semibold text-slate-800">₹{sgstTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-slate-600">
                  <span>OUTPUT @ IGST ({primaryGstRate}%):</span>
                  <span className="font-semibold text-slate-800">₹{igstTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              )}

              <div className="border-t border-slate-200 pt-3 flex justify-between text-base font-extrabold text-slate-900">
                <span>Grand Total (Amount Chargeable):</span>
                <span className="text-blue-600">₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => {
              setEditingInvoice(null);
              setActiveView('dashboard');
            }}
            className="px-6 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl transition"
          >
            Cancel
          </button>
          <button
            onClick={() => handleSave('Final')}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold rounded-xl transition"
          >
            Save Invoice
          </button>
          <button
            onClick={() => handleSave('Final', true)}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition"
          >
            <Printer className="w-4 h-4" />
            <span>Save & Print Invoice</span>
          </button>
        </div>
      </div>
    </div>
  );
};
