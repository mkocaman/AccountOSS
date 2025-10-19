import { apiClient } from './client';
import type {
  Invoice,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
} from '@/types/invoice';
import type { ApiResponse, PagedResponse } from '@/types';

// Invoice API
export const invoicesApi = {
  // Fatura listesi
  getAll: (params?: InvoiceListParams) =>
    apiClient.get<ApiResponse<PagedResponse<Invoice>>>('/invoices', { params }),

  // Fatura detayı
  getById: (id: string) =>
    apiClient.get<ApiResponse<Invoice>>(`/invoices/${id}`),

  // Yeni fatura
  create: (data: CreateInvoiceRequest) =>
    apiClient.post<ApiResponse<Invoice>>('/invoices', data),

  // Fatura güncelle
  update: (id: string, data: UpdateInvoiceRequest) =>
    apiClient.put<ApiResponse<Invoice>>(`/invoices/${id}`, data),

  // Fatura sil
  delete: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/invoices/${id}`),

  // Fatura onayla
  approve: (id: string) =>
    apiClient.post<ApiResponse<Invoice>>(`/invoices/${id}/approve`),

  // Fatura iptal et
  cancel: (id: string, reason: string) =>
    apiClient.post<ApiResponse<Invoice>>(`/invoices/${id}/cancel`, { reason }),

  // PDF indir
  downloadPdf: (id: string) =>
    apiClient.get<Blob>(`/invoices/${id}/pdf`, { responseType: 'blob' }),
};

export interface InvoiceListParams {
  pageNumber?: number;
  pageSize?: number;
  searchText?: string;
  customerId?: string;
  type?: number;
  status?: number;
  paymentStatus?: number;
  isOfficial?: boolean;
  startDate?: string;
  endDate?: string;
  currency?: string;
  minAmount?: number;
  maxAmount?: number;
}

