import { apiClient } from '@/api/client';
import type { Language } from '@/types/language';

/**
 * Dil ayarları servisi
 */
export const settingsService = {
  /**
   * Mevcut dilleri getirir
   */
  getAvailableLanguages: async (): Promise<Language[]> => {
    try {
      const response = await apiClient.get<Language[]>('/settings/languages');
      return response;
    } catch (error) {
      // Fallback - API yoksa default diller
      console.warn('Language API not available, using fallback');
      return [
        { code: 'tr', name: 'Türkçe', flag: '🇹🇷', isDefault: true },
        { code: 'en', name: 'English', flag: '🇬🇧', isDefault: false }
      ];
    }
  },

  /**
   * Kullanıcının dil tercihini günceller
   */
  updateLanguage: async (languageCode: string): Promise<void> => {
    try {
      await apiClient.post('/settings/language', { languageCode });
    } catch (error) {
      console.error('Language update failed:', error);
      // Sessizce başarısız ol, kullanıcıyı rahatsız etme
    }
  }
};
