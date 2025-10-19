import { apiClient } from './client';
import type { DashboardStatistics } from '@/types/dashboard';

// Dashboard filter types
export interface DashboardFilters {
  currency?: string;
  startDate?: string;
  endDate?: string;
}

// Export for external use
export type { DashboardFilters as DashboardApiFilters };

export const dashboardApi = {
  // Dashboard istatistiklerini getir
  getStatistics: (currency: string = 'TRY') =>
    apiClient.get<DashboardStatistics>('/reports/dashboard', { 
      params: { currency } 
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
  getStockReport: (currency: string = 'TRY', includeLowStockOnly: boolean = false) =>
    apiClient.get('/reports/stock', { 
      params: { currency, includeLowStockOnly } 
    }),

  // Müşteri bakiyeleri
  getCustomerBalances: (currency: string = 'TRY', includeAging: boolean = true) =>
    apiClient.get('/reports/customer-balances', { 
      params: { currency, includeAging } 
    }),

  // Kar/Zarar raporu
  getProfitLossReport: (filters: {
    startDate: string;
    endDate: string;
    currency?: string;
  }) =>
    apiClient.get('/reports/profit-loss', { params: filters }),
};