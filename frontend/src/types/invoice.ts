// Fatura tipleri
export interface Invoice {
  id: string;
  companyId: string;
  invoiceNumber: string; // AUTO: 2025/00001
  type: InvoiceType;
  invoiceDate: string;
  dueDate?: string; // Vade tarihi
  
  // Customer
  customerId: string;
  customer?: {
    id: string;
    name: string;
    code: string;
  };
  
  // Financial
  currency: string;
  exchangeRate: number; // Snapshot!
  
  subTotal: number; // Ara toplam
  totalVat: number; // Toplam KDV
  totalDiscount: number; // Toplam indirim
  grandTotal: number; // Genel toplam
  
  // Base currency amounts (snapshot)
  subTotalInBase: number;
  grandTotalInBase: number;
  
  // Official/Unofficial (GR Sistemi)
  isOfficial: boolean;
  
  // Status
  status: InvoiceStatus;
  paymentStatus: PaymentStatus;
  
  // Notes
  notes?: string;
  internalNotes?: string; // Müşteriye gösterilmez
  
  // Cancellation
  isCancelled: boolean;
  cancelledAt?: string;
  cancellationReason?: string;
  
  // Items
  items?: InvoiceItem[];
  
  // Audit
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
}

// Fatura kalemleri
export interface InvoiceItem {
  id: string;
  invoiceId: string;
  productId: string;
  product?: {
    id: string;
    name: string;
    code: string;
    unit: string;
  };
  
  lineNumber: number; // Sıra no
  description: string;
  
  quantity: number;
  unit: string;
  
  unitPrice: number;
  discountRate: number; // İndirim %
  discountAmount: number; // İndirim tutar
  vatRate: number; // KDV %
  vatAmount: number; // KDV tutar
  
  lineTotal: number; // Satır toplamı (KDV dahil)
  
  // Base currency snapshot
  lineTotalInBase: number;
  
  // FIFO cost (backend hesaplar)
  actualCost?: number;
  profit?: number;
}

// Enums
export enum InvoiceType {
  Sales = 0, // Satış faturası
  Purchase = 1, // Alış faturası
  SalesReturn = 2, // Satış iadesi
  PurchaseReturn = 3, // Alış iadesi
}

export enum InvoiceStatus {
  Draft = 0, // Taslak
  Approved = 1, // Onaylandı
  Sent = 2, // Gönderildi
  Cancelled = 3, // İptal edildi
}

export enum PaymentStatus {
  Unpaid = 0, // Ödenmedi
  Partial = 1, // Kısmi ödendi
  Paid = 2, // Tamamen ödendi
}

// Create/Update için
export interface CreateInvoiceRequest {
  customerId: string;
  invoiceDate: string;
  dueDate?: string;
  currency: string;
  isOfficial: boolean;
  type: InvoiceType;
  notes?: string;
  internalNotes?: string;
  items: CreateInvoiceItemRequest[];
}

export interface CreateInvoiceItemRequest {
  productId: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discountRate?: number;
  vatRate: number;
}

export type UpdateInvoiceRequest = CreateInvoiceRequest;

// Status labels
export const INVOICE_STATUS_LABELS = {
  [InvoiceStatus.Draft]: 'Taslak',
  [InvoiceStatus.Approved]: 'Onaylandı',
  [InvoiceStatus.Sent]: 'Gönderildi',
  [InvoiceStatus.Cancelled]: 'İptal',
};

export const PAYMENT_STATUS_LABELS = {
  [PaymentStatus.Unpaid]: 'Ödenmedi',
  [PaymentStatus.Partial]: 'Kısmi',
  [PaymentStatus.Paid]: 'Ödendi',
};

export const INVOICE_TYPE_LABELS = {
  [InvoiceType.Sales]: 'Satış',
  [InvoiceType.Purchase]: 'Alış',
  [InvoiceType.SalesReturn]: 'Satış İadesi',
  [InvoiceType.PurchaseReturn]: 'Alış İadesi',
};

