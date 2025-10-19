import React from 'react';
import { Table, Statistic, Row, Col, Card, Empty } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useQuery } from '@tanstack/react-query';

import { reportsApi } from '@/api/reports';
import type { ProfitLossReportItem, ReportFilters } from '@/types/report';
import { formatCurrency, formatPercentage } from '@/lib/utils';

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
      render: (period: string) => {
        const [year, month] = period.split('-');
        const monthNames = [
          'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
          'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
        ];
        return `${monthNames[parseInt(month) - 1]} ${year}`;
      }
    },
    {
      title: 'Satışlar',
      dataIndex: 'sales',
      key: 'sales',
      width: 130,
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
      width: 130,
      align: 'right',
      render: (amount: number) => (
        <span className="text-red-600">
          {formatCurrency(amount, 'TRY')}
        </span>
      )
    },
    {
      title: 'Brüt Kâr',
      dataIndex: 'grossProfit',
      key: 'grossProfit',
      width: 130,
      align: 'right',
      render: (amount: number) => (
        <span className={`font-semibold ${amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {formatCurrency(amount, 'TRY')}
        </span>
      )
    },
    {
      title: 'Brüt Kâr Marjı',
      dataIndex: 'grossProfitMargin',
      key: 'grossProfitMargin',
      width: 130,
      align: 'right',
      render: (margin: number) => (
        <span className={margin >= 0 ? 'text-green-600' : 'text-red-600'}>
          {formatPercentage(margin)}
        </span>
      )
    },
    {
      title: 'Giderler',
      dataIndex: 'expenses',
      key: 'expenses',
      width: 130,
      align: 'right',
      render: (amount: number) => (
        <span className="text-orange-600">
          {formatCurrency(amount, 'TRY')}
        </span>
      )
    },
    {
      title: 'Net Kâr',
      dataIndex: 'netProfit',
      key: 'netProfit',
      width: 130,
      align: 'right',
      render: (amount: number) => (
        <span className={`font-semibold ${amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {formatCurrency(amount, 'TRY')}
        </span>
      ),
      fixed: 'right'
    },
    {
      title: 'Net Kâr Marjı',
      dataIndex: 'netProfitMargin',
      key: 'netProfitMargin',
      width: 130,
      align: 'right',
      render: (margin: number) => (
        <span className={margin >= 0 ? 'text-green-600' : 'text-red-600'}>
          {formatPercentage(margin)}
        </span>
      ),
      fixed: 'right'
    }
  ];

  if (!data || data.items.length === 0) {
    return <Empty description="Rapor verisi bulunamadı" />;
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
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Toplam Brüt Kâr"
              value={data.summary.totalGrossProfit}
              precision={2}
              suffix="₺"
              valueStyle={{ 
                color: data.summary.totalGrossProfit >= 0 ? '#52c41a' : '#ff4d4f' 
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Ortalama Brüt Kâr Marjı"
              value={data.summary.avgGrossProfitMargin}
              precision={1}
              suffix="%"
              valueStyle={{ 
                color: data.summary.avgGrossProfitMargin >= 0 ? '#52c41a' : '#ff4d4f' 
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Additional Summary Cards */}
      <Row gutter={16} className="mb-4">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Toplam Gider"
              value={data.summary.totalExpenses}
              precision={2}
              suffix="₺"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Toplam Net Kâr"
              value={data.summary.totalNetProfit}
              precision={2}
              suffix="₺"
              valueStyle={{ 
                color: data.summary.totalNetProfit >= 0 ? '#52c41a' : '#ff4d4f' 
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
            title="Ortalama Net Kâr Marjı"
            value={data.summary.avgNetProfitMargin}
            precision={1}
            suffix="%"
            valueStyle={{ 
              color: data.summary.avgNetProfitMargin >= 0 ? '#52c41a' : '#ff4d4f' 
            }}
          />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Dönem Sayısı"
              value={data.items.length}
              precision={0}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={data.items}
        rowKey="period"
        loading={isLoading}
        scroll={{ x: 1000 }}
        pagination={{
          pageSize: 12,
          showSizeChanger: true,
          showTotal: (total) => `Toplam ${total} dönem`
        }}
        summary={() => (
          <Table.Summary fixed>
            <Table.Summary.Row>
              <Table.Summary.Cell index={0}>
                <strong>TOPLAM</strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1} align="right">
                <strong className="text-blue-600">
                  {formatCurrency(
                    data.items.reduce((sum, item) => sum + item.sales, 0),
                    'TRY'
                  )}
                </strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={2} align="right">
                <strong className="text-red-600">
                  {formatCurrency(
                    data.items.reduce((sum, item) => sum + item.salesCost, 0),
                    'TRY'
                  )}
                </strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={3} align="right">
                <strong className="text-green-600">
                  {formatCurrency(
                    data.items.reduce((sum, item) => sum + item.grossProfit, 0),
                    'TRY'
                  )}
                </strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={4} align="right">
                <strong className="text-green-600">
                  {formatPercentage(
                    data.items.reduce((sum, item) => sum + item.grossProfitMargin, 0) / data.items.length
                  )}
                </strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={5} align="right">
                <strong className="text-orange-600">
                  {formatCurrency(
                    data.items.reduce((sum, item) => sum + item.expenses, 0),
                    'TRY'
                  )}
                </strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={6} align="right">
                <strong className="text-green-600">
                  {formatCurrency(
                    data.items.reduce((sum, item) => sum + item.netProfit, 0),
                    'TRY'
                  )}
                </strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={7} align="right">
                <strong className="text-green-600">
                  {formatPercentage(
                    data.items.reduce((sum, item) => sum + item.netProfitMargin, 0) / data.items.length
                  )}
                </strong>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          </Table.Summary>
        )}
      />
    </div>
  );
}
