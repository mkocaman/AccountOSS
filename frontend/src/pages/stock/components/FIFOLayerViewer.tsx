import React from 'react';
import {
  Modal,
  Table,
  Empty,
  Spin,
  Alert,
  Statistic,
  Row,
  Col,
  Tag,
} from 'antd';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import type { ColumnsType } from 'antd/es/table';
import { stockService } from '@/services/stockService';
import type { FIFOLayer } from '@/types/stock';
import { formatCurrency } from '@/utils/chartUtils';
import dayjs from 'dayjs';

interface FIFOLayerViewerProps {
  visible: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  warehouseId?: string;
}

export const FIFOLayerViewer: React.FC<FIFOLayerViewerProps> = ({
  visible,
  onClose,
  productId,
  productName,
  warehouseId,
}) => {
  const { t, i18n } = useTranslation();

  // FIFO katmanlarını getir - Ürünün maliyet katmanları
  const {
    data: layers,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['fifoLayers', productId, warehouseId],
    queryFn: () => stockService.getFIFOLayers(productId, warehouseId),
    enabled: visible && !!productId,
    staleTime: 30 * 1000,
  });

  // İstatistikleri hesapla - FIFO katman özet bilgileri
  const statistics = React.useMemo(() => {
    if (!layers) return null;

    const totalQuantity = layers.reduce((sum, layer) => sum + layer.quantity, 0);
    const remainingQuantity = layers.reduce((sum, layer) => sum + layer.remainingQuantity, 0);
    const totalCost = layers.reduce((sum, layer) => sum + layer.totalCost, 0);
    const averageCost = totalQuantity > 0 ? totalCost / totalQuantity : 0;

    return {
      totalQuantity,
      remainingQuantity,
      totalCost,
      averageCost,
      layerCount: layers.length,
    };
  }, [layers]);

  // Tablo kolonları - FIFO katmanları tablosu
  const columns: ColumnsType<FIFOLayer> = [
    {
      title: t('stock.fifo.columns.purchaseDate'),
      dataIndex: 'purchaseDate',
      key: 'purchaseDate',
      width: 120,
      render: (date) => (
        <div>
          <div>{dayjs(date).format('DD.MM.YYYY')}</div>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>
            {dayjs(date).fromNow()}
          </div>
        </div>
      ),
    },
    {
      title: t('stock.fifo.columns.batchNumber'),
      dataIndex: 'batchNumber',
      key: 'batchNumber',
      width: 120,
      render: (text) => text || '-',
    },
    {
      title: t('stock.fifo.columns.quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'right',
      render: (value) => value.toLocaleString(),
    },
    {
      title: t('stock.fifo.columns.remaining'),
      dataIndex: 'remainingQuantity',
      key: 'remainingQuantity',
      width: 100,
      align: 'right',
      render: (value, record) => (
        <span
          style={{
            color: value > 0 ? '#52c41a' : '#8c8c8c',
            fontWeight: value > 0 ? 600 : 400,
          }}
        >
          {value.toLocaleString()}
        </span>
      ),
    },
    {
      title: t('stock.fifo.columns.unitCost'),
      dataIndex: 'unitCost',
      key: 'unitCost',
      width: 120,
      align: 'right',
      render: (value) => formatCurrency(value, i18n.language),
    },
    {
      title: t('stock.fifo.columns.totalCost'),
      dataIndex: 'totalCost',
      key: 'totalCost',
      width: 140,
      align: 'right',
      render: (value) => (
        <span style={{ fontWeight: 600 }}>
          {formatCurrency(value, i18n.language)}
        </span>
      ),
    },
    {
      title: t('stock.fifo.columns.expiryDate'),
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 120,
      render: (date) => {
        if (!date) return '-';
        const isExpired = dayjs(date).isBefore(dayjs());
        const isNearExpiry = dayjs(date).isBefore(dayjs().add(30, 'days'));
        
        return (
          <div>
            <div style={{ color: isExpired ? '#ff4d4f' : isNearExpiry ? '#faad14' : '#52c41a' }}>
              {dayjs(date).format('DD.MM.YYYY')}
            </div>
            {isExpired && (
              <Tag color="red" size="small">
                {t('stock.fifo.status.expired')}
              </Tag>
            )}
            {!isExpired && isNearExpiry && (
              <Tag color="orange" size="small">
                {t('stock.fifo.status.nearExpiry')}
              </Tag>
            )}
          </div>
        );
      },
    },
    {
      title: t('stock.fifo.columns.purchaseNumber'),
      dataIndex: 'purchaseNumber',
      key: 'purchaseNumber',
      width: 140,
      render: (text) => text || '-',
    },
    {
      title: t('stock.fifo.columns.status'),
      key: 'status',
      width: 100,
      render: (_, record) => {
        if (record.remainingQuantity === 0) {
          return <Tag color="red">{t('stock.fifo.status.used')}</Tag>;
        }
        if (record.remainingQuantity < record.quantity) {
          return <Tag color="orange">{t('stock.fifo.status.partial')}</Tag>;
        }
        return <Tag color="green">{t('stock.fifo.status.available')}</Tag>;
      },
    },
  ];

  return (
    <Modal
      title={
        <div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>
            {t('stock.fifo.title')}
          </div>
          <div style={{ fontSize: 14, color: '#8c8c8c', marginTop: 4 }}>
            {productName}
          </div>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={1000}
      style={{ top: 20 }}
    >
      {/* FIFO Açıklama - FIFO sistemi hakkında bilgi */}
      <Alert
        message={t('stock.fifo.info.title')}
        description={t('stock.fifo.info.description')}
        type="info"
        style={{ marginBottom: 16 }}
        showIcon
      />

      {/* İstatistikler - FIFO katman özeti */}
      {statistics && (
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={12} sm={6}>
            <Statistic
              title={t('stock.fifo.stats.totalQuantity')}
              value={statistics.totalQuantity}
              formatter={(value) => value?.toLocaleString()}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic
              title={t('stock.fifo.stats.remainingQuantity')}
              value={statistics.remainingQuantity}
              formatter={(value) => value?.toLocaleString()}
              valueStyle={{
                color: statistics.remainingQuantity > 0 ? '#52c41a' : '#8c8c8c',
              }}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic
              title={t('stock.fifo.stats.totalCost')}
              value={statistics.totalCost}
              formatter={(value) => formatCurrency(value as number, i18n.language)}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic
              title={t('stock.fifo.stats.averageCost')}
              value={statistics.averageCost}
              formatter={(value) => formatCurrency(value as number, i18n.language)}
            />
          </Col>
        </Row>
      )}

      {/* FIFO Katmanları Tablosu - Ana FIFO katmanları listesi */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16, color: '#8c8c8c' }}>
            {t('stock.fifo.loading')}
          </div>
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Alert
            message={t('stock.fifo.error.title')}
            description={t('stock.fifo.error.description')}
            type="error"
            showIcon
          />
        </div>
      ) : !layers || layers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Empty
            description={t('stock.fifo.empty')}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      ) : (
        <>
          <Table
            columns={columns}
            dataSource={layers}
            rowKey="id"
            pagination={false}
            size="small"
            scroll={{ y: 400 }}
          />
          
          {/* FIFO Bilgilendirme - FIFO sistemi hakkında notlar */}
          <div style={{ marginTop: 16, padding: 12, backgroundColor: '#f6f6f6', borderRadius: 6 }}>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>
              <p style={{ margin: 0, marginBottom: 8 }}>
                <strong>{t('stock.fifo.notes.title')}:</strong>
              </p>
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                <li>{t('stock.fifo.notes.note1')}</li>
                <li>{t('stock.fifo.notes.note2')}</li>
                <li>{t('stock.fifo.notes.note3')}</li>
                <li>{t('stock.fifo.notes.note4')}</li>
              </ul>
            </div>
          </div>
        </>
      )}
    </Modal>
  );
};
