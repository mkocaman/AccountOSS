// Supplier entity
export interface Supplier {
  id: string;
  companyId: string;
  code: string;              // AUTO: S-0001
  name: string;
  type: SupplierType;
  
  // Contact
  email?: string;
  phone?: string;
  mobilePhone?: string;
  website?: string;
  contactPerson?: string;
  
  // Tax Info
  taxNumber?: string;
  taxOffice?: string;
  
  // Address
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  
  // Financial
  currency: string;
  paymentTermDays: number;    // Vade günü
  currentBalance: number;     // Güncel bakiye (borç/alacak)
  
  // Status
  isActive: boolean;
  isBlocked: boolean;
  blockReason?: string;
  
  // Notes
  notes?: string;
  
  // Audit
  createdAt: string;
  updatedAt?: string;
}

export enum SupplierType {
  Domestic = 0,     // Yerli
  Foreign = 1       // Yabancı
}

export const supplierTypeLabels: Record<SupplierType, string> = {
  [SupplierType.Domestic]: 'Yerli',
  [SupplierType.Foreign]: 'Yabancı'
};

// Supplier detail
export interface SupplierDetail extends Supplier {
  balanceHistory: BalanceHistoryItem[];
  recentPurchaseOrders: PurchaseOrder[];
  recentInvoices: Invoice[];
  recentPayments: Payment[];
  statistics: SupplierStatistics;
}

export interface BalanceHistoryItem {
  date: string;
  description: string;
  debit: number;    // Borç
  credit: number;   // Alacak
  balance: number;  // Bakiye
  referenceType: 'PurchaseOrder' | 'Invoice' | 'Payment';
  referenceId: string;
  referenceNumber: string;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  orderDate: string;
  status: 'Pending' | 'Approved' | 'Completed' | 'Cancelled';
  totalAmount: number;
  currency: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  type: 'Purchase';
  isOfficial: boolean;
  grandTotal: number;
  currency: string;
}

export interface Payment {
  id: string;
  paymentNumber: string;
  paymentDate: string;
  method: string;
  amount: number;
  currency: string;
}

export interface SupplierStatistics {
  totalPurchaseOrders: number;
  totalPurchaseAmount: number;
  totalInvoices: number;
  totalInvoiceAmount: number;
  totalPayments: number;
  totalPaymentAmount: number;
  averagePurchaseAmount: number;
  averagePaymentDays: number;
  lastPurchaseDate?: string;
  lastPaymentDate?: string;
}

// Filters
export interface SupplierFilters {
  search?: string;
  type?: SupplierType;
  isActive?: boolean;
  isBlocked?: boolean;
  city?: string;
  country?: string;
}

// Create/Update
export interface CreateSupplierRequest {
  name: string;
  type: SupplierType;
  email?: string;
  phone?: string;
  mobilePhone?: string;
  website?: string;
  contactPerson?: string;
  taxNumber?: string;
  taxOffice?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  currency: string;
  paymentTermDays: number;
  isActive: boolean;
  notes?: string;
}

export type UpdateSupplierRequest = Partial<CreateSupplierRequest>;
