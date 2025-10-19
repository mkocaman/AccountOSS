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
  ArrowLeftOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';

import { partnersApi } from '@/api/partners';
import type { BalanceHistoryItem, PartnerAddress } from '@/types/partner';
import { formatCurrency, formatDate, getInitials } from '@/lib/utils';
import { partnerTypeLabels } from '@/types/partner';
import { usePageTitle } from '@/hooks/usePageTitle';
import PartnerAddressModal from './components/PartnerAddressModal';

export default function PartnerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [addressModalOpen, setAddressModalOpen] = useState(false);

  // Fetch partner detail
  const { data: partner, isLoading } = useQuery({
    queryKey: ['partnerDetail', id],
    queryFn: () => partnersApi.getDetail(id!),
    enabled: !!id
  });

  usePageTitle(partner ? `${partner.name} - Cari Hesap Detayı` : 'Cari Hesap Detayı');

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
            {formatCurrency(amount, partner?.currency || 'TRY')}
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
            {formatCurrency(amount, partner?.currency || 'TRY')}
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
          {formatCurrency(balance, partner?.currency || 'TRY')}
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
    if (!partner?.addresses || partner.addresses.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          Henüz adres eklenmemiş
        </div>
      );
    }

    return (
      <Row gutter={16}>
        {partner.addresses.map(address => (
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

  if (!partner) {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">Cari hesap bulunamadı</div>
            <Button type="primary" onClick={() => navigate('/partners')} className="mt-4">
              Cari Hesap Listesine Dön
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
          onClick={() => navigate('/partners')}
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
              {getInitials(partner.name)}
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {partner.name}
              </h1>
              <div className="text-gray-600 space-y-1">
                <div className="flex items-center gap-2">
                  <Tag color="blue">{partner.code}</Tag>
                  <Tag color={
                    partner.type === 0 ? 'blue' : 
                    partner.type === 1 ? 'purple' : 'cyan'
                  }>
                    {partnerTypeLabels[partner.type]}
                  </Tag>
                  <Tag color={partner.isActive ? 'green' : 'red'}>
                    {partner.isActive ? 'Aktif' : 'Pasif'}
                  </Tag>
                  {partner.isBlocked && (
                    <Tag color="orange">Bloke</Tag>
                  )}
                </div>
                {partner.contactPerson && (
                  <div>👤 {partner.contactPerson}</div>
                )}
                {partner.email && (
                  <div><MailOutlined /> {partner.email}</div>
                )}
                {partner.phone && (
                  <div><PhoneOutlined /> {partner.phone}</div>
                )}
                {partner.website && (
                  <div><GlobalOutlined /> <a href={partner.website} target="_blank" rel="noreferrer">{partner.website}</a></div>
                )}
              </div>
            </div>
          </div>

          <Button 
            type="primary" 
            icon={<EditOutlined />}
            onClick={() => navigate(`/partners/edit/${partner.id}`)}
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
              value={partner.currentBalance}
              precision={2}
              suffix={partner.currency}
              valueStyle={{ 
                color: partner.currentBalance >= 0 ? '#52c41a' : '#ff4d4f' 
              }}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Toplam Fatura"
              value={partner.statistics?.totalInvoices || 0}
              prefix={<FileTextOutlined />}
            />
            <div className="text-xs text-gray-500 mt-2">
              {formatCurrency(partner.statistics?.totalInvoiceAmount || 0, partner.currency)}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Toplam Ödeme"
              value={partner.statistics?.totalPayments || 0}
              prefix={<DollarOutlined />}
            />
            <div className="text-xs text-gray-500 mt-2">
              {formatCurrency(partner.statistics?.totalPaymentAmount || 0, partner.currency)}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Ort. Ödeme Süresi"
              value={partner.statistics?.averagePaymentDays || 0}
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
                  <Descriptions.Item label="Cari Hesap Kodu">{partner.code}</Descriptions.Item>
                  <Descriptions.Item label="Tip">
                    {partnerTypeLabels[partner.type]}
                  </Descriptions.Item>
                  <Descriptions.Item label="İlgili Kişi">{partner.contactPerson || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Email">{partner.email || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Telefon">{partner.phone || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Mobil">{partner.mobilePhone || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Website">
                    {partner.website ? (
                      <a href={partner.website} target="_blank" rel="noreferrer">
                        {partner.website}
                      </a>
                    ) : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Vergi No">{partner.taxNumber || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Vergi Dairesi">{partner.taxOffice || '-'}</Descriptions.Item>
                  <Descriptions.Item label="TC Kimlik">{partner.identityNumber || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Fatura Adresi" span={2}>
                    {partner.billingAddress || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Sevkiyat Adresi" span={2}>
                    {partner.shippingAddress || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Şehir">{partner.city || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Ülke">{partner.country || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Posta Kodu">{partner.postalCode || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Para Birimi">{partner.currency}</Descriptions.Item>
                  <Descriptions.Item label="Vade (Gün)">{partner.paymentTermDays}</Descriptions.Item>
                  <Descriptions.Item label="Kredi Limiti">
                    {formatCurrency(partner.creditLimit, partner.currency)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Güncel Bakiye">
                    <span className={partner.currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(partner.currentBalance, partner.currency)}
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Durum">
                    <Tag color={partner.isActive ? 'green' : 'red'}>
                      {partner.isActive ? 'Aktif' : 'Pasif'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Bloke">
                    <Tag color={partner.isBlocked ? 'red' : 'green'}>
                      {partner.isBlocked ? 'Evet' : 'Hayır'}
                    </Tag>
                  </Descriptions.Item>
                  {partner.isBlocked && partner.blockReason && (
                    <Descriptions.Item label="Bloke Nedeni" span={2}>
                      {partner.blockReason}
                    </Descriptions.Item>
                  )}
                  {partner.notes && (
                    <Descriptions.Item label="Notlar" span={2}>
                      {partner.notes}
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
                  dataSource={partner.balanceHistory || []}
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
                  <span className="ml-2">Faturalar ({partner.recentInvoices?.length || 0})</span>
                </span>
              ),
              children: (
                <Table
                  columns={invoiceColumns}
                  dataSource={partner.recentInvoices || []}
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
                  <span className="ml-2">Ödemeler ({partner.recentPayments?.length || 0})</span>
                </span>
              ),
              children: (
                <Table
                  columns={paymentColumns}
                  dataSource={partner.recentPayments || []}
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
                  <span className="ml-2">Adresler ({partner.addresses?.length || 0})</span>
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
      {partner && (
        <PartnerAddressModal
          open={addressModalOpen}
          partnerId={partner.id}
          onCancel={() => setAddressModalOpen(false)}
          onSuccess={() => {
            setAddressModalOpen(false);
            // Refresh partner data
          }}
        />
      )}
    </div>
  );
}
