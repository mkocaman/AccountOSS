import { apiClient } from './client';
import type { Invoice, InvoiceDetail, CreateInvoiceRequest, UpdateInvoiceRequest, InvoiceFilters } from '@/types/invoice';
import type { ApiResponse } from './client';

export const invoicesApi = {
  // Fatura listesi getir
  getAll: (filters?: InvoiceFilters) =>
    apiClient.get<Invoice[]>('/invoices', { params: filters }),

  // Fatura detayı getir
  getById: (id: string) =>
    apiClient.get<InvoiceDetail>(`/invoices/${id}`),

  // Yeni fatura oluştur (Draft)
  create: (data: CreateInvoiceRequest) =>
    apiClient.post<Invoice>('/invoices', data),

  // Fatura güncelle
  update: (id: string, data: UpdateInvoiceRequest) =>
    apiClient.put<Invoice>(`/invoices/${id}`, data),

  // Fatura kes (Draft → Issued + Stok hareketi)
  issue: (id: string) =>
    apiClient.post<Invoice>(`/invoices/${id}/issue`),

  // Fatura iptal et
  cancel: (id: string) =>
    apiClient.post<boolean>(`/invoices/${id}/cancel`),

  // Fatura PDF'i indir
  downloadPdf: async (id: string, invoiceNumber: string) => {
    const response = await fetch(`${apiClient.defaults.baseURL}/invoices/${id}/pdf`, {
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