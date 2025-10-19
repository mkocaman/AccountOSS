import { apiClient } from './client';
import type { 
  JournalEntry, 
  JournalEntryFilters,
  CreateJournalEntryRequest,
  UpdateJournalEntryRequest,
  LedgerEntry
} from '@/types/journalEntry';
import type { PagedResponse } from '@/types';

export const journalEntriesApi = {
  // List entries
  getAll: (params?: JournalEntryFilters & { page?: number; pageSize?: number }) =>
    apiClient.get<PagedResponse<JournalEntry>>('/journal-entries', { params }),
  
  // Get by ID
  getById: (id: string) =>
    apiClient.get<JournalEntry>(`/journal-entries/${id}`),
  
  // Create
  create: (data: CreateJournalEntryRequest) =>
    apiClient.post<JournalEntry>('/journal-entries', data),
  
  // Update
  update: (id: string, data: UpdateJournalEntryRequest) =>
    apiClient.put<JournalEntry>(`/journal-entries/${id}`, data),
  
  // Delete
  delete: (id: string) =>
    apiClient.delete(`/journal-entries/${id}`),
  
  // Post (Kesinleştir)
  post: (id: string) =>
    apiClient.post<JournalEntry>(`/journal-entries/${id}/post`),
  
  // Reverse (İptal Et)
  reverse: (id: string, reason: string) =>
    apiClient.post<JournalEntry>(`/journal-entries/${id}/reverse`, { reason }),
  
  // Get ledger for account
  getLedger: (accountId: string, params?: { startDate?: string; endDate?: string; page?: number; pageSize?: number }) =>
    apiClient.get<PagedResponse<LedgerEntry>>(`/journal-entries/ledger/${accountId}`, { params })
};

