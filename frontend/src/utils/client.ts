import axios, { AxiosError } from 'axios';

/**
 * API Client - Backend ile iletişim için Axios instance
 * JWT token yönetimi, error handling ve retry logic içerir
 */

// API Base URL - environment'a göre
const getBaseURL = () => {
  // Development'ta MSW mock API kullan
  if (import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_API === 'true') {
    return 'http://localhost:7043/api/v1';
  }
  // Production veya real API
  return import.meta.env.VITE_API_URL || 'http://localhost:7043/api/v1';
};

// Axios instance oluştur
const client = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor - Token ve language header ekle
client.interceptors.request.use(
  (config) => {
    // JWT token ekle
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Dil bilgisi ekle
    const language = localStorage.getItem('language') || 'tr';
    config.headers['Accept-Language'] = language;

    // Request ID ekle (debugging için)
    config.headers['X-Request-ID'] = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Log request (development only)
    if (import.meta.env.DEV) {
      console.log(`🔵 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data
      });
    }

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Error handling ve token refresh
client.interceptors.response.use(
  (response) => {
    // Log response (development only)
    if (import.meta.env.DEV) {
      console.log(`🟢 API Response: ${response.config.url}`, {
        status: response.status,
        data: response.data
      });
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any & { _retry?: boolean };

    // 401 - Token expired, try to refresh
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          // Token yenileme isteği
          const response = await axios.post(
            `${getBaseURL()}/auth/refresh`,
            { refreshToken },
            { headers: { 'Content-Type': 'application/json' } }
          );

          const { token, refreshToken: newRefreshToken } = response.data;
          
          // Yeni token'ları kaydet
          localStorage.setItem('token', token);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }

          // Başarısız olan isteği yeni token ile tekrar dene
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return client(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token da geçersizse, logout yap
        console.error('❌ Token refresh failed:', refreshError);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // 403 - Forbidden
    if (error.response?.status === 403) {
      console.error('❌ API Error (403): Yetkisiz erişim');
      // Kullanıcıyı bilgilendir ama redirect etme
    }

    // 404 - Not Found (silent log)
    if (error.response?.status === 404) {
      console.warn('⚠️ API Error (404):', error.config?.url);
      // Empty state göster, hata mesajı gösterme
      return Promise.reject({ 
        ...error, 
        silent: true,
        message: 'Veri bulunamadı' 
      });
    }

    // 422 - Validation Error
    if (error.response?.status === 422) {
      console.error('❌ API Error (422): Validation failed', error.response.data);
      return Promise.reject({
        ...error,
        validationErrors: error.response.data
      });
    }

    // 500 - Server Error
    if (error.response?.status === 500) {
      console.error('❌ API Error (500): Sunucu hatası');
    }

    // Network Error
    if (!error.response) {
      console.error('❌ Network Error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default client;
