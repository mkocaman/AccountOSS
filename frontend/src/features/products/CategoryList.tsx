import React from 'react';
import { Card, Table, Button, Space, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { ColumnsType } from 'antd/es/table';

interface Category {
  id: string;
  name: string;
  description: string;
  productCount: number;
  status: 'active' | 'inactive';
}

const CategoryList: React.FC = () => {
  const { t } = useTranslation();

  // Mock data
  const categories: Category[] = [
    {
      id: '1',
      name: 'Elektronik',
      description: 'Elektronik ürünler',
      productCount: 25,
      status: 'active',
    },
    {
      id: '2',
      name: 'Giyim',
      description: 'Giyim ürünleri',
      productCount: 15,
      status: 'active',
    },
  ];

  const columns: ColumnsType<Category> = [
    {
      title: 'Kategori Adı',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Ürün Sayısı',
      dataIndex: 'productCount',
      key: 'productCount',
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: () => (
        <Space>
          <Button type="link" icon={<EditOutlined />}>
            Düzenle
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />}>
            Sil
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title="Ürün Kategorileri"
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            Yeni Kategori
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={categories}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} kategori`,
          }}
        />
      </Card>
    </div>
  );
};

export default CategoryList;
