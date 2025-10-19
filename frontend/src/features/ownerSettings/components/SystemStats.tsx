import { Card, Statistic, Row, Col, Spin } from 'antd';
import {
  TeamOutlined,
  UserOutlined,
  FileTextOutlined,
  DollarOutlined,
  DatabaseOutlined,
  ApiOutlined
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';

import { ownerSettingsApi } from '@/api/ownerSettings';

export default function SystemStats() {
  // Fetch stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ['systemStats'],
    queryFn: () => ownerSettingsApi.getSystemStats()
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">System Statistics</h3>

      <Row gutter={16} className="mb-4">
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Total Companies"
              value={stats?.totalCompanies || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Active Companies"
              value={stats?.activeCompanies || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Trial Companies"
              value={stats?.trialCompanies || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} className="mb-4">
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Total Users"
              value={stats?.totalUsers || 0}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Total Invoices"
              value={stats?.totalInvoices || 0}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Monthly Revenue"
              value={stats?.monthlyRevenue || 0}
              prefix={<DollarOutlined />}
              precision={2}
              suffix="$"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Total Storage Used"
              value={stats?.totalStorageUsed || 0}
              prefix={<DatabaseOutlined />}
              suffix="GB"
              precision={2}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="API Calls Today"
              value={stats?.apiCallsToday || 0}
              prefix={<ApiOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="API Calls This Month"
              value={stats?.apiCallsThisMonth || 0}
              prefix={<ApiOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

