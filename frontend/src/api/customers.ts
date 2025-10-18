import { apiClient } from './client';
import type { Customer, CreateCustomerRequest, UpdateCustomerRequest } from '@/types/customer';
import type { ApiResponse, PagedResponse } from '@/types';

// Customer API endpoints
export const customersApi = {
  // Müşteri listesi (pagination + search)
  getAll: (params?: CustomerListParams) =>
    apiClient.get<ApiResponse<PagedResponse<Customer>>>('/customers', { params }),

  // Müşteri detayı
  getById: (id: string) =>
    apiClient.get<ApiResponse<Customer>>(`/customers/${id}`),

  // Yeni müşteri
  create: (data: CreateCustomerRequest) =>
    apiClient.post<ApiResponse<Customer>>('/customers', data),

  // Müşteri güncelle
  update: (id: string, data: UpdateCustomerRequest) =>
    apiClient.put<ApiResponse<Customer>>(`/customers/${id}`, data),

  // Müşteri sil
  delete: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/customers/${id}`),

  // Müşteri arama (autocomplete için)
  search: (query: string) =>
    apiClient.get<ApiResponse<Customer[]>>('/customers/search', {
      params: { q: query, limit: 10 },
    }),
};

// List parametreleri
export interface CustomerListParams {
  pageNumber?: number;
  pageSize?: number;
  searchText?: string;
  type?: number;
  isActive?: boolean;
  city?: string;
}

