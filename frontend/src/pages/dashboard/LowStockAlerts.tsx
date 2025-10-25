import React from 'react';
import { List, Tag, Space, Button, Empty, Spin, Progress, Tooltip } from 'antd';
import {
  ExclamationCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { LowStockAlert } from '@/types/dashboard';

interface LowStockAlertsProps {
  data: LowStockAlert[];
  loading?: boolean;
  onViewAll?: () => void;
}

export const LowStockAlerts: React.FC<LowStockAlertsProps> = ({
  data,
  loading = false,
  onViewAll,
}) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  // Durum rengini al
  const getStatusColor = (status: LowStockAlert['status']) => {
    const colorMap = {
      critical: 'red',
      low: 'orange',
      warning: 'gold',
    };
    return colorMap[status] || 'default';
  };

  // Durum ikonunu al
  const getStatusIcon = (status: LowStockAlert['status']) => {
    const iconMap = {
      critical: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      low: <WarningOutlined style={{ color: '#fa8c16' }} />,
      warning: <InfoCircleOutlined style={{ color: '#faad14' }} />,
    };
    return iconMap[status];
  };

  // Stok yüzdesini hesapla
  const getStockPercent = (currentStock: number, minStock: number): number => {
    return Math.round((currentStock / minStock) * 100);
  };

  // Ürün detayına git
  const handleViewProduct = (productId: string) => {
    navigate(`/products/${productId}`);
  };

  // Sipariş oluştur
  const handleOrderNow = (productId: string) => {
    // TODO: Satın alma siparişi oluşturma sayfasına yönlendir
    navigate(`/purchasing/create?productId=${productId}`);
  };

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
        description={t('dashboard.lowStockAlerts.noAlerts')}
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        style={{ padding: '50px 0' }}
      >
        <div style={{ color: '#52c41a', marginTop: 8 }}>
          ✓ {t('dashboard.messages.allGood')}
        </div>
      </Empty>
    );
  }

  return (
    <div>
      {/* Liste */}
      <List
        dataSource={data}
        size="small"
        renderItem={(item) => {
          const stockPercent = getStockPercent(item.currentStock, item.minStock);

          return (
            <List.Item
              style={{
                borderLeft: `4px solid ${
                  item.status === 'critical'
                    ? '#ff4d4f'
                    : item.status === 'low'
                    ? '#fa8c16'
                    : '#faad14'
                }`,
                paddingLeft: 16,
                marginBottom: 12,
                backgroundColor: '#fafafa',
                borderRadius: 4,
              }}
              actions={[
                <Button
                  key="order"
                  type="primary"
                  size="small"
                  danger={item.status === 'critical'}
                  icon={<ShoppingCartOutlined />}
                  onClick={() => handleOrderNow(item.productId)}
                >
                  {t('dashboard.lowStockAlerts.orderNow')}
                </Button>,
                <Button
                  key="view"
                  type="link"
                  size="small"
                  onClick={() => handleViewProduct(item.productId)}
                >
                  {t('common.view')}
                </Button>,
              ]}
            >
              <List.Item.Meta
                avatar={getStatusIcon(item.status)}
                title={
                  <Space>
                    <span style={{ fontWeight: 600 }}>{item.productName}</span>
                    <Tag color={getStatusColor(item.status)}>
                      {t(`dashboard.lowStockAlerts.status.${item.status}`)}
                    </Tag>
                  </Space>
                }
                description={
                  <div>
                    {/* Stok Bilgisi */}
                    <div style={{ marginBottom: 8 }}>
                      <span style={{ color: '#8c8c8c', fontSize: 12 }}>
                        {t('dashboard.lowStockAlerts.columns.currentStock')}:{' '}
                      </span>
                      <span
                        style={{
                          fontWeight: 600,
                          color:
                            item.status === 'critical'
                              ? '#ff4d4f'
                              : item.status === 'low'
                              ? '#fa8c16'
                              : '#faad14',
                        }}
                      >
                        {item.currentStock} {item.unit}
                      </span>
                      <span style={{ color: '#d9d9d9', margin: '0 8px' }}>
                        /
                      </span>
                      <span style={{ color: '#8c8c8c', fontSize: 12 }}>
                        {t('dashboard.lowStockAlerts.columns.minStock')}:{' '}
                        {item.minStock} {item.unit}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <Progress
                      percent={stockPercent}
                      size="small"
                      strokeColor={
                        item.status === 'critical'
                          ? '#ff4d4f'
                          : item.status === 'low'
                          ? '#fa8c16'
                          : '#faad14'
                      }
                      showInfo={false}
                    />

                    {/* Son Sipariş Tarihi */}
                    {item.lastOrderDate && (
                      <div style={{ marginTop: 4, fontSize: 11, color: '#8c8c8c' }}>
                        {t('dashboard.lowStockAlerts.lastOrder')}:{' '}
                        {new Date(item.lastOrderDate).toLocaleDateString(
                          i18n.language === 'tr' ? 'tr-TR' : 'en-US',
                          { day: 'numeric', month: 'short', year: 'numeric' }
                        )}
                      </div>
                    )}
                  </div>
                }
              />
            </List.Item>
          );
        }}
      />

      {/* Tümünü Görüntüle */}
      {onViewAll && data.length >= 5 && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Button type="link" onClick={onViewAll}>
            {t('dashboard.lowStockAlerts.viewAll')} →
          </Button>
        </div>
      )}
    </div>
  );
};
