/**
 * Utility fonksiyonları - Para birimi, tarih ve diğer formatlamalar
 */

/**
 * Para birimini formatlar
 * @param amount - Formatlanacak miktar
 * @param currency - Para birimi (varsayılan: TRY)
 * @returns Formatlanmış para birimi string'i
 */
export const formatCurrency = (amount: number | string, currency: string = 'TRY'): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return '0,00 ₺';
  }

  // Para birimi sembolleri
  const currencySymbols: Record<string, string> = {
    'TRY': '₺',
    'USD': '$',
    'EUR': '€',
    'GBP': '£'
  };

  const symbol = currencySymbols[currency] || currency;
  
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numAmount).replace(currency, symbol);
};

/**
 * Tarihi formatlar
 * @param date - Formatlanacak tarih
 * @param format - Tarih formatı (varsayılan: 'DD/MM/YYYY')
 * @returns Formatlanmış tarih string'i
 */
export const formatDate = (date: string | Date, format: string = 'DD/MM/YYYY'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '-';
  }

  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear();
  const hours = dateObj.getHours().toString().padStart(2, '0');
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');

  switch (format) {
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'DD/MM/YYYY HH:mm':
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    default:
      return dateObj.toLocaleDateString('tr-TR');
  }
};

/**
 * Sayıyı formatlar (binlik ayırıcı ile)
 * @param number - Formatlanacak sayı
 * @param decimals - Ondalık basamak sayısı (varsayılan: 2)
 * @returns Formatlanmış sayı string'i
 */
export const formatNumber = (number: number | string, decimals: number = 2): string => {
  const num = typeof number === 'string' ? parseFloat(number) : number;
  
  if (isNaN(num)) {
    return '0';
  }

  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num);
};

/**
 * Yüzdeyi formatlar
 * @param value - Formatlanacak değer
 * @param decimals - Ondalık basamak sayısı (varsayılan: 1)
 * @returns Formatlanmış yüzde string'i
 */
export const formatPercentage = (value: number | string, decimals: number = 1): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) {
    return '0%';
  }

  return `${formatNumber(num, decimals)}%`;
};

/**
 * Dosya boyutunu formatlar
 * @param bytes - Byte cinsinden dosya boyutu
 * @returns Formatlanmış dosya boyutu string'i
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Telefon numarasını formatlar
 * @param phone - Formatlanacak telefon numarası
 * @returns Formatlanmış telefon numarası string'i
 */
export const formatPhone = (phone: string): string => {
  if (!phone) return '';
  
  // Sadece rakamları al
  const cleaned = phone.replace(/\D/g, '');
  
  // Türkiye telefon numarası formatı
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)}`;
  }
  
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return `(${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9, 11)}`;
  }
  
  return phone;
};

/**
 * E-posta adresini maskeler
 * @param email - Maskelenecek e-posta adresi
 * @returns Maskelenmiş e-posta adresi string'i
 */
export const maskEmail = (email: string): string => {
  if (!email || !email.includes('@')) return email;
  
  const [localPart, domain] = email.split('@');
  const maskedLocal = localPart.length > 2 
    ? localPart.slice(0, 2) + '*'.repeat(localPart.length - 2)
    : localPart;
  
  return `${maskedLocal}@${domain}`;
};

/**
 * Kullanıcı adının baş harflerini alır
 * @param name - Kullanıcı adı
 * @returns Baş harfler string'i
 */
export const getInitials = (name: string): string => {
  if (!name) return '';
  
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);
};

/**
 * Relatif zamanı formatlar (örn: "2 saat önce")
 * @param date - Tarih
 * @returns Relatif zaman string'i
 */
export const formatRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(targetDate.getTime())) {
    return '-';
  }

  const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Az önce';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} dakika önce`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} saat önce`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} gün önce`;
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} hafta önce`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} ay önce`;
  }
  
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} yıl önce`;
};

/**
 * Stok durumunu formatlar
 * @param quantity - Stok miktarı
 * @param minLevel - Minimum stok seviyesi
 * @returns Stok durumu string'i
 */
export const formatStockStatus = (quantity: number, minLevel: number = 0): string => {
  if (quantity <= 0) {
    return 'Stokta Yok';
  }
  
  if (quantity <= minLevel) {
    return 'Düşük Stok';
  }
  
  return 'Stokta';
};

/**
 * Durum rengini döndürür
 * @param status - Durum
 * @returns Renk kodu
 */
export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    'active': '#52c41a',
    'inactive': '#ff4d4f',
    'pending': '#faad14',
    'approved': '#52c41a',
    'rejected': '#ff4d4f',
    'draft': '#d9d9d9',
    'published': '#52c41a',
    'archived': '#8c8c8c'
  };
  
  return statusColors[status.toLowerCase()] || '#d9d9d9';
};
