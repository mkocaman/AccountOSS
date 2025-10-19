import { apiClient } from './client';
import type { 
  PurchaseOrder, 
  PurchaseOrderFilters,
  CreatePurchaseOrderRequest,
  UpdatePurchaseOrderRequest
} from '@/types/purchaseOrder';
import type { PagedResponse } from '@/types';

export const purchaseOrdersApi = {
  // List purchase orders
  getAll: (params?: PurchaseOrderFilters & { page?: number; pageSize?: number }) =>
    apiClient.get<PagedResponse<PurchaseOrder>>('/purchase-orders', { params }),
  
  // Get by ID
  getById: (id: string) =>
    apiClient.get<PurchaseOrder>(`/purchase-orders/${id}`),
  
  // Create
  create: (data: CreatePurchaseOrderRequest) =>
    apiClient.post<PurchaseOrder>('/purchase-orders', data),
  
  // Update
  update: (id: string, data: UpdatePurchaseOrderRequest) =>
    apiClient.put<PurchaseOrder>(`/purchase-orders/${id}`, data),
  
  // Delete
  delete: (id: string) =>
    apiClient.delete(`/purchase-orders/${id}`),
  
  // Confirm
  confirm: (id: string) =>
    apiClient.post<PurchaseOrder>(`/purchase-orders/${id}/confirm`),
  
  // Cancel
  cancel: (id: string, reason: string) =>
    apiClient.post<PurchaseOrder>(`/purchase-orders/${id}/cancel`, { reason }),
  
  // PDF Export
  exportPdf: (id: string) =>
    apiClient.get(`/purchase-orders/${id}/pdf`, { responseType: 'blob' })
};

