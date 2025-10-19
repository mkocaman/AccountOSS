import { useState } from 'react';
import { 
  Row, 
  Col, 
  DatePicker,
  Alert,
  Progress
} from 'antd';
import {
  DollarOutlined,
  ShoppingCartOutlined,
  CreditCardOutlined,
  TrophyOutlined,
  FileTextOutlined,
  FallOutlined
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { PageContainer, ProCard, StatisticCard } from '@ant-design/pro-components';
import RcResizeObserver from 'rc-resize-observer';

const { RangePicker } = DatePicker;
const { Statistic, Divider } = StatisticCard;

// Dashboard filter type
interface DashboardFilters {
  startDate?: string;
  endDate?: string;
  currency?: string;
}

/**
 * Dashboard sayfası - ProCard ve StatisticCard ile
 */
export default function Dashboard() {
  const { t } = useTranslation();
  const [responsive, setResponsive] = useState(false);
  
  // Dashboard filters
  const [filters, setFilters] = useState<DashboardFilters>({
    startDate: dayjs().subtract(30, 'days').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD'),
    currency: 'TRY'
  });

  // Dashboard loading state removed since APIs are disabled

  return (
    <PageContainer
      header={{
        title: t('dashboard.title'),
        subTitle: t('dashboard.subtitle'),
        breadcrumb: {
          items: [
            { title: t('menu.home') },
            { title: t('dashboard.title') }
          ]
        },
        extra: [
          <RangePicker
            key="dateRange"
            value={[
              filters.startDate ? dayjs(filters.startDate) : null,
              filters.endDate ? dayjs(filters.endDate) : null
            ]}
            onChange={(dates) => {
              setFilters({
                ...filters,
                startDate: dates?.[0]?.format('YYYY-MM-DD'),
                endDate: dates?.[1]?.format('YYYY-MM-DD')
              });
            }}
            size="large"
          />
        ]
      }}
    >
      {/* Info Message */}
      <Alert
        message={t('dashboard.apiIntegrationComplete')}
        description={t('dashboard.apiIntegrationDescription')}
        type="info"
        showIcon
        closable
        className="mb-6"
      />

      {/* Özet İstatistikler - StatisticCard.Group ile */}
      <RcResizeObserver
        key="resize-observer"
        onResize={(offset) => {
          setResponsive(offset.width < 596);
        }}
      >
        <StatisticCard.Group direction={responsive ? 'column' : 'row'}>
          <StatisticCard
            statistic={{
              title: t('dashboard.totalSales'),
              value: 1234567.89,
              precision: 2,
              prefix: '₺',
              icon: <DollarOutlined style={{ color: '#52c41a' }} />
            }}
            chart={
              <img
                src="https://gw.alipayobjects.com/zos/alicdn/_dZIob2NB/zhuzhuangtu.svg"
                alt="chart"
                width="100%"
              />
            }
            chartPlacement="left"
          />
          <Divider type={responsive ? 'horizontal' : 'vertical'} />

          <StatisticCard
            statistic={{
              title: t('dashboard.totalCollection'),
              value: 987654.32,
              precision: 2,
              prefix: '₺',
              icon: <CreditCardOutlined style={{ color: '#1890ff' }} />
            }}
            chart={
              <img
                src="https://gw.alipayobjects.com/zos/alicdn/BLqRZrFN/xianzhuangtu.svg"
                alt="chart"
                width="100%"
              />
            }
            chartPlacement="left"
          />
          <Divider type={responsive ? 'horizontal' : 'vertical'} />

          <StatisticCard
            statistic={{
              title: t('dashboard.totalProfit'),
              value: 246913.57,
              precision: 2,
              prefix: '₺',
              icon: <TrophyOutlined style={{ color: '#faad14' }} />
            }}
            chart={
              <img
                src="https://gw.alipayobjects.com/zos/alicdn/RmHoAXH4g/zhexiantu.svg"
                alt="chart"
                width="100%"
              />
            }
            chartPlacement="left"
          />
          <Divider type={responsive ? 'horizontal' : 'vertical'} />

          <StatisticCard
            statistic={{
              title: t('dashboard.pendingReceivables'),
              value: 123456.78,
              precision: 2,
              prefix: '₺',
              icon: <FileTextOutlined style={{ color: '#722ed1' }} />
            }}
          />
        </StatisticCard.Group>
      </RcResizeObserver>

      {/* Detaylı Kartlar */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} md={12} lg={6}>
          <ProCard
            title={t('dashboard.recentInvoices')}
            headerBordered
            extra="View All"
          >
            <Statistic
              title={t('dashboard.today')}
              value={45}
            />
          </ProCard>
        </Col>

        <Col xs={24} sm={12} md={12} lg={6}>
          <ProCard
            title={t('dashboard.lowStockProducts')}
            headerBordered
            extra="View All"
          >
            <Statistic
              title={t('dashboard.critical')}
              value={8}
              valueStyle={{ color: '#cf1322' }}
              prefix={<FallOutlined />}
            />
          </ProCard>
        </Col>

        <Col xs={24} sm={12} md={12} lg={6}>
          <ProCard
            title={t('dashboard.pendingPayments')}
            headerBordered
            extra="View All"
          >
            <Statistic
              title={t('dashboard.overdue')}
              value={234567.89}
              precision={2}
              prefix="₺"
              valueStyle={{ color: '#faad14' }}
            />
          </ProCard>
        </Col>

        <Col xs={24} sm={12} md={12} lg={6}>
          <ProCard
            title={t('dashboard.activePartners')}
            headerBordered
            extra="View All"
          >
            <Statistic
              title={t('dashboard.total')}
              value={567}
              prefix={<ShoppingCartOutlined />}
            />
          </ProCard>
        </Col>
      </Row>

      {/* Grafik Alanı */}
      <ProCard
        title={t('dashboard.salesChart')}
        headerBordered
        style={{ marginTop: 24 }}
        tabs={{
          items: [
            {
              label: t('dashboard.daily'),
              key: 'daily',
              children: <div style={{ height: 300 }}>Günlük Grafik</div>
            },
            {
              label: t('dashboard.weekly'),
              key: 'weekly',
              children: <div style={{ height: 300 }}>Haftalık Grafik</div>
            },
            {
              label: t('dashboard.monthly'),
              key: 'monthly',
              children: <div style={{ height: 300 }}>Aylık Grafik</div>
            }
          ]
        }}
      />

      {/* Stok Durumu */}
      <ProCard
        title={t('dashboard.stockStatus')}
        headerBordered
        style={{ marginTop: 24 }}
      >
        <Row gutter={16}>
          <Col span={6}>
            <Statistic
              title={t('dashboard.totalProducts')}
              value={1234}
              prefix={<ShoppingCartOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title={t('dashboard.lowStock')}
              value={45}
              valueStyle={{ color: '#faad14' }}
              prefix={<FallOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title={t('dashboard.outOfStock')}
              value={8}
              valueStyle={{ color: '#cf1322' }}
              prefix={<FallOutlined />}
            />
          </Col>
          <Col span={6}>
            <div>
              <div style={{ marginBottom: 8 }}>
                <span>{t('dashboard.stockLevel')}</span>
                <span style={{ float: 'right' }}>85%</span>
              </div>
              <Progress percent={85} strokeColor="#52c41a" />
            </div>
          </Col>
        </Row>
      </ProCard>
    </PageContainer>
  );
}