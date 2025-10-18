import { useState } from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

const { Content } = Layout;

// Ana layout bileşeni
export const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout className="min-h-screen">
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />

      {/* Main Content Area */}
      <Layout>
        {/* Header */}
        <Header collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

        {/* Content */}
        <Content className="m-6">
          <div className="bg-white rounded-lg shadow-sm p-6 min-h-[calc(100vh-140px)]">
            <Outlet />
          </div>
        </Content>

        {/* Footer */}
        <Layout.Footer className="text-center text-gray-500">
          AccountOS © 2025 - Modern ERP & Muhasebe Sistemi
        </Layout.Footer>
      </Layout>
    </Layout>
  );
};

