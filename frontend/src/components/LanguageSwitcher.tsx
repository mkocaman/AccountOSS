import { Select, Spin } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { languagesApi } from '@/api/languages';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  // Backend'den aktif dilleri getir
  const { data: languages, isLoading } = useQuery({
    queryKey: ['activeLanguages'],
    queryFn: () => languagesApi.getActiveLanguages(),
    staleTime: 5 * 60 * 1000 // 5 dakika cache
  });

  const handleChange = async (value: string) => {
    try {
      await i18n.changeLanguage(value);
      localStorage.setItem('i18nextLng', value);
      
      // RTL kontrolü
      const selectedLang = languages?.data?.find(l => l.code.toLowerCase() === value);
      if (selectedLang?.isRtl) {
        document.documentElement.dir = 'rtl';
        document.body.classList.add('rtl');
      } else {
        document.documentElement.dir = 'ltr';
        document.body.classList.remove('rtl');
      }
      
      // Sayfayı yenile (yeni çevirileri yüklemek için)
      window.location.reload();
    } catch (error) {
      console.error('Dil değiştirme hatası:', error);
    }
  };

  if (isLoading) {
    return <Spin size="small" />;
  }

  return (
    <Select
      value={i18n.language}
      onChange={handleChange}
      style={{ width: 160 }}
      size="small"
      suffixIcon={<GlobalOutlined />}
      options={languages?.data
        ?.sort((a, b) => a.displayOrder - b.displayOrder)
        .map(lang => ({
          label: `${lang.flagIcon} ${lang.nativeName}`,
          value: lang.code.toLowerCase()
        })) || [
          { value: 'tr', label: '🇹🇷 Türkçe' },
          { value: 'en', label: '🇺🇸 English' }
        ]}
    />
  );
}

