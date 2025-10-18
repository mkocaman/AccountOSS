// Müşteri tipleri
export interface Customer {
  id: string;
  companyId: string;
  code: string; // Müşteri kodu (AUTO: C-0001)
  name: string;
  type: CustomerType;
  
  // Contact
  email?: string;
  phone?: string;
  mobilePhone?: string;
  website?: string;
  
  // Tax Info
  taxNumber?: string;
  taxOffice?: string;
  identityNumber?: string; // TC Kimlik (bireysel için)
  
  // Address
  billingAddress?: string;
  shippingAddress?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  
  // Financial
  currency: string;
  creditLimit: number;
  paymentTermDays: number; // Vade gün sayısı
  currentBalance: number; // Güncel bakiye (Alacak/Borç)
  
  // Status
  isActive: boolean;
  isBlocked: boolean;
  blockReason?: string;
  notes?: string;
  
  // Audit
  createdAt: string;
  updatedAt?: string;
}

export enum CustomerType {
  Individual = 0, // Bireysel
  Corporate = 1,  // Kurumsal
}

// Create/Update için
export interface CreateCustomerRequest {
  name: string;
  type: CustomerType;
  email?: string;
  phone?: string;
  mobilePhone?: string;
  taxNumber?: string;
  taxOffice?: string;
  identityNumber?: string;
  billingAddress?: string;
  shippingAddress?: string;
  city?: string;
  country?: string;
  currency: string;
  creditLimit?: number;
  paymentTermDays?: number;
  notes?: string;
}

export type UpdateCustomerRequest = CreateCustomerRequest;

