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

export const parseApiError = (error: any): string => {
  if (error?.silent) return '';
  if (error?.response) {
    const status = error.response.status;
    const message = error.response.data?.message;
    if (message) return message;
    switch (status) {
      case 400: return 'Geçersiz istek';
      case 401: return 'Oturum süreniz doldu';
      case 403: return 'Yetkiniz yok';
      case 404: return 'Kayıt bulunamadı';
      case 422: return 'Veriler geçersiz';
      case 500: return 'Sunucu hatası';
      default: return 'Bir hata oluştu';
    }
  }
  return error?.message || 'Bilinmeyen hata';
};

export const buildQueryString = (params: Record<string, any>): string => {
  const cleanParams = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => {
      if (Array.isArray(value)) return value.map(v => `${key}=${encodeURIComponent(v)}`).join('&');
      return `${key}=${encodeURIComponent(value)}`;
    })
    .join('&');
  return cleanParams ? `?${cleanParams}` : '';
};

export const transformToProTableResponse = <T>(data: PaginatedResponse<T>) => ({
  data: data.items,
  success: true,
  total: data.totalCount
});