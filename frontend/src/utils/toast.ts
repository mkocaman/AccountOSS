import { message } from 'antd';
import { isNoCompanyError } from '@/api/client';

/**
 * Company seçimi hatalarını yönet
 */
export const handleCompanyError = (error: unknown) => {
  if (isNoCompanyError(error)) {
    message.warning('Lütfen önce şirket seçin (Company/Tenant).');
    return true;
  }
  return false;
};

/**
 * API hatalarını yönet
 */
export const handleApiError = (error: unknown) => {
  if (handleCompanyError(error)) {
    return;
  }
  
  if (error instanceof Error) {
    if (error.message.includes('Şirket bilgisi')) {
      message.error('Şirket seçimi bulunamadı. Sağ üstten şirket seçin.');
    } else {
      message.error(error.message);
    }
  } else {
    message.error('Bir hata oluştu');
  }
};
