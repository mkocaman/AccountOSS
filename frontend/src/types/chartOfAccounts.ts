// Chart of Account
export interface ChartOfAccount {
  id: string;
  companyId: string;
  code: string;                    // Hesap kodu: 100, 100.01, 100.01.001
  name: string;
  description?: string;
  
  // Hierarchy
  parentId?: string;
  parent?: ChartOfAccount;
  children?: ChartOfAccount[];
  level: number;                   // 0: Ana hesap, 1: Alt hesap, 2: Detay hesap...
  fullPath: string;                // Örn: "100/100.01/100.01.001"
  
  // Type & Category
  accountType: AccountType;
  accountCategory: AccountCategory;
  
  // Behavior
  isGroup: boolean;                // Grup hesap mı? (altında hesaplar var)
  isActive: boolean;
  allowManualEntry: boolean;       // Manuel kayıt kabul ediyor mu?
  requiresDescription: boolean;    // Açıklama zorunlu mu?
  
  // Financial Properties
  currency?: string;               // Varsayılan para birimi
  
  // Balance
  debitBalance: number;            // Borç bakiyesi
  creditBalance: number;           // Alacak bakiyesi
  balance: number;                 // Net bakiye
  
  // Integration
  isSystemAccount: boolean;        // Sistem hesabı mı? (silinemeyen)
  linkedModule?: string;           // Hangi modülle entegre? (customers, suppliers, inventory, etc.)
  
  // Audit
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export enum AccountType {
  Assets = 1,              // Varlıklar
  Liabilities = 2,         // Borçlar
  Equity = 3,              // Sermaye/Özkaynak
  Revenue = 4,             // Gelir
  Expenses = 5,            // Gider
  CostOfSales = 6          // Satışların Maliyeti
}

export const accountTypeLabels: Record<AccountType, string> = {
  [AccountType.Assets]: 'Varlıklar',
  [AccountType.Liabilities]: 'Borçlar',
  [AccountType.Equity]: 'Sermaye',
  [AccountType.Revenue]: 'Gelir',
  [AccountType.Expenses]: 'Gider',
  [AccountType.CostOfSales]: 'Satışların Maliyeti'
};

export const accountTypeColors: Record<AccountType, string> = {
  [AccountType.Assets]: 'blue',
  [AccountType.Liabilities]: 'red',
  [AccountType.Equity]: 'purple',
  [AccountType.Revenue]: 'green',
  [AccountType.Expenses]: 'orange',
  [AccountType.CostOfSales]: 'gold'
};

export enum AccountCategory {
  // Assets (1xx)
  CurrentAssets = 11,             // Dönen Varlıklar
  FixedAssets = 12,               // Duran Varlıklar
  
  // Liabilities (2xx)
  CurrentLiabilities = 21,        // Kısa Vadeli Borçlar
  LongTermLiabilities = 22,       // Uzun Vadeli Borçlar
  
  // Equity (3xx)
  Capital = 31,                   // Sermaye
  RetainedEarnings = 32,          // Geçmiş Yıl Karları
  CurrentYearProfit = 33,         // Dönem Kar/Zarar
  
  // Revenue (4xx)
  SalesRevenue = 41,              // Satış Gelirleri
  ServiceRevenue = 42,            // Hizmet Gelirleri
  OtherRevenue = 43,              // Diğer Gelirler
  
  // Cost of Sales (5xx)
  CostOfGoods = 51,               // Satılan Malın Maliyeti
  CostOfServices = 52,            // Hizmet Maliyeti
  
  // Expenses (6xx)
  OperatingExpenses = 61,         // Faaliyet Giderleri
  AdministrativeExpenses = 62,    // Genel Yönetim Giderleri
  MarketingExpenses = 63,         // Pazarlama Giderleri
  FinancialExpenses = 64,         // Finansman Giderleri
  OtherExpenses = 65              // Diğer Giderler
}

export const accountCategoryLabels: Record<AccountCategory, string> = {
  [AccountCategory.CurrentAssets]: 'Dönen Varlıklar',
  [AccountCategory.FixedAssets]: 'Duran Varlıklar',
  [AccountCategory.CurrentLiabilities]: 'Kısa Vadeli Borçlar',
  [AccountCategory.LongTermLiabilities]: 'Uzun Vadeli Borçlar',
  [AccountCategory.Capital]: 'Sermaye',
  [AccountCategory.RetainedEarnings]: 'Geçmiş Yıl Karları',
  [AccountCategory.CurrentYearProfit]: 'Dönem Kar/Zarar',
  [AccountCategory.SalesRevenue]: 'Satış Gelirleri',
  [AccountCategory.ServiceRevenue]: 'Hizmet Gelirleri',
  [AccountCategory.OtherRevenue]: 'Diğer Gelirler',
  [AccountCategory.CostOfGoods]: 'Satılan Malın Maliyeti',
  [AccountCategory.CostOfServices]: 'Hizmet Maliyeti',
  [AccountCategory.OperatingExpenses]: 'Faaliyet Giderleri',
  [AccountCategory.AdministrativeExpenses]: 'Genel Yönetim Giderleri',
  [AccountCategory.MarketingExpenses]: 'Pazarlama Giderleri',
  [AccountCategory.FinancialExpenses]: 'Finansman Giderleri',
  [AccountCategory.OtherExpenses]: 'Diğer Giderler'
};

// Filters
export interface ChartOfAccountsFilters {
  search?: string;
  accountType?: AccountType;
  accountCategory?: AccountCategory;
  isActive?: boolean;
  isGroup?: boolean;
}

// Create/Update
export interface CreateChartOfAccountRequest {
  code: string;
  name: string;
  description?: string;
  parentId?: string;
  accountType: AccountType;
  accountCategory: AccountCategory;
  isGroup: boolean;
  isActive: boolean;
  allowManualEntry: boolean;
  requiresDescription: boolean;
  currency?: string;
  linkedModule?: string;
}

export type UpdateChartOfAccountRequest = Partial<CreateChartOfAccountRequest>;

// Account Templates (for quick setup)
export interface AccountTemplate {
  code: string;
  name: string;
  accountType: AccountType;
  accountCategory: AccountCategory;
  isGroup: boolean;
  children?: AccountTemplate[];
}

// Standard account plan template (Turkish Uniform Chart of Accounts)
export const standardAccountPlan: AccountTemplate[] = [
  {
    code: '100',
    name: 'KASA',
    accountType: AccountType.Assets,
    accountCategory: AccountCategory.CurrentAssets,
    isGroup: false
  },
  {
    code: '102',
    name: 'BANKALAR',
    accountType: AccountType.Assets,
    accountCategory: AccountCategory.CurrentAssets,
    isGroup: true,
    children: [
      { code: '102.01', name: 'Ziraat Bankası', accountType: AccountType.Assets, accountCategory: AccountCategory.CurrentAssets, isGroup: false },
      { code: '102.02', name: 'İş Bankası', accountType: AccountType.Assets, accountCategory: AccountCategory.CurrentAssets, isGroup: false }
    ]
  },
  {
    code: '120',
    name: 'ALICILAR',
    accountType: AccountType.Assets,
    accountCategory: AccountCategory.CurrentAssets,
    isGroup: false
  },
  {
    code: '153',
    name: 'TİCARİ MALLAR',
    accountType: AccountType.Assets,
    accountCategory: AccountCategory.CurrentAssets,
    isGroup: false
  },
  {
    code: '191',
    name: 'İNDİRİLECEK KDV',
    accountType: AccountType.Assets,
    accountCategory: AccountCategory.CurrentAssets,
    isGroup: false
  },
  {
    code: '253',
    name: 'TESİS, MAKİNE VE CİHAZLAR',
    accountType: AccountType.Assets,
    accountCategory: AccountCategory.FixedAssets,
    isGroup: false
  },
  {
    code: '320',
    name: 'SATICILAR',
    accountType: AccountType.Liabilities,
    accountCategory: AccountCategory.CurrentLiabilities,
    isGroup: false
  },
  {
    code: '391',
    name: 'HESAPLANAN KDV',
    accountType: AccountType.Liabilities,
    accountCategory: AccountCategory.CurrentLiabilities,
    isGroup: false
  },
  {
    code: '500',
    name: 'SERMAYE',
    accountType: AccountType.Equity,
    accountCategory: AccountCategory.Capital,
    isGroup: false
  },
  {
    code: '600',
    name: 'YURT İÇİ SATIŞLAR',
    accountType: AccountType.Revenue,
    accountCategory: AccountCategory.SalesRevenue,
    isGroup: false
  },
  {
    code: '621',
    name: 'SATILAN TİCARİ MALLAR MALİYETİ',
    accountType: AccountType.CostOfSales,
    accountCategory: AccountCategory.CostOfGoods,
    isGroup: false
  },
  {
    code: '770',
    name: 'GENEL YÖNETİM GİDERLERİ',
    accountType: AccountType.Expenses,
    accountCategory: AccountCategory.AdministrativeExpenses,
    isGroup: false
  },
  {
    code: '780',
    name: 'FİNANSMAN GİDERLERİ',
    accountType: AccountType.Expenses,
    accountCategory: AccountCategory.FinancialExpenses,
    isGroup: false
  }
];

