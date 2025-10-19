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

import { dashboardApi } from '@/api/dashboard';
import type { DashboardFilters } from '@/types/dashboard';
import { formatCurrency, formatDate } from '@/lib/utils';

const { RangePicker } = DatePicker;

export default function Dashboard() {
  const [filters, setFilters] = useState<DashboardFilters>({
    dateFrom: dayjs().subtract(30, 'days').format('YYYY-MM-DD'),
    dateTo: dayjs().format('YYYY-MM-DD')
  });

  // Fetch metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['dashboardMetrics', filters],
    queryFn: () => dashboardApi.getMetrics(filters)
  });

  // Fetch sales chart
  const { data: salesChart, isLoading: salesChartLoading } = useQuery({
    queryKey: ['salesChart', filters],
    queryFn: () => dashboardApi.getSalesChart(filters)
  });

  // Fetch payment chart
  const { data: paymentChart, isLoading: paymentChartLoading } = useQuery({
    queryKey: ['paymentChart', filters],
    queryFn: () => dashboardApi.getPaymentChart(filters)
  });

  // Fetch top customers
  const { data: topCustomers, isLoading: topCustomersLoading } = useQuery({
    queryKey: ['topCustomers', filters],
    queryFn: () => dashboardApi.getTopCustomers(filters)
  });

  // Fetch low stock
  const { data: lowStock, isLoading: lowStockLoading } = useQuery({
    queryKey: ['lowStock'],
    queryFn: () => dashboardApi.getLowStockProducts()
  });

  // Fetch recent invoices
  const { data: recentInvoices, isLoading: recentInvoicesLoading } = useQuery({
    queryKey: ['recentInvoices', filters],
    queryFn: () => dashboardApi.getRecentInvoices(filters)
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

  if (metricsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" />
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
                filters.dateFrom ? dayjs(filters.dateFrom) : null,
                filters.dateTo ? dayjs(filters.dateTo) : null
              ]}
              onChange={(dates) => {
                setFilters({
                  ...filters,
                  dateFrom: dates?.[0]?.format('YYYY-MM-DD'),
                  dateTo: dates?.[1]?.format('YYYY-MM-DD')
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
              value={metrics?.totalSalesAmount || 0}
              precision={2}
              prefix={<ShoppingCartOutlined />}
              suffix="₺"
              valueStyle={{ color: '#1890ff' }}
            />
            <div className="mt-2 flex items-center text-sm">
              {(metrics?.monthlySalesGrowth || 0) >= 0 ? (
                <ArrowUpOutlined className="text-green-600 mr-1" />
              ) : (
                <ArrowDownOutlined className="text-red-600 mr-1" />
              )}
              <span className={
                (metrics?.monthlySalesGrowth || 0) >= 0 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }>
                {Math.abs(metrics?.monthlySalesGrowth || 0).toFixed(1)}%
              </span>
              <span className="text-gray-500 ml-1">bu ay</span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Toplam Tahsilat"
              value={metrics?.totalPaymentsAmount || 0}
              precision={2}
              prefix={<CreditCardOutlined />}
              suffix="₺"
              valueStyle={{ color: '#52c41a' }}
            />
            <div className="mt-2 flex items-center text-sm">
              {(metrics?.monthlyPaymentsGrowth || 0) >= 0 ? (
                <ArrowUpOutlined className="text-green-600 mr-1" />
              ) : (
                <ArrowDownOutlined className="text-red-600 mr-1" />
              )}
              <span className={
                (metrics?.monthlyPaymentsGrowth || 0) >= 0 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }>
                {Math.abs(metrics?.monthlyPaymentsGrowth || 0).toFixed(1)}%
              </span>
              <span className="text-gray-500 ml-1">bu ay</span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Toplam Kâr"
              value={metrics?.totalProfit || 0}
              precision={2}
              prefix={<TrophyOutlined />}
              suffix="₺"
              valueStyle={{ color: '#faad14' }}
            />
            <div className="mt-2 flex items-center text-sm">
              <span className="text-gray-600">
                Kâr Marjı: {(metrics?.profitMargin || 0).toFixed(1)}%
              </span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="GR Kuyruk Bakiyesi"
              value={metrics?.grQueueWaitingAmount || 0}
              precision={2}
              prefix={<DollarOutlined />}
              suffix="₺"
              valueStyle={{ color: '#ff4d4f' }}
            />
            <div className="mt-2 flex items-center text-sm">
              <Tag color="orange">{metrics?.grQueueCount || 0} kayıt</Tag>
              <span className="text-gray-500 ml-2">bekliyor</span>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} lg={16}>
          <Card title="Satış & Alış Grafiği" loading={salesChartLoading}>
            {salesChart && salesChart.length > 0 ? (
              <ReactECharts 
                option={salesChartOptions} 
                style={{ height: '400px' }}
              />
            ) : (
              <Empty description="Veri bulunamadı" />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Ödeme Dağılımı" loading={paymentChartLoading}>
            {paymentChart && paymentChart.length > 0 ? (
              <ReactECharts 
                option={paymentChartOptions} 
                style={{ height: '400px' }}
              />
            ) : (
              <Empty description="Veri bulunamadı" />
            )}
          </Card>
        </Col>
      </Row>

      {/* Tables */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} lg={12}>
          <Card 
            title="En Çok Alışveriş Yapan Müşteriler" 
            loading={topCustomersLoading}
          >
            <Table
              columns={topCustomersColumns}
              dataSource={topCustomers || []}
              rowKey="customerId"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card 
            title={
              <div className="flex items-center">
                <WarningOutlined className="text-orange-500 mr-2" />
                <span>Düşük Stok Uyarıları</span>
              </div>
            }
            loading={lowStockLoading}
          >
            {lowStock && lowStock.length > 0 ? (
              <Table
                columns={lowStockColumns}
                dataSource={lowStock}
                rowKey="productId"
                pagination={false}
                size="small"
              />
            ) : (
              <Empty description="Düşük stok yok" />
            )}
          </Card>
        </Col>
      </Row>

      {/* Recent Invoices */}
      <Row gutter={16}>
        <Col span={24}>
          <Card 
            title={
              <div className="flex items-center">
                <FileTextOutlined className="mr-2" />
                <span>Son Faturalar</span>
              </div>
            }
            loading={recentInvoicesLoading}
          >
            <Table
              columns={recentInvoicesColumns}
              dataSource={recentInvoices || []}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}