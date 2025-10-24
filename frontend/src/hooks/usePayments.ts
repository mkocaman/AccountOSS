import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentService, PaymentFilters, CreatePaymentDto } from '../services/paymentService';
import { transformToProTableResponse } from '../utils/api-helpers';
import { useMessage } from './useMessage';

/**
 * Payments hook
 */
export const usePayments = (filters: PaymentFilters = {}) => {
  const query = useQuery({
    queryKey: ['payments', filters],
    queryFn: () => paymentService.getPayments(filters),
    staleTime: 30000
  });

  const proTableData = query.data ? transformToProTableResponse(query.data) : undefined;

  return {
    ...query,
    proTableData
  };
};

/**
 * Single payment hook
 */
export const usePayment = (id: string) => {
  return useQuery({
    queryKey: ['payment', id],
    queryFn: () => paymentService.getPaymentById(id),
    enabled: !!id
  });
};

/**
 * Payment summary hook
 */
export const usePaymentSummary = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['paymentSummary', startDate, endDate],
    queryFn: () => paymentService.getPaymentSummary(startDate, endDate),
    staleTime: 60000 // 1 dakika
  });
};

/**
 * Create payment mutation
 */
export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  const message = useMessage();

  return useMutation({
    mutationFn: paymentService.createPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['paymentSummary'] });
      queryClient.invalidateQueries({ queryKey: ['partners'] }); // Bakiye güncellendi
      message.success('Ödeme başarıyla kaydedildi');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Ödeme kaydedilemedi';
      message.error(errorMessage);
    }
  });
};

/**
 * Delete payment mutation
 */
export const useDeletePayment = () => {
  const queryClient = useQueryClient();
  const message = useMessage();

  return useMutation({
    mutationFn: paymentService.deletePayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['paymentSummary'] });
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      message.success('Ödeme başarıyla silindi');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Ödeme silinemedi';
      message.error(errorMessage);
    }
  });
};
