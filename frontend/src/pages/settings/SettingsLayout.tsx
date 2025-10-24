import React from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { PageContainer } from '@ant-design/pro-components';
import { Menu, Card } from 'antd';
import {
  UserOutlined,
  BankOutlined,
  SafetyOutlined,
  BellOutlined,
  GlobalOutlined,
  ToolOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import './SettingsLayout.css';

/**
 * Ayarlar layout'u - Sidebar menu ile
 */
export const SettingsLayout: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems: MenuProps['items'] = [
    {
      key: '/settings/account',
      icon: <UserOutlined />,
      label: t('settings.menu.account')
    },
    {
      key: '/settings/company',
      icon: <BankOutlined />,
      label: t('settings.menu.company')
    },
    {
      key: '/settings/security',
      icon: <SafetyOutlined />,
      label: t('settings.menu.security')
    },
    {
      key: '/settings/notifications',
      icon: <BellOutlined />,
      label: t('settings.menu.notifications')
    },
    {
      key: '/settings/localization',
      icon: <GlobalOutlined />,
      label: t('settings.menu.localization')
    },
    {
      key: '/settings/integrations',
      icon: <ToolOutlined />,
      label: t('settings.menu.integrations')
    }
  ];

  return (
    <PageContainer
      header={{
        title: t('settings.title'),
        breadcrumb: {
          items: [
            { title: t('menu.home'), path: '/' },
            { title: t('menu.settings') }
          ]
        }
      }}
    >
      <div className="settings-layout">
        <Card className="settings-sidebar">
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
          />
        </Card>

        <div className="settings-content">
          <Outlet />
        </div>
      </div>
    </PageContainer>
  );
};
