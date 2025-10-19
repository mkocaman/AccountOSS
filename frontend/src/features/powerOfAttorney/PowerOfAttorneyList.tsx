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
  Badge
} from 'antd';
import { 
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  FilePdfOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

import { powerOfAttorneyApi } from '@/api/powerOfAttorney';
import { partnersApi } from '@/api/partners';
import { PartnerType } from '@/types/partner';
import type { PowerOfAttorney, PoaFilters } from '@/types/powerOfAttorney';
import { 
  PoaStatus, 
  poaStatusLabels, 
  poaStatusColors 
} from '@/types/powerOfAttorney';
import { formatDate, downloadFile } from '@/lib/utils';
import { usePageTitle } from '@/hooks/usePageTitle';
import { showConfirm } from '@/components/ui/ConfirmModal';

const { Search } = Input;
const { RangePicker } = DatePicker;

export default function PowerOfAttorneyList() {
  usePageTitle('Vekalet Belgeleri');
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<PoaFilters>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Fetch POAs
  const { data, isLoading } = useQuery({
    queryKey: ['powerOfAttorney', filters, page, pageSize],
    queryFn: () => powerOfAttorneyApi.getAll({ ...filters, page, pageSize })
  });

  // Fetch customers for filter
  const { data: customersResponse } = useQuery({
    queryKey: ['customers-all'],
    queryFn: () => partnersApi.getAll({ type: PartnerType.Customer, pageSize: 1000 })
  });

  const customers = customersResponse?.data;

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => powerOfAttorneyApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['powerOfAttorney'] });
      message.success('Vekalet belgesi silindi');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Silme başarısız');
    }
  });

  // Activate mutation
  const activateMutation = useMutation({
    mutationFn: (id: string) => powerOfAttorneyApi.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['powerOfAttorney'] });
      message.success('Vekalet belgesi aktif edildi');
    }
  });

  // Revoke mutation
  const revokeMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => 
      powerOfAttorneyApi.revoke(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['powerOfAttorney'] });
      message.success('Vekalet belgesi iptal edildi');
    }
  });

  // Export PDF mutation
  const exportMutation = useMutation({
    mutationFn: (id: string) => powerOfAttorneyApi.exportPdf(id),
    onSuccess: (blob: any, id: string) => {
      downloadFile(blob as Blob, `POA-${id}.pdf`);
      message.success('PDF indirildi');
    }
  });

  // Table columns
  const columns: ColumnsType<PowerOfAttorney> = [
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      align: 'center',
      render: (status: PoaStatus, record) => {
        const isExpired = dayjs(record.expiryDate).isBefore(dayjs()) && 
                         status === PoaStatus.Active;
        
        return (
          <Space direction="vertical" size={2}>
            <Tag color={poaStatusColors[status]}>
              {poaStatusLabels[status]}
            </Tag>
            {isExpired && (
              <Tag color="orange">Süresi Doldu</Tag>
            )}
          </Space>
        );
      },
      filters: [
        { text: 'Taslak', value: PoaStatus.Draft },
        { text: 'Aktif', value: PoaStatus.Active },
        { text: 'Süresi Doldu', value: PoaStatus.Expired },
        { text: 'İptal Edildi', value: PoaStatus.Revoked }
      ]
    },
    {
      title: 'Vekalet No',
      dataIndex: 'poaNumber',
      key: 'poaNumber',
      width: 130,
      fixed: 'left',
      render: (num: string) => (
        <span className="font-mono font-semibold">{num}</span>
      )
    },
    {
      title: 'Sözleşme',
      key: 'contract',
      width: 150,
      render: (_, record) => (
        <div>
          <Button
            type="link"
            size="small"
            onClick={() => navigate(`/contracts/${record.contractId}`)}
          >
            {record.contract?.contractNumber}
          </Button>
          <div className="text-xs text-gray-500">{record.contract?.title}</div>
        </div>
      )
    },
    {
      title: 'Müşteri',
      key: 'customer',
      width: 200,
      ellipsis: true,
      render: (_, record) => (
        <div>
          <div className="font-semibold">{record.customer?.name}</div>
          <div className="text-xs text-gray-500">{record.customer?.code}</div>
        </div>
      )
    },
    {
      title: 'Vekalet Veren',
      dataIndex: 'grantorName',
      key: 'grantorName',
      width: 150,
      ellipsis: true
    },
    {
      title: 'Vekil',
      dataIndex: 'attorneyName',
      key: 'attorneyName',
      width: 150,
      ellipsis: true
    },
    {
      title: 'Düzenleme',
      dataIndex: 'issueDate',
      key: 'issueDate',
      width: 110,
      render: (date: string) => formatDate(date)
    },
    {
      title: 'Son Geçerlilik',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 110,
      render: (date: string, record) => {
        const isExpired = dayjs(date).isBefore(dayjs());
        return (
          <span className={isExpired && record.status === PoaStatus.Active ? 'text-red-600 font-semibold' : ''}>
            {formatDate(date)}
          </span>
        );
      }
    },
    {
      title: 'Kullanım',
      dataIndex: 'usageCount',
      key: 'usageCount',
      width: 100,
      align: 'center',
      render: (count: number) => (
        <Badge count={count} showZero color={count > 0 ? 'blue' : 'default'} />
      )
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 250,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/power-of-attorney/${record.id}`)}
          >
            Detay
          </Button>
          {record.status === PoaStatus.Draft && (
            <>
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={() => navigate(`/power-of-attorney/edit/${record.id}`)}
              />
              <Button
                size="small"
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => activateMutation.mutate(record.id)}
              >
                Aktif Et
              </Button>
            </>
          )}
          {record.status === PoaStatus.Active && (
            <Button
              size="small"
              danger
              icon={<CloseOutlined />}
              onClick={() => handleRevoke(record)}
            >
              İptal Et
            </Button>
          )}
          <Button
            size="small"
            icon={<FilePdfOutlined />}
            onClick={() => exportMutation.mutate(record.id)}
            loading={exportMutation.isPending}
          />
          {record.status === PoaStatus.Draft && (
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

  const handleRevoke = (poa: PowerOfAttorney) => {
    const reason = prompt('İptal nedeni:');
    if (reason) {
      revokeMutation.mutate({ id: poa.id, reason });
    }
  };

  const handleDelete = (poa: PowerOfAttorney) => {
    showConfirm({
      title: 'Vekalet Belgesini Sil',
      content: `${poa.poaNumber} numaralı vekalet belgesini silmek istediğinize emin misiniz?`,
      okType: 'danger',
      onOk: async () => {
        await deleteMutation.mutateAsync(poa.id);
      }
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vekalet Belgeleri</h1>
            <p className="text-gray-600 mt-1">
              Sözleşme bazlı vekalet belgesi yönetimi (Özbekistan)
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => navigate('/power-of-attorney/new')}
          >
            Yeni Vekalet Belgesi
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
                { label: 'Taslak', value: PoaStatus.Draft },
                { label: 'Aktif', value: PoaStatus.Active },
                { label: 'Süresi Doldu', value: PoaStatus.Expired },
                { label: 'İptal Edildi', value: PoaStatus.Revoked }
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
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="mb-2 text-sm text-gray-600">Ara</div>
            <Search
              placeholder="Vekalet no..."
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
            showTotal: (total) => `Toplam ${total} vekalet belgesi`,
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

