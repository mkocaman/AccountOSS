import { apiClient } from './client';
import type { 
  Invoice, 
  InvoiceItem, 
  CreateInvoiceRequest, 
  InvoiceType,
  InvoiceStatus 
} from '@/types/invoice';

// API-specific filter interface
export interface InvoiceFilters {
  type?: InvoiceType;
  status?: InvoiceStatus;
  customerId?: string;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
}

// List params for pagination
export interface InvoiceListParams extends InvoiceFilters {
  pageNumber?: number;
  pageSize?: number;
  searchText?: string;
}

// Backward compatibility exports
export type { Invoice, InvoiceItem, CreateInvoiceRequest };

export const invoicesApi = {
  // Fatura listesi getir
  getAll: (filters?: InvoiceFilters) =>
    apiClient.get<Invoice[]>('/invoices', { params: filters }),

  // Fatura detayı getir
  getById: (id: string) =>
    apiClient.get<Invoice>(`/invoices/${id}`),

  // Yeni fatura oluştur (Draft)
  create: (data: CreateInvoiceRequest) =>
    apiClient.post<Invoice>('/invoices', data),

  // Fatura kes (Draft → Issued + Stok hareketi)
  issue: (id: string) =>
    apiClient.post<Invoice>(`/invoices/${id}/issue`),

  // Fatura iptal et
  cancel: (id: string) =>
    apiClient.post<boolean>(`/invoices/${id}/cancel`),

  // Fatura sil (soft delete)
  delete: (id: string) =>
    apiClient.delete<boolean>(`/invoices/${id}`),

  // Fatura onayla (issue ile aynı)
  approve: (id: string) =>
    apiClient.post<Invoice>(`/invoices/${id}/issue`),

  // Fatura PDF'i indir
  downloadPdf: async (id: string, invoiceNumber: string) => {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7043/api/v1';
    const response = await fetch(`${baseURL}/invoices/${id}/pdf`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('PDF indirme başarısız');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${invoiceNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};