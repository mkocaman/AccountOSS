import client from '../utils/client';
import { PaginatedResponse, PaginationParams, buildQueryString } from '../utils/api-helpers';

/**
 * Ödeme servisi
 */

export type PaymentMethod = 'cash' | 'bank_transfer' | 'credit_card' | 'check' | 'other';
export type PaymentType = 'collection' | 'payment'; // Tahsilat / Ödeme

export interface Payment {
  id: string;
  paymentNumber: string;
  type: PaymentType;
  partnerId: string;
  partnerName: string;
  amount: number;
  method: PaymentMethod;
  paymentDate: string;
  invoiceId?: string;
  invoiceNumber?: string;
  bankAccountId?: string;
  checkNumber?: string;
  checkDate?: string;
  notes?: string;
  createdAt: string;
  createdBy: string;
}

export interface CreatePaymentDto {
  type: PaymentType;
  partnerId: string;
  amount: number;
  method: PaymentMethod;
  paymentDate: string;
  invoiceId?: string;
  bankAccountId?: string;
  checkNumber?: string;
  checkDate?: string;
  notes?: string;
}

export interface PaymentFilters extends PaginationParams {
  type?: PaymentType;
  partnerId?: string;
  method?: PaymentMethod;
  startDate?: string;
  endDate?: string;
}

export interface PaymentSummary {
  totalCollections: number; // Toplam tahsilat
  totalPayments: number; // Toplam ödeme
  netCashFlow: number; // Net nakit akışı
  pendingCollections: number; // Bekleyen tahsilatlar
  pendingPayments: number; // Bekleyen ödemeler
}

export const paymentService = {
  /**
   * Ödeme listesini getir
   */
  getPayments: async (filters: PaymentFilters = {}): Promise<PaginatedResponse<Payment>> => {
    const queryString = buildQueryString({
      pageNumber: filters.pageNumber || 1,
      pageSize: filters.pageSize || 10,
      type: filters.type,
      partnerId: filters.partnerId,
      method: filters.method,
      startDate: filters.startDate,
      endDate: filters.endDate,
      sortBy: filters.sortBy || 'paymentDate',
      sortOrder: filters.sortOrder || 'desc'
    });

    const response = await client.get(`/payments${queryString}`);
    return response.data;
  },

  /**
   * ID'ye göre ödeme getir
   */
  getPaymentById: async (id: string): Promise<Payment> => {
    const response = await client.get(`/payments/${id}`);
    return response.data;
  },

  /**
   * Yeni ödeme oluştur
   */
  createPayment: async (data: CreatePaymentDto): Promise<Payment> => {
    const response = await client.post('/payments', data);
    return response.data;
  },

  /**
   * Ödeme sil
   */
  deletePayment: async (id: string): Promise<void> => {
    await client.delete(`/payments/${id}`);
  },

  /**
   * Ödeme özeti
   */
  getPaymentSummary: async (startDate?: string, endDate?: string): Promise<PaymentSummary> => {
    const queryString = buildQueryString({ startDate, endDate });
    const response = await client.get(`/payments/summary${queryString}`);
    return response.data;
  },

  /**
   * Fatura için bekleyen ödemeler
   */
  getPendingPaymentsByInvoice: async (invoiceId: string): Promise<Payment[]> => {
    const response = await client.get(`/payments/pending/invoice/${invoiceId}`);
    return response.data;
  },

  /**
   * Cari hesap için bekleyen ödemeler
   */
  getPendingPaymentsByPartner: async (partnerId: string): Promise<Payment[]> => {
    const response = await client.get(`/payments/pending/partner/${partnerId}`);
    return response.data;
  },

  /**
   * Yeni ödeme numarası oluştur
   */
  generatePaymentNumber: async (type: PaymentType): Promise<string> => {
    const response = await client.get(`/payments/generate-number/${type}`);
    return response.data.paymentNumber;
  }
};
