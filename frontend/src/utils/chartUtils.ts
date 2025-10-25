// Para birimi formatı
export const formatCurrency = (value: number, locale: string = 'tr-TR'): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Kısa para birimi formatı
export const formatCurrencyShort = (value: number, locale: string = 'tr-TR'): string => {
  if (value >= 1000000) {
    return `₺${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `₺${(value / 1000).toFixed(0)}K`;
  }
  return formatCurrency(value, locale);
};

// Tarih formatı
export const formatDate = (dateString: string, locale: string = 'tr'): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { month: 'short', year: 'numeric' };
  
  if (locale === 'tr') {
    return date.toLocaleDateString('tr-TR', options);
  } else {
    return date.toLocaleDateString('en-US', options);
  }
};

// Ay formatı
export const formatMonth = (monthString: string, locale: string = 'tr'): string => {
  const date = new Date(monthString);
  const options: Intl.DateTimeFormatOptions = { month: 'short' };
  
  if (locale === 'tr') {
    return date.toLocaleDateString('tr-TR', options);
  } else {
    return date.toLocaleDateString('en-US', options);
  }
};

// Yüzde formatı
export const formatPercent = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

// Sayı formatı
export const formatNumber = (value: number, locale: string = 'tr-TR'): string => {
  return new Intl.NumberFormat(locale).format(value);
};

// Chart renk paleti
export const chartColors = [
  '#1890ff', // Mavi
  '#52c41a', // Yeşil
  '#fa8c16', // Turuncu
  '#722ed1', // Mor
  '#eb2f96', // Pembe
  '#13c2c2', // Cyan
  '#faad14', // Sarı
  '#f5222d', // Kırmızı
];

// Responsive chart height calculator
export const getResponsiveChartHeight = (baseHeight: number = 350): number => {
  if (typeof window === 'undefined') return baseHeight;
  
  const width = window.innerWidth;
  
  if (width < 768) {
    return baseHeight * 0.8;
  } else if (width < 992) {
    return baseHeight * 0.9;
  } else {
    return baseHeight;
  }
};