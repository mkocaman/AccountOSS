// Report types
export enum ReportType {
  Sales = 'sales',
  Payment = 'payment',
  Stock = 'stock',
  GrBalance = 'gr-balance',
  ProfitLoss = 'profit-loss'
}

export const reportTypeLabels: Record<ReportType, string> = {
  [ReportType.Sales]: 'Satış Raporu',
  [ReportType.Payment]: 'Tahsilat/Ödeme Raporu',
  [ReportType.Stock]: 'Stok Durum Raporu',
  [ReportType.GrBalance]: 'GR Kuyruk Bakiye Raporu',
  [ReportType.ProfitLoss]: 'Kâr/Zarar Raporu'
};

// Sales report
export interface SalesReportItem {
  invoiceNumber: string;
  invoiceDate: string;
  customerName: string;
  customerCode: string;
  type: 'Sales' | 'Purchase';
  isOfficial: boolean;
  currency: string;
  subTotal: number;
  totalVat: number;
  totalDiscount: number;
  grandTotal: number;
  profitAmount?: number;
  profitMargin?: number;
}

export interface SalesReportSummary {
  totalInvoices: number;
  totalSales: number;
  totalPurchases: number;
  totalVat: number;
  totalDiscount: number;
  netSales: number;
  averageInvoiceValue: number;
}

// Payment report
export interface PaymentReportItem {
  paymentNumber: string;
  paymentDate: string;
  customerName: string;
  type: 'Receipt' | 'Payment';
  method: string;
  invoiceNumber?: string;
  amount: number;
  currency: string;
  accountName: string;
  accountType: 'Cash' | 'Bank';
}

export interface PaymentReportSummary {
  totalReceipts: number;
  totalPayments: number;
  netCashFlow: number;
  receiptsByMethod: { method: string; amount: number }[];
  paymentsByMethod: { method: string; amount: number }[];
}

// Stock report
export interface StockReportItem {
  productCode: string;
  productName: string;
  category?: string;
  currentStock: number;
  minStockLevel: number;
  unit: string;
  averageCost: number;
  totalValue: number;
  status: 'Normal' | 'Low' | 'OutOfStock';
  lastMovementDate?: string;
}

export interface StockReportSummary {
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalStockValue: number;
}

// GR Balance report
export interface GrBalanceReportItem {
  entryDate: string;
  unofficialInvoiceNumber: string;
  customerName: string;
  currency: string;
  originalAmount: number;
  clearedAmount: number;
  remainingAmount: number;
  status: 'Waiting' | 'Partial' | 'Cleared';
  clearanceCount: number;
}

export interface GrBalanceReportSummary {
  totalEntries: number;
  waitingCount: number;
  partialCount: number;
  clearedCount: number;
  totalOriginalAmount: number;
  totalClearedAmount: number;
  totalRemainingAmount: number;
}

// Profit/Loss report
export interface ProfitLossReportItem {
  period: string; // "2025-01"
  sales: number;
  salesCost: number;
  grossProfit: number;
  grossProfitMargin: number;
  expenses: number;
  netProfit: number;
  netProfitMargin: number;
}

export interface ProfitLossReportSummary {
  totalSales: number;
  totalCost: number;
  totalGrossProfit: number;
  avgGrossProfitMargin: number;
  totalExpenses: number;
  totalNetProfit: number;
  avgNetProfitMargin: number;
}

// Common filters
export interface ReportFilters {
  dateFrom?: string;
  dateTo?: string;
  customerId?: string;
  productId?: string;
  currency?: string;
  type?: string;
  status?: string;
}

// Export request
export interface ExportReportRequest {
  reportType: ReportType;
  filters: ReportFilters;
  format: 'excel' | 'pdf' | 'csv';
}
