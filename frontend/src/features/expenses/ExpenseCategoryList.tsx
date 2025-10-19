import { useState } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Input, 
  Space, 
  Tag,
  Switch,
  message
} from 'antd';
import { 
  PlusOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ColumnsType } from 'antd/es/table';

import { expenseCategoriesApi } from '@/api/expenses';
import type { ExpenseCategory, ExpenseCategoryFilters } from '@/types/expense';
import { usePageTitle } from '@/hooks/usePageTitle';
import { showConfirm } from '@/components/ui/ConfirmModal';
import ExpenseCategoryModal from './ExpenseCategoryModal';

const { Search } = Input;

export default function ExpenseCategoryList() {
  usePageTitle('Masraf Kategorileri');
  
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<ExpenseCategoryFilters>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | null>(null);

  // Fetch categories
  const { data, isLoading } = useQuery({
    queryKey: ['expenseCategories', filters],
    queryFn: () => expenseCategoriesApi.getAll(filters)
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => expenseCategoriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenseCategories'] });
      message.success('Kategori silindi');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Silme başarısız');
    }
  });

  // Build tree data
  const buildTree = (categories: ExpenseCategory[]): ExpenseCategory[] => {
    const map = new Map<string, ExpenseCategory>();
    const roots: ExpenseCategory[] = [];

    // İlk geçiş: tüm kategorileri map'e ekle
    categories.forEach(cat => {
      map.set(cat.id, { ...cat, children: [] });
    });

    // İkinci geçiş: parent-child ilişkilerini kur
    categories.forEach(cat => {
      const node = map.get(cat.id)!;
      if (cat.parentId && map.has(cat.parentId)) {
        const parent = map.get(cat.parentId)!;
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
  const columns: ColumnsType<ExpenseCategory> = [
    {
      title: 'Kod',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (code: string) => (
        <span className="font-mono font-semibold">{code}</span>
      )
    },
    {
      title: 'Kategori Adı',
      dataIndex: 'name',
      key: 'name',
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
      title: 'Seviye',
      dataIndex: 'level',
      key: 'level',
      width: 80,
      align: 'center',
      render: (level: number) => (
        <Tag color="blue">Level {level}</Tag>
      )
    },
    {
      title: 'Onay Gerekli',
      dataIndex: 'requiresApproval',
      key: 'requiresApproval',
      width: 120,
      align: 'center',
      render: (requires: boolean, record) => (
        <div>
          <Tag color={requires ? 'orange' : 'default'}>
            {requires ? 'Evet' : 'Hayır'}
          </Tag>
          {requires && record.maxAmountWithoutApproval && (
            <div className="text-xs text-gray-500 mt-1">
              Limit: {record.maxAmountWithoutApproval}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      align: 'center',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Aktif' : 'Pasif'}
        </Tag>
      )
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedCategory(record);
              setModalOpen(true);
            }}
          />
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

  const handleDelete = (category: ExpenseCategory) => {
    showConfirm({
      title: 'Kategoriyi Sil',
      content: `${category.name} kategorisini silmek istediğinize emin misiniz?`,
      okType: 'danger',
      onOk: async () => {
        await deleteMutation.mutateAsync(category.id);
      }
    });
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedCategory(null);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Masraf Kategorileri</h1>
            <p className="text-gray-600 mt-1">
              Hiyerarşik kategori yapısı ile masraf sınıflandırma
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => setModalOpen(true)}
          >
            Yeni Kategori
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <Space>
          <Search
            placeholder="Kategori ara..."
            allowClear
            style={{ width: 300 }}
            onSearch={(value) => setFilters({ ...filters, search: value })}
          />
          <span className="text-gray-600">Sadece Aktif:</span>
          <Switch
            checked={filters.isActive}
            onChange={(checked) => setFilters({ ...filters, isActive: checked ? true : undefined })}
          />
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
          expandable={{
            defaultExpandAllRows: true
          }}
        />
      </Card>

      {/* Category Modal */}
      <ExpenseCategoryModal
        open={modalOpen}
        category={selectedCategory}
        onClose={handleModalClose}
      />
    </div>
  );
}

