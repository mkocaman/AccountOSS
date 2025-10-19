// Purchase Order
export interface PurchaseOrder {
  id: string;
  companyId: string;
  orderNumber: string;        // AUTO: PO-0001
  orderDate: string;
  deliveryDate?: string;
  
  // Supplier
  supplierId: string;
  supplier?: {
    id: string;
    code: string;
    name: string;
    currency: string;
  };
  
  // Warehouse
  warehouseId: string;
  warehouse?: {
    id: string;
    code: string;
    name: string;
  };
  
  // Items
  items: PurchaseOrderItem[];
  
  // Amounts
  currency: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  
  // Status
  status: PurchaseOrderStatus;
  
  // Tracking
  receivedQuantity: number;    // Teslim alınan miktar
  remainingQuantity: number;   // Kalan miktar
  isFullyReceived: boolean;    // Tamamen teslim alındı mı?
  
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

export interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
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
  receivedQuantity: number;
  remainingQuantity: number;
  
  // Pricing
  unitPrice: number;
  discountPercent: number;
  discountAmount: number;
  taxPercent: number;
  taxAmount: number;
  lineTotal: number;
  
  // Notes
  notes?: string;
}

export enum PurchaseOrderStatus {
  Draft = 0,          // Taslak
  Confirmed = 1,      // Onaylandı
  PartiallyReceived = 2,  // Kısmi Teslim
  Completed = 3,      // Tamamlandı
  Cancelled = 4       // İptal
}

export const purchaseOrderStatusLabels: Record<PurchaseOrderStatus, string> = {
  [PurchaseOrderStatus.Draft]: 'Taslak',
  [PurchaseOrderStatus.Confirmed]: 'Onaylandı',
  [PurchaseOrderStatus.PartiallyReceived]: 'Kısmi Teslim',
  [PurchaseOrderStatus.Completed]: 'Tamamlandı',
  [PurchaseOrderStatus.Cancelled]: 'İptal'
};

export const purchaseOrderStatusColors: Record<PurchaseOrderStatus, string> = {
  [PurchaseOrderStatus.Draft]: 'default',
  [PurchaseOrderStatus.Confirmed]: 'blue',
  [PurchaseOrderStatus.PartiallyReceived]: 'orange',
  [PurchaseOrderStatus.Completed]: 'green',
  [PurchaseOrderStatus.Cancelled]: 'red'
};

// Filters
export interface PurchaseOrderFilters {
  search?: string;
  supplierId?: string;
  status?: PurchaseOrderStatus;
  dateFrom?: string;
  dateTo?: string;
}

// Create/Update
export interface CreatePurchaseOrderRequest {
  orderDate: string;
  deliveryDate?: string;
  supplierId: string;
  warehouseId: string;
  currency: string;
  notes?: string;
  items: CreatePurchaseOrderItemRequest[];
}

export interface CreatePurchaseOrderItemRequest {
  productId: string;
  orderedQuantity: number;
  unitPrice: number;
  discountPercent?: number;
  taxPercent?: number;
  notes?: string;
}

export type UpdatePurchaseOrderRequest = Partial<CreatePurchaseOrderRequest>;

