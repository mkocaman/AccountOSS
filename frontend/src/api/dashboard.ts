import { apiClient } from './client';
import { DashboardStatistics, DashboardFilters } from '@/types/dashboard';

export const dashboardApi = {
  // Dashboard istatistiklerini getir
  getStatistics: (filters?: DashboardFilters) =>
    apiClient.get<DashboardStatistics>('/reports/dashboard', { 
      params: filters 
    }),

  // Satış raporu
  getSalesReport: (filters: {
    startDate: string;
    endDate: string;
    customerId?: string;
    productId?: string;
    currency?: string;
    includeComparison?: boolean;
  }) =>
    apiClient.get('/reports/sales', { params: filters }),

  // Alış raporu
  getPurchaseReport: (filters: {
    startDate: string;
    endDate: string;
    supplierId?: string;
    productId?: string;
    currency?: string;
    includeComparison?: boolean;
  }) =>
    apiClient.get('/reports/purchases', { params: filters }),

  // Stok raporu
  getStockReport: (filters: {
    startDate: string;
    endDate: string;
    productId?: string;
    categoryId?: string;
    currency?: string;
  }) =>
    apiClient.get('/reports/stock', { params: filters }),

  // Müşteri bakiyeleri
  getCustomerBalances: (filters: {
    startDate: string;
    endDate: string;
    customerId?: string;
    currency?: string;
  }) =>
    apiClient.get('/reports/customer-balances', { params: filters }),

  // Kar/Zarar raporu
  getProfitLossReport: (filters: {
    startDate: string;
    endDate: string;
    currency?: string;
  }) =>
    apiClient.get('/reports/profit-loss', { params: filters }),
};