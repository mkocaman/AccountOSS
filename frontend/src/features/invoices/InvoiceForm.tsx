import React, { useState, useEffect } from 'react';
import { 
  PageContainer
} from '@ant-design/pro-components';
import { 
  Card, 
  message, 
  Space, 
  Button, 
  Form, 
  Table, 
  Input, 
  Select, 
  Statistic, 
  Row, 
  Col,
  Spin
} from 'antd';
import { 
  PlusOutlined, 
  DeleteOutlined, 
  SaveOutlined,
  CalculatorOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { 
  createInvoice, 
  updateInvoice, 
  getInvoice 
} from '@/services/invoiceService';
// Mock services - gerçek servisler eklenecek
const getCustomers = async () => ({ items: [] });
const getProducts = async () => ({ items: [] });

// Mock types
interface Customer {
  id: string;
  name: string;
  code: string;
}

interface Product {
  id: string;
  name: string;
  code: string;
  price: number;
}

// Fatura kalemi DTO'su
interface InvoiceItemDto {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discountPercentage: number;
  taxRate: number;
  amount: number;
}

// Para birimi formatı
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Fatura oluşturma/düzenleme formu - Gerçek API ile entegre edilmiş
 * Create ve Edit mode'ları destekler, real-time calculation ve validation
 */
export const InvoiceForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  // State yönetimi
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<InvoiceItemDto[]>([]);
  const [isEditMode] = useState(!!id);

  /**
   * Müşterileri yükle
   */
  const loadCustomers = async () => {
    try {
      const response = await getCustomers();
      setCustomers(response.items);
      console.log('✅ Müşteriler yüklendi:', response.items.length);
    } catch (error: any) {
      message.error(t('invoice.errors.loadCustomersFailed'));
      console.error('❌ Müşteri yükleme hatası:', error);
    }
  };

  /**
   * Ürünleri yükle
   */
  const loadProducts = async () => {
    try {
      const response = await getProducts();
      setProducts(response.items);
      console.log('✅ Ürünler yüklendi:', response.items.length);
    } catch (error: any) {
      message.error(t('invoice.errors.loadProductsFailed'));
      console.error('❌ Ürün yükleme hatası:', error);
    }
  };

  /**
   * Fatura verilerini yükle (edit mode)
   */
  const loadInvoice = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      console.log('📄 Fatura yükleniyor:', id);
      
      const invoice = await getInvoice(id);
      
      // Form'u doldur
      form.setFieldsValue({
        customerId: invoice.partnerId,
        invoiceDate: dayjs(invoice.invoiceDate),
        dueDate: dayjs(invoice.dueDate),
        isOfficial: true, // Mock value
        currencyCode: invoice.currency,
        notes: invoice.notes,
      });
      
      // Items'ı set et
      const invoiceItems: InvoiceItemDto[] = invoice.items.map((item, index) => ({
        id: item.id || index.toString(),
        productId: item.productId,
        productName: item.productName || '',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountPercentage: 0, // Mock value
        taxRate: item.taxRate || 18,
        amount: item.unitPrice * item.quantity, // Mock calculation
      }));
      setItems(invoiceItems);
      
      console.log('✅ Fatura yüklendi:', invoice);
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      message.error(error.message || t('invoice.errors.loadDetailFailed'));
      console.error('❌ Fatura yükleme hatası:', error);
      navigate('/invoices');
    }
  };

  /**
   * Sayfa yüklendiğinde verileri çek
   */
  useEffect(() => {
    loadCustomers();
    loadProducts();
    if (id) {
      loadInvoice();
    } else {
      // Create mode'da varsayılan item ekle
      setItems([{
        id: '1',
        productId: '',
        productName: '',
        quantity: 1,
        unitPrice: 0,
        discountPercentage: 0,
        taxRate: 18,
        amount: 0,
      }]);
    }
  }, [id]);

  /**
   * Fatura kalemi ekleme
   */
  const handleAddItem = () => {
    const newItem: InvoiceItemDto = {
      id: Date.now().toString(),
      productId: '',
      productName: '',
      quantity: 1,
      unitPrice: 0,
      discountPercentage: 0,
      taxRate: 18,
      amount: 0,
    };
    setItems([...items, newItem]);
  };

  /**
   * Fatura kalemi güncelleme
   */
  const handleUpdateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };
    
    // Ürün seçildiğinde fiyatı doldur
    if (field === 'productId') {
      const product = products.find(p => p.id === value);
      if (product) {
        newItems[index].productName = product.name;
        newItems[index].unitPrice = product.price;
      }
    }
    
    // Tutarı hesapla
    const item = newItems[index];
    const subtotal = item.quantity * item.unitPrice;
    const discountAmount = subtotal * (item.discountPercentage / 100);
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * (item.taxRate / 100);
    newItems[index].amount = taxableAmount + taxAmount;
    
    setItems(newItems);
  };

  /**
   * Fatura kalemi silme
   */
  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  /**
   * Fatura toplamlarını hesapla
   */
  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice);
    }, 0);
    
    const discountAmount = items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      return sum + (itemSubtotal * (item.discountPercentage / 100));
    }, 0);
    
    const taxAmount = items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      const itemDiscount = itemSubtotal * (item.discountPercentage / 100);
      const taxableAmount = itemSubtotal - itemDiscount;
      return sum + (taxableAmount * (item.taxRate / 100));
    }, 0);
    
    const total = subtotal - discountAmount + taxAmount;
    
    return {
      subtotal,
      discountAmount,
      taxAmount,
      total,
    };
  };

  /**
   * Create mode - Fatura oluşturma
   */
  const handleCreate = async (values: any) => {
    try {
      setSubmitting(true);
      console.log('📝 Fatura oluşturuluyor:', values);
      
      // DTO'yu hazırla
      const createDto: any = {
        partnerId: values.customerId,
        invoiceDate: values.invoiceDate.format('YYYY-MM-DD'),
        dueDate: values.dueDate.format('YYYY-MM-DD'),
        currency: values.currencyCode || 'TRY',
        notes: values.notes,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate || 18,
        })),
      };
      
      // API çağrısı
      await createInvoice(createDto);
      
      message.success(t('invoice.messages.createSuccess'));
      console.log('✅ Fatura oluşturuldu');
      setSubmitting(false);
      
      // Listeye yönlendir
      navigate('/invoices');
    } catch (error: any) {
      setSubmitting(false);
      message.error(error.message || t('invoice.errors.createFailed'));
      console.error('❌ Fatura oluşturma hatası:', error);
    }
  };

  /**
   * Edit mode - Fatura güncelleme
   */
  const handleUpdate = async (values: any) => {
    if (!id) return;
    
    try {
      setSubmitting(true);
      console.log('📝 Fatura güncelleniyor:', values);
      
      const updateDto: any = {
        id,
        partnerId: values.customerId,
        invoiceDate: values.invoiceDate.format('YYYY-MM-DD'),
        dueDate: values.dueDate.format('YYYY-MM-DD'),
        currency: values.currencyCode || 'TRY',
        notes: values.notes,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate || 18,
        })),
      };
      
      await updateInvoice(updateDto);
      
      message.success(t('invoice.messages.updateSuccess'));
      console.log('✅ Fatura güncellendi');
      setSubmitting(false);
      
      navigate('/invoices');
    } catch (error: any) {
      setSubmitting(false);
      message.error(error.message || t('invoice.errors.updateFailed'));
      console.error('❌ Fatura güncelleme hatası:', error);
    }
  };

  /**
   * Form submit handler
   */
  const handleSubmit = async (values: any) => {
    // Items kontrolü
    if (items.length === 0) {
      message.error(t('invoice.messages.addAtLeastOneItem'));
      return;
    }
    
    // Her item'ın productId'si olmalı
    const hasInvalidItems = items.some(item => !item.productId);
    if (hasInvalidItems) {
      message.error(t('invoice.validation.productRequired'));
      return;
    }
    
    // Her item'ın quantity'si > 0 olmalı
    const hasZeroQuantity = items.some(item => item.quantity <= 0);
    if (hasZeroQuantity) {
      message.error(t('invoice.validation.quantityMin'));
      return;
    }
    
    // API çağrısı
    if (id) {
      await handleUpdate(values);
    } else {
      await handleCreate(values);
    }
  };

  // Loading durumunda spinner göster
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" tip={t('invoice.messages.loadingInvoice')} />
      </div>
    );
  }

  const totals = calculateTotals();

  return (
    <PageContainer
      header={{
        title: isEditMode ? t('invoice.editTitle') : t('invoice.createTitle'),
        onBack: () => navigate('/invoices')
      }}
    >
      <Form
        form={form}
        onFinish={handleSubmit}
        layout="vertical"
        initialValues={{
          invoiceDate: dayjs(),
          dueDate: dayjs().add(30, 'day'),
          isOfficial: true,
          currencyCode: 'TRY',
        }}
      >
        {/* Temel Bilgiler */}
        <Card title={`${t('invoice.titleSingle')} Bilgileri`} style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="customerId"
                label={t('invoice.labels.customer')}
                rules={[{ required: true, message: t('invoice.validation.customerRequired') }]}
              >
                <Select
                  placeholder={t('invoice.placeholders.selectCustomer')}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={customers.map(c => ({
                    value: c.id,
                    label: `${c.name} (${c.code})`,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="invoiceDate"
                label={t('invoice.labels.invoiceDate')}
                rules={[{ required: true, message: t('invoice.validation.invoiceDateRequired') }]}
              >
                <Input type="date" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="dueDate"
                label={t('invoice.labels.dueDate')}
                rules={[{ required: true, message: t('invoice.validation.dueDateRequired') }]}
              >
                <Input type="date" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="isOfficial"
                label={t('invoice.labels.invoiceType')}
                rules={[{ required: true, message: t('invoice.validation.typeRequired') }]}
              >
                <Select>
                  <Select.Option value={true}>{t('invoice.labels.official')}</Select.Option>
                  <Select.Option value={false}>{t('invoice.labels.unofficial')}</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="currencyCode"
                label={t('invoice.labels.currency')}
                rules={[{ required: true, message: t('invoice.validation.currencyRequired') }]}
              >
                <Select>
                  <Select.Option value="TRY">Türk Lirası</Select.Option>
                  <Select.Option value="USD">Amerikan Doları</Select.Option>
                  <Select.Option value="EUR">Euro</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="notes" label={t('invoice.labels.notes')}>
                <Input.TextArea rows={2} placeholder={t('invoice.placeholders.enterNotes')} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Fatura Kalemleri */}
        <Card 
          title={
            <Space>
              <CalculatorOutlined />
              {t('invoice.labels.items')}
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={handleAddItem}
                size="small"
              >
                {t('invoice.buttons.addItem')}
              </Button>
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          <Table
            dataSource={items}
            rowKey="id"
            pagination={false}
            size="small"
            columns={[
              {
                title: t('invoice.labels.product'),
                dataIndex: 'productId',
                key: 'productId',
                width: 200,
                render: (_, record, index) => (
                  <Select
                    value={record.productId}
                    placeholder={t('invoice.placeholders.selectProduct')}
                    showSearch
                    style={{ width: '100%' }}
                    onChange={(value) => handleUpdateItem(index, 'productId', value)}
                    options={products.map(p => ({
                      value: p.id,
                      label: `${p.name} (${p.code})`,
                    }))}
                  />
                ),
              },
              {
                title: t('invoice.labels.quantity'),
                dataIndex: 'quantity',
                key: 'quantity',
                width: 100,
                render: (_, record, index) => (
                  <Input
                    type="number"
                    value={record.quantity}
                    min={0.01}
                    step={0.01}
                    onChange={(e) => handleUpdateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                  />
                ),
              },
              {
                title: t('invoice.labels.unitPrice'),
                dataIndex: 'unitPrice',
                key: 'unitPrice',
                width: 120,
                render: (_, record, index) => (
                  <Input
                    type="number"
                    value={record.unitPrice}
                    min={0}
                    step={0.01}
                    prefix="₺"
                    onChange={(e) => handleUpdateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                  />
                ),
              },
              {
                title: t('invoice.labels.discountPercent'),
                dataIndex: 'discountPercentage',
                key: 'discountPercentage',
                width: 100,
                render: (_, record, index) => (
                  <Input
                    type="number"
                    value={record.discountPercentage}
                    min={0}
                    max={100}
                    step={0.01}
                    suffix="%"
                    onChange={(e) => handleUpdateItem(index, 'discountPercentage', parseFloat(e.target.value) || 0)}
                  />
                ),
              },
              {
                title: t('invoice.labels.taxRate'),
                dataIndex: 'taxRate',
                key: 'taxRate',
                width: 100,
                render: (_, record, index) => (
                  <Input
                    type="number"
                    value={record.taxRate}
                    min={0}
                    max={100}
                    step={0.01}
                    suffix="%"
                    onChange={(e) => handleUpdateItem(index, 'taxRate', parseFloat(e.target.value) || 0)}
                  />
                ),
              },
              {
                title: t('invoice.labels.amount'),
                dataIndex: 'amount',
                key: 'amount',
                width: 120,
                align: 'right' as const,
                render: (amount) => (
                  <strong>{formatCurrency(amount)}</strong>
                ),
              },
              {
                title: t('invoice.table.actions'),
                key: 'actions',
                width: 80,
                render: (_, __, index) => (
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    size="small"
                    onClick={() => handleRemoveItem(index)}
                  />
                ),
              },
            ]}
          />
        </Card>

        {/* Fatura Toplamları */}
        <Card 
          title={
            <Space>
              <DollarOutlined />
              {t('invoice.titleSingle')} Toplamları
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          <Row gutter={16}>
            <Col span={6}>
              <Statistic
                title={t('invoice.labels.subtotal')}
                value={totals.subtotal}
                precision={2}
                prefix="₺"
              />
            </Col>
            <Col span={6}>
              <Statistic
                title={t('invoice.labels.discount')}
                value={totals.discountAmount}
                precision={2}
                prefix="₺"
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title={t('invoice.labels.taxRate')}
                value={totals.taxAmount}
                precision={2}
                prefix="₺"
              />
            </Col>
            <Col span={6}>
              <Statistic
                title={t('invoice.labels.grandTotal')}
                value={totals.total}
                precision={2}
                prefix="₺"
                valueStyle={{ color: '#3f8600', fontWeight: 'bold' }}
              />
            </Col>
          </Row>
        </Card>

        {/* Submit Buttons */}
        <Card>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => navigate('/invoices')}>
              {t('invoice.buttons.cancel')}
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={submitting}
            >
              {isEditMode ? t('invoice.buttons.save') : t('invoice.buttons.create')}
            </Button>
          </Space>
        </Card>
      </Form>
    </PageContainer>
  );
};