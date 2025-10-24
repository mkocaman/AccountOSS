import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown, Space, Typography } from 'antd';
import {
  BulbOutlined,
  BulbFilled,
  DesktopOutlined,
  CheckOutlined
} from '@ant-design/icons';
import { useTheme } from '../../hooks/useTheme';
import type { MenuProps } from 'antd';
import './ThemeSelector.css';

const { Text } = Typography;

/**
 * Tema seçici component
 * 4 mod: Açık, Koyu, Sistem, Yarı-Koyu
 */
export const ThemeSelector: React.FC = () => {
  const { t } = useTranslation();
  const { themeMode, activeTheme, changeTheme } = useTheme();

  const themeOptions = [
    {
      key: 'light',
      icon: <BulbOutlined />,
      label: t('theme.light')
    },
    {
      key: 'dark',
      icon: <BulbFilled />,
      label: t('theme.dark')
    },
    {
      key: 'semi-dark',
      icon: <BulbFilled style={{ opacity: 0.6 }} />,
      label: t('theme.semiDark')
    },
    {
      key: 'system',
      icon: <DesktopOutlined />,
      label: t('theme.system')
    }
  ];

  const menuItems: MenuProps['items'] = themeOptions.map(option => ({
    key: option.key,
    label: (
      <Space>
        {option.icon}
        <Text>{option.label}</Text>
        {themeMode === option.key && (
          <CheckOutlined style={{ color: '#52c41a' }} />
        )}
      </Space>
    ),
    onClick: () => changeTheme(option.key as any)
  }));

  const currentOption = themeOptions.find(opt => opt.key === themeMode) || themeOptions[0];

  return (
    <Dropdown
      menu={{ items: menuItems }}
      placement="bottomRight"
      trigger={['click']}
    >
      <div className="theme-selector">
        <Space>
          {currentOption.icon}
          <Text className="theme-label">{currentOption.label}</Text>
        </Space>
      </div>
    </Dropdown>
  );
};
