// Journal Entry
export interface JournalEntry {
  id: string;
  companyId: string;
  entryNumber: string;           // AUTO: JE-0001
  entryDate: string;
  
  // Entry Details
  description: string;
  reference?: string;             // Referans no (fatura no, fiş no, vb.)
  
  // Entry Type
  entryType: JournalEntryType;
  sourceModule?: string;          // Hangi modülden geldi? (invoice, payment, expense, etc.)
  sourceId?: string;              // Kaynak kaydın ID'si
  
  // Lines
  lines: JournalEntryLine[];
  
  // Totals
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;            // Borç = Alacak mı?
  
  // Status
  status: JournalEntryStatus;
  isPosted: boolean;              // Kesinleşti mi?
  postedDate?: string;
  postedBy?: string;
  postedByUser?: {
    name: string;
  };
  
  // Reversal (İptal/Düzeltme)
  isReversed: boolean;
  reversedBy?: string;
  reversedDate?: string;
  reversalEntryId?: string;
  
  // Audit
  createdBy?: string;
  createdByUser?: {
    name: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface JournalEntryLine {
  id: string;
  journalEntryId: string;
  lineNumber: number;
  
  // Account
  accountId: string;
  account?: {
    id: string;
    code: string;
    name: string;
    accountType: number;
  };
  
  // Amount
  debit: number;
  credit: number;
  
  // Details
  description?: string;
  reference?: string;
  
  // Dimensions (Opsiyonel - maliyet merkezi, proje, vb.)
  costCenterId?: string;
  projectId?: string;
  
  // Foreign Currency
  foreignCurrency?: string;
  foreignAmount?: number;
  exchangeRate?: number;
}

export enum JournalEntryType {
  Manual = 0,              // Manuel kayıt
  Sales = 1,               // Satış faturası
  Purchase = 2,            // Alış faturası
  Payment = 3,             // Ödeme
  Receipt = 4,             // Tahsilat
  Expense = 5,             // Masraf
  Transfer = 6,            // Virman
  Adjustment = 7,          // Düzeltme
  Opening = 8,             // Açılış kaydı
  Closing = 9              // Kapanış kaydı
}

export const journalEntryTypeLabels: Record<JournalEntryType, string> = {
  [JournalEntryType.Manual]: 'Manuel Kayıt',
  [JournalEntryType.Sales]: 'Satış',
  [JournalEntryType.Purchase]: 'Alış',
  [JournalEntryType.Payment]: 'Ödeme',
  [JournalEntryType.Receipt]: 'Tahsilat',
  [JournalEntryType.Expense]: 'Masraf',
  [JournalEntryType.Transfer]: 'Virman',
  [JournalEntryType.Adjustment]: 'Düzeltme',
  [JournalEntryType.Opening]: 'Açılış',
  [JournalEntryType.Closing]: 'Kapanış'
};

export const journalEntryTypeColors: Record<JournalEntryType, string> = {
  [JournalEntryType.Manual]: 'default',
  [JournalEntryType.Sales]: 'green',
  [JournalEntryType.Purchase]: 'red',
  [JournalEntryType.Payment]: 'orange',
  [JournalEntryType.Receipt]: 'blue',
  [JournalEntryType.Expense]: 'purple',
  [JournalEntryType.Transfer]: 'cyan',
  [JournalEntryType.Adjustment]: 'gold',
  [JournalEntryType.Opening]: 'lime',
  [JournalEntryType.Closing]: 'magenta'
};

export enum JournalEntryStatus {
  Draft = 0,               // Taslak
  Posted = 1,              // Kesinleşmiş
  Reversed = 2             // İptal Edilmiş
}

export const journalEntryStatusLabels: Record<JournalEntryStatus, string> = {
  [JournalEntryStatus.Draft]: 'Taslak',
  [JournalEntryStatus.Posted]: 'Kesinleşmiş',
  [JournalEntryStatus.Reversed]: 'İptal Edilmiş'
};

export const journalEntryStatusColors: Record<JournalEntryStatus, string> = {
  [JournalEntryStatus.Draft]: 'default',
  [JournalEntryStatus.Posted]: 'green',
  [JournalEntryStatus.Reversed]: 'red'
};

// Filters
export interface JournalEntryFilters {
  search?: string;
  entryType?: JournalEntryType;
  status?: JournalEntryStatus;
  accountId?: string;
  dateFrom?: string;
  dateTo?: string;
  isPosted?: boolean;
}

// Create/Update
export interface CreateJournalEntryRequest {
  entryDate: string;
  description: string;
  reference?: string;
  entryType: JournalEntryType;
  lines: CreateJournalEntryLineRequest[];
}

export interface CreateJournalEntryLineRequest {
  accountId: string;
  debit: number;
  credit: number;
  description?: string;
  reference?: string;
  costCenterId?: string;
  projectId?: string;
  foreignCurrency?: string;
  foreignAmount?: number;
  exchangeRate?: number;
}

export type UpdateJournalEntryRequest = Partial<CreateJournalEntryRequest>;

// Ledger (Hesap Defteri)
export interface LedgerEntry {
  date: string;
  entryNumber: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  journalEntryId: string;
}

