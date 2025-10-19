// Dashboard metrics
export interface DashboardMetrics {
  // Sales metrics
  totalSales: number;
  totalSalesAmount: number;
  monthlySalesGrowth: number; // Percentage
  
  // Payment metrics
  totalPayments: number;
  totalPaymentsAmount: number;
  monthlyPaymentsGrowth: number;
  
  // Profit metrics
  totalProfit: number;
  profitMargin: number; // Percentage
  monthlyProfitGrowth: number;
  
  // GR Queue metrics
  grQueueCount: number;
  grQueueTotalAmount: number;
  grQueueWaitingAmount: number;
  
  // Stock metrics
  lowStockProductsCount: number;
  outOfStockProductsCount: number;
  totalStockValue: number;
  
  // Customer metrics
  totalCustomers: number;
  activeCustomersThisMonth: number;
}

// Sales chart data
export interface SalesChartData {
  period: string; // "2025-01", "2025-02"
  sales: number;
  purchases: number;
  profit: number;
}

// Payment chart data
export interface PaymentChartData {
  method: string; // "Cash", "Bank", "Card"
  count: number;
  amount: number;
}

// Top customer
export interface TopCustomer {
  customerId: string;
  customerName: string;
  customerCode: string;
  totalPurchases: number;
  totalAmount: number;
  currency: string;
  lastPurchaseDate: string;
}

// Low stock product
export interface LowStockProduct {
  productId: string;
  productName: string;
  productCode: string;
  currentStock: number;
  minStockLevel: number;
  unit: string;
  lastUpdated: string;
}

// Recent invoice
export interface RecentInvoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  customerName: string;
  type: 'Sales' | 'Purchase';
  isOfficial: boolean;
  grandTotal: number;
  currency: string;
  status: string;
}

// Dashboard filters
export interface DashboardFilters {
  dateFrom?: string;
  dateTo?: string;
  customerId?: string;
  currency?: string;
}
