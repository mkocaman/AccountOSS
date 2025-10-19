import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { useTranslation } from 'react-i18next';
import axiosInstance from '@/utils/axios';
import type { Product } from '@/types/product';

/**
 * Product listesi için query
 */
export const useProducts = (params?: any) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/products', { params });
      return response.data;
    },
    enabled: false // Backend henüz hazır değil
  });
};

/**
 * Product oluşturma mutation'ı
 */
export const useCreateProduct = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Product>) => {
      const response = await axiosInstance.post('/api/products', data);
      return response.data;
    },
    onSuccess: () => {
      message.success(t('products.createSuccess'));
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || t('products.createError');
      message.error(errorMessage);
    }
  });
};

/**
 * Product güncelleme mutation'ı
 */
export const useUpdateProduct = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<Product>) => {
      const response = await axiosInstance.put(`/api/products/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      message.success(t('products.updateSuccess'));
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || t('products.updateError');
      message.error(errorMessage);
    }
  });
};

/**
 * Product silme mutation'ı
 */
export const useDeleteProduct = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.delete(`/api/products/${id}`);
      return response.data;
    },
    onSuccess: () => {
      message.success(t('products.deleteSuccess'));
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || t('products.deleteError');
      message.error(errorMessage);
    }
  });
};
