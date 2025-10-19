import { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Select,
  InputNumber,
  Switch,
  message,
  Spin,
  Tabs,
  Row,
  Col,
} from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { productsApi, categoriesApi } from '@/api/products';
import type { CreateProductRequest, Category } from '@/types/product';
import { ProductType, UNIT_OPTIONS, VAT_RATES } from '@/types/product';

export const ProductForm = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productType, setProductType] = useState<ProductType>(ProductType.Goods);

  const isEditMode = !!id;

  useEffect(() => {
    loadCategories();
    if (isEditMode) {
      loadProduct();
    }
  }, [id]);

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

  const loadProduct = async () => {
    setLoading(true);
    try {
      const response = await productsApi.getById(id!);
      if (response.success) {
        form.setFieldsValue(response.data);
        setProductType(response.data.type);
      }
    } catch (error) {
      message.error('Ürün bilgileri yüklenemedi');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: CreateProductRequest) => {
    setSaving(true);
    try {
      if (isEditMode) {
        await productsApi.update(id!, values);
        message.success('Ürün güncellendi');
      } else {
        await productsApi.create(values);
        message.success('Ürün oluşturuldu');
      }
      navigate('/products');
    } catch (error: any) {
      message.error(
        error.response?.data?.message ||
          (isEditMode ? 'Ürün güncellenemedi' : 'Ürün oluşturulamadı')
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {isEditMode ? 'Ürün Düzenle' : 'Yeni Ürün'}
        </h1>
        <p className="text-gray-500">
          {isEditMode ? 'Ürün bilgilerini güncelleyin' : 'Yeni ürün bilgilerini girin'}
        </p>
      </div>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          initialValues={{
            type: ProductType.Goods,
            currency: 'TRY',
            vatRate: 20,
            unit: 'Adet',
            trackStock: true,
            isForSale: true,
            isForPurchase: true,
            minStockLevel: 0,
            purchasePrice: 0,
            salePrice: 0,
          }}
        >
          <Tabs
            items={[
              {
                key: 'general',
                label: 'Genel Bilgiler',
                children: (
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="name"
                        label="Ürün Adı"
                        rules={[{ required: true, message: 'Ürün adı gerekli!' }]}
                      >
                        <Input placeholder="Örn: Laptop Dell XPS 15" size="large" />
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item name="barcode" label="Barkod">
                        <Input placeholder="1234567890123" size="large" />
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item
                        name="type"
                        label="Ürün Türü"
                        rules={[{ required: true, message: 'Ürün türü gerekli!' }]}
                      >
                        <Select
                          size="large"
                          onChange={(value) => setProductType(value)}
                        >
                          <Select.Option value={ProductType.Goods}>
                            📦 Mal (Stok Takipli)
                          </Select.Option>
                          <Select.Option value={ProductType.Service}>
                            ⚙️ Hizmet (Stok Takipsiz)
                          </Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item name="categoryId" label="Kategori">
                        <Select
                          size="large"
                          placeholder="Kategori seçin"
                          allowClear
                        >
                          {categories.map((cat) => (
                            <Select.Option key={cat.id} value={cat.id}>
                              {cat.name}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>

                    <Col span={24}>
                      <Form.Item name="description" label="Açıklama">
                        <Input.TextArea 
                          rows={3} 
                          size="large"
                          placeholder="Ürün açıklaması..."
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                ),
              },
              {
                key: 'pricing',
                label: 'Fiyatlandırma',
                children: (
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item
                        name="purchasePrice"
                        label="Alış Fiyatı"
                        rules={[{ required: true, message: 'Alış fiyatı gerekli!' }]}
                      >
                        <InputNumber
                          min={0}
                          style={{ width: '100%' }}
                          size="large"
                          placeholder="0.00"
                          precision={2}
                        />
                      </Form.Item>
                    </Col>

                    <Col span={8}>
                      <Form.Item
                        name="salePrice"
                        label="Satış Fiyatı"
                        rules={[{ required: true, message: 'Satış fiyatı gerekli!' }]}
                      >
                        <InputNumber
                          min={0}
                          style={{ width: '100%' }}
                          size="large"
                          placeholder="0.00"
                          precision={2}
                        />
                      </Form.Item>
                    </Col>

                    <Col span={8}>
                      <Form.Item
                        name="currency"
                        label="Para Birimi"
                        rules={[{ required: true, message: 'Para birimi gerekli!' }]}
                      >
                        <Select size="large">
                          <Select.Option value="TRY">🇹🇷 TRY</Select.Option>
                          <Select.Option value="USD">🇺🇸 USD</Select.Option>
                          <Select.Option value="EUR">🇪🇺 EUR</Select.Option>
                          <Select.Option value="GBP">🇬🇧 GBP</Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item
                        name="vatRate"
                        label="KDV Oranı"
                        rules={[{ required: true, message: 'KDV oranı gerekli!' }]}
                      >
                        <Select size="large">
                          {VAT_RATES.map((rate) => (
                            <Select.Option key={rate.value} value={rate.value}>
                              {rate.label}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                ),
              },
              {
                key: 'stock',
                label: 'Stok Bilgileri',
                children: (
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="unit"
                        label="Birim"
                        rules={[{ required: true, message: 'Birim gerekli!' }]}
                      >
                        <Select size="large">
                          {UNIT_OPTIONS.map((unit) => (
                            <Select.Option key={unit.value} value={unit.value}>
                              {unit.label}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item name="minStockLevel" label="Minimum Stok Seviyesi">
                        <InputNumber
                          min={0}
                          style={{ width: '100%' }}
                          size="large"
                          placeholder="Uyarı için minimum değer"
                        />
                      </Form.Item>
                    </Col>

                    {productType === ProductType.Goods && (
                      <Col span={24}>
                        <Form.Item
                          name="trackStock"
                          label="Stok Takibi"
                          valuePropName="checked"
                        >
                          <Switch
                            checkedChildren="Açık"
                            unCheckedChildren="Kapalı"
                          />
                        </Form.Item>
                        <p className="text-sm text-gray-500 mt-2">
                          Stok takibi açık olduğunda, her alım ve satımda otomatik olarak stok güncellenir.
                        </p>
                      </Col>
                    )}

                    <Col span={12}>
                      <Form.Item
                        name="isForSale"
                        label="Satışa Açık"
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                      <p className="text-sm text-gray-500">
                        Bu ürün satış faturalarında kullanılabilir.
                      </p>
                    </Col>

                    <Col span={12}>
                      <Form.Item
                        name="isForPurchase"
                        label="Satın Alınabilir"
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                      <p className="text-sm text-gray-500">
                        Bu ürün alış faturalarında kullanılabilir.
                      </p>
                    </Col>
                  </Row>
                ),
              },
            ]}
          />

          <div className="mt-6 flex gap-4">
            <Button type="primary" htmlType="submit" loading={saving} size="large">
              {isEditMode ? 'Güncelle' : 'Oluştur'}
            </Button>
            <Button size="large" onClick={() => navigate('/products')}>
              İptal
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

