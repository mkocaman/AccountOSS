// Müşteri tipleri
export interface Customer {
  id: string;
  companyId: string;
  code: string; // Müşteri kodu (AUTO: C-0001)
  name: string;
  type: CustomerType;
  
  // Contact
  email?: string;
  phone?: string;
  mobilePhone?: string;
  website?: string;
  
  // Tax Info
  taxNumber?: string;
  taxOffice?: string;
  identityNumber?: string; // TC Kimlik (bireysel için)
  
  // Address
  billingAddress?: string;
  shippingAddress?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  
  // Financial
  currency: string;
  creditLimit: number;
  paymentTermDays: number; // Vade gün sayısı
  currentBalance: number; // Güncel bakiye (Alacak/Borç)
  
  // Status
  isActive: boolean;
  isBlocked: boolean;
  blockReason?: string;
  notes?: string;
  
  // Audit
  createdAt: string;
  updatedAt?: string;
}

export enum CustomerType {
  Individual = 0, // Bireysel
  Corporate = 1,  // Kurumsal
}

// Create/Update için
export interface CreateCustomerRequest {
  name: string;
  type: CustomerType;
  email?: string;
  phone?: string;
  mobilePhone?: string;
  taxNumber?: string;
  taxOffice?: string;
  identityNumber?: string;
  billingAddress?: string;
  shippingAddress?: string;
  city?: string;
  country?: string;
  currency: string;
  creditLimit?: number;
  paymentTermDays?: number;
  notes?: string;
}

export type UpdateCustomerRequest = CreateCustomerRequest;

// Customer detail response
export interface CustomerDetail extends Customer {
  // Balance history
  balanceHistory: BalanceHistoryItem[];
  
  // Recent invoices
  recentInvoices: Invoice[];
  
  // Recent payments
  recentPayments: Payment[];
  
  // Addresses
  addresses: CustomerAddress[];
  
  // Statistics
  statistics: CustomerStatistics;
}

export interface BalanceHistoryItem {
  date: string;
  description: string;
  debit: number;    // Borç
  credit: number;   // Alacak
  balance: number;  // Bakiye
  referenceType: 'Invoice' | 'Payment';
  referenceId: string;
  referenceNumber: string;
}

export interface CustomerAddress {
  id: string;
  type: 'Billing' | 'Shipping';
  title: string;
  address: string;
  city: string;
  district?: string;
  postalCode?: string;
  country: string;
  isDefault: boolean;
}

export interface CustomerStatistics {
  totalInvoices: number;
  totalInvoiceAmount: number;
  totalPayments: number;
  totalPaymentAmount: number;
  averageInvoiceAmount: number;
  averagePaymentDays: number;
  lastInvoiceDate?: string;
  lastPaymentDate?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  type: 'Sales' | 'Purchase';
  isOfficial: boolean;
  grandTotal: number;
  currency: string;
}

export interface Payment {
  id: string;
  paymentNumber: string;
  paymentDate: string;
  type: 'Receipt' | 'Payment';
  method: string;
  amount: number;
  currency: string;
}

