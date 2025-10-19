// Company Settings
export interface CompanySettings {
  id: string;
  companyId: string;
  
  // General Settings
  baseCurrency: string;
  defaultLanguage: string;
  timeZone: string;
  dateFormat: string;
  
  // Feature Flags
  features: FeatureFlags;
  
  // Invoice Settings
  invoiceSettings: InvoiceSettings;
  
  // White-label
  whiteLabel: WhiteLabelSettings;
  
  // Notification Settings
  notificationSettings: NotificationSettings;
  
  updatedAt: string;
}

// Feature Flags
export interface FeatureFlags {
  grSystemEnabled: boolean;           // GR Kuyruk sistemi
  multiWarehouseEnabled: boolean;     // Çoklu depo
  advancedReportsEnabled: boolean;    // Gelişmiş raporlar
  apiAccessEnabled: boolean;          // API erişimi
  twoFactorAuthRequired: boolean;     // 2FA zorunlu
  emailNotificationsEnabled: boolean; // Email bildirimleri
  smsNotificationsEnabled: boolean;   // SMS bildirimleri
  contractSystemEnabled: boolean;     // Sözleşme sistemi (Özbekistan)
  powerOfAttorneyRequired: boolean;   // Vekalet zorunlu (Özbekistan)
}

// Invoice Settings
export interface InvoiceSettings {
  autoNumbering: boolean;             // Otomatik numaralama
  numberPrefix: string;               // Ön ek (INV-)
  numberFormat: string;               // Format (YYYY/0000)
  startingNumber: number;             // Başlangıç numarası
  
  defaultVatRate: number;             // Varsayılan KDV oranı
  defaultCurrency: string;            // Varsayılan para birimi
  
  requireCustomerTaxNumber: boolean;  // Vergi no zorunlu
  requireProductCode: boolean;        // Ürün kodu zorunlu
  
  allowEditAfterIssued: boolean;      // Kesilmiş fatura düzenlenebilir
  allowDeleteAfterIssued: boolean;    // Kesilmiş fatura silinebilir
  
  pdfTemplate: string;                // PDF şablonu (default, modern, classic)
  logoOnInvoice: boolean;             // Faturada logo göster
}

// White-label Settings
export interface WhiteLabelSettings {
  companyName: string;
  logoUrl?: string;
  faviconUrl?: string;
  
  primaryColor: string;               // Ana renk (#1890ff)
  secondaryColor: string;             // İkincil renk (#52c41a)
  accentColor: string;                // Vurgu rengi (#faad14)
  
  loginBackgroundUrl?: string;
  loginBackgroundColor: string;
  
  customCss?: string;                 // Özel CSS
}

// Notification Settings
export interface NotificationSettings {
  emailNotifications: {
    invoiceCreated: boolean;
    paymentReceived: boolean;
    lowStock: boolean;
    grQueueAlert: boolean;
  };
  
  inAppNotifications: {
    invoiceCreated: boolean;
    paymentReceived: boolean;
    lowStock: boolean;
    grQueueAlert: boolean;
  };
  
  notificationEmail?: string;         // Bildirim email adresi
  dailyDigest: boolean;               // Günlük özet
  weeklyReport: boolean;              // Haftalık rapor
}

// User Preferences
export interface UserPreferences {
  userId: string;
  
  theme: 'light' | 'dark' | 'auto';
  language: string;
  currency: string;
  
  dashboardLayout: 'default' | 'compact' | 'detailed';
  tablePageSize: number;
  
  notifications: {
    desktop: boolean;
    email: boolean;
    sound: boolean;
  };
  
  updatedAt: string;
}

// Update requests
export interface UpdateCompanySettingsRequest {
  baseCurrency?: string;
  defaultLanguage?: string;
  timeZone?: string;
  dateFormat?: string;
  features?: Partial<FeatureFlags>;
  invoiceSettings?: Partial<InvoiceSettings>;
  whiteLabel?: Partial<WhiteLabelSettings>;
  notificationSettings?: Partial<NotificationSettings>;
}

export interface UpdateUserPreferencesRequest {
  theme?: 'light' | 'dark' | 'auto';
  language?: string;
  currency?: string;
  dashboardLayout?: 'default' | 'compact' | 'detailed';
  tablePageSize?: number;
  notifications?: {
    desktop?: boolean;
    email?: boolean;
    sound?: boolean;
  };
}
