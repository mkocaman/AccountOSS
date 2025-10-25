import client from '@/utils/client';
import { PaginatedResponse, PaginationParams, buildQueryString } from '@/utils/api-helpers';

/**
 * Cari hesap (Partner/Customer) servisi
 */

export interface Partner {
  id: string;
  code: string;
  name: string;
  type: 'customer' | 'supplier' | 'both';
  taxNumber?: string;
  taxOffice?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  balance: number; // Bakiye (+ alacak, - borç)
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreatePartnerDto {
  code: string;
  name: string;
  type: 'customer' | 'supplier' | 'both';
  taxNumber?: string;
  taxOffice?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface UpdatePartnerDto extends CreatePartnerDto {
  id: string;
}

export interface PartnerFilters extends PaginationParams {
  searchTerm?: string;
  type?: 'customer' | 'supplier' | 'both';
  isActive?: boolean;
}

export const partnerService = {
  /**
   * Cari hesap listesini getir
   */
  getPartners: async (filters: PartnerFilters = {}): Promise<PaginatedResponse<Partner>> => {
    const queryString = buildQueryString({
      pageNumber: filters.pageNumber || 1,
      pageSize: filters.pageSize || 10,
      searchTerm: filters.searchTerm,
      type: filters.type,
      isActive: filters.isActive,
      sortBy: filters.sortBy || 'name',
      sortOrder: filters.sortOrder || 'asc'
    });

    const response = await client.get(`/partners${queryString}`);
    return response.data;
  },

  /**
   * ID'ye göre cari hesap getir
   */
  getPartnerById: async (id: string): Promise<Partner> => {
    const response = await client.get(`/partners/${id}`);
    return response.data;
  },

  /**
   * Yeni cari hesap oluştur
   */
  createPartner: async (data: CreatePartnerDto): Promise<Partner> => {
    const response = await client.post('/partners', data);
    return response.data;
  },

  /**
   * Cari hesap güncelle
   */
  updatePartner: async (id: string, data: UpdatePartnerDto): Promise<Partner> => {
    const response = await client.put(`/partners/${id}`, data);
    return response.data;
  },

  /**
   * Cari hesap sil (soft delete)
   */
  deletePartner: async (id: string): Promise<void> => {
    await client.delete(`/partners/${id}`);
  },

  /**
   * Cari hesap bakiyesini getir
   */
  getPartnerBalance: async (id: string): Promise<{ balance: number; lastUpdated: string }> => {
    const response = await client.get(`/partners/${id}/balance`);
    return response.data;
  }
};
