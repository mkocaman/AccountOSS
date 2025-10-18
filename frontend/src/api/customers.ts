import { apiClient } from './client';
import type { Customer, CreateCustomerRequest, UpdateCustomerRequest } from '@/types/customer';
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
};

// List parametreleri
export interface CustomerListParams {
  searchText?: string;
  type?: number;
  isActive?: boolean;
}

