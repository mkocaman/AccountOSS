// Stok seviyesi durumu - Ürünün stok durumunu belirler
export type StockStatus = 'ok' | 'low' | 'critical' | 'overstock';

// Stok hareketi tipi - Hangi işlem yapıldığını belirler
export type StockMovementType = 
  | 'purchase'        // Satın alma (giriş)
  | 'sale'           // Satış (çıkış)
  | 'adjustment'     // Düzeltme
  | 'return'         // İade
  | 'transfer'       // Transfer
  | 'production'     // Üretim
  | 'damage';        // Hasar/Fire

// Stok hareketi yönü - Stok giriş mi çıkış mı
export type StockMovementDirection = 'in' | 'out';

// Stok seviyesi - Ana interface (tüm stok bilgilerini içerir)
export interface StockLevel {
  id: string;                    // Benzersiz ID
  productId: string;             // Ürün ID'si
  productCode: string;           // Ürün kodu (SKU)
  productName: string;           // Ürün adı
  categoryId?: string;           // Kategori ID'si (opsiyonel)
  categoryName?: string;         // Kategori adı (opsiyonel)
  warehouseId: string;           // Depo ID'si
  warehouseName: string;         // Depo adı
  currentStock: number;          // Mevcut stok miktarı
  reservedStock: number;         // Rezerve stok (sipariş için ayrılmış)
  availableStock: number;        // Kullanılabilir stok (current - reserved)
  minStock: number;              // Minimum stok seviyesi
  maxStock: number;              // Maximum stok seviyesi
  reorderPoint: number;          // Yeniden sipariş noktası
  unitCost: number;              // Birim maliyet (FIFO ortalaması)
  totalValue: number;            // Toplam değer (currentStock * unitCost)
  unit: string;                  // Birim (Adet, Kg, Lt, vs.)
  status: StockStatus;           // Durum (ok, low, critical, overstock)
  lastMovementDate?: string;      // Son hareket tarihi (opsiyonel)
  lastPurchaseDate?: string;     // Son alım tarihi (opsiyonel)
  lastSaleDate?: string;         // Son satış tarihi (opsiyonel)
}

// Stok seviyesi filtreleri - Arama ve filtreleme için
export interface StockLevelFilter {
  warehouseId?: string;           // Depo ID'sine göre filtrele
  categoryId?: string;           // Kategori ID'sine göre filtrele
  status?: StockStatus;          // Duruma göre filtrele
  search?: string;               // Ürün adı veya kodu arama
  minValue?: number;             // Minimum toplam değer
  maxValue?: number;             // Maximum toplam değer
}

// Stok hareketi - Stok giriş/çıkış kayıtları
export interface StockMovement {
  id: string;                    // Benzersiz ID
  movementNumber: string;        // Hareket numarası (MOV-2024-0001)
  type: StockMovementType;        // Hareket tipi
  direction: StockMovementDirection; // Giriş/çıkış yönü
  productId: string;             // Ürün ID'si
  productCode: string;           // Ürün kodu
  productName: string;           // Ürün adı
  warehouseId: string;           // Depo ID'si
  warehouseName: string;         // Depo adı
  quantity: number;              // Miktar
  unitCost: number;              // Birim maliyet
  totalCost: number;             // Toplam maliyet
  referenceType?: string;        // Referans tipi ('invoice', 'purchase', etc.)
  referenceId?: string;          // İlgili belge ID'si
  referenceNumber?: string;      // İlgili belge numarası
  notes?: string;                // Notlar (opsiyonel)
  createdBy: string;             // Oluşturan kullanıcı
  createdAt: string;            // Oluşturulma tarihi
  approvedBy?: string;           // Onaylayan kullanıcı (opsiyonel)
  approvedAt?: string;           // Onay tarihi (opsiyonel)
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'; // Hareket durumu
}

// Stok hareketi filtreleri - Hareket arama ve filtreleme için
export interface StockMovementFilter {
  warehouseId?: string;          // Depo ID'sine göre filtrele
  productId?: string;            // Ürün ID'sine göre filtrele
  type?: StockMovementType;       // Hareket tipine göre filtrele
  direction?: StockMovementDirection; // Yöne göre filtrele
  dateFrom?: string;             // Başlangıç tarihi
  dateTo?: string;               // Bitiş tarihi
  status?: StockMovement['status']; // Duruma göre filtrele
}

// Stok istatistikleri - Özet bilgiler
export interface StockStatistics {
  totalProducts: number;         // Toplam ürün sayısı
  totalQuantity: number;        // Toplam stok miktarı
  totalValue: number;           // Toplam stok değeri
  criticalItems: number;        // Kritik seviyedeki ürün sayısı
  lowItems: number;             // Düşük seviyedeki ürün sayısı
  okItems: number;              // Normal seviyedeki ürün sayısı
  overstockItems: number;       // Fazla stoklu ürün sayısı
  warehouseCount: number;      // Toplam depo sayısı
}
