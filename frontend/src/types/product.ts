// Ürün tipleri
export interface Product {
  id: string;
  companyId: string;
  code: string; // Ürün kodu (AUTO: P-0001)
  barcode?: string;
  name: string; // Varsayılan dil
  type: ProductType;
  categoryId?: string;
  category?: Category;
  
  // Pricing
  purchasePrice: number; // Alış fiyatı
  salePrice: number; // Satış fiyatı
  currency: string;
  vatRate: number; // KDV oranı (18, 8, 1, 0)
  
  // Stock
  unit: string; // Birim (Adet, Kg, Litre...)
  stockQuantity: number; // Mevcut stok (hesaplanmış)
  minStockLevel: number; // Minimum stok seviyesi
  trackStock: boolean; // Stok takibi yapılsın mı?
  
  // Multi-warehouse (opsiyonel)
  defaultWarehouseId?: string;
  
  // Status
  isActive: boolean;
  isForSale: boolean; // Satışa açık mı?
  isForPurchase: boolean; // Satın alınabilir mi?
  
  // Images & Description
  imageUrl?: string;
  description?: string;
  
  // Multi-language
  translations?: ProductTranslation[];
  
  // Audit
  createdAt: string;
  updatedAt?: string;
}

export enum ProductType {
  Goods = 0, // Mal (stok takipli)
  Service = 1, // Hizmet (stok takipsiz)
}

// Multi-language ürün adları
export interface ProductTranslation {
  id: string;
  productId: string;
  languageCode: string; // TR, EN, RU...
  name: string;
  description?: string;
}

// Kategori
export interface Category {
  id: string;
  companyId: string;
  name: string;
  parentId?: string;
  description?: string;
  isActive: boolean;
}

// Create/Update için
export interface CreateProductRequest {
  name: string;
  type: ProductType;
  categoryId?: string;
  barcode?: string;
  purchasePrice: number;
  salePrice: number;
  currency: string;
  vatRate: number;
  unit: string;
  minStockLevel?: number;
  trackStock?: boolean;
  isForSale?: boolean;
  isForPurchase?: boolean;
  imageUrl?: string;
  description?: string;
}

export type UpdateProductRequest = CreateProductRequest;

// Stok birim seçenekleri
export const UNIT_OPTIONS = [
  { value: 'Adet', label: 'Adet' },
  { value: 'Kg', label: 'Kilogram (Kg)' },
  { value: 'Gr', label: 'Gram (Gr)' },
  { value: 'Lt', label: 'Litre (Lt)' },
  { value: 'ml', label: 'Mililitre (ml)' },
  { value: 'm', label: 'Metre (m)' },
  { value: 'cm', label: 'Santimetre (cm)' },
  { value: 'm²', label: 'Metrekare (m²)' },
  { value: 'm³', label: 'Metreküp (m³)' },
  { value: 'Koli', label: 'Koli' },
  { value: 'Paket', label: 'Paket' },
  { value: 'Kutu', label: 'Kutu' },
];

// KDV oranları
export const VAT_RATES = [
  { value: 20, label: '%20' },
  { value: 18, label: '%18' },
  { value: 10, label: '%10' },
  { value: 8, label: '%8' },
  { value: 1, label: '%1' },
  { value: 0, label: '%0 (İstisna)' },
];

