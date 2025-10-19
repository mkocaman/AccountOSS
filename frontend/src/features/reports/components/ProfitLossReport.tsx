import React from 'react';
import { Table, Statistic, Row, Col, Card, Empty } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useQuery } from '@tanstack/react-query';
import { 
  RiseOutlined, 
  FallOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';

import { reportsApi } from '@/api/reports';
import type { ProfitLossReportItem, ReportFilters } from '@/types/report';
import { formatCurrency } from '@/lib/utils';

interface Props {
  filters: ReportFilters;
}

export default function ProfitLossReport({ filters }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['profitLossReport', filters],
    queryFn: () => reportsApi.getProfitLossReport(filters)
  });

  const columns: ColumnsType<ProfitLossReportItem> = [
    {
      title: 'Dönem',
      dataIndex: 'period',
      key: 'period',
      width: 120,
      fixed: 'left',
      render: (period: string) => dayjs(period).format('MMMM YYYY'),
      sorter: (a, b) => a.period.localeCompare(b.period)
    },
    {
      title: 'Satışlar',
      dataIndex: 'sales',
      key: 'sales',
      width: 150,
      align: 'right',
      render: (amount: number) => (
        <span className="font-semibold text-blue-600">
          {formatCurrency(amount, 'TRY')}
        </span>
      ),
      sorter: (a, b) => a.sales - b.sales
    },
    {
      title: 'Satış Maliyeti',
      dataIndex: 'salesCost',
      key: 'salesCost',
      width: 150,
      align: 'right',
      render: (amount: number) => (
        <span className="text-red-600">
          {formatCurrency(amount, 'TRY')}
        </span>
      ),
      sorter: (a, b) => a.salesCost - b.salesCost
    },
    {
      title: 'Brüt Kâr',
      dataIndex: 'grossProfit',
      key: 'grossProfit',
      width: 150,
      align: 'right',
      render: (amount: number) => (
        <span className={`font-semibold ${amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {formatCurrency(amount, 'TRY')}
        </span>
      ),
      sorter: (a, b) => a.grossProfit - b.grossProfit
    },
    {
      title: 'Brüt Kâr %',
      dataIndex: 'grossProfitMargin',
      key: 'grossProfitMargin',
      width: 120,
      align: 'center',
      render: (margin: number) => (
        <span className={margin >= 0 ? 'text-green-600' : 'text-red-600'}>
          {margin >= 0 ? <RiseOutlined /> : <FallOutlined />}
          {' '}{Math.abs(margin).toFixed(1)}%
        </span>
      ),
      sorter: (a, b) => a.grossProfitMargin - b.grossProfitMargin
    },
    {
      title: 'Giderler',
      dataIndex: 'expenses',
      key: 'expenses',
      width: 150,
      align: 'right',
      render: (amount: number) => (
        <span className="text-orange-600">
          {formatCurrency(amount, 'TRY')}
        </span>
      ),
      sorter: (a, b) => a.expenses - b.expenses
    },
    {
      title: 'Net Kâr',
      dataIndex: 'netProfit',
      key: 'netProfit',
      width: 150,
      align: 'right',
      render: (amount: number) => (
        <span className={`font-bold text-lg ${amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {formatCurrency(amount, 'TRY')}
        </span>
      ),
      sorter: (a, b) => a.netProfit - b.netProfit,
      fixed: 'right'
    },
    {
      title: 'Net Kâr %',
      dataIndex: 'netProfitMargin',
      key: 'netProfitMargin',
      width: 120,
      align: 'center',
      render: (margin: number) => (
        <span className={`font-semibold ${margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {margin >= 0 ? <RiseOutlined /> : <FallOutlined />}
          {' '}{Math.abs(margin).toFixed(1)}%
        </span>
      ),
      sorter: (a, b) => a.netProfitMargin - b.netProfitMargin,
      fixed: 'right'
    }
  ];

  // Chart options
  const chartOptions = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['Satışlar', 'Maliyetler', 'Brüt Kâr', 'Giderler', 'Net Kâr']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data?.items.map(item => dayjs(item.period).format('MMM YY')) || []
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
        data: data?.items.map(item => item.sales) || [],
        itemStyle: { color: '#1890ff' }
      },
      {
        name: 'Maliyetler',
        type: 'bar',
        data: data?.items.map(item => item.salesCost) || [],
        itemStyle: { color: '#ff4d4f' }
      },
      {
        name: 'Brüt Kâr',
        type: 'line',
        data: data?.items.map(item => item.grossProfit) || [],
        itemStyle: { color: '#52c41a' }
      },
      {
        name: 'Giderler',
        type: 'bar',
        data: data?.items.map(item => item.expenses) || [],
        itemStyle: { color: '#faad14' }
      },
      {
        name: 'Net Kâr',
        type: 'line',
        data: data?.items.map(item => item.netProfit) || [],
        itemStyle: { color: '#13c2c2' },
        lineStyle: { width: 3 }
      }
    ]
  };

  // Margin chart
  const marginChartOptions = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br/>{a0}: {c0}%<br/>{a1}: {c1}%'
    },
    legend: {
      data: ['Brüt Kâr %', 'Net Kâr %']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data?.items.map(item => dayjs(item.period).format('MMM YY')) || []
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [
      {
        name: 'Brüt Kâr %',
        type: 'line',
        data: data?.items.map(item => item.grossProfitMargin.toFixed(1)) || [],
        itemStyle: { color: '#52c41a' },
        smooth: true
      },
      {
        name: 'Net Kâr %',
        type: 'line',
        data: data?.items.map(item => item.netProfitMargin.toFixed(1)) || [],
        itemStyle: { color: '#13c2c2' },
        smooth: true
      }
    ]
  };

  if (!data || !data.items || data.items.length === 0) {
    return <Empty description="Kâr/Zarar raporu verisi bulunamadı" />;
  }

  return (
    <div>
      {/* Summary Cards */}
      <Row gutter={16} className="mb-4">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Toplam Satış"
              value={data.summary.totalSales}
              precision={2}
              suffix="₺"
              valueStyle={{ color: '#1890ff' }}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Toplam Maliyet"
              value={data.summary.totalCost}
              precision={2}
              suffix="₺"
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Brüt Kâr"
              value={data.summary.totalGrossProfit}
              precision={2}
              suffix="₺"
              valueStyle={{ color: '#52c41a' }}
              prefix={<TrophyOutlined />}
            />
            <div className="mt-2 text-sm text-gray-600">
              Ort. Marj: {data.summary.avgGrossProfitMargin.toFixed(1)}%
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Net Kâr"
              value={data.summary.totalNetProfit}
              precision={2}
              suffix="₺"
              valueStyle={{ 
                color: data.summary.totalNetProfit >= 0 ? '#52c41a' : '#ff4d4f' 
              }}
              prefix={
                data.summary.totalNetProfit >= 0 ? <RiseOutlined /> : <FallOutlined />
              }
            />
            <div className="mt-2 text-sm text-gray-600">
              Ort. Marj: {data.summary.avgNetProfitMargin.toFixed(1)}%
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={16} className="mb-4">
        <Col xs={24} lg={16}>
          <Card title="Satış & Kâr Trendi" size="small">
            <ReactECharts 
              option={chartOptions} 
              style={{ height: '400px' }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Kâr Marjı Trendi" size="small">
            <ReactECharts 
              option={marginChartOptions} 
              style={{ height: '400px' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={data.items}
          rowKey="period"
          loading={isLoading}
          scroll={{ x: 1300 }}
          pagination={{
            pageSize: 12,
            showSizeChanger: false,
            showTotal: (total) => `Toplam ${total} dönem`
          }}
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0}>
                  <strong>TOPLAM / ORTALAMA</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">
                  <strong className="text-blue-600">
                    {formatCurrency(data.summary.totalSales, 'TRY')}
                  </strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} align="right">
                  <strong className="text-red-600">
                    {formatCurrency(data.summary.totalCost, 'TRY')}
                  </strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3} align="right">
                  <strong className="text-green-600">
                    {formatCurrency(data.summary.totalGrossProfit, 'TRY')}
                  </strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4} align="center">
                  <strong className="text-green-600">
                    {data.summary.avgGrossProfitMargin.toFixed(1)}%
                  </strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={5} align="right">
                  <strong className="text-orange-600">
                    {formatCurrency(data.summary.totalExpenses, 'TRY')}
                  </strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={6} align="right">
                  <strong className={`text-lg ${
                    data.summary.totalNetProfit >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(data.summary.totalNetProfit, 'TRY')}
                  </strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={7} align="center">
                  <strong className={
                    data.summary.avgNetProfitMargin >= 0 ? 'text-green-600' : 'text-red-600'
                  }>
                    {data.summary.avgNetProfitMargin.toFixed(1)}%
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
