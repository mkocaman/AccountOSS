import React, { useState } from 'react';
import {
  Card,
  Table,
  Tag,
  Space,
  Button,
  Input,
  Select,
  Row,
  Col,
  Statistic,
  Progress,
  Tooltip,
  message,
  Badge,
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  ShoppingCartOutlined,
  EyeOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { ColumnsType } from 'antd/es/table';
import { stockService } from '@/services/stockService';
import type { StockLevel, StockLevelFilter, StockStatus } from '@/types/stock';
import { formatCurrency } from '@/utils/chartUtils';

const { Search } = Input;

export const StockLevels: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  // Filtre state - Kullanıcının seçtiği filtreleri tutar
  const [filter, setFilter] = useState<StockLevelFilter>({});

  // Stok seviyelerini getir - React Query ile veri çekme
  const {
    data: stockLevels,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['stockLevels', filter],
    queryFn: () => stockService.getStockLevels(filter),
    staleTime: 30 * 1000, // 30 saniye cache
  });

  // İstatistikleri getir - Özet bilgileri çekme
  const {
    data: statistics,
    isLoading: statsLoading,
  } = useQuery({
    queryKey: ['stockStatistics', filter],
    queryFn: () => stockService.getStockStatistics(filter),
    staleTime: 30 * 1000,
  });

  // Durum rengi - Status'a göre renk belirleme
  const getStatusColor = (status: StockStatus): string => {
    const colorMap: Record<StockStatus, string> = {
      ok: 'success',
      low: 'warning',
      critical: 'error',
      overstock: 'processing',
    };
    return colorMap[status];
  };

  // Durum ikonu - Status'a göre ikon belirleme
  const getStatusIcon = (status: StockStatus) => {
    const iconMap: Record<StockStatus, React.ReactNode> = {
      ok: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      low: <WarningOutlined style={{ color: '#faad14' }} />,
      critical: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      overstock: <InfoCircleOutlined style={{ color: '#1890ff' }} />,
    };
    return iconMap[status];
  };

  // Stok yüzdesi hesaplama - Progress bar için yüzde hesaplama
  const getStockPercent = (current: number, min: number, max: number): number => {
    if (max <= min) return 100;
    const range = max - min;
    const value = current - min;
    const percent = (value / range) * 100;
    return Math.max(0, Math.min(100, Math.round(percent)));
  };

  // Progress bar durumu - Progress bar'ın rengini belirleme
  const getProgressStatus = (
    status: StockStatus
  ): 'success' | 'exception' | 'normal' | 'active' => {
    if (status === 'critical') return 'exception';
    if (status === 'ok') return 'success';
    return 'normal';
  };

  // Ürün detayına git - Ürün sayfasına yönlendirme
  const handleViewProduct = (productId: string) => {
    navigate(`/products/${productId}`);
  };

  // Sipariş oluştur - Satın alma siparişi oluşturma
  const handleOrderProduct = (productId: string, productName: string) => {
    message.info(
      `${productName} için satın alma siparişi oluşturma özelliği yakında eklenecek`
    );
    // TODO: Satın alma modülü hazır olunca aktif et
    // navigate(`/purchasing/create?productId=${productId}`);
  };

  // Tablo kolonları - Ant Design Table için kolon tanımları
  const columns: ColumnsType<StockLevel> = [
    {
      title: t('stock.levels.columns.product'),
      dataIndex: 'productName',
      key: 'productName',
      fixed: 'left',
      width: 220,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>{record.productName}</div>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>
            <span>{record.productCode}</span>
            {record.categoryName && (
              <>
                <span style={{ margin: '0 4px' }}>•</span>
                <span>{record.categoryName}</span>
              </>
            )}
          </div>
        </div>
      ),
    },
    {
      title: t('stock.levels.columns.warehouse'),
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      width: 140,
    },
    {
      title: t('stock.levels.columns.currentStock'),
      dataIndex: 'currentStock',
      key: 'currentStock',
      width: 140,
      align: 'right',
      render: (value, record) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>
            {value.toLocaleString()} {record.unit}
          </div>
          {record.reservedStock > 0 && (
            <div style={{ fontSize: 11, color: '#faad14' }}>
              <Badge status="warning" />
              {record.reservedStock} {record.unit} rezerve
            </div>
          )}
        </div>
      ),
    },
    {
      title: t('stock.levels.columns.available'),
      dataIndex: 'availableStock',
      key: 'availableStock',
      width: 120,
      align: 'right',
      render: (value, record) => (
        <span style={{ color: '#52c41a', fontWeight: 500, fontSize: 14 }}>
          {value.toLocaleString()} {record.unit}
        </span>
      ),
    },
    {
      title: t('stock.levels.columns.minMax'),
      key: 'minMax',
      width: 140,
      render: (_, record) => (
        <div style={{ fontSize: 12 }}>
          <div style={{ color: '#8c8c8c' }}>
            Min: {record.minStock} {record.unit}
          </div>
          <div style={{ color: '#8c8c8c' }}>
            Max: {record.maxStock} {record.unit}
          </div>
        </div>
      ),
    },
    {
      title: t('stock.levels.columns.status'),
      dataIndex: 'status',
      key: 'status',
      width: 180,
      render: (status: StockStatus, record) => {
        const percent = getStockPercent(
          record.currentStock,
          record.minStock,
          record.maxStock
        );

        return (
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Space>
              {getStatusIcon(status)}
              <Tag color={getStatusColor(status)}>
                {t(`stock.levels.status.${status}`)}
              </Tag>
            </Space>
            <Progress
              percent={percent}
              size="small"
              status={getProgressStatus(status)}
              showInfo={false}
              strokeColor={
                status === 'critical'
                  ? '#ff4d4f'
                  : status === 'low'
                  ? '#faad14'
                  : status === 'overstock'
                  ? '#1890ff'
                  : '#52c41a'
              }
            />
          </Space>
        );
      },
    },
    {
      title: t('stock.levels.columns.unitCost'),
      dataIndex: 'unitCost',
      key: 'unitCost',
      width: 120,
      align: 'right',
      render: (value) => (
        <span style={{ fontSize: 13 }}>
          {formatCurrency(value, i18n.language)}
        </span>
      ),
    },
    {
      title: t('stock.levels.columns.totalValue'),
      dataIndex: 'totalValue',
      key: 'totalValue',
      width: 140,
      align: 'right',
      render: (value) => (
        <span style={{ fontWeight: 600, fontSize: 14 }}>
          {formatCurrency(value, i18n.language)}
        </span>
      ),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title={t('common.view')}>
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewProduct(record.productId)}
            >
              {t('common.view')}
            </Button>
          </Tooltip>
          {(record.status === 'low' || record.status === 'critical') && (
            <Tooltip title={t('stock.levels.actions.order')}>
              <Button
                type="primary"
                size="small"
                danger={record.status === 'critical'}
                icon={<ShoppingCartOutlined />}
                onClick={() => handleOrderProduct(record.productId, record.productName)}
              >
                {t('stock.levels.actions.order')}
              </Button>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  // Filtreleri sıfırla - Tüm filtreleri temizleme
  const handleResetFilters = () => {
    setFilter({});
    message.success(t('stock.levels.messages.filtersReset'));
  };

  // Yenile - Verileri tekrar çekme
  const handleRefresh = () => {
    refetch();
    message.success(t('stock.levels.messages.refreshed'));
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Header - Sayfa başlığı ve açıklama */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <h1 style={{ fontSize: 28, fontWeight: 600, margin: 0 }}>
            {t('stock.levels.title')}
          </h1>
          <p style={{ color: '#8c8c8c', margin: '8px 0 0' }}>
            {t('stock.levels.description')}
          </p>
        </Col>
        <Col>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={isLoading}
            >
              {t('common.refresh')}
            </Button>
          </Space>
        </Col>
      </Row>

      {/* İstatistikler - Özet kartları */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={statsLoading}>
            <Statistic
              title={t('stock.levels.stats.totalValue')}
              value={statistics?.totalValue || 0}
              formatter={(value) => formatCurrency(Number(value), i18n.language)}
              valueStyle={{ color: '#1890ff', fontSize: 24 }}
              prefix={<InfoCircleOutlined />}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
              {statistics?.totalProducts || 0} {t('stock.levels.stats.products')}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={statsLoading}>
            <Statistic
              title={t('stock.levels.stats.critical')}
              value={statistics?.criticalItems || 0}
              valueStyle={{ color: '#ff4d4f', fontSize: 24 }}
              prefix={<ExclamationCircleOutlined />}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
              {t('stock.levels.stats.needsImmediate')}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={statsLoading}>
            <Statistic
              title={t('stock.levels.stats.low')}
              value={statistics?.lowItems || 0}
              valueStyle={{ color: '#faad14', fontSize: 24 }}
              prefix={<WarningOutlined />}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
              {t('stock.levels.stats.needsAttention')}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={statsLoading}>
            <Statistic
              title={t('stock.levels.stats.ok')}
              value={statistics?.okItems || 0}
              valueStyle={{ color: '#52c41a', fontSize: 24 }}
              prefix={<CheckCircleOutlined />}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
              {t('stock.levels.stats.healthyStock')}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Filtreler - Arama ve filtreleme */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} lg={8}>
            <Search
              placeholder={t('stock.levels.filters.searchPlaceholder')}
              allowClear
              onSearch={(value) => setFilter({ ...filter, search: value || undefined })}
              prefix={<SearchOutlined />}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Select
              placeholder={t('stock.levels.filters.statusPlaceholder')}
              style={{ width: '100%' }}
              allowClear
              onChange={(value) => setFilter({ ...filter, status: value })}
              value={filter.status}
              options={[
                {
                  label: t('stock.levels.status.ok'),
                  value: 'ok',
                  icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
                },
                {
                  label: t('stock.levels.status.low'),
                  value: 'low',
                  icon: <WarningOutlined style={{ color: '#faad14' }} />,
                },
                {
                  label: t('stock.levels.status.critical'),
                  value: 'critical',
                  icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
                },
                {
                  label: t('stock.levels.status.overstock'),
                  value: 'overstock',
                  icon: <InfoCircleOutlined style={{ color: '#1890ff' }} />,
                },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Select
              placeholder={t('stock.levels.filters.warehousePlaceholder')}
              style={{ width: '100%' }}
              allowClear
              onChange={(value) => setFilter({ ...filter, warehouseId: value })}
              value={filter.warehouseId}
              options={[
                { label: 'Ana Depo', value: 'WH-001' },
                { label: 'Şube Depo', value: 'WH-002' },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Button
              icon={<FilterOutlined />}
              onClick={handleResetFilters}
              block
            >
              {t('stock.levels.filters.reset')}
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Tablo - Ana stok seviyeleri tablosu */}
      <Card>
        <Table
          columns={columns}
          dataSource={stockLevels}
          rowKey="id"
          loading={isLoading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total) => `${t('common.total')} ${total} ${t('common.items')}`,
          }}
          scroll={{ x: 1600 }}
          size="middle"
        />
      </Card>
    </div>
  );
};

export default StockLevels;
