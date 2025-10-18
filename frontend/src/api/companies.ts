import { apiClient } from './client';
import type { Company } from '@/store/companyStore';
import type { ApiResponse, PagedResponse } from '@/types';

// Mock data for testing
const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'Test Company',
    taxNumber: '1234567890',
    taxOffice: 'Kadıköy',
    phone: '+90 212 555 0001',
    email: 'info@testcompany.com',
    address: 'Test Adres No:1',
    baseCurrency: 'TRY',
    isActive: true,
  },
  {
    id: '2',
    name: 'Demo Company',
    taxNumber: '0987654321',
    taxOffice: 'Beşiktaş',
    phone: '+90 212 555 0002',
    email: 'info@democompany.com',
    address: 'Demo Adres No:2',
    baseCurrency: 'USD',
    isActive: true,
  },
];

// Company API endpoints (REAL API - Backend çalışıyor)
export const companiesApi = {
  // Kullanıcının şirketlerini getir
  getUserCompanies: () =>
    apiClient.get<ApiResponse<Company[]>>('/companies'),

  // Tüm şirketleri getir (admin)
  getAll: () =>
    apiClient.get<ApiResponse<Company[]>>('/companies'),

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
  country: string;
  city?: string;
}

export interface UpdateCompanyRequest extends CreateCompanyRequest {
  id: string; // ID alanı eklendi
  logoUrl?: string;
  primaryColor?: string;
  isActive?: boolean;
}

