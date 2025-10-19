import { apiClient } from './client';
import type { 
  Contract, 
  ContractFilters,
  CreateContractRequest,
  UpdateContractRequest,
  SignContractRequest
} from '@/types/contract';
import type { PagedResponse } from '@/types';

export const contractsApi = {
  // List contracts
  getAll: (params?: ContractFilters & { page?: number; pageSize?: number }) =>
    apiClient.get<PagedResponse<Contract>>('/contracts', { params }),
  
  // Get by ID
  getById: (id: string) =>
    apiClient.get<Contract>(`/contracts/${id}`),
  
  // Create
  create: (data: CreateContractRequest) =>
    apiClient.post<Contract>('/contracts', data),
  
  // Update
  update: (id: string, data: UpdateContractRequest) =>
    apiClient.put<Contract>(`/contracts/${id}`, data),
  
  // Delete
  delete: (id: string) =>
    apiClient.delete(`/contracts/${id}`),
  
  // Sign contract
  sign: (id: string, data: SignContractRequest) =>
    apiClient.post<Contract>(`/contracts/${id}/sign`, data),
  
  // Activate
  activate: (id: string) =>
    apiClient.post<Contract>(`/contracts/${id}/activate`),
  
  // Terminate
  terminate: (id: string, reason: string) =>
    apiClient.post<Contract>(`/contracts/${id}/terminate`, { reason }),
  
  // Upload document
  uploadDocument: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post<{ url: string }>(`/contracts/${id}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Create Power of Attorney from contract
  createPowerOfAttorney: (id: string) =>
    apiClient.post(`/contracts/${id}/create-poa`),
  
  // PDF Export
  exportPdf: (id: string) =>
    apiClient.get(`/contracts/${id}/pdf`, { responseType: 'blob' })
};

