import { apiClient } from './client';
import { Company } from '@/store/companyStore';
import { ApiResponse, PagedResponse } from '@/types';

// Company API endpoints
export const companiesApi = {
  // Kullanıcının şirketlerini getir
  getUserCompanies: () =>
    apiClient.get<ApiResponse<Company[]>>('/companies/user-companies'),

  // Tüm şirketleri getir (admin)
  getAll: () =>
    apiClient.get<ApiResponse<PagedResponse<Company>>>('/companies'),

  // Şirket detayı
  getById: (id: string) =>
    apiClient.get<ApiResponse<Company>>(`/companies/${id}`),

  // Yeni şirket oluştur
  create: (data: CreateCompanyRequest) =>
    apiClient.post<ApiResponse<Company>>('/companies', data),

  // Şirket güncelle
  update: (id: string, data: UpdateCompanyRequest) =>
    apiClient.put<ApiResponse<Company>>(`/companies/${id}`, data),

  // Şirket sil
  delete: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/companies/${id}`),
};

// Request types
export interface CreateCompanyRequest {
  name: string;
  taxNumber: string;
  taxOffice?: string;
  phone?: string;
  email?: string;
  address?: string;
  baseCurrency: string;
}

export interface UpdateCompanyRequest extends CreateCompanyRequest {
  logoUrl?: string;
  primaryColor?: string;
  isActive?: boolean;
}

