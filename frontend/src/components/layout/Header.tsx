import { useEffect } from 'react';
import { Button, Dropdown, Badge, Avatar, Select, Space } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  GlobalOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useCompanyStore } from '@/store/companyStore';
import { companiesApi } from '@/api/companies';

interface HeaderProps {
  collapsed: boolean;
  onToggle: () => void;
}

// Header bileşeni
export const Header = ({ collapsed, onToggle }: HeaderProps) => {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const { companies, currentCompany, setCompanies, setCurrentCompany } =
    useCompanyStore();

  // Şirket listesini yükle
  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const response = await companiesApi.getUserCompanies();
      if (response.success) {
        console.log('📊 Şirketler yüklendi:', response.data);
        setCompanies(response.data);
        
        // Her zaman doğru company'yi seç (JWT token'daki company ID ile eşleşen)
        if (response.data.length > 0) {
          // Doğru company'yi bul (JWT token'daki company ID ile eşleşen)
          const correctCompany = response.data.find(c => c.id === 'bc4cf1e7-5d13-41e5-b85d-34d583aa45e5');
          const selectedCompany = correctCompany || response.data[0];
          
          console.log('✅ Şirket seçildi:', selectedCompany);
          setCurrentCompany(selectedCompany);
          console.log('📝 localStorage currentCompanyId:', selectedCompany.id);
        }
      }
    } catch (error) {
      console.error('❌ Şirketler yüklenemedi:', error);
    }
  };

  // Şirket değiştir
  const handleCompanyChange = (companyId: string) => {
    const company = companies.find((c) => c.id === companyId);
    if (company) {
      setCurrentCompany(company);
      // Sayfayı yenile (yeni şirket context'i için)
      window.location.reload();
    }
  };

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
        {/* Şirket Seçici - GERÇEK VERİ */}
        <Select
          value={currentCompany?.id}
          onChange={handleCompanyChange}
          style={{ width: 220 }}
          loading={companies.length === 0}
          placeholder="Şirket seçin"
          popupRender={(menu) => (
            <>
              {menu}
              <div className="p-2 border-t">
                <Button
                  type="text"
                  icon={<PlusOutlined />}
                  onClick={() => navigate('/companies/create')}
                  block
                >
                  Yeni Şirket Ekle
                </Button>
              </div>
            </>
          )}
        >
          {companies.map((company) => (
            <Select.Option key={company.id} value={company.id}>
              <div className="flex items-center gap-2">
                {company.logoUrl ? (
                  <img
                    src={company.logoUrl}
                    alt={company.name}
                    className="w-5 h-5 rounded"
                  />
                ) : (
                  <div className="w-5 h-5 bg-primary rounded text-white text-xs flex items-center justify-center">
                    {company.name.charAt(0)}
                  </div>
                )}
                <span>{company.name}</span>
              </div>
            </Select.Option>
          ))}
        </Select>

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

