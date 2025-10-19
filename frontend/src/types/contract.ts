// Contract
export interface Contract {
  id: string;
  companyId: string;
  contractNumber: string;      // AUTO: CNT-0001
  contractDate: string;
  startDate: string;
  endDate: string;
  
  // Customer
  customerId: string;
  customer?: {
    id: string;
    code: string;
    name: string;
  };
  
  // Contract Details
  title: string;
  description?: string;
  contractType: ContractType;
  
  // Financial
  totalValue: number;
  currency: string;
  paymentTerms?: string;
  
  // Status
  status: ContractStatus;
  
  // Documents
  documentUrl?: string;
  signedDocumentUrl?: string;
  
  // Signatures
  isSigned: boolean;
  signedDate?: string;
  signedBy?: string;
  digitalSignature?: string;
  
  // Power of Attorney
  hasPowerOfAttorney: boolean;
  powerOfAttorneyId?: string;
  powerOfAttorney?: {
    id: string;
    poaNumber: string;
    status: string;
  };
  
  // Notes
  notes?: string;
  terms?: string;
  
  // Audit
  createdBy?: string;
  createdByUser?: {
    name: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export enum ContractType {
  Sales = 0,           // Satış Sözleşmesi
  Service = 1,         // Hizmet Sözleşmesi
  Distribution = 2,    // Distribütörlük
  Agency = 3,          // Acentelik
  Partnership = 4      // Ortaklık
}

export const contractTypeLabels: Record<ContractType, string> = {
  [ContractType.Sales]: 'Satış Sözleşmesi',
  [ContractType.Service]: 'Hizmet Sözleşmesi',
  [ContractType.Distribution]: 'Distribütörlük',
  [ContractType.Agency]: 'Acentelik',
  [ContractType.Partnership]: 'Ortaklık'
};

export enum ContractStatus {
  Draft = 0,          // Taslak
  Pending = 1,        // Onay Bekliyor
  Active = 2,         // Aktif
  Expired = 3,        // Süresi Doldu
  Terminated = 4      // Feshedildi
}

export const contractStatusLabels: Record<ContractStatus, string> = {
  [ContractStatus.Draft]: 'Taslak',
  [ContractStatus.Pending]: 'Onay Bekliyor',
  [ContractStatus.Active]: 'Aktif',
  [ContractStatus.Expired]: 'Süresi Doldu',
  [ContractStatus.Terminated]: 'Feshedildi'
};

export const contractStatusColors: Record<ContractStatus, string> = {
  [ContractStatus.Draft]: 'default',
  [ContractStatus.Pending]: 'blue',
  [ContractStatus.Active]: 'green',
  [ContractStatus.Expired]: 'orange',
  [ContractStatus.Terminated]: 'red'
};

// Filters
export interface ContractFilters {
  search?: string;
  customerId?: string;
  contractType?: ContractType;
  status?: ContractStatus;
  dateFrom?: string;
  dateTo?: string;
  isExpired?: boolean;
}

// Create/Update
export interface CreateContractRequest {
  contractDate: string;
  startDate: string;
  endDate: string;
  customerId: string;
  title: string;
  description?: string;
  contractType: ContractType;
  totalValue: number;
  currency: string;
  paymentTerms?: string;
  notes?: string;
  terms?: string;
}

export type UpdateContractRequest = Partial<CreateContractRequest>;

// Sign contract
export interface SignContractRequest {
  signedBy: string;
  digitalSignature?: string;
}

