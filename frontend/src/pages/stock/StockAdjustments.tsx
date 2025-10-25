import React, { useState } from 'react';
import {
  Card,
  Table,
  Tag,
  Space,
  Button,
  Select,
  Row,
  Col,
  Statistic,
  Modal,
  Input,
  message,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ColumnsType } from 'antd/es/table';
import { stockService } from '@/services/stockService';
import type { StockAdjustment, StockMovementFilter } from '@/types/stock';
import dayjs from 'dayjs';

const { TextArea } = Input;

export const StockAdjustments: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Filtre state - Kullanıcının seçtiği filtreleri tutar
  const [filter, setFilter] = useState<StockMovementFilter>({});

  // Reddetme modal state - Reddetme modal'ının açık/kapalı durumu
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectingAdjustment, setRejectingAdjustment] = useState<StockAdjustment | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Düzeltmeleri getir - React Query ile veri çekme
  const {
    data: adjustments,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['stockAdjustments', filter],
    queryFn: () => stockService.getStockAdjustments(filter),
    staleTime: 30 * 1000, // 30 saniye cache
  });

  // İstatistikleri hesapla - Düzeltme özet bilgileri
  const statistics = React.useMemo(() => {
    if (!adjustments) return null;

    const total = adjustments.length;
    const pending = adjustments.filter(a => a.status === 'pending').length;
    const approved = adjustments.filter(a => a.status === 'approved').length;
    const rejected = adjustments.filter(a => a.status === 'rejected').length;

    return { total, pending, approved, rejected };
  }, [adjustments]);

  // Onaylama mutation - Düzeltmeyi onaylama
  const approveMutation = useMutation({
    mutationFn: (id: string) => stockService.approveStockAdjustment(id),
    onSuccess: () => {
      message.success(t('stock.adjustments.messages.approved'));
      queryClient.invalidateQueries({ queryKey: ['stockAdjustments'] });
    },
    onError: () => {
      message.error(t('stock.adjustments.messages.approveError'));
    },
  });

  // Reddetme mutation - Düzeltmeyi reddetme
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      stockService.rejectStockAdjustment(id, reason),
    onSuccess: () => {
      message.success(t('stock.adjustments.messages.rejected'));
      queryClient.invalidateQueries({ queryKey: ['stockAdjustments'] });
      setRejectModalVisible(false);
      setRejectingAdjustment(null);
      setRejectionReason('');
    },
    onError: () => {
      message.error(t('stock.adjustments.messages.rejectError'));
    },
  });

  // Onayla - Düzeltmeyi onaylama işlemi
  const handleApprove = (adjustment: StockAdjustment) => {
    Modal.confirm({
      title: t('stock.adjustments.approve.title'),
      content: t('stock.adjustments.approve.confirm', {
        product: adjustment.productName,
        difference: adjustment.difference,
      }),
      icon: <ExclamationCircleOutlined />,
      onOk: () => approveMutation.mutate(adjustment.id),
    });
  };

  // Reddet - Düzeltmeyi reddetme işlemi
  const handleReject = (adjustment: StockAdjustment) => {
    setRejectingAdjustment(adjustment);
    setRejectModalVisible(true);
  };

  // Reddetme onayı - Reddetme modal'ındaki onay butonu
  const handleRejectConfirm = () => {
    if (!rejectingAdjustment || !rejectionReason.trim()) {
      message.warning(t('stock.adjustments.reject.reasonRequired'));
      return;
    }

    rejectMutation.mutate({
      id: rejectingAdjustment.id,
      reason: rejectionReason,
    });
  };

  // Detay görüntüle - Düzeltme detayını modal'da göster
  const handleViewDetail = (adjustment: StockAdjustment) => {
    Modal.info({
      title: t('stock.adjustments.detail.title'),
      width: 700,
      content: (
        <div style={{ marginTop: 16 }}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <div style={{ marginBottom: 8 }}>
                <strong>{t('stock.adjustments.columns.adjustmentNumber')}:</strong>
              </div>
              <div>{adjustment.adjustmentNumber}</div>
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: 8 }}>
                <strong>{t('stock.adjustments.columns.status')}:</strong>
              </div>
              <Tag color={getStatusColor(adjustment.status)}>
                {t(`stock.adjustments.status.${adjustment.status}`)}
              </Tag>
            </Col>
            <Col span={24}>
              <div style={{ marginBottom: 8 }}>
                <strong>{t('stock.adjustments.columns.product')}:</strong>
              </div>
              <div>{adjustment.productName}</div>
              <div style={{ fontSize: 12, color: '#8c8c8c' }}>{adjustment.productCode}</div>
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: 8 }}>
                <strong>{t('stock.adjustments.columns.warehouse')}:</strong>
              </div>
              <div>{adjustment.warehouseName}</div>
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: 8 }}>
                <strong>{t('stock.adjustments.columns.reasonCode')}:</strong>
              </div>
              <Tag color="blue">
                {t(`stock.adjustments.reasonCodes.${adjustment.reasonCode}`)}
              </Tag>
            </Col>
            <Col span={8}>
              <div style={{ marginBottom: 8 }}>
                <strong>{t('stock.adjustments.columns.currentStock')}:</strong>
              </div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>
                {adjustment.currentStock.toLocaleString()}
              </div>
            </Col>
            <Col span={8}>
              <div style={{ marginBottom: 8 }}>
                <strong>{t('stock.adjustments.columns.adjustedStock')}:</strong>
              </div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>
                {adjustment.adjustedStock.toLocaleString()}
              </div>
            </Col>
            <Col span={8}>
              <div style={{ marginBottom: 8 }}>
                <strong>{t('stock.adjustments.columns.difference')}:</strong>
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: adjustment.difference > 0 ? '#52c41a' : '#ff4d4f',
                }}
              >
                {adjustment.difference > 0 ? '+' : ''}
                {adjustment.difference.toLocaleString()}
              </div>
            </Col>
            <Col span={24}>
              <div style={{ marginBottom: 8 }}>
                <strong>{t('stock.adjustments.columns.reason')}:</strong>
              </div>
              <div>{adjustment.reason}</div>
            </Col>
            {adjustment.notes && (
              <Col span={24}>
                <div style={{ marginBottom: 8 }}>
                  <strong>{t('stock.adjustments.columns.notes')}:</strong>
                </div>
                <div>{adjustment.notes}</div>
              </Col>
            )}
            <Col span={12}>
              <div style={{ marginBottom: 8 }}>
                <strong>{t('stock.adjustments.columns.createdBy')}:</strong>
              </div>
              <div>{adjustment.createdBy}</div>
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: 8 }}>
                <strong>{t('stock.adjustments.columns.createdAt')}:</strong>
              </div>
              <div>{dayjs(adjustment.createdAt).format('DD.MM.YYYY HH:mm')}</div>
            </Col>
            {adjustment.approvedBy && (
              <>
                <Col span={12}>
                  <div style={{ marginBottom: 8 }}>
                    <strong>{t('stock.adjustments.columns.approvedBy')}:</strong>
                  </div>
                  <div>{adjustment.approvedBy}</div>
                </Col>
                <Col span={12}>
                  <div style={{ marginBottom: 8 }}>
                    <strong>{t('stock.adjustments.columns.approvedAt')}:</strong>
                  </div>
                  <div>{dayjs(adjustment.approvedAt).format('DD.MM.YYYY HH:mm')}</div>
                </Col>
              </>
            )}
            {adjustment.rejectedBy && (
              <>
                <Col span={12}>
                  <div style={{ marginBottom: 8 }}>
                    <strong>{t('stock.adjustments.columns.rejectedBy')}:</strong>
                  </div>
                  <div>{adjustment.rejectedBy}</div>
                </Col>
                <Col span={12}>
                  <div style={{ marginBottom: 8 }}>
                    <strong>{t('stock.adjustments.columns.rejectedAt')}:</strong>
                  </div>
                  <div>{dayjs(adjustment.rejectedAt).format('DD.MM.YYYY HH:mm')}</div>
                </Col>
                <Col span={24}>
                  <div style={{ marginBottom: 8 }}>
                    <strong>{t('stock.adjustments.columns.rejectionReason')}:</strong>
                  </div>
                  <div>{adjustment.rejectionReason}</div>
                </Col>
              </>
            )}
          </Row>
        </div>
      ),
    });
  };

  // Durum rengi - Düzeltme durumuna göre renk
  const getStatusColor = (status: StockAdjustment['status']): string => {
    const colorMap = {
      pending: 'warning',
      approved: 'success',
      rejected: 'error',
    };
    return colorMap[status];
  };

  // Tablo kolonları - Ant Design Table için kolon tanımları
  const columns: ColumnsType<StockAdjustment> = [
    {
      title: t('stock.adjustments.columns.adjustmentNumber'),
      dataIndex: 'adjustmentNumber',
      key: 'adjustmentNumber',
      fixed: 'left',
      width: 160,
      render: (text) => <span style={{ fontWeight: 600 }}>{text}</span>,
    },
    {
      title: t('stock.adjustments.columns.product'),
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
      title: t('stock.adjustments.columns.warehouse'),
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      width: 130,
    },
    {
      title: t('stock.adjustments.columns.currentStock'),
      dataIndex: 'currentStock',
      key: 'currentStock',
      width: 120,
      align: 'right',
      render: (value) => value.toLocaleString(),
    },
    {
      title: t('stock.adjustments.columns.adjustedStock'),
      dataIndex: 'adjustedStock',
      key: 'adjustedStock',
      width: 120,
      align: 'right',
      render: (value) => value.toLocaleString(),
    },
    {
      title: t('stock.adjustments.columns.difference'),
      dataIndex: 'difference',
      key: 'difference',
      width: 120,
      align: 'right',
      render: (value) => (
        <span
          style={{
            fontWeight: 600,
            color: value > 0 ? '#52c41a' : '#ff4d4f',
          }}
        >
          {value > 0 ? '+' : ''}
          {value.toLocaleString()}
        </span>
      ),
    },
    {
      title: t('stock.adjustments.columns.reasonCode'),
      dataIndex: 'reasonCode',
      key: 'reasonCode',
      width: 120,
      render: (code) => (
        <Tag color="blue">{t(`stock.adjustments.reasonCodes.${code}`)}</Tag>
      ),
    },
    {
      title: t('stock.adjustments.columns.reason'),
      dataIndex: 'reason',
      key: 'reason',
      width: 200,
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <span>{text}</span>
        </Tooltip>
      ),
    },
    {
      title: t('stock.adjustments.columns.createdBy'),
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 120,
    },
    {
      title: t('stock.adjustments.columns.createdAt'),
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
      title: t('stock.adjustments.columns.status'),
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: StockAdjustment['status']) => (
        <Tag color={getStatusColor(status)}>
          {t(`stock.adjustments.status.${status}`)}
        </Tag>
      ),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            {t('common.view')}
          </Button>
          {record.status === 'pending' && (
            <>
              <Button
                type="link"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleApprove(record)}
                loading={approveMutation.isPending}
                style={{ color: '#52c41a' }}
              >
                {t('stock.adjustments.actions.approve')}
              </Button>
              <Button
                type="link"
                size="small"
                icon={<CloseCircleOutlined />}
                onClick={() => handleReject(record)}
                loading={rejectMutation.isPending}
                danger
              >
                {t('stock.adjustments.actions.reject')}
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  // Filtreleri sıfırla - Tüm filtreleri temizleme
  const handleResetFilters = () => {
    setFilter({});
    message.success(t('stock.adjustments.messages.filtersReset'));
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Header - Sayfa başlığı ve açıklama */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <h1 style={{ fontSize: 28, fontWeight: 600, margin: 0 }}>
            {t('stock.adjustments.title')}
          </h1>
          <p style={{ color: '#8c8c8c', margin: '8px 0 0' }}>
            {t('stock.adjustments.description')}
          </p>
        </Col>
        <Col>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/stock/adjustments/create')}
            >
              {t('stock.adjustments.create.title')}
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => refetch()}
              loading={isLoading}
            >
              {t('common.refresh')}
            </Button>
          </Space>
        </Col>
      </Row>

      {/* İstatistikler - Düzeltme özet kartları */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('stock.adjustments.stats.total')}
              value={statistics?.total || 0}
              valueStyle={{ color: '#1890ff', fontSize: 24 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('stock.adjustments.stats.pending')}
              value={statistics?.pending || 0}
              valueStyle={{ color: '#faad14', fontSize: 24 }}
              prefix={<ClockCircleOutlined />}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
              {t('stock.adjustments.stats.needsApproval')}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('stock.adjustments.stats.approved')}
              value={statistics?.approved || 0}
              valueStyle={{ color: '#52c41a', fontSize: 24 }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('stock.adjustments.stats.rejected')}
              value={statistics?.rejected || 0}
              valueStyle={{ color: '#ff4d4f', fontSize: 24 }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Filtreler - Arama ve filtreleme */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} lg={6}>
            <Select
              placeholder={t('stock.adjustments.filters.statusPlaceholder')}
              style={{ width: '100%' }}
              allowClear
              onChange={(value) => setFilter({ ...filter, status: value })}
              value={filter.status}
              options={[
                { label: t('stock.adjustments.status.pending'), value: 'pending' },
                { label: t('stock.adjustments.status.approved'), value: 'approved' },
                { label: t('stock.adjustments.status.rejected'), value: 'rejected' },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Select
              placeholder={t('stock.adjustments.filters.warehousePlaceholder')}
              style={{ width: '100%' }}
              allowClear
              onChange={(value) => setFilter({ ...filter, warehouseId: value })}
              value={filter.warehouseId}
              options={[
                { label: 'Ana Depo', value: 'warehouse-1' },
                { label: 'Yan Depo', value: 'warehouse-2' },
                { label: 'Soğuk Depo', value: 'warehouse-3' },
              ]}
            />
          </Col>
        </Row>
        <Row style={{ marginTop: 16 }}>
          <Col>
            <Button icon={<FilterOutlined />} onClick={handleResetFilters}>
              {t('stock.adjustments.filters.reset')}
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Tablo - Ana düzeltmeler tablosu */}
      <Card>
        <Table
          columns={columns}
          dataSource={adjustments}
          rowKey="id"
          loading={isLoading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total) => `${t('common.total')} ${total} ${t('common.items')}`,
          }}
          scroll={{ x: 1800 }}
          size="middle"
        />
      </Card>

      {/* Reddetme Modal - Düzeltmeyi reddetme formu */}
      <Modal
        title={t('stock.adjustments.reject.title')}
        open={rejectModalVisible}
        onOk={handleRejectConfirm}
        onCancel={() => {
          setRejectModalVisible(false);
          setRejectingAdjustment(null);
          setRejectionReason('');
        }}
        confirmLoading={rejectMutation.isPending}
        okText={t('stock.adjustments.reject.confirm')}
        cancelText={t('common.cancel')}
        okButtonProps={{ danger: true }}
      >
        <div style={{ marginBottom: 16 }}>
          <p>
            {t('stock.adjustments.reject.confirmText', {
              product: rejectingAdjustment?.productName,
            })}
          </p>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 8 }}>
            {t('stock.adjustments.reject.reasonLabel')} *
          </label>
          <TextArea
            rows={4}
            placeholder={t('stock.adjustments.reject.reasonPlaceholder')}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};

export default StockAdjustments;
