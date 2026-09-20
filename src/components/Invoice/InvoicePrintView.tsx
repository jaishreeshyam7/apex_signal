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
  const renderInvoiceSheet = (copyLabel: string) => {
    return (
      <div className="invoice-print-sheet bg-white text-black text-[11px] leading-[1.3] font-sans">
        {/* Title Header */}
        <div className="text-center border-b border-black py-1">
          <h1 className="text-sm font-extrabold tracking-wide uppercase">Tax Invoice</h1>
          <p className="text-[10px] font-bold text-slate-800 tracking-wider">({copyLabel})</p>
        </div>

        {/* 2-Column Seller & Buyer Section */}
        <div className="grid grid-cols-2 border-b border-black">
          {/* Seller / Supplier */}
          <div className="border-r border-black p-2 flex flex-col justify-between">
            <div>
              <h2 className="text-[12px] font-bold uppercase">{companyDetails.name || 'YASH POLYMERS'}</h2>
              <p className="text-[10.5px] mt-0.5">{companyDetails.address || 'PKT- E, SEC-4, BAWANA INDUSTRIAL AREA, BAWANA'}</p>
              <p className="text-[10.5px]">{companyDetails.city || 'Delhi, India'} {companyDetails.pincode || '110039'}</p>
              <p className="text-[10.5px] mt-1"><span className="font-semibold">GSTIN/UIN:</span> {companyDetails.gstin || '07AJEPG9306L1Z2'}</p>
              <p className="text-[10.5px]"><span className="font-semibold">State Name:</span> {companyDetails.state || 'Delhi'}, Code : {companyDetails.stateCode || '07'}</p>
              <p className="text-[10.5px]"><span className="font-semibold">E-Mail:</span> {companyDetails.email || 'gargvikas144@gmail.com'}</p>
            </div>
          </div>

          {/* Consignee & Buyer */}
          <div className="divide-y divide-black">
            {/* Consignee */}
            <div className="p-2">
              <span className="text-[9.5px] text-slate-600 font-semibold block uppercase">Consignee (Ship to)</span>
              <p className="font-bold text-[11px] uppercase">{invoice.consignee?.name || invoice.buyer?.name || 'CASH SALE'}</p>
              <p className="text-[10.5px]">{invoice.consignee?.address || invoice.buyer?.address || '—'}</p>
              <p className="text-[10.5px]"><span className="font-semibold">GSTIN/UIN:</span> {invoice.consignee?.gstin || invoice.buyer?.gstin || '—'}</p>
              <p className="text-[10.5px]"><span className="font-semibold">State Name:</span> {invoice.consignee?.state || invoice.buyer?.state || 'Delhi'}, Code : {invoice.consignee?.stateCode || invoice.buyer?.stateCode || '07'}</p>
            </div>

            {/* Buyer */}
            <div className="p-2">
              <span className="text-[9.5px] text-slate-600 font-semibold block uppercase">Buyer (Bill to)</span>
              <p className="font-bold text-[11px] uppercase">{invoice.buyer?.name || 'CASH SALE'}</p>
              <p className="text-[10.5px]">{invoice.buyer?.address || '—'}</p>
              <p className="text-[10.5px]"><span className="font-semibold">GSTIN/UIN:</span> {invoice.buyer?.gstin || '—'}</p>
              <p className="text-[10.5px]"><span className="font-semibold">State Name:</span> {invoice.buyer?.state || 'Delhi'}, Code : {invoice.buyer?.stateCode || '07'}</p>
            </div>
          </div>
        </div>

        {/* Transport & Metadata 4-Column Grid */}
        <div className="grid grid-cols-4 border-b border-black text-[10.5px]">
          <div className="border-r border-b border-black p-1.5">
            <span className="text-[8.5px] text-slate-600 block">Invoice No.</span>
            <span className="font-bold text-[11px]">{invoice.invoiceNo}</span>
          </div>
          <div className="border-r border-b border-black p-1.5">
            <span className="text-[8.5px] text-slate-600 block">e-Way Bill No.</span>
            <span>{invoice.eWayBillNo || '—'}</span>
          </div>
          <div className="border-r border-b border-black p-1.5">
            <span className="text-[8.5px] text-slate-600 block">Dated</span>
            <span className="font-semibold">{invoice.date}</span>
          </div>
          <div className="border-b border-black p-1.5">
            <span className="text-[8.5px] text-slate-600 block">Delivery Note</span>
            <span>{invoice.deliveryNote || '—'}</span>
          </div>

          <div className="border-r border-b border-black p-1.5">
            <span className="text-[8.5px] text-slate-600 block">Mode/Terms of Payment</span>
            <span>{invoice.paymentTerms || '15 Days'}</span>
          </div>
          <div className="border-r border-b border-black p-1.5">
            <span className="text-[8.5px] text-slate-600 block">Other References</span>
            <span>{invoice.otherReferences || '—'}</span>
          </div>
          <div className="border-r border-b border-black p-1.5">
            <span className="text-[8.5px] text-slate-600 block">Buyer's Order No.</span>
            <span>{invoice.buyerOrderNo || '—'}</span>
          </div>
          <div className="border-b border-black p-1.5">
            <span className="text-[8.5px] text-slate-600 block">Dated</span>
            <span>{invoice.buyerOrderDate || '—'}</span>
          </div>

          <div className="border-r border-b border-black p-1.5">
            <span className="text-[8.5px] text-slate-600 block">Dispatch Doc No.</span>
            <span>{invoice.dispatchDocNo || '—'}</span>
          </div>
          <div className="border-r border-b border-black p-1.5">
            <span className="text-[8.5px] text-slate-600 block">Delivery Note Date</span>
            <span>{invoice.deliveryNoteDate || '—'}</span>
          </div>
          <div className="border-r border-b border-black p-1.5">
            <span className="text-[8.5px] text-slate-600 block">Dispatched through</span>
            <span>{invoice.dispatchedThrough || '—'}</span>
          </div>
          <div className="border-b border-black p-1.5">
            <span className="text-[8.5px] text-slate-600 block">Destination</span>
            <span>{invoice.destination || 'DELHI'}</span>
          </div>

          <div className="border-r border-black p-1.5 col-span-2">
            <span className="text-[8.5px] text-slate-600 block">Bill of Lading/LR-RR No.</span>
            <span>{invoice.billOfLadingNo || '—'}</span>
          </div>
          <div className="border-r border-black p-1.5">
            <span className="text-[8.5px] text-slate-600 block">Motor Vehicle No.</span>
            <span className="font-bold">{invoice.motorVehicleNo || '—'}</span>
          </div>
          <div className="p-1.5">
            <span className="text-[8.5px] text-slate-600 block">Terms of Delivery</span>
            <span>{invoice.termsOfDelivery || '—'}</span>
          </div>
        </div>

        {/* Goods Items Table (Continuous Structured Grid) */}
        <table className="w-full border-b border-black text-[10.5px] border-collapse">
          <thead>
            <tr className="border-b border-black font-bold text-center bg-slate-50">
              <th className="border-r border-black p-1.5 w-9">Sl No.</th>
              <th className="border-r border-black p-1.5 text-left">Description of Goods</th>
              <th className="border-r border-black p-1.5 w-20">HSN/SAC</th>
              <th className="border-r border-black p-1.5 w-14">GST Rate</th>
              <th className="border-r border-black p-1.5 w-24 text-right">Quantity</th>
              <th className="border-r border-black p-1.5 w-16 text-right">Rate</th>
              <th className="border-r border-black p-1.5 w-12 text-center">Per</th>
              <th className="p-1.5 w-24 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, idx) => (
              <tr key={item.id || idx} className="align-top">
                <td className="border-r border-black p-1.5 text-center font-medium">{idx + 1}</td>
                <td className="border-r border-black p-1.5 font-bold uppercase">{item.description}</td>
                <td className="border-r border-black p-1.5 text-center">{item.hsn}</td>
                <td className="border-r border-black p-1.5 text-center">{item.gstRate}%</td>
                <td className="border-r border-black p-1.5 text-right font-medium">{formatCurrency(item.quantity)} {item.unit}</td>
                <td className="border-r border-black p-1.5 text-right">{formatCurrency(item.rate)}</td>
                <td className="border-r border-black p-1.5 text-center uppercase">{item.unit}</td>
                <td className="p-1.5 text-right font-semibold">{formatCurrency(item.amount)}</td>
              </tr>
            ))}

            {/* Output Tax Breakdown Rows */}
            {!invoice.isInterState ? (
              <>
                <tr>
                  <td className="border-r border-black p-1.5"></td>
                  <td className="border-r border-black p-1.5 font-medium italic">OUTPUT @ CGST ({invoice.cgstRate}%)</td>
                  <td className="border-r border-black p-1.5"></td>
                  <td className="border-r border-black p-1.5"></td>
                  <td className="border-r border-black p-1.5"></td>
                  <td className="border-r border-black p-1.5"></td>
                  <td className="border-r border-black p-1.5"></td>
                  <td className="p-1.5 text-right font-medium">{formatCurrency(invoice.cgstTotal)}</td>
                </tr>
                <tr>
                  <td className="border-r border-black p-1.5"></td>
                  <td className="border-r border-black p-1.5 font-medium italic">OUTPUT @ SGST ({invoice.sgstRate}%)</td>
                  <td className="border-r border-black p-1.5"></td>
                  <td className="border-r border-black p-1.5"></td>
                  <td className="border-r border-black p-1.5"></td>
                  <td className="border-r border-black p-1.5"></td>
                  <td className="border-r border-black p-1.5"></td>
                  <td className="p-1.5 text-right font-medium">{formatCurrency(invoice.sgstTotal)}</td>
                </tr>
              </>
            ) : (
              <tr>
                <td className="border-r border-black p-1.5"></td>
                <td className="border-r border-black p-1.5 font-medium italic">OUTPUT @ IGST ({invoice.igstRate}%)</td>
                <td className="border-r border-black p-1.5"></td>
                <td className="border-r border-black p-1.5"></td>
                <td className="border-r border-black p-1.5"></td>
                <td className="border-r border-black p-1.5"></td>
                <td className="border-r border-black p-1.5"></td>
                <td className="p-1.5 text-right font-medium">{formatCurrency(invoice.igstTotal)}</td>
              </tr>
            )}

            {/* Structured Table Spacer Rows */}
            {[...Array(Math.max(1, 3 - invoice.items.length))].map((_, i) => (
              <tr key={`spacer-${i}`} className="h-6">
                <td className="border-r border-black p-1.5"></td>
                <td className="border-r border-black p-1.5"></td>
                <td className="border-r border-black p-1.5"></td>
                <td className="border-r border-black p-1.5"></td>
                <td className="border-r border-black p-1.5"></td>
                <td className="border-r border-black p-1.5"></td>
                <td className="border-r border-black p-1.5"></td>
                <td className="p-1.5"></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-black font-bold bg-slate-50">
              <td colSpan={4} className="border-r border-black p-1.5 text-right uppercase">Total</td>
              <td className="border-r border-black p-1.5 text-right">{formatCurrency(totalQuantity)} KGS</td>
              <td colSpan={2} className="border-r border-black p-1.5"></td>
              <td className="p-1.5 text-right text-xs font-extrabold">{formatCurrency(invoice.grandTotal)}</td>
            </tr>
          </tfoot>
        </table>

        {/* Amount Chargeable (in words) */}
        <div className="border-b border-black p-1.5 flex justify-between items-center text-[10.5px]">
          <div>
            <span className="font-semibold">Amount Chargeable (in words): </span>
            <span className="font-bold">{invoice.amountInWords}</span>
          </div>
          <span className="font-semibold text-slate-500 italic text-[9.5px]">E. & O.E</span>
        </div>

        {/* HSN/SAC Tax Breakdown Table */}
        <div className="border-b border-black text-[10px]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-black bg-slate-50 font-bold text-center">
                <th rowSpan={2} className="border-r border-black p-1">HSN/SAC</th>
                <th rowSpan={2} className="border-r border-black p-1">Taxable Value</th>
                {!invoice.isInterState ? (
                  <>
                    <th colSpan={2} className="border-r border-black p-1">Central Tax (CGST)</th>
                    <th colSpan={2} className="border-r border-black p-1">State Tax (SGST)</th>
                  </>
                ) : (
                  <th colSpan={2} className="border-r border-black p-1">Integrated Tax (IGST)</th>
                )}
                <th rowSpan={2} className="p-1">Total Tax Amount</th>
              </tr>
              <tr className="border-b border-black bg-slate-50 font-semibold text-center">
                {!invoice.isInterState ? (
                  <>
                    <th className="border-r border-black p-0.5 w-12">Rate</th>
                    <th className="border-r border-black p-0.5 w-20">Amount</th>
                    <th className="border-r border-black p-0.5 w-12">Rate</th>
                    <th className="border-r border-black p-0.5 w-20">Amount</th>
                  </>
                ) : (
                  <>
                    <th className="border-r border-black p-0.5 w-14">Rate</th>
                    <th className="border-r border-black p-0.5 w-24">Amount</th>
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
        <div className="border-b border-black p-1.5 text-[10.5px] flex justify-between">
          <div>
            <span className="font-semibold">Tax Amount (in words): </span>
            <span className="font-bold">{invoice.taxInWords}</span>
          </div>
        </div>
        <div className="border-b border-black p-1.5 text-[10.5px]">
          <span className="font-semibold">Company's PAN: </span>
          <span className="font-bold">{companyDetails.pan || '—'}</span>
        </div>

        {/* Declarations & Bank Details 2-Column Section */}
        <div className="grid grid-cols-2 border-b border-black text-[10px]">
          {/* Left: Declaration */}
          <div className="border-r border-black p-2 flex flex-col justify-between">
            <div>
              <span className="font-bold underline block mb-1">Declaration</span>
              <ol className="list-decimal pl-4 space-y-0.5 text-slate-800">
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
              <p><span className="font-semibold">A/c Holder's Name:</span> {companyDetails.bankDetails.accountHolder || companyDetails.name || 'YASH POLYMERS'}</p>
              <p><span className="font-semibold">Bank Name:</span> {companyDetails.bankDetails.bankName || 'STATE BANK OF INDIA'}</p>
              <p><span className="font-semibold">A/c No.:</span> {companyDetails.bankDetails.accountNumber || '44204302050'}</p>
              <p><span className="font-semibold">Branch & IFS Code:</span> {companyDetails.bankDetails.branchAndIfsc || 'INDERLOK & SBIN0006102'}</p>
            </div>
            <div className="text-right pt-2">
              <p className="font-bold text-[10.5px]">for {companyDetails.name || 'YASH POLYMERS'}</p>
            </div>
          </div>
        </div>

        {/* Jurisdiction & Signatory Footer */}
        <div className="p-2 text-[9.5px]">
          <p className="text-center font-bold tracking-wider mb-4">SUBJECT TO DELHI, INDIA JURISDICTION</p>
          <div className="flex justify-between items-end">
            <span className="italic text-slate-500">This is a Computer Generated Invoice</span>
            <span className="font-bold text-center border-t border-black pt-1 px-6">Authorised Signatory</span>
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
          <div id="invoice-printable-area" className="w-full flex flex-col items-center">
            {printMode === 'BOTH' ? (
              <>
                {renderInvoiceSheet('ORIGINAL FOR RECIPIENT')}
                <div className="invoice-page-break my-6 print:my-0"></div>
                {renderInvoiceSheet('COPY FOR YASH POLYMERS')}
              </>
            ) : (
              renderInvoiceSheet(printMode)
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
