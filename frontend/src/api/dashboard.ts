import { apiClient } from './client';
import type {
  DashboardMetrics,
  SalesChartData,
  PaymentChartData,
  TopCustomer,
  LowStockProduct,
  RecentInvoice,
  DashboardFilters
} from '@/types/dashboard';

export const dashboardApi = {
  // Get overall metrics
  getMetrics: (filters?: DashboardFilters) =>
    apiClient.get<DashboardMetrics>('/dashboard/metrics', { params: filters }),
  
  // Get sales chart data (last 12 months)
  getSalesChart: (filters?: DashboardFilters) =>
    apiClient.get<SalesChartData[]>('/dashboard/sales-chart', { params: filters }),
  
  // Get payment chart data
  getPaymentChart: (filters?: DashboardFilters) =>
    apiClient.get<PaymentChartData[]>('/dashboard/payment-chart', { params: filters }),
  
  // Get top customers (limit: 10)
  getTopCustomers: (filters?: DashboardFilters) =>
    apiClient.get<TopCustomer[]>('/dashboard/top-customers', { params: filters }),
  
  // Get low stock products
  getLowStockProducts: () =>
    apiClient.get<LowStockProduct[]>('/dashboard/low-stock'),
  
  // Get recent invoices (limit: 10)
  getRecentInvoices: (filters?: DashboardFilters) =>
    apiClient.get<RecentInvoice[]>('/dashboard/recent-invoices', { params: filters })
};
