import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CompanyDetails, Party, Item, Invoice, User } from '../types/billing';
import {
  initialCompanyDetails,
  initialParties,
  initialItems,
  initialInvoices,
} from '../data/seedData';

interface BillingContextType {
  // Auth
  user: User | null;
  login: (email: string) => boolean;
  logout: () => void;

  // Navigation / Active View
  activeView: 'dashboard' | 'new-invoice' | 'invoices' | 'parties' | 'items' | 'settings';
  setActiveView: (view: 'dashboard' | 'new-invoice' | 'invoices' | 'parties' | 'items' | 'settings') => void;

  // Invoices
  invoices: Invoice[];
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (invoice: Invoice) => void;
  deleteInvoice: (id: string) => void;
  getInvoiceById: (id: string) => Invoice | undefined;
  getNextInvoiceNo: () => string;
  selectedInvoiceForPrint: Invoice | null;
  setSelectedInvoiceForPrint: (invoice: Invoice | null) => void;
  editingInvoice: Invoice | null;
  setEditingInvoice: (invoice: Invoice | null) => void;

  // Masters
  parties: Party[];
  addParty: (party: Omit<Party, 'id'>) => Party;
  updateParty: (party: Party) => void;
  deleteParty: (id: string) => void;

  items: Item[];
  addItem: (item: Omit<Item, 'id'>) => Item;
  updateItem: (item: Item) => void;
  deleteItem: (id: string) => void;

  // Settings & Reset
  companyDetails: CompanyDetails;
  updateCompanyDetails: (details: CompanyDetails) => void;
  resetAllData: () => void;
}

const BillingContext = createContext<BillingContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'yp_billing_user_v2',
  INVOICES: 'yp_billing_invoices_v2',
  PARTIES: 'yp_billing_parties_v2',
  ITEMS: 'yp_billing_items_v2',
  SETTINGS: 'yp_billing_settings_v2',
};

export const BillingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // User Auth State
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return { email: 'ygbillion17@gmail.com', name: 'Yash Polymers Admin' };
  });

  // Active View State
  const [activeView, setActiveView] = useState<'dashboard' | 'new-invoice' | 'invoices' | 'parties' | 'items' | 'settings'>('dashboard');

  // Print & Edit Modals
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<Invoice | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  // Invoices State
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INVOICES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return initialInvoices;
  });

  // Parties State
  const [parties, setParties] = useState<Party[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PARTIES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return initialParties;
  });

  // Items State
  const [items, setItems] = useState<Item[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ITEMS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return initialItems;
  });

  // Company Details State
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return initialCompanyDetails;
  });

  // Sync to LocalStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PARTIES, JSON.stringify(parties));
  }, [parties]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(companyDetails));
  }, [companyDetails]);

  // Auth Methods
  const login = (email: string) => {
    const loggedUser = { email: email.trim() || 'ygbillion17@gmail.com', name: 'Yash Polymers Admin' };
    setUser(loggedUser);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  // Invoice Methods
  const getNextInvoiceNo = () => {
    if (invoices.length === 0) return '101';
    const nums = invoices
      .map(inv => parseInt(inv.invoiceNo, 10))
      .filter(n => !isNaN(n));
    if (nums.length === 0) return '101';
    const max = Math.max(...nums);
    return String(max + 1);
  };

  const addInvoice = (invoice: Invoice) => {
    setInvoices(prev => [invoice, ...prev]);
  };

  const updateInvoice = (updated: Invoice) => {
    setInvoices(prev => prev.map(inv => (inv.id === updated.id ? updated : inv)));
  };

  const deleteInvoice = (id: string) => {
    setInvoices(prev => prev.filter(inv => inv.id !== id));
  };

  const getInvoiceById = (id: string) => {
    return invoices.find(inv => inv.id === id);
  };

  // Party Methods
  const addParty = (partyData: Omit<Party, 'id'>): Party => {
    const newParty: Party = {
      ...partyData,
      id: `party-${Date.now()}`,
    };
    setParties(prev => [newParty, ...prev]);
    return newParty;
  };

  const updateParty = (updated: Party) => {
    setParties(prev => prev.map(p => (p.id === updated.id ? updated : p)));
  };

  const deleteParty = (id: string) => {
    setParties(prev => prev.filter(p => p.id !== id));
  };

  // Item Methods
  const addItem = (itemData: Omit<Item, 'id'>): Item => {
    const newItem: Item = {
      ...itemData,
      id: `item-${Date.now()}`,
    };
    setItems(prev => [newItem, ...prev]);
    return newItem;
  };

  const updateItem = (updated: Item) => {
    setItems(prev => prev.map(i => (i.id === updated.id ? updated : i)));
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  // Settings Method
  const updateCompanyDetails = (details: CompanyDetails) => {
    setCompanyDetails(details);
  };

  // Clean wipe data helper
  const resetAllData = () => {
    setInvoices([]);
    setParties([]);
    setItems([]);
    setCompanyDetails(initialCompanyDetails);
    localStorage.removeItem(STORAGE_KEYS.INVOICES);
    localStorage.removeItem(STORAGE_KEYS.PARTIES);
    localStorage.removeItem(STORAGE_KEYS.ITEMS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  };

  return (
    <BillingContext.Provider
      value={{
        user,
        login,
        logout,
        activeView,
        setActiveView,
        invoices,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        getInvoiceById,
        getNextInvoiceNo,
        selectedInvoiceForPrint,
        setSelectedInvoiceForPrint,
        editingInvoice,
        setEditingInvoice,
        parties,
        addParty,
        updateParty,
        deleteParty,
        items,
        addItem,
        updateItem,
        deleteItem,
        companyDetails,
        updateCompanyDetails,
        resetAllData,
      }}
    >
      {children}
    </BillingContext.Provider>
  );
};

export const useBilling = () => {
  const context = useContext(BillingContext);
  if (!context) {
    throw new Error('useBilling must be used within a BillingProvider');
  }
  return context;
};
