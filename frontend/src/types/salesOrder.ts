// Sales Order
export interface SalesOrder {
  id: string;
  companyId: string;
  orderNumber: string;        // AUTO: SO-0001
  orderDate: string;
  deliveryDate?: string;
  
  // Customer
  customerId: string;
  customer?: {
    id: string;
    code: string;
    name: string;
    currency: string;
  };
  
  // Quotation Reference (if converted from quotation)
  quotationId?: string;
  quotation?: {
    id: string;
    quotationNumber: string;
  };
  
  // Items
  items: SalesOrderItem[];
  
  // Amounts
  currency: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  
  // Status
  status: SalesOrderStatus;
  
  // Delivery Tracking
  deliveredQuantity: number;   // Teslim edilen miktar
  remainingQuantity: number;   // Kalan miktar
  isFullyDelivered: boolean;   // Tamamen teslim edildi mi?
  
  // Invoice Tracking
  isInvoiced: boolean;
  invoiceId?: string;
  invoice?: {
    invoiceNumber: string;
  };
  
  // Notes
  notes?: string;
  
  // Audit
  createdBy?: string;
  createdByUser?: {
    name: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface SalesOrderItem {
  id: string;
  salesOrderId: string;
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
  orderedQuantity: number;
  deliveredQuantity: number;
  remainingQuantity: number;
  
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

export enum SalesOrderStatus {
  Draft = 0,              // Taslak
  Confirmed = 1,          // Onaylandı
  PartiallyDelivered = 2, // Kısmi Teslimat
  Completed = 3,          // Tamamlandı
  Cancelled = 4           // İptal
}

export const salesOrderStatusLabels: Record<SalesOrderStatus, string> = {
  [SalesOrderStatus.Draft]: 'Taslak',
  [SalesOrderStatus.Confirmed]: 'Onaylandı',
  [SalesOrderStatus.PartiallyDelivered]: 'Kısmi Teslimat',
  [SalesOrderStatus.Completed]: 'Tamamlandı',
  [SalesOrderStatus.Cancelled]: 'İptal'
};

export const salesOrderStatusColors: Record<SalesOrderStatus, string> = {
  [SalesOrderStatus.Draft]: 'default',
  [SalesOrderStatus.Confirmed]: 'blue',
  [SalesOrderStatus.PartiallyDelivered]: 'orange',
  [SalesOrderStatus.Completed]: 'green',
  [SalesOrderStatus.Cancelled]: 'red'
};

// Filters
export interface SalesOrderFilters {
  search?: string;
  customerId?: string;
  status?: SalesOrderStatus;
  dateFrom?: string;
  dateTo?: string;
  isInvoiced?: boolean;
}

// Create/Update
export interface CreateSalesOrderRequest {
  orderDate: string;
  deliveryDate?: string;
  customerId: string;
  currency: string;
  notes?: string;
  items: CreateSalesOrderItemRequest[];
}

export interface CreateSalesOrderItemRequest {
  productId: string;
  orderedQuantity: number;
  unitPrice: number;
  discountPercent?: number;
  taxPercent?: number;
  description?: string;
  notes?: string;
}

export type UpdateSalesOrderRequest = Partial<CreateSalesOrderRequest>;

// Create invoice from Sales Order
export interface CreateInvoiceFromSalesOrderRequest {
  salesOrderId: string;
  invoiceDate: string;
  dueDate?: string;
  notes?: string;
}

