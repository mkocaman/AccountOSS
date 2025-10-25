import { apiClient } from '@/api/client';
import type { Language } from '@/types/language';

/**
 * Dil ayarları servisi
 */
export const settingsService = {
  /**
   * Mevcut dilleri getirir
   * Backend endpoint hazır olana kadar mock data döner
   */
  getAvailableLanguages: async (): Promise<Language[]> => {
    try {
      // Backend'de /settings/languages endpoint'i yok, mock data dön
      console.log('ℹ️ Mock dil listesi kullanılıyor (backend endpoint hazır değil)');
      
      // Simulated API delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return [
        { 
          code: 'tr', 
          name: 'Türkçe', 
          flag: '🇹🇷', 
          isDefault: true 
        },
        { 
          code: 'en', 
          name: 'English', 
          flag: '🇬🇧', 
          isDefault: false 
        }
      ];
    } catch (error) {
      console.error('❌ Dil listesi yüklenirken hata:', error);
      // Fallback - API yoksa default diller
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
