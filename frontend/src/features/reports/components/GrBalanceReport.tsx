import React from 'react';
import { Table, Tag, Statistic, Row, Col, Card, Empty } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useQuery } from '@tanstack/react-query';

import { reportsApi } from '@/api/reports';
import type { GrBalanceReportItem, ReportFilters } from '@/types/report';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Props {
  filters: ReportFilters;
}

export default function GrBalanceReport({ filters }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['grBalanceReport', filters],
    queryFn: () => reportsApi.getGrBalanceReport(filters)
  });

  const columns: ColumnsType<GrBalanceReportItem> = [
    {
      title: 'Giriş Tarihi',
      dataIndex: 'entryDate',
      key: 'entryDate',
      width: 120,
      render: (date: string) => formatDate(date),
      sorter: (a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()
    },
    {
      title: 'Gayriresmi Fatura',
      dataIndex: 'unofficialInvoiceNumber',
      key: 'unofficialInvoiceNumber',
      width: 150,
      fixed: 'left'
    },
    {
      title: 'Müşteri',
      dataIndex: 'customerName',
      key: 'customerName',
      ellipsis: true
    },
    {
      title: 'Orijinal Tutar',
      dataIndex: 'originalAmount',
      key: 'originalAmount',
      width: 130,
      align: 'right',
      render: (amount: number, record) => formatCurrency(amount, record.currency)
    },
    {
      title: 'Aklanan Tutar',
      dataIndex: 'clearedAmount',
      key: 'clearedAmount',
      width: 130,
      align: 'right',
      render: (amount: number, record) => (
        <span className="text-green-600">
          {formatCurrency(amount, record.currency)}
        </span>
      )
    },
    {
      title: 'Kalan Tutar',
      dataIndex: 'remainingAmount',
      key: 'remainingAmount',
      width: 130,
      align: 'right',
      render: (amount: number, record) => (
        <span className={amount > 0 ? 'text-orange-600' : 'text-green-600'}>
          {formatCurrency(amount, record.currency)}
        </span>
      )
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status: string) => {
        const colors = {
          'Waiting': 'orange',
          'Partial': 'blue',
          'Cleared': 'green'
        };
        const labels = {
          'Waiting': 'Bekliyor',
          'Partial': 'Kısmi',
          'Cleared': 'Aklanmış'
        };
        return (
          <Tag color={colors[status as keyof typeof colors]}>
            {labels[status as keyof typeof labels]}
          </Tag>
        );
      },
      filters: [
        { text: 'Bekliyor', value: 'Waiting' },
        { text: 'Kısmi', value: 'Partial' },
        { text: 'Aklanmış', value: 'Cleared' }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'Aklama Sayısı',
      dataIndex: 'clearanceCount',
      key: 'clearanceCount',
      width: 120,
      align: 'center',
      render: (count: number) => (
        <Tag color="blue">{count}</Tag>
      )
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
              title="Toplam Kayıt"
              value={data.summary.totalEntries}
              precision={0}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Bekleyen"
              value={data.summary.waitingCount}
              precision={0}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Kısmi Aklanmış"
              value={data.summary.partialCount}
              precision={0}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tam Aklanmış"
              value={data.summary.clearedCount}
              precision={0}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Additional Summary Cards */}
      <Row gutter={16} className="mb-4">
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Toplam Orijinal Tutar"
              value={data.summary.totalOriginalAmount}
              precision={2}
              suffix="₺"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Toplam Aklanan Tutar"
              value={data.summary.totalClearedAmount}
              precision={2}
              suffix="₺"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Toplam Kalan Tutar"
              value={data.summary.totalRemainingAmount}
              precision={2}
              suffix="₺"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={data.items}
        rowKey="unofficialInvoiceNumber"
        loading={isLoading}
        scroll={{ x: 1000 }}
        pagination={{
          pageSize: 50,
          showSizeChanger: true,
          showTotal: (total) => `Toplam ${total} kayıt`
        }}
        summary={() => (
          <Table.Summary fixed>
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={3}>
                <strong>TOPLAM</strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={3} align="right">
                <strong>
                  {formatCurrency(
                    data.items.reduce((sum, item) => sum + item.originalAmount, 0),
                    'TRY'
                  )}
                </strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={4} align="right">
                <strong className="text-green-600">
                  {formatCurrency(
                    data.items.reduce((sum, item) => sum + item.clearedAmount, 0),
                    'TRY'
                  )}
                </strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={5} align="right">
                <strong className="text-orange-600">
                  {formatCurrency(
                    data.items.reduce((sum, item) => sum + item.remainingAmount, 0),
                    'TRY'
                  )}
                </strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={6} colSpan={2} />
            </Table.Summary.Row>
          </Table.Summary>
        )}
      />
    </div>
  );
}
