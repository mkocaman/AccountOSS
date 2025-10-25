import React, { useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, Space } from 'antd';
import {
  DollarOutlined,
  FileTextOutlined,
  ShoppingOutlined,
  UserOutlined,
  RiseOutlined,
  FallOutlined
} from '@ant-design/icons';

const { Title } = Typography;

/**
 * Dashboard - Ana sayfa
 * Özet istatistikler ve hızlı erişim
 */
const Dashboard: React.FC = () => {
  useEffect(() => {
    console.log('📊 Dashboard yüklendi');
  }, []);

  // Geçici mock data - Backend hazır olunca useQuery ile değiştirilecek
  const stats = {
    totalRevenue: 125000,
    revenueGrowth: 12.5,
    totalInvoices: 48,
    invoiceGrowth: 8,
    totalProducts: 156,
    lowStockCount: 12,
    totalCustomers: 89,
    customerGrowth: 15
  };

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Title level={2}>Dashboard</Title>

        {/* İstatistik Kartları */}
        <Row gutter={[16, 16]}>
          {/* Toplam Gelir */}
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Toplam Gelir"
                value={stats.totalRevenue}
                precision={2}
                valueStyle={{ color: '#3f8600' }}
                prefix={<DollarOutlined />}
                suffix="₺"
              />
              <div style={{ marginTop: 8 }}>
                <RiseOutlined style={{ color: '#3f8600' }} />
                <span style={{ marginLeft: 4, color: '#3f8600' }}>
                  {stats.revenueGrowth}%
                </span>
              </div>
            </Card>
          </Col>

          {/* Faturalar */}
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Toplam Fatura"
                value={stats.totalInvoices}
                prefix={<FileTextOutlined />}
              />
              <div style={{ marginTop: 8 }}>
                <RiseOutlined style={{ color: '#3f8600' }} />
                <span style={{ marginLeft: 4, color: '#3f8600' }}>
                  {stats.invoiceGrowth}%
                </span>
              </div>
            </Card>
          </Col>

          {/* Ürünler */}
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Ürün Sayısı"
                value={stats.totalProducts}
                prefix={<ShoppingOutlined />}
              />
              {stats.lowStockCount > 0 && (
                <div style={{ marginTop: 8, color: '#cf1322' }}>
                  {stats.lowStockCount} ürün düşük stokta
                </div>
              )}
            </Card>
          </Col>

          {/* Müşteriler */}
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Müşteri Sayısı"
                value={stats.totalCustomers}
                prefix={<UserOutlined />}
              />
              <div style={{ marginTop: 8 }}>
                <RiseOutlined style={{ color: '#3f8600' }} />
                <span style={{ marginLeft: 4, color: '#3f8600' }}>
                  {stats.customerGrowth}%
                </span>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Hızlı Erişim Bilgilendirmesi */}
        <Card title="Hoş Geldiniz!" style={{ marginTop: 16 }}>
          <Typography.Paragraph>
            AccountOS muhasebe sisteminize hoş geldiniz. Sol menüden tüm modüllere erişebilirsiniz.
          </Typography.Paragraph>
          <Typography.Paragraph>
            <strong>Not:</strong> Dashboard istatistikleri şu an mock data göstermektedir. 
            Backend API entegrasyonu tamamlandığında gerçek veriler görüntülenecektir.
          </Typography.Paragraph>
        </Card>
      </Space>
    </div>
  );
};

export default Dashboard;