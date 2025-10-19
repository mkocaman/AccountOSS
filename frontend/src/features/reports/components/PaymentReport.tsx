import React from 'react';
import { Table, Tag, Statistic, Row, Col, Card, Empty } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useQuery } from '@tanstack/react-query';

import { reportsApi } from '@/api/reports';
import type { PaymentReportItem, ReportFilters } from '@/types/report';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Props {
  filters: ReportFilters;
}

export default function PaymentReport({ filters }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['paymentReport', filters],
    queryFn: () => reportsApi.getPaymentReport(filters)
  });

  const columns: ColumnsType<PaymentReportItem> = [
    {
      title: 'Ödeme No',
      dataIndex: 'paymentNumber',
      key: 'paymentNumber',
      width: 150,
      fixed: 'left'
    },
    {
      title: 'Tarih',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
      width: 120,
      render: (date: string) => formatDate(date),
      sorter: (a, b) => new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime()
    },
    {
      title: 'Müşteri',
      dataIndex: 'customerName',
      key: 'customerName',
      ellipsis: true
    },
    {
      title: 'Tip',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      align: 'center',
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
      width: 120,
      align: 'center',
      render: (method: string) => (
        <Tag color="blue">{method}</Tag>
      )
    },
    {
      title: 'Fatura No',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      width: 150,
      render: (number: string) => number || '-'
    },
    {
      title: 'Hesap',
      dataIndex: 'accountName',
      key: 'accountName',
      width: 150,
      render: (name: string, record) => (
        <div>
          <div className="font-semibold">{name}</div>
          <Tag color={record.accountType === 'Cash' ? 'orange' : 'blue'}>
            {record.accountType === 'Cash' ? 'Kasa' : 'Banka'}
          </Tag>
        </div>
      )
    },
    {
      title: 'Tutar',
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      align: 'right',
      render: (amount: number, record) => (
        <span className={`font-semibold ${record.type === 'Receipt' ? 'text-green-600' : 'text-red-600'}`}>
          {record.type === 'Receipt' ? '+' : '-'}{formatCurrency(amount, record.currency)}
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
              title="Toplam Tahsilat"
              value={data.summary.totalReceipts}
              precision={0}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Toplam Ödeme"
              value={data.summary.totalPayments}
              precision={0}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Net Nakit Akışı"
              value={data.summary.netCashFlow}
              precision={2}
              suffix="₺"
              valueStyle={{ 
                color: data.summary.netCashFlow >= 0 ? '#52c41a' : '#ff4d4f' 
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tahsilat Tutarı"
              value={data.summary.receiptsByMethod.reduce((sum, item) => sum + item.amount, 0)}
              precision={2}
              suffix="₺"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={data.items}
        rowKey="paymentNumber"
        loading={isLoading}
        scroll={{ x: 1200 }}
        pagination={{
          pageSize: 50,
          showSizeChanger: true,
          showTotal: (total) => `Toplam ${total} ödeme`
        }}
        summary={() => (
          <Table.Summary fixed>
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={7}>
                <strong>TOPLAM</strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={7} align="right">
                <strong className="text-green-600">
                  {formatCurrency(
                    data.items
                      .filter(item => item.type === 'Receipt')
                      .reduce((sum, item) => sum + item.amount, 0),
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
