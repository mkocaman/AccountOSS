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
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';

import { goodsReceiptsApi } from '@/api/goodsReceipts';
import type { GoodsReceiptItem, CreateInvoiceFromGrRequest } from '@/types/goodsReceipt';
import { 
  GoodsReceiptStatus, 
  goodsReceiptStatusLabels, 
  goodsReceiptStatusColors 
} from '@/types/goodsReceipt';
import { formatDate, downloadFile } from '@/lib/utils';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function GoodsReceiptDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [invoiceForm] = Form.useForm();

  // Fetch receipt
  const { data: receipt, isLoading } = useQuery({
    queryKey: ['goodsReceipt', id],
    queryFn: () => goodsReceiptsApi.getById(id!),
    enabled: !!id
  });

  usePageTitle(receipt ? `${receipt.receiptNumber} - Mal Kabul Detayı` : 'Mal Kabul Detayı');

  // Complete mutation
  const completeMutation = useMutation({
    mutationFn: (id: string) => goodsReceiptsApi.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goodsReceipt', id] });
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
      message.success('Mal kabul tamamlandı');
    }
  });

  // Create invoice mutation
  const createInvoiceMutation = useMutation({
    mutationFn: (data: CreateInvoiceFromGrRequest) => 
      goodsReceiptsApi.createInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goodsReceipt', id] });
      setInvoiceModalOpen(false);
      message.success('Fatura oluşturuldu');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Fatura oluşturulamadı');
    }
  });

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: (id: string) => goodsReceiptsApi.exportPdf(id),
    onSuccess: (blob: any) => {
      downloadFile(blob as Blob, `${receipt?.receiptNumber}.pdf`);
      message.success('PDF indirildi');
    }
  });

  // Handle create invoice
  const handleCreateInvoice = async (values: any) => {
    const data: CreateInvoiceFromGrRequest = {
      goodsReceiptId: id!,
      invoiceDate: values.invoiceDate.format('YYYY-MM-DD'),
      dueDate: values.dueDate?.format('YYYY-MM-DD'),
      notes: values.notes
    };
    await createInvoiceMutation.mutateAsync(data);
  };

  // Item columns
  const itemColumns: ColumnsType<GoodsReceiptItem> = [
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
      title: 'Sipariş Edilen',
      dataIndex: 'orderedQuantity',
      width: 130,
      align: 'right',
      render: (qty, record) => (
        <div className="text-gray-500">
          {qty} {record.product?.unit}
        </div>
      )
    },
    {
      title: 'Önceki Kabul',
      dataIndex: 'previouslyReceivedQuantity',
      width: 130,
      align: 'right',
      render: (qty, record) => (
        <div className="text-blue-500">
          {qty} {record.product?.unit}
        </div>
      )
    },
    {
      title: 'Bu Kabulde',
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
      title: 'Birim Maliyet',
      dataIndex: 'unitCost',
      width: 120,
      align: 'right',
      render: (cost) => `${cost.toFixed(2)} ₺`
    },
    {
      title: 'Toplam Maliyet',
      dataIndex: 'totalCost',
      width: 130,
      align: 'right',
      render: (total) => (
        <span className="font-semibold">
          {total.toFixed(2)} ₺
        </span>
      )
    },
    {
      title: 'Kalite',
      dataIndex: 'isQualityApproved',
      width: 100,
      align: 'center',
      render: (approved) => (
        approved ? (
          <Tag color="green" icon={<CheckCircleOutlined />}>Onaylı</Tag>
        ) : (
          <Tag color="orange" icon={<CloseCircleOutlined />}>Beklemede</Tag>
        )
      )
    },
    {
      title: 'Kalite Notu',
      dataIndex: 'qualityNotes',
      ellipsis: true,
      render: (notes) => notes || '-'
    }
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">Mal kabul bulunamadı</div>
            <Button type="primary" onClick={() => navigate('/goods-receipts')} className="mt-4">
              Mal Kabul Listesine Dön
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
          onClick={() => navigate('/goods-receipts')}
          className="mb-4"
        >
          Geri
        </Button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {receipt.receiptNumber}
            </h1>
            <Space>
              <Tag color={goodsReceiptStatusColors[receipt.status]} className="text-base px-3 py-1">
                {goodsReceiptStatusLabels[receipt.status]}
              </Tag>
              {receipt.isInvoiceCreated && (
                <Tag color="blue" icon={<FileTextOutlined />} className="text-base px-3 py-1">
                  Faturalandı
                </Tag>
              )}
            </Space>
          </div>

          <Space>
            {receipt.status === GoodsReceiptStatus.Draft && (
              <>
                <Button
                  icon={<EditOutlined />}
                  onClick={() => navigate(`/goods-receipts/edit/${receipt.id}`)}
                >
                  Düzenle
                </Button>
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={() => completeMutation.mutate(receipt.id)}
                  loading={completeMutation.isPending}
                >
                  Tamamla
                </Button>
              </>
            )}
            {receipt.status === GoodsReceiptStatus.Completed && !receipt.isInvoiceCreated && (
              <Button
                type="primary"
                icon={<FileTextOutlined />}
                onClick={() => setInvoiceModalOpen(true)}
              >
                Fatura Kes
              </Button>
            )}
            {receipt.invoiceId && (
              <Button
                icon={<FileTextOutlined />}
                onClick={() => navigate(`/invoices/${receipt.invoiceId}`)}
              >
                Faturayı Görüntüle
              </Button>
            )}
            <Button
              icon={<FilePdfOutlined />}
              onClick={() => exportMutation.mutate(receipt.id)}
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
              title="Toplam Ürün Sayısı"
              value={receipt.items.length}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Toplam Miktar"
              value={receipt.items.reduce((sum, item) => sum + item.receivedQuantity, 0)}
              precision={2}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Toplam Değer"
              value={receipt.items.reduce((sum, item) => sum + item.totalCost, 0)}
              precision={2}
              suffix="₺"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Kalite Onayı"
              value={receipt.items.filter(item => item.isQualityApproved).length}
              suffix={`/ ${receipt.items.length}`}
              valueStyle={{ 
                color: receipt.items.every(item => item.isQualityApproved) ? '#52c41a' : '#faad14' 
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Receipt Info */}
      <Card title="Mal Kabul Bilgileri" className="mb-4">
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 2 }}>
          <Descriptions.Item label="Mal Kabul No">{receipt.receiptNumber}</Descriptions.Item>
          <Descriptions.Item label="Durum">
            <Tag color={goodsReceiptStatusColors[receipt.status]}>
              {goodsReceiptStatusLabels[receipt.status]}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Kabul Tarihi">{formatDate(receipt.receiptDate)}</Descriptions.Item>
          <Descriptions.Item label="Sipariş No">
            <Button
              type="link"
              size="small"
              onClick={() => navigate(`/purchase-orders/${receipt.purchaseOrderId}`)}
            >
              {receipt.purchaseOrder?.orderNumber}
            </Button>
          </Descriptions.Item>
          <Descriptions.Item label="Tedarikçi">
            {receipt.purchaseOrder?.supplier?.name}
            <div className="text-xs text-gray-500">{receipt.purchaseOrder?.supplier?.code}</div>
          </Descriptions.Item>
          <Descriptions.Item label="Depo">
            {receipt.warehouse?.name}
          </Descriptions.Item>
          <Descriptions.Item label="Fatura Durumu">
            {receipt.isInvoiceCreated ? (
              <Tag color="blue" icon={<FileTextOutlined />}>Faturalandı</Tag>
            ) : (
              <Tag color="orange">Fatura Bekleniyor</Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Oluşturan">
            {receipt.createdByUser?.name || '-'}
          </Descriptions.Item>
          {receipt.notes && (
            <Descriptions.Item label="Notlar" span={2}>
              {receipt.notes}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* Items Table */}
      <Card title="Teslim Alınan Ürünler">
        <Table
          columns={itemColumns}
          dataSource={receipt.items}
          rowKey="id"
          pagination={false}
          scroll={{ x: 1200 }}
          summary={() => {
            const totalCost = receipt.items.reduce((sum, item) => sum + item.totalCost, 0);
            const totalQty = receipt.items.reduce((sum, item) => sum + item.receivedQuantity, 0);
            
            return (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={4}>
                    <strong>TOPLAM</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={4} align="right">
                    <strong className="text-green-600">{totalQty.toFixed(2)}</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={5} colSpan={2} />
                  <Table.Summary.Cell index={7} align="right">
                    <strong className="text-lg text-blue-600">
                      {totalCost.toFixed(2)} ₺
                    </strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={8} />
                </Table.Summary.Row>
              </Table.Summary>
            );
          }}
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

