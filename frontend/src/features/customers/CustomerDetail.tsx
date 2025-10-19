import React, { useState } from 'react';
import { 
  Card, 
  Descriptions, 
  Statistic, 
  Row, 
  Col, 
  Tag, 
  Tabs,
  Table,
  Button,
  Space,
  message,
  Spin,
  Avatar
} from 'antd';
import { 
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  FileTextOutlined,
  HistoryOutlined,
  HomeOutlined,
  EditOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';

import { customersApi } from '@/api/customers';
import type { BalanceHistoryItem, CustomerAddress } from '@/types/customer';
import { formatCurrency, formatDate, formatDateTime, getInitials } from '@/lib/utils';
import CustomerAddressModal from './components/CustomerAddressModal';

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [addressModalOpen, setAddressModalOpen] = useState(false);

  // Fetch customer detail
  const { data: customer, isLoading } = useQuery({
    queryKey: ['customerDetail', id],
    queryFn: () => customersApi.getDetail(id!),
    enabled: !!id
  });

  // Balance history columns
  const balanceHistoryColumns: ColumnsType<BalanceHistoryItem> = [
    {
      title: 'Tarih',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (date: string) => formatDate(date)
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: 'Referans',
      key: 'reference',
      width: 150,
      render: (_, record) => (
        <div>
          <div className="text-xs text-gray-500">{record.referenceType}</div>
          <div className="font-medium">{record.referenceNumber}</div>
        </div>
      )
    },
    {
      title: 'Borç',
      dataIndex: 'debit',
      key: 'debit',
      width: 130,
      align: 'right',
      render: (amount: number) => 
        amount > 0 ? (
          <span className="text-red-600 font-semibold">
            {formatCurrency(amount, customer?.currency || 'TRY')}
          </span>
        ) : '-'
    },
    {
      title: 'Alacak',
      dataIndex: 'credit',
      key: 'credit',
      width: 130,
      align: 'right',
      render: (amount: number) => 
        amount > 0 ? (
          <span className="text-green-600 font-semibold">
            {formatCurrency(amount, customer?.currency || 'TRY')}
          </span>
        ) : '-'
    },
    {
      title: 'Bakiye',
      dataIndex: 'balance',
      key: 'balance',
      width: 150,
      align: 'right',
      fixed: 'right',
      render: (balance: number) => (
        <span className={`font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {formatCurrency(balance, customer?.currency || 'TRY')}
        </span>
      )
    }
  ];

  // Invoice columns
  const invoiceColumns = [
    {
      title: 'Fatura No',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      width: 140
    },
    {
      title: 'Tarih',
      dataIndex: 'invoiceDate',
      key: 'invoiceDate',
      width: 110,
      render: (date: string) => formatDate(date)
    },
    {
      title: 'Tip',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => (
        <Tag color={type === 'Sales' ? 'blue' : 'purple'}>
          {type === 'Sales' ? 'Satış' : 'Alış'}
        </Tag>
      )
    },
    {
      title: 'Durum',
      dataIndex: 'isOfficial',
      key: 'isOfficial',
      width: 100,
      render: (isOfficial: boolean) => (
        <Tag color={isOfficial ? 'green' : 'orange'}>
          {isOfficial ? 'Resmi' : 'Gayriresmi'}
        </Tag>
      )
    },
    {
      title: 'Tutar',
      dataIndex: 'grandTotal',
      key: 'grandTotal',
      width: 130,
      align: 'right' as const,
      render: (amount: number, record: any) => formatCurrency(amount, record.currency)
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 100,
      render: (_: any, record: any) => (
        <Button size="small" onClick={() => navigate(`/invoices/${record.id}`)}>
          Detay
        </Button>
      )
    }
  ];

  // Payment columns
  const paymentColumns = [
    {
      title: 'Ödeme No',
      dataIndex: 'paymentNumber',
      key: 'paymentNumber',
      width: 140
    },
    {
      title: 'Tarih',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
      width: 110,
      render: (date: string) => formatDate(date)
    },
    {
      title: 'Tip',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => (
        <Tag color={type === 'Receipt' ? 'green' : 'red'}>
          {type === 'Receipt' ? 'Tahsilat' : 'Ödeme'}
        </Tag>
      )
    },
    {
      title: 'Yöntem',
      dataIndex: 'method',
      key: 'method',
      width: 120
    },
    {
      title: 'Tutar',
      dataIndex: 'amount',
      key: 'amount',
      width: 130,
      align: 'right' as const,
      render: (amount: number, record: any) => (
        <span className={record.type === 'Receipt' ? 'text-green-600' : 'text-red-600'}>
          {record.type === 'Receipt' ? '+' : '-'}
          {formatCurrency(amount, record.currency)}
        </span>
      )
    }
  ];

  // Address list
  const renderAddresses = () => {
    if (!customer?.addresses || customer.addresses.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          Henüz adres eklenmemiş
        </div>
      );
    }

    return (
      <Row gutter={16}>
        {customer.addresses.map(address => (
          <Col xs={24} md={12} key={address.id}>
            <Card
              size="small"
              className="mb-4"
              title={
                <div className="flex justify-between items-center">
                  <Space>
                    <EnvironmentOutlined />
                    <span>{address.title}</span>
                    {address.isDefault && (
                      <Tag color="blue">Varsayılan</Tag>
                    )}
                  </Space>
                  <Tag color={address.type === 'Billing' ? 'green' : 'orange'}>
                    {address.type === 'Billing' ? 'Fatura' : 'Sevkiyat'}
                  </Tag>
                </div>
              }
              extra={
                <Button 
                  type="text" 
                  size="small" 
                  icon={<EditOutlined />}
                  onClick={() => {/* Edit address */}}
                />
              }
            >
              <div className="text-gray-700">
                <div>{address.address}</div>
                <div>{address.district && `${address.district}, `}{address.city}</div>
                <div>{address.postalCode} {address.country}</div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">Müşteri bulunamadı</div>
            <Button type="primary" onClick={() => navigate('/customers')} className="mt-4">
              Müşteri Listesine Dön
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
          onClick={() => navigate('/customers')}
          className="mb-4"
        >
          Geri
        </Button>
        
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-4">
            <Avatar 
              size={80} 
              icon={<UserOutlined />}
              className="bg-blue-500"
            >
              {getInitials(customer.name)}
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {customer.name}
              </h1>
              <div className="text-gray-600 space-y-1">
                <div className="flex items-center gap-2">
                  <Tag color="blue">{customer.code}</Tag>
                  <Tag color={customer.type === 1 ? 'purple' : 'cyan'}>
                    {customer.type === 1 ? 'Kurumsal' : 'Bireysel'}
                  </Tag>
                  <Tag color={customer.isActive ? 'green' : 'red'}>
                    {customer.isActive ? 'Aktif' : 'Pasif'}
                  </Tag>
                </div>
                {customer.email && (
                  <div><MailOutlined /> {customer.email}</div>
                )}
                {customer.phone && (
                  <div><PhoneOutlined /> {customer.phone}</div>
                )}
              </div>
            </div>
          </div>

          <Button 
            type="primary" 
            icon={<EditOutlined />}
            onClick={() => navigate(`/customers/edit/${customer.id}`)}
          >
            Düzenle
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Güncel Bakiye"
              value={customer.currentBalance}
              precision={2}
              suffix={customer.currency}
              valueStyle={{ 
                color: customer.currentBalance >= 0 ? '#52c41a' : '#ff4d4f' 
              }}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Toplam Fatura"
              value={customer.statistics?.totalInvoices || 0}
              prefix={<FileTextOutlined />}
            />
            <div className="text-xs text-gray-500 mt-2">
              {formatCurrency(customer.statistics?.totalInvoiceAmount || 0, customer.currency)}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Toplam Ödeme"
              value={customer.statistics?.totalPayments || 0}
              prefix={<DollarOutlined />}
            />
            <div className="text-xs text-gray-500 mt-2">
              {formatCurrency(customer.statistics?.totalPaymentAmount || 0, customer.currency)}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Ort. Ödeme Süresi"
              value={customer.statistics?.averagePaymentDays || 0}
              suffix="gün"
              prefix={<HistoryOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabs */}
      <Card>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={[
            {
              key: 'overview',
              label: (
                <span>
                  <UserOutlined />
                  <span className="ml-2">Genel Bilgiler</span>
                </span>
              ),
              children: (
                <Descriptions bordered column={{ xs: 1, sm: 2, md: 2 }}>
                  <Descriptions.Item label="Müşteri Kodu">{customer.code}</Descriptions.Item>
                  <Descriptions.Item label="Tip">
                    {customer.type === 1 ? 'Kurumsal' : 'Bireysel'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">{customer.email || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Telefon">{customer.phone || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Vergi No">{customer.taxNumber || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Vergi Dairesi">{customer.taxOffice || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Para Birimi">{customer.currency}</Descriptions.Item>
                  <Descriptions.Item label="Vade (Gün)">{customer.paymentTermDays}</Descriptions.Item>
                  <Descriptions.Item label="Kredi Limiti">
                    {formatCurrency(customer.creditLimit, customer.currency)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Güncel Bakiye">
                    <span className={customer.currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(customer.currentBalance, customer.currency)}
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Durum">
                    <Tag color={customer.isActive ? 'green' : 'red'}>
                      {customer.isActive ? 'Aktif' : 'Pasif'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Bloke">
                    <Tag color={customer.isBlocked ? 'red' : 'green'}>
                      {customer.isBlocked ? 'Evet' : 'Hayır'}
                    </Tag>
                  </Descriptions.Item>
                  {customer.notes && (
                    <Descriptions.Item label="Notlar" span={2}>
                      {customer.notes}
                    </Descriptions.Item>
                  )}
                </Descriptions>
              )
            },
            {
              key: 'balance',
              label: (
                <span>
                  <HistoryOutlined />
                  <span className="ml-2">Bakiye Geçmişi</span>
                </span>
              ),
              children: (
                <Table
                  columns={balanceHistoryColumns}
                  dataSource={customer.balanceHistory || []}
                  rowKey={(record) => `${record.referenceId}-${record.date}`}
                  scroll={{ x: 900 }}
                  pagination={{ pageSize: 20 }}
                />
              )
            },
            {
              key: 'invoices',
              label: (
                <span>
                  <FileTextOutlined />
                  <span className="ml-2">Faturalar ({customer.recentInvoices?.length || 0})</span>
                </span>
              ),
              children: (
                <Table
                  columns={invoiceColumns}
                  dataSource={customer.recentInvoices || []}
                  rowKey="id"
                  scroll={{ x: 800 }}
                  pagination={{ pageSize: 10 }}
                />
              )
            },
            {
              key: 'payments',
              label: (
                <span>
                  <DollarOutlined />
                  <span className="ml-2">Ödemeler ({customer.recentPayments?.length || 0})</span>
                </span>
              ),
              children: (
                <Table
                  columns={paymentColumns}
                  dataSource={customer.recentPayments || []}
                  rowKey="id"
                  scroll={{ x: 700 }}
                  pagination={{ pageSize: 10 }}
                />
              )
            },
            {
              key: 'addresses',
              label: (
                <span>
                  <HomeOutlined />
                  <span className="ml-2">Adresler ({customer.addresses?.length || 0})</span>
                </span>
              ),
              children: (
                <div>
                  <div className="mb-4">
                    <Button 
                      type="primary" 
                      icon={<EnvironmentOutlined />}
                      onClick={() => setAddressModalOpen(true)}
                    >
                      Yeni Adres Ekle
                    </Button>
                  </div>
                  {renderAddresses()}
                </div>
              )
            }
          ]}
        />
      </Card>

      {/* Address Modal */}
      {customer && (
        <CustomerAddressModal
          open={addressModalOpen}
          customerId={customer.id}
          onCancel={() => setAddressModalOpen(false)}
          onSuccess={() => {
            setAddressModalOpen(false);
            message.success('Adres eklendi');
          }}
        />
      )}
    </div>
  );
}
