import { useState } from 'react';
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
  Progress,
  Alert,
  Modal,
  Form,
  DatePicker,
  Input
} from 'antd';
import { 
  ArrowLeftOutlined,
  EditOutlined,
  CheckOutlined,
  FilePdfOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';

import { salesOrdersApi } from '@/api/salesOrders';
import type { SalesOrderItem, CreateInvoiceFromSalesOrderRequest } from '@/types/salesOrder';
import { 
  SalesOrderStatus, 
  salesOrderStatusLabels, 
  salesOrderStatusColors 
} from '@/types/salesOrder';
import { formatCurrency, formatDate, downloadFile } from '@/lib/utils';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function SalesOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [invoiceForm] = Form.useForm();

  // Fetch order
  const { data: order, isLoading } = useQuery({
    queryKey: ['salesOrder', id],
    queryFn: () => salesOrdersApi.getById(id!),
    enabled: !!id
  });

  usePageTitle(order ? `${order.orderNumber} - Satış Siparişi Detayı` : 'Satış Siparişi Detayı');

  // Confirm mutation
  const confirmMutation = useMutation({
    mutationFn: (id: string) => salesOrdersApi.confirm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salesOrder', id] });
      message.success('Sipariş onaylandı');
    }
  });

  // Create invoice mutation
  const createInvoiceMutation = useMutation({
    mutationFn: (data: CreateInvoiceFromSalesOrderRequest) => 
      salesOrdersApi.createInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salesOrder', id] });
      setInvoiceModalOpen(false);
      message.success('Fatura oluşturuldu');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Fatura oluşturulamadı');
    }
  });

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: (id: string) => salesOrdersApi.exportPdf(id),
    onSuccess: (blob: any) => {
      downloadFile(blob as Blob, `${order?.orderNumber}.pdf`);
      message.success('PDF indirildi');
    }
  });

  // Handle create invoice
  const handleCreateInvoice = async (values: any) => {
    const data: CreateInvoiceFromSalesOrderRequest = {
      salesOrderId: id!,
      invoiceDate: values.invoiceDate.format('YYYY-MM-DD'),
      dueDate: values.dueDate?.format('YYYY-MM-DD'),
      notes: values.notes
    };
    await createInvoiceMutation.mutateAsync(data);
  };

  // Item columns
  const itemColumns: ColumnsType<SalesOrderItem> = [
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
      title: 'Açıklama',
      dataIndex: 'description',
      ellipsis: true,
      render: (desc) => desc || '-'
    },
    {
      title: 'Sipariş Miktarı',
      dataIndex: 'orderedQuantity',
      width: 130,
      align: 'right',
      render: (qty, record) => `${qty} ${record.product?.unit}`
    },
    {
      title: 'Teslim Edilen',
      dataIndex: 'deliveredQuantity',
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
          ? Math.round((record.deliveredQuantity / record.orderedQuantity) * 100) 
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
      render: (percent, record) => (
        <div>
          <div>{percent || 0}%</div>
          {record.discountAmount > 0 && (
            <div className="text-xs text-red-600">
              -{formatCurrency(record.discountAmount, order?.currency || 'TRY')}
            </div>
          )}
        </div>
      )
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
            <Button type="primary" onClick={() => navigate('/sales-orders')} className="mt-4">
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
          onClick={() => navigate('/sales-orders')}
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
              <Tag color={salesOrderStatusColors[order.status]} className="text-base px-3 py-1">
                {salesOrderStatusLabels[order.status]}
              </Tag>
              {order.isFullyDelivered && (
                <Tag color="success" className="text-base px-3 py-1">
                  Teslim Edildi
                </Tag>
              )}
              {order.isInvoiced && (
                <Tag color="purple" icon={<FileTextOutlined />} className="text-base px-3 py-1">
                  Faturalandı
                </Tag>
              )}
            </Space>
          </div>

          <Space>
            {order.status === SalesOrderStatus.Draft && (
              <>
                <Button
                  icon={<EditOutlined />}
                  onClick={() => navigate(`/sales-orders/edit/${order.id}`)}
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
            {(order.status === SalesOrderStatus.Confirmed || 
              order.status === SalesOrderStatus.PartiallyDelivered) && !order.isInvoiced && (
              <Button
                type="primary"
                icon={<FileTextOutlined />}
                onClick={() => setInvoiceModalOpen(true)}
              >
                Fatura Kes
              </Button>
            )}
            {order.invoiceId && (
              <Button
                icon={<FileTextOutlined />}
                onClick={() => navigate(`/invoices/${order.invoiceId}`)}
              >
                Faturayı Görüntüle
              </Button>
            )}
            {order.quotationId && (
              <Button
                onClick={() => navigate(`/quotations/${order.quotationId}`)}
              >
                Teklifi Görüntüle
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

      {/* Quotation Info */}
      {order.quotationId && order.quotation && (
        <Alert
          message="Bu sipariş tekliften dönüştürülmüştür"
          description={
            <div>
              Teklif No: <Button type="link" size="small" onClick={() => navigate(`/quotations/${order.quotationId}`)}>
                {order.quotation.quotationNumber}
              </Button>
            </div>
          }
          type="info"
          showIcon
          className="mb-4"
        />
      )}

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
              title="Teslim Edilen"
              value={order.deliveredQuantity}
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
            <Tag color={salesOrderStatusColors[order.status]}>
              {salesOrderStatusLabels[order.status]}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Sipariş Tarihi">{formatDate(order.orderDate)}</Descriptions.Item>
          <Descriptions.Item label="Teslim Tarihi">
            {order.deliveryDate ? formatDate(order.deliveryDate) : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Müşteri">
            {order.customer?.name}
            <div className="text-xs text-gray-500">{order.customer?.code}</div>
          </Descriptions.Item>
          <Descriptions.Item label="Para Birimi">{order.currency}</Descriptions.Item>
          {order.quotationId && (
            <Descriptions.Item label="Teklif No">
              <Button
                type="link"
                size="small"
                onClick={() => navigate(`/quotations/${order.quotationId}`)}
              >
                {order.quotation?.quotationNumber}
              </Button>
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Fatura Durumu">
            {order.isInvoiced ? (
              <Tag color="purple" icon={<FileTextOutlined />}>Faturalandı</Tag>
            ) : (
              <Tag color="orange">Fatura Bekleniyor</Tag>
            )}
          </Descriptions.Item>
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
          scroll={{ x: 1400 }}
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={7}>
                  <strong>ARA TOPLAM</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={7} align="right" colSpan={3}>
                  <strong>{formatCurrency(order.subtotal, order.currency)}</strong>
                </Table.Summary.Cell>
              </Table.Summary.Row>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={7}>
                  <strong>İSKONTO</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={7} align="right" colSpan={3}>
                  <strong className="text-red-600">
                    -{formatCurrency(order.discountAmount, order.currency)}
                  </strong>
                </Table.Summary.Cell>
              </Table.Summary.Row>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={7}>
                  <strong>KDV</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={7} align="right" colSpan={3}>
                  <strong className="text-blue-600">
                    {formatCurrency(order.taxAmount, order.currency)}
                  </strong>
                </Table.Summary.Cell>
              </Table.Summary.Row>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={7}>
                  <strong className="text-lg">GENEL TOPLAM</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={7} align="right" colSpan={3}>
                  <strong className="text-lg text-green-600">
                    {formatCurrency(order.totalAmount, order.currency)}
                  </strong>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </Card>

      {/* Create Invoice Modal */}
      <Modal
        title="Fatura Oluştur"
        open={invoiceModalOpen}
        onCancel={() => setInvoiceModalOpen(false)}
        onOk={() => invoiceForm.submit()}
        confirmLoading={createInvoiceMutation.isPending}
        width={500}
      >
        <Form
          form={invoiceForm}
          layout="vertical"
          onFinish={handleCreateInvoice}
          initialValues={{
            invoiceDate: dayjs()
          }}
        >
          <Form.Item
            name="invoiceDate"
            label="Fatura Tarihi"
            rules={[{ required: true, message: 'Fatura tarihi zorunludur' }]}
          >
            <DatePicker className="w-full" />
          </Form.Item>

          <Form.Item
            name="dueDate"
            label="Vade Tarihi"
          >
            <DatePicker className="w-full" />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Fatura Notları"
          >
            <Input.TextArea rows={3} placeholder="Fatura ile ilgili notlar..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

