import React, { useState } from 'react';
import { Card, Tabs } from 'antd';
import {
  SettingOutlined,
  FlagOutlined,
  BgColorsOutlined,
  FileTextOutlined,
  UserOutlined,
  BellOutlined
} from '@ant-design/icons';

import GeneralSettings from './components/GeneralSettings';
import FeatureFlagsSettings from './components/FeatureFlagsSettings';
import WhiteLabelSettings from './components/WhiteLabelSettings';
import InvoiceSettings from './components/InvoiceSettings';
import UserPreferencesSettings from './components/UserPreferencesSettings';
import NotificationSettings from './components/NotificationSettings';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ayarlar</h1>
        <p className="text-gray-600 mt-1">
          Şirket ayarları ve yapılandırma
        </p>
      </div>

      {/* Settings Tabs */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          tabPosition="left"
          items={[
            {
              key: 'general',
              label: (
                <span>
                  <SettingOutlined />
                  <span className="ml-2">Genel Ayarlar</span>
                </span>
              ),
              children: <GeneralSettings />
            },
            {
              key: 'features',
              label: (
                <span>
                  <FlagOutlined />
                  <span className="ml-2">Özellikler</span>
                </span>
              ),
              children: <FeatureFlagsSettings />
            },
            {
              key: 'whitelabel',
              label: (
                <span>
                  <BgColorsOutlined />
                  <span className="ml-2">Tema & Logo</span>
                </span>
              ),
              children: <WhiteLabelSettings />
            },
            {
              key: 'invoice',
              label: (
                <span>
                  <FileTextOutlined />
                  <span className="ml-2">Fatura Ayarları</span>
                </span>
              ),
              children: <InvoiceSettings />
            },
            {
              key: 'notifications',
              label: (
                <span>
                  <BellOutlined />
                  <span className="ml-2">Bildirimler</span>
                </span>
              ),
              children: <NotificationSettings />
            },
            {
              key: 'preferences',
              label: (
                <span>
                  <UserOutlined />
                  <span className="ml-2">Kişisel Tercihler</span>
                </span>
              ),
              children: <UserPreferencesSettings />
            }
          ]}
        />
      </Card>
    </div>
  );
}
