import React, { useState } from 'react';
import { 
  Card, 
  Tree, 
  Button, 
  Input, 
  Space, 
  message,
  Dropdown,
  Tag,
  Empty
} from 'antd';
import type { DataNode } from 'antd/es/tree';
import { 
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FolderOutlined,
  FolderOpenOutlined,
  SearchOutlined,
  MoreOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { categoriesApi } from '@/api/categories';
import type { ProductCategory } from '@/types/category';
import { usePageTitle } from '@/hooks/usePageTitle';
import { showConfirm } from '@/components/ui/ConfirmModal';
import CategoryForm from './CategoryForm';

const { Search } = Input;

export default function CategoryList() {
  usePageTitle('Ürün Kategorileri');
  
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState('');
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [autoExpandParent, setAutoExpandParent] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | undefined>();
  const [parentCategory, setParentCategory] = useState<ProductCategory | undefined>();

  // Fetch categories
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getTree()
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      message.success('Kategori silindi');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Silme işlemi başarısız');
    }
  });

  // Convert categories to tree data
  const convertToTreeData = (cats: ProductCategory[]): DataNode[] => {
    if (!cats) return [];

    return cats.map(cat => ({
      key: cat.id,
      title: (
        <div className="flex justify-between items-center pr-4">
          <Space>
            <span className="font-medium">{cat.name}</span>
            <Tag color="blue">{cat.code}</Tag>
            {cat.productCount !== undefined && (
              <Tag color="cyan">{cat.productCount} ürün</Tag>
            )}
            {!cat.isActive && (
              <Tag color="red">Pasif</Tag>
            )}
          </Space>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'add-child',
                  icon: <PlusOutlined />,
                  label: 'Alt Kategori Ekle',
                  onClick: () => handleAddChild(cat)
                },
                {
                  key: 'edit',
                  icon: <EditOutlined />,
                  label: 'Düzenle',
                  onClick: () => handleEdit(cat)
                },
                {
                  type: 'divider'
                },
                {
                  key: 'delete',
                  icon: <DeleteOutlined />,
                  label: 'Sil',
                  danger: true,
                  onClick: () => handleDelete(cat)
                }
              ]
            }}
            trigger={['click']}
          >
            <Button 
              type="text" 
              size="small" 
              icon={<MoreOutlined />}
              onClick={(e) => e.stopPropagation()}
            />
          </Dropdown>
        </div>
      ),
      icon: cat.children && cat.children.length > 0 
        ? <FolderOpenOutlined /> 
        : <FolderOutlined />,
      children: cat.children ? convertToTreeData(cat.children) : undefined
    }));
  };

  // Search in tree
  const getParentKeys = (cats: ProductCategory[], key: string, parent: string[] = []): string[] => {
    for (const cat of cats) {
      if (cat.id === key) {
        return parent;
      }
      if (cat.children) {
        const result = getParentKeys(cat.children, key, [...parent, cat.id]);
        if (result.length > 0) return result;
      }
    }
    return [];
  };

  const searchTree = (text: string) => {
    if (!text || !categories) {
      setExpandedKeys([]);
      return;
    }

    const keys: string[] = [];
    const searchInCategories = (cats: ProductCategory[]) => {
      cats.forEach(cat => {
        if (cat.name.toLowerCase().includes(text.toLowerCase()) || 
            cat.code.toLowerCase().includes(text.toLowerCase())) {
          const parentKeys = getParentKeys(categories, cat.id);
          keys.push(...parentKeys, cat.id);
        }
        if (cat.children) {
          searchInCategories(cat.children);
        }
      });
    };

    searchInCategories(categories);
    setExpandedKeys([...new Set(keys)]);
    setAutoExpandParent(true);
  };

  const handleAddChild = (parent: ProductCategory) => {
    setParentCategory(parent);
    setSelectedCategory(undefined);
    setFormOpen(true);
  };

  const handleEdit = (category: ProductCategory) => {
    setSelectedCategory(category);
    setParentCategory(undefined);
    setFormOpen(true);
  };

  const handleDelete = (category: ProductCategory) => {
    if (category.children && category.children.length > 0) {
      message.error('Alt kategorileri olan kategori silinemez');
      return;
    }

    if (category.productCount && category.productCount > 0) {
      message.error('İçinde ürün olan kategori silinemez');
      return;
    }

    showConfirm({
      title: 'Kategori Sil',
      content: `${category.name} kategorisini silmek istediğinize emin misiniz?`,
      okType: 'danger',
      onOk: async () => {
        await deleteMutation.mutateAsync(category.id);
      }
    });
  };

  const treeData = convertToTreeData(categories || []);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ürün Kategorileri</h1>
            <p className="text-gray-600 mt-1">
              Ürünlerinizi kategorilere ayırarak düzenleyin
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => {
              setSelectedCategory(undefined);
              setParentCategory(undefined);
              setFormOpen(true);
            }}
          >
            Yeni Kategori
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className="mb-4">
        <Search
          placeholder="Kategori ara..."
          allowClear
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            searchTree(e.target.value);
          }}
          style={{ maxWidth: 400 }}
        />
      </Card>

      {/* Tree */}
      <Card loading={isLoading}>
        {treeData.length === 0 ? (
          <Empty
            description="Henüz kategori eklenmemiş"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setFormOpen(true)}
            >
              İlk Kategoriyi Ekle
            </Button>
          </Empty>
        ) : (
          <Tree
            showIcon
            showLine
            expandedKeys={expandedKeys}
            autoExpandParent={autoExpandParent}
            onExpand={(keys) => {
              setExpandedKeys(keys);
              setAutoExpandParent(false);
            }}
            treeData={treeData}
            defaultExpandAll={false}
          />
        )}
      </Card>

      {/* Category Form Modal */}
      <CategoryForm
        open={formOpen}
        category={selectedCategory}
        parentCategory={parentCategory}
        onCancel={() => {
          setFormOpen(false);
          setSelectedCategory(undefined);
          setParentCategory(undefined);
        }}
        onSuccess={() => {
          setFormOpen(false);
          setSelectedCategory(undefined);
          setParentCategory(undefined);
          queryClient.invalidateQueries({ queryKey: ['categories'] });
          message.success(selectedCategory ? 'Kategori güncellendi' : 'Kategori eklendi');
        }}
      />
    </div>
  );
}
