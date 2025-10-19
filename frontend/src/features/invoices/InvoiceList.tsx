import { useState, useEffect } from 'react';
import {
  Button,
  Tag,
  Space,
  Modal,
  message,
  Card,
  Select,
  DatePicker,
  Row,
  Col,
  App,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { invoicesApi, type InvoiceListParams } from '@/api/invoices';
import type { Invoice } from '@/types/invoice';
import {
  InvoiceStatus,
  PaymentStatus,
  InvoiceType,
  INVOICE_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  INVOICE_TYPE_LABELS,
} from '@/types/invoice';
import { DataTable } from '@/components/ui/DataTable';
import { SearchBar } from '@/components/ui/SearchBar';
import type { ColumnsType } from 'antd/es/table';

const { RangePicker } = DatePicker;

// Fatura listesi sayfası
export const InvoiceList = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [params, setParams] = useState<InvoiceListParams>({
    pageNumber: 1,
    pageSize: 50,
  });
  const { modal } = App.useApp();

  useEffect(() => {
    loadInvoices();
  }, [params]);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const response = await invoicesApi.getAll(params);
      if (response.success) {
        setInvoices(response.data.items);
        setTotalCount(response.data.totalCount);
      }
    } catch (error) {
      message.error('Faturalar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setParams({ ...params, searchText: value, pageNumber: 1 });
  };

  const handleDelete = (invoice: Invoice) => {
    modal.confirm({
      title: 'Faturayı Sil',
      icon: <ExclamationCircleOutlined />,
      content: `${invoice.invoiceNumber} faturasını silmek istediğinize emin misiniz?`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await invoicesApi.delete(invoice.id);
          message.success('Fatura silindi');
          loadInvoices();
        } catch (error) {
          message.error('Fatura silinemedi');
        }
      },
    });
  };

  const handleApprove = async (invoice: Invoice) => {
    try {
      await invoicesApi.approve(invoice.id);
      message.success('Fatura onaylandı');
      loadInvoices();
    } catch (error) {
      message.error('Fatura onaylanamadı');
    }
  };

  const handleCancel = (invoice: Invoice) => {
    modal.confirm({
      title: 'Faturayı İptal Et',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>{invoice.invoiceNumber} faturasını iptal etmek istediğinize emin misiniz?</p>
          <p className="text-red-500 text-sm mt-2">
            İptal edilen fatura geri alınamaz!
          </p>
        </div>
      ),
      okText: 'İptal Et',
      okType: 'danger',
      cancelText: 'Vazgeç',
      onOk: async () => {
        try {
          await invoicesApi.cancel(invoice.id, 'Kullanıcı tarafından iptal edildi');
          message.success('Fatura iptal edildi');
          loadInvoices();
        } catch (error) {
          message.error('Fatura iptal edilemedi');
        }
      },
    });
  };

  // Status badge renkleri
  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.Draft:
        return 'default';
      case InvoiceStatus.Approved:
        return 'success';
      case InvoiceStatus.Sent:
        return 'processing';
      case InvoiceStatus.Cancelled:
        return 'error';
      default:
        return 'default';
    }
  };

  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.Unpaid:
        return 'error';
      case PaymentStatus.Partial:
        return 'warning';
      case PaymentStatus.Paid:
        return 'success';
      default:
        return 'default';
    }
  };

  const columns: ColumnsType<Invoice> = [
    {
      title: 'Fatura No',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      width: 150,
      fixed: 'left',
      render: (number, record) => (
        <div>
          <div className="font-mono font-medium">{number}</div>
          <div className="text-xs text-gray-500">
            {INVOICE_TYPE_LABELS[record.type]}
          </div>
        </div>
      ),
    },
    {
      title: 'Müşteri',
      key: 'customer',
      width: 200,
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.customer?.name}</div>
          <div className="text-xs text-gray-500">{record.customer?.code}</div>
        </div>
      ),
    },
    {
      title: 'Tarih',
      dataIndex: 'invoiceDate',
      key: 'invoiceDate',
      width: 120,
      render: (date) => dayjs(date).format('DD.MM.YYYY'),
    },
    {
      title: 'Vade',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 120,
      render: (date) => (date ? dayjs(date).format('DD.MM.YYYY') : '-'),
    },
    {
      title: 'Tutar',
      dataIndex: 'grandTotal',
      key: 'grandTotal',
      width: 150,
      align: 'right',
      render: (total, record) => (
        <div className="font-medium">
          {total.toFixed(2)} {record.currency}
        </div>
      ),
    },
    {
      title: 'Tür',
      dataIndex: 'isOfficial',
      key: 'isOfficial',
      width: 100,
      render: (isOfficial) => (
        <Tag color={isOfficial ? 'blue' : 'orange'}>
          {isOfficial ? 'Resmi' : 'Gayriresmi'}
        </Tag>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {INVOICE_STATUS_LABELS[status]}
        </Tag>
      ),
    },
    {
      title: 'Ödeme',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      width: 100,
      render: (status) => (
        <Tag color={getPaymentStatusColor(status)}>
          {PAYMENT_STATUS_LABELS[status]}
        </Tag>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      fixed: 'right',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/invoices/${record.id}`)}
          />
          
          {record.status === InvoiceStatus.Draft && (
            <>
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                onClick={() => navigate(`/invoices/edit/${record.id}`)}
              />
              <Button
                type="link"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleApprove(record)}
                className="text-green-600"
              />
            </>
          )}

          {record.status !== InvoiceStatus.Cancelled && (
            <Button
              type="link"
              size="small"
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => handleCancel(record)}
            />
          )}

          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Başlık */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Faturalar</h1>
          <p className="text-gray-500">Fatura listesi ve yönetimi</p>
        </div>
        <Space>
          <Button onClick={() => navigate('/invoices/gr-queue')}>
            GR Kuyruğu
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/invoices/create')}
            size="large"
          >
            Yeni Fatura
          </Button>
        </Space>
      </div>

      {/* Gelişmiş Filtreler */}
      <Card className="mb-4">
        <SearchBar
          onSearch={handleSearch}
          onRefresh={loadInvoices}
          placeholder="Fatura no, müşteri adı..."
        />

        <Row gutter={16} className="mt-4">
          <Col span={6}>
            <RangePicker
              style={{ width: '100%' }}
              placeholder={['Başlangıç', 'Bitiş']}
              format="DD.MM.YYYY"
              onChange={(dates) => {
                setParams({
                  ...params,
                  startDate: dates?.[0]?.format('YYYY-MM-DD'),
                  endDate: dates?.[1]?.format('YYYY-MM-DD'),
                  pageNumber: 1,
                });
              }}
            />
          </Col>

          <Col span={4}>
            <Select
              placeholder="Fatura Türü"
              style={{ width: '100%' }}
              allowClear
              onChange={(value) =>
                setParams({ ...params, type: value, pageNumber: 1 })
              }
            >
              <Select.Option value={InvoiceType.Sales}>Satış</Select.Option>
              <Select.Option value={InvoiceType.Purchase}>Alış</Select.Option>
              <Select.Option value={InvoiceType.SalesReturn}>
                Satış İadesi
              </Select.Option>
              <Select.Option value={InvoiceType.PurchaseReturn}>
                Alış İadesi
              </Select.Option>
            </Select>
          </Col>

          <Col span={4}>
            <Select
              placeholder="Resmi/Gayriresmi"
              style={{ width: '100%' }}
              allowClear
              onChange={(value) =>
                setParams({ ...params, isOfficial: value, pageNumber: 1 })
              }
            >
              <Select.Option value={true}>Resmi</Select.Option>
              <Select.Option value={false}>Gayriresmi</Select.Option>
            </Select>
          </Col>

          <Col span={5}>
            <Select
              placeholder="Durum"
              style={{ width: '100%' }}
              allowClear
              onChange={(value) =>
                setParams({ ...params, status: value, pageNumber: 1 })
              }
            >
              <Select.Option value={InvoiceStatus.Draft}>Taslak</Select.Option>
              <Select.Option value={InvoiceStatus.Approved}>
                Onaylandı
              </Select.Option>
              <Select.Option value={InvoiceStatus.Sent}>
                Gönderildi
              </Select.Option>
              <Select.Option value={InvoiceStatus.Cancelled}>
                İptal
              </Select.Option>
            </Select>
          </Col>

          <Col span={5}>
            <Select
              placeholder="Ödeme Durumu"
              style={{ width: '100%' }}
              allowClear
              onChange={(value) =>
                setParams({ ...params, paymentStatus: value, pageNumber: 1 })
              }
            >
              <Select.Option value={PaymentStatus.Unpaid}>
                Ödenmedi
              </Select.Option>
              <Select.Option value={PaymentStatus.Partial}>
                Kısmi
              </Select.Option>
              <Select.Option value={PaymentStatus.Paid}>
                Ödendi
              </Select.Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Tablo */}
      <Card>
        <DataTable
          columns={columns}
          data={invoices}
          loading={loading}
          pagination={{
            current: params.pageNumber,
            pageSize: params.pageSize,
            total: totalCount,
            onChange: (page, pageSize) =>
              setParams({ ...params, pageNumber: page, pageSize }),
          }}
        />
      </Card>
    </div>
  );
};

