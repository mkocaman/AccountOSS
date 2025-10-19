// GR Kuyruk kaydı
export interface GrQueueEntry {
  id: string;
  companyId: string;
  
  // Gayriresmi satış faturası
  unofficialInvoiceId: string;
  unofficialInvoice: {
    id: string;
    invoiceNumber: string;
    invoiceDate: string;
    customer: {
      id: string;
      name: string;
      code: string;
    };
  };
  
  entryDate: string;
  
  // Financial
  currency: string;
  originalAmount: number; // Orijinal tutar
  remainingAmount: number; // Kalan tutar (FIFO mantığı)
  
  // Status
  status: GrQueueStatus;
  
  // Clearances (aklamalar)
  clearances: GrClearanceEntry[];
  
  // Audit
  createdAt: string;
  updatedAt?: string;
}

// GR Aklama kaydı
export interface GrClearanceEntry {
  id: string;
  grQueueEntryId: string;
  
  // Resmi alış faturası
  officialInvoiceId: string;
  officialInvoice: {
    id: string;
    invoiceNumber: string;
    invoiceDate: string;
  };
  
  clearanceDate: string;
  amount: number; // Aklanan tutar
  
  // Approval
  approvedBy: string;
  approvedByUser: {
    id: string;
    firstName: string;
    lastName: string;
  };
  
  // Revert
  isReverted: boolean;
  revertedAt?: string;
  revertedBy?: string;
  revertReason?: string;
  
  createdAt: string;
}

// Enums
export enum GrQueueStatus {
  Waiting = 0,   // Bekliyor
  Partial = 1,   // Kısmi aklandı
  Cleared = 2    // Tamamen aklandı
}

export const grQueueStatusLabels: Record<GrQueueStatus, string> = {
  [GrQueueStatus.Waiting]: 'Bekliyor',
  [GrQueueStatus.Partial]: 'Kısmi',
  [GrQueueStatus.Cleared]: 'Aklandı'
};

export const grQueueStatusColors: Record<GrQueueStatus, string> = {
  [GrQueueStatus.Waiting]: 'orange',
  [GrQueueStatus.Partial]: 'blue',
  [GrQueueStatus.Cleared]: 'green'
};

// API request types
export interface ClearGrQueueRequest {
  grQueueEntryId: string;
  officialInvoiceId: string; // Resmi alış faturası
  amount: number;
  notes?: string;
}

export interface RevertGrClearanceRequest {
  clearanceId: string;
  reason: string;
}

// Filters
export interface GrQueueFilters {
  status?: GrQueueStatus;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
}

// Auto-matching suggestion
export interface GrMatchingSuggestion {
  grQueueEntryId: string;
  suggestedInvoices: {
    invoiceId: string;
    invoiceNumber: string;
    invoiceDate: string;
    amount: number;
    matchScore: number; // 0-100 (tarih yakınlığı, tutar uyumu)
  }[];
}
