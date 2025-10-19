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
import { useTranslation } from 'react-i18next';
import type { ColumnsType } from 'antd/es/table';

import { partnersApi } from '@/api/partners';
import type { Partner, PartnerFilters } from '@/types/partner';
import { PartnerType, partnerTypeLabels } from '@/types/partner';
import { formatCurrency, formatDate } from '@/lib/utils';
import { usePageTitle } from '@/hooks/usePageTitle';
import { showConfirm } from '@/components/ui/ConfirmModal';
import PartnerForm from './PartnerForm';

const { Search } = Input;

export default function PartnerList() {
  const { t } = useTranslation();
  usePageTitle(t('partners.title'));
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<PartnerFilters>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | undefined>();

  // Fetch partners
  const { data, isLoading } = useQuery({
    queryKey: ['partners', filters, page, pageSize],
    queryFn: () => partnersApi.getAll({ ...filters, page, pageSize })
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => partnersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      message.success(t('partners.deleteSuccess'));
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || t('partners.deleteError'));
    }
  });

  // Block mutation
  const blockMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => 
      partnersApi.block(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      message.success(t('partners.blockSuccess'));
    }
  });

  // Unblock mutation
  const unblockMutation = useMutation({
    mutationFn: (id: string) => partnersApi.unblock(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      message.success(t('partners.unblockSuccess'));
    }
  });

  // Table columns
  const columns: ColumnsType<Partner> = [
    {
      title: t('partners.status'),
      key: 'status',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Tag color={record.isActive ? 'green' : 'red'}>
            {record.isActive ? t('partners.active') : t('partners.inactive')}
          </Tag>
          {record.isBlocked && (
            <Tag color="orange" icon={<LockOutlined />}>
              {t('partners.blocked')}
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
      title: 'Ad',
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
      width: 150,
      align: 'center',
      render: (type: PartnerType) => {
        const colors = {
          [PartnerType.Customer]: 'blue',
          [PartnerType.Supplier]: 'purple',
          [PartnerType.Both]: 'cyan'
        };
        return (
          <Tag color={colors[type]}>
            {partnerTypeLabels[type]}
          </Tag>
        );
      },
      filters: [
        { text: 'Müşteri', value: PartnerType.Customer },
        { text: 'Tedarikçi', value: PartnerType.Supplier },
        { text: 'Her İkisi', value: PartnerType.Both }
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
            onClick={() => navigate(`/partners/${record.id}`)}
          >
            Detay
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedPartner(record);
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

  const handleDelete = (partner: Partner) => {
    showConfirm({
      title: 'Cari Hesap Sil',
      content: `${partner.name} cari hesabını silmek istediğinize emin misiniz?`,
      okType: 'danger',
      onOk: async () => {
        await deleteMutation.mutateAsync(partner.id);
      }
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cari Hesaplar</h1>
            <p className="text-gray-600 mt-1">
              Müşteri ve tedarikçi yönetimi
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => {
              setSelectedPartner(undefined);
              setFormOpen(true);
            }}
          >
            Yeni Cari Hesap
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <Row gutter={16}>
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Cari hesap ara (ad, kod, email...)"
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
              placeholder={t('partners.partnerType')}
              allowClear
              onChange={(value) => setFilters({ ...filters, type: value })}
              options={[
                { label: t('partners.customer'), value: PartnerType.Customer },
                { label: t('partners.supplier'), value: PartnerType.Supplier },
                { label: t('partners.both'), value: PartnerType.Both }
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              className="w-full"
              placeholder={t('partners.status')}
              allowClear
              onChange={(value) => setFilters({ ...filters, isActive: value })}
              options={[
                { label: t('partners.active'), value: true },
                { label: t('partners.inactive'), value: false }
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
            showTotal: (total) => `Toplam ${total} cari hesap`,
            onChange: (page, pageSize) => {
              setPage(page);
              setPageSize(pageSize);
            }
          }}
        />
      </Card>

      {/* Partner Form Modal */}
      <PartnerForm
        open={formOpen}
        partner={selectedPartner}
        onCancel={() => {
          setFormOpen(false);
          setSelectedPartner(undefined);
        }}
        onSuccess={() => {
          setFormOpen(false);
          setSelectedPartner(undefined);
          queryClient.invalidateQueries({ queryKey: ['partners'] });
          message.success(selectedPartner ? 'Cari hesap güncellendi' : 'Cari hesap eklendi');
        }}
      />
    </div>
  );
}
