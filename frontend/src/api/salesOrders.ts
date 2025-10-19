import { apiClient } from './client';
import type { 
  SalesOrder, 
  SalesOrderFilters,
  CreateSalesOrderRequest,
  UpdateSalesOrderRequest,
  CreateInvoiceFromSalesOrderRequest
} from '@/types/salesOrder';
import type { PagedResponse } from '@/types';

export const salesOrdersApi = {
  // List sales orders
  getAll: (params?: SalesOrderFilters & { page?: number; pageSize?: number }) =>
    apiClient.get<PagedResponse<SalesOrder>>('/sales-orders', { params }),
  
  // Get by ID
  getById: (id: string) =>
    apiClient.get<SalesOrder>(`/sales-orders/${id}`),
  
  // Create
  create: (data: CreateSalesOrderRequest) =>
    apiClient.post<SalesOrder>('/sales-orders', data),
  
  // Update
  update: (id: string, data: UpdateSalesOrderRequest) =>
    apiClient.put<SalesOrder>(`/sales-orders/${id}`, data),
  
  // Delete
  delete: (id: string) =>
    apiClient.delete(`/sales-orders/${id}`),
  
  // Confirm
  confirm: (id: string) =>
    apiClient.post<SalesOrder>(`/sales-orders/${id}/confirm`),
  
  // Cancel
  cancel: (id: string, reason: string) =>
    apiClient.post<SalesOrder>(`/sales-orders/${id}/cancel`, { reason }),
  
  // Create invoice from Sales Order
  createInvoice: (data: CreateInvoiceFromSalesOrderRequest) =>
    apiClient.post(`/sales-orders/${data.salesOrderId}/create-invoice`, data),
  
  // PDF Export
  exportPdf: (id: string) =>
    apiClient.get(`/sales-orders/${id}/pdf`, { responseType: 'blob' })
};

