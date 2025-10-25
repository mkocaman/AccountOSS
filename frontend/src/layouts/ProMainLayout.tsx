import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ProLayout } from '@ant-design/pro-components';
import type { ProSettings } from '@ant-design/pro-components';
import {
  HomeOutlined,
  FileTextOutlined,
  TeamOutlined,
  ShoppingOutlined,
  DollarOutlined,
  BarChartOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  ShoppingCartOutlined,
  WalletOutlined,
  BankOutlined,
  FileProtectOutlined,
  CrownOutlined,
  BankOutlined as BankOutlinedIcon,
  QuestionCircleOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { Dropdown, Modal } from 'antd';
import { useAuth } from '../hooks/useAuth';
import { LanguageSelector } from '../components/common/LanguageSelector';
import { ThemeSelector } from '../components/common/ThemeSelector';
import { NotificationBell } from '../components/header/NotificationBell';
import { SettingsButton } from '../components/header/SettingsButton';
import { GlobalSearch } from '../components/header/GlobalSearch';
import { useTheme } from '../hooks/useTheme';
import { useSignalR } from '../hooks/useSignalR';
import { MobileBottomNav } from '@/components/mobile/MobileBottomNav';

/**
 * Ana layout bileşeni - Ant Design Pro Layout kullanır
 * Sidebar, header, footer ve içerik alanını yönetir
 */
export const ProMainLayout: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { activeTheme } = useTheme();
  
  // SignalR bağlantısını başlat
  useSignalR();

  // ProLayout ayarları - Tema ile güncellenmiş
  const [settings, setSetting] = useState<Partial<ProSettings>>({
    fixSiderbar: true,
    layout: 'mix', // top + side layout
    splitMenus: false,
    navTheme: activeTheme === 'dark' || activeTheme === 'semi-dark' ? 'realDark' : 'light',
    contentWidth: 'Fluid',
    colorPrimary: '#1890ff',
    siderMenuType: 'sub'
  });

  // Tema değiştiğinde settings'i güncelle
  React.useEffect(() => {
    setSetting(prev => ({
      ...prev,
      navTheme: activeTheme === 'dark' || activeTheme === 'semi-dark' ? 'realDark' : 'light'
    }));
  }, [activeTheme]);

  /**
   * Menü rotaları tanımla - ProLayout formatında
   */
  const menuRoutes = [
    {
      path: '/dashboard',
      name: t('menu.dashboard'),
      icon: <HomeOutlined />
    },
    {
      path: '/invoices',
      name: t('menu.invoices'),
      icon: <FileTextOutlined />,
      routes: [
        {
          path: '/invoices',
          name: t('menu.invoiceList'),
          key: 'invoices-list'
        },
        {
          path: '/invoices/create',
          name: t('menu.createInvoice'),
          key: 'invoices-create'
        },
        {
          path: '/invoices/edit/:id',
          name: t('menu.editInvoice'),
          key: 'invoices-edit',
          hideInMenu: true
        },
        {
          path: '/invoices/:id',
          name: t('menu.invoiceDetail'),
          key: 'invoices-detail',
          hideInMenu: true
        }
      ]
    },
    {
      path: '/partners',
      name: t('menu.partners'),
      icon: <TeamOutlined />,
      routes: [
        {
          path: '/partners/list',
          name: t('menu.partnerList')
        },
        {
          path: '/partners/create',
          name: t('menu.createPartner')
        },
        {
          path: '/customers',
          name: t('menu.customerList')
        },
        {
          path: '/customers/create',
          name: t('menu.createCustomer')
        }
      ]
    },
    {
      path: '/products',
      name: t('menu.products'),
      icon: <ShoppingOutlined />,
      routes: [
        {
          path: '/products/list',
          name: t('menu.productList')
        },
        {
          path: '/products/create',
          name: t('menu.createProduct')
        },
        {
          path: '/products/categories',
          name: t('menu.categories')
        },
        {
          path: '/stock-movements',
          name: t('menu.stockMovements')
        }
      ]
    },
    {
      path: '/purchase',
      name: t('menu.purchasing'),
      icon: <ShoppingCartOutlined />,
      routes: [
        {
          path: '/purchase-orders',
          name: t('menu.purchaseOrders')
        },
        {
          path: '/goods-receipts',
          name: t('menu.goodsReceipts')
        }
      ]
    },
    {
      path: '/finance',
      name: t('menu.finance'),
      icon: <DollarOutlined />,
      routes: [
        {
          path: '/payments',
          name: t('menu.paymentsReceivables')
        },
        {
          path: '/cash-accounts',
          name: t('menu.cash')
        },
        {
          path: '/bank-accounts',
          name: t('menu.bank')
        },
        {
          path: '/tax-rates',
          name: t('menu.taxRates')
        }
      ]
    },
    {
      path: '/expenses',
      name: t('menu.expenses'),
      icon: <WalletOutlined />,
      routes: [
        {
          path: '/expense-categories',
          name: t('menu.categories')
        },
        {
          path: '/expenses/list',
          name: t('menu.expenseList')
        }
      ]
    },
    {
      path: '/accounting',
      name: t('menu.accounting'),
      icon: <BankOutlined />,
      routes: [
        {
          path: '/chart-of-accounts',
          name: t('menu.chartOfAccounts')
        },
        {
          path: '/trial-balance',
          name: t('menu.trialBalance')
        },
        {
          path: '/journal-entries',
          name: t('menu.journalEntries')
        }
      ]
    },
    {
      path: '/uzbekistan',
      name: t('menu.uzbekistan'),
      icon: <FileProtectOutlined />,
      routes: [
        {
          path: '/contracts',
          name: t('menu.contracts')
        },
        {
          path: '/power-of-attorney',
          name: t('menu.powerOfAttorney')
        }
      ]
    },
    {
      path: '/reports',
      name: t('menu.reports'),
      icon: <BarChartOutlined />,
      routes: [
        {
          path: '/reports/dashboard',
          name: t('menu.reports')
        },
        {
          path: '/reports/income-statement',
          name: t('menu.profitLoss')
        },
        {
          path: '/reports/stock',
          name: t('menu.stockReport')
        }
      ]
    },
    {
      path: '/owner',
      name: t('menu.ownerPanel'),
      icon: <CrownOutlined />,
      routes: [
        {
          path: '/owner/settings',
          name: t('menu.systemSettings')
        }
      ]
    },
    {
      path: '/settings',
      name: t('menu.settings'),
      icon: <SettingOutlined />,
      routes: [
        {
          path: '/settings/general',
          name: t('menu.settings')
        }
      ]
    }
  ];

  /**
   * Çıkış yapma onayı
   */
  const handleLogout = () => {
    Modal.confirm({
      title: t('auth.logoutConfirmTitle'),
      content: t('auth.logoutConfirmMessage'),
      okText: t('common.yes'),
      cancelText: t('common.no'),
      onOk: logout
    });
  };

  /**
   * Kullanıcı menüsü - Geliştirilmiş
   */
  const userMenuItems = [
    {
      key: 'user-info',
      label: (
        <div style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ fontWeight: 600 }}>{user?.name || 'Kullanıcı'}</div>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>
            {user?.email || 'user@example.com'}
          </div>
          <div style={{ fontSize: 11, color: '#bfbfbf', marginTop: 4 }}>
            {user?.role === 'admin' ? '👑 Yönetici' : '👤 Kullanıcı'}
          </div>
        </div>
      ),
      disabled: true
    },
    {
      type: 'divider' as const
    },
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: t('menu.profile'),
      onClick: () => navigate('/profile')
    },
    {
      key: 'account-settings',
      icon: <SettingOutlined />,
      label: t('menu.accountSettings'),
      onClick: () => navigate('/settings/account')
    },
    {
      key: 'company-settings',
      icon: <BankOutlinedIcon />,
      label: t('menu.companySettings'),
      onClick: () => navigate('/settings/company')
    },
    {
      type: 'divider' as const
    },
    {
      key: 'help',
      icon: <QuestionCircleOutlined />,
      label: t('menu.help'),
      onClick: () => window.open('https://docs.accountos.com', '_blank')
    },
    {
      key: 'shortcuts',
      icon: <ThunderboltOutlined />,
      label: t('menu.keyboardShortcuts'),
      onClick: () => console.log('Show shortcuts modal')
    },
    {
      type: 'divider' as const
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('auth.logout'),
      danger: true,
      onClick: handleLogout
    }
  ];

  // Dil değiştirme handler'ı kaldırıldı - LanguageSelector component'i kullanıyoruz

  return (
    <ProLayout
      title="AccountOS"
      logo="/logo.png"
      route={{
        routes: menuRoutes
      }}
      location={location}
      menu={{
        locale: false, // i18n'i kendimiz yönetiyoruz
        collapsedShowGroupTitle: true
      }}
      avatarProps={{
        src: user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=1890ff&color=fff`,
        size: 'default',
        title: user?.name || 'User',
        render: (_, avatarChildren) => (
          <Dropdown 
            menu={{ items: userMenuItems }} 
            placement="bottomRight"
            trigger={['click']}
          >
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              {avatarChildren}
              <span style={{ fontSize: 14, fontWeight: 500 }}>
                {user?.name?.split(' ')[0] || 'User'}
              </span>
            </div>
          </Dropdown>
        )
      }}
      actionsRender={() => [
        // Global arama
        <GlobalSearch key="search" />,
        // Ayarlar butonu
        <SettingsButton key="settings" />,
        // Bildirim zili
        <NotificationBell key="notifications" />,
        // Tema seçici
        <ThemeSelector key="theme" />,
        // Dil seçici - DB'den dilleri getirir
        <LanguageSelector key="language" />
      ]}
      headerTitleRender={(logo, title) => (
        <div
          onClick={() => navigate('/dashboard')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          {logo}
          {title}
        </div>
      )}
      menuItemRender={(item, dom) => (
        <div onClick={() => item.path && navigate(item.path)}>
          {dom}
        </div>
      )}
      {...settings}
    >
      {/* İçerik alanı - Outlet ile child route'lar render edilir */}
      <Outlet />
      
      {/* Mobil alt navigasyon - Router context içinde olduğu için useNavigate çalışır */}
      <MobileBottomNav />
    </ProLayout>
  );
};
