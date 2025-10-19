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
  FilePdfOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

import { purchaseOrdersApi } from '@/api/purchaseOrders';
import { partnersApi } from '@/api/partners';
import { PartnerType } from '@/types/partner';
import type { PurchaseOrder, PurchaseOrderFilters } from '@/types/purchaseOrder';
import { 
  PurchaseOrderStatus, 
  purchaseOrderStatusLabels, 
  purchaseOrderStatusColors 
} from '@/types/purchaseOrder';
import { formatCurrency, formatDate, downloadFile } from '@/lib/utils';
import { usePageTitle } from '@/hooks/usePageTitle';
import { showConfirm } from '@/components/ui/ConfirmModal';

const { Search } = Input;
const { RangePicker } = DatePicker;

export default function PurchaseOrderList() {
  usePageTitle('Satın Alma Siparişleri');
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<PurchaseOrderFilters>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Fetch purchase orders
  const { data, isLoading } = useQuery({
    queryKey: ['purchaseOrders', filters, page, pageSize],
    queryFn: () => purchaseOrdersApi.getAll({ ...filters, page, pageSize })
  });

  // Fetch suppliers for filter (Partners with type Supplier or Both)
  const { data: suppliersResponse } = useQuery({
    queryKey: ['suppliers-all'],
    queryFn: () => partnersApi.getAll({ type: PartnerType.Supplier, pageSize: 1000 })
  });

  const suppliers = suppliersResponse?.data;

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => purchaseOrdersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
      message.success('Sipariş silindi');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Silme başarısız');
    }
  });

  // Confirm mutation
  const confirmMutation = useMutation({
    mutationFn: (id: string) => purchaseOrdersApi.confirm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
      message.success('Sipariş onaylandı');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Onaylama başarısız');
    }
  });

  // Cancel mutation
  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => 
      purchaseOrdersApi.cancel(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
      message.success('Sipariş iptal edildi');
    }
  });

  // Export PDF mutation
  const exportMutation = useMutation({
    mutationFn: (id: string) => purchaseOrdersApi.exportPdf(id),
    onSuccess: (blob: any, id: string) => {
      downloadFile(blob as Blob, `PO-${id}.pdf`);
      message.success('PDF indirildi');
    }
  });

  // Table columns
  const columns: ColumnsType<PurchaseOrder> = [
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      align: 'center',
      render: (status: PurchaseOrderStatus) => (
        <Tag color={purchaseOrderStatusColors[status]}>
          {purchaseOrderStatusLabels[status]}
        </Tag>
      ),
      filters: [
        { text: 'Taslak', value: PurchaseOrderStatus.Draft },
        { text: 'Onaylandı', value: PurchaseOrderStatus.Confirmed },
        { text: 'Kısmi Teslim', value: PurchaseOrderStatus.PartiallyReceived },
        { text: 'Tamamlandı', value: PurchaseOrderStatus.Completed },
        { text: 'İptal', value: PurchaseOrderStatus.Cancelled }
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
      title: 'Tedarikçi',
      key: 'supplier',
      ellipsis: true,
      render: (_, record) => (
        <div>
          <div className="font-semibold">{record.supplier?.name}</div>
          <div className="text-xs text-gray-500">{record.supplier?.code}</div>
        </div>
      )
    },
    {
      title: 'Depo',
      key: 'warehouse',
      width: 150,
      ellipsis: true,
      render: (_, record) => record.warehouse?.name || '-'
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
      title: 'Teslim Durumu',
      key: 'received',
      width: 150,
      align: 'center',
      render: (_, record) => {
        const total = record.items.reduce((sum, item) => sum + item.orderedQuantity, 0);
        const received = record.receivedQuantity || 0;
        const percent = total > 0 ? Math.round((received / total) * 100) : 0;
        
        return (
          <div>
            <Progress 
              percent={percent} 
              size="small"
              status={record.isFullyReceived ? 'success' : 'active'}
            />
            <div className="text-xs text-gray-500 mt-1">
              {received}/{total}
            </div>
          </div>
        );
      }
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 250,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/purchase-orders/${record.id}`)}
          >
            Detay
          </Button>
          {record.status === PurchaseOrderStatus.Draft && (
            <>
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={() => navigate(`/purchase-orders/edit/${record.id}`)}
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
          {(record.status === PurchaseOrderStatus.Confirmed || 
            record.status === PurchaseOrderStatus.PartiallyReceived) && (
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
          {record.status === PurchaseOrderStatus.Draft && (
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

  const handleCancel = (order: PurchaseOrder) => {
    const reason = prompt('İptal nedeni:');
    if (reason) {
      cancelMutation.mutate({ id: order.id, reason });
    }
  };

  const handleDelete = (order: PurchaseOrder) => {
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
            <h1 className="text-2xl font-bold text-gray-900">Satın Alma Siparişleri</h1>
            <p className="text-gray-600 mt-1">
              Tedarikçilerden mal/hizmet siparişleri
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => navigate('/purchase-orders/new')}
          >
            Yeni Sipariş
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6}>
            <div className="mb-2 text-sm text-gray-600">Tedarikçi</div>
            <Select
              className="w-full"
              placeholder="Tüm tedarikçiler"
              allowClear
              showSearch
              optionFilterProp="label"
              value={filters.supplierId}
              onChange={(value) => setFilters({ ...filters, supplierId: value })}
              options={suppliers?.items?.map((s: any) => ({
                label: `${s.code} - ${s.name}`,
                value: s.id
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
                { label: 'Taslak', value: PurchaseOrderStatus.Draft },
                { label: 'Onaylandı', value: PurchaseOrderStatus.Confirmed },
                { label: 'Kısmi Teslim', value: PurchaseOrderStatus.PartiallyReceived },
                { label: 'Tamamlandı', value: PurchaseOrderStatus.Completed },
                { label: 'İptal', value: PurchaseOrderStatus.Cancelled }
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
          scroll={{ x: 1600 }}
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

