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
      message.error('Müşteriler yüklenemedi');
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
      message.error('Ürünler yüklenemedi');
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
      message.error(error.message || 'Fatura yüklenirken hata oluştu');
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
      
      message.success('Fatura başarıyla oluşturuldu');
      console.log('✅ Fatura oluşturuldu');
      setSubmitting(false);
      
      // Listeye yönlendir
      navigate('/invoices');
    } catch (error: any) {
      setSubmitting(false);
      message.error(error.message || 'Fatura oluşturulurken hata oluştu');
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
      
      message.success('Fatura başarıyla güncellendi');
      console.log('✅ Fatura güncellendi');
      setSubmitting(false);
      
      navigate('/invoices');
    } catch (error: any) {
      setSubmitting(false);
      message.error(error.message || 'Fatura güncellenirken hata oluştu');
      console.error('❌ Fatura güncelleme hatası:', error);
    }
  };

  /**
   * Form submit handler
   */
  const handleSubmit = async (values: any) => {
    // Items kontrolü
    if (items.length === 0) {
      message.error('En az bir ürün eklemelisiniz');
      return;
    }
    
    // Her item'ın productId'si olmalı
    const hasInvalidItems = items.some(item => !item.productId);
    if (hasInvalidItems) {
      message.error('Tüm satırlarda ürün seçili olmalıdır');
      return;
    }
    
    // Her item'ın quantity'si > 0 olmalı
    const hasZeroQuantity = items.some(item => item.quantity <= 0);
    if (hasZeroQuantity) {
      message.error('Miktar 0\'dan büyük olmalıdır');
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
        <Spin size="large" tip="Fatura yükleniyor..." />
      </div>
    );
  }

  const totals = calculateTotals();

  return (
    <PageContainer
      header={{
        title: isEditMode ? 'Fatura Düzenle' : 'Yeni Fatura',
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
        <Card title="Fatura Bilgileri" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="customerId"
                label="Müşteri"
                rules={[{ required: true, message: 'Müşteri seçimi zorunludur' }]}
              >
                <Select
                  placeholder="Müşteri seçiniz"
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
                label="Fatura Tarihi"
                rules={[{ required: true, message: 'Fatura tarihi zorunludur' }]}
              >
                <Input type="date" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="dueDate"
                label="Vade Tarihi"
                rules={[{ required: true, message: 'Vade tarihi zorunludur' }]}
              >
                <Input type="date" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="isOfficial"
                label="Fatura Tipi"
                rules={[{ required: true, message: 'Fatura tipi seçimi zorunludur' }]}
              >
                <Select>
                  <Select.Option value={true}>Resmi</Select.Option>
                  <Select.Option value={false}>Gayri Resmi</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="currencyCode"
                label="Para Birimi"
                rules={[{ required: true, message: 'Para birimi seçimi zorunludur' }]}
              >
                <Select>
                  <Select.Option value="TRY">Türk Lirası</Select.Option>
                  <Select.Option value="USD">Amerikan Doları</Select.Option>
                  <Select.Option value="EUR">Euro</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="notes" label="Notlar">
                <Input.TextArea rows={2} placeholder="Fatura notları..." />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Fatura Kalemleri */}
        <Card 
          title={
            <Space>
              <CalculatorOutlined />
              Fatura Kalemleri
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={handleAddItem}
                size="small"
              >
                Kalem Ekle
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
                title: 'Ürün',
                dataIndex: 'productId',
                key: 'productId',
                width: 200,
                render: (_, record, index) => (
                  <Select
                    value={record.productId}
                    placeholder="Ürün seçiniz"
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
                title: 'Miktar',
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
                title: 'Birim Fiyat',
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
                title: 'İndirim %',
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
                title: 'KDV %',
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
                title: 'Tutar',
                dataIndex: 'amount',
                key: 'amount',
                width: 120,
                align: 'right' as const,
                render: (amount) => (
                  <strong>{formatCurrency(amount)}</strong>
                ),
              },
              {
                title: 'İşlemler',
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
              Fatura Toplamları
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          <Row gutter={16}>
            <Col span={6}>
              <Statistic
                title="Ara Toplam"
                value={totals.subtotal}
                precision={2}
                prefix="₺"
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="İndirim"
                value={totals.discountAmount}
                precision={2}
                prefix="₺"
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="KDV"
                value={totals.taxAmount}
                precision={2}
                prefix="₺"
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Genel Toplam"
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
              İptal
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={submitting}
            >
              {isEditMode ? 'Güncelle' : 'Kaydet'}
            </Button>
          </Space>
        </Card>
      </Form>
    </PageContainer>
  );
};