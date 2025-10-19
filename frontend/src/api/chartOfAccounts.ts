import { apiClient } from './client';
import type { 
  ChartOfAccount, 
  ChartOfAccountsFilters,
  CreateChartOfAccountRequest,
  UpdateChartOfAccountRequest,
  AccountTemplate
} from '@/types/chartOfAccounts';
import type { PagedResponse } from '@/types';

export const chartOfAccountsApi = {
  // List accounts
  getAll: (params?: ChartOfAccountsFilters & { page?: number; pageSize?: number }) =>
    apiClient.get<PagedResponse<ChartOfAccount>>('/chart-of-accounts', { params }),
  
  // Get all (no paging) for dropdowns
  getAllNoPaging: () =>
    apiClient.get<ChartOfAccount[]>('/chart-of-accounts/all'),
  
  // Get by ID
  getById: (id: string) =>
    apiClient.get<ChartOfAccount>(`/chart-of-accounts/${id}`),
  
  // Create
  create: (data: CreateChartOfAccountRequest) =>
    apiClient.post<ChartOfAccount>('/chart-of-accounts', data),
  
  // Update
  update: (id: string, data: UpdateChartOfAccountRequest) =>
    apiClient.put<ChartOfAccount>(`/chart-of-accounts/${id}`, data),
  
  // Delete
  delete: (id: string) =>
    apiClient.delete(`/chart-of-accounts/${id}`),
  
  // Import standard plan
  importStandardPlan: (accounts: AccountTemplate[]) =>
    apiClient.post('/chart-of-accounts/import-standard', { accounts }),
  
  // Get account balance
  getBalance: (id: string, params?: { startDate?: string; endDate?: string }) =>
    apiClient.get<{ debitBalance: number; creditBalance: number; balance: number }>(
      `/chart-of-accounts/${id}/balance`,
      { params }
    ),
  
  // Get trial balance
  getTrialBalance: (params?: { startDate?: string; endDate?: string }) =>
    apiClient.get('/chart-of-accounts/trial-balance', { params })
};

