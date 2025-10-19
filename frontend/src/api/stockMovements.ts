import { apiClient } from './client';
import type { 
  StockMovement, 
  StockMovementFilters,
  CreateStockMovementRequest,
  StockAdjustmentRequest,
  StockTransferRequest
} from '@/types/stockMovement';
import type { PagedResponse } from '@/types';

export const stockMovementsApi = {
  // List movements
  getAll: (params?: StockMovementFilters & { page?: number; pageSize?: number }) =>
    apiClient.get<PagedResponse<StockMovement>>('/stock-movements', { params }),
  
  // Get by ID
  getById: (id: string) =>
    apiClient.get<StockMovement>(`/stock-movements/${id}`),
  
  // Get by product
  getByProduct: (productId: string, params?: { dateFrom?: string; dateTo?: string }) =>
    apiClient.get<StockMovement[]>(`/stock-movements/product/${productId}`, { params }),
  
  // Create manual movement
  create: (data: CreateStockMovementRequest) =>
    apiClient.post<StockMovement>('/stock-movements', data),
  
  // Stock adjustment
  adjust: (data: StockAdjustmentRequest) =>
    apiClient.post<StockMovement>('/stock-movements/adjust', data),
  
  // Transfer between warehouses
  transfer: (data: StockTransferRequest) =>
    apiClient.post<StockMovement[]>('/stock-movements/transfer', data)
};

