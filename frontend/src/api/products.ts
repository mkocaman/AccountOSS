import { apiClient } from './client';
import type {
  Product,
  Category,
  CreateProductRequest,
  UpdateProductRequest,
} from '@/types/product';
import type { ApiResponse, PagedResponse } from '@/types';

// Product API
export const productsApi = {
  // Ürün listesi
  getAll: (params?: ProductListParams) =>
    apiClient.get<ApiResponse<PagedResponse<Product>>>('/products', { params }),

  // Ürün detayı
  getById: (id: string) =>
    apiClient.get<ApiResponse<Product>>(`/products/${id}`),

  // Yeni ürün
  create: (data: CreateProductRequest) =>
    apiClient.post<ApiResponse<Product>>('/products', data),

  // Ürün güncelle
  update: (id: string, data: UpdateProductRequest) =>
    apiClient.put<ApiResponse<Product>>(`/products/${id}`, data),

  // Ürün sil
  delete: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/products/${id}`),

  // Ürün arama (autocomplete)
  search: (query: string) =>
    apiClient.get<ApiResponse<Product[]>>('/products/search', {
      params: { q: query, limit: 10 },
    }),

  // Stok miktarı
  getStock: (id: string) =>
    apiClient.get<ApiResponse<{ quantity: number }>>(`/products/${id}/stock`),
};

// Category API
export const categoriesApi = {
  getAll: () =>
    apiClient.get<ApiResponse<Category[]>>('/categories'),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Category>>(`/categories/${id}`),

  create: (data: { name: string; parentId?: string; description?: string }) =>
    apiClient.post<ApiResponse<Category>>('/categories', data),

  update: (id: string, data: { name: string; description?: string }) =>
    apiClient.put<ApiResponse<Category>>(`/categories/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/categories/${id}`),
};

export interface ProductListParams {
  pageNumber?: number;
  pageSize?: number;
  searchText?: string;
  categoryId?: string;
  type?: number;
  isActive?: boolean;
  isForSale?: boolean;
  lowStock?: boolean; // Düşük stok uyarısı
}

