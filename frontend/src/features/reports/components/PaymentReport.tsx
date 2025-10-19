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
      title: 'Müşteri/Tedarikçi',
      dataIndex: 'customerName',
      key: 'customerName',
      ellipsis: true
    },
    {
      title: 'Tip',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      align: 'center',
      render: (type: string) => (
        <Tag color={type === 'Receipt' ? 'green' : 'red'}>
          {type === 'Receipt' ? 'Tahsilat' : 'Ödeme'}
        </Tag>
      ),
      filters: [
        { text: 'Tahsilat', value: 'Receipt' },
        { text: 'Ödeme', value: 'Payment' }
      ],
      onFilter: (value, record) => record.type === value
    },
    {
      title: 'Yöntem',
      dataIndex: 'method',
      key: 'method',
      width: 120,
      align: 'center',
      render: (method: string) => {
        const methodColors: Record<string, string> = {
          'Cash': 'blue',
          'BankTransfer': 'cyan',
          'CreditCard': 'purple',
          'Check': 'orange'
        };
        const methodLabels: Record<string, string> = {
          'Cash': 'Nakit',
          'BankTransfer': 'Havale',
          'CreditCard': 'Kredi Kartı',
          'Check': 'Çek'
        };
        return (
          <Tag color={methodColors[method] || 'default'}>
            {methodLabels[method] || method}
          </Tag>
        );
      },
      filters: [
        { text: 'Nakit', value: 'Cash' },
        { text: 'Havale', value: 'BankTransfer' },
        { text: 'Kredi Kartı', value: 'CreditCard' },
        { text: 'Çek', value: 'Check' }
      ],
      onFilter: (value, record) => record.method === value
    },
    {
      title: 'Fatura No',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      width: 140,
      render: (number?: string) => number || <span className="text-gray-400">-</span>
    },
    {
      title: 'Hesap',
      dataIndex: 'accountName',
      key: 'accountName',
      ellipsis: true,
      render: (name: string, record) => (
        <div>
          <div className="font-semibold">{name}</div>
          <div className="text-gray-500 text-xs">
            {record.accountType === 'Cash' ? '💵 Kasa' : '🏦 Banka'}
          </div>
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
          {record.type === 'Receipt' ? '+' : '-'}
          {formatCurrency(amount, record.currency)}
        </span>
      ),
      fixed: 'right',
      sorter: (a, b) => a.amount - b.amount
    }
  ];

  if (!data || data.items.length === 0) {
    return <Empty description="Ödeme raporu verisi bulunamadı" />;
  }

  return (
    <div>
      {/* Summary Cards */}
      <Row gutter={16} className="mb-4">
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Toplam Tahsilat"
              value={data.summary.totalReceipts}
              precision={2}
              suffix="₺"
              valueStyle={{ color: '#52c41a' }}
              prefix="+"
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Toplam Ödeme"
              value={data.summary.totalPayments}
              precision={2}
              suffix="₺"
              valueStyle={{ color: '#ff4d4f' }}
              prefix="-"
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Net Nakit Akışı"
              value={data.summary.netCashFlow}
              precision={2}
              suffix="₺"
              valueStyle={{ 
                color: data.summary.netCashFlow >= 0 ? '#52c41a' : '#ff4d4f' 
              }}
              prefix={data.summary.netCashFlow >= 0 ? '+' : ''}
            />
          </Card>
        </Col>
      </Row>

      {/* Payment Methods Breakdown */}
      <Row gutter={16} className="mb-4">
        <Col xs={24} md={12}>
          <Card title="Tahsilat Yöntemleri" size="small">
            {data.summary.receiptsByMethod.map(item => (
              <div key={item.method} className="flex justify-between items-center py-2 border-b last:border-b-0">
                <span className="text-gray-600">{item.method}</span>
                <span className="font-semibold text-green-600">
                  +{formatCurrency(item.amount, 'TRY')}
                </span>
              </div>
            ))}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Ödeme Yöntemleri" size="small">
            {data.summary.paymentsByMethod.map(item => (
              <div key={item.method} className="flex justify-between items-center py-2 border-b last:border-b-0">
                <span className="text-gray-600">{item.method}</span>
                <span className="font-semibold text-red-600">
                  -{formatCurrency(item.amount, 'TRY')}
                </span>
              </div>
            ))}
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
                <div>
                  <div className="text-green-600 font-semibold">
                    +{formatCurrency(data.summary.totalReceipts, 'TRY')} Tahsilat
                  </div>
                  <div className="text-red-600 font-semibold">
                    -{formatCurrency(data.summary.totalPayments, 'TRY')} Ödeme
                  </div>
                  <div className="font-bold text-lg mt-1">
                    Net: {formatCurrency(data.summary.netCashFlow, 'TRY')}
                  </div>
                </div>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          </Table.Summary>
        )}
      />
    </div>
  );
}
