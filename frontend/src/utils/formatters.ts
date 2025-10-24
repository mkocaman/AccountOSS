/**
 * Format utility fonksiyonları
 */

/**
 * Para birimi formatla (Türk Lirası)
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'TRY',
  locale: string = 'tr-TR'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Sayı formatla (binlik ayırıcı ile)
 */
export const formatNumber = (
  value: number,
  decimals: number = 2,
  locale: string = 'tr-TR'
): string => {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

/**
 * Tarih formatla
 */
export const formatDate = (
  date: string | Date,
  format: 'short' | 'long' | 'time' = 'short',
  locale: string = 'tr-TR'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (format === 'short') {
    return dateObj.toLocaleDateString(locale);
  }

  if (format === 'long') {
    return dateObj.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  if (format === 'time') {
    return dateObj.toLocaleString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  return dateObj.toLocaleDateString(locale);
};

/**
 * Yüzde formatla
 */
export const formatPercent = (value: number, decimals: number = 0): string => {
  return `%${formatNumber(value, decimals)}`;
};

/**
 * Dosya boyutu formatla
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Telefon formatla (Türkiye formatı)
 */
export const formatPhone = (phone: string): string => {
  // +905551234567 -> +90 555 123 45 67
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 12 && cleaned.startsWith('90')) {
    return `+90 ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8, 10)} ${cleaned.slice(10)}`;
  }
  
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8)}`;
  }
  
  return phone;
};

/**
 * Vergi numarası formatla (Türkiye formatı)
 */
export const formatTaxNumber = (taxNumber: string): string => {
  // 1234567890 -> 123 456 789 0
  const cleaned = taxNumber.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  }
  
  return taxNumber;
};

/**
 * IBAN formatla (Türkiye formatı)
 */
export const formatIBAN = (iban: string): string => {
  // TR330006100519786457841326 -> TR33 0006 1005 1978 6457 8413 26
  const cleaned = iban.replace(/\s/g, '');
  
  if (cleaned.length === 26 && cleaned.startsWith('TR')) {
    return cleaned.match(/.{1,4}/g)?.join(' ') || iban;
  }
  
  return iban;
};

/**
 * Metin kısalt (ellipsis)
 */
export const truncate = (text: string, length: number = 50): string => {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

/**
 * İlk harfleri büyük yap (Title Case)
 */
export const toTitleCase = (text: string): string => {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};