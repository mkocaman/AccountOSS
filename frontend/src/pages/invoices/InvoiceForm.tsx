import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  DatePicker,
  Select,
  Table,
  Space,
  Typography,
  Card,
  Row,
  Col,
  InputNumber,
  message,
  Divider
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  SendOutlined
} from '@ant-design/icons';
import { useCreateInvoice, useUpdateInvoice, useInvoice, useSuggestInvoiceNumber } from '@/hooks/useInvoice';
import type { CreateInvoiceRequest, UpdateInvoiceRequest, InvoiceItem } from '@/types/invoice';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;

/**
 * Fatura formu - Oluşturma ve düzenleme
 */
const InvoiceForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [form] = Form.useForm();
  const [items, setItems] = useState<InvoiceItem[]>([]);

  const createMutation = useCreateInvoice();
  const updateMutation = useUpdateInvoice();
  const { data: invoiceData } = useInvoice(id || '');
  const { data: suggestedNumber } = useSuggestInvoiceNumber('sales');

  // Form yüklendiğinde veri doldur
  useEffect(() => {
    if (isEdit && invoiceData) {
      form.setFieldsValue({
        invoiceNumber: invoiceData.invoiceNumber,
        invoiceType: invoiceData.invoiceType,
        partnerId: invoiceData.partnerId,
        partnerName: invoiceData.partnerName,
        invoiceDate: dayjs(invoiceData.invoiceDate),
        dueDate: invoiceData.dueDate ? dayjs(invoiceData.dueDate) : null,
        currency: invoiceData.currency,
        description: invoiceData.description,
        notes: invoiceData.notes
      });
      setItems(invoiceData.items || []);
    } else if (!isEdit && suggestedNumber) {
      form.setFieldValue('invoiceNumber', suggestedNumber);
    }
  }, [isEdit, invoiceData, suggestedNumber, form]);

  /**
   * Kalem ekle
   */
  const addItem = () => {
    const newItem: Partial<InvoiceItem> = {
      id: `temp_${Date.now()}`,
      productId: '',
      productCode: '',
      productName: '',
      quantity: 1,
      unitPrice: 0,
      discountRate: 0,
      taxRate: 18, // KDV
      lineNumber: items.length + 1
    };
    setItems([...items, newItem as InvoiceItem]);
  };

  /**
   * Kalem sil
   */
  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    // Sıra numaralarını yeniden düzenle
    const reorderedItems = newItems.map((item, i) => ({
      ...item,
      lineNumber: i + 1
    }));
    setItems(reorderedItems);
  };

  /**
   * Kalem güncelle
   */
  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Hesaplamaları güncelle
    const item = newItems[index];
    const subtotal = item.quantity * item.unitPrice;
    const discountAmount = subtotal * (item.discountRate / 100);
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = afterDiscount * (item.taxRate / 100);
    const totalAmount = afterDiscount + taxAmount;

    newItems[index] = {
      ...item,
      subtotal,
      discountAmount,
      taxAmount,
      totalAmount
    };

    setItems(newItems);
  };

  /**
   * Toplam hesapla
   */
  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const totalDiscount = items.reduce((sum, item) => sum + item.discountAmount, 0);
    const totalTax = items.reduce((sum, item) => sum + item.taxAmount, 0);
    const totalAmount = items.reduce((sum, item) => sum + item.totalAmount, 0);

    return { subtotal, totalDiscount, totalTax, totalAmount };
  };

  /**
   * Form gönder
   */
  const handleSubmit = async (values: any) => {
    if (items.length === 0) {
      message.error('En az bir kalem eklemelisiniz');
      return;
    }

    const formData = {
      ...values,
      invoiceDate: values.invoiceDate.format('YYYY-MM-DD'),
      dueDate: values.dueDate?.format('YYYY-MM-DD'),
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountRate: item.discountRate,
        taxRate: item.taxRate,
        description: item.description
      }))
    };

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ ...formData, id });
      } else {
        await createMutation.mutateAsync(formData);
      }
      navigate('/invoices');
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const totals = calculateTotals();
  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Title level={2}>
          {isEdit ? 'Fatura Düzenle' : 'Yeni Fatura'}
        </Title>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            invoiceType: 'sales',
            currency: 'TRY',
            exchangeRate: 1,
            invoiceDate: dayjs()
          }}
        >
          <Card title="Fatura Bilgileri">
            <Row gutter={16}>
              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  name="invoiceNumber"
                  label="Fatura No"
                  rules={[{ required: true, message: 'Fatura numarası gerekli' }]}
                >
                  <Input placeholder="Fatura numarası" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  name="invoiceType"
                  label="Fatura Tipi"
                  rules={[{ required: true }]}
                >
                  <Select>
                    <Option value="sales">Satış Faturası</Option>
                    <Option value="purchase">Alış Faturası</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  name="invoiceDate"
                  label="Fatura Tarihi"
                  rules={[{ required: true }]}
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  name="dueDate"
                  label="Vade Tarihi"
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="partnerId"
                  label="Cari"
                  rules={[{ required: true, message: 'Cari seçimi gerekli' }]}
                >
                  <Select
                    placeholder="Cari seçin"
                    showSearch
                    optionFilterProp="children"
                  >
                    {/* TODO: Partner listesi */}
                    <Option value="1">Test Cari 1</Option>
                    <Option value="2">Test Cari 2</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="currency"
                  label="Para Birimi"
                >
                  <Select>
                    <Option value="TRY">Türk Lirası</Option>
                    <Option value="USD">Amerikan Doları</Option>
                    <Option value="EUR">Euro</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24}>
                <Form.Item
                  name="description"
                  label="Açıklama"
                >
                  <Input.TextArea rows={3} placeholder="Fatura açıklaması" />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card 
            title="Fatura Kalemleri"
            extra={
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={addItem}
              >
                Kalem Ekle
              </Button>
            }
          >
            <Table
              dataSource={items}
              pagination={false}
              size="small"
              columns={[
                {
                  title: 'Ürün',
                  dataIndex: 'productName',
                  key: 'productName',
                  width: 200,
                  render: (_, record, index) => (
                    <Input
                      value={record.productName}
                      onChange={(e) => updateItem(index, 'productName', e.target.value)}
                      placeholder="Ürün adı"
                    />
                  )
                },
                {
                  title: 'Miktar',
                  dataIndex: 'quantity',
                  key: 'quantity',
                  width: 100,
                  render: (_, record, index) => (
                    <InputNumber
                      value={record.quantity}
                      onChange={(value) => updateItem(index, 'quantity', value || 0)}
                      min={0}
                      style={{ width: '100%' }}
                    />
                  )
                },
                {
                  title: 'Birim Fiyat',
                  dataIndex: 'unitPrice',
                  key: 'unitPrice',
                  width: 120,
                  render: (_, record, index) => (
                    <InputNumber
                      value={record.unitPrice}
                      onChange={(value) => updateItem(index, 'unitPrice', value || 0)}
                      min={0}
                      precision={2}
                      style={{ width: '100%' }}
                    />
                  )
                },
                {
                  title: 'İndirim %',
                  dataIndex: 'discountRate',
                  key: 'discountRate',
                  width: 100,
                  render: (_, record, index) => (
                    <InputNumber
                      value={record.discountRate}
                      onChange={(value) => updateItem(index, 'discountRate', value || 0)}
                      min={0}
                      max={100}
                      style={{ width: '100%' }}
                    />
                  )
                },
                {
                  title: 'KDV %',
                  dataIndex: 'taxRate',
                  key: 'taxRate',
                  width: 100,
                  render: (_, record, index) => (
                    <InputNumber
                      value={record.taxRate}
                      onChange={(value) => updateItem(index, 'taxRate', value || 0)}
                      min={0}
                      style={{ width: '100%' }}
                    />
                  )
                },
                {
                  title: 'Toplam',
                  dataIndex: 'totalAmount',
                  key: 'totalAmount',
                  width: 120,
                  align: 'right',
                  render: (amount) => (
                    <span style={{ fontWeight: 500 }}>
                      {new Intl.NumberFormat('tr-TR', {
                        style: 'currency',
                        currency: 'TRY'
                      }).format(amount)}
                    </span>
                  )
                },
                {
                  title: 'İşlem',
                  key: 'action',
                  width: 80,
                  render: (_, __, index) => (
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeItem(index)}
                    />
                  )
                }
              ]}
            />
          </Card>

          <Card title="Özet">
            <Row gutter={16}>
              <Col xs={24} sm={6}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 14, color: '#666' }}>Ara Toplam</div>
                  <div style={{ fontSize: 18, fontWeight: 500 }}>
                    {new Intl.NumberFormat('tr-TR', {
                      style: 'currency',
                      currency: 'TRY'
                    }).format(totals.subtotal)}
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={6}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 14, color: '#666' }}>İndirim</div>
                  <div style={{ fontSize: 18, fontWeight: 500, color: '#cf1322' }}>
                    -{new Intl.NumberFormat('tr-TR', {
                      style: 'currency',
                      currency: 'TRY'
                    }).format(totals.totalDiscount)}
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={6}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 14, color: '#666' }}>KDV</div>
                  <div style={{ fontSize: 18, fontWeight: 500 }}>
                    {new Intl.NumberFormat('tr-TR', {
                      style: 'currency',
                      currency: 'TRY'
                    }).format(totals.totalTax)}
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={6}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 14, color: '#666' }}>Genel Toplam</div>
                  <div style={{ fontSize: 20, fontWeight: 600, color: '#1890ff' }}>
                    {new Intl.NumberFormat('tr-TR', {
                      style: 'currency',
                      currency: 'TRY'
                    }).format(totals.totalAmount)}
                  </div>
                </div>
              </Col>
            </Row>
          </Card>

          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Space>
              <Button onClick={() => navigate('/invoices')}>
                İptal
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                icon={<SaveOutlined />}
              >
                {isEdit ? 'Güncelle' : 'Kaydet'}
              </Button>
              {!isEdit && (
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isLoading}
                  icon={<SendOutlined />}
                >
                  Kaydet ve Gönder
                </Button>
              )}
            </Space>
          </div>
        </Form>
      </Space>
    </div>
  );
};

export default InvoiceForm;