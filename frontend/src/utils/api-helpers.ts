import { AxiosError } from 'axios';

/**
 * API helper fonksiyonları
 */

/**
 * API hatalarını parse et ve kullanıcı dostu mesaj döndür
 */
export const parseApiError = (error: any): string => {
  if (error?.silent) {
    return ''; // Sessiz hata, mesaj gösterme
  }

  // Validation errors
  if (error?.validationErrors) {
    const errors = error.validationErrors;
    if (Array.isArray(errors)) {
      return errors.map((e: any) => e.message).join(', ');
    }
    if (typeof errors === 'object') {
      return Object.values(errors).flat().join(', ');
    }
  }

  // HTTP status errors
  if (error?.response) {
    const status = error.response.status;
    const message = error.response.data?.message;

    if (message) return message;

    switch (status) {
      case 400:
        return 'Geçersiz istek';
      case 401:
        return 'Oturum süreniz doldu, lütfen tekrar giriş yapın';
      case 403:
        return 'Bu işlem için yetkiniz yok';
      case 404:
        return 'İstediğiniz kayıt bulunamadı';
      case 422:
        return 'Girdiğiniz veriler geçersiz';
      case 500:
        return 'Sunucu hatası oluştu, lütfen daha sonra tekrar deneyin';
      default:
        return 'Bir hata oluştu';
    }
  }

  // Network errors
  if (error?.message === 'Network Error') {
    return 'İnternet bağlantınızı kontrol edin';
  }

  return error?.message || 'Bilinmeyen bir hata oluştu';
};

/**
 * Query parameters'ı URL string'e çevir
 */
export const buildQueryString = (params: Record<string, any>): string => {
  const cleanParams = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value.map(v => `${key}=${encodeURIComponent(v)}`).join('&');
      }
      return `${key}=${encodeURIComponent(value)}`;
    })
    .join('&');

  return cleanParams ? `?${cleanParams}` : '';
};

/**
 * Pagination helper
 */
export interface PaginationParams {
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Explicit export for compatibility
export { PaginatedResponse, PaginationParams };

/**
 * ProTable için API response'u dönüştür
 */
export const transformToProTableResponse = <T>(
  data: PaginatedResponse<T>
): {
  data: T[];
  success: boolean;
  total: number;
} => {
  return {
    data: data.items,
    success: true,
    total: data.totalCount
  };
};
