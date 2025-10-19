import dayjs from 'dayjs';

// Currency formatting
export const formatCurrency = (amount: number, currency: string = 'TRY'): string => {
  // Handle Turkish Lira symbol
  if (currency === '₺' || currency === 'TL') {
    currency = 'TRY';
  }
  
  try {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Fallback for invalid currency codes
    return `${amount.toFixed(2)} ${currency}`;
  }
};

// Date formatting
export const formatDate = (date: string | Date): string => {
  return dayjs(date).format('DD.MM.YYYY');
};

// Date time formatting
export const formatDateTime = (date: string | Date): string => {
  return dayjs(date).format('DD.MM.YYYY HH:mm');
};

// Relative date formatting
export const formatRelativeDate = (date: string | Date): string => {
  return dayjs(date).fromNow();
};

// Number formatting
export const formatNumber = (number: number, decimals: number = 2): string => {
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number);
};

// Percentage formatting
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

// Get initials from name
export const getInitials = (name: string): string => {
  if (!name) return '';
  
  const words = name.trim().split(' ');
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  
  return words
    .slice(0, 2)
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase();
};

// Download file from blob
export const downloadFile = (blob: Blob, fileName: string): void => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
