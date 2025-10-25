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
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { paymentsApi } from '@/api/payments';
import type { Payment } from '@/types/payment';
import {
  PaymentType,
  PaymentMethod,
  PaymentStatus,
  PAYMENT_TYPE_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
} from '@/types/payment';
import { DataTable } from '@/components/ui/DataTable';
import { SearchBar } from '@/components/ui/SearchBar';
import type { ColumnsType } from 'antd/es/table';

const { RangePicker } = DatePicker;

// Ödeme listesi sayfası
export const PaymentList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [params, setParams] = useState<any>({
    pageNumber: 1,
    pageSize: 50,
  });

  useEffect(() => {
    loadPayments();
  }, [params]);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const response = await paymentsApi.getAll(params);
      if (response) {
        setPayments(response as any);
        setTotalCount(response.length);
      }
    } catch (error) {
      message.error('Ödemeler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setParams({ ...params, searchText: value, pageNumber: 1 });
  };

  const handleDelete = (payment: Payment) => {
    Modal.confirm({
      title: 'Ödemeyi Sil',
      icon: <ExclamationCircleOutlined />,
      content: `${payment.paymentNumber} ödeme kaydını silmek istediğinize emin misiniz?`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await paymentsApi.delete(payment.id);
          message.success('Ödeme silindi');
          loadPayments();
        } catch (error) {
          message.error('Ödeme silinemedi');
        }
      },
    });
  };

  const columns: ColumnsType<Payment> = [
    {
      title: 'Ödeme No',
      dataIndex: 'paymentNumber',
      key: 'paymentNumber',
      width: 150,
      fixed: 'left',
      render: (number) => <span className="font-mono font-medium">{number}</span>,
    },
    {
      title: 'Tarih',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
      width: 120,
      render: (date) => dayjs(date).format('DD.MM.YYYY'),
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
      title: 'Fatura',
      key: 'invoice',
      width: 150,
      render: (_, record) =>
        record.invoice ? (
          <span className="font-mono text-sm">{record.invoice.invoiceNumber}</span>
        ) : (
          <span className="text-gray-400">Genel Ödeme</span>
        ),
    },
    {
      title: 'Tür',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (_, record) => (
        <Tag color={record.type === PaymentType.Receipt ? 'green' : 'orange'}>
          {PAYMENT_TYPE_LABELS[record.type as PaymentType]}
        </Tag>
      ),
    },
    {
      title: 'Yöntem',
      dataIndex: 'method',
      key: 'method',
      width: 130,
      render: (_, record) => PAYMENT_METHOD_LABELS[record.method as PaymentMethod],
    },
    {
      title: 'Hesap',
      key: 'account',
      width: 180,
      render: (_, record) => (
        <div className="text-sm">
          {record.cashAccount && (
            <div>💵 {record.cashAccount.name}</div>
          )}
          {record.bankAccount && (
            <div>
              🏦 {record.bankAccount.bankName}
              <div className="text-xs text-gray-500">
                {record.bankAccount.accountNumber}
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Tutar',
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      align: 'right',
      render: (amount, record) => (
        <div className="font-medium">
          {amount.toFixed(2)} {record.currency}
        </div>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (_, record) => (
        <Tag
          color={
            record.status === PaymentStatus.Completed
              ? 'success'
              : record.status === PaymentStatus.Cancelled
              ? 'error'
              : 'default'
          }
        >
          {PAYMENT_STATUS_LABELS[record.status as PaymentStatus]}
        </Tag>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/payments/${record.id}`)}
          />
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/payments/edit/${record.id}`)}
          />
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
          <h1 className="text-2xl font-bold">{t('payment.title')}</h1>
          <p className="text-gray-500">{t('payment.subtitle')}</p>
        </div>
        <Space>
          <Button
            icon={<DollarOutlined />}
            onClick={() => navigate('/cash-accounts')}
          >
            {t('menu.cashAccounts')}
          </Button>
          <Button
            icon={<DollarOutlined />}
            onClick={() => navigate('/bank-accounts')}
          >
            {t('menu.bankAccounts')}
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/payments/create')}
            size="large"
          >
            {t('payment.buttons.new')}
          </Button>
        </Space>
      </div>

      {/* Filtreler */}
      <Card className="mb-4">
        <SearchBar
          onSearch={handleSearch}
          onRefresh={loadPayments}
          placeholder={t('payment.placeholders.search')}
        />

        <Row gutter={16} className="mt-4">
          <Col span={6}>
            <RangePicker
              style={{ width: '100%' }}
              placeholder={[t('payment.labels.startDate'), t('payment.labels.endDate')]}
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
              placeholder={t('payment.labels.type')}
              style={{ width: '100%' }}
              allowClear
              onChange={(value) =>
                setParams({ ...params, type: value, pageNumber: 1 })
              }
            >
              <Select.Option value={PaymentType.Receipt}>{t('payment.types.collection')}</Select.Option>
              <Select.Option value={PaymentType.Payment}>{t('payment.types.payment')}</Select.Option>
            </Select>
          </Col>

          <Col span={5}>
            <Select
              placeholder={t('payment.labels.method')}
              style={{ width: '100%' }}
              allowClear
              onChange={(value) =>
                setParams({ ...params, method: value, pageNumber: 1 })
              }
            >
              <Select.Option value={PaymentMethod.Cash}>Nakit</Select.Option>
              <Select.Option value={PaymentMethod.BankTransfer}>
                Banka Transferi
              </Select.Option>
              <Select.Option value={PaymentMethod.CreditCard}>
                Kredi Kartı
              </Select.Option>
              <Select.Option value={PaymentMethod.Check}>Çek</Select.Option>
              <Select.Option value={PaymentMethod.PromissoryNote}>
                Senet
              </Select.Option>
            </Select>
          </Col>

          <Col span={4}>
            <Select
              placeholder={t('payment.labels.status')}
              style={{ width: '100%' }}
              allowClear
              onChange={(value) =>
                setParams({ ...params, status: value, pageNumber: 1 })
              }
            >
              <Select.Option value={PaymentStatus.Pending}>
                Beklemede
              </Select.Option>
              <Select.Option value={PaymentStatus.Completed}>
                Tamamlandı
              </Select.Option>
              <Select.Option value={PaymentStatus.Cancelled}>
                İptal
              </Select.Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Tablo */}
      <Card>
        <DataTable
          columns={columns}
          data={payments}
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
