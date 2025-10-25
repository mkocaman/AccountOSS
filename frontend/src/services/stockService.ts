import client from '../utils/client';

// Mock mode flag - Backend hazır olunca false yap
const USE_MOCK_DATA = true;

// ============================================
// TYPE DEFINITIONS (INLINE - NO EXTERNAL IMPORTS)
// ============================================

interface PaginationParams {
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

function buildQueryString(params: Record<string, any>): string {
  const cleanParams = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value.map(v => `${key}=${encodeURIComponent(v)}`).join('&');
      }
      return `${key}=${encodeURIComponent(value)}`;
    })
    .join('&');
  return cleanParams ? `?${cleanParams}` : '';
}

// ============================================
// STOCK SERVICE
// ============================================

export type StockMovementType = 'in' | 'out' | 'adjustment';

export interface StockMovement {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  type: StockMovementType;
  quantity: number;
  unitCost: number;
  totalCost: number;
  referenceType?: 'invoice' | 'payment' | 'adjustment';
  referenceId?: string;
  referenceNumber?: string;
  warehouseId?: string;
  notes?: string;
  createdAt: string;
  createdBy: string;
}

export interface StockLevel {
  productId: string;
  productCode: string;
  productName: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  averageCost: number;
  totalValue: number;
  warehouseId?: string;
  lastMovementDate?: string;
}

export const getStockMovements = async (
  params: PaginationParams & {
    productId?: string;
    type?: StockMovementType;
    startDate?: string;
    endDate?: string;
  }
): Promise<PaginatedResponse<StockMovement>> => {
  if (USE_MOCK_DATA) {
    console.log('📦 Using MOCK stock movements data');
    return {
      items: [],
      totalCount: 0,
      pageNumber: 1,
      pageSize: 10,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false
    };
  }
  
  const queryString = buildQueryString(params);
  const response = await client.get(`/stock/movements${queryString}`);
  return response.data;
};

export const getStockLevels = async (
  params: PaginationParams & {
    lowStock?: boolean;
    warehouseId?: string;
  }
): Promise<PaginatedResponse<StockLevel>> => {
  if (USE_MOCK_DATA) {
    console.log('📦 Using MOCK stock levels data');
    return {
      items: [],
      totalCount: 0,
      pageNumber: 1,
      pageSize: 10,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false
    };
  }
  
  const queryString = buildQueryString(params);
  const response = await client.get(`/stock/levels${queryString}`);
  return response.data;
};

export const calculateFifoCost = async (
  productId: string,
  quantity: number
): Promise<number> => {
  if (USE_MOCK_DATA) {
    console.log('📦 Using MOCK FIFO cost calculation');
    return 100; // Mock cost
  }
  
  const response = await client.get(`/stock/fifo-cost/${productId}`, {
    params: { quantity }
  });
  return response.data.cost;
};// Cache bust: Fri Oct 24 23:31:19 +03 2025
