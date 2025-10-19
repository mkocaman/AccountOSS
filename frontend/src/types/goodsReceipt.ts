// Goods Receipt
export interface GoodsReceipt {
  id: string;
  companyId: string;
  receiptNumber: string;      // AUTO: GR-0001
  receiptDate: string;
  
  // Purchase Order Reference
  purchaseOrderId: string;
  purchaseOrder?: {
    id: string;
    orderNumber: string;
    supplierId: string;
    supplier?: {
      id: string;
      code: string;
      name: string;
    };
  };
  
  // Warehouse
  warehouseId: string;
  warehouse?: {
    id: string;
    code: string;
    name: string;
  };
  
  // Items
  items: GoodsReceiptItem[];
  
  // Status
  status: GoodsReceiptStatus;
  isInvoiceCreated: boolean;
  invoiceId?: string;
  
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

export interface GoodsReceiptItem {
  id: string;
  goodsReceiptId: string;
  lineNumber: number;
  
  // Product
  productId: string;
  product?: {
    id: string;
    code: string;
    name: string;
    unit: string;
  };
  
  // Purchase Order Item Reference
  purchaseOrderItemId: string;
  orderedQuantity: number;
  previouslyReceivedQuantity: number;
  
  // Received Quantity
  receivedQuantity: number;
  
  // Pricing (from PO)
  unitCost: number;
  totalCost: number;
  
  // Quality Control
  isQualityApproved: boolean;
  qualityNotes?: string;
  
  // Notes
  notes?: string;
}

export enum GoodsReceiptStatus {
  Draft = 0,           // Taslak
  Completed = 1,       // Tamamlandı
  Cancelled = 2        // İptal
}

export const goodsReceiptStatusLabels: Record<GoodsReceiptStatus, string> = {
  [GoodsReceiptStatus.Draft]: 'Taslak',
  [GoodsReceiptStatus.Completed]: 'Tamamlandı',
  [GoodsReceiptStatus.Cancelled]: 'İptal'
};

export const goodsReceiptStatusColors: Record<GoodsReceiptStatus, string> = {
  [GoodsReceiptStatus.Draft]: 'default',
  [GoodsReceiptStatus.Completed]: 'green',
  [GoodsReceiptStatus.Cancelled]: 'red'
};

// Filters
export interface GoodsReceiptFilters {
  search?: string;
  purchaseOrderId?: string;
  status?: GoodsReceiptStatus;
  dateFrom?: string;
  dateTo?: string;
}

// Create/Update
export interface CreateGoodsReceiptRequest {
  receiptDate: string;
  purchaseOrderId: string;
  warehouseId: string;
  notes?: string;
  items: CreateGoodsReceiptItemRequest[];
}

export interface CreateGoodsReceiptItemRequest {
  purchaseOrderItemId: string;
  productId: string;
  receivedQuantity: number;
  unitCost: number;
  isQualityApproved?: boolean;
  qualityNotes?: string;
  notes?: string;
}

export type UpdateGoodsReceiptRequest = Partial<CreateGoodsReceiptRequest>;

// Create invoice from GR
export interface CreateInvoiceFromGrRequest {
  goodsReceiptId: string;
  invoiceDate: string;
  dueDate?: string;
  notes?: string;
}

