import { apiClient } from './client';
import type { 
  IncomeStatement,
  BalanceSheet,
  InventoryReport,
  SalesReport,
  AgingReport,
  PurchaseReport,
  StockMovementReport
} from '@/types/report';

export const reportsApi = {
  // Financial Reports
  getIncomeStatement: (params: { startDate: string; endDate: string }) =>
    apiClient.get<IncomeStatement>('/reports/income-statement', { params }),
  
  getBalanceSheet: (params: { date: string }) =>
    apiClient.get<BalanceSheet>('/reports/balance-sheet', { params }),
  
  // Inventory Reports
  getInventoryReport: (params?: { categoryId?: string; asOfDate?: string }) =>
    apiClient.get<InventoryReport>('/reports/inventory', { params }),
  
  getStockMovementReport: (params: { startDate: string; endDate: string; productId?: string }) =>
    apiClient.get<StockMovementReport>('/reports/stock-movements', { params }),
  
  // Sales Reports
  getSalesReport: (params: { startDate: string; endDate: string; customerId?: string }) =>
    apiClient.get<SalesReport>('/reports/sales', { params }),
  
  // Purchase Reports
  getPurchaseReport: (params: { startDate: string; endDate: string; supplierId?: string }) =>
    apiClient.get<PurchaseReport>('/reports/purchases', { params }),
  
  // Aging Reports
  getReceivablesAging: (params: { asOfDate: string }) =>
    apiClient.get<AgingReport>('/reports/receivables-aging', { params }),
  
  getPayablesAging: (params: { asOfDate: string }) =>
    apiClient.get<AgingReport>('/reports/payables-aging', { params }),
  
  // Export to PDF
  exportPdf: (reportType: string, params: any) =>
    apiClient.get(`/reports/${reportType}/pdf`, { params, responseType: 'blob' }),
  
  // Export to Excel
  exportExcel: (reportType: string, params: any) =>
    apiClient.get(`/reports/${reportType}/excel`, { params, responseType: 'blob' })
};
