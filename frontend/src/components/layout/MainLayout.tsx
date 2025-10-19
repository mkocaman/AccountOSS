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
import { Dropdown, Space, Avatar } from 'antd';
import LanguageSwitcher from '../LanguageSwitcher';

// Ana layout bileşeni - Ant Design Pro Layout ile
export const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { currentCompany } = useCompanyStore();
  const [pathname, setPathname] = useState(location.pathname);

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
            path: '/invoices',
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
            path: '/products',
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
            path: '/expense-categories',
            name: 'Masraf Kategorileri',
          },
          {
            path: '/expenses',
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
        logout();
        navigate('/login');
      },
    },
  ];

  return (
    <ProLayout
      title="AccountOS"
      logo="/logo.svg"
      layout="mix"
      navTheme="light"
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
        <LanguageSwitcher key="lang" />,
      ]}
      footerRender={() => (
        <div style={{ textAlign: 'center', color: '#999' }}>
          AccountOS © 2025 - Modern ERP & Muhasebe Sistemi
        </div>
      )}
    >
      <div style={{ minHeight: 'calc(100vh - 56px - 64px)' }}>
        <Outlet />
      </div>
    </ProLayout>
  );
};
