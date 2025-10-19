// Report Categories
export enum ReportCategory {
  Financial = 'financial',
  Inventory = 'inventory',
  Sales = 'sales',
  Purchase = 'purchase',
  Accounting = 'accounting',
  Custom = 'custom'
}

export const reportCategoryLabels: Record<ReportCategory, string> = {
  [ReportCategory.Financial]: 'Mali Raporlar',
  [ReportCategory.Inventory]: 'Stok Raporları',
  [ReportCategory.Sales]: 'Satış Raporları',
  [ReportCategory.Purchase]: 'Satın Alma Raporları',
  [ReportCategory.Accounting]: 'Muhasebe Raporları',
  [ReportCategory.Custom]: 'Özel Raporlar'
};

// Report Definitions
export interface ReportDefinition {
  id: string;
  name: string;
  description: string;
  category: ReportCategory;
  icon?: string;
  path: string;
  requiredParams?: string[];
}

// Common Report Filters
export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  customerId?: string;
  supplierId?: string;
  productId?: string;
  categoryId?: string;
  currency?: string;
}

// Income Statement (Gelir Tablosu)
export interface IncomeStatement {
  period: {
    startDate: string;
    endDate: string;
  };
  revenue: {
    salesRevenue: number;
    serviceRevenue: number;
    otherRevenue: number;
    total: number;
  };
  costOfSales: {
    costOfGoods: number;
    costOfServices: number;
    total: number;
  };
  grossProfit: number;
  expenses: {
    operating: number;
    administrative: number;
    marketing: number;
    financial: number;
    other: number;
    total: number;
  };
  netProfit: number;
  profitMargin: number;
}

// Balance Sheet (Bilanço)
export interface BalanceSheet {
  date: string;
  assets: {
    current: {
      cash: number;
      bank: number;
      accountsReceivable: number;
      inventory: number;
      other: number;
      total: number;
    };
    fixed: {
      property: number;
      equipment: number;
      other: number;
      total: number;
    };
    total: number;
  };
  liabilities: {
    current: {
      accountsPayable: number;
      shortTermDebt: number;
      other: number;
      total: number;
    };
    longTerm: {
      longTermDebt: number;
      other: number;
      total: number;
    };
    total: number;
  };
  equity: {
    capital: number;
    retainedEarnings: number;
    currentYearProfit: number;
    total: number;
  };
  totalLiabilitiesEquity: number;
}

// Inventory Report
export interface InventoryReport {
  products: InventoryReportItem[];
  summary: {
    totalProducts: number;
    totalQuantity: number;
    totalValue: number;
    averageValue: number;
  };
}

export interface InventoryReportItem {
  productId: string;
  productCode: string;
  productName: string;
  category: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalValue: number;
  lastMovementDate?: string;
}

// Sales Report
export interface SalesReport {
  period: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalSales: number;
    totalInvoices: number;
    averageInvoiceValue: number;
    topProducts: TopProductItem[];
    topCustomers: TopCustomerItem[];
  };
  monthlySales?: MonthlySalesItem[];
  salesByCategory?: CategorySalesItem[];
}

export interface TopProductItem {
  productName: string;
  quantity: number;
  revenue: number;
}

export interface TopCustomerItem {
  customerName: string;
  invoiceCount: number;
  totalRevenue: number;
}

export interface MonthlySalesItem {
  month: string;
  sales: number;
  invoiceCount: number;
}

export interface CategorySalesItem {
  category: string;
  sales: number;
  percentage: number;
}

// Aging Report (Yaşlandırma)
export interface AgingReport {
  type: 'receivable' | 'payable';
  asOfDate: string;
  items: AgingReportItem[];
  summary: {
    current: number;         // 0-30 gün
    days30to60: number;      // 30-60 gün
    days60to90: number;      // 60-90 gün
    over90: number;          // 90+ gün
    total: number;
  };
}

export interface AgingReportItem {
  partnerId: string;
  partnerCode: string;
  partnerName: string;
  current: number;
  days30to60: number;
  days60to90: number;
  over90: number;
  total: number;
}

// Purchase Report
export interface PurchaseReport {
  period: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalPurchases: number;
    totalOrders: number;
    averageOrderValue: number;
    topSuppliers: TopSupplierItem[];
  };
  monthlyPurchases?: MonthlyPurchaseItem[];
}

export interface TopSupplierItem {
  supplierName: string;
  orderCount: number;
  totalSpent: number;
}

export interface MonthlyPurchaseItem {
  month: string;
  purchases: number;
  orderCount: number;
}

// Stock Movement Report
export interface StockMovementReport {
  period: {
    startDate: string;
    endDate: string;
  };
  movements: StockMovementItem[];
  summary: {
    totalIn: number;
    totalOut: number;
    netChange: number;
  };
}

export interface StockMovementItem {
  date: string;
  productName: string;
  movementType: string;
  quantityIn: number;
  quantityOut: number;
  balance: number;
}
