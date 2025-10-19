import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Table, 
  Tag, 
  DatePicker,
  Select,
  Space,
  Spin,
  Alert,
  Empty
} from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  CreditCardOutlined,
  TrophyOutlined,
  WarningOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import * as echarts from 'echarts';
import ReactECharts from 'echarts-for-react';

import { dashboardApi, DashboardFilters } from '@/api/dashboard';
import type { DashboardStatistics } from '@/types/dashboard';
import { formatCurrency, formatDate } from '@/lib/utils';

const { RangePicker } = DatePicker;

export default function Dashboard() {
  const [filters, setFilters] = useState<DashboardFilters>({
    startDate: dayjs().subtract(30, 'days').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD'),
    currency: 'TRY'
  });

  // Fetch dashboard statistics
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useQuery({
    queryKey: ['dashboardStatistics', filters.currency],
    queryFn: () => dashboardApi.getStatistics(filters.currency || 'TRY')
  });

  // Fetch sales report
  const { data: salesReport, isLoading: salesReportLoading } = useQuery({
    queryKey: ['salesReport', filters],
    queryFn: () => dashboardApi.getSalesReport({
      startDate: filters.startDate!,
      endDate: filters.endDate!,
      currency: filters.currency || 'TRY',
      includeComparison: true
    }),
    enabled: !!filters.startDate && !!filters.endDate
  });

  // Fetch stock report
  const { data: stockReport, isLoading: stockReportLoading } = useQuery({
    queryKey: ['stockReport', filters.currency],
    queryFn: () => dashboardApi.getStockReport(filters.currency || 'TRY', false)
  });

  // Sales chart options
  const salesChartOptions = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['Satışlar', 'Alışlar', 'Kâr']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: salesChart?.map(item => 
        dayjs(item.period).format('MMM YYYY')
      ) || []
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value: number) => `₺${(value / 1000).toFixed(0)}K`
      }
    },
    series: [
      {
        name: 'Satışlar',
        type: 'bar',
        data: salesChart?.map(item => item.sales) || [],
        itemStyle: { color: '#1890ff' }
      },
      {
        name: 'Alışlar',
        type: 'bar',
        data: salesChart?.map(item => item.purchases) || [],
        itemStyle: { color: '#ff4d4f' }
      },
      {
        name: 'Kâr',
        type: 'line',
        data: salesChart?.map(item => item.profit) || [],
        itemStyle: { color: '#52c41a' }
      }
    ]
  };

  // Payment chart options
  const paymentChartOptions = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: ₺{c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: 'Ödeme Yöntemi',
        type: 'pie',
        radius: '50%',
        data: paymentChart?.map(item => ({
          name: item.method,
          value: item.amount
        })) || [],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };

  // Top customers table columns
  const topCustomersColumns = [
    {
      title: 'Müşteri',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (name: string, record: any) => (
        <div>
          <div className="font-semibold">{name}</div>
          <div className="text-gray-500 text-xs">{record.customerCode}</div>
        </div>
      )
    },
    {
      title: 'Alışveriş Sayısı',
      dataIndex: 'totalPurchases',
      key: 'totalPurchases',
      align: 'center' as const,
      render: (count: number) => <Tag color="blue">{count}</Tag>
    },
    {
      title: 'Toplam Tutar',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      align: 'right' as const,
      render: (amount: number, record: any) => (
        <span className="font-semibold">
          {formatCurrency(amount, record.currency)}
        </span>
      )
    },
    {
      title: 'Son Alışveriş',
      dataIndex: 'lastPurchaseDate',
      key: 'lastPurchaseDate',
      render: (date: string) => formatDate(date)
    }
  ];

  // Low stock table columns
  const lowStockColumns = [
    {
      title: 'Ürün',
      dataIndex: 'productName',
      key: 'productName',
      render: (name: string, record: any) => (
        <div>
          <div className="font-semibold">{name}</div>
          <div className="text-gray-500 text-xs">{record.productCode}</div>
        </div>
      )
    },
    {
      title: 'Mevcut',
      dataIndex: 'currentStock',
      key: 'currentStock',
      align: 'center' as const,
      render: (stock: number, record: any) => (
        <Tag color={stock === 0 ? 'red' : 'orange'}>
          {stock} {record.unit}
        </Tag>
      )
    },
    {
      title: 'Min. Seviye',
      dataIndex: 'minStockLevel',
      key: 'minStockLevel',
      align: 'center' as const,
      render: (level: number, record: any) => (
        <span>{level} {record.unit}</span>
      )
    },
    {
      title: 'Güncelleme',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      render: (date: string) => formatDate(date)
    }
  ];

  // Recent invoices table columns
  const recentInvoicesColumns = [
    {
      title: 'Fatura No',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      render: (number: string, record: any) => (
        <div>
          <div className="font-semibold">{number}</div>
          <Tag color={record.isOfficial ? 'green' : 'orange'}>
            {record.isOfficial ? 'Resmi' : 'Gayriresmi'}
          </Tag>
        </div>
      )
    },
    {
      title: 'Tip',
      dataIndex: 'type',
      key: 'type',
      align: 'center' as const,
      render: (type: string) => (
        <Tag color={type === 'Sales' ? 'blue' : 'purple'}>
          {type === 'Sales' ? 'Satış' : 'Alış'}
        </Tag>
      )
    },
    {
      title: 'Müşteri/Tedarikçi',
      dataIndex: 'customerName',
      key: 'customerName'
    },
    {
      title: 'Tarih',
      dataIndex: 'invoiceDate',
      key: 'invoiceDate',
      render: (date: string) => formatDate(date)
    },
    {
      title: 'Tutar',
      dataIndex: 'grandTotal',
      key: 'grandTotal',
      align: 'right' as const,
      render: (amount: number, record: any) => (
        <span className="font-semibold">
          {formatCurrency(amount, record.currency)}
        </span>
      )
    }
  ];

  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="p-6">
        <Alert
          message="Dashboard verileri yüklenirken hata oluştu"
          description="Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin."
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">İşletmenizin genel durumu</p>
          </div>
          
          {/* Filters */}
          <Space>
            <RangePicker
              value={[
                filters.startDate ? dayjs(filters.startDate) : null,
                filters.endDate ? dayjs(filters.endDate) : null
              ]}
              onChange={(dates) => {
                setFilters({
                  ...filters,
                  startDate: dates?.[0]?.format('YYYY-MM-DD'),
                  endDate: dates?.[1]?.format('YYYY-MM-DD')
                });
              }}
            />
          </Space>
        </div>
      </div>

      {/* KPI Cards */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Toplam Satış"
              value={dashboardData?.sales?.thisMonth || 0}
              precision={2}
              prefix={<ShoppingCartOutlined />}
              suffix={dashboardData?.sales?.currency || '₺'}
              valueStyle={{ color: '#1890ff' }}
            />
            <div className="mt-2 flex items-center text-sm">
              {dashboardData?.sales?.comparison?.trend === 'up' ? (
                <ArrowUpOutlined className="text-green-600 mr-1" />
              ) : (
                <ArrowDownOutlined className="text-red-600 mr-1" />
              )}
              <span className={
                dashboardData?.sales?.comparison?.trend === 'up' 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }>
                {Math.abs(dashboardData?.sales?.comparison?.percentage || 0).toFixed(1)}%
              </span>
              <span className="text-gray-500 ml-1">bu ay</span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Toplam Tahsilat"
              value={dashboardData?.payments?.totalReceived || 0}
              precision={2}
              prefix={<CreditCardOutlined />}
              suffix={dashboardData?.payments?.currency || '₺'}
              valueStyle={{ color: '#52c41a' }}
            />
            <div className="mt-2 flex items-center text-sm">
              <span className="text-gray-600">
                Net Nakit: {formatCurrency(dashboardData?.payments?.netCashFlow || 0, dashboardData?.payments?.currency || '₺')}
              </span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Toplam Kâr"
              value={(dashboardData?.sales?.thisMonth || 0) - (dashboardData?.purchases?.thisMonth || 0)}
              precision={2}
              prefix={<TrophyOutlined />}
              suffix={dashboardData?.sales?.currency || '₺'}
              valueStyle={{ color: '#faad14' }}
            />
            <div className="mt-2 flex items-center text-sm">
              <span className="text-gray-600">
                Satış: {formatCurrency(dashboardData?.sales?.thisMonth || 0, dashboardData?.sales?.currency || '₺')}
              </span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Bekleyen Alacaklar"
              value={dashboardData?.payments?.pendingReceivables || 0}
              precision={2}
              prefix={<DollarOutlined />}
              suffix={dashboardData?.payments?.currency || '₺'}
              valueStyle={{ color: '#ff4d4f' }}
            />
            <div className="mt-2 flex items-center text-sm">
              <Tag color="orange">{dashboardData?.customers?.totalCustomers || 0} müşteri</Tag>
              <span className="text-gray-500 ml-2">toplam</span>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} lg={16}>
          <Card title="Satış & Alış Grafiği" loading={salesReportLoading}>
            {salesReport ? (
              <div className="p-4">
                <Row gutter={16}>
                  <Col span={8}>
                    <Statistic
                      title="Bu Ay Satış"
                      value={dashboardData?.sales?.thisMonth || 0}
                      suffix={dashboardData?.sales?.currency || '₺'}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="Bu Ay Alış"
                      value={dashboardData?.purchases?.thisMonth || 0}
                      suffix={dashboardData?.purchases?.currency || '₺'}
                      valueStyle={{ color: '#ff4d4f' }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="Net Kâr"
                      value={(dashboardData?.sales?.thisMonth || 0) - (dashboardData?.purchases?.thisMonth || 0)}
                      suffix={dashboardData?.sales?.currency || '₺'}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Col>
                </Row>
              </div>
            ) : (
              <Empty description="Veri bulunamadı" />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Stok Durumu" loading={stockReportLoading}>
            {dashboardData?.stock ? (
              <div className="p-4">
                <Statistic
                  title="Toplam Ürün"
                  value={dashboardData.stock.totalProducts}
                  suffix="adet"
                  valueStyle={{ color: '#1890ff' }}
                />
                <div className="mt-4">
                  <div className="flex justify-between mb-2">
                    <span>Düşük Stok:</span>
                    <Tag color="orange">{dashboardData.stock.lowStockProducts}</Tag>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Stokta Yok:</span>
                    <Tag color="red">{dashboardData.stock.outOfStockProducts}</Tag>
                  </div>
                  <div className="flex justify-between">
                    <span>Toplam Değer:</span>
                    <span className="font-semibold">
                      {formatCurrency(dashboardData.stock.totalStockValue, dashboardData.stock.currency)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <Empty description="Veri bulunamadı" />
            )}
          </Card>
        </Col>
      </Row>

      {/* Recent Activities */}
      <Row gutter={16}>
        <Col span={24}>
          <Card 
            title={
              <div className="flex items-center">
                <FileTextOutlined className="mr-2" />
                <span>Son Faaliyetler</span>
              </div>
            }
          >
            {dashboardData?.recentActivities && dashboardData.recentActivities.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.recentActivities.map((activity, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <div>
                        <div className="font-semibold">{activity.activityType}</div>
                        <div className="text-sm text-gray-600">{activity.description}</div>
                        <div className="text-xs text-gray-500">
                          {formatDate(activity.timestamp)} - {activity.referenceNumber}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {formatCurrency(activity.amount, activity.currency)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty description="Son faaliyet bulunamadı" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}