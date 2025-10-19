import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import ProLayout from '@ant-design/pro-layout';
import { 
  DashboardOutlined,
  FileTextOutlined,
  UserOutlined,
  ShoppingOutlined,
  DollarOutlined,
  BarChartOutlined,
  SettingOutlined,
  ShoppingCartOutlined,
  SwapOutlined,
  SolutionOutlined,
  CrownOutlined,
  WalletOutlined,
  FolderOutlined,
  FileProtectOutlined,
  BankOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/store/authStore';
import { useCompanyStore } from '@/store/companyStore';
import { Dropdown, Space, Avatar, Select, Switch, Button, ConfigProvider, theme } from 'antd';
import { GlobalOutlined, SunOutlined, MoonOutlined, DesktopOutlined } from '@ant-design/icons';

// Ana layout bileşeni - Ant Design Pro Layout ile
export const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, clearAuth } = useAuthStore();
  const { currentCompany } = useCompanyStore();
  const [pathname, setPathname] = useState(location.pathname);
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'semi-dark' | 'system'>('system');
  
  // Tema değiştirici fonksiyonu
  const handleThemeChange = (newTheme: 'light' | 'dark' | 'semi-dark' | 'system') => {
    setThemeMode(newTheme);
  };

  // Menü yapısı - ProLayout formatında
  const route = {
    path: '/',
    routes: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        icon: <DashboardOutlined />,
      },
      {
        path: '/invoices',
        name: 'Faturalar',
        icon: <FileTextOutlined />,
        routes: [
          {
            path: '/invoices/list',
            name: 'Fatura Listesi',
          },
          {
            path: '/invoices/create',
            name: 'Yeni Fatura',
          },
        ],
      },
      {
        path: '/gr-queue',
        name: 'GR Kuyruğu',
        icon: <SwapOutlined />,
      },
      {
        path: '/partners',
        name: 'Cari Hesaplar',
        icon: <UserOutlined />,
      },
      {
        path: '/sales',
        name: 'Satış',
        icon: <SolutionOutlined />,
        routes: [
          {
            path: '/quotations',
            name: 'Teklifler',
          },
          {
            path: '/sales-orders',
            name: 'Satış Siparişleri',
          },
        ],
      },
      {
        path: '/products',
        name: 'Ürünler',
        icon: <ShoppingOutlined />,
        routes: [
          {
            path: '/products/list',
            name: 'Ürün Listesi',
          },
          {
            path: '/categories',
            name: 'Kategoriler',
          },
          {
            path: '/stock-movements',
            name: 'Stok Hareketleri',
          },
        ],
      },
      {
        path: '/purchase',
        name: 'Satın Alma',
        icon: <ShoppingCartOutlined />,
        routes: [
          {
            path: '/purchase-orders',
            name: 'Satın Alma Siparişleri',
          },
          {
            path: '/goods-receipts',
            name: 'Mal Kabul',
          },
        ],
      },
      {
        path: '/finance',
        name: 'Finans',
        icon: <DollarOutlined />,
        routes: [
          {
            path: '/payments',
            name: 'Tahsilat/Ödeme',
          },
        ],
      },
      {
        path: '/expenses',
        name: 'Masraflar',
        icon: <WalletOutlined />,
        routes: [
          {
            path: '/expenses/categories',
            name: 'Masraf Kategorileri',
          },
          {
            path: '/expenses/list',
            name: 'Masraf Listesi',
          },
        ],
      },
      {
        path: '/accounting',
        name: 'Muhasebe',
        icon: <FolderOutlined />,
        routes: [
          {
            path: '/chart-of-accounts',
            name: 'Hesap Planı',
          },
          {
            path: '/journal-entries',
            name: 'Yevmiye',
          },
        ],
      },
      {
        path: '/uzbekistan',
        name: 'Özbekistan',
        icon: <FileProtectOutlined />,
        routes: [
          {
            path: '/contracts',
            name: 'Sözleşmeler',
          },
          {
            path: '/power-of-attorney',
            name: 'Vekalet Belgeleri',
          },
        ],
      },
      {
        path: '/reports',
        name: 'Raporlar',
        icon: <BarChartOutlined />,
      },
      {
        path: '/owner-settings',
        name: 'Owner Panel',
        icon: <CrownOutlined />,
      },
      {
        path: '/settings',
        name: 'Ayarlar',
        icon: <SettingOutlined />,
      },
    ],
  };

  // User dropdown menu
  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Çıkış Yap',
      onClick: () => {
        clearAuth();
        navigate('/login');
      },
    },
  ];

  return (
    <ConfigProvider
      theme={{
        algorithm: (themeMode === 'dark' || themeMode === 'semi-dark') ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <ProLayout
      title="AccountOS"
      logo="/logo.svg"
      layout="mix"
      navTheme={themeMode === 'semi-dark' ? 'dark' : 'light'}
      primaryColor="#1890ff"
      fixedHeader
      fixSiderbar
      route={route}
      location={{
        pathname,
      }}
      menuItemRender={(item, dom) => (
        <div
          onClick={() => {
            if (item.path) {
              setPathname(item.path);
              navigate(item.path);
            }
          }}
        >
          {dom}
        </div>
      )}
      avatarProps={{
        src: user?.avatarUrl || undefined,
        size: 'small',
        title: user?.fullName || user?.email,
        render: (props, dom) => (
          <Dropdown
            menu={{
              items: userMenuItems,
            }}
          >
            <Space>
              {dom}
              <span style={{ color: '#666', fontSize: 14 }}>
                {currentCompany?.name || 'Şirket Seçin'}
              </span>
            </Space>
          </Dropdown>
        ),
      }}
      actionsRender={() => [
        // Dil Değiştirici
        <Select
          key="language"
          defaultValue="tr"
          style={{ width: 120 }}
          size="small"
          suffixIcon={<GlobalOutlined />}
          options={[
            { value: 'tr', label: '🇹🇷 Türkçe' },
            { value: 'en', label: '🇺🇸 English' },
          ]}
        />,
        
        // Tema Değiştirici
        <Select
          key="theme"
          value={themeMode}
          onChange={handleThemeChange}
          style={{ width: 120 }}
          size="small"
          options={[
            { 
              value: 'light', 
              label: (
                <Space>
                  <SunOutlined />
                  Açık
                </Space>
              )
            },
            { 
              value: 'dark', 
              label: (
                <Space>
                  <MoonOutlined />
                  Koyu
                </Space>
              )
            },
            { 
              value: 'semi-dark', 
              label: (
                <Space>
                  <SunOutlined />
                  Semi-Dark
                </Space>
              )
            },
            { 
              value: 'system', 
              label: (
                <Space>
                  <DesktopOutlined />
                  Sistem
                </Space>
              )
            },
          ]}
        />,
      ]}
      footerRender={() => (
        <div style={{ textAlign: 'center', color: '#999' }}>
          AccountOS © 2025 - Modern ERP & Muhasebe Sistemi
        </div>
      )}
    >
      <div 
        style={{ 
          minHeight: 'calc(100vh - 56px - 64px)',
        }}
      >
        {themeMode === 'semi-dark' ? (
          <ConfigProvider theme={{ algorithm: theme.defaultAlgorithm }}>
            <div style={{ backgroundColor: '#ffffff', color: '#000000', padding: 24, borderRadius: 8 }}>
              <Outlet />
            </div>
          </ConfigProvider>
        ) : (
          <Outlet />
        )}
      </div>
      </ProLayout>
    </ConfigProvider>
  );
};
