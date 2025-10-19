// Stock Movement
export interface StockMovement {
  id: string;
  companyId: string;
  movementNumber: string;     // AUTO: SM-0001
  movementDate: string;
  
  // Product
  productId: string;
  product?: {
    id: string;
    code: string;
    name: string;
    unit: string;
  };
  
  // Warehouse
  warehouseId: string;
  warehouse?: {
    id: string;
    code: string;
    name: string;
  };
  
  // Movement Details
  type: StockMovementType;
  quantity: number;
  unitCost: number;           // Birim maliyet
  totalCost: number;          // Toplam maliyet
  
  // Reference
  referenceType?: ReferenceType;
  referenceId?: string;
  referenceNumber?: string;
  
  // FIFO Layer (if applicable)
  fifoLayerId?: string;
  
  // Balance after movement
  balanceAfter: number;
  
  // Notes
  notes?: string;
  
  // User
  createdBy?: string;
  createdByUser?: {
    name: string;
  };
  
  // Audit
  createdAt: string;
}

export enum StockMovementType {
  In = 0,              // Giriş (Alış, İade, Sayım Fazlası)
  Out = 1,             // Çıkış (Satış, Fire, Sayım Eksiği)
  Adjustment = 2,      // Düzeltme
  Transfer = 3         // Transfer
}

export const stockMovementTypeLabels: Record<StockMovementType, string> = {
  [StockMovementType.In]: 'Giriş',
  [StockMovementType.Out]: 'Çıkış',
  [StockMovementType.Adjustment]: 'Düzeltme',
  [StockMovementType.Transfer]: 'Transfer'
};

export const stockMovementTypeColors: Record<StockMovementType, string> = {
  [StockMovementType.In]: 'green',
  [StockMovementType.Out]: 'red',
  [StockMovementType.Adjustment]: 'orange',
  [StockMovementType.Transfer]: 'blue'
};

export enum ReferenceType {
  Invoice = 'Invoice',
  PurchaseOrder = 'PurchaseOrder',
  GoodsReceipt = 'GoodsReceipt',
  SalesOrder = 'SalesOrder',
  Manual = 'Manual',
  Transfer = 'Transfer'
}

// Filters
export interface StockMovementFilters {
  search?: string;
  productId?: string;
  warehouseId?: string;
  type?: StockMovementType;
  referenceType?: ReferenceType;
  dateFrom?: string;
  dateTo?: string;
}

// Create manual stock movement
export interface CreateStockMovementRequest {
  movementDate: string;
  productId: string;
  warehouseId: string;
  type: StockMovementType;
  quantity: number;
  unitCost: number;
  notes?: string;
}

// Stock adjustment request
export interface StockAdjustmentRequest {
  productId: string;
  warehouseId: string;
  newQuantity: number;
  reason: string;
}

// Transfer request
export interface StockTransferRequest {
  productId: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  quantity: number;
  transferDate: string;
  notes?: string;
}

