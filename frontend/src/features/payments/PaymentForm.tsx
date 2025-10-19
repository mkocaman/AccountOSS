import { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Select,
  DatePicker,
  InputNumber,
  message,
  Spin,
  Row,
  Col,
  Alert,
} from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { paymentsApi, cashAccountsApi, bankAccountsApi } from '@/api/payments';
import { partnersApi } from '@/api/partners';
import { invoicesApi } from '@/api/invoices';
import type { Partner } from '@/types/partner';
import type { Invoice } from '@/types/invoice';
import type { CashAccount, BankAccount, CreatePaymentRequest } from '@/types/payment';
import { PaymentType, PaymentMethod } from '@/types/payment';

// Ödeme formu
export const PaymentForm = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [partners, setPartners] = useState<Partner[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [cashAccounts, setCashAccounts] = useState<CashAccount[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.Cash);

  const isEditMode = !!id;

  useEffect(() => {
    loadData();
    if (isEditMode) {
      loadPayment();
    }
  }, [id]);

  const loadData = async () => {
    try {
      const [partnersRes, cashRes, bankRes] = await Promise.all([
        partnersApi.getAll({ pageSize: 1000 }),
        cashAccountsApi.getAll(),
        bankAccountsApi.getAll(),
      ]);

      if (partnersRes.success) setPartners(partnersRes.data.items || partnersRes.data);
      if (cashRes.success) setCashAccounts(cashRes.data);
      if (bankRes.success) setBankAccounts(bankRes.data);
    } catch (error) {
      console.error('Veriler yüklenemedi');
    }
  };

  const loadPayment = async () => {
    setLoading(true);
    try {
      const response = await paymentsApi.getById(id!);
      if (response.success) {
        const payment = response.data;
        form.setFieldsValue({
          ...payment,
          paymentDate: dayjs(payment.paymentDate),
        });

        const partner = partners.find((c) => c.id === payment.customerId);
        if (partner) {
          setSelectedPartner(partner);
        }

        setPaymentMethod(payment.method);
      }
    } catch (error) {
      message.error('Ödeme yüklenemedi');
      navigate('/payments');
    } finally {
      setLoading(false);
    }
  };

  const handlePartnerChange = async (partnerId: string) => {
    const partner = partners.find((c) => c.id === partnerId);
    if (partner) {
      setSelectedPartner(partner);
      form.setFieldValue('currency', partner.currency);

      // Cari hesabın faturalarını yükle
      try {
        const response = await invoicesApi.getAll({
          customerId: partnerId,
          paymentStatus: 0, // Ödenmemiş
          pageSize: 100,
        });
        if (response.success) {
          setInvoices(response.data.items);
        }
      } catch (error) {
        console.error('Faturalar yüklenemedi');
      }
    }
  };

  const handleInvoiceChange = (invoiceId: string) => {
    const invoice = invoices.find((i) => i.id === invoiceId);
    if (invoice) {
      setSelectedInvoice(invoice);
      // Kalan tutarı otomatik doldur
      form.setFieldValue('amount', invoice.grandTotal);
    }
  };

  const handleSubmit = async (values: CreatePaymentRequest) => {
    setSaving(true);
    try {
      const data = {
        ...values,
        paymentDate: values.paymentDate.format('YYYY-MM-DD'),
      };

      if (isEditMode) {
        await paymentsApi.update(id!, data);
        message.success('Ödeme güncellendi');
      } else {
        await paymentsApi.create(data);
        message.success('Ödeme kaydedildi');
      }
      navigate('/payments');
    } catch (error: any) {
      message.error(
        error.response?.data?.message ||
          (isEditMode ? 'Ödeme güncellenemedi' : 'Ödeme kaydedilemedi')
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
          {isEditMode ? 'Ödeme Düzenle' : 'Yeni Ödeme'}
        </h1>
        <p className="text-gray-500">
          {isEditMode ? 'Ödeme bilgilerini güncelleyin' : 'Yeni ödeme kaydı oluşturun'}
        </p>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
        initialValues={{
          type: PaymentType.Receipt,
          method: PaymentMethod.Cash,
          paymentDate: dayjs(),
          currency: 'TRY',
          status: 1,
        }}
      >
        <Card title="Ödeme Bilgileri" className="mb-4">
          <Row gutter={16}>
            {/* Cari Hesap */}
            <Col span={12}>
              <Form.Item
                name="customerId"
                label="Cari Hesap"
                rules={[{ required: true, message: 'Cari hesap seçin!' }]}
              >
                <Select
                  showSearch
                  placeholder="Cari hesap seçin"
                  size="large"
                  optionFilterProp="children"
                  onChange={handlePartnerChange}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={partners.map((c) => ({
                    label: `${c.name} (${c.code})`,
                    value: c.id,
                  }))}
                />
              </Form.Item>

              {/* Cari hesap bakiyesi */}
              {selectedPartner && (
                <Alert
                  message={
                    <div>
                      <strong>Cari Hesap Bakiyesi:</strong>{' '}
                      <span
                        className={
                          selectedPartner.currentBalance > 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }
                      >
                        {selectedPartner.currentBalance.toFixed(2)}{' '}
                        {selectedPartner.currency}
                      </span>
                    </div>
                  }
                  type="info"
                  showIcon
                  className="mb-4"
                />
              )}
            </Col>

            {/* Fatura */}
            <Col span={12}>
              <Form.Item name="invoiceId" label="Fatura (Opsiyonel)">
                <Select
                  placeholder="Fatura seçin (genel ödeme için boş bırakın)"
                  size="large"
                  allowClear
                  onChange={handleInvoiceChange}
                  options={invoices.map((inv) => ({
                    label: `${inv.invoiceNumber} - ${inv.grandTotal.toFixed(2)} ${inv.currency}`,
                    value: inv.id,
                  }))}
                />
              </Form.Item>

              {/* Fatura bilgisi */}
              {selectedInvoice && (
                <Alert
                  message={
                    <div>
                      <strong>Fatura Tutarı:</strong>{' '}
                      {selectedInvoice.grandTotal.toFixed(2)} {selectedInvoice.currency}
                    </div>
                  }
                  type="warning"
                  showIcon
                  className="mb-4"
                />
              )}
            </Col>

            {/* Ödeme Türü */}
            <Col span={8}>
              <Form.Item
                name="type"
                label="Ödeme Türü"
                rules={[{ required: true }]}
              >
                <Select size="large">
                  <Select.Option value={PaymentType.Receipt}>
                    💰 Tahsilat (Gelen)
                  </Select.Option>
                  <Select.Option value={PaymentType.Payment}>
                    💸 Ödeme (Giden)
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>

            {/* Tarih */}
            <Col span={8}>
              <Form.Item
                name="paymentDate"
                label="Ödeme Tarihi"
                rules={[{ required: true }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  size="large"
                  format="DD.MM.YYYY"
                />
              </Form.Item>
            </Col>

            {/* Yöntem */}
            <Col span={8}>
              <Form.Item
                name="method"
                label="Ödeme Yöntemi"
                rules={[{ required: true }]}
              >
                <Select
                  size="large"
                  onChange={(value) => setPaymentMethod(value)}
                >
                  <Select.Option value={PaymentMethod.Cash}>
                    💵 Nakit
                  </Select.Option>
                  <Select.Option value={PaymentMethod.BankTransfer}>
                    🏦 Banka Transferi
                  </Select.Option>
                  <Select.Option value={PaymentMethod.CreditCard}>
                    💳 Kredi Kartı
                  </Select.Option>
                  <Select.Option value={PaymentMethod.Check}>
                    📝 Çek
                  </Select.Option>
                  <Select.Option value={PaymentMethod.PromissoryNote}>
                    📄 Senet
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>

            {/* Kasa (Nakit için) */}
            {paymentMethod === PaymentMethod.Cash && (
              <Col span={12}>
                <Form.Item
                  name="cashAccountId"
                  label="Kasa Hesabı"
                  rules={[{ required: true, message: 'Kasa seçin!' }]}
                >
                  <Select size="large" placeholder="Kasa seçin">
                    {cashAccounts.map((acc) => (
                      <Select.Option key={acc.id} value={acc.id}>
                        {acc.name} ({acc.balance.toFixed(2)} {acc.currency})
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            )}

            {/* Banka (Transfer için) */}
            {(paymentMethod === PaymentMethod.BankTransfer ||
              paymentMethod === PaymentMethod.CreditCard) && (
              <Col span={12}>
                <Form.Item
                  name="bankAccountId"
                  label="Banka Hesabı"
                  rules={[{ required: true, message: 'Banka seçin!' }]}
                >
                  <Select size="large" placeholder="Banka seçin">
                    {bankAccounts.map((acc) => (
                      <Select.Option key={acc.id} value={acc.id}>
                        {acc.bankName} - {acc.accountNumber}
                        <div className="text-xs text-gray-500">
                          Bakiye: {acc.balance.toFixed(2)} {acc.currency}
                        </div>
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            )}

            {/* Tutar */}
            <Col span={8}>
              <Form.Item
                name="amount"
                label="Tutar"
                rules={[{ required: true, message: 'Tutar girin!' }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  size="large"
                  precision={2}
                  placeholder="0.00"
                />
              </Form.Item>
            </Col>

            {/* Para Birimi */}
            <Col span={8}>
              <Form.Item
                name="currency"
                label="Para Birimi"
                rules={[{ required: true }]}
              >
                <Select size="large">
                  <Select.Option value="TRY">🇹🇷 TRY</Select.Option>
                  <Select.Option value="USD">🇺🇸 USD</Select.Option>
                  <Select.Option value="EUR">🇪🇺 EUR</Select.Option>
                  <Select.Option value="GBP">🇬🇧 GBP</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            {/* Açıklama */}
            <Col span={12}>
              <Form.Item name="description" label="Açıklama">
                <Input.TextArea rows={2} size="large" />
              </Form.Item>
            </Col>

            {/* Not */}
            <Col span={12}>
              <Form.Item name="notes" label="Notlar">
                <Input.TextArea rows={2} size="large" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Buttons */}
        <div className="flex gap-4">
          <Button
            type="primary"
            htmlType="submit"
            loading={saving}
            size="large"
          >
            {isEditMode ? 'Güncelle' : 'Kaydet'}
          </Button>
          <Button size="large" onClick={() => navigate('/payments')}>
            İptal
          </Button>
        </div>
      </Form>
    </div>
  );
};
