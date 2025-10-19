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
  SendOutlined,
  CheckOutlined,
  CloseOutlined,
  FilePdfOutlined,
  SwapOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

import { quotationsApi } from '@/api/quotations';
import { partnersApi } from '@/api/partners';
import { PartnerType } from '@/types/partner';
import type { Quotation, QuotationFilters } from '@/types/quotation';
import { 
  QuotationStatus, 
  quotationStatusLabels, 
  quotationStatusColors 
} from '@/types/quotation';
import { formatCurrency, formatDate, downloadFile } from '@/lib/utils';
import { usePageTitle } from '@/hooks/usePageTitle';
import { showConfirm } from '@/components/ui/ConfirmModal';

const { Search } = Input;
const { RangePicker } = DatePicker;

export default function QuotationList() {
  usePageTitle('Teklifler');
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<QuotationFilters>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Fetch quotations
  const { data, isLoading } = useQuery({
    queryKey: ['quotations', filters, page, pageSize],
    queryFn: () => quotationsApi.getAll({ ...filters, page, pageSize })
  });

  // Fetch customers for filter (Partners with type Customer or Both)
  const { data: customersResponse } = useQuery({
    queryKey: ['customers-all'],
    queryFn: () => partnersApi.getAll({ type: PartnerType.Customer, pageSize: 1000 })
  });

  const customers = customersResponse?.data;

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => quotationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      message.success('Teklif silindi');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Silme başarısız');
    }
  });

  // Send mutation
  const sendMutation = useMutation({
    mutationFn: ({ id, email }: { id: string; email?: string }) => 
      quotationsApi.send(id, email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      message.success('Teklif müşteriye gönderildi');
    }
  });

  // Accept mutation
  const acceptMutation = useMutation({
    mutationFn: (id: string) => quotationsApi.accept(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      message.success('Teklif kabul edildi');
    }
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => 
      quotationsApi.reject(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      message.success('Teklif reddedildi');
    }
  });

  // Convert to order mutation
  const convertMutation = useMutation({
    mutationFn: (id: string) => quotationsApi.convertToOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      message.success('Satış siparişi oluşturuldu');
    }
  });

  // Export PDF mutation
  const exportMutation = useMutation({
    mutationFn: (id: string) => quotationsApi.exportPdf(id),
    onSuccess: (blob: any, id: string) => {
      downloadFile(blob as Blob, `Quotation-${id}.pdf`);
      message.success('PDF indirildi');
    }
  });

  // Table columns
  const columns: ColumnsType<Quotation> = [
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      align: 'center',
      render: (status: QuotationStatus, record) => {
        const isExpired = dayjs(record.validUntil).isBefore(dayjs()) && 
                         status !== QuotationStatus.Accepted &&
                         status !== QuotationStatus.Rejected;
        
        return (
          <Space direction="vertical" size={2}>
            <Tag color={quotationStatusColors[status]}>
              {quotationStatusLabels[status]}
            </Tag>
            {isExpired && (
              <Tag color="orange">Süresi Doldu</Tag>
            )}
            {record.isConvertedToOrder && (
              <Tag color="purple">Siparişe Dönüştü</Tag>
            )}
          </Space>
        );
      },
      filters: [
        { text: 'Taslak', value: QuotationStatus.Draft },
        { text: 'Gönderildi', value: QuotationStatus.Sent },
        { text: 'Kabul Edildi', value: QuotationStatus.Accepted },
        { text: 'Reddedildi', value: QuotationStatus.Rejected }
      ]
    },
    {
      title: 'Teklif No',
      dataIndex: 'quotationNumber',
      key: 'quotationNumber',
      width: 130,
      fixed: 'left',
      render: (num: string) => (
        <span className="font-mono font-semibold">{num}</span>
      )
    },
    {
      title: 'Teklif Tarihi',
      dataIndex: 'quotationDate',
      key: 'quotationDate',
      width: 120,
      render: (date: string) => formatDate(date),
      sorter: true
    },
    {
      title: 'Geçerlilik',
      dataIndex: 'validUntil',
      key: 'validUntil',
      width: 120,
      render: (date: string) => {
        const isExpired = dayjs(date).isBefore(dayjs());
        return (
          <span className={isExpired ? 'text-red-600' : ''}>
            {formatDate(date)}
          </span>
        );
      }
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
      title: 'Oluşturan',
      key: 'user',
      width: 120,
      render: (_, record) => record.createdByUser?.name || '-'
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 300,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/quotations/${record.id}`)}
          >
            Detay
          </Button>
          {record.status === QuotationStatus.Draft && (
            <>
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={() => navigate(`/quotations/edit/${record.id}`)}
              />
              <Button
                size="small"
                type="primary"
                icon={<SendOutlined />}
                onClick={() => sendMutation.mutate({ id: record.id })}
              >
                Gönder
              </Button>
            </>
          )}
          {record.status === QuotationStatus.Sent && (
            <>
              <Button
                size="small"
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => acceptMutation.mutate(record.id)}
              >
                Kabul Et
              </Button>
              <Button
                size="small"
                danger
                icon={<CloseOutlined />}
                onClick={() => handleReject(record)}
              >
                Reddet
              </Button>
            </>
          )}
          {record.status === QuotationStatus.Accepted && !record.isConvertedToOrder && (
            <Button
              size="small"
              type="primary"
              icon={<SwapOutlined />}
              onClick={() => convertMutation.mutate(record.id)}
            >
              Siparişe Dönüştür
            </Button>
          )}
          <Button
            size="small"
            icon={<FilePdfOutlined />}
            onClick={() => exportMutation.mutate(record.id)}
            loading={exportMutation.isPending}
          />
          {record.status === QuotationStatus.Draft && (
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

  const handleReject = (quotation: Quotation) => {
    const reason = prompt('Red nedeni:');
    if (reason) {
      rejectMutation.mutate({ id: quotation.id, reason });
    }
  };

  const handleDelete = (quotation: Quotation) => {
    showConfirm({
      title: 'Teklifi Sil',
      content: `${quotation.quotationNumber} teklifini silmek istediğinize emin misiniz?`,
      okType: 'danger',
      onOk: async () => {
        await deleteMutation.mutateAsync(quotation.id);
      }
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Teklifler</h1>
            <p className="text-gray-600 mt-1">
              Müşterilere sunulan fiyat teklifleri
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => navigate('/quotations/new')}
          >
            Yeni Teklif
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
                { label: 'Taslak', value: QuotationStatus.Draft },
                { label: 'Gönderildi', value: QuotationStatus.Sent },
                { label: 'Kabul Edildi', value: QuotationStatus.Accepted },
                { label: 'Reddedildi', value: QuotationStatus.Rejected }
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
              placeholder="Teklif no, not..."
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
            showTotal: (total) => `Toplam ${total} teklif`,
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

