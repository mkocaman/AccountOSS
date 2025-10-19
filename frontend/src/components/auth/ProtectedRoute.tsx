import React from 'react';
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
  
  // Token kontrolü
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;

  // Loading durumunda spinner göster
  if (!token) {
    return (
      <div 
        style={{ 
          height: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  // Giriş yapmamış kullanıcıları login sayfasına yönlendir
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
