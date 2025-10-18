import { Button, Dropdown, Badge, Avatar, Select, Space } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface HeaderProps {
  collapsed: boolean;
  onToggle: () => void;
}

// Header bileşeni
export const Header = ({ collapsed, onToggle }: HeaderProps) => {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();

  // Çıkış yap
  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  // User dropdown menü
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profilim',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Ayarlar',
      onClick: () => navigate('/settings'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Çıkış Yap',
      onClick: handleLogout,
      danger: true,
    },
  ];

  return (
    <div className="bg-white shadow-sm px-6 py-3 flex items-center justify-between">
      {/* Sol Taraf: Toggle + Logo */}
      <div className="flex items-center gap-4">
        {/* Sidebar toggle */}
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggle}
          className="text-lg"
        />

        {/* Logo (collapsed ise göster) */}
        {collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
              A
            </div>
            <span className="text-xl font-bold">AccountOS</span>
          </div>
        )}
      </div>

      {/* Sağ Taraf: Actions */}
      <Space size="middle">
        {/* Şirket Seçici (TODO: Gerçek şirket listesi) */}
        <Select
          defaultValue="company1"
          style={{ width: 200 }}
          options={[
            { value: 'company1', label: 'Test Company' },
            { value: 'company2', label: 'Demo Company' },
          ]}
          placeholder="Şirket seçin"
        />

        {/* Dil Seçici */}
        <Dropdown
          menu={{
            items: [
              { key: 'tr', label: '🇹🇷 Türkçe' },
              { key: 'en', label: '🇬🇧 English' },
              { key: 'ru', label: '🇷🇺 Русский' },
            ],
          }}
        >
          <Button type="text" icon={<GlobalOutlined />} />
        </Dropdown>

        {/* Bildirimler */}
        <Badge count={5} size="small">
          <Button
            type="text"
            icon={<BellOutlined className="text-lg" />}
            onClick={() => navigate('/notifications')}
          />
        </Badge>

        {/* User Menu */}
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded">
            <Avatar icon={<UserOutlined />} />
            <div className="text-left">
              <div className="text-sm font-medium">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="text-xs text-gray-500">{user?.email}</div>
            </div>
          </div>
        </Dropdown>
      </Space>
    </div>
  );
};

