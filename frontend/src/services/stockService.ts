import { apiClient } from '@/api/client';
import type {
  StockLevel,
  StockMovement,
  StockLevelFilter,
  StockMovementFilter,
  StockStatistics,
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
   * Mock stok hareketleri verisi
   * Mock data for stock movements
   */
  private getMockStockMovements(_filter?: StockMovementFilter): StockMovement[] {
    console.log('📦 Using MOCK stock movements data');

    return [
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
    ];
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
}

export const stockService = new StockService();