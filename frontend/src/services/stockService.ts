import client from '../utils/client';
import { buildQueryString } from '../utils/api-helpers';
import type { PaginatedResponse, PaginationParams } from '../utils/api-helpers';

/**
 * Stok hareketi servisi
 * FIFO hesaplama ve stok takibi
 */

export type StockMovementType = 'in' | 'out' | 'adjustment';

export interface StockMovement {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  type: StockMovementType;
  quantity: number;
  unitCost: number; // Birim maliyet
  totalCost: number; // Toplam maliyet
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
  quantity: number;
  averageCost: number; // Ortalama maliyet
  fifoCost: number; // FIFO maliyeti
  totalValue: number; // Stok değeri
  lastMovementDate: string;
}

export interface FIFOCalculation {
  productId: string;
  currentStock: number;
  fifoCost: number;
  layers: FIFOLayer[];
}

export interface FIFOLayer {
  date: string;
  quantity: number;
  unitCost: number;
  remainingQuantity: number;
}

export interface StockAdjustment {
  productId: string;
  newQuantity: number;
  reason: string;
  notes?: string;
}

export interface LowStockAlert {
  productId: string;
  productCode: string;
  productName: string;
  currentStock: number;
  minStockLevel: number;
  difference: number;
}

export interface StockFilters extends PaginationParams {
  productId?: string;
  type?: StockMovementType;
  startDate?: string;
  endDate?: string;
}

export const stockService = {
  /**
   * Stok hareketlerini getir
   */
  getMovements: async (filters: StockFilters = {}): Promise<PaginatedResponse<StockMovement>> => {
    const queryString = buildQueryString({
      pageNumber: filters.pageNumber || 1,
      pageSize: filters.pageSize || 10,
      productId: filters.productId,
      type: filters.type,
      startDate: filters.startDate,
      endDate: filters.endDate,
      sortBy: filters.sortBy || 'createdAt',
      sortOrder: filters.sortOrder || 'desc'
    });

    const response = await client.get(`/stock/movements${queryString}`);
    return response.data;
  },

  /**
   * Stok seviyelerini getir
   */
  getStockLevels: async (filters: PaginationParams = {}): Promise<PaginatedResponse<StockLevel>> => {
    const queryString = buildQueryString({
      pageNumber: filters.pageNumber || 1,
      pageSize: filters.pageSize || 10,
      sortBy: filters.sortBy || 'productCode',
      sortOrder: filters.sortOrder || 'asc'
    });

    const response = await client.get(`/stock/levels${queryString}`);
    return response.data;
  },

  /**
   * Ürün için FIFO hesaplama
   */
  calculateFIFO: async (productId: string): Promise<FIFOCalculation> => {
    const response = await client.get(`/stock/fifo/${productId}`);
    return response.data;
  },

  /**
   * Stok ayarlama (düzeltme)
   */
  adjustStock: async (adjustment: StockAdjustment): Promise<StockMovement> => {
    const response = await client.post('/stock/adjust', adjustment);
    return response.data;
  },

  /**
   * Düşük stok uyarıları
   */
  getLowStockAlerts: async (): Promise<LowStockAlert[]> => {
    const response = await client.get('/stock/low-stock-alerts');
    return response.data;
  },

  /**
   * Belirli bir ürünün stok durumu
   */
  getProductStock: async (productId: string): Promise<StockLevel> => {
    const response = await client.get(`/stock/product/${productId}`);
    return response.data;
  }
};
