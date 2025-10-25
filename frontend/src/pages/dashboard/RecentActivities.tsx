import React, { useMemo } from 'react';
import { Table, Tag, Space, Button, Empty, Spin, Tooltip } from 'antd';
import {
  FileTextOutlined,
  DollarOutlined,
  UserOutlined,
  ShoppingOutlined,
  InboxOutlined,
  EyeOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import type { RecentActivity } from '@/types/dashboard';
import { formatCurrency } from '@/utils/chartUtils';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/tr';
import 'dayjs/locale/en';

// Dayjs relative time plugin
dayjs.extend(relativeTime);

interface RecentActivitiesProps {
  data: RecentActivity[];
  loading?: boolean;
  onViewAll?: () => void;
}

export const RecentActivities: React.FC<RecentActivitiesProps> = ({
  data,
  loading = false,
  onViewAll,
}) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  // Dayjs locale'i ayarla
  React.useEffect(() => {
    dayjs.locale(i18n.language);
  }, [i18n.language]);

  // Aktivite tipi ikonu
  const getActivityIcon = (type: RecentActivity['type']) => {
    const iconMap = {
      invoice: <FileTextOutlined style={{ color: '#1890ff' }} />,
      payment: <DollarOutlined style={{ color: '#52c41a' }} />,
      customer: <UserOutlined style={{ color: '#722ed1' }} />,
      product: <ShoppingOutlined style={{ color: '#fa8c16' }} />,
      stock: <InboxOutlined style={{ color: '#13c2c2' }} />,
    };
    return iconMap[type] || <FileTextOutlined />;
  };

  // Aktivite tipi rengi
  const getActivityColor = (type: RecentActivity['type']) => {
    const colorMap = {
      invoice: 'blue',
      payment: 'green',
      customer: 'purple',
      product: 'orange',
      stock: 'cyan',
    };
    return colorMap[type] || 'default';
  };

  // Detay sayfasına git
  const handleViewDetail = (activity: RecentActivity) => {
    if (!activity.referenceId) return;

    // Aktivite tipine göre yönlendirme
    const routeMap = {
      invoice: `/invoices/${activity.referenceId}`,
      payment: `/payments/${activity.referenceId}`,
      customer: `/customers/${activity.referenceId}`,
      product: `/products/${activity.referenceId}`,
      stock: `/stock/${activity.referenceId}`,
    };

    const route = routeMap[activity.type];
    if (route) {
      navigate(route);
    }
  };

  // Tablo kolonları
  const columns: ColumnsType<RecentActivity> = [
    {
      title: t('dashboard.recentActivities.columns.type'),
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: RecentActivity['type']) => (
        <Space>
          {getActivityIcon(type)}
          <Tag color={getActivityColor(type)}>
            {t(`dashboard.recentActivities.types.${type}`)}
          </Tag>
        </Space>
      ),
    },
    {
      title: t('dashboard.recentActivities.columns.description'),
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string, record: RecentActivity) => (
        <div>
          <div style={{ fontWeight: 500, color: '#262626' }}>{text}</div>
          {record.referenceId && (
            <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
              Ref: {record.referenceId}
            </div>
          )}
        </div>
      ),
    },
    {
      title: t('dashboard.recentActivities.columns.amount'),
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      align: 'right',
      render: (amount?: number) =>
        amount ? (
          <span style={{ fontWeight: 600, color: '#262626' }}>
            {formatCurrency(amount, i18n.language)}
          </span>
        ) : (
          <span style={{ color: '#d9d9d9' }}>-</span>
        ),
    },
    {
      title: t('dashboard.recentActivities.columns.date'),
      dataIndex: 'date',
      key: 'date',
      width: 150,
      render: (date: string) => (
        <Tooltip title={dayjs(date).format('DD MMM YYYY HH:mm')}>
          <Space>
            <ClockCircleOutlined style={{ color: '#8c8c8c' }} />
            <span style={{ color: '#8c8c8c' }}>
              {dayjs(date).fromNow()}
            </span>
          </Space>
        </Tooltip>
      ),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 100,
      align: 'center',
      render: (_, record: RecentActivity) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
          disabled={!record.referenceId}
        >
          {t('common.view')}
        </Button>
      ),
    },
  ];

  // Loading state
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <Empty
        description={t('dashboard.recentActivities.noActivities')}
        style={{ padding: '50px 0' }}
      />
    );
  }

  return (
    <div>
      {/* Tablo */}
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        pagination={false}
        size="middle"
        scroll={{ x: 800 }}
      />

      {/* Tümünü Görüntüle */}
      {onViewAll && data.length >= 10 && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Button type="link" onClick={onViewAll}>
            {t('dashboard.recentActivities.viewAll')} →
          </Button>
        </div>
      )}
    </div>
  );
};
