import { useState } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Input, 
  Space, 
  Tag,
  Switch,
  Select,
  message,
  Tooltip
} from 'antd';
import { 
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
  DownloadOutlined,
  LockOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';

import { chartOfAccountsApi } from '@/api/chartOfAccounts';
import type { ChartOfAccount, ChartOfAccountsFilters } from '@/types/chartOfAccounts';
import { 
  AccountType, 
  accountTypeLabels, 
  accountTypeColors,
  accountCategoryLabels,
  standardAccountPlan
} from '@/types/chartOfAccounts';
import { formatCurrency } from '@/lib/utils';
import { usePageTitle } from '@/hooks/usePageTitle';
import { showConfirm } from '@/components/ui/ConfirmModal';
import ChartOfAccountModal from './ChartOfAccountModal';

const { Search } = Input;

export default function ChartOfAccountsList() {
  usePageTitle('Hesap Planı');
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<ChartOfAccountsFilters>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<ChartOfAccount | null>(null);

  // Fetch accounts
  const { data, isLoading } = useQuery({
    queryKey: ['chartOfAccounts', filters],
    queryFn: () => chartOfAccountsApi.getAll(filters)
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => chartOfAccountsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chartOfAccounts'] });
      message.success('Hesap silindi');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Silme başarısız');
    }
  });

  // Import standard plan mutation
  const importMutation = useMutation({
    mutationFn: () => chartOfAccountsApi.importStandardPlan(standardAccountPlan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chartOfAccounts'] });
      message.success('Standart hesap planı içe aktarıldı');
    }
  });

  // Build tree data
  const buildTree = (accounts: ChartOfAccount[]): ChartOfAccount[] => {
    const map = new Map<string, ChartOfAccount>();
    const roots: ChartOfAccount[] = [];

    // İlk geçiş: tüm hesapları map'e ekle
    accounts.forEach(acc => {
      map.set(acc.id, { ...acc, children: [] });
    });

    // İkinci geçiş: parent-child ilişkilerini kur
    accounts.forEach(acc => {
      const node = map.get(acc.id)!;
      if (acc.parentId && map.has(acc.parentId)) {
        const parent = map.get(acc.parentId)!;
        if (!parent.children) parent.children = [];
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  const treeData = data?.items ? buildTree(data.items) : [];

  // Table columns
  const columns: ColumnsType<ChartOfAccount> = [
    {
      title: 'Hesap Kodu',
      dataIndex: 'code',
      key: 'code',
      width: 150,
      fixed: 'left',
      render: (code: string) => (
        <span className="font-mono font-semibold">{code}</span>
      )
    },
    {
      title: 'Hesap Adı',
      dataIndex: 'name',
      key: 'name',
      width: 300,
      render: (name: string, record) => (
        <div>
          <div className="font-semibold">{name}</div>
          {record.description && (
            <div className="text-xs text-gray-500">{record.description}</div>
          )}
        </div>
      )
    },
    {
      title: 'Tip',
      dataIndex: 'accountType',
      key: 'accountType',
      width: 150,
      render: (type: AccountType) => (
        <Tag color={accountTypeColors[type]}>
          {accountTypeLabels[type]}
        </Tag>
      )
    },
    {
      title: 'Kategori',
      dataIndex: 'accountCategory',
      key: 'accountCategory',
      width: 180,
      ellipsis: true,
      render: (category: any) => (
        <span className="text-xs text-gray-600">
          {accountCategoryLabels[category]}
        </span>
      )
    },
    {
      title: 'Seviye',
      dataIndex: 'level',
      key: 'level',
      width: 80,
      align: 'center',
      render: (level: number) => (
        <Tag color="blue">L{level}</Tag>
      )
    },
    {
      title: 'Borç',
      dataIndex: 'debitBalance',
      key: 'debitBalance',
      width: 120,
      align: 'right',
      render: (balance: number, record) => (
        balance > 0 ? (
          <span className="text-blue-600 font-semibold">
            {formatCurrency(balance, record.currency || 'TRY')}
          </span>
        ) : '-'
      )
    },
    {
      title: 'Alacak',
      dataIndex: 'creditBalance',
      key: 'creditBalance',
      width: 120,
      align: 'right',
      render: (balance: number, record) => (
        balance > 0 ? (
          <span className="text-green-600 font-semibold">
            {formatCurrency(balance, record.currency || 'TRY')}
          </span>
        ) : '-'
      )
    },
    {
      title: 'Bakiye',
      dataIndex: 'balance',
      key: 'balance',
      width: 120,
      align: 'right',
      render: (balance: number, record) => (
        <span className={`font-semibold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
          {formatCurrency(Math.abs(balance), record.currency || 'TRY')}
          {balance < 0 && ' (A)'}
        </span>
      )
    },
    {
      title: 'Özellikler',
      key: 'properties',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          {record.isGroup && <Tag color="purple">Grup</Tag>}
          {record.isSystemAccount && (
            <Tooltip title="Sistem Hesabı - Silinemez">
              <Tag color="red" icon={<LockOutlined />}>Sistem</Tag>
            </Tooltip>
          )}
          {!record.isActive && <Tag>Pasif</Tag>}
        </Space>
      )
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedAccount(record);
              setModalOpen(true);
            }}
            disabled={record.isSystemAccount}
          />
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            disabled={record.isSystemAccount || record.isGroup || record.balance !== 0}
          />
        </Space>
      )
    }
  ];

  const handleDelete = (account: ChartOfAccount) => {
    if (account.isSystemAccount) {
      message.warning('Sistem hesapları silinemez');
      return;
    }
    if (account.isGroup) {
      message.warning('Alt hesapları olan grup hesaplar silinemez');
      return;
    }
    if (account.balance !== 0) {
      message.warning('Bakiyesi olan hesaplar silinemez');
      return;
    }

    showConfirm({
      title: 'Hesabı Sil',
      content: `${account.code} - ${account.name} hesabını silmek istediğinize emin misiniz?`,
      okType: 'danger',
      onOk: async () => {
        await deleteMutation.mutateAsync(account.id);
      }
    });
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedAccount(null);
  };

  const handleImportStandard = () => {
    showConfirm({
      title: 'Standart Hesap Planını İçe Aktar',
      content: 'Türkiye Tek Düzen Hesap Planı içe aktarılacak. Devam etmek istiyor musunuz?',
      onOk: async () => {
        await importMutation.mutateAsync();
      }
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hesap Planı</h1>
            <p className="text-gray-600 mt-1">
              Muhasebe hesap planı ve hiyerarşik yapı yönetimi
            </p>
          </div>
          <Space>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleImportStandard}
              loading={importMutation.isPending}
            >
              Standart Plan İçe Aktar
            </Button>
            <Button
              icon={<FileTextOutlined />}
              onClick={() => navigate('/trial-balance')}
            >
              Mizan
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={() => setModalOpen(true)}
            >
              Yeni Hesap
            </Button>
          </Space>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <Space className="w-full" direction="vertical" size="middle">
          <Space wrap>
            <Search
              placeholder="Hesap ara..."
              allowClear
              style={{ width: 300 }}
              onSearch={(value) => setFilters({ ...filters, search: value })}
            />
            <Select
              placeholder="Hesap Tipi"
              allowClear
              style={{ width: 180 }}
              value={filters.accountType}
              onChange={(value) => setFilters({ ...filters, accountType: value })}
              options={Object.entries(accountTypeLabels).map(([value, label]) => ({
                label,
                value: Number(value)
              }))}
            />
            <span className="text-gray-600">Sadece Aktif:</span>
            <Switch
              checked={filters.isActive}
              onChange={(checked) => setFilters({ ...filters, isActive: checked ? true : undefined })}
            />
            <span className="text-gray-600">Sadece Grup:</span>
            <Switch
              checked={filters.isGroup}
              onChange={(checked) => setFilters({ ...filters, isGroup: checked ? true : undefined })}
            />
          </Space>
        </Space>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={treeData}
          rowKey="id"
          loading={isLoading}
          pagination={false}
          scroll={{ x: 1600 }}
          expandable={{
            defaultExpandAllRows: false
          }}
        />
      </Card>

      {/* Account Modal */}
      <ChartOfAccountModal
        open={modalOpen}
        account={selectedAccount}
        onClose={handleModalClose}
      />
    </div>
  );
}

