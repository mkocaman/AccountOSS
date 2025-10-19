import { useState } from 'react';
import { Table, Button, Input, Space, Tag, message, Badge } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  SearchOutlined,
  CheckOutlined,
  StopOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { ownerSettingsApi } from '@/api/ownerSettings';
import type { CompanyInfo } from '@/types/ownerSettings';
import { formatDate } from '@/lib/utils';
import { showConfirm } from '@/components/ui/ConfirmModal';

const { Search } = Input;

export default function CompanyManagement() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Fetch companies
  const { data, isLoading } = useQuery({
    queryKey: ['ownerCompanies', search, page, pageSize],
    queryFn: () => ownerSettingsApi.getAllCompanies({ search, page, pageSize })
  });

  // Suspend mutation
  const suspendMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => 
      ownerSettingsApi.suspendCompany(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerCompanies'] });
      message.success('Company suspended');
    }
  });

  // Activate mutation
  const activateMutation = useMutation({
    mutationFn: (id: string) => ownerSettingsApi.activateCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerCompanies'] });
      message.success('Company activated');
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => ownerSettingsApi.deleteCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerCompanies'] });
      message.success('Company deleted');
    }
  });

  const columns: ColumnsType<CompanyInfo> = [
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      align: 'center',
      render: (isActive: boolean) => (
        <Badge status={isActive ? 'success' : 'error'} text={isActive ? 'Active' : 'Suspended'} />
      )
    },
    {
      title: 'Company Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <span className="font-semibold">{name}</span>
    },
    {
      title: 'Owner Email',
      dataIndex: 'ownerEmail',
      key: 'ownerEmail'
    },
    {
      title: 'Subscription',
      key: 'subscription',
      width: 150,
      render: (_, record) => (
        <div>
          <div><Tag color="blue">{record.subscriptionPlan}</Tag></div>
          <div className="text-xs">
            <Tag color={
              record.subscriptionStatus === 'active' ? 'green' :
              record.subscriptionStatus === 'trial' ? 'orange' :
              'red'
            }>
              {record.subscriptionStatus}
            </Tag>
          </div>
        </div>
      )
    },
    {
      title: 'Users',
      dataIndex: 'userCount',
      key: 'userCount',
      width: 80,
      align: 'center'
    },
    {
      title: 'Storage',
      dataIndex: 'storageUsed',
      key: 'storageUsed',
      width: 100,
      align: 'right',
      render: (storage: number) => `${storage.toFixed(2)} GB`
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 110,
      render: (date: string) => formatDate(date)
    },
    {
      title: 'Last Active',
      dataIndex: 'lastActiveAt',
      key: 'lastActiveAt',
      width: 110,
      render: (date: string) => formatDate(date)
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          {record.isActive ? (
            <Button
              size="small"
              danger
              icon={<StopOutlined />}
              onClick={() => handleSuspend(record)}
            >
              Suspend
            </Button>
          ) : (
            <Button
              size="small"
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => activateMutation.mutate(record.id)}
            >
              Activate
            </Button>
          )}
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            Delete
          </Button>
        </Space>
      )
    }
  ];

  const handleSuspend = (company: CompanyInfo) => {
    const reason = prompt('Suspension reason:');
    if (reason) {
      suspendMutation.mutate({ id: company.id, reason });
    }
  };

  const handleDelete = (company: CompanyInfo) => {
    showConfirm({
      title: 'Delete Company',
      content: `Are you sure you want to delete ${company.name}? This action cannot be undone.`,
      okType: 'danger',
      onOk: async () => {
        await deleteMutation.mutateAsync(company.id);
      }
    });
  };

  return (
    <div>
      <div className="mb-4">
        <Search
          placeholder="Search companies..."
          allowClear
          prefix={<SearchOutlined />}
          onSearch={setSearch}
          style={{ maxWidth: 400 }}
        />
      </div>

      <Table
        columns={columns}
        dataSource={data?.items || []}
        rowKey="id"
        loading={isLoading}
        scroll={{ x: 1200 }}
        pagination={{
          current: page,
          pageSize,
          total: data?.totalCount || 0,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} companies`,
          onChange: (page, pageSize) => {
            setPage(page);
            setPageSize(pageSize);
          }
        }}
      />
    </div>
  );
}

