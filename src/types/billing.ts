export interface CompanyDetails {
  name: string;
  gstin: string;
  pan: string;
  address: string;
  city: string;
  state: string;
  stateCode: string;
  pincode: string;
  phone: string;
  email: string;
  bankDetails: {
    accountHolder: string;
    bankName: string;
    accountNumber: string;
    branchAndIfsc: string;
  };
  termsAndConditions: string[];
}

export interface Party {
  id: string;
  name: string;
  gstin: string;
  state: string;
  stateCode: string;
  city: string;
  address: string;
  phone?: string;
  email?: string;
}

export interface Item {
  id: string;
  name: string;
  hsn: string;
  unit: string;
  rate: number;
  gstRate: number; // e.g., 18 or 5
  description?: string;
}

export interface InvoiceItem {
  id: string;
  itemId?: string;
  description: string;
  hsn: string;
  gstRate: number;
  quantity: number;
  rate: number;
  unit: string;
  amount: number;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  date: string; // YYYY-MM-DD
  eWayBillNo: string;
  deliveryNote: string;
  paymentTerms: string; // e.g. "15 Days"
  otherReferences: string;
  buyerOrderNo: string;
  buyerOrderDate: string;
  dispatchDocNo: string;
  deliveryNoteDate: string;
  dispatchedThrough: string;
  destination: string;
  billOfLadingNo: string;
  motorVehicleNo: string;
  termsOfDelivery: string;
  
  // Parties
  buyer: Party;
  consignee: Party;
  isSameAsBuyer: boolean;
  
  // Items & Amounts
  items: InvoiceItem[];
  subtotal: number;
  isInterState: boolean;
  cgstRate: number;
  cgstTotal: number;
  sgstRate: number;
  sgstTotal: number;
  igstRate: number;
  igstTotal: number;
  totalTax: number;
  grandTotal: number;
  amountInWords: string;
  taxInWords: string;
  
  status: 'Final' | 'Draft';
  createdAt: string;
}

export interface User {
  email: string;
  name: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  matchedInvoices?: Invoice[];
}
