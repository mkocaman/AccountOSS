import React from 'react';
import { Table, Tag, Statistic, Row, Col, Card, Empty, Progress } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useQuery } from '@tanstack/react-query';
import { ClockCircleOutlined, CheckCircleOutlined, SyncOutlined } from '@ant-design/icons';

import { reportsApi } from '@/api/reports';
import type { GrBalanceReportItem, ReportFilters } from '@/types/report';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Props {
  filters?: ReportFilters;
}

export default function GrBalanceReport({ filters }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['grBalanceReport', filters],
    queryFn: () => reportsApi.getGrBalanceReport(filters)
  });

  const getStatusConfig = (status: string) => {
    const configs = {
      'Waiting': { color: 'orange', icon: <ClockCircleOutlined />, text: 'Bekliyor' },
      'Partial': { color: 'blue', icon: <SyncOutlined />, text: 'Kısmi' },
      'Cleared': { color: 'green', icon: <CheckCircleOutlined />, text: 'Aklandı' }
    };
    return configs[status as keyof typeof configs] || configs['Waiting'];
  };

  const columns: ColumnsType<GrBalanceReportItem> = [
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      align: 'center',
      fixed: 'left',
      render: (status: string) => {
        const config = getStatusConfig(status);
        return (
          <Tag icon={config.icon} color={config.color}>
            {config.text}
          </Tag>
        );
      },
      filters: [
        { text: 'Bekliyor', value: 'Waiting' },
        { text: 'Kısmi', value: 'Partial' },
        { text: 'Aklandı', value: 'Cleared' }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'Kayıt Tarihi',
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
      title: 'Para Birimi',
      dataIndex: 'currency',
      key: 'currency',
      width: 100,
      align: 'center'
    },
    {
      title: 'Orijinal Tutar',
      dataIndex: 'originalAmount',
      key: 'originalAmount',
      width: 150,
      align: 'right',
      render: (amount: number, record) => formatCurrency(amount, record.currency),
      sorter: (a, b) => a.originalAmount - b.originalAmount
    },
    {
      title: 'Aklanan Tutar',
      dataIndex: 'clearedAmount',
      key: 'clearedAmount',
      width: 150,
      align: 'right',
      render: (amount: number, record) => (
        <span className="text-green-600">
          {formatCurrency(amount, record.currency)}
        </span>
      ),
      sorter: (a, b) => a.clearedAmount - b.clearedAmount
    },
    {
      title: 'Kalan Tutar',
      dataIndex: 'remainingAmount',
      key: 'remainingAmount',
      width: 150,
      align: 'right',
      render: (amount: number, record) => (
        <span className={amount > 0 ? 'text-red-600 font-semibold' : 'text-gray-400'}>
          {formatCurrency(amount, record.currency)}
        </span>
      ),
      sorter: (a, b) => a.remainingAmount - b.remainingAmount,
      fixed: 'right'
    },
    {
      title: 'İlerleme',
      key: 'progress',
      width: 150,
      render: (_, record) => {
        const percentage = record.originalAmount > 0 
          ? ((record.clearedAmount / record.originalAmount) * 100)
          : 0;
        return (
          <Progress 
            percent={Math.round(percentage)} 
            size="small"
            status={
              percentage === 100 ? 'success' :
              percentage > 0 ? 'active' :
              'normal'
            }
          />
        );
      }
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
    return <Empty description="GR kuyruk raporu verisi bulunamadı" />;
  }

  return (
    <div>
      {/* Summary Cards */}
      <Row gutter={16} className="mb-4">
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="Toplam Kayıt"
              value={data.summary.totalEntries}
              precision={0}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={5}>
          <Card>
            <Statistic
              title="Bekleyen"
              value={data.summary.waitingCount}
              precision={0}
              valueStyle={{ color: '#faad14' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={5}>
          <Card>
            <Statistic
              title="Kısmi Aklanan"
              value={data.summary.partialCount}
              precision={0}
              valueStyle={{ color: '#1890ff' }}
              prefix={<SyncOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={5}>
          <Card>
            <Statistic
              title="Tamamen Aklanan"
              value={data.summary.clearedCount}
              precision={0}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={24} lg={5}>
          <Card>
            <Statistic
              title="Kalan Bakiye"
              value={data.summary.totalRemainingAmount}
              precision={2}
              suffix="₺"
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Financial Summary */}
      <Card className="mb-4" size="small">
        <Row gutter={16}>
          <Col span={8}>
            <div className="text-center">
              <div className="text-gray-600 text-sm mb-1">Toplam Orijinal</div>
              <div className="text-2xl font-bold">
                {formatCurrency(data.summary.totalOriginalAmount, 'TRY')}
              </div>
            </div>
          </Col>
          <Col span={8}>
            <div className="text-center">
              <div className="text-gray-600 text-sm mb-1">Aklanan</div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(data.summary.totalClearedAmount, 'TRY')}
              </div>
            </div>
          </Col>
          <Col span={8}>
            <div className="text-center">
              <div className="text-gray-600 text-sm mb-1">Kalan</div>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(data.summary.totalRemainingAmount, 'TRY')}
              </div>
            </div>
          </Col>
        </Row>
        <div className="mt-4">
          <Progress 
            percent={Math.round(
              (data.summary.totalClearedAmount / data.summary.totalOriginalAmount) * 100
            )}
            strokeColor="#52c41a"
            trailColor="#ff4d4f"
          />
          <div className="text-center text-gray-600 text-sm mt-1">
            Genel Aklama Oranı
          </div>
        </div>
      </Card>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={data.items}
        rowKey={(record) => `${record.unofficialInvoiceNumber}-${record.entryDate}`}
        loading={isLoading}
        scroll={{ x: 1400 }}
        pagination={{
          pageSize: 50,
          showSizeChanger: true,
          showTotal: (total) => `Toplam ${total} GR kaydı`
        }}
        rowClassName={(record) => {
          if (record.status === 'Waiting') return 'bg-orange-50';
          if (record.status === 'Partial') return 'bg-blue-50';
          if (record.status === 'Cleared') return 'bg-green-50';
          return '';
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
                    data.items.reduce((sum, item) => sum + item.originalAmount, 0),
                    'TRY'
                  )}
                </strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={6} align="right">
                <strong className="text-green-600">
                  {formatCurrency(
                    data.items.reduce((sum, item) => sum + item.clearedAmount, 0),
                    'TRY'
                  )}
                </strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={7} align="right">
                <strong className="text-red-600">
                  {formatCurrency(
                    data.items.reduce((sum, item) => sum + item.remainingAmount, 0),
                    'TRY'
                  )}
                </strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={8} colSpan={2}>
                <span className="text-gray-600">-</span>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          </Table.Summary>
        )}
      />
    </div>
  );
}
