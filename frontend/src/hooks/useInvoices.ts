import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { useTranslation } from 'react-i18next';
import axiosInstance from '@/utils/axios';
import type { Invoice } from '@/types/invoice';

/**
 * Invoice listesi için query
 */
export const useInvoices = (params?: any) => {
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/invoices', { params });
      return response.data;
    },
    enabled: false // Backend henüz hazır değil
  });
};

/**
 * Invoice silme mutation'ı
 */
export const useDeleteInvoice = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.delete(`/api/invoices/${id}`);
      return response.data;
    },
    onSuccess: () => {
      message.success(t('invoices.deleteSuccess'));
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || t('invoices.deleteError');
      message.error(errorMessage);
    }
  });
};

/**
 * Invoice onaylama mutation'ı
 */
export const useApproveInvoice = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.post(`/api/invoices/${id}/approve`);
      return response.data;
    },
    onSuccess: () => {
      message.success(t('invoices.approveSuccess'));
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || t('invoices.approveError');
      message.error(errorMessage);
    }
  });
};
