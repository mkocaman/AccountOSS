// Invoice API types
export interface Invoice {
  id: string;
  invoiceNumber: string;
  type: InvoiceType;
  status: InvoiceStatus;
  customerId: string;
  customerName: string;
  invoiceDate: string;
  dueDate: string;
  currency: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  grandTotal: number;
  notes?: string;
  isOfficial: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceDetail extends Invoice {
  items: InvoiceItem[];
  payments: InvoicePayment[];
  attachments: InvoiceAttachment[];
}

export interface InvoiceItem {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discountRate: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  lineTotal: number;
  unit: string;
}

export interface InvoicePayment {
  id: string;
  paymentDate: string;
  amount: number;
  paymentMethod: string;
  reference: string;
  notes?: string;
}

export interface InvoiceAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

export interface CreateInvoiceRequest {
  type: InvoiceType;
  customerId: string;
  invoiceDate: string;
  dueDate: string;
  currency: string;
  items: CreateInvoiceItemRequest[];
  notes?: string;
  isOfficial: boolean;
}

export interface CreateInvoiceItemRequest {
  productId: string;
  quantity: number;
  unitPrice: number;
  discountRate?: number;
  taxRate: number;
  description?: string;
}

export interface UpdateInvoiceRequest {
  type?: InvoiceType;
  customerId?: string;
  invoiceDate?: string;
  dueDate?: string;
  currency?: string;
  items?: CreateInvoiceItemRequest[];
  notes?: string;
  isOfficial?: boolean;
}

export interface InvoiceFilters {
  type?: InvoiceType;
  status?: InvoiceStatus;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
  currency?: string;
  isOfficial?: boolean;
  search?: string;
}

export enum InvoiceType {
  Sales = 0,
  Purchase = 1
}

export enum InvoiceStatus {
  Draft = 0,
  Sent = 1,
  Paid = 2,
  Overdue = 3,
  Cancelled = 4
}

export const invoiceStatusLabels = {
  [InvoiceStatus.Draft]: 'Taslak',
  [InvoiceStatus.Sent]: 'Gönderildi',
  [InvoiceStatus.Paid]: 'Ödendi',
  [InvoiceStatus.Overdue]: 'Vadesi Geçti',
  [InvoiceStatus.Cancelled]: 'İptal Edildi'
};

export const invoiceTypeLabels = {
  [InvoiceType.Sales]: 'Satış',
  [InvoiceType.Purchase]: 'Alış'
};