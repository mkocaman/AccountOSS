// Dashboard API types
export interface DashboardStatistics {
  generatedAt: string;
  sales: SalesStatistics;
  purchases: PurchaseStatistics;
  payments: PaymentStatistics;
  customers: CustomerStatistics;
  stock: StockStatistics;
  recentActivities: RecentActivity[];
}

export interface SalesStatistics {
  thisMonth: number;
  lastMonth: number;
  comparison: PeriodComparison;
  invoiceCount: number;
  averageInvoiceValue: number;
  currency: string;
}

export interface PurchaseStatistics {
  thisMonth: number;
  lastMonth: number;
  comparison: PeriodComparison;
  invoiceCount: number;
  averageInvoiceValue: number;
  currency: string;
}

export interface PaymentStatistics {
  totalReceived: number;
  totalPaid: number;
  netCashFlow: number;
  pendingReceivables: number;
  overdueReceivables: number;
  currency: string;
}

export interface CustomerStatistics {
  totalCustomers: number;
  activeCustomers: number;
  newCustomersThisMonth: number;
  averageCustomerValue: number;
  currency: string;
}

export interface StockStatistics {
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalStockValue: number;
  currency: string;
}

export interface PeriodComparison {
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  description: string;
}

export interface RecentActivity {
  timestamp: string;
  activityType: string;
  description: string;
  referenceNumber: string;
  amount: number;
  currency: string;
}

// Dashboard filters
export interface DashboardFilters {
  currency?: string;
  startDate?: string;
  endDate?: string;
}