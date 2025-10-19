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
  message
} from 'antd';
import { 
  ArrowLeftOutlined,
  EditOutlined,
  SendOutlined,
  CheckOutlined,
  CloseOutlined,
  FilePdfOutlined,
  SwapOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';

import { quotationsApi } from '@/api/quotations';
import type { QuotationItem } from '@/types/quotation';
import { 
  QuotationStatus, 
  quotationStatusLabels, 
  quotationStatusColors 
} from '@/types/quotation';
import { formatCurrency, formatDate, downloadFile } from '@/lib/utils';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function QuotationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch quotation
  const { data: quotation, isLoading } = useQuery({
    queryKey: ['quotation', id],
    queryFn: () => quotationsApi.getById(id!),
    enabled: !!id
  });

  usePageTitle(quotation ? `${quotation.quotationNumber} - Teklif Detayı` : 'Teklif Detayı');

  // Send mutation
  const sendMutation = useMutation({
    mutationFn: (id: string) => quotationsApi.send(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotation', id] });
      message.success('Teklif müşteriye gönderildi');
    }
  });

  // Accept mutation
  const acceptMutation = useMutation({
    mutationFn: (id: string) => quotationsApi.accept(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotation', id] });
      message.success('Teklif kabul edildi');
    }
  });

  // Convert mutation
  const convertMutation = useMutation({
    mutationFn: (id: string) => quotationsApi.convertToOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotation', id] });
      message.success('Satış siparişi oluşturuldu');
    }
  });

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: (id: string) => quotationsApi.exportPdf(id),
    onSuccess: (blob: any) => {
      downloadFile(blob as Blob, `${quotation?.quotationNumber}.pdf`);
      message.success('PDF indirildi');
    }
  });

  // Item columns
  const itemColumns: ColumnsType<QuotationItem> = [
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
      title: 'Miktar',
      dataIndex: 'quantity',
      width: 120,
      align: 'right',
      render: (qty, record) => `${qty} ${record.product?.unit}`
    },
    {
      title: 'Birim Fiyat',
      dataIndex: 'unitPrice',
      width: 120,
      align: 'right',
      render: (price) => formatCurrency(price, quotation?.currency || 'TRY')
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
          {formatCurrency(total, quotation?.currency || 'TRY')}
        </span>
      )
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      ellipsis: true,
      render: (desc) => desc || '-'
    }
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">Teklif bulunamadı</div>
            <Button type="primary" onClick={() => navigate('/quotations')} className="mt-4">
              Teklif Listesine Dön
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const isExpired = dayjs(quotation.validUntil).isBefore(dayjs()) && 
                    quotation.status !== QuotationStatus.Accepted &&
                    quotation.status !== QuotationStatus.Rejected;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/quotations')}
          className="mb-4"
        >
          Geri
        </Button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {quotation.quotationNumber}
            </h1>
            <Space>
              <Tag color={quotationStatusColors[quotation.status]} className="text-base px-3 py-1">
                {quotationStatusLabels[quotation.status]}
              </Tag>
              {isExpired && (
                <Tag color="orange" className="text-base px-3 py-1">
                  Süresi Doldu
                </Tag>
              )}
              {quotation.isConvertedToOrder && (
                <Tag color="purple" className="text-base px-3 py-1">
                  Siparişe Dönüştü
                </Tag>
              )}
            </Space>
          </div>

          <Space>
            {quotation.status === QuotationStatus.Draft && (
              <>
                <Button
                  icon={<EditOutlined />}
                  onClick={() => navigate(`/quotations/edit/${quotation.id}`)}
                >
                  Düzenle
                </Button>
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={() => sendMutation.mutate(quotation.id)}
                  loading={sendMutation.isPending}
                >
                  Müşteriye Gönder
                </Button>
              </>
            )}
            {quotation.status === QuotationStatus.Sent && (
              <>
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={() => acceptMutation.mutate(quotation.id)}
                  loading={acceptMutation.isPending}
                >
                  Kabul Et
                </Button>
                <Button
                  danger
                  icon={<CloseOutlined />}
                >
                  Reddet
                </Button>
              </>
            )}
            {quotation.status === QuotationStatus.Accepted && !quotation.isConvertedToOrder && (
              <Button
                type="primary"
                icon={<SwapOutlined />}
                onClick={() => convertMutation.mutate(quotation.id)}
                loading={convertMutation.isPending}
              >
                Satış Siparişine Dönüştür
              </Button>
            )}
            {quotation.salesOrderId && (
              <Button
                icon={<FileTextOutlined />}
                onClick={() => navigate(`/sales-orders/${quotation.salesOrderId}`)}
              >
                Satış Siparişini Görüntüle
              </Button>
            )}
            <Button
              icon={<FilePdfOutlined />}
              onClick={() => exportMutation.mutate(quotation.id)}
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
              value={quotation.totalAmount}
              precision={2}
              suffix={quotation.currency}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Ürün Sayısı"
              value={quotation.items.length}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Geçerlilik"
              value={dayjs(quotation.validUntil).diff(dayjs(), 'days')}
              suffix="gün"
              valueStyle={{ color: isExpired ? '#ff4d4f' : '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Toplam Miktar"
              value={quotation.items.reduce((sum, item) => sum + item.quantity, 0)}
              precision={2}
            />
          </Card>
        </Col>
      </Row>

      {/* Quotation Info */}
      <Card title="Teklif Bilgileri" className="mb-4">
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 2 }}>
          <Descriptions.Item label="Teklif No">{quotation.quotationNumber}</Descriptions.Item>
          <Descriptions.Item label="Durum">
            <Tag color={quotationStatusColors[quotation.status]}>
              {quotationStatusLabels[quotation.status]}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Teklif Tarihi">{formatDate(quotation.quotationDate)}</Descriptions.Item>
          <Descriptions.Item label="Geçerlilik Tarihi">
            <span className={isExpired ? 'text-red-600 font-semibold' : ''}>
              {formatDate(quotation.validUntil)}
              {isExpired && ' (Süresi Doldu)'}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="Müşteri">
            {quotation.customer?.name}
            <div className="text-xs text-gray-500">{quotation.customer?.code}</div>
          </Descriptions.Item>
          <Descriptions.Item label="İletişim">
            {quotation.customer?.email && (
              <div className="text-sm">{quotation.customer.email}</div>
            )}
            {quotation.customer?.phone && (
              <div className="text-sm">{quotation.customer.phone}</div>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Para Birimi">{quotation.currency}</Descriptions.Item>
          <Descriptions.Item label="Oluşturan">
            {quotation.createdByUser?.name || '-'}
          </Descriptions.Item>
          {quotation.notes && (
            <Descriptions.Item label="Notlar" span={2}>
              {quotation.notes}
            </Descriptions.Item>
          )}
          {quotation.termsAndConditions && (
            <Descriptions.Item label="Şartlar ve Koşullar" span={2}>
              {quotation.termsAndConditions}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* Items Table */}
      <Card title="Teklif Kalemleri">
        <Table
          columns={itemColumns}
          dataSource={quotation.items}
          rowKey="id"
          pagination={false}
          scroll={{ x: 1000 }}
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={3}>
                  <strong>TOPLAM</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3} align="right">
                  <strong>Ara Toplam:</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4} align="right" colSpan={2}>
                  <strong>{formatCurrency(quotation.subtotal, quotation.currency)}</strong>
                </Table.Summary.Cell>
              </Table.Summary.Row>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={3} />
                <Table.Summary.Cell index={3} align="right">
                  <strong>İskonto:</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4} align="right" colSpan={2}>
                  <strong className="text-red-600">
                    -{formatCurrency(quotation.discountAmount, quotation.currency)}
                  </strong>
                </Table.Summary.Cell>
              </Table.Summary.Row>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={3} />
                <Table.Summary.Cell index={3} align="right">
                  <strong>KDV:</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4} align="right" colSpan={2}>
                  <strong className="text-blue-600">
                    {formatCurrency(quotation.taxAmount, quotation.currency)}
                  </strong>
                </Table.Summary.Cell>
              </Table.Summary.Row>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={3} />
                <Table.Summary.Cell index={3} align="right">
                  <strong className="text-lg">GENEL TOPLAM:</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4} align="right" colSpan={2}>
                  <strong className="text-lg text-green-600">
                    {formatCurrency(quotation.totalAmount, quotation.currency)}
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

