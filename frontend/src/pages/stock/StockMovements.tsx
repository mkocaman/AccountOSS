import React, { useState } from 'react';
import {
  Card,
  Table,
  Tag,
  Space,
  Button,
  Select,
  DatePicker,
  Row,
  Col,
  Statistic,
  Badge,
  Tooltip,
  message,
  Modal,
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { ColumnsType } from 'antd/es/table';
import { stockService } from '@/services/stockService';
import type {
  StockMovement,
  StockMovementFilter,
  StockMovementType,
  StockMovementDirection,
} from '@/types/stock';
import { formatCurrency } from '@/utils/chartUtils';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

export const StockMovements: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  // Filtre state - Kullanıcının seçtiği filtreleri tutar
  const [filter, setFilter] = useState<StockMovementFilter>({});

  // Hareketleri getir - React Query ile veri çekme
  const {
    data: movements,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['stockMovements', filter],
    queryFn: () => stockService.getStockMovements(filter),
    staleTime: 30 * 1000, // 30 saniye cache
  });

  // İstatistikleri getir - Hareket özet bilgileri
  const {
    data: statistics,
    isLoading: statsLoading,
  } = useQuery({
    queryKey: ['movementStatistics', filter],
    queryFn: () => stockService.getMovementStatistics(filter),
    staleTime: 30 * 1000,
  });

  // Hareket tipi rengi - Her hareket tipi için renk belirleme
  const getMovementTypeColor = (type: StockMovementType): string => {
    const colorMap: Record<StockMovementType, string> = {
      purchase: 'green',
      sale: 'blue',
      adjustment: 'orange',
      return: 'purple',
      transfer: 'cyan',
      production: 'magenta',
      damage: 'red',
    };
    return colorMap[type];
  };

  // Yön ikonu - Giriş/çıkış yönüne göre ikon
  const getDirectionIcon = (direction: StockMovementDirection) => {
    return direction === 'in' ? (
      <ArrowDownOutlined style={{ color: '#52c41a' }} />
    ) : (
      <ArrowUpOutlined style={{ color: '#ff4d4f' }} />
    );
  };

  // Durum rengi - Hareket durumuna göre renk
  const getStatusColor = (status: StockMovement['status']): string => {
    const colorMap = {
      pending: 'warning',
      approved: 'success',
      rejected: 'error',
      cancelled: 'default',
    };
    return colorMap[status];
  };

  // Durum ikonu - Hareket durumuna göre ikon
  const getStatusIcon = (status: StockMovement['status']) => {
    const iconMap = {
      pending: <ClockCircleOutlined />,
      approved: <CheckCircleOutlined />,
      rejected: <CloseCircleOutlined />,
      cancelled: <CloseCircleOutlined />,
    };
    return iconMap[status];
  };

  // Detay görüntüle - Hareket detayını modal'da göster
  const handleViewDetail = (movement: StockMovement) => {
    Modal.info({
      title: t('stock.movements.detail.title'),
      width: 600,
      content: (
        <div style={{ marginTop: 16 }}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <div style={{ marginBottom: 8 }}>
                <strong>{t('stock.movements.columns.movementNumber')}:</strong>
              </div>
              <div>{movement.movementNumber}</div>
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: 8 }}>
                <strong>{t('stock.movements.columns.type')}:</strong>
              </div>
              <Tag color={getMovementTypeColor(movement.type)}>
                {t(`stock.movements.types.${movement.type}`)}
              </Tag>
            </Col>
            <Col span={24}>
              <div style={{ marginBottom: 8 }}>
                <strong>{t('stock.movements.columns.product')}:</strong>
              </div>
              <div>{movement.productName}</div>
              <div style={{ fontSize: 12, color: '#8c8c8c' }}>{movement.productCode}</div>
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: 8 }}>
                <strong>{t('stock.movements.columns.quantity')}:</strong>
              </div>
              <div style={{ fontSize: 18, fontWeight: 600 }}>
                {movement.quantity.toLocaleString()}
              </div>
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: 8 }}>
                <strong>{t('stock.movements.columns.totalCost')}:</strong>
              </div>
              <div style={{ fontSize: 18, fontWeight: 600 }}>
                {formatCurrency(movement.totalCost, i18n.language)}
              </div>
            </Col>
            {movement.referenceNumber && (
              <Col span={24}>
                <div style={{ marginBottom: 8 }}>
                  <strong>{t('stock.movements.columns.reference')}:</strong>
                </div>
                <div>{movement.referenceNumber}</div>
              </Col>
            )}
            {movement.notes && (
              <Col span={24}>
                <div style={{ marginBottom: 8 }}>
                  <strong>{t('stock.movements.columns.notes')}:</strong>
                </div>
                <div>{movement.notes}</div>
              </Col>
            )}
            <Col span={12}>
              <div style={{ marginBottom: 8 }}>
                <strong>{t('stock.movements.columns.createdBy')}:</strong>
              </div>
              <div>{movement.createdBy}</div>
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: 8 }}>
                <strong>{t('stock.movements.columns.createdAt')}:</strong>
              </div>
              <div>{dayjs(movement.createdAt).format('DD.MM.YYYY HH:mm')}</div>
            </Col>
            {movement.approvedBy && (
              <>
                <Col span={12}>
                  <div style={{ marginBottom: 8 }}>
                    <strong>{t('stock.movements.columns.approvedBy')}:</strong>
                  </div>
                  <div>{movement.approvedBy}</div>
                </Col>
                <Col span={12}>
                  <div style={{ marginBottom: 8 }}>
                    <strong>{t('stock.movements.columns.approvedAt')}:</strong>
                  </div>
                  <div>{dayjs(movement.approvedAt).format('DD.MM.YYYY HH:mm')}</div>
                </Col>
              </>
            )}
          </Row>
        </div>
      ),
    });
  };

  // Tablo kolonları - Ant Design Table için kolon tanımları
  const columns: ColumnsType<StockMovement> = [
    {
      title: t('stock.movements.columns.movementNumber'),
      dataIndex: 'movementNumber',
      key: 'movementNumber',
      fixed: 'left',
      width: 150,
      render: (text) => <span style={{ fontWeight: 600 }}>{text}</span>,
    },
    {
      title: t('stock.movements.columns.type'),
      dataIndex: 'type',
      key: 'type',
      width: 140,
      render: (type: StockMovementType, record) => (
        <Space>
          {getDirectionIcon(record.direction)}
          <Tag color={getMovementTypeColor(type)}>
            {t(`stock.movements.types.${type}`)}
          </Tag>
        </Space>
      ),
    },
    {
      title: t('stock.movements.columns.product'),
      dataIndex: 'productName',
      key: 'productName',
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.productName}</div>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>{record.productCode}</div>
        </div>
      ),
    },
    {
      title: t('stock.movements.columns.warehouse'),
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      width: 130,
    },
    {
      title: t('stock.movements.columns.quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'right',
      render: (value, record) => (
        <span
          style={{
            fontWeight: 600,
            fontSize: 15,
            color: record.direction === 'in' ? '#52c41a' : '#ff4d4f',
          }}
        >
          {record.direction === 'in' ? '+' : '-'}
          {value.toLocaleString()}
        </span>
      ),
    },
    {
      title: t('stock.movements.columns.unitCost'),
      dataIndex: 'unitCost',
      key: 'unitCost',
      width: 120,
      align: 'right',
      render: (value) => formatCurrency(value, i18n.language),
    },
    {
      title: t('stock.movements.columns.totalCost'),
      dataIndex: 'totalCost',
      key: 'totalCost',
      width: 140,
      align: 'right',
      render: (value) => (
        <span style={{ fontWeight: 600 }}>{formatCurrency(value, i18n.language)}</span>
      ),
    },
    {
      title: t('stock.movements.columns.reference'),
      dataIndex: 'referenceNumber',
      key: 'referenceNumber',
      width: 140,
      render: (text) => text || '-',
    },
    {
      title: t('stock.movements.columns.date'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date) => (
        <div>
          <div>{dayjs(date).format('DD.MM.YYYY')}</div>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>
            {dayjs(date).format('HH:mm')}
          </div>
        </div>
      ),
    },
    {
      title: t('stock.movements.columns.status'),
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: StockMovement['status']) => (
        <Tag icon={getStatusIcon(status)} color={getStatusColor(status)}>
          {t(`stock.movements.status.${status}`)}
        </Tag>
      ),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
        >
          {t('common.view')}
        </Button>
      ),
    },
  ];

  // Filtreleri sıfırla - Tüm filtreleri temizleme
  const handleResetFilters = () => {
    setFilter({});
    message.success(t('stock.movements.messages.filtersReset'));
  };

  // Yenile - Verileri tekrar çekme
  const handleRefresh = () => {
    refetch();
    message.success(t('stock.movements.messages.refreshed'));
  };

  // Tarih aralığı değişikliği - Tarih filtrelerini güncelleme
  const handleDateRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      setFilter({
        ...filter,
        dateFrom: dates[0].format('YYYY-MM-DD'),
        dateTo: dates[1].format('YYYY-MM-DD'),
      });
    } else {
      setFilter({
        ...filter,
        dateFrom: undefined,
        dateTo: undefined,
      });
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Header - Sayfa başlığı ve açıklama */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <h1 style={{ fontSize: 28, fontWeight: 600, margin: 0 }}>
            {t('stock.movements.title')}
          </h1>
          <p style={{ color: '#8c8c8c', margin: '8px 0 0' }}>
            {t('stock.movements.description')}
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

      {/* İstatistikler - Hareket özet kartları */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={statsLoading}>
            <Statistic
              title={t('stock.movements.stats.totalMovements')}
              value={statistics?.totalMovements || 0}
              valueStyle={{ color: '#1890ff', fontSize: 24 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={statsLoading}>
            <Statistic
              title={t('stock.movements.stats.inbound')}
              value={statistics?.totalInbound || 0}
              valueStyle={{ color: '#52c41a', fontSize: 24 }}
              prefix={<ArrowDownOutlined />}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
              {formatCurrency(statistics?.totalInboundValue || 0, i18n.language)}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={statsLoading}>
            <Statistic
              title={t('stock.movements.stats.outbound')}
              value={statistics?.totalOutbound || 0}
              valueStyle={{ color: '#ff4d4f', fontSize: 24 }}
              prefix={<ArrowUpOutlined />}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
              {formatCurrency(statistics?.totalOutboundValue || 0, i18n.language)}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={statsLoading}>
            <Statistic
              title={t('stock.movements.stats.pending')}
              value={statistics?.pendingApprovals || 0}
              valueStyle={{ color: '#faad14', fontSize: 24 }}
              prefix={<ClockCircleOutlined />}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
              {t('stock.movements.stats.needsApproval')}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Filtreler - Arama ve filtreleme */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} lg={6}>
            <Select
              placeholder={t('stock.movements.filters.typePlaceholder')}
              style={{ width: '100%' }}
              allowClear
              onChange={(value) => setFilter({ ...filter, type: value })}
              value={filter.type}
              options={[
                { label: t('stock.movements.types.purchase'), value: 'purchase' },
                { label: t('stock.movements.types.sale'), value: 'sale' },
                { label: t('stock.movements.types.adjustment'), value: 'adjustment' },
                { label: t('stock.movements.types.return'), value: 'return' },
                { label: t('stock.movements.types.transfer'), value: 'transfer' },
                { label: t('stock.movements.types.damage'), value: 'damage' },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Select
              placeholder={t('stock.movements.filters.directionPlaceholder')}
              style={{ width: '100%' }}
              allowClear
              onChange={(value) => setFilter({ ...filter, direction: value })}
              value={filter.direction}
              options={[
                {
                  label: (
                    <span>
                      <ArrowDownOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                      {t('stock.movements.directions.in')}
                    </span>
                  ),
                  value: 'in',
                },
                {
                  label: (
                    <span>
                      <ArrowUpOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
                      {t('stock.movements.directions.out')}
                    </span>
                  ),
                  value: 'out',
                },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Select
              placeholder={t('stock.movements.filters.statusPlaceholder')}
              style={{ width: '100%' }}
              allowClear
              onChange={(value) => setFilter({ ...filter, status: value })}
              value={filter.status}
              options={[
                { label: t('stock.movements.status.pending'), value: 'pending' },
                { label: t('stock.movements.status.approved'), value: 'approved' },
                { label: t('stock.movements.status.rejected'), value: 'rejected' },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <RangePicker
              style={{ width: '100%' }}
              placeholder={[
                t('stock.movements.filters.dateFrom'),
                t('stock.movements.filters.dateTo'),
              ]}
              onChange={handleDateRangeChange}
              format="DD.MM.YYYY"
            />
          </Col>
        </Row>
        <Row style={{ marginTop: 16 }}>
          <Col>
            <Button icon={<FilterOutlined />} onClick={handleResetFilters}>
              {t('stock.movements.filters.reset')}
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Tablo - Ana hareketler tablosu */}
      <Card>
        <Table
          columns={columns}
          dataSource={movements}
          rowKey="id"
          loading={isLoading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total) => `${t('common.total')} ${total} ${t('common.items')}`,
          }}
          scroll={{ x: 1700 }}
          size="middle"
        />
      </Card>
    </div>
  );
};

export default StockMovements;
