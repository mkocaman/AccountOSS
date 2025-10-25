/**
 * Fatura tipleri ve interface'leri
 */

export type InvoiceType = 'sales' | 'purchase';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'cancelled' | 'overdue';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceType: InvoiceType;
  status: InvoiceStatus;
  
  // Cari bilgileri
  partnerId: string;
  partnerCode?: string;
  partnerName: string;
  partnerTaxNumber?: string;
  partnerAddress?: string;
  
  // Tarih bilgileri
  invoiceDate: string;
  dueDate?: string;
  
  // Finansal bilgiler
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  exchangeRate: number;
  
  // Kalemler
  items: InvoiceItem[];
  
  // Notlar
  description?: string;
  notes?: string;
  
  // Sistem bilgileri
  companyId: string;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
  deletedAt?: string;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  
  // Ürün bilgileri
  productId: string;
  productCode: string;
  productName: string;
  description?: string;
  
  // Miktar ve fiyat
  quantity: number;
  unitPrice: number;
  discountRate: number;
  discountAmount: number;
  
  // Vergi
  taxRate: number;
  taxAmount: number;
  
  // Toplam
  subtotal: number;
  totalAmount: number;
  
  // Stok maliyet (FIFO)
  unitCost?: number;
  totalCost?: number;
  
  // Sıralama
  lineNumber: number;
}

export interface CreateInvoiceRequest {
  invoiceType: InvoiceType;
  partnerId: string;
  invoiceDate: string;
  dueDate?: string;
  currency?: string;
  exchangeRate?: number;
  description?: string;
  notes?: string;
  items: CreateInvoiceItemRequest[];
}

export interface CreateInvoiceItemRequest {
  productId: string;
  quantity: number;
  unitPrice: number;
  discountRate?: number;
  taxRate?: number;
  description?: string;
}

export interface UpdateInvoiceRequest extends CreateInvoiceRequest {
  id: string;
}

export interface InvoiceFilters {
  invoiceType?: InvoiceType;
  status?: InvoiceStatus;
  partnerId?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  searchTerm?: string;
}

export interface InvoiceSummary {
  totalCount: number;
  draftCount: number;
  sentCount: number;
  paidCount: number;
  overdueCount: number;
  totalAmount: number;
  paidAmount: number;
  unpaidAmount: number;
  overdueAmount: number;
}