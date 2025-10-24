import axios, { type AxiosInstance } from 'axios';
import { message } from 'antd';

// Debug mode - Development ortamında console log
const DEBUG = import.meta.env.DEV;

// API client yapılandırması
class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5043/api/v1',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // CORS için gerekli
    });

    if (DEBUG) {
      console.log('🔧 API Client initialized:', {
        baseURL: this.client.defaults.baseURL,
        timeout: this.client.defaults.timeout,
      });
    }

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - Token ekle
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        const companyId = localStorage.getItem('currentCompanyId');

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        if (companyId) {
          config.headers['X-Company-Id'] = companyId;
        }

        // Debug log
        if (DEBUG) {
          console.log('🚀 API Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            fullURL: `${config.baseURL}${config.url}`,
            headers: {
              Authorization: config.headers.Authorization ? '***' : undefined,
              'X-Company-Id': config.headers['X-Company-Id'],
            },
            data: config.data,
          });
        }

        return config;
      },
      (error) => {
        if (DEBUG) console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor - Hata yönetimi
    this.client.interceptors.response.use(
      (response) => {
        // Debug log
        if (DEBUG) {
          console.log('✅ API Response:', {
            status: response.status,
            statusText: response.statusText,
            data: response.data,
          });
        }
        return response;
      },
      async (error) => {
        // Debug log
        if (DEBUG) {
          console.error('❌ API Error:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            message: error.response?.data?.message,
            errors: error.response?.data?.errors,
            config: {
              method: error.config?.method,
              url: error.config?.url,
            },
          });
        }

        const originalRequest = error.config;

        // 401 Unauthorized - Token yenile
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            
            if (!refreshToken) {
              throw new Error('No refresh token');
            }

            if (DEBUG) console.log('🔄 Refreshing token...');

            const response = await this.client.post('/auth/refresh', {
              refreshToken,
            });

            const { accessToken } = response.data.data;
            localStorage.setItem('accessToken', accessToken);

            if (DEBUG) console.log('✅ Token refreshed successfully');

            // Tekrar dene
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh başarısız - logout
            if (DEBUG) console.error('❌ Token refresh failed, logging out');
            localStorage.clear();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        // 404 - Sessizce logla, kullanıcıyı rahatsız etme
        if (error.response?.status === 404) {
          console.warn('❌ API Error (404):', error.config?.url);
          // Empty state göster, hata mesajı gösterme
          return Promise.reject({ 
            ...error, 
            silent: true, // Bu flag ile UI'da hata gösterme
            message: 'Veri bulunamadı' 
          });
        }

        // 403 - Yetki hatası
        if (error.response?.status === 403) {
          console.error('❌ API Error (403): Yetkisiz erişim');
          // Kullanıcıyı bilgilendir ama redirect etme
        }

        // 500 - Sunucu hatası
        if (error.response?.status === 500) {
          console.error('❌ API Error (500): Sunucu hatası');
        }

        // Network error
        if (!error.response) {
          console.error('❌ Network Error:', error.message);
        }

        // Diğer hatalar için mesaj göster
        const errorMessage = error.response?.data?.message || 
                           error.message || 
                           'Bir hata oluştu';
        message.error(errorMessage);

        return Promise.reject(error);
      }
    );
  }

  // HTTP metodları
  async get<T>(url: string, config?: any) {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config?: any) {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: unknown, config?: any) {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: any) {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();

