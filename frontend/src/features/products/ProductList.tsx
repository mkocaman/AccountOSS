import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { PageContainer, ProTable, ProCard } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { Button, Space, Tooltip, Statistic, Row, Col } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BarcodeOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '@/utils/formatters';
import type { Product } from '@/types/product';
import { useProducts } from '@/hooks/useProducts';

/**
 * Ürün listesi sayfası - ProTable ile
 */
export const ProductList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const actionRef = useRef<ActionType>();
  
  // API hooks
  const { data: productsData } = useProducts();

  /**
   * ProTable kolonları
   */
  const columns: ProColumns<Product>[] = [
    {
      title: t('product.labels.code'),
      dataIndex: 'code',
      key: 'code',
      width: 120,
      fixed: 'left',
      copyable: true
    },
    {
      title: t('product.labels.name'),
      dataIndex: 'name',
      key: 'name',
      width: 200,
      fixed: 'left',
      ellipsis: true,
      copyable: true
    },
    {
      title: t('product.labels.category'),
      dataIndex: 'categoryName',
      key: 'categoryName',
      width: 150,
      valueType: 'select',
      request: async () => {
        // Kategorileri API'den çek
        return [
          { label: 'Electronics', value: 'cat1' },
          { label: 'Food', value: 'cat2' },
          { label: 'Clothing', value: 'cat3' }
        ];
      }
    },
    {
      title: t('product.labels.barcode'),
      dataIndex: 'barcode',
      key: 'barcode',
      width: 130,
      render: (_, record) =>
        record.barcode ? (
          <Space>
            <BarcodeOutlined />
            {record.barcode}
          </Space>
        ) : (
          '-'
        )
    },
    {
      title: t('product.labels.unit'),
      dataIndex: 'unit',
      key: 'unit',
      width: 80,
      align: 'center'
    },
    {
      title: t('product.labels.purchasePrice'),
      dataIndex: 'purchasePrice',
      key: 'purchasePrice',
      width: 120,
      align: 'right',
      valueType: 'money',
      render: (_, record) => formatCurrency(record.purchasePrice)
    },
    {
      title: t('product.labels.salePrice'),
      dataIndex: 'salePrice',
      key: 'salePrice',
      width: 120,
      align: 'right',
      valueType: 'money',
      render: (_, record) => formatCurrency(record.salePrice)
    },
    {
      title: t('product.labels.taxRate'),
      dataIndex: 'taxRate',
      key: 'taxRate',
      width: 100,
      align: 'center',
      render: (_, record) => `%${record.taxRate}`
    },
    {
      title: t('product.labels.stock'),
      dataIndex: 'currentStock',
      key: 'currentStock',
      width: 120,
      align: 'right',
      render: (_, record) => (
        <Space>
          {record.isLowStock && (
            <Tooltip title={t('product.messages.lowStock')}>
              <WarningOutlined style={{ color: '#ff4d4f' }} />
            </Tooltip>
          )}
          <span style={{ color: record.isLowStock ? '#ff4d4f' : undefined }}>
            {record.currentStock?.toFixed(2) || '0.00'} {record.unit}
          </span>
        </Space>
      )
    },
    {
      title: t('product.labels.status'),
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      align: 'center',
      valueType: 'select',
      valueEnum: {
        true: { text: t('common.active'), status: 'Success' },
        false: { text: t('common.inactive'), status: 'Error' }
      }
    },
    {
      title: t('product.labels.actions'),
      key: 'actions',
      width: 120,
      fixed: 'right',
      align: 'center',
      valueType: 'option',
      render: () => [
        <Tooltip key="edit" title={t('common.edit')}>
          <Button type="text" icon={<EditOutlined />} />
        </Tooltip>,
        <Tooltip key="delete" title={t('common.delete')}>
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Tooltip>
      ]
    }
  ];

  return (
    <PageContainer
      header={{
        title: t('product.title'),
        subTitle: t('product.subtitle'),
        breadcrumb: {
          items: [
            { title: t('menu.home') },
            { title: t('menu.products') },
            { title: t('menu.productList') }
          ]
        }
      }}
      extra={[
        <Button
          key="categories"
          onClick={() => navigate('/products/categories')}
        >
          {t('product.labels.category')}
        </Button>
      ]}
    >
      {/* Özet İstatistikler */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <ProCard>
            <Statistic title={t('product.stats.total')} value={1234} />
          </ProCard>
        </Col>
        <Col span={6}>
          <ProCard>
            <Statistic
              title={t('product.stats.lowStock')}
              value={45}
              valueStyle={{ color: '#cf1322' }}
            />
          </ProCard>
        </Col>
        <Col span={6}>
          <ProCard>
            <Statistic
              title={t('product.stats.totalValue')}
              value={1234567}
              prefix="₺"
            />
          </ProCard>
        </Col>
        <Col span={6}>
          <ProCard>
            <Statistic
              title={t('product.stats.active')}
              value={1189}
              valueStyle={{ color: '#3f8600' }}
            />
          </ProCard>
        </Col>
      </Row>

      {/* Ürün Tablosu */}
      <ProTable<Product>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={async () => {
          // Backend API henüz hazır değil, boş data döndür
          return {
            data: [],
            success: true,
            total: 0
          };
        }}
        rowKey="id"
        search={{
          labelWidth: 'auto'
        }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => t('common.totalItems', { total })
        }}
        toolBarRender={() => [
          <Button key="add" type="primary" icon={<PlusOutlined />}>
            {t('product.buttons.new')}
          </Button>
        ]}
        options={{
          reload: true,
          density: true,
          setting: true
        }}
        scroll={{ x: 1200 }}
        sticky
      />
    </PageContainer>
  );
};

export default ProductList;