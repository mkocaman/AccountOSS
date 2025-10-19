import { apiClient } from './client';
import type { 
  GoodsReceipt, 
  GoodsReceiptFilters,
  CreateGoodsReceiptRequest,
  UpdateGoodsReceiptRequest,
  CreateInvoiceFromGrRequest
} from '@/types/goodsReceipt';
import type { PagedResponse } from '@/types';

export const goodsReceiptsApi = {
  // List goods receipts
  getAll: (params?: GoodsReceiptFilters & { page?: number; pageSize?: number }) =>
    apiClient.get<PagedResponse<GoodsReceipt>>('/goods-receipts', { params }),
  
  // Get by ID
  getById: (id: string) =>
    apiClient.get<GoodsReceipt>(`/goods-receipts/${id}`),
  
  // Get by Purchase Order
  getByPurchaseOrder: (purchaseOrderId: string) =>
    apiClient.get<GoodsReceipt[]>(`/goods-receipts/purchase-order/${purchaseOrderId}`),
  
  // Create
  create: (data: CreateGoodsReceiptRequest) =>
    apiClient.post<GoodsReceipt>('/goods-receipts', data),
  
  // Update
  update: (id: string, data: UpdateGoodsReceiptRequest) =>
    apiClient.put<GoodsReceipt>(`/goods-receipts/${id}`, data),
  
  // Delete
  delete: (id: string) =>
    apiClient.delete(`/goods-receipts/${id}`),
  
  // Complete (finalize)
  complete: (id: string) =>
    apiClient.post<GoodsReceipt>(`/goods-receipts/${id}/complete`),
  
  // Cancel
  cancel: (id: string, reason: string) =>
    apiClient.post<GoodsReceipt>(`/goods-receipts/${id}/cancel`, { reason }),
  
  // Create invoice from GR
  createInvoice: (data: CreateInvoiceFromGrRequest) =>
    apiClient.post(`/goods-receipts/${data.goodsReceiptId}/create-invoice`, data),
  
  // PDF Export
  exportPdf: (id: string) =>
    apiClient.get(`/goods-receipts/${id}/pdf`, { responseType: 'blob' })
};

