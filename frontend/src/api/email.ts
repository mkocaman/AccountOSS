import { apiClient } from './client';

// Email types matching backend
export interface EmailLog {
  id: string;
  toEmail: string;
  toName?: string;
  subject: string;
  status: EmailStatus;
  sentAt?: string;
  attemptCount: number;
  errorMessage?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  createdAt: string;
}

export enum EmailStatus {
  Pending = 0,
  Sent = 1,
  Failed = 2,
  Cancelled = 3,
  Retrying = 4
}

export interface SendInvoiceEmailRequest {
  invoiceId: string;
  toEmail: string;
  toName?: string;
  ccEmails?: string[];
  bccEmails?: string[];
  additionalMessage?: string;
}

export interface SendPaymentReminderRequest {
  invoiceId: string;
  toEmail: string;
  toName?: string;
}

export interface EmailLogFilters {
  status?: EmailStatus;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
  pageNumber?: number;
  pageSize?: number;
}

export const emailStatusLabels = {
  [EmailStatus.Pending]: 'Bekliyor',
  [EmailStatus.Sent]: 'Gönderildi',
  [EmailStatus.Failed]: 'Başarısız',
  [EmailStatus.Cancelled]: 'İptal',
  [EmailStatus.Retrying]: 'Yeniden Deniyor'
};

export const emailApi = {
  // Fatura email'i gönder
  sendInvoice: (data: SendInvoiceEmailRequest) =>
    apiClient.post<boolean>('/email/send-invoice', data),

  // Ödeme hatırlatması gönder
  sendPaymentReminder: (data: SendPaymentReminderRequest) =>
    apiClient.post<boolean>('/email/send-payment-reminder', data),

  // Email loglarını getir
  getLogs: (filters?: EmailLogFilters) =>
    apiClient.get<EmailLog[]>('/email/logs', { params: filters }),
};
