import axios from 'axios';

/**
 * Axios instance konfigürasyonu
 * Authentication ve error handling için interceptor'lar içerir
 */

// Base URL ayarı
const axiosInstance = axios.create({
  baseURL: 'https://localhost:7043',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - Token ekleme
axiosInstance.interceptors.request.use(
  (config) => {
    // Token'ı local storage'dan al ve header'a ekle
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Dil bilgisini header'a ekle
    const language = localStorage.getItem('language') || 'tr';
    config.headers['Accept-Language'] = language;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Error handling
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 401 - Unauthorized: Token geçersiz veya süresi dolmuş
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Refresh token ile yeni token al
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(
            `${axiosInstance.defaults.baseURL}/api/v1/auth/refresh`,
            { refreshToken }
          );

          const { token } = response.data;
          localStorage.setItem('token', token);

          // Başarısız olan isteği tekrar dene
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token da geçersizse login sayfasına yönlendir
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // 403 - Forbidden: Yetkisiz erişim
    if (error.response?.status === 403) {
      console.error('❌ Yetkisiz erişim:', error);
      window.location.href = '/403';
    }

    // 404 - Not Found
    if (error.response?.status === 404) {
      console.error('❌ Kaynak bulunamadı:', error);
    }

    // 500 - Internal Server Error
    if (error.response?.status === 500) {
      console.error('❌ Sunucu hatası:', error);
    }

    // Network error
    if (!error.response) {
      console.error('❌ Bağlantı hatası:', error);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
