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
  FileProtectOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

import { contractsApi } from '@/api/contracts';
import { partnersApi } from '@/api/partners';
import { PartnerType } from '@/types/partner';
import type { Contract, ContractFilters } from '@/types/contract';
import { 
  ContractStatus, 
  ContractType,
  contractStatusLabels, 
  contractStatusColors,
  contractTypeLabels
} from '@/types/contract';
import { formatCurrency, formatDate, downloadFile } from '@/lib/utils';
import { usePageTitle } from '@/hooks/usePageTitle';
import { showConfirm } from '@/components/ui/ConfirmModal';

const { Search } = Input;
const { RangePicker } = DatePicker;

export default function ContractList() {
  usePageTitle('Sözleşmeler');
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<ContractFilters>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Fetch contracts
  const { data, isLoading } = useQuery({
    queryKey: ['contracts', filters, page, pageSize],
    queryFn: () => contractsApi.getAll({ ...filters, page, pageSize })
  });

  // Fetch customers for filter
  const { data: customersResponse } = useQuery({
    queryKey: ['customers-all'],
    queryFn: () => partnersApi.getAll({ type: PartnerType.Customer, pageSize: 1000 })
  });

  const customers = customersResponse?.data;

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => contractsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      message.success('Sözleşme silindi');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Silme başarısız');
    }
  });

  // Activate mutation
  const activateMutation = useMutation({
    mutationFn: (id: string) => contractsApi.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      message.success('Sözleşme aktif edildi');
    }
  });

  // Terminate mutation
  const terminateMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => 
      contractsApi.terminate(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      message.success('Sözleşme feshedildi');
    }
  });

  // Create POA mutation
  const createPoaMutation = useMutation({
    mutationFn: (id: string) => contractsApi.createPowerOfAttorney(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      message.success('Vekalet belgesi oluşturuldu');
    }
  });

  // Export PDF mutation
  const exportMutation = useMutation({
    mutationFn: (id: string) => contractsApi.exportPdf(id),
    onSuccess: (blob: any, id: string) => {
      downloadFile(blob as Blob, `Contract-${id}.pdf`);
      message.success('PDF indirildi');
    }
  });

  // Table columns
  const columns: ColumnsType<Contract> = [
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      align: 'center',
      render: (status: ContractStatus, record) => {
        const isExpired = dayjs(record.endDate).isBefore(dayjs()) && 
                         status === ContractStatus.Active;
        
        return (
          <Space direction="vertical" size={2}>
            <Tag color={contractStatusColors[status]}>
              {contractStatusLabels[status]}
            </Tag>
            {isExpired && (
              <Tag color="orange">Süresi Doldu</Tag>
            )}
            {record.isSigned && (
              <Tag color="green">İmzalandı</Tag>
            )}
            {record.hasPowerOfAttorney && (
              <Tag color="purple" icon={<FileProtectOutlined />}>
                Vekaletli
              </Tag>
            )}
          </Space>
        );
      }
    },
    {
      title: 'Sözleşme No',
      dataIndex: 'contractNumber',
      key: 'contractNumber',
      width: 130,
      fixed: 'left',
      render: (num: string) => (
        <span className="font-mono font-semibold">{num}</span>
      )
    },
    {
      title: 'Başlık',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (title: string) => (
        <span className="font-semibold">{title}</span>
      )
    },
    {
      title: 'Tip',
      dataIndex: 'contractType',
      key: 'contractType',
      width: 150,
      render: (type: ContractType) => (
        <Tag color="blue">{contractTypeLabels[type]}</Tag>
      ),
      filters: [
        { text: 'Satış', value: ContractType.Sales },
        { text: 'Hizmet', value: ContractType.Service },
        { text: 'Distribütörlük', value: ContractType.Distribution },
        { text: 'Acentelik', value: ContractType.Agency },
        { text: 'Ortaklık', value: ContractType.Partnership }
      ]
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
      title: 'Başlangıç',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 110,
      render: (date: string) => formatDate(date)
    },
    {
      title: 'Bitiş',
      dataIndex: 'endDate',
      key: 'endDate',
      width: 110,
      render: (date: string, record) => {
        const isExpired = dayjs(date).isBefore(dayjs());
        return (
          <span className={isExpired && record.status === ContractStatus.Active ? 'text-red-600 font-semibold' : ''}>
            {formatDate(date)}
          </span>
        );
      }
    },
    {
      title: 'Toplam Değer',
      dataIndex: 'totalValue',
      key: 'totalValue',
      width: 130,
      align: 'right',
      render: (value: number, record) => (
        <span className="font-semibold">
          {formatCurrency(value, record.currency)}
        </span>
      )
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 320,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/contracts/${record.id}`)}
          >
            Detay
          </Button>
          {record.status === ContractStatus.Draft && (
            <>
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={() => navigate(`/contracts/edit/${record.id}`)}
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
          {record.status === ContractStatus.Active && !record.hasPowerOfAttorney && record.isSigned && (
            <Button
              size="small"
              type="primary"
              icon={<FileProtectOutlined />}
              onClick={() => createPoaMutation.mutate(record.id)}
            >
              Vekalet Oluştur
            </Button>
          )}
          {record.status === ContractStatus.Active && (
            <Button
              size="small"
              danger
              icon={<CloseOutlined />}
              onClick={() => handleTerminate(record)}
            >
              Feshet
            </Button>
          )}
          <Button
            size="small"
            icon={<FilePdfOutlined />}
            onClick={() => exportMutation.mutate(record.id)}
            loading={exportMutation.isPending}
          />
          {record.status === ContractStatus.Draft && (
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

  const handleTerminate = (contract: Contract) => {
    const reason = prompt('Fesih nedeni:');
    if (reason) {
      terminateMutation.mutate({ id: contract.id, reason });
    }
  };

  const handleDelete = (contract: Contract) => {
    showConfirm({
      title: 'Sözleşmeyi Sil',
      content: `${contract.contractNumber} sözleşmesini silmek istediğinize emin misiniz?`,
      okType: 'danger',
      onOk: async () => {
        await deleteMutation.mutateAsync(contract.id);
      }
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sözleşmeler</h1>
            <p className="text-gray-600 mt-1">
              Müşteri sözleşmeleri ve vekalet yönetimi (Özbekistan)
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => navigate('/contracts/new')}
          >
            Yeni Sözleşme
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
            <div className="mb-2 text-sm text-gray-600">Tip</div>
            <Select
              className="w-full"
              placeholder="Tüm tipler"
              allowClear
              value={filters.contractType}
              onChange={(value) => setFilters({ ...filters, contractType: value })}
              options={[
                { label: 'Satış', value: ContractType.Sales },
                { label: 'Hizmet', value: ContractType.Service },
                { label: 'Distribütörlük', value: ContractType.Distribution },
                { label: 'Acentelik', value: ContractType.Agency },
                { label: 'Ortaklık', value: ContractType.Partnership }
              ]}
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
                { label: 'Taslak', value: ContractStatus.Draft },
                { label: 'Onay Bekliyor', value: ContractStatus.Pending },
                { label: 'Aktif', value: ContractStatus.Active },
                { label: 'Süresi Doldu', value: ContractStatus.Expired },
                { label: 'Feshedildi', value: ContractStatus.Terminated }
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
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
          <Col xs={24} sm={12} md={4}>
            <div className="mb-2 text-sm text-gray-600">Ara</div>
            <Search
              placeholder="Sözleşme no, başlık..."
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
            showTotal: (total) => `Toplam ${total} sözleşme`,
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

