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
  // List partners
  getAll: (params?: PartnerFilters & { page?: number; pageSize?: number }) =>
    apiClient.get<PagedResponse<Partner>>('/partners', { params }),
  
  // Get by ID
  getById: (id: string) =>
    apiClient.get<Partner>(`/partners/${id}`),
  
  // Get detail
  getDetail: (id: string) =>
    apiClient.get<PartnerDetail>(`/partners/${id}/detail`),
  
  // Create
  create: (data: CreatePartnerRequest) =>
    apiClient.post<Partner>('/partners', data),
  
  // Update
  update: (id: string, data: UpdatePartnerRequest) =>
    apiClient.put<Partner>(`/partners/${id}`, data),
  
  // Delete
  delete: (id: string) =>
    apiClient.delete(`/partners/${id}`),
  
  // Block/Unblock
  block: (id: string, reason: string) =>
    apiClient.post(`/partners/${id}/block`, { reason }),
  
  unblock: (id: string) =>
    apiClient.post(`/partners/${id}/unblock`),
  
  // Get balance history
  getBalanceHistory: (id: string, params?: { dateFrom?: string; dateTo?: string }) =>
    apiClient.get<BalanceHistoryItem[]>(`/partners/${id}/balance-history`, { params }),
  
  // Addresses
  getAddresses: (id: string) =>
    apiClient.get<PartnerAddress[]>(`/partners/${id}/addresses`),
  
  addAddress: (partnerId: string, data: Omit<PartnerAddress, 'id'>) =>
    apiClient.post<PartnerAddress>(`/partners/${partnerId}/addresses`, data),
  
  updateAddress: (partnerId: string, addressId: string, data: Partial<PartnerAddress>) =>
    apiClient.put<PartnerAddress>(`/partners/${partnerId}/addresses/${addressId}`, data),
  
  deleteAddress: (partnerId: string, addressId: string) =>
    apiClient.delete(`/partners/${partnerId}/addresses/${addressId}`),
  
  setDefaultAddress: (partnerId: string, addressId: string) =>
    apiClient.post(`/partners/${partnerId}/addresses/${addressId}/set-default`)
};
