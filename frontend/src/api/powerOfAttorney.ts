import { apiClient } from './client';
import type { 
  PowerOfAttorney, 
  PoaFilters,
  CreatePoaRequest,
  UpdatePoaRequest
} from '@/types/powerOfAttorney';
import type { PagedResponse } from '@/types';

export const powerOfAttorneyApi = {
  // List POAs
  getAll: (params?: PoaFilters & { page?: number; pageSize?: number }) =>
    apiClient.get<PagedResponse<PowerOfAttorney>>('/power-of-attorney', { params }),
  
  // Get by ID
  getById: (id: string) =>
    apiClient.get<PowerOfAttorney>(`/power-of-attorney/${id}`),
  
  // Create
  create: (data: CreatePoaRequest) =>
    apiClient.post<PowerOfAttorney>('/power-of-attorney', data),
  
  // Update
  update: (id: string, data: UpdatePoaRequest) =>
    apiClient.put<PowerOfAttorney>(`/power-of-attorney/${id}`, data),
  
  // Delete
  delete: (id: string) =>
    apiClient.delete(`/power-of-attorney/${id}`),
  
  // Activate
  activate: (id: string) =>
    apiClient.post<PowerOfAttorney>(`/power-of-attorney/${id}/activate`),
  
  // Revoke
  revoke: (id: string, reason: string) =>
    apiClient.post<PowerOfAttorney>(`/power-of-attorney/${id}/revoke`, { reason }),
  
  // PDF Export
  exportPdf: (id: string) =>
    apiClient.get(`/power-of-attorney/${id}/pdf`, { responseType: 'blob' })
};

