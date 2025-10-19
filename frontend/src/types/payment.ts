// Ödeme tipleri
export interface Payment {
  id: string;
  companyId: string;
  paymentNumber: string; // AUTO: PAY-2025/00001
  paymentDate: string;
  
  // Customer
  customerId: string;
  customer?: {
    id: string;
    name: string;
    code: string;
  };
  
  // Invoice (optional - genel ödeme olabilir)
  invoiceId?: string;
  invoice?: {
    id: string;
    invoiceNumber: string;
  };
  
  // Financial
  type: PaymentType; // Receipt (Tahsilat) / Payment (Ödeme)
  method: PaymentMethod; // Cash, Bank, Card...
  
  currency: string;
  amount: number;
  amountInBase: number; // Base currency'de
  exchangeRate: number;
  
  // Account
  cashAccountId?: string;
  cashAccount?: {
    id: string;
    name: string;
  };
  
  bankAccountId?: string;
  bankAccount?: {
    id: string;
    bankName: string;
    accountNumber: string;
  };
  
  // Notes
  description?: string;
  notes?: string;
  
  // Status
  status: PaymentStatus;
  
  // Audit
  createdAt: string;
  updatedAt?: string;
}

// Enums
export enum PaymentType {
  Receipt = 0, // Tahsilat (müşteriden para alındı)
  Payment = 1, // Ödeme (tedarikçiye para verildi)
}

export enum PaymentMethod {
  Cash = 0, // Nakit
  BankTransfer = 1, // Banka Transferi
  CreditCard = 2, // Kredi Kartı
  Check = 3, // Çek
  PromissoryNote = 4, // Senet
}

export enum PaymentStatus {
  Pending = 0, // Beklemede
  Completed = 1, // Tamamlandı
  Cancelled = 2, // İptal
}

// Kasa hesabı
export interface CashAccount {
  id: string;
  companyId: string;
  name: string;
  currency: string;
  balance: number;
  isActive: boolean;
}

// Banka hesabı
export interface BankAccount {
  id: string;
  companyId: string;
  bankName: string;
  branchCode?: string;
  accountNumber: string;
  iban?: string;
  currency: string;
  balance: number;
  isActive: boolean;
}

// Create/Update için
export interface CreatePaymentRequest {
  customerId: string;
  invoiceId?: string;
  paymentDate: string;
  type: PaymentType;
  method: PaymentMethod;
  currency: string;
  amount: number;
  cashAccountId?: string;
  bankAccountId?: string;
  description?: string;
  notes?: string;
}

export type UpdatePaymentRequest = CreatePaymentRequest;

// Labels
export const PAYMENT_TYPE_LABELS = {
  [PaymentType.Receipt]: 'Tahsilat',
  [PaymentType.Payment]: 'Ödeme',
};

export const PAYMENT_METHOD_LABELS = {
  [PaymentMethod.Cash]: 'Nakit',
  [PaymentMethod.BankTransfer]: 'Banka Transferi',
  [PaymentMethod.CreditCard]: 'Kredi Kartı',
  [PaymentMethod.Check]: 'Çek',
  [PaymentMethod.PromissoryNote]: 'Senet',
};

export const PAYMENT_STATUS_LABELS = {
  [PaymentStatus.Pending]: 'Beklemede',
  [PaymentStatus.Completed]: 'Tamamlandı',
  [PaymentStatus.Cancelled]: 'İptal',
};
