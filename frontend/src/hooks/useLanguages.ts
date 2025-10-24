import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { settingsService } from '../services/settingsService';
import { useMessage } from './useMessage';

/**
 * Dil yönetimi hook'u
 */
export const useLanguages = () => {
  const { i18n, t } = useTranslation();
  const queryClient = useQueryClient();
  const message = useMessage();

  // Mevcut dilleri çek
  const { data: languages = [], isLoading } = useQuery({
    queryKey: ['languages'],
    queryFn: settingsService.getAvailableLanguages,
    staleTime: 5 * 60 * 1000 // 5 dakika cache
  });

  // Dil değiştirme mutation
  const changeMutation = useMutation({
    mutationFn: (languageCode: string) => {
      // i18n'i değiştir
      i18n.changeLanguage(languageCode);
      // Local storage'a kaydet
      localStorage.setItem('language', languageCode);
      // Backend'e bildir
      return settingsService.updateLanguage(languageCode);
    },
    onSuccess: () => {
      message.success(t('settings.languageChanged'));
      // Cache'i temizle - yeni dilde data çek
      queryClient.invalidateQueries();
    },
    onError: () => {
      message.error(t('settings.languageChangeError'));
    }
  });

  const changeLanguage = (languageCode: string) => {
    changeMutation.mutate(languageCode);
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return {
    languages,
    currentLanguage,
    changeLanguage,
    isLoading,
    isChanging: changeMutation.isPending
  };
};
