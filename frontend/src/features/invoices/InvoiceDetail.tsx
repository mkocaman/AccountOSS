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
import { useTranslation } from 'react-i18next';
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
  const { t, i18n } = useTranslation();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const { modal } = App.useApp();

  // Debug log - dil değişikliklerini takip et
  useEffect(() => {
    console.log('🌐 InvoiceDetail - Current language:', i18n.language);
    console.log('🔑 Translation test:', {
      title: t('invoice.title'),
      detail: t('invoice.detail'),
      information: t('invoice.labels.information'),
      items: t('invoice.labels.items'),
    });
  }, [i18n.language, t]);

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
      message.error(t('invoice.errors.loadDetailFailed'));
      navigate('/invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      await invoicesApi.approve(id!);
      message.success(t('invoice.messages.approveSuccess'));
      loadInvoice();
    } catch (error) {
      message.error(t('invoice.messages.approveError'));
    }
  };

  const handleCancel = () => {
    modal.confirm({
      title: t('invoice.messages.cancelConfirmTitle'),
      content: t('invoice.messages.cancelConfirmMessage'),
      okText: t('invoice.buttons.cancel'),
      okType: 'danger',
      cancelText: t('common.cancel'),
      onOk: async () => {
        try {
          await invoicesApi.cancel(id!, t('invoice.messages.cancelReason'));
          message.success(t('invoice.messages.cancelSuccess'));
          loadInvoice();
        } catch (error) {
          message.error(t('invoice.messages.cancelError'));
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
      title: t('invoice.labels.product'),
      key: 'product',
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.product?.name || record.description}</div>
          <div className="text-xs text-gray-500">{record.product?.code}</div>
        </div>
      ),
    },
    {
      title: t('invoice.labels.description'),
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: t('invoice.labels.quantity'),
      key: 'quantity',
      render: (_, record) => `${record.quantity} ${record.unit}`,
    },
    {
      title: t('invoice.labels.unitPrice'),
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      align: 'right',
      render: (price) => `${price.toFixed(2)} ${invoice.currency}`,
    },
    {
      title: t('invoice.labels.discount'),
      key: 'discount',
      align: 'right',
      render: (_, record) =>
        record.discountRate > 0
          ? `%${record.discountRate} (-${record.discountAmount.toFixed(2)})`
          : '-',
    },
    {
      title: t('invoice.labels.taxRate'),
      key: 'vat',
      align: 'right',
      render: (_, record) => `%${record.vatRate} (${record.vatAmount.toFixed(2)})`,
    },
    {
      title: t('invoice.labels.amount'),
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
          <h1 className="text-2xl font-bold">{t('invoice.detail')}</h1>
          <p className="text-gray-500">{invoice.invoiceNumber}</p>
        </div>
        <Space>
          <Button icon={<FilePdfOutlined />}>{t('invoice.buttons.downloadPdf')}</Button>
          <Button icon={<PrinterOutlined />}>{t('invoice.buttons.print')}</Button>
          {invoice.status === InvoiceStatus.Draft && (
            <>
              <Button
                icon={<EditOutlined />}
                onClick={() => navigate(`/invoices/edit/${invoice.id}`)}
              >
                {t('common.edit')}
              </Button>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handleApprove}
              >
                {t('invoice.buttons.approve')}
              </Button>
            </>
          )}
          {invoice.status !== InvoiceStatus.Cancelled && (
            <Button
              danger
              icon={<CloseCircleOutlined />}
              onClick={handleCancel}
            >
              {t('invoice.buttons.cancel')}
            </Button>
          )}
        </Space>
      </div>

      {/* Fatura Bilgileri */}
      <Card title={t('invoice.labels.information')} className="mb-4">
        <Descriptions column={3}>
          <Descriptions.Item label={t('invoice.labels.invoiceNumber')}>
            <span className="font-mono font-medium">
              {invoice.invoiceNumber}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label={t('invoice.labels.type')}>
            {INVOICE_TYPE_LABELS[invoice.type]}
          </Descriptions.Item>
          <Descriptions.Item label={t('invoice.labels.date')}>
            {dayjs(invoice.invoiceDate).format('DD.MM.YYYY')}
          </Descriptions.Item>
          <Descriptions.Item label={t('invoice.labels.customer')}>
            <div>
              <div className="font-medium">{invoice.customer?.name}</div>
              <div className="text-xs text-gray-500">
                {invoice.customer?.code}
              </div>
            </div>
          </Descriptions.Item>
          <Descriptions.Item label={t('invoice.labels.dueDate')}>
            {invoice.dueDate
              ? dayjs(invoice.dueDate).format('DD.MM.YYYY')
              : '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('invoice.labels.currency')}>
            {invoice.currency}
          </Descriptions.Item>
          <Descriptions.Item label={t('invoice.labels.invoiceType')}>
            <Tag color={invoice.isOfficial ? 'blue' : 'orange'}>
              {invoice.isOfficial ? t('invoice.labels.official') : t('invoice.labels.unofficial')}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t('invoice.labels.status')}>
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
          <Descriptions.Item label={t('invoice.labels.paymentStatus')}>
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
            <Descriptions.Item label={t('invoice.labels.notes')} span={3}>
              {invoice.notes}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* Fatura Kalemleri */}
      <Card title={t('invoice.labels.items')} className="mb-4">
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
            <span className="text-gray-600">{t('invoice.labels.subtotal')}:</span>
            <span className="font-medium">
              {invoice.subTotal.toFixed(2)} {invoice.currency}
            </span>
          </div>
          {invoice.totalDiscount > 0 && (
            <div className="flex justify-between py-2 text-red-600">
              <span>{t('invoice.labels.totalDiscount')}:</span>
              <span className="font-medium">
                -{invoice.totalDiscount.toFixed(2)} {invoice.currency}
              </span>
            </div>
          )}
          <div className="flex justify-between py-2">
            <span className="text-gray-600">{t('invoice.labels.totalTax')}:</span>
            <span className="font-medium">
              {invoice.totalVat.toFixed(2)} {invoice.currency}
            </span>
          </div>
          <div className="border-t pt-3 flex justify-between">
            <span className="text-xl font-medium">{t('invoice.labels.grandTotal')}:</span>
            <span className="text-2xl font-bold text-primary">
              {invoice.grandTotal.toFixed(2)} {invoice.currency}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};

