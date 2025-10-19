import { apiClient } from './client';
import type {
  CompanySettings,
  UserPreferences,
  UpdateCompanySettingsRequest,
  UpdateUserPreferencesRequest
} from '@/types/settings';

export const settingsApi = {
  // Company Settings
  getCompanySettings: () =>
    apiClient.get<CompanySettings>('/settings/company'),
  
  updateCompanySettings: (data: UpdateCompanySettingsRequest) =>
    apiClient.put<CompanySettings>('/settings/company', data),
  
  // User Preferences
  getUserPreferences: () =>
    apiClient.get<UserPreferences>('/settings/user/preferences'),
  
  updateUserPreferences: (data: UpdateUserPreferencesRequest) =>
    apiClient.put<UserPreferences>('/settings/user/preferences', data),
  
  // Upload logo
  uploadLogo: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post<{ url: string }>('/settings/upload/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Upload favicon
  uploadFavicon: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post<{ url: string }>('/settings/upload/favicon', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};
