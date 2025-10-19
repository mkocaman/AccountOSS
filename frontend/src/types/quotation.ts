// Quotation
export interface Quotation {
  id: string;
  companyId: string;
  quotationNumber: string;    // AUTO: QT-0001
  quotationDate: string;
  validUntil: string;          // Geçerlilik tarihi
  
  // Customer
  customerId: string;
  customer?: {
    id: string;
    code: string;
    name: string;
    email?: string;
    phone?: string;
  };
  
  // Items
  items: QuotationItem[];
  
  // Amounts
  currency: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  
  // Status
  status: QuotationStatus;
  
  // Conversion
  isConvertedToOrder: boolean;
  salesOrderId?: string;
  salesOrder?: {
    orderNumber: string;
  };
  
  // Notes
  notes?: string;
  termsAndConditions?: string;
  
  // Audit
  createdBy?: string;
  createdByUser?: {
    name: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface QuotationItem {
  id: string;
  quotationId: string;
  lineNumber: number;
  
  // Product
  productId: string;
  product?: {
    id: string;
    code: string;
    name: string;
    unit: string;
  };
  
  // Quantities
  quantity: number;
  
  // Pricing
  unitPrice: number;
  discountPercent: number;
  discountAmount: number;
  taxPercent: number;
  taxAmount: number;
  lineTotal: number;
  
  // Description
  description?: string;
  notes?: string;
}

export enum QuotationStatus {
  Draft = 0,          // Taslak
  Sent = 1,           // Gönderildi
  Accepted = 2,       // Kabul Edildi
  Rejected = 3,       // Reddedildi
  Expired = 4         // Süresi Doldu
}

export const quotationStatusLabels: Record<QuotationStatus, string> = {
  [QuotationStatus.Draft]: 'Taslak',
  [QuotationStatus.Sent]: 'Gönderildi',
  [QuotationStatus.Accepted]: 'Kabul Edildi',
  [QuotationStatus.Rejected]: 'Reddedildi',
  [QuotationStatus.Expired]: 'Süresi Doldu'
};

export const quotationStatusColors: Record<QuotationStatus, string> = {
  [QuotationStatus.Draft]: 'default',
  [QuotationStatus.Sent]: 'blue',
  [QuotationStatus.Accepted]: 'green',
  [QuotationStatus.Rejected]: 'red',
  [QuotationStatus.Expired]: 'orange'
};

// Filters
export interface QuotationFilters {
  search?: string;
  customerId?: string;
  status?: QuotationStatus;
  dateFrom?: string;
  dateTo?: string;
  isExpired?: boolean;
}

// Create/Update
export interface CreateQuotationRequest {
  quotationDate: string;
  validUntil: string;
  customerId: string;
  currency: string;
  notes?: string;
  termsAndConditions?: string;
  items: CreateQuotationItemRequest[];
}

export interface CreateQuotationItemRequest {
  productId: string;
  quantity: number;
  unitPrice: number;
  discountPercent?: number;
  taxPercent?: number;
  description?: string;
  notes?: string;
}

export type UpdateQuotationRequest = Partial<CreateQuotationRequest>;

