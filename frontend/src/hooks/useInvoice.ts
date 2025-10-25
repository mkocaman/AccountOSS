import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  updateInvoiceStatus,
  getInvoiceSummary,
  suggestInvoiceNumber
} from '../services/invoiceService';
import type { 
  CreateInvoiceRequest, 
  UpdateInvoiceRequest,
  InvoiceFilters 
} from '@/types/invoice';

/**
 * Fatura listesi hook
 */
export const useInvoices = (params: any) => {
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: () => getInvoices(params)
  });
};

/**
 * Tek fatura detayı hook
 */
export const useInvoice = (id: string) => {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => getInvoice(id),
    enabled: !!id
  });
};

/**
 * Fatura oluşturma hook
 */
export const useCreateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInvoiceRequest) => createInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      message.success('Fatura başarıyla oluşturuldu');
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Fatura oluşturulamadı');
    }
  });
};

/**
 * Fatura güncelleme hook
 */
export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateInvoiceRequest) => updateInvoice(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', data.id] });
      message.success('Fatura başarıyla güncellendi');
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Fatura güncellenemedi');
    }
  });
};

/**
 * Fatura silme hook
 */
export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      message.success('Fatura başarıyla silindi');
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Fatura silinemedi');
    }
  });
};

/**
 * Fatura durumu değiştirme hook
 */
export const useUpdateInvoiceStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      updateInvoiceStatus(id, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', data.id] });
      message.success('Fatura durumu güncellendi');
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Durum güncellenemedi');
    }
  });
};

/**
 * Fatura özet istatistikleri hook
 */
export const useInvoiceSummary = (filters?: InvoiceFilters) => {
  return useQuery({
    queryKey: ['invoiceSummary', filters],
    queryFn: () => getInvoiceSummary(filters)
  });
};

/**
 * Fatura numarası önerisi hook
 */
export const useSuggestInvoiceNumber = (invoiceType: string) => {
  return useQuery({
    queryKey: ['suggestInvoiceNumber', invoiceType],
    queryFn: () => suggestInvoiceNumber(invoiceType),
    enabled: !!invoiceType
  });
};
