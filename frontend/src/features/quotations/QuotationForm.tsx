import React, { useState } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Select, 
  DatePicker,
  Button,
  Table,
  InputNumber,
  Space,
  message,
  Row,
  Col,
  Statistic
} from 'antd';
import { 
  PlusOutlined, 
  DeleteOutlined,
  SaveOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';

import { quotationsApi } from '@/api/quotations';
import { partnersApi } from '@/api/partners';
import { productsApi } from '@/api/products';
import { PartnerType } from '@/types/partner';
import type { CreateQuotationRequest, CreateQuotationItemRequest } from '@/types/quotation';
import { formatCurrency } from '@/lib/utils';
import { usePageTitle } from '@/hooks/usePageTitle';

interface FormItem extends CreateQuotationItemRequest {
  key: string;
  product?: any;
}

export default function QuotationForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [items, setItems] = useState<FormItem[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState('TRY');

  usePageTitle(id ? 'Teklif Düzenle' : 'Yeni Teklif');

  // Fetch existing quotation
  const { data: quotation } = useQuery({
    queryKey: ['quotation', id],
    queryFn: () => quotationsApi.getById(id!),
    enabled: !!id
  });

  // Fetch customers (Partners with type Customer or Both)
  const { data: customersResponse } = useQuery({
    queryKey: ['customers-all'],
    queryFn: () => partnersApi.getAll({ type: PartnerType.Customer, pageSize: 1000 })
  });

  const customers = customersResponse?.data;

  // Fetch products
  const { data: productsResponse } = useQuery({
    queryKey: ['products-all'],
    queryFn: () => productsApi.getAll({ pageSize: 1000 })
  });

  const products = productsResponse?.data;

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: (data: CreateQuotationRequest) => {
      if (id) {
        return quotationsApi.update(id, data);
      }
      return quotationsApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      message.success(id ? 'Teklif güncellendi' : 'Teklif oluşturuldu');
      navigate('/quotations');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'İşlem başarısız');
    }
  });

  // Load existing quotation data
  React.useEffect(() => {
    if (quotation) {
      form.setFieldsValue({
        quotationDate: dayjs(quotation.quotationDate),
        validUntil: dayjs(quotation.validUntil),
        customerId: quotation.customerId,
        currency: quotation.currency,
        notes: quotation.notes,
        termsAndConditions: quotation.termsAndConditions
      });
      setSelectedCurrency(quotation.currency);
      setItems(quotation.items.map((item: any, index: number) => ({
        key: `item-${index}`,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountPercent: item.discountPercent || 0,
        taxPercent: item.taxPercent || 0,
        description: item.description,
        notes: item.notes,
        product: item.product
      })));
    }
  }, [quotation, form]);

  // Handle customer change
  const handleCustomerChange = (customerId: string) => {
    const customer = customers?.items?.find((c: any) => c.id === customerId);
    if (customer) {
      setSelectedCurrency(customer.currency);
      form.setFieldValue('currency', customer.currency);
    }
  };

  // Add item row
  const addItem = () => {
    setItems([...items, {
      key: `new-${Date.now()}`,
      productId: '',
      quantity: 1,
      unitPrice: 0,
      discountPercent: 0,
      taxPercent: 20
    }]);
  };

  // Remove item
  const removeItem = (key: string) => {
    setItems(items.filter(item => item.key !== key));
  };

  // Update item
  const updateItem = (key: string, field: string, value: any) => {
    setItems(items.map(item => 
      item.key === key ? { ...item, [field]: value } : item
    ));
  };

  // Handle product selection
  const handleProductSelect = (key: string, productId: string) => {
    const product = products?.items?.find((p: any) => p.id === productId);
    if (product) {
      updateItem(key, 'productId', productId);
      updateItem(key, 'product', product);
      updateItem(key, 'unitPrice', product.salePrice || 0);
    }
  };

  // Calculate line total
  const calculateLineTotal = (item: FormItem) => {
    const subtotal = item.quantity * item.unitPrice;
    const discountAmount = subtotal * ((item.discountPercent || 0) / 100);
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * ((item.taxPercent || 0) / 100);
    return taxableAmount + taxAmount;
  };

  // Calculate totals
  const totals = React.useMemo(() => {
    let subtotal = 0;
    let discountAmount = 0;
    let taxAmount = 0;

    items.forEach(item => {
      const itemSubtotal = item.quantity * item.unitPrice;
      const itemDiscount = itemSubtotal * ((item.discountPercent || 0) / 100);
      const taxableAmount = itemSubtotal - itemDiscount;
      const itemTax = taxableAmount * ((item.taxPercent || 0) / 100);

      subtotal += itemSubtotal;
      discountAmount += itemDiscount;
      taxAmount += itemTax;
    });

    const totalAmount = subtotal - discountAmount + taxAmount;

    return { subtotal, discountAmount, taxAmount, totalAmount };
  }, [items]);

  // Item columns
  const itemColumns: ColumnsType<FormItem> = [
    {
      title: '#',
      width: 50,
      render: (_, __, index) => index + 1
    },
    {
      title: 'Ürün *',
      dataIndex: 'productId',
      width: 250,
      render: (productId, record) => (
        <Select
          className="w-full"
          showSearch
          placeholder="Ürün seçin"
          optionFilterProp="label"
          value={productId || undefined}
          onChange={(value) => handleProductSelect(record.key, value)}
          options={products?.items?.map((p: any) => ({
            label: `${p.code} - ${p.name}`,
            value: p.id
          }))}
        />
      )
    },
    {
      title: 'Miktar *',
      dataIndex: 'quantity',
      width: 120,
      render: (qty, record) => (
        <InputNumber
          className="w-full"
          min={0.01}
          precision={2}
          value={qty}
          onChange={(value) => updateItem(record.key, 'quantity', value || 0)}
          addonAfter={record.product?.unit || 'Adet'}
        />
      )
    },
    {
      title: 'Birim Fiyat *',
      dataIndex: 'unitPrice',
      width: 130,
      render: (price, record) => (
        <InputNumber
          className="w-full"
          min={0}
          precision={2}
          value={price}
          onChange={(value) => updateItem(record.key, 'unitPrice', value || 0)}
          addonAfter={selectedCurrency}
        />
      )
    },
    {
      title: 'İskonto %',
      dataIndex: 'discountPercent',
      width: 100,
      render: (percent, record) => (
        <InputNumber
          className="w-full"
          min={0}
          max={100}
          precision={2}
          value={percent}
          onChange={(value) => updateItem(record.key, 'discountPercent', value || 0)}
          addonAfter="%"
        />
      )
    },
    {
      title: 'KDV %',
      dataIndex: 'taxPercent',
      width: 100,
      render: (percent, record) => (
        <InputNumber
          className="w-full"
          min={0}
          max={100}
          precision={2}
          value={percent}
          onChange={(value) => updateItem(record.key, 'taxPercent', value || 0)}
          addonAfter="%"
        />
      )
    },
    {
      title: 'Toplam',
      width: 130,
      align: 'right',
      render: (_, record) => (
        <span className="font-semibold">
          {formatCurrency(calculateLineTotal(record), selectedCurrency)}
        </span>
      )
    },
    {
      title: '',
      width: 50,
      render: (_, record) => (
        <Button
          type="text"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => removeItem(record.key)}
        />
      )
    }
  ];

  // Form submit
  const handleSubmit = async (values: any) => {
    if (items.length === 0) {
      message.error('En az bir ürün eklemelisiniz');
      return;
    }

    const invalidItems = items.filter(item => !item.productId || item.quantity <= 0 || item.unitPrice < 0);
    if (invalidItems.length > 0) {
      message.error('Lütfen tüm ürün bilgilerini eksiksiz doldurun');
      return;
    }

    const data: CreateQuotationRequest = {
      quotationDate: values.quotationDate.format('YYYY-MM-DD'),
      validUntil: values.validUntil.format('YYYY-MM-DD'),
      customerId: values.customerId,
      currency: values.currency,
      notes: values.notes,
      termsAndConditions: values.termsAndConditions,
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountPercent: item.discountPercent,
        taxPercent: item.taxPercent,
        description: item.description,
        notes: item.notes
      }))
    };

    await saveMutation.mutateAsync(data);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/quotations')}
          className="mb-4"
        >
          Geri
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {id ? 'Teklif Düzenle' : 'Yeni Teklif Oluştur'}
        </h1>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          quotationDate: dayjs(),
          validUntil: dayjs().add(30, 'days'),
          currency: 'TRY'
        }}
      >
        {/* Basic Info */}
        <Card title="Genel Bilgiler" className="mb-4">
          <Row gutter={16}>
            <Col xs={24} sm={12} md={6}>
              <Form.Item
                name="quotationDate"
                label="Teklif Tarihi"
                rules={[{ required: true, message: 'Tarih zorunludur' }]}
              >
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item
                name="validUntil"
                label="Geçerlilik Tarihi"
                rules={[{ required: true, message: 'Geçerlilik tarihi zorunludur' }]}
              >
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item
                name="customerId"
                label="Müşteri"
                rules={[{ required: true, message: 'Müşteri seçimi zorunludur' }]}
              >
                <Select
                  showSearch
                  placeholder="Müşteri seçin"
                  optionFilterProp="label"
                  onChange={handleCustomerChange}
                  options={customers?.items?.map((c: any) => ({
                    label: `${c.code} - ${c.name}`,
                    value: c.id
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item
                name="currency"
                label="Para Birimi"
                rules={[{ required: true, message: 'Para birimi zorunludur' }]}
              >
                <Select
                  disabled
                  options={[
                    { label: 'TRY - Türk Lirası', value: 'TRY' },
                    { label: 'USD - Dolar', value: 'USD' },
                    { label: 'EUR - Euro', value: 'EUR' },
                    { label: 'GBP - Sterlin', value: 'GBP' }
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="notes"
                label="Notlar"
              >
                <Input.TextArea rows={2} placeholder="Teklif notları..." />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="termsAndConditions"
                label="Şartlar ve Koşullar"
              >
                <Input.TextArea rows={2} placeholder="Ödeme şartları, teslimat koşulları..." />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Items */}
        <Card 
          title="Ürünler" 
          className="mb-4"
          extra={
            <Button 
              type="dashed" 
              icon={<PlusOutlined />}
              onClick={addItem}
            >
              Ürün Ekle
            </Button>
          }
        >
          <Table
            columns={itemColumns}
            dataSource={items}
            rowKey="key"
            pagination={false}
            scroll={{ x: 1000 }}
            locale={{
              emptyText: 'Henüz ürün eklenmedi. "Ürün Ekle" butonuna tıklayın.'
            }}
          />
        </Card>

        {/* Totals */}
        <Card title="Toplam" className="mb-4">
          <Row gutter={16}>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Ara Toplam"
                value={totals.subtotal}
                precision={2}
                suffix={selectedCurrency}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="İskonto"
                value={totals.discountAmount}
                precision={2}
                suffix={selectedCurrency}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="KDV"
                value={totals.taxAmount}
                precision={2}
                suffix={selectedCurrency}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Genel Toplam"
                value={totals.totalAmount}
                precision={2}
                suffix={selectedCurrency}
                valueStyle={{ color: '#52c41a', fontSize: '24px', fontWeight: 'bold' }}
              />
            </Col>
          </Row>
        </Card>

        {/* Actions */}
        <Card>
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              size="large"
              loading={saveMutation.isPending}
            >
              {id ? 'Güncelle' : 'Oluştur'}
            </Button>
            <Button
              size="large"
              onClick={() => navigate('/quotations')}
            >
              İptal
            </Button>
          </Space>
        </Card>
      </Form>
    </div>
  );
}

