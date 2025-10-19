import { useState } from 'react';
import { Card, Tabs, Alert } from 'antd';
import {
  SettingOutlined,
  TeamOutlined,
  SecurityScanOutlined,
  MailOutlined,
  DollarOutlined,
  BarChartOutlined
} from '@ant-design/icons';

import { usePageTitle } from '@/hooks/usePageTitle';
import SystemConfiguration from './components/SystemConfiguration';
import CompanyManagement from './components/CompanyManagement';
import SecuritySettings from './components/SecuritySettings';
import EmailConfiguration from './components/EmailConfiguration';
import BillingSettings from './components/BillingSettings';
import SystemStats from './components/SystemStats';

export default function OwnerSettingsPage() {
  usePageTitle('Owner Settings');
  const [activeTab, setActiveTab] = useState('system');

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Owner Settings</h1>
        <p className="text-gray-600 mt-1">
          System-wide configuration and management (Super Admin Only)
        </p>
      </div>

      <Alert
        message="Super Admin Access"
        description="These settings affect the entire system and all companies. Use with caution."
        type="warning"
        showIcon
        className="mb-4"
      />

      {/* Settings Tabs */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          tabPosition="left"
          items={[
            {
              key: 'system',
              label: (
                <span>
                  <SettingOutlined />
                  <span className="ml-2">System Config</span>
                </span>
              ),
              children: <SystemConfiguration />
            },
            {
              key: 'companies',
              label: (
                <span>
                  <TeamOutlined />
                  <span className="ml-2">Companies</span>
                </span>
              ),
              children: <CompanyManagement />
            },
            {
              key: 'security',
              label: (
                <span>
                  <SecurityScanOutlined />
                  <span className="ml-2">Security</span>
                </span>
              ),
              children: <SecuritySettings />
            },
            {
              key: 'email',
              label: (
                <span>
                  <MailOutlined />
                  <span className="ml-2">Email Config</span>
                </span>
              ),
              children: <EmailConfiguration />
            },
            {
              key: 'billing',
              label: (
                <span>
                  <DollarOutlined />
                  <span className="ml-2">Billing</span>
                </span>
              ),
              children: <BillingSettings />
            },
            {
              key: 'stats',
              label: (
                <span>
                  <BarChartOutlined />
                  <span className="ml-2">Statistics</span>
                </span>
              ),
              children: <SystemStats />
            }
          ]}
        />
      </Card>
    </div>
  );
}

