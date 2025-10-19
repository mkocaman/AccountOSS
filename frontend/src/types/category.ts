// Product Category
export interface ProductCategory {
  id: string;
  companyId: string;
  code: string;              // AUTO: CAT-0001
  name: string;
  description?: string;
  
  // Hierarchy
  parentId?: string;
  parent?: ProductCategory;
  children?: ProductCategory[];
  level: number;             // 0 = root, 1 = child, 2 = grandchild...
  path: string;              // "Root/Parent/Child"
  
  // Display
  icon?: string;
  color?: string;
  displayOrder: number;
  
  // Status
  isActive: boolean;
  
  // Statistics
  productCount?: number;     // Bu kategorideki ürün sayısı
  
  // Audit
  createdAt: string;
  updatedAt?: string;
}

// Tree node for Ant Design Tree component
export interface CategoryTreeNode {
  key: string;
  title: string;
  value: string;
  children?: CategoryTreeNode[];
  isLeaf?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
}

// Create/Update
export interface CreateCategoryRequest {
  name: string;
  code?: string;
  description?: string;
  parentId?: string;
  icon?: string;
  color?: string;
  displayOrder?: number;
  isActive: boolean;
}

export type UpdateCategoryRequest = Partial<CreateCategoryRequest>;

// Filters
export interface CategoryFilters {
  search?: string;
  parentId?: string;
  isActive?: boolean;
  level?: number;
}
