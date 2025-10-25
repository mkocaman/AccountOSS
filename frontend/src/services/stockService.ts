import { apiClient } from '@/api/client';
import type {
  StockLevel,
  StockMovement,
  StockLevelFilter,
  StockMovementFilter,
  StockStatistics,
  StockAdjustment,
  CreateStockAdjustmentRequest,
  AdjustmentActionRequest,
  StockMovementDetail,
  MovementStatistics,
  FIFOLayer,
} from '@/types/stock';

const BASE_URL = '/stock';

class StockService {
  // ============================================
  // STOCK LEVELS - Stok Seviyeleri
  // ============================================

  /**
   * Tüm stok seviyelerini getir
   * Get all stock levels with optional filters
   */
  async getStockLevels(filter?: StockLevelFilter): Promise<StockLevel[]> {
    try {
      console.log('🔍 Fetching stock levels with filter:', filter);
      
      const params = filter ? { ...filter } : undefined;
      const response = await apiClient.get<StockLevel[]>(`${BASE_URL}/levels`, { params });
      
      console.log('✅ Stock levels fetched:', response.data.length);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching stock levels:', error);
      console.warn('⚠️ Falling back to MOCK stock levels data');
      return this.getMockStockLevels(filter);
    }
  }

  /**
   * Belirli bir ürünün stok seviyesini getir
   * Get stock level for a specific product
   */
  async getStockLevelByProduct(
    productId: string,
    warehouseId?: string
  ): Promise<StockLevel | null> {
    try {
      const params = warehouseId ? { warehouseId } : undefined;
      const response = await apiClient.get<StockLevel>(
        `${BASE_URL}/levels/product/${productId}`,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching stock level for product:', error);
      return null;
    }
  }

  /**
   * Stok istatistiklerini getir
   * Get stock statistics summary
   */
  async getStockStatistics(filter?: StockLevelFilter): Promise<StockStatistics> {
    try {
      const params = filter ? { ...filter } : undefined;
      const response = await apiClient.get<StockStatistics>(
        `${BASE_URL}/statistics`,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching statistics:', error);
      return this.getMockStatistics();
    }
  }

  // ============================================
  // STOCK MOVEMENTS - Stok Hareketleri
  // ============================================

  /**
   * Stok hareketlerini getir
   * Get stock movements with filters
   */
  async getStockMovements(filter?: StockMovementFilter): Promise<StockMovement[]> {
    try {
      const params = filter ? { ...filter } : undefined;
      const response = await apiClient.get<StockMovement[]>(
        `${BASE_URL}/movements`,
        { params }
      );
      console.log('✅ Stock movements fetched:', response.data.length);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching stock movements:', error);
      console.warn('⚠️ Falling back to MOCK movements data');
      return this.getMockStockMovements(filter);
    }
  }

  // ============================================
  // MOCK DATA - Development Mode
  // ============================================

  /**
   * Mock stok seviyeleri verisi
   * Mock data for stock levels (used when API is not available)
   */
  private getMockStockLevels(filter?: StockLevelFilter): StockLevel[] {
    console.log('📦 Using MOCK stock levels data');

    const mockData: StockLevel[] = [
      {
        id: '1',
        productId: 'PROD-001',
        productCode: 'LAP-DELL-001',
        productName: 'Laptop Dell XPS 15',
        categoryId: 'CAT-001',
        categoryName: 'Laptop',
        warehouseId: 'WH-001',
        warehouseName: 'Ana Depo',
        currentStock: 15,
        reservedStock: 3,
        availableStock: 12,
        minStock: 10,
        maxStock: 50,
        reorderPoint: 15,
        unitCost: 25000,
        totalValue: 375000,
        unit: 'Adet',
        status: 'ok',
        lastMovementDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        lastPurchaseDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        lastSaleDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '2',
        productId: 'PROD-002',
        productCode: 'PHN-IPH14-001',
        productName: 'iPhone 14 Pro 256GB',
        categoryId: 'CAT-002',
        categoryName: 'Telefon',
        warehouseId: 'WH-001',
        warehouseName: 'Ana Depo',
        currentStock: 8,
        reservedStock: 2,
        availableStock: 6,
        minStock: 20,
        maxStock: 100,
        reorderPoint: 25,
        unitCost: 35000,
        totalValue: 280000,
        unit: 'Adet',
        status: 'critical',
        lastMovementDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        lastPurchaseDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        lastSaleDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '3',
        productId: 'PROD-003',
        productCode: 'PHN-SAM-001',
        productName: 'Samsung Galaxy S23 Ultra',
        categoryId: 'CAT-002',
        categoryName: 'Telefon',
        warehouseId: 'WH-001',
        warehouseName: 'Ana Depo',
        currentStock: 22,
        reservedStock: 5,
        availableStock: 17,
        minStock: 15,
        maxStock: 60,
        reorderPoint: 20,
        unitCost: 32000,
        totalValue: 704000,
        unit: 'Adet',
        status: 'low',
        lastMovementDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        lastPurchaseDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        lastSaleDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '4',
        productId: 'PROD-004',
        productCode: 'LAP-HP-001',
        productName: 'HP Pavilion Gaming',
        categoryId: 'CAT-001',
        categoryName: 'Laptop',
        warehouseId: 'WH-002',
        warehouseName: 'Şube Depo',
        currentStock: 45,
        reservedStock: 8,
        availableStock: 37,
        minStock: 10,
        maxStock: 40,
        reorderPoint: 15,
        unitCost: 18000,
        totalValue: 810000,
        unit: 'Adet',
        status: 'overstock',
        lastMovementDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        lastPurchaseDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        lastSaleDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '5',
        productId: 'PROD-005',
        productCode: 'TAB-IPAD-001',
        productName: 'iPad Pro 12.9" M2',
        categoryId: 'CAT-003',
        categoryName: 'Tablet',
        warehouseId: 'WH-001',
        warehouseName: 'Ana Depo',
        currentStock: 30,
        reservedStock: 4,
        availableStock: 26,
        minStock: 15,
        maxStock: 50,
        reorderPoint: 20,
        unitCost: 28000,
        totalValue: 840000,
        unit: 'Adet',
        status: 'ok',
        lastMovementDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        lastPurchaseDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        lastSaleDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '6',
        productId: 'PROD-006',
        productCode: 'MON-LG-001',
        productName: 'LG UltraWide 34" Monitor',
        categoryId: 'CAT-004',
        categoryName: 'Monitör',
        warehouseId: 'WH-001',
        warehouseName: 'Ana Depo',
        currentStock: 12,
        reservedStock: 2,
        availableStock: 10,
        minStock: 8,
        maxStock: 30,
        reorderPoint: 12,
        unitCost: 12000,
        totalValue: 144000,
        unit: 'Adet',
        status: 'ok',
        lastMovementDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        lastPurchaseDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        lastSaleDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '7',
        productId: 'PROD-007',
        productCode: 'KEY-LOG-001',
        productName: 'Logitech MX Keys Keyboard',
        categoryId: 'CAT-005',
        categoryName: 'Aksesuar',
        warehouseId: 'WH-002',
        warehouseName: 'Şube Depo',
        currentStock: 5,
        reservedStock: 1,
        availableStock: 4,
        minStock: 15,
        maxStock: 50,
        reorderPoint: 20,
        unitCost: 2500,
        totalValue: 12500,
        unit: 'Adet',
        status: 'critical',
        lastMovementDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        lastPurchaseDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        lastSaleDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '8',
        productId: 'PROD-008',
        productCode: 'MOU-LOG-001',
        productName: 'Logitech MX Master 3S Mouse',
        categoryId: 'CAT-005',
        categoryName: 'Aksesuar',
        warehouseId: 'WH-001',
        warehouseName: 'Ana Depo',
        currentStock: 18,
        reservedStock: 3,
        availableStock: 15,
        minStock: 12,
        maxStock: 40,
        reorderPoint: 16,
        unitCost: 2000,
        totalValue: 36000,
        unit: 'Adet',
        status: 'ok',
        lastMovementDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        lastPurchaseDate: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
        lastSaleDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    // Filtreleri uygula
    let filtered = [...mockData];

    if (filter?.warehouseId) {
      filtered = filtered.filter((item) => item.warehouseId === filter.warehouseId);
    }

    if (filter?.categoryId) {
      filtered = filtered.filter((item) => item.categoryId === filter.categoryId);
    }

    if (filter?.status) {
      filtered = filtered.filter((item) => item.status === filter.status);
    }

    if (filter?.search) {
      const search = filter.search.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.productName.toLowerCase().includes(search) ||
          item.productCode.toLowerCase().includes(search)
      );
    }

    console.log(`📦 Returning ${filtered.length} mock stock levels`);
    return filtered;
  }


  /**
   * Mock istatistik verisi
   * Mock statistics data
   */
  private getMockStatistics(): StockStatistics {
    return {
      totalProducts: 8,
      totalQuantity: 155,
      totalValue: 2401500,
      criticalItems: 2,
      lowItems: 1,
      okItems: 4,
      overstockItems: 1,
      warehouseCount: 2,
    };
  }

  // ============================================
  // STOCK ADJUSTMENTS - Stok Düzeltmeleri
  // ============================================

  /**
   * Stok düzeltmeleri listesi
   * Get all stock adjustments with filters
   */
  async getStockAdjustments(filter?: StockMovementFilter): Promise<StockAdjustment[]> {
    try {
      const params = filter ? { ...filter } : undefined;
      const response = await apiClient.get<StockAdjustment[]>(
        `${BASE_URL}/adjustments`,
        { params }
      );
      console.log('✅ Stock adjustments fetched:', response.data.length);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching adjustments:', error);
      console.warn('⚠️ Falling back to MOCK adjustments');
      return this.getMockAdjustments(filter);
    }
  }

  /**
   * Stok düzeltme detayı
   * Get adjustment detail by ID
   */
  async getStockAdjustmentById(id: string): Promise<StockAdjustment> {
    try {
      const response = await apiClient.get<StockAdjustment>(
        `${BASE_URL}/adjustments/${id}`
      );
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching adjustment:', error);
      throw error;
    }
  }

  /**
   * Yeni stok düzeltmesi oluştur
   * Create new stock adjustment
   */
  async createStockAdjustment(
    data: CreateStockAdjustmentRequest
  ): Promise<StockAdjustment> {
    try {
      console.log('📝 Creating stock adjustment:', data);
      const response = await apiClient.post<StockAdjustment>(
        `${BASE_URL}/adjustments`,
        data
      );
      console.log('✅ Stock adjustment created:', response.data.id);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating adjustment:', error);
      throw error;
    }
  }

  /**
   * Stok düzeltmesini onayla
   * Approve stock adjustment
   */
  async approveStockAdjustment(
    id: string,
    data?: AdjustmentActionRequest
  ): Promise<StockAdjustment> {
    try {
      console.log('✅ Approving stock adjustment:', id);
      const response = await apiClient.post<StockAdjustment>(
        `${BASE_URL}/adjustments/${id}/approve`,
        data
      );
      console.log('✅ Stock adjustment approved');
      return response.data;
    } catch (error) {
      console.error('❌ Error approving adjustment:', error);
      throw error;
    }
  }

  /**
   * Stok düzeltmesini reddet
   * Reject stock adjustment
   */
  async rejectStockAdjustment(
    id: string,
    reason: string
  ): Promise<StockAdjustment> {
    try {
      console.log('❌ Rejecting stock adjustment:', id);
      const response = await apiClient.post<StockAdjustment>(
        `${BASE_URL}/adjustments/${id}/reject`,
        { reason }
      );
      console.log('✅ Stock adjustment rejected');
      return response.data;
    } catch (error) {
      console.error('❌ Error rejecting adjustment:', error);
      throw error;
    }
  }

  // ============================================
  // STOCK MOVEMENT DETAIL
  // ============================================

  /**
   * Stok hareketi detayı (genişletilmiş)
   * Get detailed stock movement information
   */
  async getStockMovementDetail(id: string): Promise<StockMovementDetail> {
    try {
      const response = await apiClient.get<StockMovementDetail>(
        `${BASE_URL}/movements/${id}/detail`
      );
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching movement detail:', error);
      throw error;
    }
  }

  /**
   * Stok hareket istatistikleri
   * Get movement statistics
   */
  async getMovementStatistics(filter?: StockMovementFilter): Promise<MovementStatistics> {
    try {
      const params = filter ? { ...filter } : undefined;
      const response = await apiClient.get<MovementStatistics>(
        `${BASE_URL}/movements/statistics`,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching movement statistics:', error);
      console.warn('⚠️ Falling back to MOCK statistics');
      return this.getMockMovementStatistics();
    }
  }

  // ============================================
  // FIFO LAYERS
  // ============================================

  /**
   * Ürünün FIFO katmanlarını getir
   * Get FIFO layers for a product
   */
  async getFIFOLayers(productId: string, warehouseId?: string): Promise<FIFOLayer[]> {
    try {
      const params = warehouseId ? { warehouseId } : undefined;
      const response = await apiClient.get<FIFOLayer[]>(
        `${BASE_URL}/fifo/product/${productId}`,
        { params }
      );
      console.log('✅ FIFO layers fetched:', response.data.length);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching FIFO layers:', error);
      console.warn('⚠️ Falling back to MOCK FIFO layers');
      return this.getMockFIFOLayers(productId, warehouseId);
    }
  }

  // ============================================
  // MOCK DATA - Enhanced
  // ============================================

  /**
   * Mock stok hareketleri (genişletilmiş)
   */
  private getMockStockMovements(filter?: StockMovementFilter): StockMovement[] {
    console.log('📦 Using MOCK stock movements data');

    const allMovements: StockMovement[] = [
      {
        id: '1',
        movementNumber: 'MOV-2024-0001',
        type: 'purchase',
        direction: 'in',
        productId: 'PROD-001',
        productCode: 'LAP-DELL-001',
        productName: 'Laptop Dell XPS 15',
        warehouseId: 'WH-001',
        warehouseName: 'Ana Depo',
        quantity: 10,
        unitCost: 25000,
        totalCost: 250000,
        referenceType: 'purchase',
        referenceId: 'PUR-2024-001',
        referenceNumber: 'PUR-2024-001',
        notes: 'Aylık rutin alım',
        createdBy: 'Admin User',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        approvedBy: 'Manager',
        approvedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'approved',
      },
      {
        id: '2',
        movementNumber: 'MOV-2024-0002',
        type: 'sale',
        direction: 'out',
        productId: 'PROD-002',
        productCode: 'PHN-IPH14-001',
        productName: 'iPhone 14 Pro 256GB',
        warehouseId: 'WH-001',
        warehouseName: 'Ana Depo',
        quantity: 5,
        unitCost: 35000,
        totalCost: 175000,
        referenceType: 'invoice',
        referenceId: 'INV-2024-045',
        referenceNumber: 'SALES-2024-045',
        notes: 'Kurumsal satış',
        createdBy: 'Sales Team',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        approvedBy: 'Sales Manager',
        approvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'approved',
      },
      {
        id: '3',
        movementNumber: 'MOV-2024-0003',
        type: 'adjustment',
        direction: 'in',
        productId: 'PROD-003',
        productCode: 'PHN-SAM-001',
        productName: 'Samsung Galaxy S23 Ultra',
        warehouseId: 'WH-001',
        warehouseName: 'Ana Depo',
        quantity: 2,
        unitCost: 32000,
        totalCost: 64000,
        notes: 'Sayım sonrası düzeltme',
        createdBy: 'Warehouse Manager',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        approvedBy: 'Finance Manager',
        approvedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'approved',
      },
      {
        id: '4',
        movementNumber: 'MOV-2024-0004',
        type: 'damage',
        direction: 'out',
        productId: 'PROD-004',
        productCode: 'LAP-HP-001',
        productName: 'HP Pavilion Gaming',
        warehouseId: 'WH-002',
        warehouseName: 'Şube Depo',
        quantity: 1,
        unitCost: 18000,
        totalCost: 18000,
        notes: 'Hasarlı ürün çıkışı - ekran kırık',
        createdBy: 'Warehouse Staff',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
      },
      {
        id: '5',
        movementNumber: 'MOV-2024-0005',
        type: 'return',
        direction: 'in',
        productId: 'PROD-005',
        productCode: 'TAB-IPAD-001',
        productName: 'iPad Pro 12.9" M2',
        warehouseId: 'WH-001',
        warehouseName: 'Ana Depo',
        quantity: 1,
        unitCost: 28000,
        totalCost: 28000,
        referenceType: 'invoice',
        referenceId: 'INV-2024-038',
        referenceNumber: 'SALES-2024-038',
        notes: 'Müşteri iadesi - 14 gün içinde',
        createdBy: 'Customer Service',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        approvedBy: 'CS Manager',
        approvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'approved',
      },
      {
        id: '6',
        movementNumber: 'MOV-2024-0006',
        type: 'purchase',
        direction: 'in',
        productId: 'PROD-006',
        productCode: 'MON-LG-001',
        productName: 'LG UltraWide 34" Monitor',
        warehouseId: 'WH-001',
        warehouseName: 'Ana Depo',
        quantity: 8,
        unitCost: 12000,
        totalCost: 96000,
        referenceType: 'purchase',
        referenceId: 'PUR-2024-002',
        referenceNumber: 'PUR-2024-002',
        notes: 'Yeni stok girişi',
        createdBy: 'Purchase Team',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        approvedBy: 'Purchase Manager',
        approvedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'approved',
      },
      {
        id: '7',
        movementNumber: 'MOV-2024-0007',
        type: 'sale',
        direction: 'out',
        productId: 'PROD-007',
        productCode: 'KEY-LOG-001',
        productName: 'Logitech MX Keys Keyboard',
        warehouseId: 'WH-002',
        warehouseName: 'Şube Depo',
        quantity: 3,
        unitCost: 2500,
        totalCost: 7500,
        referenceType: 'invoice',
        referenceId: 'INV-2024-046',
        referenceNumber: 'SALES-2024-046',
        createdBy: 'Sales Team',
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        approvedBy: 'Sales Manager',
        approvedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'approved',
      },
      {
        id: '8',
        movementNumber: 'MOV-2024-0008',
        type: 'transfer',
        direction: 'out',
        productId: 'PROD-008',
        productCode: 'MOU-LOG-001',
        productName: 'Logitech MX Master 3S Mouse',
        warehouseId: 'WH-001',
        warehouseName: 'Ana Depo',
        quantity: 5,
        unitCost: 2000,
        totalCost: 10000,
        notes: 'WH-002 deposuna transfer',
        createdBy: 'Warehouse Manager',
        createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
      },
    ];

    // Filtreleri uygula
    let filtered = [...allMovements];

    if (filter?.productId) {
      filtered = filtered.filter((m) => m.productId === filter.productId);
    }

    if (filter?.warehouseId) {
      filtered = filtered.filter((m) => m.warehouseId === filter.warehouseId);
    }

    if (filter?.type) {
      filtered = filtered.filter((m) => m.type === filter.type);
    }

    if (filter?.direction) {
      filtered = filtered.filter((m) => m.direction === filter.direction);
    }

    if (filter?.status) {
      filtered = filtered.filter((m) => m.status === filter.status);
    }

    if (filter?.dateFrom) {
      filtered = filtered.filter((m) => m.createdAt >= filter.dateFrom!);
    }

    if (filter?.dateTo) {
      filtered = filtered.filter((m) => m.createdAt <= filter.dateTo!);
    }

    console.log(`📦 Returning ${filtered.length} mock stock movements`);
    return filtered;
  }

  /**
   * Mock stok düzeltmeleri
   */
  private getMockAdjustments(filter?: StockMovementFilter): StockAdjustment[] {
    console.log('📦 Using MOCK adjustments data');

    const allAdjustments: StockAdjustment[] = [
      {
        id: '1',
        adjustmentNumber: 'ADJ-2024-0001',
        productId: 'PROD-003',
        productCode: 'PHN-SAM-001',
        productName: 'Samsung Galaxy S23 Ultra',
        warehouseId: 'WH-001',
        warehouseName: 'Ana Depo',
        currentStock: 20,
        adjustedStock: 22,
        difference: 2,
        reason: 'Fiziksel sayımda 2 adet fazla bulundu',
        reasonCode: 'count',
        notes: 'Yıllık stok sayım işlemi',
        createdBy: 'Warehouse Manager',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        approvedBy: 'Finance Manager',
        approvedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'approved',
      },
      {
        id: '2',
        adjustmentNumber: 'ADJ-2024-0002',
        productId: 'PROD-001',
        productCode: 'LAP-DELL-001',
        productName: 'Laptop Dell XPS 15',
        warehouseId: 'WH-001',
        warehouseName: 'Ana Depo',
        currentStock: 16,
        adjustedStock: 15,
        difference: -1,
        reason: 'Hasarlı ürün tespit edildi',
        reasonCode: 'damage',
        notes: 'Ekran kırık - servis çıkışı yapılacak',
        createdBy: 'Quality Control',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
      },
      {
        id: '3',
        adjustmentNumber: 'ADJ-2024-0003',
        productId: 'PROD-007',
        productCode: 'KEY-LOG-001',
        productName: 'Logitech MX Keys Keyboard',
        warehouseId: 'WH-002',
        warehouseName: 'Şube Depo',
        currentStock: 8,
        adjustedStock: 5,
        difference: -3,
        reason: 'Kayıt hatası düzeltmesi - gerçek stok 5 adet',
        reasonCode: 'correction',
        notes: 'Sistemde yanlış girilmiş, düzeltildi',
        createdBy: 'Admin User',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
      },
    ];

    // Filtreleri uygula
    let filtered = [...allAdjustments];

    if (filter?.productId) {
      filtered = filtered.filter((a) => a.productId === filter.productId);
    }

    if (filter?.warehouseId) {
      filtered = filtered.filter((a) => a.warehouseId === filter.warehouseId);
    }

    if (filter?.status) {
      filtered = filtered.filter((a) => a.status === filter.status);
    }

    console.log(`📦 Returning ${filtered.length} mock adjustments`);
    return filtered;
  }

  /**
   * Mock hareket istatistikleri
   */
  private getMockMovementStatistics(): MovementStatistics {
    return {
      totalMovements: 8,
      totalInbound: 4,
      totalOutbound: 4,
      totalInboundValue: 438000,
      totalOutboundValue: 210500,
      pendingApprovals: 2,
      byType: [
        { type: 'purchase', count: 2, totalQuantity: 18, totalValue: 346000 },
        { type: 'sale', count: 2, totalQuantity: 8, totalValue: 182500 },
        { type: 'adjustment', count: 1, totalQuantity: 2, totalValue: 64000 },
        { type: 'return', count: 1, totalQuantity: 1, totalValue: 28000 },
        { type: 'damage', count: 1, totalQuantity: 1, totalValue: 18000 },
        { type: 'transfer', count: 1, totalQuantity: 5, totalValue: 10000 },
      ],
    };
  }

  /**
   * Mock FIFO katmanları
   */
  private getMockFIFOLayers(productId: string, warehouseId?: string): FIFOLayer[] {
    console.log('📦 Using MOCK FIFO layers data for product:', productId);

    // Ürüne göre farklı katmanlar döndür
    const layersByProduct: Record<string, FIFOLayer[]> = {
      'PROD-001': [
        {
          id: 'FIFO-001-1',
          productId: 'PROD-001',
          productCode: 'LAP-DELL-001',
          productName: 'Laptop Dell XPS 15',
          warehouseId: 'WH-001',
          warehouseName: 'Ana Depo',
          quantity: 10,
          remainingQuantity: 8,
          unitCost: 25000,
          totalCost: 250000,
          purchaseDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          purchaseId: 'PUR-2024-001',
          purchaseNumber: 'PUR-2024-001',
        },
        {
          id: 'FIFO-001-2',
          productId: 'PROD-001',
          productCode: 'LAP-DELL-001',
          productName: 'Laptop Dell XPS 15',
          warehouseId: 'WH-001',
          warehouseName: 'Ana Depo',
          quantity: 5,
          remainingQuantity: 5,
          unitCost: 26000,
          totalCost: 130000,
          purchaseDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          purchaseId: 'PUR-2024-005',
          purchaseNumber: 'PUR-2024-005',
        },
      ],
      'PROD-002': [
        {
          id: 'FIFO-002-1',
          productId: 'PROD-002',
          productCode: 'PHN-IPH14-001',
          productName: 'iPhone 14 Pro 256GB',
          warehouseId: 'WH-001',
          warehouseName: 'Ana Depo',
          quantity: 20,
          remainingQuantity: 8,
          unitCost: 35000,
          totalCost: 700000,
          purchaseDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          purchaseId: 'PUR-2024-003',
          purchaseNumber: 'PUR-2024-003',
        },
      ],
    };

    return layersByProduct[productId] || [];
  }
}

export const stockService = new StockService();

// Export individual functions for useStock.ts
export const getStockLevels = (filter?: StockLevelFilter) => stockService.getStockLevels(filter);
export const getStockMovements = (filter?: StockMovementFilter) => stockService.getStockMovements(filter);
export const getStockAdjustments = (filter?: any) => stockService.getStockAdjustments(filter);
export const getStockAdjustmentById = (id: string) => stockService.getStockAdjustmentById(id);
export const createStockAdjustment = (data: CreateStockAdjustmentRequest) => stockService.createStockAdjustment(data);
export const approveStockAdjustment = (id: string, data: AdjustmentActionRequest) => stockService.approveStockAdjustment(id, data);
export const rejectStockAdjustment = (id: string, data: AdjustmentActionRequest) => stockService.rejectStockAdjustment(id, data);
export const getStockMovementDetail = (id: string) => stockService.getStockMovementDetail(id);
export const getMovementStatistics = () => stockService.getMovementStatistics();
export const getFIFOLayers = (productId: string, warehouseId?: string) => stockService.getFIFOLayers(productId, warehouseId);