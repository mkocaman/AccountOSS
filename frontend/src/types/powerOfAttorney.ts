// Power of Attorney
export interface PowerOfAttorney {
  id: string;
  companyId: string;
  poaNumber: string;            // AUTO: POA-0001
  issueDate: string;
  expiryDate: string;
  
  // Contract Reference
  contractId: string;
  contract?: {
    id: string;
    contractNumber: string;
    title: string;
  };
  
  // Customer
  customerId: string;
  customer?: {
    id: string;
    code: string;
    name: string;
  };
  
  // POA Details
  grantorName: string;          // Vekalet veren
  attorneyName: string;         // Vekil
  scope: string;                // Kapsam/Yetki
  limitations?: string;         // Sınırlamalar
  
  // Status
  status: PoaStatus;
  
  // Usage Tracking
  usageCount: number;           // Kaç kez kullanıldı
  lastUsedDate?: string;
  
  // Documents
  documentUrl?: string;
  
  // Notes
  notes?: string;
  
  // Audit
  createdBy?: string;
  createdByUser?: {
    name: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export enum PoaStatus {
  Draft = 0,          // Taslak
  Active = 1,         // Aktif
  Expired = 2,        // Süresi Doldu
  Revoked = 3         // İptal Edildi
}

export const poaStatusLabels: Record<PoaStatus, string> = {
  [PoaStatus.Draft]: 'Taslak',
  [PoaStatus.Active]: 'Aktif',
  [PoaStatus.Expired]: 'Süresi Doldu',
  [PoaStatus.Revoked]: 'İptal Edildi'
};

export const poaStatusColors: Record<PoaStatus, string> = {
  [PoaStatus.Draft]: 'default',
  [PoaStatus.Active]: 'green',
  [PoaStatus.Expired]: 'orange',
  [PoaStatus.Revoked]: 'red'
};

// Filters
export interface PoaFilters {
  search?: string;
  customerId?: string;
  contractId?: string;
  status?: PoaStatus;
  dateFrom?: string;
  dateTo?: string;
}

// Create/Update
export interface CreatePoaRequest {
  issueDate: string;
  expiryDate: string;
  contractId: string;
  customerId: string;
  grantorName: string;
  attorneyName: string;
  scope: string;
  limitations?: string;
  notes?: string;
}

export type UpdatePoaRequest = Partial<CreatePoaRequest>;

