import client from '../utils/client';

/**
 * Authentication servisi - Login, register, logout işlemleri
 */

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export const authService = {
  /**
   * Kullanıcı girişi
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await client.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Yeni kullanıcı kaydı
   */
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await client.post('/auth/register', data);
    return response.data;
  },

  /**
   * Token yenileme
   */
  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await client.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  /**
   * Çıkış yapma
   */
  logout: async (): Promise<void> => {
    try {
      await client.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Her durumda local storage temizle
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
  },

  /**
   * Mevcut kullanıcı bilgilerini getir
   */
  getCurrentUser: async () => {
    const response = await client.get('/auth/me');
    return response.data;
  },

  /**
   * Şifre sıfırlama isteği
   */
  forgotPassword: async (email: string): Promise<void> => {
    await client.post('/auth/forgot-password', { email });
  },

  /**
   * Şifre sıfırlama
   */
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await client.post('/auth/reset-password', { token, newPassword });
  },

  /**
   * Şifre değiştirme
   */
  changePassword: async (
    currentPassword: string,
    newPassword: string
  ): Promise<void> => {
    await client.post('/auth/change-password', {
      currentPassword,
      newPassword
    });
  }
};