import { apiClient } from './client';
import type { 
  ExpenseCategory,
  ExpenseCategoryFilters,
  CreateExpenseCategoryRequest,
  UpdateExpenseCategoryRequest,
  Expense,
  ExpenseFilters,
  CreateExpenseRequest,
  UpdateExpenseRequest,
  RecordPaymentRequest
} from '@/types/expense';
import type { PagedResponse } from '@/types';

export const expenseCategoriesApi = {
  // List categories
  getAll: (params?: ExpenseCategoryFilters & { page?: number; pageSize?: number }) =>
    apiClient.get<PagedResponse<ExpenseCategory>>('/expense-categories', { params }),
  
  // Get all (no paging) for dropdowns
  getAllNoPaging: () =>
    apiClient.get<ExpenseCategory[]>('/expense-categories/all'),
  
  // Get by ID
  getById: (id: string) =>
    apiClient.get<ExpenseCategory>(`/expense-categories/${id}`),
  
  // Create
  create: (data: CreateExpenseCategoryRequest) =>
    apiClient.post<ExpenseCategory>('/expense-categories', data),
  
  // Update
  update: (id: string, data: UpdateExpenseCategoryRequest) =>
    apiClient.put<ExpenseCategory>(`/expense-categories/${id}`, data),
  
  // Delete
  delete: (id: string) =>
    apiClient.delete(`/expense-categories/${id}`)
};

export const expensesApi = {
  // List expenses
  getAll: (params?: ExpenseFilters & { page?: number; pageSize?: number }) =>
    apiClient.get<PagedResponse<Expense>>('/expenses', { params }),
  
  // Get by ID
  getById: (id: string) =>
    apiClient.get<Expense>(`/expenses/${id}`),
  
  // Create
  create: (data: CreateExpenseRequest) =>
    apiClient.post<Expense>('/expenses', data),
  
  // Update
  update: (id: string, data: UpdateExpenseRequest) =>
    apiClient.put<Expense>(`/expenses/${id}`, data),
  
  // Delete
  delete: (id: string) =>
    apiClient.delete(`/expenses/${id}`),
  
  // Submit for approval
  submitForApproval: (id: string) =>
    apiClient.post<Expense>(`/expenses/${id}/submit-for-approval`),
  
  // Approve
  approve: (id: string) =>
    apiClient.post<Expense>(`/expenses/${id}/approve`),
  
  // Reject
  reject: (id: string, reason: string) =>
    apiClient.post<Expense>(`/expenses/${id}/reject`, { reason }),
  
  // Record payment
  recordPayment: (id: string, data: RecordPaymentRequest) =>
    apiClient.post<Expense>(`/expenses/${id}/record-payment`, data),
  
  // Upload attachment
  uploadAttachment: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(`/expenses/${id}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Delete attachment
  deleteAttachment: (id: string, attachmentId: string) =>
    apiClient.delete(`/expenses/${id}/attachments/${attachmentId}`)
};

