import { apiClient } from './client';
import type {
  SalesReportItem,
  SalesReportSummary,
  PaymentReportItem,
  PaymentReportSummary,
  StockReportItem,
  StockReportSummary,
  GrBalanceReportItem,
  GrBalanceReportSummary,
  ProfitLossReportItem,
  ProfitLossReportSummary,
  ReportFilters,
  ExportReportRequest
} from '@/types/report';

export const reportsApi = {
  // Sales report
  getSalesReport: (filters: ReportFilters) =>
    apiClient.get<{
      items: SalesReportItem[];
      summary: SalesReportSummary;
    }>('/reports/sales', { params: filters }),

  // Payment report
  getPaymentReport: (filters: ReportFilters) =>
    apiClient.get<{
      items: PaymentReportItem[];
      summary: PaymentReportSummary;
    }>('/reports/payments', { params: filters }),

  // Stock report
  getStockReport: (filters?: ReportFilters) =>
    apiClient.get<{
      items: StockReportItem[];
      summary: StockReportSummary;
    }>('/reports/stock', { params: filters }),

  // GR Balance report
  getGrBalanceReport: (filters?: ReportFilters) =>
    apiClient.get<{
      items: GrBalanceReportItem[];
      summary: GrBalanceReportSummary;
    }>('/reports/gr-balance', { params: filters }),

  // Profit/Loss report
  getProfitLossReport: (filters: ReportFilters) =>
    apiClient.get<{
      items: ProfitLossReportItem[];
      summary: ProfitLossReportSummary;
    }>('/reports/profit-loss', { params: filters }),

  // Export to Excel
  exportReport: async (data: ExportReportRequest) => {
    const response = await apiClient.post('/reports/export', data, {
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${data.reportType}-${Date.now()}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
};
