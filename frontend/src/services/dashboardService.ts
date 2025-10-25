import { apiClient } from '@/api/client';
import type {
  DashboardData,
  DashboardStatistics,
  DashboardFilter,
  SalesChartData,
  TopProduct,
  CustomerRevenue,
  CashFlowData,
  CashBalances,
  RecentActivity,
  LowStockAlert,
} from '@/types/dashboard';

// API Base endpoint
const BASE_URL = '/dashboard';

// Dashboard servisi
class DashboardService {
  // Tam dashboard verilerini getir
  async getDashboardData(filter?: DashboardFilter): Promise<DashboardData> {
    console.log('🟢🟢🟢 dashboardService.getDashboardData called with filter:', filter);
    
    try {
      const params = filter ? {
        period: filter.period,
        startDate: filter.startDate,
        endDate: filter.endDate,
      } : undefined;

      console.log('🟢 Calling API with params:', params);
      const response = await apiClient.get<DashboardData>(BASE_URL, { params });
      console.log('✅ Dashboard data from API:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Dashboard API error:', error);
      console.warn('⚠️ Falling back to MOCK data');
      
      const mockData = this.getMockDashboardData();
      console.log('🟡 Returning MOCK dashboard data:', {
        hasStatistics: !!mockData.statistics,
        salesChartLength: mockData.salesChart?.length,
        topProductsLength: mockData.topProducts?.length,
      });
      
      return mockData;
    }
  }

  // İstatistikleri getir
  async getStatistics(filter?: DashboardFilter): Promise<DashboardStatistics> {
    try {
      const params = filter ? {
        period: filter.period,
        startDate: filter.startDate,
        endDate: filter.endDate,
      } : undefined;

      const response = await apiClient.get<DashboardStatistics>(`${BASE_URL}/statistics`, { params });
      return response.data;
    } catch (error) {
      console.error('❌ Statistics load error:', error);
      return this.getMockDashboardData().statistics;
    }
  }

  // Satış grafiği verisi
  async getSalesChart(months: number = 6): Promise<SalesChartData[]> {
    try {
      const response = await apiClient.get<SalesChartData[]>(`${BASE_URL}/sales-chart`, {
        params: { months },
      });
      return response.data;
    } catch (error) {
      console.error('❌ Sales chart load error:', error);
      return this.getMockDashboardData().salesChart;
    }
  }

  // En çok satan ürünler
  async getTopProducts(limit: number = 5): Promise<TopProduct[]> {
    try {
      const response = await apiClient.get<TopProduct[]>(`${BASE_URL}/top-products`, {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      console.error('❌ Top products load error:', error);
      return this.getMockDashboardData().topProducts;
    }
  }

  // Müşteri bazlı gelir
  async getCustomerRevenue(limit: number = 5): Promise<CustomerRevenue[]> {
    try {
      const response = await apiClient.get<CustomerRevenue[]>(`${BASE_URL}/customer-revenue`, {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      console.error('❌ Customer revenue load error:', error);
      return this.getMockDashboardData().customerRevenue;
    }
  }

  // Nakit akışı
  async getCashFlow(days: number = 30): Promise<CashFlowData[]> {
    try {
      const response = await apiClient.get<CashFlowData[]>(`${BASE_URL}/cash-flow`, {
        params: { days },
      });
      return response.data;
    } catch (error) {
      console.error('❌ Cash flow load error:', error);
      return this.getMockDashboardData().cashFlow;
    }
  }

  // Kasa/Banka bakiyeleri
  async getCashBalances(): Promise<CashBalances> {
    try {
      const response = await apiClient.get<CashBalances>(`${BASE_URL}/cash-balances`);
      return response.data;
    } catch (error) {
      console.error('❌ Cash balances load error:', error);
      return this.getMockDashboardData().cashBalances;
    }
  }

  // Son aktiviteler
  async getRecentActivities(limit: number = 10): Promise<RecentActivity[]> {
    try {
      const response = await apiClient.get<RecentActivity[]>(`${BASE_URL}/recent-activities`, {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      console.error('❌ Recent activities load error:', error);
      return this.getMockDashboardData().recentActivities;
    }
  }

  // Düşük stok uyarıları
  async getLowStockAlerts(): Promise<LowStockAlert[]> {
    try {
      const response = await apiClient.get<LowStockAlert[]>(`${BASE_URL}/low-stock-alerts`);
      return response.data;
    } catch (error) {
      console.error('❌ Low stock alerts load error:', error);
      return this.getMockDashboardData().lowStockAlerts;
    }
  }

  // Mock data (backend hazır olana kadar)
  private getMockDashboardData(): DashboardData {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const lastMonths = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      return date.toISOString().slice(0, 7);
    });

    return {
      statistics: {
        totalSales: 1250000,
        totalPurchases: 850000,
        netProfit: 400000,
        profitMargin: 32,
        totalInvoices: 145,
        paidInvoices: 120,
        pendingInvoices: 20,
        overdueInvoices: 5,
        activeCustomers: 78,
        activeSuppliers: 45,
        totalProducts: 234,
        lowStockProducts: 12,
        salesChange: 15.5,
        purchasesChange: 8.2,
        profitChange: 22.3,
        invoiceChange: 12.1,
      },
      salesChart: lastMonths.map((month, index) => ({
        month,
        sales: 180000 + Math.random() * 100000,
        purchases: 120000 + Math.random() * 80000,
        profit: 60000 + Math.random() * 40000,
      })),
      topProducts: [
        { productId: '1', productName: 'Laptop Dell XPS 15', quantity: 45, revenue: 225000, category: 'Elektronik' },
        { productId: '2', productName: 'iPhone 14 Pro', quantity: 78, revenue: 195000, category: 'Telefonlar' },
        { productId: '3', productName: 'Samsung Galaxy S23', quantity: 62, revenue: 155000, category: 'Telefonlar' },
        { productId: '4', productName: 'MacBook Pro M2', quantity: 32, revenue: 128000, category: 'Bilgisayarlar' },
        { productId: '5', productName: 'iPad Air', quantity: 55, revenue: 110000, category: 'Tabletler' },
      ],
      customerRevenue: [
        { customerId: '1', customerName: 'ABC Teknoloji A.Ş.', revenue: 450000, invoiceCount: 23 },
        { customerId: '2', customerName: 'XYZ Yazılım Ltd.', revenue: 380000, invoiceCount: 18 },
        { customerId: '3', customerName: 'Mega Perakende', revenue: 290000, invoiceCount: 31 },
        { customerId: '4', customerName: 'Beta Elektronik', revenue: 225000, invoiceCount: 15 },
        { customerId: '5', customerName: 'Gamma Ticaret', revenue: 180000, invoiceCount: 12 },
      ],
      cashFlow: Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        const collections = 10000 + Math.random() * 50000;
        const payments = 8000 + Math.random() * 40000;
        return {
          date: date.toISOString().slice(0, 10),
          collections,
          payments,
          netCashFlow: collections - payments,
        };
      }),
      cashBalances: {
        cashBalance: 125000,
        bankBalance: 850000,
        totalBalance: 975000,
      },
      recentActivities: [
        {
          id: '1',
          type: 'invoice',
          action: 'created',
          description: 'SALES-2024-001 numaralı satış faturası oluşturuldu',
          amount: 25000,
          user: 'Ahmet Yılmaz',
          date: new Date().toISOString(),
          referenceId: 'SALES-2024-001',
        },
        {
          id: '2',
          type: 'payment',
          action: 'created',
          description: 'ABC Teknoloji A.Ş. müşterisinden 15.000 TL tahsilat yapıldı',
          amount: 15000,
          user: 'Mehmet Demir',
          date: new Date(Date.now() - 3600000).toISOString(),
          referenceId: 'PAY-2024-045',
        },
        {
          id: '3',
          type: 'customer',
          action: 'created',
          description: 'Yeni müşteri eklendi: Delta Lojistik',
          user: 'Ayşe Kaya',
          date: new Date(Date.now() - 7200000).toISOString(),
          referenceId: 'C-0089',
        },
        {
          id: '4',
          type: 'product',
          action: 'updated',
          description: 'Laptop Dell XPS 15 ürünü güncellendi',
          user: 'Fatma Şahin',
          date: new Date(Date.now() - 10800000).toISOString(),
          referenceId: 'P-1234',
        },
        {
          id: '5',
          type: 'invoice',
          action: 'paid',
          description: 'SALES-2024-002 numaralı fatura ödendi',
          amount: 32000,
          user: 'System',
          date: new Date(Date.now() - 14400000).toISOString(),
          referenceId: 'SALES-2024-002',
        },
      ],
      lowStockAlerts: [
        {
          productId: '1',
          productName: 'iPhone 14 Pro 128GB',
          currentStock: 5,
          minStock: 20,
          unit: 'Adet',
          status: 'critical',
          lastOrderDate: '2024-01-15',
        },
        {
          productId: '2',
          productName: 'Samsung SSD 1TB',
          currentStock: 12,
          minStock: 30,
          unit: 'Adet',
          status: 'low',
        },
        {
          productId: '3',
          productName: 'Logitech Mouse MX Master',
          currentStock: 22,
          minStock: 40,
          unit: 'Adet',
          status: 'warning',
        },
      ],
    };
  }
}

export const dashboardService = new DashboardService();
