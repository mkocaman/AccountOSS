import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageContainer, ProCard, StatisticCard } from '@ant-design/pro-components';
import { Row, Col, Card, Select, Space, Button, Table, Tag } from 'antd';
import {
  DollarOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  TeamOutlined,
  WarningOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { Line, Column, Pie } from '@ant-design/plots';
import { useQuery } from '@tanstack/react-query';
import client from '../../utils/client';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useLowStockAlerts } from '../../hooks/useStock';
import { usePaymentSummary } from '../../hooks/usePayments';
import dayjs from 'dayjs';
import './Dashboard.css';

/**
 * Dashboard - Gerçek verilerle çalışan grafikler ve istatistikler
 */

interface DashboardStats {
  totalSales: number;
  totalPurchases: number;
  profit: number;
  profitMargin: number;
  invoiceCount: number;
  recentInvoices: number;
  lowStockProducts: number;
  activePartners: number;
  salesTrend: number; // Yüzde değişim
  purchasesTrend: number;
}

interface SalesData {
  date: string;
  sales: number;
  purchases: number;
}

interface RecentActivity {
  id: string;
  type: 'invoice' | 'payment' | 'partner';
  title: string;
  description: string;
  amount?: number;
  createdAt: string;
}

export const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  // Dashboard istatistikleri
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['dashboardStats', dateRange],
    queryFn: async () => {
      const response = await client.get(`/dashboard/stats?period=${dateRange}`);
      return response.data as DashboardStats;
    },
    staleTime: 60000 // 1 dakika
  });

  // Satış grafiği verileri
  const { data: salesData } = useQuery({
    queryKey: ['salesChart', dateRange],
    queryFn: async () => {
      const response = await client.get(`/dashboard/sales-chart?period=${dateRange}`);
      return response.data as SalesData[];
    },
    staleTime: 60000
  });

  // Son aktiviteler
  const { data: activities } = useQuery({
    queryKey: ['recentActivities'],
    queryFn: async () => {
      const response = await client.get('/dashboard/recent-activities?limit=10');
      return response.data as RecentActivity[];
    },
    staleTime: 30000 // 30 saniye
  });

  // Düşük stok uyarıları
  const { data: lowStockAlerts } = useLowStockAlerts();

  // Ödeme özeti
  const { data: paymentSummary } = usePaymentSummary(
    dayjs().startOf('month').format('YYYY-MM-DD'),
    dayjs().endOf('month').format('YYYY-MM-DD')
  );

  /**
   * Satış grafiği konfigürasyonu
   */
  const salesChartConfig = {
    data: salesData || [],
    xField: 'date',
    yField: 'value',
    seriesField: 'category',
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000
      }
    },
    color: ['#1890ff', '#52c41a'],
    legend: {
      position: 'top' as const
    },
    xAxis: {
      label: {
        formatter: (text: string) => dayjs(text).format('DD MMM')
      }
    },
    yAxis: {
      label: {
        formatter: (value: number) => formatCurrency(value)
      }
    }
  };

  // Grafik için veri dönüşümü
  const chartData = salesData?.flatMap(item => [
    { date: item.date, category: t('dashboard.sales'), value: item.sales },
    { date: item.date, category: t('dashboard.purchases'), value: item.purchases }
  ]) || [];

  /**
   * Aktivite tipi ikonu
   */
  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'invoice':
        return <FileTextOutlined style={{ color: '#1890ff' }} />;
      case 'payment':
        return <DollarOutlined style={{ color: '#52c41a' }} />;
      case 'partner':
        return <TeamOutlined style={{ color: '#faad14' }} />;
    }
  };

  return (
    <PageContainer
      header={{
        title: t('dashboard.title'),
        extra: [
          <Select
            key="dateRange"
            value={dateRange}
            onChange={setDateRange}
            options={[
              { label: t('dashboard.periods.week'), value: 'week' },
              { label: t('dashboard.periods.month'), value: 'month' },
              { label: t('dashboard.periods.quarter'), value: 'quarter' },
              { label: t('dashboard.periods.year'), value: 'year' }
            ]}
            style={{ width: 120 }}
          />,
          <Button
            key="refresh"
            icon={<ReloadOutlined />}
            onClick={() => refetchStats()}
          >
            {t('common.refresh')}
          </Button>
        ]
      }}
    >
      {/* Ana İstatistikler */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            statistic={{
              title: t('dashboard.stats.totalSales'),
              value: stats?.totalSales || 0,
              precision: 2,
              prefix: '₺',
              description: (
                <Space>
                  {stats && stats.salesTrend >= 0 ? (
                    <>
                      <TrendingUpOutlined style={{ color: '#52c41a' }} />
                      <span style={{ color: '#52c41a' }}>
                        +{stats.salesTrend}%
                      </span>
                    </>
                  ) : (
                    <>
                      <TrendingDownOutlined style={{ color: '#ff4d4f' }} />
                      <span style={{ color: '#ff4d4f' }}>
                        {stats?.salesTrend}%
                      </span>
                    </>
                  )}
                  <span>{t('dashboard.stats.vsLastPeriod')}</span>
                </Space>
              )
            }}
            chart={<div style={{ height: 50 }} />}
            chartPlacement="bottom"
            loading={statsLoading}
          />
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            statistic={{
              title: t('dashboard.stats.totalPurchases'),
              value: stats?.totalPurchases || 0,
              precision: 2,
              prefix: '₺',
              description: (
                <Space>
                  {stats && stats.purchasesTrend >= 0 ? (
                    <>
                      <TrendingUpOutlined style={{ color: '#ff4d4f' }} />
                      <span style={{ color: '#ff4d4f' }}>
                        +{stats.purchasesTrend}%
                      </span>
                    </>
                  ) : (
                    <>
                      <TrendingDownOutlined style={{ color: '#52c41a' }} />
                      <span style={{ color: '#52c41a' }}>
                        {stats?.purchasesTrend}%
                      </span>
                    </>
                  )}
                  <span>{t('dashboard.stats.vsLastPeriod')}</span>
                </Space>
              )
            }}
            loading={statsLoading}
          />
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            statistic={{
              title: t('dashboard.stats.profit'),
              value: stats?.profit || 0,
              precision: 2,
              prefix: '₺',
              description: (
                <span>
                  {t('dashboard.stats.profitMargin')}: {stats?.profitMargin}%
                </span>
              )
            }}
            loading={statsLoading}
          />
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            statistic={{
              title: t('dashboard.stats.invoiceCount'),
              value: stats?.invoiceCount || 0,
              description: (
                <span>
                  {t('dashboard.stats.recentInvoices')}: {stats?.recentInvoices}
                </span>
              )
            }}
            loading={statsLoading}
          />
        </Col>
      </Row>

      {/* İkinci Satır - Ödeme Özeti ve Uyarılar */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={8}>
          <ProCard
            title={t('dashboard.cashFlow.title')}
            headerBordered
            loading={!paymentSummary}
          >
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <StatisticCard.Group>
                  <StatisticCard
                    statistic={{
                      title: t('dashboard.cashFlow.collections'),
                      value: paymentSummary?.totalCollections || 0,
                      precision: 2,
                      prefix: '₺',
                      valueStyle: { color: '#52c41a' }
                    }}
                  />
                  <StatisticCard
                    statistic={{
                      title: t('dashboard.cashFlow.payments'),
                      value: paymentSummary?.totalPayments || 0,
                      precision: 2,
                      prefix: '₺',
                      valueStyle: { color: '#ff4d4f' }
                    }}
                  />
                </StatisticCard.Group>
              </Col>
              <Col span={24}>
                <StatisticCard
                  statistic={{
                    title: t('dashboard.cashFlow.net'),
                    value: paymentSummary?.netCashFlow || 0,
                    precision: 2,
                    prefix: '₺',
                    valueStyle: {
                      color: (paymentSummary?.netCashFlow || 0) >= 0 ? '#52c41a' : '#ff4d4f'
                    }
                  }}
                />
              </Col>
            </Row>
          </ProCard>
        </Col>

        <Col xs={24} sm={8}>
          <ProCard
            title={t('dashboard.quickStats.title')}
            headerBordered
            loading={statsLoading}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div className="quick-stat-item">
                <TeamOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                <div>
                  <div className="stat-value">{stats?.activePartners || 0}</div>
                  <div className="stat-label">{t('dashboard.quickStats.activePartners')}</div>
                </div>
              </div>

              <div className="quick-stat-item">
                <FileTextOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                <div>
                  <div className="stat-value">{stats?.recentInvoices || 0}</div>
                  <div className="stat-label">{t('dashboard.quickStats.recentInvoices')}</div>
                </div>
              </div>

              <div className="quick-stat-item">
                <WarningOutlined style={{ fontSize: 24, color: '#faad14' }} />
                <div>
                  <div className="stat-value">{lowStockAlerts?.length || 0}</div>
                  <div className="stat-label">{t('dashboard.quickStats.lowStock')}</div>
                </div>
              </div>
            </Space>
          </ProCard>
        </Col>

        <Col xs={24} sm={8}>
          <ProCard
            title={t('dashboard.lowStockAlerts.title')}
            headerBordered
            extra={
              <Button
                type="link"
                size="small"
                onClick={() => window.location.href = '/stock/levels'}
              >
                {t('common.viewAll')}
              </Button>
            }
          >
            {lowStockAlerts && lowStockAlerts.length > 0 ? (
              <Space direction="vertical" style={{ width: '100%' }}>
                {lowStockAlerts.slice(0, 5).map(alert => (
                  <div key={alert.productId} className="low-stock-item">
                    <div>
                      <strong>{alert.productCode}</strong>
                      <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                        {alert.productName}
                      </div>
                    </div>
                    <Tag color="warning">
                      {alert.currentStock} / {alert.minStockLevel}
                    </Tag>
                  </div>
                ))}
              </Space>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#8c8c8c' }}>
                {t('dashboard.lowStockAlerts.empty')}
              </div>
            )}
          </ProCard>
        </Col>
      </Row>

      {/* Satış Grafiği */}
      <ProCard
        title={t('dashboard.salesChart.title')}
        headerBordered
        style={{ marginTop: 16 }}
      >
        <Line {...salesChartConfig} data={chartData} height={300} />
      </ProCard>

      {/* Son Aktiviteler */}
      <ProCard
        title={t('dashboard.recentActivities.title')}
        headerBordered
        style={{ marginTop: 16 }}
      >
        <Table
          dataSource={activities}
          rowKey="id"
          pagination={false}
          columns={[
            {
              title: t('dashboard.recentActivities.columns.type'),
              dataIndex: 'type',
              key: 'type',
              width: 60,
              render: (type) => getActivityIcon(type)
            },
            {
              title: t('dashboard.recentActivities.columns.activity'),
              dataIndex: 'title',
              key: 'title',
              render: (title, record) => (
                <div>
                  <div><strong>{title}</strong></div>
                  <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                    {record.description}
                  </div>
                </div>
              )
            },
            {
              title: t('dashboard.recentActivities.columns.amount'),
              dataIndex: 'amount',
              key: 'amount',
              align: 'right',
              render: (amount) => amount ? formatCurrency(amount) : '-'
            },
            {
              title: t('dashboard.recentActivities.columns.date'),
              dataIndex: 'createdAt',
              key: 'createdAt',
              align: 'right',
              render: (date) => formatDate(date, 'time')
            }
          ]}
        />
      </ProCard>
    </PageContainer>
  );
};