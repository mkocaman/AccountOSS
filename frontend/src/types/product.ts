/**
 * Product ve ProductCategory type tanımları
 */

export interface Product {
  id: string;
  code: string;
  name: string;
  description?: string;
  barcode?: string;
  unit: string;
  purchasePrice: number;
  salePrice: number;
  taxRate: number;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel?: number;
  categoryId?: string;
  categoryName?: string;
  isActive: boolean;
  isLowStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  parentName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductListParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  categoryId?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CategoryListParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  parentId?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Product form için
export interface ProductFormData {
  code: string;
  name: string;
  description?: string;
  barcode?: string;
  unit: string;
  purchasePrice: number;
  salePrice: number;
  taxRate: number;
  minStockLevel: number;
  maxStockLevel?: number;
  categoryId?: string;
  isActive: boolean;
}

// Category form için
export interface CategoryFormData {
  name: string;
  description?: string;
  parentId?: string;
  isActive: boolean;
}