import { apiClient } from './client';

// Auth API tipleri
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
    };
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
}

// Auth API servisi
export const authApi = {
  // Login
  login: (data: LoginRequest) =>
    apiClient.post<LoginResponse>('/auth/login', data),

  // Register
  register: (data: RegisterRequest) =>
    apiClient.post<LoginResponse>('/auth/register', data),

  // Logout
  logout: () =>
    apiClient.post('/auth/logout', {}),

  // Get current user
  getCurrentUser: () =>
    apiClient.get('/auth/me'),

  // Refresh token
  refreshToken: (refreshToken: string) =>
    apiClient.post('/auth/refresh', { refreshToken }),
};

