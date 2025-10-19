import { apiClient } from './client';
import type { 
  Quotation, 
  QuotationFilters,
  CreateQuotationRequest,
  UpdateQuotationRequest
} from '@/types/quotation';
import type { PagedResponse } from '@/types';

export const quotationsApi = {
  // List quotations
  getAll: (params?: QuotationFilters & { page?: number; pageSize?: number }) =>
    apiClient.get<PagedResponse<Quotation>>('/quotations', { params }),
  
  // Get by ID
  getById: (id: string) =>
    apiClient.get<Quotation>(`/quotations/${id}`),
  
  // Create
  create: (data: CreateQuotationRequest) =>
    apiClient.post<Quotation>('/quotations', data),
  
  // Update
  update: (id: string, data: UpdateQuotationRequest) =>
    apiClient.put<Quotation>(`/quotations/${id}`, data),
  
  // Delete
  delete: (id: string) =>
    apiClient.delete(`/quotations/${id}`),
  
  // Send to customer
  send: (id: string, email?: string) =>
    apiClient.post<Quotation>(`/quotations/${id}/send`, { email }),
  
  // Accept
  accept: (id: string) =>
    apiClient.post<Quotation>(`/quotations/${id}/accept`),
  
  // Reject
  reject: (id: string, reason: string) =>
    apiClient.post<Quotation>(`/quotations/${id}/reject`, { reason }),
  
  // Convert to Sales Order
  convertToOrder: (id: string) =>
    apiClient.post(`/quotations/${id}/convert-to-order`),
  
  // PDF Export
  exportPdf: (id: string) =>
    apiClient.get(`/quotations/${id}/pdf`, { responseType: 'blob' })
};

