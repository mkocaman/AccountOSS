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
  ShopOutlined,
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined,
  DollarOutlined,
  FileTextOutlined,
  HistoryOutlined,
  ShoppingCartOutlined,
  EditOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';

import { suppliersApi } from '@/api/suppliers';
import { formatCurrency, formatDate, getInitials } from '@/lib/utils';
import { supplierTypeLabels } from '@/types/supplier';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function SupplierDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch supplier detail
  const { data: supplier, isLoading } = useQuery({
    queryKey: ['supplierDetail', id],
    queryFn: () => suppliersApi.getDetail(id!),
    enabled: !!id
  });

  usePageTitle(supplier ? `${supplier.name} - Tedarikçi Detayı` : 'Tedarikçi Detayı');

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">Tedarikçi bulunamadı</div>
            <Button type="primary" onClick={() => navigate('/suppliers')} className="mt-4">
              Tedarikçi Listesine Dön
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
          onClick={() => navigate('/suppliers')}
          className="mb-4"
        >
          Geri
        </Button>
        
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-4">
            <Avatar 
              size={80} 
              icon={<ShopOutlined />}
              className="bg-purple-500"
            >
              {getInitials(supplier.name)}
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {supplier.name}
              </h1>
              <div className="text-gray-600 space-y-1">
                <div className="flex items-center gap-2">
                  <Tag color="purple">{supplier.code}</Tag>
                  <Tag color={supplier.type === 0 ? 'blue' : 'cyan'}>
                    {supplierTypeLabels[supplier.type]}
                  </Tag>
                  <Tag color={supplier.isActive ? 'green' : 'red'}>
                    {supplier.isActive ? 'Aktif' : 'Pasif'}
                  </Tag>
                  {supplier.isBlocked && (
                    <Tag color="orange">Bloke</Tag>
                  )}
                </div>
                {supplier.contactPerson && (
                  <div>👤 {supplier.contactPerson}</div>
                )}
                {supplier.email && (
                  <div><MailOutlined /> {supplier.email}</div>
                )}
                {supplier.phone && (
                  <div><PhoneOutlined /> {supplier.phone}</div>
                )}
                {supplier.website && (
                  <div><GlobalOutlined /> <a href={supplier.website} target="_blank" rel="noreferrer">{supplier.website}</a></div>
                )}
              </div>
            </div>
          </div>

          <Button 
            type="primary" 
            icon={<EditOutlined />}
            onClick={() => navigate(`/suppliers/edit/${supplier.id}`)}
          >
            Düzenle
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Güncel Bakiye"
              value={supplier.currentBalance}
              precision={2}
              suffix={supplier.currency}
              valueStyle={{ 
                color: supplier.currentBalance >= 0 ? '#52c41a' : '#ff4d4f' 
              }}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Toplam Sipariş"
              value={supplier.statistics?.totalPurchaseOrders || 0}
              prefix={<ShoppingCartOutlined />}
            />
            <div className="text-xs text-gray-500 mt-2">
              {formatCurrency(supplier.statistics?.totalPurchaseAmount || 0, supplier.currency)}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Toplam Fatura"
              value={supplier.statistics?.totalInvoices || 0}
              prefix={<FileTextOutlined />}
            />
            <div className="text-xs text-gray-500 mt-2">
              {formatCurrency(supplier.statistics?.totalInvoiceAmount || 0, supplier.currency)}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Ort. Ödeme Süresi"
              value={supplier.statistics?.averagePaymentDays || 0}
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
                  <ShopOutlined />
                  <span className="ml-2">Genel Bilgiler</span>
                </span>
              ),
              children: (
                <Descriptions bordered column={{ xs: 1, sm: 2, md: 2 }}>
                  <Descriptions.Item label="Tedarikçi Kodu">{supplier.code}</Descriptions.Item>
                  <Descriptions.Item label="Tip">
                    {supplierTypeLabels[supplier.type]}
                  </Descriptions.Item>
                  <Descriptions.Item label="İlgili Kişi">{supplier.contactPerson || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Email">{supplier.email || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Telefon">{supplier.phone || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Mobil">{supplier.mobilePhone || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Website">
                    {supplier.website ? (
                      <a href={supplier.website} target="_blank" rel="noreferrer">
                        {supplier.website}
                      </a>
                    ) : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Vergi No">{supplier.taxNumber || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Vergi Dairesi">{supplier.taxOffice || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Adres" span={2}>
                    {supplier.address || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Şehir">{supplier.city || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Ülke">{supplier.country || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Posta Kodu">{supplier.postalCode || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Para Birimi">{supplier.currency}</Descriptions.Item>
                  <Descriptions.Item label="Vade (Gün)">{supplier.paymentTermDays}</Descriptions.Item>
                  <Descriptions.Item label="Güncel Bakiye">
                    <span className={supplier.currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(supplier.currentBalance, supplier.currency)}
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Durum">
                    <Tag color={supplier.isActive ? 'green' : 'red'}>
                      {supplier.isActive ? 'Aktif' : 'Pasif'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Bloke">
                    <Tag color={supplier.isBlocked ? 'red' : 'green'}>
                      {supplier.isBlocked ? 'Evet' : 'Hayır'}
                    </Tag>
                  </Descriptions.Item>
                  {supplier.isBlocked && supplier.blockReason && (
                    <Descriptions.Item label="Bloke Nedeni" span={2}>
                      {supplier.blockReason}
                    </Descriptions.Item>
                  )}
                  {supplier.notes && (
                    <Descriptions.Item label="Notlar" span={2}>
                      {supplier.notes}
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
                  columns={[
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
                      render: (_: any, record: any) => (
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
                            {formatCurrency(amount, supplier.currency)}
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
                            {formatCurrency(amount, supplier.currency)}
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
                          {formatCurrency(balance, supplier.currency)}
                        </span>
                      )
                    }
                  ]}
                  dataSource={supplier.balanceHistory || []}
                  rowKey={(record: any) => `${record.referenceId}-${record.date}`}
                  scroll={{ x: 900 }}
                  pagination={{ pageSize: 20 }}
                />
              )
            },
            {
              key: 'purchase-orders',
              label: (
                <span>
                  <ShoppingCartOutlined />
                  <span className="ml-2">Satın Alma Siparişleri ({supplier.recentPurchaseOrders?.length || 0})</span>
                </span>
              ),
              children: (
                <Table
                  columns={[
                    {
                      title: 'Sipariş No',
                      dataIndex: 'orderNumber',
                      key: 'orderNumber',
                      width: 140
                    },
                    {
                      title: 'Tarih',
                      dataIndex: 'orderDate',
                      key: 'orderDate',
                      width: 110,
                      render: (date: string) => formatDate(date)
                    },
                    {
                      title: 'Durum',
                      dataIndex: 'status',
                      key: 'status',
                      width: 120,
                      render: (status: string) => (
                        <Tag color={status === 'Completed' ? 'green' : 'blue'}>
                          {status}
                        </Tag>
                      )
                    },
                    {
                      title: 'Tutar',
                      dataIndex: 'totalAmount',
                      key: 'totalAmount',
                      width: 130,
                      align: 'right',
                      render: (amount: number, record: any) => formatCurrency(amount, record.currency)
                    },
                    {
                      title: 'İşlemler',
                      key: 'actions',
                      width: 100,
                      render: (_: any, record: any) => (
                        <Button size="small" onClick={() => navigate(`/purchase-orders/${record.id}`)}>
                          Detay
                        </Button>
                      )
                    }
                  ]}
                  dataSource={supplier.recentPurchaseOrders || []}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              )
            },
            {
              key: 'invoices',
              label: (
                <span>
                  <FileTextOutlined />
                  <span className="ml-2">Faturalar ({supplier.recentInvoices?.length || 0})</span>
                </span>
              ),
              children: (
                <Table
                  columns={[
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
                        <Tag color="purple">Alış</Tag>
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
                      align: 'right',
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
                  ]}
                  dataSource={supplier.recentInvoices || []}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              )
            },
            {
              key: 'payments',
              label: (
                <span>
                  <DollarOutlined />
                  <span className="ml-2">Ödemeler ({supplier.recentPayments?.length || 0})</span>
                </span>
              ),
              children: (
                <Table
                  columns={[
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
                      align: 'right',
                      render: (amount: number, record: any) => (
                        <span className="text-red-600">
                          -{formatCurrency(amount, record.currency)}
                        </span>
                      )
                    }
                  ]}
                  dataSource={supplier.recentPayments || []}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              )
            }
          ]}
        />
      </Card>
    </div>
  );
}
