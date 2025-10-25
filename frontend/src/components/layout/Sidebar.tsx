import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
} from '@ant-design/icons';

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

// Sidebar bileşeni
export const Sidebar = ({ collapsed, onCollapse }: SidebarProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // Menü yapısı - i18n ile
  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: t('menu.dashboard'),
    },
    {
      key: 'invoices',
      icon: <FileTextOutlined />,
      label: t('menu.invoices'),
      children: [
        { key: '/invoices', label: t('menu.invoiceList') },
        { key: '/invoices/create', label: t('menu.newInvoice') },
        { key: '/invoices/edit/:id', label: t('menu.editInvoice'), hideInMenu: true },
        { key: '/invoices/:id', label: t('menu.invoiceDetail'), hideInMenu: true },
      ],
    },
    {
      key: '/gr-queue',
      icon: <SwapOutlined />,
      label: t('menu.grQueue'),
    },
    {
      key: '/reports',
      icon: <BarChartOutlined />,
      label: t('menu.reports'),
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: t('menu.settings'),
    },
    {
      key: '/partners',
      icon: <UserOutlined />,
      label: t('menu.currentAccounts'),
    },
    {
      key: 'sales',
      icon: <SolutionOutlined />,
      label: t('menu.sales'),
      children: [
        { key: '/quotations', label: t('menu.quotations') },
        { key: '/sales-orders', label: t('menu.salesOrders') },
        { key: '/invoices', label: t('menu.invoices') },
        { key: '/sales-reports', label: t('menu.salesReports') },
      ],
    },
    {
      key: 'products',
      icon: <ShoppingOutlined />,
      label: t('menu.products'),
      children: [
        { key: '/products', label: t('menu.productList') },
        { key: '/products/categories', label: t('menu.categories') },
        { key: '/stock-movements', label: t('menu.stockMovements') },
        { key: '/products/low-stock', label: t('menu.lowStock') },
        { key: '/products/out-of-stock', label: t('menu.outOfStock') },
      ],
    },
    {
      key: 'purchase',
      icon: <ShoppingCartOutlined />,
      label: t('menu.purchasing'),
      children: [
        { key: '/purchase-orders', label: t('menu.purchaseOrders') },
        { key: '/goods-receipts', label: t('menu.goodsReceipts') },
        { key: '/purchase-reports', label: t('menu.purchaseReports') },
        { key: '/supplier-reports', label: t('menu.supplierReports') },
      ],
    },
    {
      key: 'finance',
      icon: <DollarOutlined />,
      label: t('menu.finance'),
      children: [
        { key: '/payments', label: t('menu.paymentsReceivables') },
        { key: '/cash-accounts', label: t('menu.cash') },
        { key: '/bank-accounts', label: t('menu.bank') },
        { key: '/tax-rates', label: t('menu.taxRates') },
        { key: '/currencies', label: t('menu.currencies') },
        { key: '/financial-reports', label: t('menu.financialReports') },
      ],
    },
    {
      key: 'expenses',
      icon: <WalletOutlined />,
      label: t('menu.expenses'),
      children: [
        { key: '/expense-categories', label: t('menu.categories') },
        { key: '/expenses', label: t('menu.expenseList') },
      ],
    },
    {
      key: 'accounting',
      icon: <BankOutlined />,
      label: t('menu.accounting'),
      children: [
        { key: '/chart-of-accounts', label: t('menu.chartOfAccounts') },
        { key: '/trial-balance', label: t('menu.trialBalance') },
        { key: '/journal-entries', label: t('menu.journalEntries') },
        { key: '/journal-entries/ledger', label: t('menu.accountLedger') },
        { key: '/accounting-reports', label: t('menu.accountingReports') },
        { key: '/balance-sheet', label: t('menu.balanceSheet') },
      ],
    },
    {
      key: 'uzbekistan',
      icon: <FileProtectOutlined />,
      label: t('menu.uzbekistan'),
      children: [
        { key: '/contracts', label: t('menu.contracts') },
        { key: '/power-of-attorney', label: t('menu.powerOfAttorney') },
        { key: '/uzbekistan-reports', label: t('menu.uzbekistanReports') },
        { key: '/legal-documents', label: t('menu.legalDocuments') },
      ],
    },
    {
      key: 'owner',
      icon: <CrownOutlined />,
      label: t('menu.ownerPanel'),
      children: [
        { key: '/owner/settings', label: t('menu.systemSettings') },
        { key: '/owner/companies', label: t('menu.companyManagement') },
        { key: '/owner/tenants', label: t('menu.tenantManagement') },
        { key: '/owner/billing', label: t('menu.billingSettings') },
        { key: '/owner/security', label: t('menu.securitySettings') },
        { key: '/owner/email', label: t('menu.emailConfiguration') },
        { key: '/owner/stats', label: t('menu.systemStats') },
      ],
    },
    {
      key: 'reports',
      icon: <BarChartOutlined />,
      label: t('menu.reports'),
      children: [
        { key: '/reports/profit-loss', label: t('menu.profitLoss') },
        { key: '/reports/stock', label: t('menu.stockReport') },
        { key: '/reports/fifo', label: t('menu.fifoCost') },
        { key: '/reports/gr-balance', label: t('menu.grBalance') },
        { key: '/reports/sales', label: t('menu.salesReports') },
        { key: '/reports/purchase', label: t('menu.purchaseReports') },
        { key: '/reports/financial', label: t('menu.financialReports') },
        { key: '/reports/accounting', label: t('menu.accountingReports') },
      ],
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: t('menu.settings'),
      children: [
        { key: '/settings/company', label: t('menu.companyInfo') },
        { key: '/settings/users', label: t('menu.users') },
        { key: '/settings/preferences', label: t('menu.preferences') },
        { key: '/settings/email', label: t('menu.emailSettings') },
        { key: '/settings/backup', label: t('menu.backupRestore') },
        { key: '/settings/security', label: t('menu.securitySettings') },
      ],
    },
  ];

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
              <div className="text-xs text-gray-500">{t('menu.erpAccounting')}</div>
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

