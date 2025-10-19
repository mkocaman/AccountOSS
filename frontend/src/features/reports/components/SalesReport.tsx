import React from 'react';
import { Table, Tag, Statistic, Row, Col, Card, Empty } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useQuery } from '@tanstack/react-query';

import { reportsApi } from '@/api/reports';
import type { SalesReportItem, ReportFilters } from '@/types/report';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Props {
  filters: ReportFilters;
}

export default function SalesReport({ filters }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['salesReport', filters],
    queryFn: () => reportsApi.getSalesReport(filters)
  });

  const columns: ColumnsType<SalesReportItem> = [
    {
      title: 'Fatura No',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      width: 150,
      fixed: 'left'
    },
    {
      title: 'Tarih',
      dataIndex: 'invoiceDate',
      key: 'invoiceDate',
      width: 120,
      render: (date: string) => formatDate(date),
      sorter: (a, b) => new Date(a.invoiceDate).getTime() - new Date(b.invoiceDate).getTime()
    },
    {
      title: 'Müşteri/Tedarikçi',
      dataIndex: 'customerName',
      key: 'customerName',
      ellipsis: true,
      render: (name: string, record) => (
        <div>
          <div className="font-semibold">{name}</div>
          <div className="text-gray-500 text-xs">{record.customerCode}</div>
        </div>
      )
    },
    {
      title: 'Tip',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      align: 'center',
      render: (type: string) => (
        <Tag color={type === 'Sales' ? 'blue' : 'purple'}>
          {type === 'Sales' ? 'Satış' : 'Alış'}
        </Tag>
      ),
      filters: [
        { text: 'Satış', value: 'Sales' },
        { text: 'Alış', value: 'Purchase' }
      ],
      onFilter: (value, record) => record.type === value
    },
    {
      title: 'Durum',
      dataIndex: 'isOfficial',
      key: 'isOfficial',
      width: 120,
      align: 'center',
      render: (isOfficial: boolean) => (
        <Tag color={isOfficial ? 'green' : 'orange'}>
          {isOfficial ? 'Resmi' : 'Gayriresmi'}
        </Tag>
      )
    },
    {
      title: 'Ara Toplam',
      dataIndex: 'subTotal',
      key: 'subTotal',
      width: 130,
      align: 'right',
      render: (amount: number, record) => formatCurrency(amount, record.currency)
    },
    {
      title: 'KDV',
      dataIndex: 'totalVat',
      key: 'totalVat',
      width: 120,
      align: 'right',
      render: (amount: number, record) => formatCurrency(amount, record.currency)
    },
    {
      title: 'İndirim',
      dataIndex: 'totalDiscount',
      key: 'totalDiscount',
      width: 120,
      align: 'right',
      render: (amount: number, record) => 
        amount > 0 ? (
          <span className="text-red-600">
            -{formatCurrency(amount, record.currency)}
          </span>
        ) : (
          '-'
        )
    },
    {
      title: 'Genel Toplam',
      dataIndex: 'grandTotal',
      key: 'grandTotal',
      width: 150,
      align: 'right',
      render: (amount: number, record) => (
        <span className="font-semibold">
          {formatCurrency(amount, record.currency)}
        </span>
      ),
      fixed: 'right'
    },
    {
      title: 'Kâr',
      dataIndex: 'profitAmount',
      key: 'profitAmount',
      width: 130,
      align: 'right',
      render: (amount: number, record) => 
        amount ? (
          <div>
            <div className={amount > 0 ? 'text-green-600' : 'text-red-600'}>
              {formatCurrency(amount, record.currency)}
            </div>
            <div className="text-xs text-gray-500">
              {record.profitMargin?.toFixed(1)}%
            </div>
          </div>
        ) : (
          '-'
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
              title="Toplam Fatura"
              value={data.summary.totalInvoices}
              precision={0}
            />
          </Card>
        </Col>
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
              title="Toplam Alış"
              value={data.summary.totalPurchases}
              precision={2}
              suffix="₺"
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Net Satış"
              value={data.summary.netSales}
              precision={2}
              suffix="₺"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={data.items}
        rowKey="invoiceNumber"
        loading={isLoading}
        scroll={{ x: 1500 }}
        pagination={{
          pageSize: 50,
          showSizeChanger: true,
          showTotal: (total) => `Toplam ${total} fatura`
        }}
        summary={() => (
          <Table.Summary fixed>
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={5}>
                <strong>TOPLAM</strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={5} align="right">
                <strong>
                  {formatCurrency(
                    data.items.reduce((sum, item) => sum + item.subTotal, 0),
                    'TRY'
                  )}
                </strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={6} align="right">
                <strong>
                  {formatCurrency(
                    data.items.reduce((sum, item) => sum + item.totalVat, 0),
                    'TRY'
                  )}
                </strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={7} align="right">
                <strong className="text-red-600">
                  -{formatCurrency(
                    data.items.reduce((sum, item) => sum + item.totalDiscount, 0),
                    'TRY'
                  )}
                </strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={8} align="right">
                <strong>
                  {formatCurrency(
                    data.items.reduce((sum, item) => sum + item.grandTotal, 0),
                    'TRY'
                  )}
                </strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={9} align="right">
                <strong className="text-green-600">
                  {formatCurrency(
                    data.items.reduce((sum, item) => sum + (item.profitAmount || 0), 0),
                    'TRY'
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
