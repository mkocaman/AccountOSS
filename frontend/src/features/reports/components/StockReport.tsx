import React from 'react';
import { Table, Tag, Statistic, Row, Col, Card, Empty } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useQuery } from '@tanstack/react-query';

import { reportsApi } from '@/api/reports';
import type { StockReportItem, ReportFilters } from '@/types/report';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Props {
  filters: ReportFilters;
}

export default function StockReport({ filters }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['stockReport', filters],
    queryFn: () => reportsApi.getStockReport(filters)
  });

  const columns: ColumnsType<StockReportItem> = [
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
      width: 120,
      align: 'center',
      render: (stock: number, record) => (
        <div>
          <div className="font-semibold">{stock} {record.unit}</div>
          <div className="text-xs text-gray-500">
            Min: {record.minStockLevel} {record.unit}
          </div>
        </div>
      ),
      sorter: (a, b) => a.currentStock - b.currentStock
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status: string) => {
        const colors = {
          'Normal': 'green',
          'Low': 'orange',
          'OutOfStock': 'red'
        };
        const labels = {
          'Normal': 'Normal',
          'Low': 'Düşük',
          'OutOfStock': 'Tükendi'
        };
        return (
          <Tag color={colors[status as keyof typeof colors]}>
            {labels[status as keyof typeof labels]}
          </Tag>
        );
      },
      filters: [
        { text: 'Normal', value: 'Normal' },
        { text: 'Düşük', value: 'Low' },
        { text: 'Tükendi', value: 'OutOfStock' }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'Ortalama Maliyet',
      dataIndex: 'averageCost',
      key: 'averageCost',
      width: 130,
      align: 'right',
      render: (cost: number) => formatCurrency(cost, 'TRY')
    },
    {
      title: 'Toplam Değer',
      dataIndex: 'totalValue',
      key: 'totalValue',
      width: 130,
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
      render: (date: string) => date ? formatDate(date) : '-'
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
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tükenen Ürün"
              value={data.summary.outOfStockCount}
              precision={0}
              valueStyle={{ color: '#ff4d4f' }}
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
              valueStyle={{ color: '#1890ff' }}
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
        scroll={{ x: 1200 }}
        pagination={{
          pageSize: 50,
          showSizeChanger: true,
          showTotal: (total) => `Toplam ${total} ürün`
        }}
        summary={() => (
          <Table.Summary fixed>
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={6}>
                <strong>TOPLAM</strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={6} align="right">
                <strong>
                  {formatCurrency(
                    data.items.reduce((sum, item) => sum + item.totalValue, 0),
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
