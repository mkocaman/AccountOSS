// Owner Settings (Super Admin)
export interface OwnerSettings {
  id: string;
  
  // System Configuration
  systemName: string;
  systemVersion: string;
  maintenanceMode: boolean;
  allowNewRegistrations: boolean;
  
  // Company Management
  maxCompaniesPerUser: number;
  maxUsersPerCompany: number;
  
  // Subscription & Billing
  subscriptionPlans: SubscriptionPlan[];
  billingSettings: BillingSettings;
  
  // Feature Flags (Global)
  globalFeatures: GlobalFeatures;
  
  // Email Configuration
  emailSettings: EmailSettings;
  
  // Storage & Limits
  maxStoragePerCompany: number;      // GB
  maxApiCallsPerDay: number;
  
  // Security
  securitySettings: SecuritySettings;
  
  // Analytics
  analyticsEnabled: boolean;
  errorTrackingEnabled: boolean;
  
  updatedAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  maxUsers: number;
  maxStorage: number;
  isActive: boolean;
}

export interface BillingSettings {
  stripeEnabled: boolean;
  stripePublicKey?: string;
  paypalEnabled: boolean;
  manualPaymentEnabled: boolean;
  invoicePrefix: string;
  taxRate: number;
}

export interface GlobalFeatures {
  multiCurrencyEnabled: boolean;
  multiLanguageEnabled: boolean;
  apiAccessEnabled: boolean;
  webhooksEnabled: boolean;
  advancedReportsEnabled: boolean;
}

export interface EmailSettings {
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword?: string;
  senderEmail: string;
  senderName: string;
  useTLS: boolean;
}

export interface SecuritySettings {
  passwordMinLength: number;
  requireUppercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  sessionTimeout: number;          // minutes
  maxLoginAttempts: number;
  lockoutDuration: number;          // minutes
  twoFactorRequired: boolean;
}

// Company Management (Owner view)
export interface CompanyInfo {
  id: string;
  name: string;
  ownerEmail: string;
  subscriptionPlan: string;
  subscriptionStatus: 'active' | 'trial' | 'expired' | 'cancelled';
  userCount: number;
  storageUsed: number;              // GB
  createdAt: string;
  lastActiveAt: string;
  isActive: boolean;
}

// Update requests
export interface UpdateOwnerSettingsRequest {
  systemName?: string;
  maintenanceMode?: boolean;
  allowNewRegistrations?: boolean;
  maxCompaniesPerUser?: number;
  maxUsersPerCompany?: number;
  globalFeatures?: Partial<GlobalFeatures>;
  emailSettings?: Partial<EmailSettings>;
  securitySettings?: Partial<SecuritySettings>;
}

