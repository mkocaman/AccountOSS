import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  FileTextOutlined,
  UserOutlined,
  ShoppingOutlined,
  DollarOutlined,
  BarChartOutlined,
  SettingOutlined,
  ShoppingCartOutlined,
  BankOutlined,
  SwapOutlined,
  SolutionOutlined,
  FileProtectOutlined,
  CrownOutlined,
  WalletOutlined,
  FolderOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

// Menü yapısı
const menuItems = [
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    label: 'Dashboard',
  },
  {
    key: 'invoices',
    icon: <FileTextOutlined />,
    label: 'Faturalar',
    children: [
      { key: '/invoices', label: 'Fatura Listesi' },
      { key: '/invoices/create', label: 'Yeni Fatura' },
    ],
  },
  {
    key: '/gr-queue',
    icon: <SwapOutlined />,
    label: 'GR Kuyruğu',
  },
  {
    key: '/reports',
    icon: <BarChartOutlined />,
    label: 'Raporlar',
  },
  {
    key: '/settings',
    icon: <SettingOutlined />,
    label: 'Ayarlar',
  },
  {
    key: '/partners',
    icon: <UserOutlined />,
    label: 'Cari Hesaplar',
  },
  {
    key: 'sales',
    icon: <SolutionOutlined />,
    label: 'Satış',
    children: [
      { key: '/quotations', label: 'Teklifler' },
      { key: '/sales-orders', label: 'Satış Siparişleri' },
    ],
  },
  {
    key: 'products',
    icon: <ShoppingOutlined />,
    label: 'Ürünler',
    children: [
      { key: '/products', label: 'Ürün Listesi' },
      { key: '/categories', label: 'Kategoriler' },
      { key: '/stock-movements', label: 'Stok Hareketleri' },
    ],
  },
  {
    key: 'purchase',
    icon: <ShoppingCartOutlined />,
    label: 'Satın Alma',
    children: [
      { key: '/purchase-orders', label: 'Satın Alma Siparişleri' },
      { key: '/goods-receipts', label: 'Mal Kabul' },
    ],
  },
  {
    key: 'finance',
    icon: <DollarOutlined />,
    label: 'Finans',
    children: [
      { key: '/payments', label: 'Tahsilat/Ödeme' },
      { key: '/cash-accounts', label: 'Kasa' },
      { key: '/bank-accounts', label: 'Banka' },
    ],
  },
  {
    key: 'expenses',
    icon: <WalletOutlined />,
    label: 'Masraflar',
    children: [
      { key: '/expense-categories', label: 'Kategoriler' },
      { key: '/expenses', label: 'Masraflar' },
    ],
  },
          {
            key: 'accounting',
            icon: <BankOutlined />,
            label: 'Muhasebe',
            children: [
              { key: '/chart-of-accounts', label: 'Hesap Planı' },
              { key: '/journal-entries', label: 'Yevmiye' },
              { key: '/trial-balance', label: 'Mizan' },
              { key: '/tax-rates', label: 'Vergi Oranları' },
            ],
          },
          {
            key: 'uzbekistan',
            icon: <FileProtectOutlined />,
            label: 'Özbekistan',
            children: [
              { key: '/contracts', label: 'Sözleşmeler' },
              { key: '/power-of-attorney', label: 'Vekalet Belgeleri' },
            ],
          },
          {
            key: 'owner',
            icon: <CrownOutlined />,
            label: 'Owner Panel',
            children: [
              { key: '/owner/settings', label: 'System Settings' },
            ],
          },
  {
    key: 'reports',
    icon: <BarChartOutlined />,
    label: 'Raporlar',
    children: [
      { key: '/reports/profit-loss', label: 'Kar/Zarar' },
      { key: '/reports/stock', label: 'Stok Raporu' },
      { key: '/reports/fifo', label: 'FIFO Maliyet' },
      { key: '/reports/gr-balance', label: 'GR Bakiyesi' },
    ],
  },
  {
    key: 'settings',
    icon: <SettingOutlined />,
    label: 'Ayarlar',
    children: [
      { key: '/settings/company', label: 'Şirket Bilgileri' },
      { key: '/settings/users', label: 'Kullanıcılar' },
      { key: '/settings/preferences', label: 'Tercihler' },
    ],
  },
];

// Sidebar bileşeni
export const Sidebar = ({ collapsed, onCollapse }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Menü tıklama
  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  // Aktif menü key'i bul
  const getSelectedKeys = () => {
    return [location.pathname];
  };

  // Açık menü key'lerini bul (parent menüler)
  const getOpenKeys = () => {
    const path = location.pathname;
    const openKeys: string[] = [];

    menuItems.forEach((item) => {
      if (item.children) {
        const hasActiveChild = item.children.some(
          (child) => child.key === path
        );
        if (hasActiveChild) {
          openKeys.push(item.key);
        }
      }
    });

    return openKeys;
  };

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      width={250}
      className="shadow-sm"
      theme="light"
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b">
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">
              A
            </div>
            <div>
              <div className="text-lg font-bold">AccountOS</div>
              <div className="text-xs text-gray-500">ERP & Muhasebe</div>
            </div>
          </div>
        ) : (
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">
            A
          </div>
        )}
      </div>

      {/* Menu */}
      <Menu
        mode="inline"
        selectedKeys={getSelectedKeys()}
        defaultOpenKeys={getOpenKeys()}
        items={menuItems}
        onClick={handleMenuClick}
        className="border-0"
      />
    </Sider>
  );
};

