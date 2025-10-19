import React, { useState } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Input, 
  Select, 
  Space, 
  Tag,
  message,
  Row,
  Col
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  LockOutlined,
  UnlockOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';

import { suppliersApi } from '@/api/suppliers';
import type { Supplier, SupplierFilters } from '@/types/supplier';
import { SupplierType, supplierTypeLabels } from '@/types/supplier';
import { formatCurrency, formatDate } from '@/lib/utils';
import { usePageTitle } from '@/hooks/usePageTitle';
import { showConfirm } from '@/components/ui/ConfirmModal';
import SupplierForm from './SupplierForm';

const { Search } = Input;

export default function SupplierList() {
  usePageTitle('Tedarikçiler');
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<SupplierFilters>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | undefined>();

  // Fetch suppliers
  const { data, isLoading } = useQuery({
    queryKey: ['suppliers', filters, page, pageSize],
    queryFn: () => suppliersApi.getAll({ ...filters, page, pageSize })
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => suppliersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      message.success('Tedarikçi silindi');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Silme işlemi başarısız');
    }
  });

  // Block mutation
  const blockMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => 
      suppliersApi.block(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      message.success('Tedarikçi bloke edildi');
    }
  });

  // Unblock mutation
  const unblockMutation = useMutation({
    mutationFn: (id: string) => suppliersApi.unblock(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      message.success('Bloke kaldırıldı');
    }
  });

  // Table columns
  const columns: ColumnsType<Supplier> = [
    {
      title: 'Durum',
      key: 'status',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Tag color={record.isActive ? 'green' : 'red'}>
            {record.isActive ? 'Aktif' : 'Pasif'}
          </Tag>
          {record.isBlocked && (
            <Tag color="orange" icon={<LockOutlined />}>
              Bloke
            </Tag>
          )}
        </Space>
      ),
      filters: [
        { text: 'Aktif', value: true },
        { text: 'Pasif', value: false }
      ]
    },
    {
      title: 'Kod',
      dataIndex: 'code',
      key: 'code',
      width: 100,
      sorter: true
    },
    {
      title: 'Tedarikçi Adı',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (name: string, record) => (
        <div>
          <div className="font-semibold">{name}</div>
          {record.contactPerson && (
            <div className="text-xs text-gray-500">
              İlgili: {record.contactPerson}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Tip',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      align: 'center',
      render: (type: SupplierType) => (
        <Tag color={type === SupplierType.Domestic ? 'blue' : 'purple'}>
          {supplierTypeLabels[type]}
        </Tag>
      ),
      filters: [
        { text: 'Yerli', value: SupplierType.Domestic },
        { text: 'Yabancı', value: SupplierType.Foreign }
      ]
    },
    {
      title: 'İletişim',
      key: 'contact',
      width: 200,
      render: (_, record) => (
        <div className="text-sm">
          {record.email && <div>📧 {record.email}</div>}
          {record.phone && <div>📞 {record.phone}</div>}
        </div>
      )
    },
    {
      title: 'Şehir',
      dataIndex: 'city',
      key: 'city',
      width: 120,
      render: (city?: string) => city || '-'
    },
    {
      title: 'Para Birimi',
      dataIndex: 'currency',
      key: 'currency',
      width: 100,
      align: 'center'
    },
    {
      title: 'Bakiye',
      dataIndex: 'currentBalance',
      key: 'currentBalance',
      width: 150,
      align: 'right',
      render: (balance: number, record) => (
        <span className={`font-semibold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {formatCurrency(balance, record.currency)}
        </span>
      ),
      sorter: true
    },
    {
      title: 'Vade (Gün)',
      dataIndex: 'paymentTermDays',
      key: 'paymentTermDays',
      width: 100,
      align: 'center'
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/suppliers/${record.id}`)}
          >
            Detay
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedSupplier(record);
              setFormOpen(true);
            }}
          />
          {record.isBlocked ? (
            <Button
              size="small"
              icon={<UnlockOutlined />}
              onClick={() => unblockMutation.mutate(record.id)}
            >
              Aç
            </Button>
          ) : (
            <Button
              size="small"
              danger
              icon={<LockOutlined />}
              onClick={() => {
                const reason = prompt('Bloke nedeni:');
                if (reason) {
                  blockMutation.mutate({ id: record.id, reason });
                }
              }}
            >
              Bloke
            </Button>
          )}
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          />
        </Space>
      )
    }
  ];

  const handleDelete = (supplier: Supplier) => {
    showConfirm({
      title: 'Tedarikçi Sil',
      content: `${supplier.name} tedarikçisini silmek istediğinize emin misiniz?`,
      okType: 'danger',
      onOk: async () => {
        await deleteMutation.mutateAsync(supplier.id);
      }
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tedarikçiler</h1>
            <p className="text-gray-600 mt-1">
              Tedarikçi yönetimi ve satın alma takibi
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => {
              setSelectedSupplier(undefined);
              setFormOpen(true);
            }}
          >
            Yeni Tedarikçi
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <Row gutter={16}>
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Tedarikçi ara (ad, kod, email...)"
              allowClear
              prefix={<SearchOutlined />}
              onSearch={(value) => setFilters({ ...filters, search: value })}
              onChange={(e) => {
                if (!e.target.value) {
                  setFilters({ ...filters, search: undefined });
                }
              }}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              className="w-full"
              placeholder="Tip"
              allowClear
              onChange={(value) => setFilters({ ...filters, type: value })}
              options={[
                { label: 'Yerli', value: SupplierType.Domestic },
                { label: 'Yabancı', value: SupplierType.Foreign }
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              className="w-full"
              placeholder="Durum"
              allowClear
              onChange={(value) => setFilters({ ...filters, isActive: value })}
              options={[
                { label: 'Aktif', value: true },
                { label: 'Pasif', value: false }
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              className="w-full"
              placeholder="Bloke Durumu"
              allowClear
              onChange={(value) => setFilters({ ...filters, isBlocked: value })}
              options={[
                { label: 'Bloke', value: true },
                { label: 'Normal', value: false }
              ]}
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
            showTotal: (total) => `Toplam ${total} tedarikçi`,
            onChange: (page, pageSize) => {
              setPage(page);
              setPageSize(pageSize);
            }
          }}
        />
      </Card>

      {/* Supplier Form Modal */}
      <SupplierForm
        open={formOpen}
        supplier={selectedSupplier}
        onCancel={() => {
          setFormOpen(false);
          setSelectedSupplier(undefined);
        }}
        onSuccess={() => {
          setFormOpen(false);
          setSelectedSupplier(undefined);
          queryClient.invalidateQueries({ queryKey: ['suppliers'] });
          message.success(selectedSupplier ? 'Tedarikçi güncellendi' : 'Tedarikçi eklendi');
        }}
      />
    </div>
  );
}
