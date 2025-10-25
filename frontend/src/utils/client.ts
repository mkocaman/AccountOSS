import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

const getBaseURL = () => {
  return import.meta.env.VITE_API_URL || 'https://localhost:7043/api/v1';
};

const client = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

client.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Added token to request:', config.url);
    } else {
      console.warn('⚠️ No token found for request:', config.url);
    }
    
    const language = localStorage.getItem('language') || 'tr';
    config.headers['Accept-Language'] = language;
    
    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

client.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`📥 API Response: ${response.config.url}`, response.status);
    }
    return response;
  },
  async (error: AxiosError) => {
    // Log error details
    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });

    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // 401 - Token refresh
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(
            `${getBaseURL()}/auth/refresh`,
            { refreshToken }
          );
          
          const { token, refreshToken: newRefreshToken } = response.data;
          localStorage.setItem('accessToken', token);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }
          
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return client(originalRequest);
        } catch (refreshError) {
          console.error('❌ Token refresh failed');
          localStorage.clear();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default client;
