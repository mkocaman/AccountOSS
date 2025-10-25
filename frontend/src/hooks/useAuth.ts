import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { login, logout, LoginRequest, LoginResponse } from '../services/authService';
import { message } from 'antd';

/**
 * Auth hook - Login/logout işlemleri
 */

export const useAuth = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => login(data),
    onSuccess: (response: LoginResponse) => {
      console.log('✅ Login successful, response:', response);
      console.log('🔍 Response structure:', JSON.stringify(response, null, 2));
      
      // CRITICAL: Token'ları kaydet - sıralama önemli!
      try {
        // Backend response formatı: { success: true, data: { accessToken, refreshToken, ... } }
        if (!response.success || !response.data) {
          throw new Error('Invalid response format from backend');
        }
        
        const { accessToken, refreshToken, userId, email, fullName } = response.data;
        
        // 1. Token'ları kaydet
        if (!accessToken) {
          console.error('❌ AccessToken field missing from response');
          console.log('📋 Available fields:', Object.keys(response.data));
          throw new Error('AccessToken is missing from response');
        }
        
        localStorage.setItem('accessToken', accessToken);
        console.log('✅ Access token saved');
        
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
          console.log('✅ Refresh token saved');
        }
        
        // 2. User bilgisini kaydet
        const userInfo = {
          id: userId,
          email: email,
          name: fullName
        };
        
        localStorage.setItem('user', JSON.stringify(userInfo));
        console.log('✅ User info saved:', userInfo);
        
        // 3. Başarı mesajı göster
        message.success('Giriş başarılı!');
        
        // 4. Query cache'i invalidate et
        queryClient.invalidateQueries();
        
        // 5. Dashboard'a yönlendir - ASYNC olarak, biraz bekle
        setTimeout(() => {
          console.log('✅ Redirecting to dashboard...');
          navigate('/dashboard', { replace: true });
        }, 100);
        
      } catch (error) {
        console.error('❌ Error saving auth data:', error);
        message.error('Giriş bilgileri kaydedilemedi');
      }
    },
    onError: (error: any) => {
      console.error('❌ Login error:', error);
      message.error(error?.response?.data?.message || 'Giriş yapılamadı');
    }
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      console.log('✅ Logout successful');
      
      // Local storage'ı temizle
      localStorage.clear();
      
      // Query cache'i temizle
      queryClient.clear();
      
      // Login sayfasına yönlendir
      navigate('/login', { replace: true });
      
      message.info('Çıkış yapıldı');
    },
    onError: (error: any) => {
      console.error('❌ Logout error:', error);
      // Hata olsa bile çıkış yap
      localStorage.clear();
      navigate('/login', { replace: true });
    }
  });

  // Current user - safely parse
  const user = (() => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return null;
      return JSON.parse(userStr);
    } catch (error) {
      console.error('❌ Error parsing user data:', error);
      return null;
    }
  })();

  const isAuthenticated = (() => {
    const token = localStorage.getItem('accessToken');
    const hasToken = !!token;
    console.log('🔐 Auth check - hasToken:', hasToken);
    return hasToken;
  })();

  return {
    user,
    isAuthenticated,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending
  };
};