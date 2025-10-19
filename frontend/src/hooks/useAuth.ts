import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { message } from 'antd';
import { useTranslation } from 'react-i18next';
import axiosInstance from '@/utils/axios';

// Kullanıcı tipi
interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: string;
  companyId?: string;
}

// Login form verisi
interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Register form verisi
interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  acceptTerms: boolean;
}

// Auth state
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
}

/**
 * Authentication hook - Kullanıcı girişi, çıkışı ve yetkilendirme yönetimi
 */
export const useAuth = (): AuthState => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Kullanıcı bilgilerini çek
  const { data: userData, refetch: refetchUser } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/v1/auth/me');
      return response.data.data; // Backend'den gelen data.data formatı
    },
    enabled: !!localStorage.getItem('token'),
    retry: false
  });

  // Kullanıcı bilgileri değiştiğinde state'i güncelle
  useEffect(() => {
    if (userData) {
      setUser(userData);
    }
  }, [userData]);

  // Loading state'i yönet
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoading(false);
    }
  }, []);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await axiosInstance.post('/api/v1/auth/login', data);
      return response.data;
    },
    onSuccess: (data) => {
      const { accessToken, refreshToken, userId, email, fullName } = data.data;
      
      // Token'ları localStorage'a kaydet
      localStorage.setItem('token', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      
      // Remember Me kontrolü
      if (data.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
      
      // User objesi oluştur
      const user = {
        id: userId,
        email: email,
        name: fullName,
        firstName: fullName.split(' ')[0] || '',
        lastName: fullName.split(' ').slice(1).join(' ') || '',
        avatar: null
      };
      
      setUser(user);
      message.success(t('auth.loginSuccess'));
      navigate('/dashboard');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || t('auth.loginError');
      message.error(errorMessage);
    }
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await axiosInstance.post('/api/v1/auth/register', data);
      return response.data;
    },
    onSuccess: () => {
      message.success(t('auth.registerSuccess'));
      navigate('/login');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || t('auth.registerError');
      message.error(errorMessage);
    }
  });

  // Forgot password mutation
  const forgotPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await axiosInstance.post('/api/v1/auth/forgot-password', { email });
      return response.data;
    },
    onSuccess: () => {
      message.success(t('auth.resetEmailSent'));
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || t('auth.resetEmailError');
      message.error(errorMessage);
    }
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async ({ token, password }: { token: string; password: string }) => {
      const response = await axiosInstance.post('/api/v1/auth/reset-password', { token, password });
      return response.data;
    },
    onSuccess: () => {
      message.success(t('auth.passwordResetSuccess'));
      navigate('/login');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || t('auth.passwordResetError');
      message.error(errorMessage);
    }
  });

  /**
   * Kullanıcı girişi
   */
  const login = async (data: LoginData) => {
    await loginMutation.mutateAsync(data);
  };

  /**
   * Kullanıcı kaydı
   */
  const register = async (data: RegisterData) => {
    await registerMutation.mutateAsync(data);
  };

  /**
   * Şifre sıfırlama e-postası gönder
   */
  const forgotPassword = async (email: string) => {
    await forgotPasswordMutation.mutateAsync(email);
  };

  /**
   * Şifre sıfırlama
   */
  const resetPassword = async (token: string, password: string) => {
    await resetPasswordMutation.mutateAsync({ token, password });
  };

  /**
   * Çıkış yapma
   */
  const logout = () => {
    // Token'ları temizle
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('rememberMe');
    
    // State'i temizle
    setUser(null);
    
    // Login sayfasına yönlendir
    navigate('/login');
    
    message.success(t('auth.logoutSuccess'));
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading: isLoading || loginMutation.isPending || registerMutation.isPending,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword
  };
};
