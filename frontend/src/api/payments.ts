import { apiClient } from './client';
import type {
  Payment,
  CashAccount,
  BankAccount,
  CreatePaymentRequest,
  UpdatePaymentRequest,
} from '@/types/payment';
import type { ApiResponse, PagedResponse } from '@/types';

// Payment API
export const paymentsApi = {
  // Ödeme listesi
  getAll: (params?: PaymentListParams) =>
    apiClient.get<ApiResponse<PagedResponse<Payment>>>('/payments', { params }),

  // Ödeme detayı
  getById: (id: string) =>
    apiClient.get<ApiResponse<Payment>>(`/payments/${id}`),

  // Yeni ödeme
  create: (data: CreatePaymentRequest) =>
    apiClient.post<ApiResponse<Payment>>('/payments', data),

  // Ödeme güncelle
  update: (id: string, data: UpdatePaymentRequest) =>
    apiClient.put<ApiResponse<Payment>>(`/payments/${id}`, data),

  // Ödeme sil
  delete: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/payments/${id}`),
};

// Cash Account API
export const cashAccountsApi = {
  getAll: () =>
    apiClient.get<ApiResponse<CashAccount[]>>('/cash-accounts'),

  getById: (id: string) =>
    apiClient.get<ApiResponse<CashAccount>>(`/cash-accounts/${id}`),

  create: (data: { name: string; currency: string }) =>
    apiClient.post<ApiResponse<CashAccount>>('/cash-accounts', data),

  update: (id: string, data: { name: string; isActive: boolean }) =>
    apiClient.put<ApiResponse<CashAccount>>(`/cash-accounts/${id}`, data),
};

// Bank Account API
export const bankAccountsApi = {
  getAll: () =>
    apiClient.get<ApiResponse<BankAccount[]>>('/bank-accounts'),

  getById: (id: string) =>
    apiClient.get<ApiResponse<BankAccount>>(`/bank-accounts/${id}`),

  create: (data: {
    bankName: string;
    accountNumber: string;
    iban?: string;
    currency: string;
  }) =>
    apiClient.post<ApiResponse<BankAccount>>('/bank-accounts', data),

  update: (id: string, data: { bankName: string; isActive: boolean }) =>
    apiClient.put<ApiResponse<BankAccount>>(`/bank-accounts/${id}`, data),
};

export interface PaymentListParams {
  pageNumber?: number;
  pageSize?: number;
  searchText?: string;
  customerId?: string;
  invoiceId?: string;
  type?: number;
  method?: number;
  status?: number;
  startDate?: string;
  endDate?: string;
  currency?: string;
}
