import { useEffect, useState } from 'react';
import { Card, Descriptions, Table, Tag, Button, Space, Spin, message, App } from 'antd';
import {
  FilePdfOutlined,
  PrinterOutlined,
  EditOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { invoicesApi } from '@/api/invoices';
import type { Invoice } from '@/types/invoice';
import {
  INVOICE_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  INVOICE_TYPE_LABELS,
  InvoiceStatus,
} from '@/types/invoice';
import type { ColumnsType } from 'antd/es/table';

// Fatura detay sayfası
export const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const { modal } = App.useApp();

  useEffect(() => {
    if (id) {
      loadInvoice();
    }
  }, [id]);

  const loadInvoice = async () => {
    setLoading(true);
    try {
      const response = await invoicesApi.getById(id!);
      if (response.success) {
        setInvoice(response.data);
      }
    } catch (error) {
      message.error('Fatura yüklenemedi');
      navigate('/invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      await invoicesApi.approve(id!);
      message.success('Fatura onaylandı');
      loadInvoice();
    } catch (error) {
      message.error('Fatura onaylanamadı');
    }
  };

  const handleCancel = () => {
    modal.confirm({
      title: 'Faturayı İptal Et',
      content: 'Faturayı iptal etmek istediğinize emin misiniz? Bu işlem geri alınamaz!',
      okText: 'İptal Et',
      okType: 'danger',
      cancelText: 'Vazgeç',
      onOk: async () => {
        try {
          await invoicesApi.cancel(id!, 'Kullanıcı tarafından iptal edildi');
          message.success('Fatura iptal edildi');
          loadInvoice();
        } catch (error) {
          message.error('Fatura iptal edilemedi');
        }
      },
    });
  };

  if (loading || !invoice) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  const itemColumns: ColumnsType<any> = [
    {
      title: '#',
      dataIndex: 'lineNumber',
      key: 'lineNumber',
      width: 50,
    },
    {
      title: 'Ürün',
      key: 'product',
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.product?.name || record.description}</div>
          <div className="text-xs text-gray-500">{record.product?.code}</div>
        </div>
      ),
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Miktar',
      key: 'quantity',
      render: (_, record) => `${record.quantity} ${record.unit}`,
    },
    {
      title: 'Birim Fiyat',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      align: 'right',
      render: (price) => `${price.toFixed(2)} ${invoice.currency}`,
    },
    {
      title: 'İndirim',
      key: 'discount',
      align: 'right',
      render: (_, record) =>
        record.discountRate > 0
          ? `%${record.discountRate} (-${record.discountAmount.toFixed(2)})`
          : '-',
    },
    {
      title: 'KDV',
      key: 'vat',
      align: 'right',
      render: (_, record) => `%${record.vatRate} (${record.vatAmount.toFixed(2)})`,
    },
    {
      title: 'Tutar',
      dataIndex: 'lineTotal',
      key: 'lineTotal',
      align: 'right',
      render: (total) => (
        <span className="font-medium">
          {total.toFixed(2)} {invoice.currency}
        </span>
      ),
    },
  ];

  return (
    <div>
      {/* Başlık ve Aksiyonlar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Fatura Detayı</h1>
          <p className="text-gray-500">{invoice.invoiceNumber}</p>
        </div>
        <Space>
          <Button icon={<FilePdfOutlined />}>PDF İndir</Button>
          <Button icon={<PrinterOutlined />}>Yazdır</Button>
          {invoice.status === InvoiceStatus.Draft && (
            <>
              <Button
                icon={<EditOutlined />}
                onClick={() => navigate(`/invoices/edit/${invoice.id}`)}
              >
                Düzenle
              </Button>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handleApprove}
              >
                Onayla
              </Button>
            </>
          )}
          {invoice.status !== InvoiceStatus.Cancelled && (
            <Button
              danger
              icon={<CloseCircleOutlined />}
              onClick={handleCancel}
            >
              İptal Et
            </Button>
          )}
        </Space>
      </div>

      {/* Fatura Bilgileri */}
      <Card title="Fatura Bilgileri" className="mb-4">
        <Descriptions column={3}>
          <Descriptions.Item label="Fatura No">
            <span className="font-mono font-medium">
              {invoice.invoiceNumber}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="Tür">
            {INVOICE_TYPE_LABELS[invoice.type]}
          </Descriptions.Item>
          <Descriptions.Item label="Tarih">
            {dayjs(invoice.invoiceDate).format('DD.MM.YYYY')}
          </Descriptions.Item>
          <Descriptions.Item label="Müşteri">
            <div>
              <div className="font-medium">{invoice.customer?.name}</div>
              <div className="text-xs text-gray-500">
                {invoice.customer?.code}
              </div>
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="Vade Tarihi">
            {invoice.dueDate
              ? dayjs(invoice.dueDate).format('DD.MM.YYYY')
              : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Para Birimi">
            {invoice.currency}
          </Descriptions.Item>
          <Descriptions.Item label="Fatura Tipi">
            <Tag color={invoice.isOfficial ? 'blue' : 'orange'}>
              {invoice.isOfficial ? 'Resmi' : 'Gayriresmi'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Durum">
            <Tag
              color={
                invoice.status === InvoiceStatus.Approved
                  ? 'success'
                  : invoice.status === InvoiceStatus.Cancelled
                  ? 'error'
                  : invoice.status === InvoiceStatus.Sent
                  ? 'processing'
                  : 'default'
              }
            >
              {INVOICE_STATUS_LABELS[invoice.status]}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Ödeme Durumu">
            <Tag
              color={
                invoice.paymentStatus === 2
                  ? 'success'
                  : invoice.paymentStatus === 1
                  ? 'warning'
                  : 'error'
              }
            >
              {PAYMENT_STATUS_LABELS[invoice.paymentStatus]}
            </Tag>
          </Descriptions.Item>
          {invoice.notes && (
            <Descriptions.Item label="Not" span={3}>
              {invoice.notes}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* Fatura Kalemleri */}
      <Card title="Fatura Kalemleri" className="mb-4">
        <Table
          columns={itemColumns}
          dataSource={invoice.items || []}
          rowKey="id"
          pagination={false}
        />
      </Card>

      {/* Fatura Özeti */}
      <Card className="mb-4">
        <div className="max-w-md ml-auto space-y-2">
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Ara Toplam:</span>
            <span className="font-medium">
              {invoice.subTotal.toFixed(2)} {invoice.currency}
            </span>
          </div>
          {invoice.totalDiscount > 0 && (
            <div className="flex justify-between py-2 text-red-600">
              <span>Toplam İndirim:</span>
              <span className="font-medium">
                -{invoice.totalDiscount.toFixed(2)} {invoice.currency}
              </span>
            </div>
          )}
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Toplam KDV:</span>
            <span className="font-medium">
              {invoice.totalVat.toFixed(2)} {invoice.currency}
            </span>
          </div>
          <div className="border-t pt-3 flex justify-between">
            <span className="text-xl font-medium">Genel Toplam:</span>
            <span className="text-2xl font-bold text-primary">
              {invoice.grandTotal.toFixed(2)} {invoice.currency}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};

