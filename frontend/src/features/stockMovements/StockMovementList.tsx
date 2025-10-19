import React, { useState } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Input, 
  Select, 
  DatePicker,
  Space, 
  Tag,
  Row,
  Col,
  message,
  Statistic
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined,
  SyncOutlined,
  SwapOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

import { stockMovementsApi } from '@/api/stockMovements';
import { productsApi } from '@/api/products';
import type { StockMovement, StockMovementFilters } from '@/types/stockMovement';
import { 
  StockMovementType, 
  stockMovementTypeLabels, 
  stockMovementTypeColors 
} from '@/types/stockMovement';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { usePageTitle } from '@/hooks/usePageTitle';
import StockAdjustmentModal from './components/StockAdjustmentModal';
import StockTransferModal from './components/StockTransferModal';
import ManualMovementModal from './components/ManualMovementModal';

const { Search } = Input;
const { RangePicker } = DatePicker;

export default function StockMovementList() {
  usePageTitle('Stok Hareketleri');
  
  const [filters, setFilters] = useState<StockMovementFilters>({
    dateFrom: dayjs().subtract(30, 'days').format('YYYY-MM-DD'),
    dateTo: dayjs().format('YYYY-MM-DD')
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [adjustmentModalOpen, setAdjustmentModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [manualModalOpen, setManualModalOpen] = useState(false);

  // Fetch movements
  const { data, isLoading } = useQuery({
    queryKey: ['stockMovements', filters, page, pageSize],
    queryFn: () => stockMovementsApi.getAll({ ...filters, page, pageSize })
  });

  // Fetch products for filter
  const { data: products } = useQuery({
    queryKey: ['products-all'],
    queryFn: () => productsApi.getAll({ pageSize: 1000 })
  });

  // Table columns
  const columns: ColumnsType<StockMovement> = [
    {
      title: 'Hareket No',
      dataIndex: 'movementNumber',
      key: 'movementNumber',
      width: 130,
      fixed: 'left',
      render: (num: string) => (
        <span className="font-mono font-semibold">{num}</span>
      )
    },
    {
      title: 'Tarih',
      dataIndex: 'movementDate',
      key: 'movementDate',
      width: 110,
      render: (date: string) => formatDate(date),
      sorter: true
    },
    {
      title: 'Tip',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      align: 'center',
      render: (type: StockMovementType) => (
        <Tag 
          color={stockMovementTypeColors[type]}
          icon={
            type === StockMovementType.In ? <ArrowDownOutlined /> :
            type === StockMovementType.Out ? <ArrowUpOutlined /> :
            type === StockMovementType.Transfer ? <SwapOutlined /> :
            <SyncOutlined />
          }
        >
          {stockMovementTypeLabels[type]}
        </Tag>
      ),
      filters: [
        { text: 'Giriş', value: StockMovementType.In },
        { text: 'Çıkış', value: StockMovementType.Out },
        { text: 'Düzeltme', value: StockMovementType.Adjustment },
        { text: 'Transfer', value: StockMovementType.Transfer }
      ]
    },
    {
      title: 'Ürün',
      key: 'product',
      ellipsis: true,
      render: (_, record) => (
        <div>
          <div className="font-semibold">{record.product?.name}</div>
          <div className="text-xs text-gray-500">{record.product?.code}</div>
        </div>
      )
    },
    {
      title: 'Depo',
      key: 'warehouse',
      width: 150,
      ellipsis: true,
      render: (_, record) => (
        <div>
          <div>{record.warehouse?.name}</div>
          <div className="text-xs text-gray-500">{record.warehouse?.code}</div>
        </div>
      )
    },
    {
      title: 'Miktar',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 110,
      align: 'right',
      render: (qty: number, record) => (
        <span className={`font-semibold ${
          record.type === StockMovementType.In ? 'text-green-600' : 
          record.type === StockMovementType.Out ? 'text-red-600' : 
          'text-orange-600'
        }`}>
          {record.type === StockMovementType.In ? '+' : 
           record.type === StockMovementType.Out ? '-' : ''}
          {qty} {record.product?.unit}
        </span>
      )
    },
    {
      title: 'Birim Maliyet',
      dataIndex: 'unitCost',
      key: 'unitCost',
      width: 120,
      align: 'right',
      render: (cost: number) => formatCurrency(cost, 'TRY')
    },
    {
      title: 'Toplam Maliyet',
      dataIndex: 'totalCost',
      key: 'totalCost',
      width: 130,
      align: 'right',
      render: (cost: number) => (
        <span className="font-semibold">
          {formatCurrency(cost, 'TRY')}
        </span>
      )
    },
    {
      title: 'Bakiye',
      dataIndex: 'balanceAfter',
      key: 'balanceAfter',
      width: 100,
      align: 'right',
      render: (balance: number, record) => (
        <span className="font-semibold text-blue-600">
          {balance} {record.product?.unit}
        </span>
      )
    },
    {
      title: 'Referans',
      key: 'reference',
      width: 150,
      render: (_, record) => (
        record.referenceType && record.referenceNumber ? (
          <div>
            <div className="text-xs text-gray-500">{record.referenceType}</div>
            <div className="font-medium">{record.referenceNumber}</div>
          </div>
        ) : (
          <Tag>Manuel</Tag>
        )
      )
    },
    {
      title: 'Kullanıcı',
      key: 'user',
      width: 120,
      render: (_, record) => record.createdByUser?.name || '-'
    },
    {
      title: 'Oluşturma',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => formatDateTime(date)
    }
  ];

  // Calculate summary statistics
  const summary = React.useMemo(() => {
    if (!data?.items) return { totalIn: 0, totalOut: 0, totalValue: 0 };

    return data.items.reduce((acc, item) => {
      if (item.type === StockMovementType.In) {
        acc.totalIn += item.quantity;
        acc.totalValue += item.totalCost;
      } else if (item.type === StockMovementType.Out) {
        acc.totalOut += item.quantity;
      }
      return acc;
    }, { totalIn: 0, totalOut: 0, totalValue: 0 });
  }, [data]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Stok Hareketleri</h1>
            <p className="text-gray-600 mt-1">
              Tüm stok giriş/çıkış işlemlerinin detaylı takibi
            </p>
          </div>
          <Space>
            <Button
              icon={<SyncOutlined />}
              onClick={() => setAdjustmentModalOpen(true)}
            >
              Stok Düzeltme
            </Button>
            <Button
              icon={<SwapOutlined />}
              onClick={() => setTransferModalOpen(true)}
            >
              Depo Transferi
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setManualModalOpen(true)}
            >
              Manuel Hareket
            </Button>
          </Space>
        </div>
      </div>

      {/* Summary Cards */}
      <Row gutter={16} className="mb-4">
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Toplam Giriş"
              value={summary.totalIn}
              precision={2}
              valueStyle={{ color: '#52c41a' }}
              prefix={<ArrowDownOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Toplam Çıkış"
              value={summary.totalOut}
              precision={2}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<ArrowUpOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Toplam Değer"
              value={summary.totalValue}
              precision={2}
              suffix="₺"
              valueStyle={{ color: '#1890ff' }}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4">
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6}>
            <div className="mb-2 text-sm text-gray-600">Ürün</div>
            <Select
              className="w-full"
              placeholder="Tüm ürünler"
              allowClear
              showSearch
              optionFilterProp="label"
              value={filters.productId}
              onChange={(value) => setFilters({ ...filters, productId: value })}
              options={products?.items?.map(p => ({
                label: `${p.code} - ${p.name}`,
                value: p.id
              }))}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="mb-2 text-sm text-gray-600">Hareket Tipi</div>
            <Select
              className="w-full"
              placeholder="Tüm tipler"
              allowClear
              value={filters.type}
              onChange={(value) => setFilters({ ...filters, type: value })}
              options={[
                { label: 'Giriş', value: StockMovementType.In },
                { label: 'Çıkış', value: StockMovementType.Out },
                { label: 'Düzeltme', value: StockMovementType.Adjustment },
                { label: 'Transfer', value: StockMovementType.Transfer }
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div className="mb-2 text-sm text-gray-600">Tarih Aralığı</div>
            <RangePicker
              className="w-full"
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
              presets={[
                { label: 'Bugün', value: [dayjs(), dayjs()] },
                { label: 'Son 7 Gün', value: [dayjs().subtract(7, 'days'), dayjs()] },
                { label: 'Son 30 Gün', value: [dayjs().subtract(30, 'days'), dayjs()] },
                { label: 'Bu Ay', value: [dayjs().startOf('month'), dayjs().endOf('month')] }
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <div className="mb-2 text-sm text-gray-600">Ara</div>
            <Search
              placeholder="Hareket no, referans..."
              allowClear
              onSearch={(value) => setFilters({ ...filters, search: value })}
            />
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={data?.items || []}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 1800 }}
          pagination={{
            current: page,
            pageSize,
            total: data?.totalCount || 0,
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} hareket`,
            onChange: (page, pageSize) => {
              setPage(page);
              setPageSize(pageSize);
            }
          }}
        />
      </Card>

      {/* Modals */}
      <StockAdjustmentModal
        open={adjustmentModalOpen}
        onCancel={() => setAdjustmentModalOpen(false)}
        onSuccess={() => {
          setAdjustmentModalOpen(false);
          message.success('Stok düzeltmesi yapıldı');
        }}
      />

      <StockTransferModal
        open={transferModalOpen}
        onCancel={() => setTransferModalOpen(false)}
        onSuccess={() => {
          setTransferModalOpen(false);
          message.success('Depo transferi tamamlandı');
        }}
      />

      <ManualMovementModal
        open={manualModalOpen}
        onCancel={() => setManualModalOpen(false)}
        onSuccess={() => {
          setManualModalOpen(false);
          message.success('Manuel hareket eklendi');
        }}
      />
    </div>
  );
}

