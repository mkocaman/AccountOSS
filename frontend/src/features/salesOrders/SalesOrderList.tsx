import { useState } from 'react';
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
  Progress
} from 'antd';
import { 
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
  FilePdfOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

import { salesOrdersApi } from '@/api/salesOrders';
import { partnersApi } from '@/api/partners';
import { PartnerType } from '@/types/partner';
import type { SalesOrder, SalesOrderFilters } from '@/types/salesOrder';
import { 
  SalesOrderStatus, 
  salesOrderStatusLabels, 
  salesOrderStatusColors 
} from '@/types/salesOrder';
import { formatCurrency, formatDate, downloadFile } from '@/lib/utils';
import { usePageTitle } from '@/hooks/usePageTitle';
import { showConfirm } from '@/components/ui/ConfirmModal';

const { Search } = Input;
const { RangePicker } = DatePicker;

export default function SalesOrderList() {
  usePageTitle('Satış Siparişleri');
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<SalesOrderFilters>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Fetch sales orders
  const { data, isLoading } = useQuery({
    queryKey: ['salesOrders', filters, page, pageSize],
    queryFn: () => salesOrdersApi.getAll({ ...filters, page, pageSize })
  });

  // Fetch customers for filter (Partners with type Customer or Both)
  const { data: customersResponse } = useQuery({
    queryKey: ['customers-all'],
    queryFn: () => partnersApi.getAll({ type: PartnerType.Customer, pageSize: 1000 })
  });

  const customers = customersResponse?.data;

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => salesOrdersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salesOrders'] });
      message.success('Sipariş silindi');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Silme başarısız');
    }
  });

  // Confirm mutation
  const confirmMutation = useMutation({
    mutationFn: (id: string) => salesOrdersApi.confirm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salesOrders'] });
      message.success('Sipariş onaylandı');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Onaylama başarısız');
    }
  });

  // Cancel mutation
  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => 
      salesOrdersApi.cancel(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salesOrders'] });
      message.success('Sipariş iptal edildi');
    }
  });

  // Export PDF mutation
  const exportMutation = useMutation({
    mutationFn: (id: string) => salesOrdersApi.exportPdf(id),
    onSuccess: (blob: any, id: string) => {
      downloadFile(blob as Blob, `SO-${id}.pdf`);
      message.success('PDF indirildi');
    }
  });

  // Table columns
  const columns: ColumnsType<SalesOrder> = [
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      align: 'center',
      render: (status: SalesOrderStatus, record) => (
        <Space direction="vertical" size={2}>
          <Tag color={salesOrderStatusColors[status]}>
            {salesOrderStatusLabels[status]}
          </Tag>
          {record.isInvoiced && (
            <Tag color="purple" icon={<FileTextOutlined />}>
              Faturalandı
            </Tag>
          )}
        </Space>
      ),
      filters: [
        { text: 'Taslak', value: SalesOrderStatus.Draft },
        { text: 'Onaylandı', value: SalesOrderStatus.Confirmed },
        { text: 'Kısmi Teslimat', value: SalesOrderStatus.PartiallyDelivered },
        { text: 'Tamamlandı', value: SalesOrderStatus.Completed },
        { text: 'İptal', value: SalesOrderStatus.Cancelled }
      ]
    },
    {
      title: 'Sipariş No',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 130,
      fixed: 'left',
      render: (num: string) => (
        <span className="font-mono font-semibold">{num}</span>
      )
    },
    {
      title: 'Sipariş Tarihi',
      dataIndex: 'orderDate',
      key: 'orderDate',
      width: 120,
      render: (date: string) => formatDate(date),
      sorter: true
    },
    {
      title: 'Teslim Tarihi',
      dataIndex: 'deliveryDate',
      key: 'deliveryDate',
      width: 120,
      render: (date?: string) => date ? formatDate(date) : '-'
    },
    {
      title: 'Müşteri',
      key: 'customer',
      ellipsis: true,
      render: (_, record) => (
        <div>
          <div className="font-semibold">{record.customer?.name}</div>
          <div className="text-xs text-gray-500">{record.customer?.code}</div>
        </div>
      )
    },
    {
      title: 'Teklif No',
      key: 'quotation',
      width: 130,
      render: (_, record) => (
        record.quotationId && record.quotation ? (
          <Button
            type="link"
            size="small"
            onClick={() => navigate(`/quotations/${record.quotationId}`)}
          >
            {record.quotation.quotationNumber}
          </Button>
        ) : (
          <Tag>Manuel</Tag>
        )
      )
    },
    {
      title: 'Toplam Tutar',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 130,
      align: 'right',
      render: (amount: number, record) => (
        <span className="font-semibold">
          {formatCurrency(amount, record.currency)}
        </span>
      ),
      sorter: true
    },
    {
      title: 'Teslimat Durumu',
      key: 'delivered',
      width: 150,
      align: 'center',
      render: (_, record) => {
        const total = record.items.reduce((sum, item) => sum + item.orderedQuantity, 0);
        const delivered = record.deliveredQuantity || 0;
        const percent = total > 0 ? Math.round((delivered / total) * 100) : 0;
        
        return (
          <div>
            <Progress 
              percent={percent} 
              size="small"
              status={record.isFullyDelivered ? 'success' : 'active'}
            />
            <div className="text-xs text-gray-500 mt-1">
              {delivered}/{total}
            </div>
          </div>
        );
      }
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 280,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/sales-orders/${record.id}`)}
          >
            Detay
          </Button>
          {record.status === SalesOrderStatus.Draft && (
            <>
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={() => navigate(`/sales-orders/edit/${record.id}`)}
              />
              <Button
                size="small"
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => confirmMutation.mutate(record.id)}
              >
                Onayla
              </Button>
            </>
          )}
          {(record.status === SalesOrderStatus.Confirmed || 
            record.status === SalesOrderStatus.PartiallyDelivered) && !record.isInvoiced && (
            <Button
              size="small"
              type="primary"
              icon={<FileTextOutlined />}
              onClick={() => navigate(`/sales-orders/${record.id}/create-invoice`)}
            >
              Fatura Kes
            </Button>
          )}
          {(record.status === SalesOrderStatus.Confirmed || 
            record.status === SalesOrderStatus.PartiallyDelivered) && (
            <Button
              size="small"
              danger
              icon={<CloseOutlined />}
              onClick={() => handleCancel(record)}
            >
              İptal
            </Button>
          )}
          <Button
            size="small"
            icon={<FilePdfOutlined />}
            onClick={() => exportMutation.mutate(record.id)}
            loading={exportMutation.isPending}
          />
          {record.status === SalesOrderStatus.Draft && (
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            />
          )}
        </Space>
      )
    }
  ];

  const handleCancel = (order: SalesOrder) => {
    const reason = prompt('İptal nedeni:');
    if (reason) {
      cancelMutation.mutate({ id: order.id, reason });
    }
  };

  const handleDelete = (order: SalesOrder) => {
    showConfirm({
      title: 'Siparişi Sil',
      content: `${order.orderNumber} siparişini silmek istediğinize emin misiniz?`,
      okType: 'danger',
      onOk: async () => {
        await deleteMutation.mutateAsync(order.id);
      }
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Satış Siparişleri</h1>
            <p className="text-gray-600 mt-1">
              Müşterilerden alınan satış siparişleri
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => navigate('/sales-orders/new')}
          >
            Yeni Sipariş
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6}>
            <div className="mb-2 text-sm text-gray-600">Müşteri</div>
            <Select
              className="w-full"
              placeholder="Tüm müşteriler"
              allowClear
              showSearch
              optionFilterProp="label"
              value={filters.customerId}
              onChange={(value) => setFilters({ ...filters, customerId: value })}
              options={customers?.items?.map((c: any) => ({
                label: `${c.code} - ${c.name}`,
                value: c.id
              }))}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <div className="mb-2 text-sm text-gray-600">Durum</div>
            <Select
              className="w-full"
              placeholder="Tüm durumlar"
              allowClear
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
              options={[
                { label: 'Taslak', value: SalesOrderStatus.Draft },
                { label: 'Onaylandı', value: SalesOrderStatus.Confirmed },
                { label: 'Kısmi Teslimat', value: SalesOrderStatus.PartiallyDelivered },
                { label: 'Tamamlandı', value: SalesOrderStatus.Completed },
                { label: 'İptal', value: SalesOrderStatus.Cancelled }
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
                { label: 'Bu Ay', value: [dayjs().startOf('month'), dayjs().endOf('month')] },
                { label: 'Son 3 Ay', value: [dayjs().subtract(3, 'months'), dayjs()] },
                { label: 'Bu Yıl', value: [dayjs().startOf('year'), dayjs().endOf('year')] }
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="mb-2 text-sm text-gray-600">Ara</div>
            <Search
              placeholder="Sipariş no, not..."
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
          scroll={{ x: 1700 }}
          pagination={{
            current: page,
            pageSize,
            total: data?.totalCount || 0,
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} sipariş`,
            onChange: (page, pageSize) => {
              setPage(page);
              setPageSize(pageSize);
            }
          }}
        />
      </Card>
    </div>
  );
}

