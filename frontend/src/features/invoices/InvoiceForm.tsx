import { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Select,
  DatePicker,
  Switch,
  message,
  Spin,
  Row,
  Col,
} from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { invoicesApi } from '@/api/invoices';
import { customersApi } from '@/api/customers';
import type { Customer } from '@/types/customer';
import type { CreateInvoiceRequest, InvoiceItem } from '@/types/invoice';
import { InvoiceType } from '@/types/invoice';
import { InvoiceItems } from './components/InvoiceItems';
import { InvoiceSummary } from './components/InvoiceSummary';

// Fatura formu - FULL VERSION (Part 2)
export const InvoiceForm = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [currency, setCurrency] = useState('TRY');

  const isEditMode = !!id;

  useEffect(() => {
    loadCustomers();
    if (isEditMode) {
      loadInvoice();
    }
  }, [id]);

  const loadCustomers = async () => {
    try {
      const response = await customersApi.getAll({ isActive: true });
      if (response.success) {
        setCustomers(response.data);
      }
    } catch (error) {
      console.error('Müşteriler yüklenemedi');
    }
  };

  const loadInvoice = async () => {
    setLoading(true);
    try {
      const response = await invoicesApi.getById(id!);
      if (response.success) {
        const invoice = response.data;
        form.setFieldsValue({
          ...invoice,
          invoiceDate: dayjs(invoice.invoiceDate),
          dueDate: invoice.dueDate ? dayjs(invoice.dueDate) : null,
        });

        const customer = customers.find((c) => c.id === invoice.customerId);
        if (customer) {
          setSelectedCustomer(customer);
        }

        setItems(invoice.items || []);
        setCurrency(invoice.currency);
      }
    } catch (error) {
      message.error('Fatura yüklenemedi');
      navigate('/invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    if (customer) {
      setSelectedCustomer(customer);
      const newCurrency = customer.currency;
      form.setFieldValue('currency', newCurrency);
      setCurrency(newCurrency);

      const invoiceDate = form.getFieldValue('invoiceDate');
      if (invoiceDate && customer.paymentTermDays) {
        const dueDate = invoiceDate.add(customer.paymentTermDays, 'day');
        form.setFieldValue('dueDate', dueDate);
      }
    }
  };

  const handleCurrencyChange = (value: string) => {
    setCurrency(value);
  };

  const handleSubmit = async (values: any) => {
    // Validasyon
    if (items.length === 0) {
      message.error('En az bir fatura kalemi ekleyin!');
      return;
    }

    // Tüm satırlarda ürün seçilmiş mi?
    const hasEmptyProduct = items.some((item) => !item.productId);
    if (hasEmptyProduct) {
      message.error('Tüm satırlarda ürün seçili olmalı!');
      return;
    }

    setSaving(true);
    try {
      const data: CreateInvoiceRequest = {
        ...values,
        invoiceDate: values.invoiceDate.format('YYYY-MM-DD'),
        dueDate: values.dueDate?.format('YYYY-MM-DD'),
        items: items.map((item) => ({
          productId: item.productId,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountRate: item.discountRate,
          vatRate: item.vatRate,
        })),
      };

      if (isEditMode) {
        await invoicesApi.update(id!, data);
        message.success('Fatura güncellendi');
      } else {
        await invoicesApi.create(data);
        message.success('Fatura oluşturuldu');
      }

      navigate('/invoices');
    } catch (error: any) {
      message.error(
        error.response?.data?.message ||
          (isEditMode ? 'Fatura güncellenemedi' : 'Fatura oluşturulamadı')
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
          {isEditMode ? 'Fatura Düzenle' : 'Yeni Fatura'}
        </h1>
        <p className="text-gray-500">
          {isEditMode
            ? 'Fatura bilgilerini güncelleyin'
            : 'Yeni fatura oluşturun'}
        </p>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
        initialValues={{
          type: InvoiceType.Sales,
          invoiceDate: dayjs(),
          currency: 'TRY',
          isOfficial: true,
        }}
      >
        <Card title="Fatura Bilgileri" className="mb-4">
          <Row gutter={16}>
            {/* Müşteri */}
            <Col span={12}>
              <Form.Item
                name="customerId"
                label="Müşteri"
                rules={[{ required: true, message: 'Müşteri seçin!' }]}
              >
                <Select
                  showSearch
                  placeholder="Müşteri seçin"
                  size="large"
                  optionFilterProp="children"
                  onChange={handleCustomerChange}
                  filterOption={(input, option) =>
                    (option?.label ?? '')
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={customers.map((c) => ({
                    label: `${c.name} (${c.code})`,
                    value: c.id,
                  }))}
                />
              </Form.Item>

              {/* Müşteri bilgileri göster */}
              {selectedCustomer && (
                <div className="bg-gray-50 p-3 rounded mb-4">
                  <div className="text-sm space-y-1">
                    <div>
                      <strong>Email:</strong> {selectedCustomer.email || '-'}
                    </div>
                    <div>
                      <strong>Telefon:</strong> {selectedCustomer.phone || '-'}
                    </div>
                    <div>
                      <strong>Bakiye:</strong>{' '}
                      <span
                        className={
                          selectedCustomer.currentBalance > 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }
                      >
                        {selectedCustomer.currentBalance.toFixed(2)}{' '}
                        {selectedCustomer.currency}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </Col>

            {/* Fatura Türü */}
            <Col span={12}>
              <Form.Item
                name="type"
                label="Fatura Türü"
                rules={[{ required: true, message: 'Fatura türü gerekli!' }]}
              >
                <Select size="large">
                  <Select.Option value={InvoiceType.Sales}>
                    Satış Faturası
                  </Select.Option>
                  <Select.Option value={InvoiceType.Purchase}>
                    Alış Faturası
                  </Select.Option>
                  <Select.Option value={InvoiceType.SalesReturn}>
                    Satış İadesi
                  </Select.Option>
                  <Select.Option value={InvoiceType.PurchaseReturn}>
                    Alış İadesi
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>

            {/* Tarih */}
            <Col span={8}>
              <Form.Item
                name="invoiceDate"
                label="Fatura Tarihi"
                rules={[{ required: true, message: 'Tarih gerekli!' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  size="large"
                  format="DD.MM.YYYY"
                />
              </Form.Item>
            </Col>

            {/* Vade Tarihi */}
            <Col span={8}>
              <Form.Item name="dueDate" label="Vade Tarihi">
                <DatePicker
                  style={{ width: '100%' }}
                  size="large"
                  format="DD.MM.YYYY"
                />
              </Form.Item>
            </Col>

            {/* Para Birimi */}
            <Col span={8}>
              <Form.Item
                name="currency"
                label="Para Birimi"
                rules={[{ required: true, message: 'Para birimi gerekli!' }]}
              >
                <Select size="large" onChange={handleCurrencyChange}>
                  <Select.Option value="TRY">🇹🇷 TRY</Select.Option>
                  <Select.Option value="USD">🇺🇸 USD</Select.Option>
                  <Select.Option value="EUR">🇪🇺 EUR</Select.Option>
                  <Select.Option value="GBP">🇬🇧 GBP</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            {/* Resmi/Gayriresmi */}
            <Col span={12}>
              <Form.Item
                name="isOfficial"
                label="Fatura Tipi"
                valuePropName="checked"
              >
                <div className="flex items-center gap-4">
                  <Switch
                    checkedChildren="Resmi"
                    unCheckedChildren="Gayriresmi"
                  />
                  <span className="text-sm text-gray-500">
                    {form.getFieldValue('isOfficial')
                      ? '✅ Resmi fatura (e-Fatura)'
                      : '⚠️ Gayriresmi fatura (GR kuyruğuna girecek)'}
                  </span>
                </div>
              </Form.Item>
            </Col>

            {/* Notlar */}
            <Col span={12}>
              <Form.Item name="notes" label="Müşteri Notu (Faturada görünür)">
                <Input.TextArea 
                  rows={2} 
                  size="large"
                  placeholder="Müşteriye gösterilecek notlar..."
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="internalNotes" label="Dahili Not (Gizli)">
                <Input.TextArea 
                  rows={2} 
                  size="large"
                  placeholder="Sadece şirket içi notlar..."
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Fatura Kalemleri */}
        <Card title="Fatura Kalemleri" className="mb-4">
          <InvoiceItems value={items} onChange={setItems} currency={currency} />
        </Card>

        {/* Fatura Özeti */}
        {items.length > 0 && (
          <InvoiceSummary items={items} currency={currency} />
        )}

        {/* Buttons */}
        <div className="mt-6 flex gap-4">
          <Button
            type="primary"
            htmlType="submit"
            loading={saving}
            size="large"
            disabled={items.length === 0}
          >
            {isEditMode ? 'Güncelle' : 'Oluştur'}
          </Button>
          <Button size="large" onClick={() => navigate('/invoices')}>
            İptal
          </Button>
        </div>
      </Form>
    </div>
  );
};

