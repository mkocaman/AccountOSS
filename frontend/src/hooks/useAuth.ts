import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService, LoginCredentials, RegisterData } from '../services/authService';
import { useMessage } from './useMessage';

/**
 * Authentication hook - Real API ile çalışır
 */
export const useAuth = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const message = useMessage();

  // Mevcut kullanıcı bilgisini al
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['currentUser'],
    queryFn: authService.getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 dakika
    enabled: !!localStorage.getItem('token') // Token varsa çalıştır
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      // Token'ları kaydet
      localStorage.setItem('token', data.token);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }

      // User bilgisini cache'e ekle
      queryClient.setQueryData(['currentUser'], data.user);

      message.success('Giriş başarılı, yönlendiriliyorsunuz...');
      
      // Dashboard'a yönlendir
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Giriş yapılamadı';
      message.error(errorMessage);
    }
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      message.success('Kayıt başarılı! Giriş yapılıyor...');
      
      // Token'ları kaydet
      localStorage.setItem('token', data.token);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }

      // User bilgisini cache'e ekle
      queryClient.setQueryData(['currentUser'], data.user);

      // Dashboard'a yönlendir
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Kayıt oluşturulamadı';
      message.error(errorMessage);
    }
  });

  // Logout
  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      // Cache'i temizle
      queryClient.clear();
      
      // Login sayfasına yönlendir
      navigate('/login');
      
      message.info('Çıkış yapıldı');
    }
  };

  return {
    user,
    isLoading,
    isError: !!error,
    isAuthenticated: !!user && !!localStorage.getItem('token'),
    login: (credentials: LoginCredentials) => loginMutation.mutate(credentials),
    register: (data: RegisterData) => registerMutation.mutate(data),
    logout,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending
  };
};
