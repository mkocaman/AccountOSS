import { apiClient } from './client';
import type { 
  Supplier, 
  SupplierDetail,
  SupplierFilters,
  CreateSupplierRequest,
  UpdateSupplierRequest
} from '@/types/supplier';
import type { PagedResponse } from '@/types/common';

export const suppliersApi = {
  // List suppliers
  getAll: (params?: SupplierFilters & { page?: number; pageSize?: number }) =>
    apiClient.get<PagedResponse<Supplier>>('/suppliers', { params }),
  
  // Get by ID
  getById: (id: string) =>
    apiClient.get<Supplier>(`/suppliers/${id}`),
  
  // Get detail
  getDetail: (id: string) =>
    apiClient.get<SupplierDetail>(`/suppliers/${id}/detail`),
  
  // Create
  create: (data: CreateSupplierRequest) =>
    apiClient.post<Supplier>('/suppliers', data),
  
  // Update
  update: (id: string, data: UpdateSupplierRequest) =>
    apiClient.put<Supplier>(`/suppliers/${id}`, data),
  
  // Delete
  delete: (id: string) =>
    apiClient.delete(`/suppliers/${id}`),
  
  // Block/Unblock
  block: (id: string, reason: string) =>
    apiClient.post(`/suppliers/${id}/block`, { reason }),
  
  unblock: (id: string) =>
    apiClient.post(`/suppliers/${id}/unblock`),
  
  // Balance history
  getBalanceHistory: (id: string, params?: { dateFrom?: string; dateTo?: string }) =>
    apiClient.get(`/suppliers/${id}/balance-history`, { params })
};
