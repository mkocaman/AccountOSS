// Dashboard İstatistik Türleri
export interface DashboardStatistics {
  totalSales: number;
  totalPurchases: number;
  netProfit: number;
  profitMargin: number;
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
  activeCustomers: number;
  activeSuppliers: number;
  totalProducts: number;
  lowStockProducts: number;
  
  // Önceki dönem karşılaştırması
  salesChange: number; // Yüzde değişim
  purchasesChange: number;
  profitChange: number;
  invoiceChange: number;
}

// Grafik Verileri
export interface SalesChartData {
  month: string; // "2024-01", "2024-02"
  sales: number;
  purchases: number;
  profit: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  quantity: number;
  revenue: number;
  category: string;
}

export interface CustomerRevenue {
  customerId: string;
  customerName: string;
  revenue: number;
  invoiceCount: number;
}

// Nakit Akışı
export interface CashFlowData {
  date: string;
  collections: number; // Tahsilatlar
  payments: number; // Ödemeler
  netCashFlow: number;
}

export interface CashBalances {
  cashBalance: number; // Kasa bakiyesi
  bankBalance: number; // Banka bakiyesi
  totalBalance: number;
}

// Son Aktiviteler
export interface RecentActivity {
  id: string;
  type: 'invoice' | 'payment' | 'customer' | 'product' | 'stock';
  action: 'created' | 'updated' | 'deleted' | 'paid';
  description: string;
  amount?: number;
  user: string;
  date: string;
  referenceId?: string;
}

// Düşük Stok Uyarıları
export interface LowStockAlert {
  productId: string;
  productName: string;
  currentStock: number;
  minStock: number;
  unit: string;
  status: 'critical' | 'low' | 'warning'; // critical: <25%, low: <50%, warning: <75%
  lastOrderDate?: string;
}

// Dashboard Filtre
export interface DashboardFilter {
  period: 'today' | 'thisWeek' | 'thisMonth' | 'thisQuarter' | 'thisYear' | 'custom';
  startDate?: string;
  endDate?: string;
}

// Tam Dashboard Verisi
export interface DashboardData {
  statistics: DashboardStatistics;
  salesChart: SalesChartData[];
  topProducts: TopProduct[];
  customerRevenue: CustomerRevenue[];
  cashFlow: CashFlowData[];
  cashBalances: CashBalances;
  recentActivities: RecentActivity[];
  lowStockAlerts: LowStockAlert[];
}