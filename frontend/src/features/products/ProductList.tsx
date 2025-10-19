import { useState, useEffect } from 'react';
import {
  Button,
  Tag,
  Space,
  Modal,
  message,
  Card,
  Select,
  Switch,
  Image,
  Tooltip,
  App,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { productsApi, categoriesApi, type ProductListParams } from '@/api/products';
import type { Product, Category } from '@/types/product';
import { DataTable } from '@/components/ui/DataTable';
import { SearchBar } from '@/components/ui/SearchBar';
import type { ColumnsType } from 'antd/es/table';

// Ürün listesi sayfası
export const ProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [params, setParams] = useState<ProductListParams>({
    pageNumber: 1,
    pageSize: 50,
  });
  const { modal } = App.useApp();

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [params]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await productsApi.getAll(params);
      if (response.success) {
        setProducts(response.data.items);
        setTotalCount(response.data.totalCount);
      }
    } catch (error) {
      message.error('Ürünler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoriesApi.getAll();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Kategoriler yüklenemedi');
    }
  };

  const handleSearch = (value: string) => {
    setParams({ ...params, searchText: value, pageNumber: 1 });
  };

  const handleDelete = (product: Product) => {
    modal.confirm({
      title: 'Ürünü Sil',
      icon: <ExclamationCircleOutlined />,
      content: `"${product.name}" ürünü silmek istediğinize emin misiniz?`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await productsApi.delete(product.id);
          message.success('Ürün silindi');
          loadProducts();
        } catch (error) {
          message.error('Ürün silinemedi');
        }
      },
    });
  };

  // Stok seviyesi göstergesi
  const renderStockLevel = (product: Product) => {
    if (!product.trackStock) {
      return <Tag>Stok Takipsiz</Tag>;
    }

    const { stockQuantity, minStockLevel } = product;
    const isLow = stockQuantity <= minStockLevel;

    return (
      <div className="flex items-center gap-2">
        <span className={`font-medium ${isLow ? 'text-red-600' : ''}`}>
          {stockQuantity} {product.unit}
        </span>
        {isLow && (
          <Tooltip title={`Minimum: ${minStockLevel} ${product.unit}`}>
            <WarningOutlined className="text-red-500" />
          </Tooltip>
        )}
      </div>
    );
  };

  const columns: ColumnsType<Product> = [
    {
      title: 'Görsel',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 80,
      render: (url, record) =>
        url ? (
          <Image
            src={url}
            alt="Ürün"
            width={50}
            height={50}
            style={{ objectFit: 'cover', borderRadius: 4 }}
          />
        ) : (
          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-2xl">
            {record.type === 0 ? '📦' : '⚙️'}
          </div>
        ),
    },
    {
      title: 'Ürün Kodu',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (code) => <span className="font-mono font-medium">{code}</span>,
    },
    {
      title: 'Ürün Adı',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      render: (name, record) => (
        <div>
          <div className="font-medium">{name}</div>
          <div className="text-xs text-gray-500">
            {record.type === 0 ? '📦 Mal' : '⚙️ Hizmet'}
            {record.category && ` • ${record.category.name}`}
          </div>
        </div>
      ),
    },
    {
      title: 'Barkod',
      dataIndex: 'barcode',
      key: 'barcode',
      width: 150,
    },
    {
      title: 'Alış Fiyatı',
      dataIndex: 'purchasePrice',
      key: 'purchasePrice',
      width: 120,
      align: 'right',
      render: (price, record) => (
        <span className="font-medium">
          {price.toFixed(2)} {record.currency}
        </span>
      ),
    },
    {
      title: 'Satış Fiyatı',
      dataIndex: 'salePrice',
      key: 'salePrice',
      width: 120,
      align: 'right',
      render: (price, record) => (
        <span className="font-medium text-green-600">
          {price.toFixed(2)} {record.currency}
        </span>
      ),
    },
    {
      title: 'KDV',
      dataIndex: 'vatRate',
      key: 'vatRate',
      width: 80,
      render: (rate) => <Tag color="blue">%{rate}</Tag>,
    },
    {
      title: 'Stok',
      key: 'stock',
      width: 150,
      render: (_, record) => renderStockLevel(record),
    },
    {
      title: 'Durum',
      key: 'status',
      width: 120,
      render: (_, record) => (
        <div className="flex flex-col gap-1">
          <Tag color={record.isActive ? 'green' : 'red'} className="text-xs">
            {record.isActive ? 'Aktif' : 'Pasif'}
          </Tag>
          {record.isForSale && (
            <Tag color="cyan" className="text-xs">
              Satılabilir
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/products/${record.id}`);
            }}
          />
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/products/edit/${record.id}`);
            }}
          />
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(record);
            }}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Başlık */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Ürünler</h1>
          <p className="text-gray-500">Ürün listesi ve stok yönetimi</p>
        </div>
        <Space>
          <Button onClick={() => navigate('/categories')}>
            Kategoriler
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/products/create')}
            size="large"
          >
            Yeni Ürün
          </Button>
        </Space>
      </div>

      {/* Arama ve Filtreler */}
      <Card className="mb-4">
        <SearchBar
          onSearch={handleSearch}
          onRefresh={loadProducts}
          placeholder="Ürün adı, kod, barkod..."
          filters={
            <Space>
              <Select
                placeholder="Kategori"
                style={{ width: 200 }}
                allowClear
                onChange={(value) =>
                  setParams({ ...params, categoryId: value, pageNumber: 1 })
                }
              >
                {categories.map((cat) => (
                  <Select.Option key={cat.id} value={cat.id}>
                    {cat.name}
                  </Select.Option>
                ))}
              </Select>

              <Select
                placeholder="Tür"
                style={{ width: 150 }}
                allowClear
                onChange={(value) =>
                  setParams({ ...params, type: value, pageNumber: 1 })
                }
              >
                <Select.Option value={0}>Mal</Select.Option>
                <Select.Option value={1}>Hizmet</Select.Option>
              </Select>

              <Select
                placeholder="Durum"
                style={{ width: 150 }}
                allowClear
                onChange={(value) =>
                  setParams({ ...params, isActive: value, pageNumber: 1 })
                }
              >
                <Select.Option value={true}>Aktif</Select.Option>
                <Select.Option value={false}>Pasif</Select.Option>
              </Select>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Düşük Stok:</span>
                <Switch
                  onChange={(checked) =>
                    setParams({ ...params, lowStock: checked, pageNumber: 1 })
                  }
                />
              </div>
            </Space>
          }
        />
      </Card>

      {/* Tablo */}
      <Card>
        <DataTable
          columns={columns}
          data={products}
          loading={loading}
          pagination={{
            current: params.pageNumber,
            pageSize: params.pageSize,
            total: totalCount,
            onChange: (page, pageSize) =>
              setParams({ ...params, pageNumber: page, pageSize }),
          }}
        />
      </Card>
    </div>
  );
};

