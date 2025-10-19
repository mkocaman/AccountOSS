import React from 'react';
import { Table, Tag, Statistic, Row, Col, Card, Empty, Alert } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useQuery } from '@tanstack/react-query';
import { WarningOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

import { reportsApi } from '@/api/reports';
import type { StockReportItem, ReportFilters } from '@/types/report';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Props {
  filters?: ReportFilters;
}

export default function StockReport({ filters }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['stockReport', filters],
    queryFn: () => reportsApi.getStockReport(filters)
  });

  const getStatusConfig = (status: string) => {
    const configs = {
      'Normal': { color: 'green', icon: <CheckCircleOutlined />, text: 'Normal' },
      'Low': { color: 'orange', icon: <WarningOutlined />, text: 'Düşük' },
      'OutOfStock': { color: 'red', icon: <CloseCircleOutlined />, text: 'Tükendi' }
    };
    return configs[status as keyof typeof configs] || configs['Normal'];
  };

  const columns: ColumnsType<StockReportItem> = [
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 100,
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
        { text: 'Normal', value: 'Normal' },
        { text: 'Düşük', value: 'Low' },
        { text: 'Tükendi', value: 'OutOfStock' }
      ],
      onFilter: (value, record) => record.status === value,
      defaultFilteredValue: []
    },
    {
      title: 'Ürün Kodu',
      dataIndex: 'productCode',
      key: 'productCode',
      width: 120,
      fixed: 'left'
    },
    {
      title: 'Ürün Adı',
      dataIndex: 'productName',
      key: 'productName',
      ellipsis: true,
      render: (name: string, record) => (
        <div>
          <div className="font-semibold">{name}</div>
          {record.category && (
            <div className="text-gray-500 text-xs">{record.category}</div>
          )}
        </div>
      )
    },
    {
      title: 'Mevcut Stok',
      dataIndex: 'currentStock',
      key: 'currentStock',
      width: 130,
      align: 'right',
      render: (stock: number, record) => (
        <span className={
          record.status === 'OutOfStock' ? 'text-red-600 font-semibold' :
          record.status === 'Low' ? 'text-orange-600 font-semibold' :
          'text-green-600 font-semibold'
        }>
          {stock.toFixed(2)} {record.unit}
        </span>
      ),
      sorter: (a, b) => a.currentStock - b.currentStock
    },
    {
      title: 'Min. Seviye',
      dataIndex: 'minStockLevel',
      key: 'minStockLevel',
      width: 120,
      align: 'right',
      render: (level: number, record) => (
        <span className="text-gray-600">
          {level.toFixed(2)} {record.unit}
        </span>
      )
    },
    {
      title: 'Fark',
      key: 'difference',
      width: 120,
      align: 'right',
      render: (_, record) => {
        const diff = record.currentStock - record.minStockLevel;
        return (
          <span className={diff < 0 ? 'text-red-600' : 'text-green-600'}>
            {diff > 0 ? '+' : ''}{diff.toFixed(2)} {record.unit}
          </span>
        );
      },
      sorter: (a, b) => 
        (a.currentStock - a.minStockLevel) - (b.currentStock - b.minStockLevel)
    },
    {
      title: 'Ortalama Maliyet',
      dataIndex: 'averageCost',
      key: 'averageCost',
      width: 140,
      align: 'right',
      render: (cost: number) => formatCurrency(cost, 'TRY')
    },
    {
      title: 'Toplam Değer',
      dataIndex: 'totalValue',
      key: 'totalValue',
      width: 150,
      align: 'right',
      render: (value: number) => (
        <span className="font-semibold">
          {formatCurrency(value, 'TRY')}
        </span>
      ),
      sorter: (a, b) => a.totalValue - b.totalValue,
      fixed: 'right'
    },
    {
      title: 'Son Hareket',
      dataIndex: 'lastMovementDate',
      key: 'lastMovementDate',
      width: 120,
      render: (date?: string) => 
        date ? formatDate(date) : <span className="text-gray-400">-</span>,
      sorter: (a, b) => {
        if (!a.lastMovementDate) return 1;
        if (!b.lastMovementDate) return -1;
        return new Date(a.lastMovementDate).getTime() - new Date(b.lastMovementDate).getTime();
      }
    }
  ];

  if (!data || data.items.length === 0) {
    return <Empty description="Stok raporu verisi bulunamadı" />;
  }

  const lowStockItems = data.items.filter(item => item.status === 'Low');
  const outOfStockItems = data.items.filter(item => item.status === 'OutOfStock');

  return (
    <div>
      {/* Alerts */}
      {outOfStockItems.length > 0 && (
        <Alert
          message="Stok Tükendi Uyarısı"
          description={`${outOfStockItems.length} ürünün stoğu tükendi. Acil sipariş verin!`}
          type="error"
          icon={<CloseCircleOutlined />}
          showIcon
          closable
          className="mb-4"
        />
      )}
      {lowStockItems.length > 0 && (
        <Alert
          message="Düşük Stok Uyarısı"
          description={`${lowStockItems.length} ürünün stoğu minimum seviyenin altında.`}
          type="warning"
          icon={<WarningOutlined />}
          showIcon
          closable
          className="mb-4"
        />
      )}

      {/* Summary Cards */}
      <Row gutter={16} className="mb-4">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Toplam Ürün"
              value={data.summary.totalProducts}
              precision={0}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Düşük Stok"
              value={data.summary.lowStockCount}
              precision={0}
              valueStyle={{ color: '#faad14' }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Stok Tükendi"
              value={data.summary.outOfStockCount}
              precision={0}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Toplam Stok Değeri"
              value={data.summary.totalStockValue}
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
        rowKey="productCode"
        loading={isLoading}
        scroll={{ x: 1400 }}
        pagination={{
          pageSize: 50,
          showSizeChanger: true,
          showTotal: (total) => `Toplam ${total} ürün`
        }}
        rowClassName={(record) => {
          if (record.status === 'OutOfStock') return 'bg-red-50';
          if (record.status === 'Low') return 'bg-orange-50';
          return '';
        }}
        summary={() => (
          <Table.Summary fixed>
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={6}>
                <strong>TOPLAM</strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={6} align="right">
                <span className="text-gray-600">-</span>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={7} align="right">
                <strong>
                  {formatCurrency(
                    data.items.reduce((sum, item) => sum + item.totalValue, 0),
                    'TRY'
                  )}
                </strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={8}>
                <span className="text-gray-600">-</span>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          </Table.Summary>
        )}
      />
    </div>
  );
}
