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
  CrownOutlined
} from '@ant-design/icons';
import { Dropdown, Space, Switch, Modal } from 'antd';
import { useAuth } from '@/hooks/useAuth';

/**
 * Ana layout bileşeni - Ant Design Pro Layout kullanır
 * Sidebar, header, footer ve içerik alanını yönetir
 */
export const ProMainLayout: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // ProLayout ayarları
  const [settings] = useState<Partial<ProSettings>>({
    fixSiderbar: true,
    layout: 'mix', // top + side layout
    splitMenus: false,
    navTheme: 'light',
    contentWidth: 'Fluid',
    colorPrimary: '#1890ff',
    siderMenuType: 'sub'
  });

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
          path: '/invoices/list',
          name: t('menu.invoiceList')
        },
        {
          path: '/invoices/create',
          name: t('menu.createInvoice')
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
   * Kullanıcı menüsü
   */
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: t('menu.profile'),
      onClick: () => navigate('/profile')
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: t('menu.settings'),
      onClick: () => navigate('/settings')
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

  /**
   * Dil değiştirme handler'ı
   */
  const handleLanguageChange = (checked: boolean) => {
    const newLang = checked ? 'en' : 'tr';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

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
        src: user?.avatar || 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
        size: 'small',
        title: user?.name || 'User',
        render: (_, avatarChildren) => (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            {avatarChildren}
          </Dropdown>
        )
      }}
      actionsRender={() => [
        // Dil seçici
        <Space key="language">
          <span>TR</span>
          <Switch
            checked={i18n.language === 'en'}
            onChange={handleLanguageChange}
            size="small"
          />
          <span>EN</span>
        </Space>
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
    </ProLayout>
  );
};
