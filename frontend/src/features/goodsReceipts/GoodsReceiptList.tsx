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
  message
} from 'antd';
import { 
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  FilePdfOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

import { goodsReceiptsApi } from '@/api/goodsReceipts';
import type { GoodsReceipt, GoodsReceiptFilters } from '@/types/goodsReceipt';
import { 
  GoodsReceiptStatus, 
  goodsReceiptStatusLabels, 
  goodsReceiptStatusColors 
} from '@/types/goodsReceipt';
import { formatDate, formatDateTime, downloadFile } from '@/lib/utils';
import { usePageTitle } from '@/hooks/usePageTitle';
import { showConfirm } from '@/components/ui/ConfirmModal';

const { Search } = Input;
const { RangePicker } = DatePicker;

export default function GoodsReceiptList() {
  usePageTitle('Mal Kabul');
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<GoodsReceiptFilters>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Fetch goods receipts
  const { data, isLoading } = useQuery({
    queryKey: ['goodsReceipts', filters, page, pageSize],
    queryFn: () => goodsReceiptsApi.getAll({ ...filters, page, pageSize })
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => goodsReceiptsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goodsReceipts'] });
      message.success('Mal kabul silindi');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Silme başarısız');
    }
  });

  // Complete mutation
  const completeMutation = useMutation({
    mutationFn: (id: string) => goodsReceiptsApi.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goodsReceipts'] });
      message.success('Mal kabul tamamlandı');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Tamamlama başarısız');
    }
  });

  // Cancel mutation
  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => 
      goodsReceiptsApi.cancel(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goodsReceipts'] });
      message.success('Mal kabul iptal edildi');
    }
  });

  // Export PDF mutation
  const exportMutation = useMutation({
    mutationFn: (id: string) => goodsReceiptsApi.exportPdf(id),
    onSuccess: (blob: any, id: string) => {
      downloadFile(blob as Blob, `GR-${id}.pdf`);
      message.success('PDF indirildi');
    }
  });

  // Table columns
  const columns: ColumnsType<GoodsReceipt> = [
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      align: 'center',
      render: (status: GoodsReceiptStatus, record) => (
        <Space direction="vertical" size={2}>
          <Tag color={goodsReceiptStatusColors[status]}>
            {goodsReceiptStatusLabels[status]}
          </Tag>
          {record.isInvoiceCreated && (
            <Tag color="blue" icon={<FileTextOutlined />}>
              Faturalandı
            </Tag>
          )}
        </Space>
      ),
      filters: [
        { text: 'Taslak', value: GoodsReceiptStatus.Draft },
        { text: 'Tamamlandı', value: GoodsReceiptStatus.Completed },
        { text: 'İptal', value: GoodsReceiptStatus.Cancelled }
      ]
    },
    {
      title: 'Mal Kabul No',
      dataIndex: 'receiptNumber',
      key: 'receiptNumber',
      width: 130,
      fixed: 'left',
      render: (num: string) => (
        <span className="font-mono font-semibold">{num}</span>
      )
    },
    {
      title: 'Kabul Tarihi',
      dataIndex: 'receiptDate',
      key: 'receiptDate',
      width: 120,
      render: (date: string) => formatDate(date),
      sorter: true
    },
    {
      title: 'Sipariş No',
      key: 'purchaseOrder',
      width: 130,
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          onClick={() => navigate(`/purchase-orders/${record.purchaseOrderId}`)}
        >
          {record.purchaseOrder?.orderNumber}
        </Button>
      )
    },
    {
      title: 'Tedarikçi',
      key: 'supplier',
      ellipsis: true,
      render: (_, record) => (
        <div>
          <div className="font-semibold">{record.purchaseOrder?.supplier?.name}</div>
          <div className="text-xs text-gray-500">{record.purchaseOrder?.supplier?.code}</div>
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
      title: 'Teslim Alınan',
      key: 'totalReceived',
      width: 120,
      align: 'center',
      render: (_, record) => {
        const total = record.items.reduce((sum, item) => sum + item.receivedQuantity, 0);
        return (
          <span className="font-semibold text-green-600">
            {total.toFixed(2)}
          </span>
        );
      }
    },
    {
      title: 'Kalite Onayı',
      key: 'quality',
      width: 120,
      align: 'center',
      render: (_, record) => {
        const approved = record.items.filter(item => item.isQualityApproved).length;
        const total = record.items.length;
        return (
          <Tag color={approved === total ? 'green' : 'orange'}>
            {approved}/{total}
          </Tag>
        );
      }
    },
    {
      title: 'Oluşturan',
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
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 280,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/goods-receipts/${record.id}`)}
          >
            Detay
          </Button>
          {record.status === GoodsReceiptStatus.Draft && (
            <>
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={() => navigate(`/goods-receipts/edit/${record.id}`)}
              />
              <Button
                size="small"
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => completeMutation.mutate(record.id)}
              >
                Tamamla
              </Button>
            </>
          )}
          {record.status === GoodsReceiptStatus.Completed && !record.isInvoiceCreated && (
            <Button
              size="small"
              type="primary"
              icon={<FileTextOutlined />}
              onClick={() => navigate(`/goods-receipts/${record.id}/create-invoice`)}
            >
              Fatura Kes
            </Button>
          )}
          <Button
            size="small"
            icon={<FilePdfOutlined />}
            onClick={() => exportMutation.mutate(record.id)}
            loading={exportMutation.isPending}
          />
          {record.status === GoodsReceiptStatus.Draft && (
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

  const handleDelete = (receipt: GoodsReceipt) => {
    showConfirm({
      title: 'Mal Kabulü Sil',
      content: `${receipt.receiptNumber} mal kabulünü silmek istediğinize emin misiniz?`,
      okType: 'danger',
      onOk: async () => {
        await deleteMutation.mutateAsync(receipt.id);
      }
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mal Kabul</h1>
            <p className="text-gray-600 mt-1">
              Satın alınan malların teslim alınması ve stok girişi
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => navigate('/goods-receipts/new')}
          >
            Yeni Mal Kabul
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6}>
            <div className="mb-2 text-sm text-gray-600">Durum</div>
            <Select
              className="w-full"
              placeholder="Tüm durumlar"
              allowClear
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
              options={[
                { label: 'Taslak', value: GoodsReceiptStatus.Draft },
                { label: 'Tamamlandı', value: GoodsReceiptStatus.Completed },
                { label: 'İptal', value: GoodsReceiptStatus.Cancelled }
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
                { label: 'Son 3 Ay', value: [dayjs().subtract(3, 'months'), dayjs()] }
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="mb-2 text-sm text-gray-600">Ara</div>
            <Search
              placeholder="Mal kabul no, sipariş no..."
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
            showTotal: (total) => `Toplam ${total} mal kabul`,
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

