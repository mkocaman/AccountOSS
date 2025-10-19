// Partner entity (Customer + Supplier)
export interface Partner {
  id: string;
  companyId: string;
  code: string;              // AUTO: P-0001
  name: string;
  type: PartnerType;
  
  // Contact
  email?: string;
  phone?: string;
  mobilePhone?: string;
  website?: string;
  contactPerson?: string;
  
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
  currentBalance: number;   // Güncel bakiye (Alacak/Borç)
  
  // Status
  isActive: boolean;
  isBlocked: boolean;
  blockReason?: string;
  notes?: string;
  
  // Audit
  createdAt: string;
  updatedAt?: string;
}

export enum PartnerType {
  Customer = 0,    // Müşteri
  Supplier = 1,    // Tedarikçi
  Both = 2         // Hem Müşteri Hem Tedarikçi
}

export const partnerTypeLabels: Record<PartnerType, string> = {
  [PartnerType.Customer]: 'Müşteri',
  [PartnerType.Supplier]: 'Tedarikçi',
  [PartnerType.Both]: 'Müşteri & Tedarikçi'
};

// Customer specific
export enum CustomerType {
  Individual = 0, // Bireysel
  Corporate = 1,  // Kurumsal
}

// Supplier specific  
export enum SupplierType {
  Domestic = 0,     // Yerli
  Foreign = 1       // Yabancı
}

// Partner detail
export interface PartnerDetail extends Partner {
  // Balance history
  balanceHistory: BalanceHistoryItem[];
  
  // Recent invoices
  recentInvoices: Invoice[];
  
  // Recent payments
  recentPayments: Payment[];
  
  // Addresses
  addresses: PartnerAddress[];
  
  // Statistics
  statistics: PartnerStatistics;
}

export interface BalanceHistoryItem {
  date: string;
  description: string;
  debit: number;    // Borç
  credit: number;   // Alacak
  balance: number;  // Bakiye
  referenceType: 'Invoice' | 'Payment' | 'PurchaseOrder';
  referenceId: string;
  referenceNumber: string;
}

export interface PartnerAddress {
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

export interface PartnerStatistics {
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

// Create/Update
export interface CreatePartnerRequest {
  name: string;
  type: PartnerType;
  email?: string;
  phone?: string;
  mobilePhone?: string;
  website?: string;
  contactPerson?: string;
  taxNumber?: string;
  taxOffice?: string;
  identityNumber?: string;
  billingAddress?: string;
  shippingAddress?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  currency: string;
  creditLimit?: number;
  paymentTermDays?: number;
  isActive: boolean;
  notes?: string;
}

export type UpdatePartnerRequest = Partial<CreatePartnerRequest>;

// Filters
export interface PartnerFilters {
  search?: string;
  type?: PartnerType;
  isActive?: boolean;
  isBlocked?: boolean;
  city?: string;
  country?: string;
}
