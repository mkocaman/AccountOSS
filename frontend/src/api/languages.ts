import { apiClient } from './client';
import type { PagedResponse } from '@/types';

// Language types
export interface Language {
  id: string;
  code: string;
  name: string;
  nativeName: string;
  flagIcon: string;
  isRtl: boolean;
  isActive: boolean;
  isDefault: boolean;
  displayOrder: number;
}

export interface LanguageFilters {
  search?: string;
  isActive?: boolean;
}

export const languagesApi = {
  // Tüm dilleri getir
  getAll: (params?: LanguageFilters) =>
    apiClient.get<Language[]>('/languages', { params }),
  
  // Sadece aktif dilleri getir
  getActiveLanguages: () =>
    apiClient.get<Language[]>('/languages', { params: { activeOnly: true } }),
  
  // Varsayılan dili getir
  getDefaultLanguage: () =>
    apiClient.get<Language>('/languages/default'),
  
  // ID'ye göre getir
  getById: (id: string) =>
    apiClient.get<Language>(`/languages/${id}`),
  
  // Dil için çevirileri getir (i18n için flat key-value)
  getTranslationsForLanguage: (languageCode: string) =>
    apiClient.get<Record<string, string>>(`/languages/language/${languageCode}`),
};

