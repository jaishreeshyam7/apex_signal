import React, { useState } from 'react';
import type { Invoice, CompanyDetails } from '../../types/billing';
import { Printer, X, Files } from 'lucide-react';

interface InvoicePrintViewProps {
  invoice: Invoice;
  companyDetails: CompanyDetails;
  onClose: () => void;
}

type PrintMode =
  | 'BOTH'
  | 'ORIGINAL FOR RECIPIENT'
  | 'COPY FOR YASH POLYMERS'
  | 'DUPLICATE FOR TRANSPORTER';

export const InvoicePrintView: React.FC<InvoicePrintViewProps> = ({
  invoice,
  companyDetails,
  onClose,
}) => {
  const [printMode, setPrintMode] = useState<PrintMode>('BOTH');

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (num: number) => {
    return (num || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const totalQuantity = invoice.items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

  // Sub-component for rendering a single invoice sheet
  const renderInvoiceSheet = (copyLabel: string, isLast = false) => {
    return (
      <div
        className={`bg-white text-black p-6 sm:p-8 w-full max-w-[800px] border border-black text-[12px] leading-tight font-sans shadow-lg print:border-none print:shadow-none print:m-0 print:p-0 print:max-w-none print:w-full invoice-print-sheet ${
          !isLast ? 'print:break-after-page mb-8 print:mb-0' : ''
        }`}
      >
        {/* Main Header */}
        <div className="text-center border-b border-black pb-1 mb-0">
          <h1 className="text-base font-extrabold uppercase tracking-wide">TAX INVOICE</h1>
          <p className="text-[10px] font-bold text-slate-800 tracking-wider">({copyLabel})</p>
        </div>

        {/* Seller & Buyer 2-Column Section */}
        <div className="grid grid-cols-2 border-b border-black">
          {/* Left Column: Seller */}
          <div className="border-r border-black p-2 flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase">{companyDetails.name}</h2>
              <p className="text-[11px] mt-0.5">{companyDetails.address}</p>
              <p className="text-[11px]">{companyDetails.city} {companyDetails.pincode}</p>
              <p className="text-[11px] mt-1"><span className="font-semibold">GSTIN/UIN:</span> {companyDetails.gstin}</p>
              <p className="text-[11px]"><span className="font-semibold">State Name:</span> {companyDetails.state}</p>
              <p className="text-[11px]"><span className="font-semibold">E-Mail:</span> {companyDetails.email}</p>
            </div>
          </div>

          {/* Right Column: Consignee & Buyer */}
          <div className="divide-y divide-black">
            {/* Consignee */}
            <div className="p-2">
              <span className="text-[10px] text-slate-600 font-semibold block uppercase">Consignee (Ship to)</span>
              <p className="font-bold text-[11px] uppercase">{invoice.consignee?.name || invoice.buyer?.name}</p>
              <p className="text-[11px]">{invoice.consignee?.address || invoice.buyer?.address}</p>
              <p className="text-[11px]"><span className="font-semibold">GSTIN/UIN:</span> {invoice.consignee?.gstin || invoice.buyer?.gstin || '—'}</p>
              <p className="text-[11px]"><span className="font-semibold">State Name:</span> {invoice.consignee?.state || invoice.buyer?.state || 'Delhi'}</p>
            </div>

            {/* Buyer */}
            <div className="p-2">
              <span className="text-[10px] text-slate-600 font-semibold block uppercase">Buyer (Bill to)</span>
              <p className="font-bold text-[11px] uppercase">{invoice.buyer?.name}</p>
              <p className="text-[11px]">{invoice.buyer?.address}</p>
              <p className="text-[11px]"><span className="font-semibold">GSTIN/UIN:</span> {invoice.buyer?.gstin || '—'}</p>
              <p className="text-[11px]"><span className="font-semibold">State Name:</span> {invoice.buyer?.state || 'Delhi'}</p>
            </div>
          </div>
        </div>

        {/* Transport & Metadata Grid */}
        <div className="grid grid-cols-4 border-b border-black text-[11px]">
          <div className="border-r border-b border-black p-1.5">
            <span className="text-[9px] text-slate-500 block font-medium">Invoice No.</span>
            <span className="font-bold">{invoice.invoiceNo}</span>
          </div>
          <div className="border-r border-b border-black p-1.5">
            <span className="text-[9px] text-slate-500 block font-medium">e-Way Bill No.</span>
            <span>{invoice.eWayBillNo || '-'}</span>
          </div>
          <div className="border-r border-b border-black p-1.5">
            <span className="text-[9px] text-slate-500 block font-medium">Dated</span>
            <span className="font-semibold">{invoice.date}</span>
          </div>
          <div className="border-b border-black p-1.5">
            <span className="text-[9px] text-slate-500 block font-medium">Delivery Note</span>
            <span>{invoice.deliveryNote || '-'}</span>
          </div>

          <div className="border-r border-b border-black p-1.5">
            <span className="text-[9px] text-slate-500 block font-medium">Mode/Terms of Payment</span>
            <span>{invoice.paymentTerms || '15 Days'}</span>
          </div>
          <div className="border-r border-b border-black p-1.5">
            <span className="text-[9px] text-slate-500 block font-medium">Other References</span>
            <span>{invoice.otherReferences || '-'}</span>
          </div>
          <div className="border-r border-b border-black p-1.5">
            <span className="text-[9px] text-slate-500 block font-medium">Buyer's Order No.</span>
            <span>{invoice.buyerOrderNo || '-'}</span>
          </div>
          <div className="border-b border-black p-1.5">
            <span className="text-[9px] text-slate-500 block font-medium">Dated</span>
            <span>{invoice.buyerOrderDate || '-'}</span>
          </div>

          <div className="border-r border-b border-black p-1.5">
            <span className="text-[9px] text-slate-500 block font-medium">Dispatch Doc No.</span>
            <span>{invoice.dispatchDocNo || '-'}</span>
          </div>
          <div className="border-r border-b border-black p-1.5">
            <span className="text-[9px] text-slate-500 block font-medium">Delivery Note Date</span>
            <span>{invoice.deliveryNoteDate || '-'}</span>
          </div>
          <div className="border-r border-b border-black p-1.5">
            <span className="text-[9px] text-slate-500 block font-medium">Dispatched through</span>
            <span>{invoice.dispatchedThrough || '-'}</span>
          </div>
          <div className="border-b border-black p-1.5">
            <span className="text-[9px] text-slate-500 block font-medium">Destination</span>
            <span>{invoice.destination || 'DELHI'}</span>
          </div>

          <div className="border-r border-black p-1.5 col-span-2">
            <span className="text-[9px] text-slate-500 block font-medium">Bill of Lading/LR-RR No.</span>
            <span>{invoice.billOfLadingNo || '-'}</span>
          </div>
          <div className="border-r border-black p-1.5">
            <span className="text-[9px] text-slate-500 block font-medium">Motor Vehicle No.</span>
            <span className="font-bold">{invoice.motorVehicleNo || 'DL01LAD1631'}</span>
          </div>
          <div className="p-1.5">
            <span className="text-[9px] text-slate-500 block font-medium">Terms of Delivery</span>
            <span>{invoice.termsOfDelivery || '-'}</span>
          </div>
        </div>

        {/* Goods Items Table */}
        <table className="w-full border-b border-black text-[11px] border-collapse">
          <thead>
            <tr className="border-b border-black font-bold text-center bg-slate-50">
              <th className="border-r border-black p-1 w-8">Sl No.</th>
              <th className="border-r border-black p-1 text-left">Description of Goods</th>
              <th className="border-r border-black p-1 w-20">HSN/SAC</th>
              <th className="border-r border-black p-1 w-14">GST Rate</th>
              <th className="border-r border-black p-1 w-24 text-right">Quantity</th>
              <th className="border-r border-black p-1 w-16 text-right">Rate</th>
              <th className="border-r border-black p-1 w-12">Per</th>
              <th className="p-1 w-24 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-transparent">
            {invoice.items.map((item, idx) => (
              <React.Fragment key={item.id || idx}>
                <tr className="align-top">
                  <td className="border-r border-black p-1 text-center font-medium">{idx + 1}</td>
                  <td className="border-r border-black p-1 font-bold uppercase">{item.description}</td>
                  <td className="border-r border-black p-1 text-center">{item.hsn}</td>
                  <td className="border-r border-black p-1 text-center">{item.gstRate}%</td>
                  <td className="border-r border-black p-1 text-right font-medium">{formatCurrency(item.quantity)} {item.unit}</td>
                  <td className="border-r border-black p-1 text-right">{formatCurrency(item.rate)}</td>
                  <td className="border-r border-black p-1 text-center uppercase">{item.unit}</td>
                  <td className="p-1 text-right font-semibold">{formatCurrency(item.amount)}</td>
                </tr>
              </React.Fragment>
            ))}

            {/* Tax Output Breakdown Rows */}
            {!invoice.isInterState ? (
              <>
                <tr className="text-[11px]">
                  <td className="border-r border-black p-1"></td>
                  <td className="border-r border-black p-1 font-medium italic">OUTPUT @ CGST ({invoice.cgstRate}%)</td>
                  <td className="border-r border-black p-1"></td>
                  <td className="border-r border-black p-1"></td>
                  <td className="border-r border-black p-1"></td>
                  <td className="border-r border-black p-1"></td>
                  <td className="border-r border-black p-1"></td>
                  <td className="p-1 text-right font-medium">{formatCurrency(invoice.cgstTotal)}</td>
                </tr>
                <tr className="text-[11px]">
                  <td className="border-r border-black p-1"></td>
                  <td className="border-r border-black p-1 font-medium italic">OUTPUT @ SGST ({invoice.sgstRate}%)</td>
                  <td className="border-r border-black p-1"></td>
                  <td className="border-r border-black p-1"></td>
                  <td className="border-r border-black p-1"></td>
                  <td className="border-r border-black p-1"></td>
                  <td className="border-r border-black p-1"></td>
                  <td className="p-1 text-right font-medium">{formatCurrency(invoice.sgstTotal)}</td>
                </tr>
              </>
            ) : (
              <tr className="text-[11px]">
                <td className="border-r border-black p-1"></td>
                <td className="border-r border-black p-1 font-medium italic">OUTPUT @ IGST ({invoice.igstRate}%)</td>
                <td className="border-r border-black p-1"></td>
                <td className="border-r border-black p-1"></td>
                <td className="border-r border-black p-1"></td>
                <td className="border-r border-black p-1"></td>
                <td className="border-r border-black p-1"></td>
                <td className="p-1 text-right font-medium">{formatCurrency(invoice.igstTotal)}</td>
              </tr>
            )}

            {/* Blank spacer rows to match standard printed invoice height */}
            {[...Array(Math.max(0, 4 - invoice.items.length))].map((_, i) => (
              <tr key={`blank-${i}`} className="h-4">
                <td className="border-r border-black p-1"></td>
                <td className="border-r border-black p-1"></td>
                <td className="border-r border-black p-1"></td>
                <td className="border-r border-black p-1"></td>
                <td className="border-r border-black p-1"></td>
                <td className="border-r border-black p-1"></td>
                <td className="border-r border-black p-1"></td>
                <td className="p-1"></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-black font-bold bg-slate-50">
              <td colSpan={4} className="border-r border-black p-1.5 text-right uppercase">Total</td>
              <td className="border-r border-black p-1.5 text-right">{formatCurrency(totalQuantity)} KGS</td>
              <td colSpan={2} className="border-r border-black p-1.5"></td>
              <td className="p-1.5 text-right text-sm font-extrabold">{formatCurrency(invoice.grandTotal)}</td>
            </tr>
          </tfoot>
        </table>

        {/* Amount in words */}
        <div className="border-b border-black p-1.5 flex justify-between items-center text-[11px]">
          <div>
            <span className="font-semibold">Amount Chargeable (in words): </span>
            <span className="font-bold">{invoice.amountInWords}</span>
          </div>
          <span className="font-semibold text-slate-500 italic">E. & O.E</span>
        </div>

        {/* HSN/SAC Tax Summary Table */}
        <div className="border-b border-black text-[10px]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-black bg-slate-50 font-bold text-center">
                <th rowSpan={2} className="border-r border-black p-1">HSN/SAC</th>
                <th rowSpan={2} className="border-r border-black p-1">Taxable Value</th>
                {!invoice.isInterState ? (
                  <>
                    <th colSpan={2} className="border-r border-black p-1">CGST</th>
                    <th colSpan={2} className="border-r border-black p-1">SGST</th>
                  </>
                ) : (
                  <th colSpan={2} className="border-r border-black p-1">IGST</th>
                )}
                <th rowSpan={2} className="p-1">Total Tax Amount</th>
              </tr>
              <tr className="border-b border-black bg-slate-50 font-semibold text-center">
                {!invoice.isInterState ? (
                  <>
                    <th className="border-r border-black p-0.5 w-12">Rate</th>
                    <th className="border-r border-black p-0.5 w-18">Amount</th>
                    <th className="border-r border-black p-0.5 w-12">Rate</th>
                    <th className="border-r border-black p-0.5 w-18">Amount</th>
                  </>
                ) : (
                  <>
                    <th className="border-r border-black p-0.5 w-12">Rate</th>
                    <th className="border-r border-black p-0.5 w-20">Amount</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border-r border-black p-1 text-center font-medium">{invoice.items[0]?.hsn || '28365000'}</td>
                <td className="border-r border-black p-1 text-right font-medium">{formatCurrency(invoice.subtotal)}</td>
                {!invoice.isInterState ? (
                  <>
                    <td className="border-r border-black p-1 text-center">{invoice.cgstRate}%</td>
                    <td className="border-r border-black p-1 text-right">{formatCurrency(invoice.cgstTotal)}</td>
                    <td className="border-r border-black p-1 text-center">{invoice.sgstRate}%</td>
                    <td className="border-r border-black p-1 text-right">{formatCurrency(invoice.sgstTotal)}</td>
                  </>
                ) : (
                  <>
                    <td className="border-r border-black p-1 text-center">{invoice.igstRate}%</td>
                    <td className="border-r border-black p-1 text-right">{formatCurrency(invoice.igstTotal)}</td>
                  </>
                )}
                <td className="p-1 text-right font-bold">{formatCurrency(invoice.totalTax)}</td>
              </tr>
              <tr className="border-t border-black font-bold bg-slate-50">
                <td className="border-r border-black p-1 text-center">Total</td>
                <td className="border-r border-black p-1 text-right">{formatCurrency(invoice.subtotal)}</td>
                {!invoice.isInterState ? (
                  <>
                    <td className="border-r border-black p-1"></td>
                    <td className="border-r border-black p-1 text-right">{formatCurrency(invoice.cgstTotal)}</td>
                    <td className="border-r border-black p-1"></td>
                    <td className="border-r border-black p-1 text-right">{formatCurrency(invoice.sgstTotal)}</td>
                  </>
                ) : (
                  <>
                    <td className="border-r border-black p-1"></td>
                    <td className="border-r border-black p-1 text-right">{formatCurrency(invoice.igstTotal)}</td>
                  </>
                )}
                <td className="p-1 text-right">{formatCurrency(invoice.totalTax)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tax in words & PAN */}
        <div className="border-b border-black p-1.5 text-[11px] flex justify-between">
          <div>
            <span className="font-semibold">Tax Amount (in words): </span>
            <span className="font-bold">{invoice.taxInWords}</span>
          </div>
        </div>
        <div className="border-b border-black p-1.5 text-[11px]">
          <span className="font-semibold">Company's PAN: </span>
          <span className="font-bold">{companyDetails.pan || 'AJEPG9306L'}</span>
        </div>

        {/* Declarations & Bank Details 2-Column Section */}
        <div className="grid grid-cols-2 border-b border-black text-[10px]">
          {/* Left: Declaration */}
          <div className="border-r border-black p-2 flex flex-col justify-between">
            <div>
              <span className="font-bold underline block mb-1">Declaration</span>
              <ol className="list-decimal pl-3.5 space-y-0.5 text-slate-700">
                <li>Goods once sold shall not be taken back.</li>
                <li>Payment shall be made within 15 Days from the bill date.</li>
                <li>Late payment shall attract interest @ 18% P.A.</li>
                <li>Goods delivered in good condition & full satisfaction.</li>
              </ol>
            </div>
          </div>

          {/* Right: Bank Details */}
          <div className="p-2 flex flex-col justify-between">
            <div>
              <span className="font-bold underline block mb-1">Company's Bank Details</span>
              <p><span className="font-semibold">A/c Holder's Name:</span> {companyDetails.bankDetails.accountHolder}</p>
              <p><span className="font-semibold">Bank Name:</span> {companyDetails.bankDetails.bankName}</p>
              <p><span className="font-semibold">A/c No.:</span> {companyDetails.bankDetails.accountNumber}</p>
              <p><span className="font-semibold">Branch & IFS Code:</span> {companyDetails.bankDetails.branchAndIfsc}</p>
            </div>
            <div className="text-right pt-4">
              <p className="font-bold text-[11px]">for {companyDetails.name}</p>
            </div>
          </div>
        </div>

        {/* Jurisdiction & Signatory Footer */}
        <div className="pt-2 text-[10px] flex flex-col justify-between">
          <p className="text-center font-bold tracking-wider mb-6">SUBJECT TO DELHI, INDIA JURISDICTION</p>
          <div className="flex justify-between items-end">
            <span className="italic text-slate-500">This is a Computer Generated Invoice</span>
            <span className="font-bold text-center border-t border-black pt-1 px-4">Authorised Signatory</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Container */}
      <div className="bg-slate-100 rounded-2xl shadow-2xl max-w-4xl w-full my-auto overflow-hidden flex flex-col max-h-[96vh]">
        {/* Modal Top Bar (Screen Only) */}
        <div className="bg-[#0a152e] text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3 no-print shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-bold text-lg">Invoice #{invoice.invoiceNo}</span>
            <div className="flex bg-slate-800 p-1 rounded-xl text-xs font-semibold gap-1">
              <button
                onClick={() => setPrintMode('BOTH')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                  printMode === 'BOTH' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Files className="w-3.5 h-3.5" />
                <span>Both (Original + Yash Polymers Copy)</span>
              </button>

              <button
                onClick={() => setPrintMode('ORIGINAL FOR RECIPIENT')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  printMode === 'ORIGINAL FOR RECIPIENT' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Original Only
              </button>

              <button
                onClick={() => setPrintMode('COPY FOR YASH POLYMERS')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  printMode === 'COPY FOR YASH POLYMERS' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Yash Polymers Copy
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-md transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div className="p-4 sm:p-8 overflow-y-auto bg-slate-200/60 flex-1 flex flex-col items-center">
          {printMode === 'BOTH' ? (
            <>
              {renderInvoiceSheet('ORIGINAL FOR RECIPIENT', false)}
              {renderInvoiceSheet('COPY FOR YASH POLYMERS', true)}
            </>
          ) : (
            renderInvoiceSheet(printMode, true)
          )}
        </div>
      </div>
    </div>
  );
};
