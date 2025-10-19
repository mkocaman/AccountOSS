import { apiClient } from './client';
import type { 
  OwnerSettings,
  UpdateOwnerSettingsRequest,
  CompanyInfo
} from '@/types/ownerSettings';
import type { PagedResponse } from '@/types';

export const ownerSettingsApi = {
  // Get owner settings
  getSettings: () =>
    apiClient.get<OwnerSettings>('/owner/settings'),
  
  // Update owner settings
  updateSettings: (data: UpdateOwnerSettingsRequest) =>
    apiClient.put<OwnerSettings>('/owner/settings', data),
  
  // Company Management
  getAllCompanies: (params?: { page?: number; pageSize?: number; search?: string }) =>
    apiClient.get<PagedResponse<CompanyInfo>>('/owner/companies', { params }),
  
  getCompanyById: (id: string) =>
    apiClient.get<CompanyInfo>(`/owner/companies/${id}`),
  
  suspendCompany: (id: string, reason: string) =>
    apiClient.post(`/owner/companies/${id}/suspend`, { reason }),
  
  activateCompany: (id: string) =>
    apiClient.post(`/owner/companies/${id}/activate`),
  
  deleteCompany: (id: string) =>
    apiClient.delete(`/owner/companies/${id}`),
  
  // System Stats
  getSystemStats: () =>
    apiClient.get('/owner/stats')
};

