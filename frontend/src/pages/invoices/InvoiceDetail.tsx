import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Tag,
  Table,
  Descriptions,
  Divider,
  message
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  SendOutlined,
  ArrowLeftOutlined,
  FileTextOutlined,
  PrinterOutlined
} from '@ant-design/icons';
import { useInvoice, useDeleteInvoice, useUpdateInvoiceStatus } from '@/hooks/useInvoice';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

/**
 * Fatura detay sayfası
 * Fatura görüntüleme, düzenleme, silme, PDF export
 */
const InvoiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: invoice, isLoading } = useInvoice(id || '');
  const deleteMutation = useDeleteInvoice();
  const statusMutation = useUpdateInvoiceStatus();

  if (isLoading) {
    return <div>Yükleniyor...</div>;
  }

  if (!invoice) {
    return <div>Fatura bulunamadı</div>;
  }

  /**
   * Fatura durumu renklendirme
   */
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'default',
      sent: 'processing',
      paid: 'success',
      cancelled: 'error',
      overdue: 'warning'
    };
    return colors[status] || 'default';
  };

  /**
   * Fatura durumu Türkçe
   */
  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      draft: 'Taslak',
      sent: 'Gönderildi',
      paid: 'Ödendi',
      cancelled: 'İptal',
      overdue: 'Vadesi Geçti'
    };
    return texts[status] || status;
  };

  /**
   * Fatura sil
   */
  const handleDelete = () => {
    if (window.confirm('Faturayı silmek istediğinizden emin misiniz?')) {
      deleteMutation.mutate(id!, {
        onSuccess: () => {
          navigate('/invoices');
        }
      });
    }
  };

  /**
   * Durum değiştir
   */
  const handleStatusChange = (newStatus: string) => {
    statusMutation.mutate(
      { id: id!, status: newStatus },
      {
        onSuccess: () => {
          message.success('Durum güncellendi');
        }
      }
    );
  };

  /**
   * PDF indir
   */
  const handleDownloadPDF = () => {
    // TODO: PDF download implementation
    message.info('PDF indirme özelliği yakında eklenecek');
  };

  /**
   * Kalemler tablosu kolonları
   */
  const itemColumns = [
    {
      title: 'Ürün',
      dataIndex: 'productName',
      key: 'productName',
      render: (text: string, record: any) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <div style={{ fontSize: 12, color: '#666' }}>{record.productCode}</div>
        </div>
      )
    },
    {
      title: 'Miktar',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'right' as const,
      render: (value: number) => value.toLocaleString('tr-TR')
    },
    {
      title: 'Birim Fiyat',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      align: 'right' as const,
      render: (value: number) => (
        <span>
          {new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: invoice.currency || 'TRY'
          }).format(value)}
        </span>
      )
    },
    {
      title: 'İndirim',
      dataIndex: 'discountAmount',
      key: 'discountAmount',
      align: 'right' as const,
      render: (value: number) => (
        <span style={{ color: '#cf1322' }}>
          -{new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: invoice.currency || 'TRY'
          }).format(value)}
        </span>
      )
    },
    {
      title: 'KDV',
      dataIndex: 'taxAmount',
      key: 'taxAmount',
      align: 'right' as const,
      render: (value: number) => (
        <span>
          {new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: invoice.currency || 'TRY'
          }).format(value)}
        </span>
      )
    },
    {
      title: 'Toplam',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      align: 'right' as const,
      render: (value: number) => (
        <span style={{ fontWeight: 500 }}>
          {new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: invoice.currency || 'TRY'
          }).format(value)}
        </span>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Başlık ve İşlem Butonları */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/invoices')}
              style={{ marginRight: 16 }}
            >
              Geri
            </Button>
            <Title level={2} style={{ margin: 0, display: 'inline' }}>
              {invoice.invoiceNumber}
            </Title>
            <Tag
              color={getStatusColor(invoice.status)}
              style={{ marginLeft: 16 }}
            >
              {getStatusText(invoice.status)}
            </Tag>
          </div>
          <Space>
            {invoice.status === 'draft' && (
              <>
                <Button
                  icon={<EditOutlined />}
                  onClick={() => navigate(`/invoices/${id}/edit`)}
                >
                  Düzenle
                </Button>
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={() => handleStatusChange('sent')}
                >
                  Gönder
                </Button>
              </>
            )}
            <Button
              icon={<DownloadOutlined />}
              onClick={handleDownloadPDF}
            >
              PDF İndir
            </Button>
            <Button
              icon={<PrinterOutlined />}
              onClick={() => window.print()}
            >
              Yazdır
            </Button>
            {invoice.status !== 'paid' && (
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={handleDelete}
                loading={deleteMutation.isPending}
              >
                Sil
              </Button>
            )}
          </Space>
        </div>

        {/* Fatura Bilgileri */}
        <Row gutter={24}>
          <Col xs={24} lg={16}>
            <Card title="Fatura Bilgileri">
              <Descriptions column={2} bordered>
                <Descriptions.Item label="Fatura No">
                  {invoice.invoiceNumber}
                </Descriptions.Item>
                <Descriptions.Item label="Fatura Tipi">
                  {invoice.invoiceType === 'sales' ? 'Satış Faturası' : 'Alış Faturası'}
                </Descriptions.Item>
                <Descriptions.Item label="Fatura Tarihi">
                  {dayjs(invoice.invoiceDate).format('DD.MM.YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label="Vade Tarihi">
                  {invoice.dueDate ? dayjs(invoice.dueDate).format('DD.MM.YYYY') : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Para Birimi">
                  {invoice.currency}
                </Descriptions.Item>
                <Descriptions.Item label="Kur">
                  {invoice.exchangeRate}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card title="Cari Bilgileri">
              <Descriptions column={1} bordered>
                <Descriptions.Item label="Cari Adı">
                  {invoice.partnerName}
                </Descriptions.Item>
                <Descriptions.Item label="Cari Kodu">
                  {invoice.partnerCode || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Vergi No">
                  {invoice.partnerTaxNumber || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Adres">
                  {invoice.partnerAddress || '-'}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>

        {/* Fatura Kalemleri */}
        <Card title="Fatura Kalemleri">
          <Table
            dataSource={invoice.items}
            columns={itemColumns}
            pagination={false}
            size="small"
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={3}>
                    <Text strong>Genel Toplam</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3} align="right">
                    <Text strong style={{ color: '#cf1322' }}>
                      -{new Intl.NumberFormat('tr-TR', {
                        style: 'currency',
                        currency: invoice.currency || 'TRY'
                      }).format(invoice.discountAmount)}
                    </Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={4} align="right">
                    <Text strong>
                      {new Intl.NumberFormat('tr-TR', {
                        style: 'currency',
                        currency: invoice.currency || 'TRY'
                      }).format(invoice.taxAmount)}
                    </Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={5} align="right">
                    <Text strong style={{ fontSize: 16, color: '#1890ff' }}>
                      {new Intl.NumberFormat('tr-TR', {
                        style: 'currency',
                        currency: invoice.currency || 'TRY'
                      }).format(invoice.totalAmount)}
                    </Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </Card>

        {/* Notlar */}
        {(invoice.description || invoice.notes) && (
          <Card title="Notlar">
            {invoice.description && (
              <div style={{ marginBottom: 16 }}>
                <Text strong>Açıklama:</Text>
                <div style={{ marginTop: 8 }}>{invoice.description}</div>
              </div>
            )}
            {invoice.notes && (
              <div>
                <Text strong>Notlar:</Text>
                <div style={{ marginTop: 8 }}>{invoice.notes}</div>
              </div>
            )}
          </Card>
        )}

        {/* Sistem Bilgileri */}
        <Card title="Sistem Bilgileri">
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="Oluşturulma Tarihi">
              {dayjs(invoice.createdAt).format('DD.MM.YYYY HH:mm')}
            </Descriptions.Item>
            <Descriptions.Item label="Oluşturan">
              {invoice.createdBy}
            </Descriptions.Item>
            {invoice.updatedAt && (
              <>
                <Descriptions.Item label="Güncellenme Tarihi">
                  {dayjs(invoice.updatedAt).format('DD.MM.YYYY HH:mm')}
                </Descriptions.Item>
                <Descriptions.Item label="Güncelleyen">
                  {invoice.updatedBy}
                </Descriptions.Item>
              </>
            )}
          </Descriptions>
        </Card>
      </Space>
    </div>
  );
};

export default InvoiceDetail;
