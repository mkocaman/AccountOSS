import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

/**
 * Korumalı route bileşeni - Authentication kontrolü yapar
 * Giriş yapmamış kullanıcıları login sayfasına yönlendirir
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const location = useLocation();
  
  // Token kontrolü - localStorage'dan direkt oku
  const token = localStorage.getItem('accessToken');
  const isAuthenticated = !!token;

  // Debug log
  useEffect(() => {
    console.log('🔒 ProtectedRoute check:', {
      path: location.pathname,
      isAuthenticated,
      hasToken: !!token
    });
  }, [location.pathname, isAuthenticated, token]);

  // Giriş yapmamış kullanıcıları login sayfasına yönlendir
  if (!isAuthenticated) {
    console.log('❌ Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log('✅ Authenticated, rendering protected content');
  return <>{children}</>;
};
