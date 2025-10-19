import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Table,
  Button,
  Space,
  Input,
  Tag,
  Modal,
  message,
  Tooltip,
  Card,
  Badge
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  FolderOutlined,
  FolderOpenOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { CategoryFormModal } from '@/components/products/CategoryFormModal';

const { Search } = Input;

interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  parentCategoryId?: string;
  parentCategoryName?: string;
  productCount: number;
  isActive: boolean;
}

/**
 * Ürün kategorileri listesi sayfası
 * Kategorileri hiyerarşik olarak listeler ve yönetir
 */
export const CategoryList: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);

  // Mock data - gerçek API entegrasyonu için değiştirilecek
  const [categories] = useState<ProductCategory[]>([
    {
      id: '1',
      name: 'Elektronik',
      description: 'Elektronik ürünler',
      productCount: 45,
      isActive: true
    },
    {
      id: '2',
      name: 'Bilgisayar',
      description: 'Bilgisayar ve aksesuarları',
      parentCategoryId: '1',
      parentCategoryName: 'Elektronik',
      productCount: 25,
      isActive: true
    },
    {
      id: '3',
      name: 'Gıda',
      description: 'Gıda ürünleri',
      productCount: 120,
      isActive: true
    }
  ]);

  /**
   * Yeni kategori ekleme modalını aç
   */
  const handleAddCategory = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  /**
   * Kategori düzenleme modalını aç
   */
  const handleEditCategory = (category: ProductCategory) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  /**
   * Kategori silme onayı
   */
  const handleDeleteCategory = (category: ProductCategory) => {
    // Kategoride ürün varsa uyarı göster
    if (category.productCount > 0) {
      Modal.warning({
        title: t('categories.deleteConfirmTitle'),
        content: t('categories.hasProducts', { count: category.productCount }),
        okText: t('common.ok')
      });
      return;
    }

    Modal.confirm({
      title: t('categories.deleteConfirmTitle'),
      icon: <ExclamationCircleOutlined />,
      content: t('categories.deleteConfirmMessage', { name: category.name }),
      okText: t('common.yes'),
      cancelText: t('common.no'),
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          // API çağrısı burada yapılacak
          message.success(t('categories.deleteSuccess'));
        } catch (error) {
          message.error(t('categories.deleteError'));
        }
      }
    });
  };

  /**
   * Form modal'ı kapandığında
   */
  const handleModalClose = (refresh?: boolean) => {
    setIsModalOpen(false);
    setSelectedCategory(null);
    if (refresh) {
      // Listeyi yenile
    }
  };

  /**
   * Tablo kolonları
   */
  const columns: ColumnsType<ProductCategory> = [
    {
      title: t('categories.columns.name'),
      dataIndex: 'name',
      key: 'name',
      width: 250,
      render: (name: string, record: ProductCategory) => (
        <Space>
          {record.parentCategoryId ? (
            <FolderOutlined style={{ color: '#faad14' }} />
          ) : (
            <FolderOpenOutlined style={{ color: '#1890ff' }} />
          )}
          <span style={{ fontWeight: record.parentCategoryId ? 'normal' : 'bold' }}>
            {name}
          </span>
        </Space>
      )
    },
    {
      title: t('categories.columns.description'),
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (description: string) => description || '-'
    },
    {
      title: t('categories.columns.parentCategory'),
      dataIndex: 'parentCategoryName',
      key: 'parentCategoryName',
      width: 200,
      render: (parentName: string) => parentName || '-'
    },
    {
      title: t('categories.columns.productCount'),
      dataIndex: 'productCount',
      key: 'productCount',
      width: 120,
      align: 'center',
      render: (count: number) => (
        <Badge count={count} showZero color="#1890ff" />
      )
    },
    {
      title: t('categories.columns.status'),
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      align: 'center',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {t(isActive ? 'common.active' : 'common.inactive')}
        </Tag>
      )
    },
    {
      title: t('categories.columns.actions'),
      key: 'actions',
      width: 120,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <Space>
          <Tooltip title={t('common.edit')}>
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditCategory(record)}
            />
          </Tooltip>
          <Tooltip title={t('common.delete')}>
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteCategory(record)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="category-list-page">
      {/* Sayfa başlığı */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('categories.title')}</h1>
          <p className="text-gray-500">{t('categories.subtitle')}</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddCategory}
          size="large"
        >
          {t('categories.addCategory')}
        </Button>
      </div>

      {/* Arama filtresi */}
      <Card style={{ marginBottom: 16 }}>
        <Search
          placeholder={t('categories.searchPlaceholder')}
          allowClear
          style={{ width: 300 }}
          onSearch={setSearchTerm}
          prefix={<SearchOutlined />}
        />
      </Card>

      {/* Kategori tablosu */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredCategories}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => t('common.totalRecords', { total })
          }}
        />
      </Card>

      {/* Kategori form modalı */}
      <CategoryFormModal
        open={isModalOpen}
        category={selectedCategory}
        onClose={handleModalClose}
      />
    </div>
  );
};

export default CategoryList;

