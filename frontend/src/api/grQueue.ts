import { apiClient } from './client';
import type { 
  GrQueueEntry, 
  GrQueueFilters, 
  ClearGrQueueRequest,
  RevertGrClearanceRequest,
  GrMatchingSuggestion
} from '@/types/grQueue';
import type { ApiResponse, PagedResponse } from '@/types';

export const grQueueApi = {
  // List GR queue entries
  getAll: (params?: GrQueueFilters & { page?: number; pageSize?: number }) =>
    apiClient.get<ApiResponse<PagedResponse<GrQueueEntry>>>('/gr-queue', { params }),
  
  // Get single entry
  getById: (id: string) =>
    apiClient.get<ApiResponse<GrQueueEntry>>(`/gr-queue/${id}`),
  
  // Get auto-matching suggestions
  getSuggestions: (grQueueEntryId: string) =>
    apiClient.get<ApiResponse<GrMatchingSuggestion>>(`/gr-queue/${grQueueEntryId}/suggestions`),
  
  // Clear (Aklama işlemi)
  clear: (data: ClearGrQueueRequest) =>
    apiClient.post<ApiResponse<void>>('/gr-queue/clear', data),
  
  // Revert clearance (Geri alma)
  revert: (data: RevertGrClearanceRequest) =>
    apiClient.post<ApiResponse<void>>('/gr-queue/revert', data),
  
  // Statistics
  getStats: () =>
    apiClient.get<ApiResponse<{
      totalWaiting: number;
      totalWaitingAmount: number;
      totalPartial: number;
      totalCleared: number;
    }>>('/gr-queue/statistics')
};
