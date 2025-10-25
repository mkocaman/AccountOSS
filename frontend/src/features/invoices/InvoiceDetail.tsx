import { useEffect, useState } from 'react';
import { 
  Card, 
  Descriptions, 
  Table, 
  Tag, 
  Button, 
  Space, 
  Spin, 
  message, 
  Modal, 
  Result,
  Badge,
  Divider
} from 'antd';
import {
  FilePdfOutlined,
  PrinterOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { getInvoice, deleteInvoice, updateInvoiceStatus, generateInvoicePDF } from '@/services/invoiceService';
import type { Invoice, InvoiceStatus } from '@/types/invoice';
import type { ColumnsType } from 'antd/es/table';

// Para birimi formatı
const formatCurrency = (amount: number, currencyCode: string = 'TRY'): string => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Tarih formatı
const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/**
 * Fatura detay sayfası - Gerçek API ile entegre edilmiş
 * Fatura bilgilerini görüntüleme, düzenleme, silme ve PDF oluşturma
 */
export const InvoiceDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);

  /**
   * Fatura detayını API'den çek
   */
  const fetchInvoiceDetail = async () => {
    if (!id) {
      message.error(t('invoice.errors.notFound'));
      navigate('/invoices');
      return;
    }

    try {
      setLoading(true);
      console.log('📄 Fatura detayı getiriliyor:', id);
      
      // API çağrısı - doğru fonksiyonu kullan
      const data = await getInvoice(id);
      
      setInvoice(data);
      console.log('✅ Fatura detayı yüklendi:', data);
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      message.error(error.message || t('invoice.errors.loadDetailFailed'));
      console.error('❌ Fatura detayı hatası:', error);
      // 404 ise listeye yönlendir
      if (error.response?.status === 404) {
        navigate('/invoices');
      }
    }
  };

  /**
   * Sayfa yüklendiğinde fatura detayını çek
   */
  useEffect(() => {
    fetchInvoiceDetail();
  }, [id]);

  /**
   * Düzenle butonu
   */
  const handleEdit = () => {
    navigate(`/invoices/edit/${invoice?.id}`);
  };

  /**
   * Sil butonu
   */
  const handleDelete = () => {
    Modal.confirm({
      title: t('invoice.messages.deleteConfirmTitle'),
      content: t('invoice.messages.deleteConfirmContent'),
      okText: t('invoice.confirmModal.okText'),
      okType: 'danger',
      cancelText: t('invoice.confirmModal.cancelText'),
      onOk: async () => {
        try {
          await deleteInvoice(invoice!.id);
          message.success(t('invoice.messages.deleteSuccess'));
          navigate('/invoices');
        } catch (error: any) {
          message.error(error.message || t('invoice.errors.deleteFailed'));
        }
      },
    });
  };

  /**
   * PDF oluştur butonu
   */
  const handleGeneratePDF = async () => {
    try {
      message.loading(t('invoice.messages.pdfGenerating'), 0);
      await generateInvoicePDF(invoice!.id);
      message.destroy();
      message.success(t('invoice.messages.pdfSuccess'));
    } catch (error: any) {
      message.destroy();
      message.error(error.message || t('invoice.errors.pdfFailed'));
    }
  };

  /**
   * Yazdır butonu
   */
  const handlePrint = () => {
    window.print();
  };

  /**
   * Durum değiştir
   */
  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateInvoiceStatus(invoice!.id, newStatus);
      message.success(t('invoice.messages.updateSuccess'));
      // Detayı yeniden yükle
      fetchInvoiceDetail();
    } catch (error: any) {
      message.error(error.message || t('invoice.errors.updateFailed'));
    }
  };

  /**
   * Durum badge'i için renk
   */
  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; text: string }> = {
      'draft': { color: 'default', text: t('invoice.status.draft') },
      'sent': { color: 'processing', text: t('invoice.status.pending') },
      'paid': { color: 'success', text: t('invoice.status.paid') },
      'overdue': { color: 'error', text: t('invoice.status.overdue') },
      'cancelled': { color: 'default', text: t('invoice.status.cancelled') },
    };
    return configs[status] || { color: 'default', text: status };
  };

  // Loading durumunda spinner göster
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" tip={t('invoice.messages.loadingInvoice')} />
      </div>
    );
  }

  // Fatura yoksa hata göster
  if (!invoice) {
    return (
      <Result
        status="404"
        title={t('invoice.errors.notFound')}
        subTitle={t('invoice.errors.notFoundDescription')}
        extra={
          <Button type="primary" onClick={() => navigate('/invoices')}>
            {t('invoice.buttons.back')}
          </Button>
        }
      />
    );
  }

  // Fatura kalemleri için tablo kolonları
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
          <div className="font-medium">{record.productName || record.description}</div>
          <div className="text-xs text-gray-500">{record.productCode}</div>
        </div>
      ),
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: t('invoice.labels.quantity'),
      key: 'quantity',
      align: 'right' as const,
      render: (_, record) => `${record.quantity} ${record.unit || 'adet'}`,
    },
    {
      title: t('invoice.labels.unitPrice'),
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      align: 'right' as const,
      render: (price) => formatCurrency(price, invoice.currency),
    },
    {
      title: t('invoice.labels.discount'),
      key: 'discount',
      align: 'right' as const,
      render: (_, record) =>
        record.discountPercentage > 0
          ? `%${record.discountPercentage} (-${formatCurrency(record.discountAmount, invoice.currency)})`
          : '-',
    },
    {
      title: t('invoice.labels.taxRate'),
      key: 'tax',
      align: 'right' as const,
      render: (_, record) => `%${record.taxRate} (${formatCurrency(record.taxAmount, invoice.currency)})`,
    },
    {
      title: t('invoice.labels.amount'),
      dataIndex: 'amount',
      key: 'amount',
      align: 'right' as const,
      render: (total) => (
        <span className="font-medium">
          {formatCurrency(total, invoice.currency)}
        </span>
      ),
    },
  ];

  return (
    <div>
      {/* Print için CSS */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          .ant-page-header,
          .ant-card-head {
            background: white !important;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>

      {/* Başlık ve Aksiyonlar */}
      <div className="flex items-center justify-between mb-6 no-print">
        <div>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/invoices')}
            className="mr-4"
          >
            {t('invoice.buttons.back')}
          </Button>
          <h1 className="text-2xl font-bold inline">{t('invoice.detail')}</h1>
          <p className="text-gray-500">{invoice.invoiceNumber}</p>
        </div>
        <Space>
          <Button 
            icon={<FilePdfOutlined />} 
            onClick={handleGeneratePDF}
          >
            {t('invoice.buttons.downloadPdf')}
          </Button>
          <Button 
            icon={<PrinterOutlined />} 
            onClick={handlePrint}
          >
            {t('invoice.buttons.print')}
          </Button>
          <Button
            icon={<EditOutlined />}
            onClick={handleEdit}
          >
            {t('invoice.buttons.edit')}
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={handleDelete}
          >
            {t('invoice.buttons.delete')}
          </Button>
        </Space>
      </div>

      {/* Fatura Bilgileri */}
      <Card 
        title={
          <Space>
            <FileTextOutlined />
            {t('invoice.titleSingle')} Bilgileri
          </Space>
        } 
        className="mb-4"
      >
        <Descriptions column={3} bordered>
          <Descriptions.Item label={t('invoice.labels.invoiceNumber')}>
            <span className="font-mono font-medium text-lg">
              {invoice.invoiceNumber}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label={t('invoice.labels.invoiceType')}>
            <Tag color={invoice.invoiceType === 'sales' ? 'green' : 'blue'}>
              {invoice.invoiceType === 'sales' ? t('invoice.type.sales') : t('invoice.type.purchase')}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t('invoice.labels.invoiceDate')}>
            <Space>
              <CalendarOutlined />
              {formatDate(invoice.invoiceDate)}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label={t('invoice.labels.customer')}>
            <div>
              <div className="font-medium flex items-center">
                <UserOutlined className="mr-2" />
                {invoice.partnerName}
              </div>
              <div className="text-xs text-gray-500">
                {invoice.partnerCode}
              </div>
            </div>
          </Descriptions.Item>
          <Descriptions.Item label={t('invoice.labels.dueDate')}>
            {invoice.dueDate ? formatDate(invoice.dueDate) : '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('invoice.labels.currency')}>
            <Tag>{invoice.currency}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t('invoice.labels.status')}>
            <Badge 
              status={getStatusConfig(invoice.status).color as any} 
              text={getStatusConfig(invoice.status).text}
            />
          </Descriptions.Item>
          <Descriptions.Item label="Kur">
            {invoice.exchangeRate}
          </Descriptions.Item>
          <Descriptions.Item label={t('invoice.labels.createdAt')}>
            {formatDate(invoice.createdAt)}
          </Descriptions.Item>
          {invoice.description && (
            <Descriptions.Item label="Açıklama" span={3}>
              {invoice.description}
            </Descriptions.Item>
          )}
          {invoice.notes && (
            <Descriptions.Item label={t('invoice.labels.notes')} span={3}>
              {invoice.notes}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* Fatura Kalemleri */}
      <Card 
        title={
          <Space>
            <FileTextOutlined />
            {t('invoice.labels.items')}
          </Space>
        } 
        className="mb-4"
      >
        <Table
          columns={itemColumns}
          dataSource={invoice.items || []}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>

      {/* Fatura Özeti */}
      <Card 
        title={
          <Space>
            <DollarOutlined />
            {t('invoice.titleSingle')} Özeti
          </Space>
        }
        className="mb-4"
      >
        <div className="max-w-md ml-auto">
          <Descriptions bordered column={1}>
            <Descriptions.Item label={t('invoice.labels.subtotal')}>
              <strong>{formatCurrency(invoice.subtotal, invoice.currency)}</strong>
            </Descriptions.Item>
            {invoice.discountAmount > 0 && (
              <Descriptions.Item label={t('invoice.labels.discount')}>
                <strong style={{ color: '#ff4d4f' }}>
                  -{formatCurrency(invoice.discountAmount, invoice.currency)}
                </strong>
              </Descriptions.Item>
            )}
            <Descriptions.Item label={t('invoice.labels.taxRate')}>
              <strong>{formatCurrency(invoice.taxAmount, invoice.currency)}</strong>
            </Descriptions.Item>
            <Divider />
            <Descriptions.Item label={t('invoice.labels.grandTotal')}>
              <strong style={{ fontSize: '18px', color: '#1890ff' }}>
                {formatCurrency(invoice.totalAmount, invoice.currency)}
              </strong>
            </Descriptions.Item>
          </Descriptions>
        </div>
      </Card>
    </div>
  );
};

