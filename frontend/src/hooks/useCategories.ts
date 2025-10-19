import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { useTranslation } from 'react-i18next';
import axiosInstance from '@/utils/axios';
import type { ProductCategory } from '@/types/product';

/**
 * Category listesi için query
 */
export const useCategories = (params?: any) => {
  return useQuery({
    queryKey: ['categories', params],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/product-categories', { params });
      return response.data;
    },
    enabled: false // Backend henüz hazır değil
  });
};

/**
 * Category oluşturma mutation'ı
 */
export const useCreateCategory = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<ProductCategory>) => {
      const response = await axiosInstance.post('/api/product-categories', data);
      return response.data;
    },
    onSuccess: () => {
      message.success(t('categories.createSuccess'));
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || t('categories.createError');
      message.error(errorMessage);
    }
  });
};

/**
 * Category güncelleme mutation'ı
 */
export const useUpdateCategory = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<ProductCategory>) => {
      const response = await axiosInstance.put(`/api/product-categories/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      message.success(t('categories.updateSuccess'));
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || t('categories.updateError');
      message.error(errorMessage);
    }
  });
};

/**
 * Category silme mutation'ı
 */
export const useDeleteCategory = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.delete(`/api/product-categories/${id}`);
      return response.data;
    },
    onSuccess: () => {
      message.success(t('categories.deleteSuccess'));
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || t('categories.deleteError');
      message.error(errorMessage);
    }
  });
};
