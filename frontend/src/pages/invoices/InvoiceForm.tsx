import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  PageContainer,
  ProForm,
  ProFormText,
  ProFormSelect,
  ProFormDatePicker,
  ProFormTextArea
} from '@ant-design/pro-components';
import {
  Card,
  Row,
  Col,
  Divider,
  Button,
  Space,
  InputNumber,
  Select,
  Alert
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  SearchOutlined,
  SaveOutlined,
  CheckOutlined
} from '@ant-design/icons';
import { useMessage } from '../../hooks/useMessage';
import { usePartners } from '../../hooks/usePartners';
import { useProducts } from '../../hooks/useProducts';
import { invoiceService, CreateInvoiceDto, InvoiceItem } from '../../services/invoiceService';
import { formatCurrency } from '../../utils/formatters';
import dayjs from 'dayjs';
import './InvoiceForm.css';

/**
 * Fatura oluşturma/düzenleme formu
 * Line item'ları dinamik olarak ekle/çıkar
 * Real-time hesaplamalar (iskonto, KDV, toplam)
 */
export const InvoiceForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const message = useMessage();
  const [form] = ProForm.useForm();

  // State
  const [invoiceType, setInvoiceType] = useState<'sales' | 'purchase'>('sales');
  const [items, setItems] = useState<Partial<InvoiceItem>[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [totalTax, setTotalTax] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Hooks
  const { data: partnersData } = usePartners({ pageSize: 100 });
  const { data: productsData } = useProducts({ pageSize: 100, isActive: true });

  /**
   * Fatura numarası oluştur
   */
  useEffect(() => {
    const generateNumber = async () => {
      try {
        const number = await invoiceService.generateInvoiceNumber(invoiceType);
        form.setFieldValue('invoiceNumber', number);
      } catch (error) {
        console.error('Invoice number generation failed:', error);
      }
    };

    if (!id) {
      generateNumber();
    }
  }, [invoiceType, id, form]);

  /**
   * Düzenleme modundaysa mevcut faturayı yükle
   */
  useEffect(() => {
    const loadInvoice = async () => {
      if (id) {
        try {
          const invoice = await invoiceService.getInvoiceById(id);
          form.setFieldsValue({
            invoiceNumber: invoice.invoiceNumber,
            type: invoice.type,
            partnerId: invoice.partnerId,
            invoiceDate: dayjs(invoice.invoiceDate),
            dueDate: invoice.dueDate ? dayjs(invoice.dueDate) : undefined,
            notes: invoice.notes
          });
          setInvoiceType(invoice.type);
          setItems(invoice.items);
        } catch (error) {
          message.error(t('invoices.loadError'));
          navigate('/invoices/list');
        }
      }
    };

    loadInvoice();
  }, [id, form, message, navigate, t]);

  /**
   * Line item hesaplamaları
   * Her satır değiştiğinde toplam hesapla
   */
  const calculateLineItem = (item: Partial<InvoiceItem>): Partial<InvoiceItem> => {
    const quantity = item.quantity || 0;
    const unitPrice = item.unitPrice || 0;
    const discount = item.discount || 0;
    const taxRate = item.taxRate || 0;

    // Ara toplam (iskonto öncesi)
    const lineTotal = quantity * unitPrice;

    // İskonto tutarı
    const discountAmount = (lineTotal * discount) / 100;

    // Vergi matrahı (iskonto sonrası)
    const taxableAmount = lineTotal - discountAmount;

    // KDV tutarı
    const taxAmount = (taxableAmount * taxRate) / 100;

    // Toplam tutar (KDV dahil)
    const totalAmount = taxableAmount + taxAmount;

    return {
      ...item,
      discountAmount,
      taxAmount,
      totalAmount
    };
  };

  /**
   * Tüm fatura toplamlarını hesapla
   */
  const calculateTotals = (itemsList: Partial<InvoiceItem>[]) => {
    let sub = 0;
    let disc = 0;
    let tax = 0;

    itemsList.forEach(item => {
      const quantity = item.quantity || 0;
      const unitPrice = item.unitPrice || 0;
      
      sub += quantity * unitPrice;
      disc += item.discountAmount || 0;
      tax += item.taxAmount || 0;
    });

    const total = sub - disc + tax;

    setSubtotal(sub);
    setTotalDiscount(disc);
    setTotalTax(tax);
    setGrandTotal(total);
  };

  /**
   * Ürün seçildiğinde satır bilgilerini doldur
   */
  const handleProductSelect = (productId: string, index: number) => {
    const product = productsData?.items.find(p => p.id === productId);
    if (product) {
      const newItems = [...items];
      newItems[index] = {
        ...newItems[index],
        productId: product.id,
        productCode: product.code,
        productName: product.name,
        unit: product.unit,
        unitPrice: invoiceType === 'sales' ? product.salePrice : product.purchasePrice,
        taxRate: product.taxRate,
        quantity: newItems[index]?.quantity || 1,
        discount: 0
      };

      // Hesapla
      newItems[index] = calculateLineItem(newItems[index]);
      setItems(newItems);
      calculateTotals(newItems);
    }
  };

  /**
   * Satır değeri değiştiğinde
   */
  const handleLineChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };

    // Yeniden hesapla
    newItems[index] = calculateLineItem(newItems[index]);
    setItems(newItems);
    calculateTotals(newItems);
  };

  /**
   * Satır sil
   */
  const handleRemoveLine = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    calculateTotals(newItems);
  };

  /**
   * Yeni satır ekle
   */
  const handleAddLine = () => {
    setItems([
      ...items,
      {
        quantity: 1,
        discount: 0,
        taxRate: 18
      }
    ]);
  };

  /**
   * Form submit - Fatura kaydet
   */
  const handleSubmit = async (values: any) => {
    if (items.length === 0) {
      message.error(t('invoices.validation.noItems'));
      return;
    }

    // Tüm satırlarda ürün seçilmiş mi kontrol et
    const hasEmptyItems = items.some(item => !item.productId);
    if (hasEmptyItems) {
      message.error(t('invoices.validation.emptyItems'));
      return;
    }

    setLoading(true);

    try {
      const invoiceData: CreateInvoiceDto = {
        invoiceNumber: values.invoiceNumber,
        type: invoiceType,
        partnerId: values.partnerId,
        invoiceDate: values.invoiceDate.format('YYYY-MM-DD'),
        dueDate: values.dueDate?.format('YYYY-MM-DD'),
        items: items as InvoiceItem[],
        notes: values.notes
      };

      if (id) {
        await invoiceService.updateInvoice(id, { ...invoiceData, id });
        message.success(t('invoices.updateSuccess'));
      } else {
        await invoiceService.createInvoice(invoiceData);
        message.success(t('invoices.createSuccess'));
      }

      navigate('/invoices/list');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || t('invoices.saveError');
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Faturayı kaydet ve onayla
   */
  const handleSaveAndApprove = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();

      // Önce kaydet
      const invoiceData: CreateInvoiceDto = {
        invoiceNumber: values.invoiceNumber,
        type: invoiceType,
        partnerId: values.partnerId,
        invoiceDate: values.invoiceDate.format('YYYY-MM-DD'),
        dueDate: values.dueDate?.format('YYYY-MM-DD'),
        items: items as InvoiceItem[],
        notes: values.notes
      };

      let invoiceId = id;

      if (!id) {
        const newInvoice = await invoiceService.createInvoice(invoiceData);
        invoiceId = newInvoice.id;
      }

      // Sonra onayla
      if (invoiceId) {
        await invoiceService.approveInvoice(invoiceId);
        message.success(t('invoices.approveSuccess'));
        navigate('/invoices/list');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || t('invoices.approveError');
      message.error(errorMessage);
    }
  };

  return (
    <PageContainer
      header={{
        title: id ? t('invoices.edit') : t('invoices.create'),
        breadcrumb: {
          items: [
            { title: t('menu.home'), path: '/' },
            { title: t('menu.invoices'), path: '/invoices/list' },
            { title: id ? t('common.edit') : t('common.create') }
          ]
        }
      }}
    >
      <ProForm
        form={form}
        onFinish={handleSubmit}
        submitter={{
          render: (_, dom) => (
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => navigate('/invoices/list')}>
                {t('common.cancel')}
              </Button>
              <Button
                type="primary"
                loading={loading}
                onClick={() => form.submit()}
                icon={<SaveOutlined />}
              >
                {t('common.save')}
              </Button>
              <Button
                type="primary"
                loading={loading}
                onClick={handleSaveAndApprove}
                icon={<CheckOutlined />}
                style={{ background: '#52c41a', borderColor: '#52c41a' }}
              >
                {t('invoices.saveAndApprove')}
              </Button>
            </Space>
          )
        }}
      >
        <Card title={t('invoices.basicInfo')} style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col xs={24} md={6}>
              <ProFormText
                name="invoiceNumber"
                label={t('invoices.fields.invoiceNumber')}
                rules={[{ required: true }]}
                disabled
              />
            </Col>

            <Col xs={24} md={6}>
              <ProFormSelect
                name="type"
                label={t('invoices.fields.type')}
                valueEnum={{
                  sales: t('invoices.types.sales'),
                  purchase: t('invoices.types.purchase')
                }}
                initialValue="sales"
                rules={[{ required: true }]}
                fieldProps={{
                  onChange: (value) => setInvoiceType(value as 'sales' | 'purchase')
                }}
              />
            </Col>

            <Col xs={24} md={6}>
              <ProFormDatePicker
                name="invoiceDate"
                label={t('invoices.fields.date')}
                rules={[{ required: true }]}
                initialValue={dayjs()}
                width="100%"
              />
            </Col>

            <Col xs={24} md={6}>
              <ProFormDatePicker
                name="dueDate"
                label={t('invoices.fields.dueDate')}
                width="100%"
              />
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <ProFormSelect
                name="partnerId"
                label={
                  invoiceType === 'sales'
                    ? t('invoices.fields.customer')
                    : t('invoices.fields.supplier')
                }
                showSearch
                rules={[{ required: true }]}
                options={partnersData?.items
                  .filter(p =>
                    invoiceType === 'sales'
                      ? p.type === 'customer' || p.type === 'both'
                      : p.type === 'supplier' || p.type === 'both'
                  )
                  .map(p => ({
                    label: `${p.code} - ${p.name}`,
                    value: p.id
                  }))}
                fieldProps={{
                  placeholder: t('invoices.placeholders.selectPartner'),
                  filterOption: (input, option) =>
                    (option?.label?.toString() || '')
                      .toLowerCase()
                      .includes(input.toLowerCase())
                }}
              />
            </Col>

            <Col xs={24} md={12}>
              <ProFormTextArea
                name="notes"
                label={t('invoices.fields.notes')}
                fieldProps={{
                  rows: 1,
                  placeholder: t('invoices.placeholders.notes')
                }}
              />
            </Col>
          </Row>
        </Card>

        {/* Line Items */}
        <Card title={t('invoices.items')} style={{ marginBottom: 16 }}>
          {items.length === 0 && (
            <Alert
              message={t('invoices.noItems')}
              description={t('invoices.noItemsDesc')}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          <div className="invoice-items-table">
            {/* Table Header */}
            <Row gutter={8} className="invoice-items-header">
              <Col span={8}>{t('invoices.columns.product')}</Col>
              <Col span={2}>{t('invoices.columns.quantity')}</Col>
              <Col span={2}>{t('invoices.columns.unit')}</Col>
              <Col span={3}>{t('invoices.columns.unitPrice')}</Col>
              <Col span={2}>{t('invoices.columns.discount')}</Col>
              <Col span={2}>{t('invoices.columns.taxRate')}</Col>
              <Col span={3}>{t('invoices.columns.total')}</Col>
              <Col span={2} style={{ textAlign: 'center' }}>
                {t('common.actions')}
              </Col>
            </Row>

            {/* Table Rows */}
            {items.map((item, index) => (
              <Row
                key={index}
                gutter={8}
                className="invoice-items-row"
                align="middle"
              >
                {/* Ürün */}
                <Col span={8}>
                  <Select
                    showSearch
                    value={item.productId}
                    onChange={(value) => handleProductSelect(value, index)}
                    options={productsData?.items.map(p => ({
                      label: `${p.code} - ${p.name}`,
                      value: p.id
                    }))}
                    placeholder={t('invoices.placeholders.selectProduct')}
                    style={{ width: '100%' }}
                    filterOption={(input, option) =>
                      (option?.label?.toString() || '')
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    suffixIcon={<SearchOutlined />}
                  />
                </Col>

                {/* Miktar */}
                <Col span={2}>
                  <InputNumber
                    min={0.01}
                    step={1}
                    value={item.quantity}
                    onChange={(value) => handleLineChange(index, 'quantity', value)}
                    style={{ width: '100%' }}
                    precision={2}
                  />
                </Col>

                {/* Birim */}
                <Col span={2}>
                  <span>{item.unit}</span>
                </Col>

                {/* Birim Fiyat */}
                <Col span={3}>
                  <InputNumber
                    min={0}
                    step={0.01}
                    value={item.unitPrice}
                    onChange={(value) => handleLineChange(index, 'unitPrice', value)}
                    style={{ width: '100%' }}
                    precision={2}
                    formatter={value => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value!.replace(/₺\s?|(,*)/g, '')}
                  />
                </Col>

                {/* İskonto % */}
                <Col span={2}>
                  <InputNumber
                    min={0}
                    max={100}
                    value={item.discount}
                    onChange={(value) => handleLineChange(index, 'discount', value)}
                    style={{ width: '100%' }}
                    precision={0}
                    formatter={value => `${value}%`}
                    parser={value => value!.replace('%', '')}
                  />
                </Col>

                {/* KDV % */}
                <Col span={2}>
                  <Select
                    value={item.taxRate}
                    onChange={(value) => handleLineChange(index, 'taxRate', value)}
                    options={[
                      { label: '%0', value: 0 },
                      { label: '%1', value: 1 },
                      { label: '%8', value: 8 },
                      { label: '%18', value: 18 }
                    ]}
                    style={{ width: '100%' }}
                  />
                </Col>

                {/* Toplam */}
                <Col span={3}>
                  <strong>{formatCurrency(item.totalAmount || 0)}</strong>
                </Col>

                {/* Sil butonu */}
                <Col span={2} style={{ textAlign: 'center' }}>
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveLine(index)}
                  />
                </Col>
              </Row>
            ))}

            {/* Yeni Satır Ekle Butonu */}
            <Button
              type="dashed"
              block
              icon={<PlusOutlined />}
              onClick={handleAddLine}
              style={{ marginTop: 16 }}
            >
              {t('invoices.addItem')}
            </Button>
          </div>
        </Card>

        {/* Toplamlar */}
        <Card>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              {/* Sol taraf - Notlar vs. için boş alan */}
            </Col>

            <Col xs={24} md={12}>
              <div className="invoice-totals">
                <Row justify="space-between" style={{ marginBottom: 8 }}>
                  <Col>
                    <strong>{t('invoices.totals.subtotal')}:</strong>
                  </Col>
                  <Col>
                    <span>{formatCurrency(subtotal)}</span>
                  </Col>
                </Row>

                <Row justify="space-between" style={{ marginBottom: 8 }}>
                  <Col>
                    <strong>{t('invoices.totals.discount')}:</strong>
                  </Col>
                  <Col>
                    <span style={{ color: '#ff4d4f' }}>
                      -{formatCurrency(totalDiscount)}
                    </span>
                  </Col>
                </Row>

                <Row justify="space-between" style={{ marginBottom: 8 }}>
                  <Col>
                    <strong>{t('invoices.totals.tax')}:</strong>
                  </Col>
                  <Col>
                    <span>{formatCurrency(totalTax)}</span>
                  </Col>
                </Row>

                <Divider style={{ margin: '12px 0' }} />

                <Row justify="space-between">
                  <Col>
                    <strong style={{ fontSize: 18 }}>
                      {t('invoices.totals.grandTotal')}:
                    </strong>
                  </Col>
                  <Col>
                    <strong style={{ fontSize: 18, color: '#1890ff' }}>
                      {formatCurrency(grandTotal)}
                    </strong>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
        </Card>
      </ProForm>
    </PageContainer>
  );
};
