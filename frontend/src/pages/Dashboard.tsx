import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Spin,
  Button,
  DatePicker,
  Select,
  Space,
  message,
} from 'antd';
import {
  DollarOutlined,
  ShoppingCartOutlined,
  RiseOutlined,
  FileTextOutlined,
  UserOutlined,
  InboxOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { StatisticsCard } from './dashboard/StatisticsCard';
import { dashboardService } from '@/services/dashboardService';
import type { DashboardData, DashboardFilter } from '@/types/dashboard';

const { RangePicker } = DatePicker;

export const Dashboard: React.FC = () => {
  const { t } = useTranslation();

  // Filtre state
  const [filter, setFilter] = useState<DashboardFilter>({
    period: 'thisMonth',
  });

  // Dashboard verilerini getir
  const {
    data: dashboardData,
    isLoading,
    error,
    refetch,
  } = useQuery<DashboardData>({
    queryKey: ['dashboard', filter],
    queryFn: () => dashboardService.getDashboardData(filter),
    staleTime: 5 * 60 * 1000, // 5 dakika
    retry: 1,
  });

  // Hata durumu
  useEffect(() => {
    if (error) {
      message.error(t('dashboard.messages.loadError'));
    }
  }, [error, t]);

  // Para formatı
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Yüzde formatı
  const formatPercent = (value: number) => {
    return `%${value.toFixed(1)}`;
  };

  // Dönem değiştir
  const handlePeriodChange = (period: DashboardFilter['period']) => {
    setFilter({ period });
  };

  // Özel tarih aralığı
  const handleDateRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      setFilter({
        period: 'custom',
        startDate: dates[0].format('YYYY-MM-DD'),
        endDate: dates[1].format('YYYY-MM-DD'),
      });
    }
  };

  // Yenile
  const handleRefresh = () => {
    refetch();
    message.success(t('dashboard.messages.dataUpdated'));
  };

  // Loading state
  if (isLoading && !dashboardData) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16, color: '#8c8c8c' }}>
          {t('common.loading')}
        </div>
      </div>
    );
  }

  const stats = dashboardData?.statistics;

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <h1 style={{ fontSize: 28, fontWeight: 600, margin: 0 }}>
            {t('dashboard.title')}
          </h1>
          <p style={{ color: '#8c8c8c', margin: '8px 0 0' }}>
            {t('dashboard.overview')}
          </p>
        </Col>

        {/* Filtreler */}
        <Col>
          <Space size="middle">
            {/* Dönem seçici */}
            <Select
              value={filter.period}
              onChange={handlePeriodChange}
              style={{ width: 150 }}
              options={[
                { label: t('dashboard.periods.today'), value: 'today' },
                { label: t('dashboard.periods.thisWeek'), value: 'thisWeek' },
                { label: t('dashboard.periods.thisMonth'), value: 'thisMonth' },
                { label: t('dashboard.periods.thisQuarter'), value: 'thisQuarter' },
                { label: t('dashboard.periods.thisYear'), value: 'thisYear' },
                { label: t('dashboard.periods.custom'), value: 'custom' },
              ]}
            />

            {/* Özel tarih aralığı */}
            {filter.period === 'custom' && (
              <RangePicker onChange={handleDateRangeChange} />
            )}

            {/* Yenile butonu */}
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={isLoading}
            >
              {t('dashboard.filters.reset')}
            </Button>
          </Space>
        </Col>
      </Row>

      {/* İstatistik Kartları */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* Toplam Satış */}
        <Col xs={24} sm={12} lg={6}>
          <StatisticsCard
            title={t('dashboard.stats.totalSales')}
            value={formatCurrency(stats?.totalSales || 0)}
            icon={<DollarOutlined />}
            color="green"
            change={stats?.salesChange}
            loading={isLoading}
            tooltip={t('dashboard.stats.recentInvoices')}
          />
        </Col>

        {/* Toplam Alış */}
        <Col xs={24} sm={12} lg={6}>
          <StatisticsCard
            title={t('dashboard.stats.totalPurchases')}
            value={formatCurrency(stats?.totalPurchases || 0)}
            icon={<ShoppingCartOutlined />}
            color="orange"
            change={stats?.purchasesChange}
            loading={isLoading}
          />
        </Col>

        {/* Net Kâr */}
        <Col xs={24} sm={12} lg={6}>
          <StatisticsCard
            title={t('dashboard.stats.netProfit')}
            value={formatCurrency(stats?.netProfit || 0)}
            icon={<RiseOutlined />}
            color="blue"
            change={stats?.profitChange}
            loading={isLoading}
          />
        </Col>

        {/* Kâr Marjı */}
        <Col xs={24} sm={12} lg={6}>
          <StatisticsCard
            title={t('dashboard.stats.profitMargin')}
            value={formatPercent(stats?.profitMargin || 0)}
            icon={<RiseOutlined />}
            color="purple"
            loading={isLoading}
          />
        </Col>
      </Row>

      {/* İkinci Sıra İstatistikler */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* Toplam Faturalar */}
        <Col xs={24} sm={12} lg={6}>
          <StatisticsCard
            title={t('dashboard.stats.totalInvoices')}
            value={stats?.totalInvoices || 0}
            icon={<FileTextOutlined />}
            color="blue"
            change={stats?.invoiceChange}
            loading={isLoading}
          />
        </Col>

        {/* Ödenen Faturalar */}
        <Col xs={24} sm={12} lg={6}>
          <StatisticsCard
            title={t('dashboard.stats.paidInvoices')}
            value={stats?.paidInvoices || 0}
            icon={<FileTextOutlined />}
            color="green"
            loading={isLoading}
          />
        </Col>

        {/* Bekleyen Faturalar */}
        <Col xs={24} sm={12} lg={6}>
          <StatisticsCard
            title={t('dashboard.stats.pendingInvoices')}
            value={stats?.pendingInvoices || 0}
            icon={<FileTextOutlined />}
            color="orange"
            loading={isLoading}
          />
        </Col>

        {/* Vadesi Geçen Faturalar */}
        <Col xs={24} sm={12} lg={6}>
          <StatisticsCard
            title={t('dashboard.stats.overdueInvoices')}
            value={stats?.overdueInvoices || 0}
            icon={<FileTextOutlined />}
            color="red"
            loading={isLoading}
          />
        </Col>
      </Row>

      {/* Üçüncü Sıra İstatistikler */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* Aktif Müşteriler */}
        <Col xs={24} sm={12} lg={8}>
          <StatisticsCard
            title={t('dashboard.stats.activeCustomers')}
            value={stats?.activeCustomers || 0}
            icon={<UserOutlined />}
            color="blue"
            loading={isLoading}
          />
        </Col>

        {/* Toplam Ürünler */}
        <Col xs={24} sm={12} lg={8}>
          <StatisticsCard
            title={t('dashboard.stats.totalProducts')}
            value={stats?.totalProducts || 0}
            icon={<InboxOutlined />}
            color="purple"
            loading={isLoading}
          />
        </Col>

        {/* Düşük Stoklu Ürünler */}
        <Col xs={24} sm={12} lg={8}>
          <StatisticsCard
            title={t('dashboard.stats.lowStockProducts')}
            value={stats?.lowStockProducts || 0}
            icon={<InboxOutlined />}
            color={stats?.lowStockProducts && stats.lowStockProducts > 0 ? 'red' : 'green'}
            loading={isLoading}
            tooltip={t('dashboard.lowStockAlerts.description')}
          />
        </Col>
      </Row>

      {/* Grafikler ve Diğer Bileşenler buraya eklenecek (Task 6, 7, 8) */}
      
      {/* Placeholder for Charts */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card
            title={t('dashboard.charts.salesTrend')}
            loading={isLoading}
            bordered={false}
            style={{ height: 400 }}
          >
            {/* SalesChart component buraya gelecek */}
            <div style={{ textAlign: 'center', padding: '100px 0', color: '#8c8c8c' }}>
              📊 {t('dashboard.charts.salesTrend')} - Coming in Task 6
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title={t('dashboard.charts.topProducts')}
            loading={isLoading}
            bordered={false}
            style={{ height: 400 }}
          >
            {/* TopProductsChart component buraya gelecek */}
            <div style={{ textAlign: 'center', padding: '100px 0', color: '#8c8c8c' }}>
              📈 {t('dashboard.charts.topProducts')} - Coming in Task 6
            </div>
          </Card>
        </Col>
      </Row>

      {/* Placeholder for Recent Activities & Low Stock */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            title={t('dashboard.recentActivities.title')}
            loading={isLoading}
            bordered={false}
          >
            {/* RecentActivities component buraya gelecek */}
            <div style={{ textAlign: 'center', padding: '50px 0', color: '#8c8c8c' }}>
              📋 {t('dashboard.recentActivities.title')} - Coming in Task 7
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title={t('dashboard.lowStockAlerts.title')}
            loading={isLoading}
            bordered={false}
          >
            {/* LowStockAlerts component buraya gelecek */}
            <div style={{ textAlign: 'center', padding: '50px 0', color: '#8c8c8c' }}>
              ⚠️ {t('dashboard.lowStockAlerts.title')} - Coming in Task 8
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
