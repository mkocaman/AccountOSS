// Expense Category
export interface ExpenseCategory {
  id: string;
  companyId: string;
  code: string;
  name: string;
  description?: string;
  
  // Hierarchy
  parentId?: string;
  parent?: ExpenseCategory;
  children?: ExpenseCategory[];
  level: number;
  fullPath: string;               // e.g., "Operating/Marketing/Digital"
  
  // Settings
  requiresApproval: boolean;
  maxAmountWithoutApproval?: number;
  defaultPaymentMethod?: string;
  
  // GL Integration
  chartOfAccountId?: string;
  chartOfAccount?: {
    code: string;
    name: string;
  };
  
  // Status
  isActive: boolean;
  
  // Audit
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
}

// Expense
export interface Expense {
  id: string;
  companyId: string;
  expenseNumber: string;          // AUTO: EXP-0001
  expenseDate: string;
  
  // Category
  categoryId: string;
  category?: ExpenseCategory;
  
  // Supplier (optional)
  supplierId?: string;
  supplier?: {
    id: string;
    code: string;
    name: string;
  };
  
  // Amount
  amount: number;
  currency: string;
  taxAmount: number;
  totalAmount: number;
  
  // Payment
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paidAmount: number;
  paidDate?: string;
  
  // Details
  description: string;
  notes?: string;
  invoiceNumber?: string;
  
  // Approval
  status: ExpenseStatus;
  requiresApproval: boolean;
  approvedBy?: string;
  approvedByUser?: {
    name: string;
  };
  approvedDate?: string;
  rejectionReason?: string;
  
  // Documents
  attachments?: ExpenseAttachment[];
  
  // Audit
  createdBy?: string;
  createdByUser?: {
    name: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface ExpenseAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedAt: string;
}

export enum PaymentMethod {
  Cash = 0,
  BankTransfer = 1,
  CreditCard = 2,
  Cheque = 3,
  Other = 4
}

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  [PaymentMethod.Cash]: 'Nakit',
  [PaymentMethod.BankTransfer]: 'Banka Transferi',
  [PaymentMethod.CreditCard]: 'Kredi Kartı',
  [PaymentMethod.Cheque]: 'Çek',
  [PaymentMethod.Other]: 'Diğer'
};

export enum PaymentStatus {
  Unpaid = 0,
  PartiallyPaid = 1,
  Paid = 2
}

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  [PaymentStatus.Unpaid]: 'Ödenmedi',
  [PaymentStatus.PartiallyPaid]: 'Kısmen Ödendi',
  [PaymentStatus.Paid]: 'Ödendi'
};

export const paymentStatusColors: Record<PaymentStatus, string> = {
  [PaymentStatus.Unpaid]: 'red',
  [PaymentStatus.PartiallyPaid]: 'orange',
  [PaymentStatus.Paid]: 'green'
};

export enum ExpenseStatus {
  Draft = 0,
  PendingApproval = 1,
  Approved = 2,
  Rejected = 3,
  Paid = 4
}

export const expenseStatusLabels: Record<ExpenseStatus, string> = {
  [ExpenseStatus.Draft]: 'Taslak',
  [ExpenseStatus.PendingApproval]: 'Onay Bekliyor',
  [ExpenseStatus.Approved]: 'Onaylandı',
  [ExpenseStatus.Rejected]: 'Reddedildi',
  [ExpenseStatus.Paid]: 'Ödendi'
};

export const expenseStatusColors: Record<ExpenseStatus, string> = {
  [ExpenseStatus.Draft]: 'default',
  [ExpenseStatus.PendingApproval]: 'blue',
  [ExpenseStatus.Approved]: 'green',
  [ExpenseStatus.Rejected]: 'red',
  [ExpenseStatus.Paid]: 'purple'
};

// Filters
export interface ExpenseCategoryFilters {
  search?: string;
  isActive?: boolean;
}

export interface ExpenseFilters {
  search?: string;
  categoryId?: string;
  supplierId?: string;
  status?: ExpenseStatus;
  paymentStatus?: PaymentStatus;
  dateFrom?: string;
  dateTo?: string;
}

// Create/Update
export interface CreateExpenseCategoryRequest {
  code: string;
  name: string;
  description?: string;
  parentId?: string;
  requiresApproval: boolean;
  maxAmountWithoutApproval?: number;
  defaultPaymentMethod?: string;
  chartOfAccountId?: string;
  isActive: boolean;
}

export type UpdateExpenseCategoryRequest = Partial<CreateExpenseCategoryRequest>;

export interface CreateExpenseRequest {
  expenseDate: string;
  categoryId: string;
  supplierId?: string;
  amount: number;
  currency: string;
  taxAmount: number;
  paymentMethod: PaymentMethod;
  description: string;
  notes?: string;
  invoiceNumber?: string;
}

export type UpdateExpenseRequest = Partial<CreateExpenseRequest>;

// Payment
export interface RecordPaymentRequest {
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  notes?: string;
}

