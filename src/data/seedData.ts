import type { CompanyDetails, Party, Item, Invoice } from '../types/billing';

export const initialCompanyDetails: CompanyDetails = {
  name: 'Yash Polymers',
  gstin: '',
  pan: '',
  address: '',
  city: '',
  state: 'Delhi',
  stateCode: '07',
  pincode: '',
  phone: '',
  email: '',
  bankDetails: {
    accountHolder: '',
    bankName: '',
    accountNumber: '',
    branchAndIfsc: '',
  },
  termsAndConditions: [
    'Goods once sold shall not be taken back.',
    'Payment shall be made within 15 Days from the bill date.',
    'Late payment shall attract interest @ 18% P.A.',
    'Goods delivered in good condition & full satisfaction.',
  ],
};

// Clean empty arrays so you can add your own data fresh
export const initialParties: Party[] = [];
export const initialItems: Item[] = [];
export const initialInvoices: Invoice[] = [];
