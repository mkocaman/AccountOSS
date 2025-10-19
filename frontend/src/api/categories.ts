import { apiClient } from './client';
import type { 
  ProductCategory, 
  CategoryFilters,
  CreateCategoryRequest,
  UpdateCategoryRequest
} from '@/types/category';

export const categoriesApi = {
  // Get all categories (tree structure)
  getAll: (params?: CategoryFilters) =>
    apiClient.get<ProductCategory[]>('/categories', { params }),
  
  // Get by ID
  getById: (id: string) =>
    apiClient.get<ProductCategory>(`/categories/${id}`),
  
  // Get tree structure
  getTree: () =>
    apiClient.get<ProductCategory[]>('/categories/tree'),
  
  // Create
  create: (data: CreateCategoryRequest) =>
    apiClient.post<ProductCategory>('/categories', data),
  
  // Update
  update: (id: string, data: UpdateCategoryRequest) =>
    apiClient.put<ProductCategory>(`/categories/${id}`, data),
  
  // Delete
  delete: (id: string) =>
    apiClient.delete(`/categories/${id}`),
  
  // Move category
  move: (id: string, newParentId?: string) =>
    apiClient.post(`/categories/${id}/move`, { newParentId }),
  
  // Reorder
  reorder: (categoryId: string, newOrder: number) =>
    apiClient.post(`/categories/${categoryId}/reorder`, { newOrder })
};
