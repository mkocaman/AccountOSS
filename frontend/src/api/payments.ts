import { apiClient } from './client';

// Payment types matching backend
export interface Payment {
  id: string;
  paymentNumber: string;
  type: PaymentType; // 0 = Income, 1 = Expense
  customerId: string;
  customerName: string;
  invoiceId?: string;
  invoiceNumber?: string;
  paymentDate: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export enum PaymentType {
  Income = 0,
  Expense = 1
}

export enum PaymentMethod {
  Cash = 0,
  BankTransfer = 1,
  CreditCard = 2,
  Check = 3,
  Other = 4
}

export interface CreatePaymentRequest {
  type: PaymentType;
  customerId: string;
  invoiceId?: string;
  paymentDate: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
}

export interface PaymentFilters {
  type?: PaymentType;
  customerId?: string;
  invoiceId?: string;
  method?: PaymentMethod;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
}

export const paymentTypeLabels = {
  [PaymentType.Income]: 'Tahsilat',
  [PaymentType.Expense]: 'Ödeme'
};

export const paymentMethodLabels = {
  [PaymentMethod.Cash]: 'Nakit',
  [PaymentMethod.BankTransfer]: 'Banka Transferi',
  [PaymentMethod.CreditCard]: 'Kredi Kartı',
  [PaymentMethod.Check]: 'Çek',
  [PaymentMethod.Other]: 'Diğer'
};

export const paymentsApi = {
  // Ödeme listesi getir
  getAll: (filters?: PaymentFilters) =>
    apiClient.get<Payment[]>('/payments', { params: filters }),

  // Ödeme detayı getir
  getById: (id: string) =>
    apiClient.get<Payment>(`/payments/${id}`),

  // Yeni ödeme kaydet
  create: (data: CreatePaymentRequest) =>
    apiClient.post<Payment>('/payments', data),

  // Ödeme sil (soft delete)
  delete: (id: string) =>
    apiClient.delete<boolean>(`/payments/${id}`),
};