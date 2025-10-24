import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { Badge } from 'antd';
import {
  HomeOutlined,
  FileTextOutlined,
  ShoppingOutlined,
  TeamOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useLowStockAlerts } from '@/hooks/useStock';
import './MobileBottomNav.css';

/**
 * Mobil alt navigasyon
 * 5 ana sekme: Dashboard, Faturalar, Ürünler, Cariler, Profil
 */

interface NavItem {
  key: string;
  path: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}

export const MobileBottomNav: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: lowStockAlerts } = useLowStockAlerts();

  const navItems: NavItem[] = [
    {
      key: 'dashboard',
      path: '/dashboard',
      icon: <HomeOutlined />,
      label: t('menu.dashboard')
    },
    {
      key: 'invoices',
      path: '/invoices/list',
      icon: <FileTextOutlined />,
      label: t('menu.invoices')
    },
    {
      key: 'products',
      path: '/products/list',
      icon: <ShoppingOutlined />,
      label: t('menu.products'),
      badge: lowStockAlerts?.length || 0
    },
    {
      key: 'partners',
      path: '/partners/list',
      icon: <TeamOutlined />,
      label: t('menu.partners')
    },
    {
      key: 'profile',
      path: '/profile',
      icon: <UserOutlined />,
      label: t('menu.profile')
    }
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <div className="mobile-bottom-nav">
      {navItems.map((item) => (
        <div
          key={item.key}
          className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
          onClick={() => navigate(item.path)}
        >
          <Badge count={item.badge} size="small" offset={[2, -2]}>
            <div className="nav-icon">{item.icon}</div>
          </Badge>
          <div className="nav-label">{item.label}</div>
        </div>
      ))}
    </div>
  );
};
