import { apiClient } from './client';
import type { 
  Partner, 
  PartnerDetail,
  PartnerFilters,
  CreatePartnerRequest,
  UpdatePartnerRequest,
  PartnerAddress,
  BalanceHistoryItem
} from '@/types/partner';
import type { PagedResponse } from '@/types/common';

export const partnersApi = {
  // List partners (using customers endpoint)
  getAll: (params?: PartnerFilters & { page?: number; pageSize?: number }) =>
    apiClient.get<PagedResponse<Partner>>('/customers', { params }),
  
  // Get by ID
  getById: (id: string) =>
    apiClient.get<Partner>(`/customers/${id}`),
  
  // Get detail
  getDetail: (id: string) =>
    apiClient.get<PartnerDetail>(`/customers/${id}`),
  
  // Create
  create: (data: CreatePartnerRequest) =>
    apiClient.post<Partner>('/customers', data),
  
  // Update
  update: (id: string, data: UpdatePartnerRequest) =>
    apiClient.put<Partner>(`/customers/${id}`, data),
  
  // Delete
  delete: (id: string) =>
    apiClient.delete(`/customers/${id}`),
  
  // Block/Unblock
  block: (id: string, reason: string) =>
    apiClient.post(`/customers/${id}/block`, { reason }),
  
  unblock: (id: string) =>
    apiClient.post(`/customers/${id}/unblock`),
  
  // Get balance history
  getBalanceHistory: (id: string, params?: { dateFrom?: string; dateTo?: string }) =>
    apiClient.get<BalanceHistoryItem[]>(`/customers/${id}/balance-history`, { params }),
  
  // Addresses
  getAddresses: (id: string) =>
    apiClient.get<PartnerAddress[]>(`/customers/${id}/addresses`),
  
  addAddress: (partnerId: string, data: Omit<PartnerAddress, 'id'>) =>
    apiClient.post<PartnerAddress>(`/customers/${partnerId}/addresses`, data),
  
  updateAddress: (partnerId: string, addressId: string, data: Partial<PartnerAddress>) =>
    apiClient.put<PartnerAddress>(`/customers/${partnerId}/addresses/${addressId}`, data),
  
  deleteAddress: (partnerId: string, addressId: string) =>
    apiClient.delete(`/customers/${partnerId}/addresses/${addressId}`),
  
  setDefaultAddress: (partnerId: string, addressId: string) =>
    apiClient.post(`/customers/${partnerId}/addresses/${addressId}/set-default`)
};
