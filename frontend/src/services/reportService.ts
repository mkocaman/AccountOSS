import client from '@/utils/client';
import { buildQueryString } from '@/utils/api-helpers';

/**
 * Rapor servisi
 * PDF ve Excel export işlemleri
 */

export type ReportType = 
  | 'sales' 
  | 'purchases' 
  | 'profit_loss' 
  | 'partner_aging' 
  | 'stock_valuation'
  | 'tax';

export type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
export type ExportFormat = 'pdf' | 'excel' | 'csv';

export interface ReportFilters {
  reportType: ReportType;
  period?: ReportPeriod;
  startDate?: string;
  endDate?: string;
  partnerId?: string;
  productId?: string;
  categoryId?: string;
}

export interface SalesReport {
  period: string;
  totalSales: number;
  totalQuantity: number;
  averageOrderValue: number;
  topProducts: Array<{
    productId: string;
    productName: string;
    quantity: number;
    revenue: number;
  }>;
  topPartners: Array<{
    partnerId: string;
    partnerName: string;
    totalSales: number;
    invoiceCount: number;
  }>;
  salesByDay: Array<{
    date: string;
    sales: number;
    invoiceCount: number;
  }>;
}

export interface ProfitLossReport {
  period: string;
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  grossProfitMargin: number;
  operatingExpenses: number;
  netProfit: number;
  netProfitMargin: number;
  breakdown: Array<{
    category: string;
    revenue: number;
    cost: number;
    profit: number;
    margin: number;
  }>;
}

export interface PartnerAgingReport {
  partnerId: string;
  partnerName: string;
  totalBalance: number;
  current: number; // 0-30 gün
  days30: number; // 31-60 gün
  days60: number; // 61-90 gün
  days90Plus: number; // 90+ gün
  overdueAmount: number;
  creditLimit?: number;
}

export interface StockValuationReport {
  totalValue: number;
  totalQuantity: number;
  items: Array<{
    productId: string;
    productCode: string;
    productName: string;
    quantity: number;
    averageCost: number;
    fifoCost: number;
    totalValue: number;
  }>;
}

export interface TaxReport {
  period: string;
  totalSales: number;
  totalPurchases: number;
  taxCollected: number; // Tahsil edilen KDV
  taxPaid: number; // Ödenen KDV
  netTax: number; // Ödenecek/İade alınacak
  breakdown: Array<{
    taxRate: number;
    salesAmount: number;
    purchaseAmount: number;
    taxAmount: number;
  }>;
}

export const reportService = {
  /**
   * Satış raporu
   */
  getSalesReport: async (filters: ReportFilters): Promise<SalesReport> => {
    const queryString = buildQueryString(filters);
    const response = await client.get(`/reports/sales${queryString}`);
    return response.data;
  },

  /**
   * Kâr/Zarar raporu
   */
  getProfitLossReport: async (filters: ReportFilters): Promise<ProfitLossReport> => {
    const queryString = buildQueryString(filters);
    const response = await client.get(`/reports/profit-loss${queryString}`);
    return response.data;
  },

  /**
   * Cari yaşlandırma raporu
   */
  getPartnerAgingReport: async (filters: Partial<ReportFilters>): Promise<PartnerAgingReport[]> => {
    const queryString = buildQueryString(filters);
    const response = await client.get(`/reports/partner-aging${queryString}`);
    return response.data;
  },

  /**
   * Stok değerleme raporu
   */
  getStockValuationReport: async (): Promise<StockValuationReport> => {
    const response = await client.get('/reports/stock-valuation');
    return response.data;
  },

  /**
   * Vergi raporu
   */
  getTaxReport: async (filters: ReportFilters): Promise<TaxReport> => {
    const queryString = buildQueryString(filters);
    const response = await client.get(`/reports/tax${queryString}`);
    return response.data;
  },

  /**
   * Rapor export (PDF/Excel)
   */
  exportReport: async (
    reportType: ReportType,
    format: ExportFormat,
    filters: ReportFilters
  ): Promise<Blob> => {
    const queryString = buildQueryString({ ...filters, format });
    const response = await client.get(`/reports/${reportType}/export${queryString}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * Fatura PDF indir
   */
  downloadInvoicePdf: async (invoiceId: string): Promise<Blob> => {
    const response = await client.get(`/invoices/${invoiceId}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * Liste export (Excel/CSV)
   */
  exportList: async (
    entityType: 'partners' | 'products' | 'invoices' | 'payments',
    format: 'excel' | 'csv',
    filters?: any
  ): Promise<Blob> => {
    const queryString = buildQueryString({ ...filters, format });
    const response = await client.get(`/${entityType}/export${queryString}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * Toplu export (seçili kayıtlar)
   */
  exportSelected: async (
    entityType: 'partners' | 'products' | 'invoices' | 'payments',
    ids: string[],
    format: ExportFormat
  ): Promise<Blob> => {
    const response = await client.post(
      `/${entityType}/export-selected`,
      { ids, format },
      { responseType: 'blob' }
    );
    return response.data;
  }
};
