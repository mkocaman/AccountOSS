import React from 'react';
import { Dropdown, Space, Typography, Spin } from 'antd';
import { GlobalOutlined, CheckOutlined } from '@ant-design/icons';
import { useLanguages } from '../../hooks/useLanguages';
import type { MenuProps } from 'antd';
import './LanguageSelector.css';

const { Text } = Typography;

/**
 * Dil seçici component - DB'den dilleri getirir
 */
export const LanguageSelector: React.FC = () => {
  const { languages, currentLanguage, changeLanguage, isLoading, isChanging } = useLanguages();

  // Dropdown menu items
  const menuItems: MenuProps['items'] = languages.map(lang => ({
    key: lang.code,
    label: (
      <Space>
        <span style={{ fontSize: 18 }}>{lang.flag}</span>
        <Text>{lang.name}</Text>
        {currentLanguage?.code === lang.code && (
          <CheckOutlined style={{ color: '#52c41a' }} />
        )}
      </Space>
    ),
    onClick: () => changeLanguage(lang.code)
  }));

  if (isLoading) {
    return <Spin size="small" />;
  }

  return (
    <Dropdown
      menu={{ items: menuItems }}
      placement="bottomRight"
      trigger={['click']}
      disabled={isChanging}
    >
      <div className="language-selector">
        <Space>
          <GlobalOutlined style={{ fontSize: 16 }} />
          <span style={{ fontSize: 18 }}>{currentLanguage?.flag}</span>
          <Text>{currentLanguage?.name}</Text>
        </Space>
      </div>
    </Dropdown>
  );
};
