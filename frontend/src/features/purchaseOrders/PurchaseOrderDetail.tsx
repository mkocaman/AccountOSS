import { 
  Card, 
  Descriptions, 
  Table, 
  Button, 
  Space, 
  Tag,
  Statistic,
  Row,
  Col,
  Spin,
  message,
  Progress
} from 'antd';
import { 
  ArrowLeftOutlined,
  EditOutlined,
  CheckOutlined,
  FilePdfOutlined,
  InboxOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ColumnsType } from 'antd/es/table';

import { purchaseOrdersApi } from '@/api/purchaseOrders';
import type { PurchaseOrderItem } from '@/types/purchaseOrder';
import { 
  PurchaseOrderStatus, 
  purchaseOrderStatusLabels, 
  purchaseOrderStatusColors 
} from '@/types/purchaseOrder';
import { formatCurrency, formatDate, downloadFile } from '@/lib/utils';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function PurchaseOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch order
  const { data: order, isLoading } = useQuery({
    queryKey: ['purchaseOrder', id],
    queryFn: () => purchaseOrdersApi.getById(id!),
    enabled: !!id
  });

  usePageTitle(order ? `${order.orderNumber} - Sipariş Detayı` : 'Sipariş Detayı');

  // Confirm mutation
  const confirmMutation = useMutation({
    mutationFn: (id: string) => purchaseOrdersApi.confirm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrder', id] });
      message.success('Sipariş onaylandı');
    }
  });

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: (id: string) => purchaseOrdersApi.exportPdf(id),
    onSuccess: (blob: any) => {
      downloadFile(blob as Blob, `${order?.orderNumber}.pdf`);
      message.success('PDF indirildi');
    }
  });

  // Item columns
  const itemColumns: ColumnsType<PurchaseOrderItem> = [
    {
      title: '#',
      dataIndex: 'lineNumber',
      width: 50
    },
    {
      title: 'Ürün',
      key: 'product',
      render: (_, record) => (
        <div>
          <div className="font-semibold">{record.product?.name}</div>
          <div className="text-xs text-gray-500">{record.product?.code}</div>
        </div>
      )
    },
    {
      title: 'Sipariş Miktarı',
      dataIndex: 'orderedQuantity',
      width: 130,
      align: 'right',
      render: (qty, record) => `${qty} ${record.product?.unit}`
    },
    {
      title: 'Teslim Alınan',
      dataIndex: 'receivedQuantity',
      width: 130,
      align: 'right',
      render: (qty, record) => (
        <span className="text-green-600 font-semibold">
          {qty} {record.product?.unit}
        </span>
      )
    },
    {
      title: 'Kalan',
      dataIndex: 'remainingQuantity',
      width: 130,
      align: 'right',
      render: (qty, record) => (
        <span className={qty > 0 ? 'text-orange-600' : 'text-gray-400'}>
          {qty} {record.product?.unit}
        </span>
      )
    },
    {
      title: 'Durum',
      key: 'status',
      width: 120,
      align: 'center',
      render: (_, record) => {
        const percent = record.orderedQuantity > 0 
          ? Math.round((record.receivedQuantity / record.orderedQuantity) * 100) 
          : 0;
        return <Progress percent={percent} size="small" />;
      }
    },
    {
      title: 'Birim Fiyat',
      dataIndex: 'unitPrice',
      width: 120,
      align: 'right',
      render: (price) => formatCurrency(price, order?.currency || 'TRY')
    },
    {
      title: 'İskonto',
      dataIndex: 'discountPercent',
      width: 100,
      align: 'right',
      render: (percent) => `${percent || 0}%`
    },
    {
      title: 'KDV',
      dataIndex: 'taxPercent',
      width: 80,
      align: 'right',
      render: (percent) => `${percent || 0}%`
    },
    {
      title: 'Toplam',
      dataIndex: 'lineTotal',
      width: 130,
      align: 'right',
      render: (total) => (
        <span className="font-semibold">
          {formatCurrency(total, order?.currency || 'TRY')}
        </span>
      )
    }
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">Sipariş bulunamadı</div>
            <Button type="primary" onClick={() => navigate('/purchase-orders')} className="mt-4">
              Sipariş Listesine Dön
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/purchase-orders')}
          className="mb-4"
        >
          Geri
        </Button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {order.orderNumber}
            </h1>
            <Space>
              <Tag color={purchaseOrderStatusColors[order.status]} className="text-base px-3 py-1">
                {purchaseOrderStatusLabels[order.status]}
              </Tag>
              {order.isFullyReceived && (
                <Tag color="success" className="text-base px-3 py-1">
                  Teslim Alındı
                </Tag>
              )}
            </Space>
          </div>

          <Space>
            {order.status === PurchaseOrderStatus.Draft && (
              <>
                <Button
                  icon={<EditOutlined />}
                  onClick={() => navigate(`/purchase-orders/edit/${order.id}`)}
                >
                  Düzenle
                </Button>
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={() => confirmMutation.mutate(order.id)}
                  loading={confirmMutation.isPending}
                >
                  Onayla
                </Button>
              </>
            )}
            {(order.status === PurchaseOrderStatus.Confirmed || 
              order.status === PurchaseOrderStatus.PartiallyReceived) && (
              <Button
                type="primary"
                icon={<InboxOutlined />}
                onClick={() => navigate(`/goods-receipts/new?poId=${order.id}`)}
              >
                Mal Kabul Yap
              </Button>
            )}
            <Button
              icon={<FilePdfOutlined />}
              onClick={() => exportMutation.mutate(order.id)}
              loading={exportMutation.isPending}
            >
              PDF İndir
            </Button>
          </Space>
        </div>
      </div>

      {/* Summary Cards */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Toplam Tutar"
              value={order.totalAmount}
              precision={2}
              suffix={order.currency}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Sipariş Edilen"
              value={order.items.reduce((sum, item) => sum + item.orderedQuantity, 0)}
              precision={2}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Teslim Alınan"
              value={order.receivedQuantity}
              precision={2}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Kalan"
              value={order.remainingQuantity}
              precision={2}
              valueStyle={{ color: order.remainingQuantity > 0 ? '#faad14' : '#d9d9d9' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Order Info */}
      <Card title="Sipariş Bilgileri" className="mb-4">
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 2 }}>
          <Descriptions.Item label="Sipariş No">{order.orderNumber}</Descriptions.Item>
          <Descriptions.Item label="Durum">
            <Tag color={purchaseOrderStatusColors[order.status]}>
              {purchaseOrderStatusLabels[order.status]}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Sipariş Tarihi">{formatDate(order.orderDate)}</Descriptions.Item>
          <Descriptions.Item label="Teslim Tarihi">
            {order.deliveryDate ? formatDate(order.deliveryDate) : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Tedarikçi">
            {order.supplier?.name}
            <div className="text-xs text-gray-500">{order.supplier?.code}</div>
          </Descriptions.Item>
          <Descriptions.Item label="Depo">
            {order.warehouse?.name}
          </Descriptions.Item>
          <Descriptions.Item label="Para Birimi">{order.currency}</Descriptions.Item>
          <Descriptions.Item label="Oluşturan">
            {order.createdByUser?.name || '-'}
          </Descriptions.Item>
          {order.notes && (
            <Descriptions.Item label="Notlar" span={2}>
              {order.notes}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* Items Table */}
      <Card title="Sipariş Kalemleri">
        <Table
          columns={itemColumns}
          dataSource={order.items}
          rowKey="id"
          pagination={false}
          scroll={{ x: 1200 }}
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={6}>
                  <strong>TOPLAM</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={6} align="right">
                  <strong>Ara Toplam:</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={7} align="right" colSpan={2}>
                  <strong>{formatCurrency(order.subtotal, order.currency)}</strong>
                </Table.Summary.Cell>
              </Table.Summary.Row>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={6} />
                <Table.Summary.Cell index={6} align="right">
                  <strong>İskonto:</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={7} align="right" colSpan={2}>
                  <strong className="text-red-600">
                    -{formatCurrency(order.discountAmount, order.currency)}
                  </strong>
                </Table.Summary.Cell>
              </Table.Summary.Row>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={6} />
                <Table.Summary.Cell index={6} align="right">
                  <strong>KDV:</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={7} align="right" colSpan={2}>
                  <strong className="text-blue-600">
                    {formatCurrency(order.taxAmount, order.currency)}
                  </strong>
                </Table.Summary.Cell>
              </Table.Summary.Row>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={6} />
                <Table.Summary.Cell index={6} align="right">
                  <strong className="text-lg">GENEL TOPLAM:</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={7} align="right" colSpan={2}>
                  <strong className="text-lg text-green-600">
                    {formatCurrency(order.totalAmount, order.currency)}
                  </strong>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </Card>
    </div>
  );
}

