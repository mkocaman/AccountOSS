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

// Stok düzeltme nedeni kodları - Düzeltme nedenlerini kategorize etmek için
export type AdjustmentReasonCode = 
  | 'count'           // Fiziksel sayım
  | 'damage'          // Hasar
  | 'theft'           // Kayıp/Çalınma
  | 'correction'      // Kayıt düzeltmesi
  | 'expiry'          // Son kullanma tarihi
  | 'other';          // Diğer

// Stok düzeltme - Manuel stok düzeltme işlemleri için
export interface StockAdjustment {
  id: string;                    // Benzersiz ID
  adjustmentNumber: string;       // Düzeltme numarası (ADJ-2024-0001)
  productId: string;             // Ürün ID'si
  productCode: string;           // Ürün kodu
  productName: string;           // Ürün adı
  warehouseId: string;           // Depo ID'si
  warehouseName: string;         // Depo adı
  currentStock: number;           // Mevcut stok (düzeltme öncesi)
  adjustedStock: number;          // Düzeltilmiş stok (düzeltme sonrası)
  difference: number;             // Fark (adjustedStock - currentStock)
  reason: string;                 // Düzeltme nedeni (metin)
  reasonCode: AdjustmentReasonCode;  // Düzeltme nedeni (kod)
  notes?: string;                 // Ek notlar (opsiyonel)
  attachments?: string[];         // Ek dosyalar (URLs) (opsiyonel)
  createdBy: string;              // Oluşturan kullanıcı
  createdAt: string;              // Oluşturma tarihi
  approvedBy?: string;            // Onaylayan kullanıcı (opsiyonel)
  approvedAt?: string;            // Onay tarihi (opsiyonel)
  rejectedBy?: string;            // Reddeden kullanıcı (opsiyonel)
  rejectedAt?: string;            // Red tarihi (opsiyonel)
  rejectionReason?: string;       // Red nedeni (opsiyonel)
  status: 'pending' | 'approved' | 'rejected'; // Düzeltme durumu
}

// Stok düzeltme oluşturma request - Yeni düzeltme oluştururken gönderilen veri
export interface CreateStockAdjustmentRequest {
  productId: string;             // Ürün ID'si
  warehouseId: string;           // Depo ID'si
  adjustedStock: number;          // Yeni stok miktarı
  reasonCode: AdjustmentReasonCode; // Düzeltme nedeni kodu
  reason: string;                 // Açıklama
  notes?: string;                 // Ek notlar (opsiyonel)
}

// Stok düzeltme onay/red request - Onaylama/reddetme işlemleri için
export interface AdjustmentActionRequest {
  notes?: string;                 // Ek notlar (opsiyonel)
}

// FIFO katmanı (maliyet katmanı) - FIFO maliyet hesaplaması için katman bilgileri
export interface FIFOLayer {
  id: string;                    // Benzersiz ID
  productId: string;             // Ürün ID'si
  productCode: string;           // Ürün kodu
  productName: string;           // Ürün adı
  warehouseId: string;           // Depo ID'si
  warehouseName: string;         // Depo adı
  quantity: number;               // Toplam miktar
  remainingQuantity: number;      // Kalan miktar
  unitCost: number;               // Birim maliyet
  totalCost: number;              // Toplam maliyet
  purchaseDate: string;           // Satın alma tarihi
  purchaseId?: string;            // Satın alma belgesi ID (opsiyonel)
  purchaseNumber?: string;        // Satın alma belgesi numarası (opsiyonel)
  expiryDate?: string;            // Son kullanma tarihi (varsa)
  batchNumber?: string;           // Parti numarası (varsa)
}

// Stok hareket detayı (genişletilmiş) - Hareket detay sayfası için genişletilmiş bilgiler
export interface StockMovementDetail extends StockMovement {
  productCategory?: string;        // Ürün kategorisi (opsiyonel)
  warehouseAddress?: string;      // Depo adresi (opsiyonel)
  approvalHistory?: {             // Onay geçmişi (opsiyonel)
    action: 'created' | 'approved' | 'rejected' | 'cancelled';
    by: string;
    at: string;
    notes?: string;
  }[];
  fifoLayers?: FIFOLayer[];       // Bu hareketten etkilenen FIFO katmanları (opsiyonel)
}

// Stok hareket istatistikleri - Hareket özet bilgileri
export interface MovementStatistics {
  totalMovements: number;         // Toplam hareket sayısı
  totalInbound: number;          // Toplam giriş sayısı
  totalOutbound: number;         // Toplam çıkış sayısı
  totalInboundValue: number;     // Toplam giriş değeri
  totalOutboundValue: number;    // Toplam çıkış değeri
  pendingApprovals: number;      // Onay bekleyen hareket sayısı
  byType: {                      // Tipe göre istatistikler
    type: StockMovementType;
    count: number;
    totalQuantity: number;
    totalValue: number;
  }[];
}
