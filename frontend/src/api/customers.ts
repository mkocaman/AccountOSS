import { apiClient } from './client';
import type { 
  Customer, 
  CreateCustomerRequest, 
  UpdateCustomerRequest,
  CustomerDetail,
  CustomerAddress,
  BalanceHistoryItem
} from '@/types/customer';
import type { ApiResponse } from '@/types';

// Customer API endpoints (Backend: /api/v1/customers)
export const customersApi = {
  // Müşteri listesi (Backend: searchTerm, activeOnly - pagination yok)
  getAll: async (params?: CustomerListParams): Promise<ApiResponse<Customer[]>> => {
    const response = await apiClient.get<ApiResponse<Customer[]>>('/customers', {
      params: {
        searchTerm: params?.searchText,
        activeOnly: params?.isActive ?? true,
      },
    });
    return response;
  },

  // Müşteri detayı
  getById: (id: string) =>
    apiClient.get<ApiResponse<Customer>>(`/customers/${id}`),

  // Yeni müşteri
  create: (data: CreateCustomerRequest) =>
    apiClient.post<ApiResponse<Customer>>('/customers', data),

  // Müşteri güncelle
  update: (id: string, data: UpdateCustomerRequest) =>
    apiClient.put<ApiResponse<Customer>>(`/customers/${id}`, { ...data, id }),

  // Müşteri sil
  delete: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/customers/${id}`),

  // Müşteri arama (Backend'de ayrı endpoint yok, getAll kullan)
  search: (query: string) =>
    customersApi.getAll({ searchText: query }),
  
  // Get customer detail
  getDetail: (id: string) =>
    apiClient.get<CustomerDetail>(`/customers/${id}/detail`),
  
  // Get balance history
  getBalanceHistory: (id: string, params?: { dateFrom?: string; dateTo?: string }) =>
    apiClient.get<BalanceHistoryItem[]>(`/customers/${id}/balance-history`, { params }),
  
  // Addresses
  getAddresses: (id: string) =>
    apiClient.get<CustomerAddress[]>(`/customers/${id}/addresses`),
  
  addAddress: (customerId: string, data: Omit<CustomerAddress, 'id'>) =>
    apiClient.post<CustomerAddress>(`/customers/${customerId}/addresses`, data),
  
  updateAddress: (customerId: string, addressId: string, data: Partial<CustomerAddress>) =>
    apiClient.put<CustomerAddress>(`/customers/${customerId}/addresses/${addressId}`, data),
  
  deleteAddress: (customerId: string, addressId: string) =>
    apiClient.delete(`/customers/${customerId}/addresses/${addressId}`),
  
  setDefaultAddress: (customerId: string, addressId: string) =>
    apiClient.post(`/customers/${customerId}/addresses/${addressId}/set-default`)
};

// List parametreleri
export interface CustomerListParams {
  searchText?: string;
  type?: number;
  isActive?: boolean;
}

