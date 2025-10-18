import { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Select,
  InputNumber,
  message,
  Spin,
  Tabs,
} from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { customersApi } from '@/api/customers';
import type { CreateCustomerRequest } from '@/types/customer';
import { CustomerType } from '@/types/customer';

// Müşteri oluştur/düzenle formu
export const CustomerForm = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [customerType, setCustomerType] = useState<CustomerType>(
    CustomerType.Corporate
  );

  const isEditMode = !!id;

  useEffect(() => {
    if (isEditMode) {
      // ID kontrolü
      if (!id || id === 'undefined' || id === 'null') {
        message.error('Geçersiz müşteri ID\'si');
        navigate('/customers');
        return;
      }
      
      loadCustomer();
    }
  }, [id]);

  // Müşteri yükle (edit mode)
  const loadCustomer = async () => {
    setLoading(true);
    try {
      const response = await customersApi.getById(id!);
      if (response.success) {
        form.setFieldsValue(response.data);
        setCustomerType(response.data.type);
      }
    } catch (error: any) {
      // 404 hatası durumunda özel mesaj
      if (error.response?.status === 404) {
        message.error('Müşteri bulunamadı. Bu müşteri silinmiş olabilir.');
      } else {
        message.error('Müşteri bilgileri yüklenemedi');
      }
      
      navigate('/customers');
    } finally {
      setLoading(false);
    }
  };

  // Form submit
  const handleSubmit = async (values: CreateCustomerRequest) => {
    setSaving(true);
    try {
      if (isEditMode) {
        await customersApi.update(id!, values);
        message.success('Müşteri güncellendi');
      } else {
        await customersApi.create(values);
        message.success('Müşteri oluşturuldu');
      }
      navigate('/customers');
    } catch (error: any) {
      message.error(
        error.response?.data?.message ||
          (isEditMode ? 'Müşteri güncellenemedi' : 'Müşteri oluşturulamadı')
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
      {/* Başlık */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {isEditMode ? 'Müşteri Düzenle' : 'Yeni Müşteri'}
        </h1>
        <p className="text-gray-500">
          {isEditMode
            ? 'Müşteri bilgilerini güncelleyin'
            : 'Yeni müşteri bilgilerini girin'}
        </p>
      </div>

      {/* Form */}
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          initialValues={{
            type: CustomerType.Corporate,
            currency: 'TRY',
            creditLimit: 0,
            paymentTermDays: 30,
          }}
        >
          <Tabs
            items={[
              {
                key: 'general',
                label: 'Genel Bilgiler',
                children: (
                  <div className="space-y-4">
                    {/* Müşteri Adı */}
                    <Form.Item
                      name="name"
                      label="Müşteri Adı"
                      rules={[
                        { required: true, message: 'Müşteri adı gerekli!' },
                      ]}
                    >
                      <Input
                        placeholder="Örn: ABC Ticaret Ltd. Şti."
                        size="large"
                      />
                    </Form.Item>

                    {/* Müşteri Türü */}
                    <Form.Item
                      name="type"
                      label="Müşteri Türü"
                      rules={[
                        { required: true, message: 'Müşteri türü gerekli!' },
                      ]}
                    >
                      <Select
                        size="large"
                        onChange={(value) => setCustomerType(value)}
                      >
                        <Select.Option value={CustomerType.Individual}>
                          👤 Bireysel
                        </Select.Option>
                        <Select.Option value={CustomerType.Corporate}>
                          🏢 Kurumsal
                        </Select.Option>
                      </Select>
                    </Form.Item>

                    {/* Vergi/TC Kimlik */}
                    <div className="grid grid-cols-2 gap-4">
                      {customerType === CustomerType.Corporate ? (
                        <>
                          <Form.Item
                            name="taxNumber"
                            label="Vergi Numarası"
                            rules={[
                              {
                                required: true,
                                message: 'Kurumsal müşteriler için vergi numarası zorunludur!',
                              },
                            ]}
                          >
                            <Input placeholder="1234567890" size="large" />
                          </Form.Item>
                          <Form.Item name="taxOffice" label="Vergi Dairesi">
                            <Input placeholder="Örn: Kadıköy" size="large" />
                          </Form.Item>
                        </>
                      ) : (
                        <Form.Item
                          name="identityNumber"
                          label="TC Kimlik No"
                          rules={[
                            {
                              required: true,
                              message: 'Bireysel müşteriler için TC Kimlik No zorunludur!',
                            },
                            {
                              len: 11,
                              message: 'TC Kimlik No 11 haneli olmalıdır!',
                            },
                            {
                              pattern: /^[0-9]{11}$/,
                              message: 'TC Kimlik No sadece rakam içermelidir!',
                            },
                          ]}
                        >
                          <Input
                            placeholder="12345678901"
                            size="large"
                            maxLength={11}
                          />
                        </Form.Item>
                      )}
                    </div>
                  </div>
                ),
              },
              {
                key: 'contact',
                label: 'İletişim',
                children: (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Form.Item
                        name="email"
                        label="E-posta"
                        rules={[
                          {
                            type: 'email',
                            message: 'Geçerli bir e-posta girin!',
                          },
                        ]}
                      >
                        <Input placeholder="musteri@email.com" size="large" />
                      </Form.Item>

                      <Form.Item name="phone" label="Telefon">
                        <Input placeholder="+90 555 123 4567" size="large" />
                      </Form.Item>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Form.Item name="mobilePhone" label="Cep Telefonu">
                        <Input placeholder="+90 555 123 4567" size="large" />
                      </Form.Item>

                      <Form.Item name="website" label="Website">
                        <Input placeholder="www.example.com" size="large" />
                      </Form.Item>
                    </div>

                    <Form.Item name="billingAddress" label="Fatura Adresi">
                      <Input.TextArea
                        placeholder="Fatura adresi"
                        rows={2}
                        size="large"
                      />
                    </Form.Item>

                    <Form.Item name="shippingAddress" label="Sevkiyat Adresi">
                      <Input.TextArea
                        placeholder="Sevkiyat adresi"
                        rows={2}
                        size="large"
                      />
                    </Form.Item>

                    <div className="grid grid-cols-3 gap-4">
                      <Form.Item name="city" label="Şehir">
                        <Input placeholder="İstanbul" size="large" />
                      </Form.Item>

                      <Form.Item name="country" label="Ülke">
                        <Input placeholder="Türkiye" size="large" />
                      </Form.Item>

                      <Form.Item name="postalCode" label="Posta Kodu">
                        <Input placeholder="34000" size="large" />
                      </Form.Item>
                    </div>
                  </div>
                ),
              },
              {
                key: 'financial',
                label: 'Finansal Bilgiler',
                children: (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <Form.Item
                        name="currency"
                        label="Para Birimi"
                        rules={[
                          { required: true, message: 'Para birimi gerekli!' },
                        ]}
                      >
                        <Select size="large" placeholder="Para birimi seçin">
                          <Select.Option value="TRY">🇹🇷 TRY</Select.Option>
                          <Select.Option value="USD">🇺🇸 USD</Select.Option>
                          <Select.Option value="EUR">🇪🇺 EUR</Select.Option>
                          <Select.Option value="GBP">🇬🇧 GBP</Select.Option>
                        </Select>
                      </Form.Item>

                      <Form.Item name="creditLimit" label="Kredi Limiti">
                        <InputNumber
                          min={0}
                          style={{ width: '100%' }}
                          size="large"
                          placeholder="0.00"
                        />
                      </Form.Item>

                      <Form.Item name="paymentTermDays" label="Vade (Gün)">
                        <InputNumber
                          min={0}
                          style={{ width: '100%' }}
                          size="large"
                          placeholder="30"
                        />
                      </Form.Item>
                    </div>

                    <Form.Item name="notes" label="Notlar">
                      <Input.TextArea
                        placeholder="Müşteri hakkında notlar..."
                        rows={4}
                        size="large"
                      />
                    </Form.Item>
                  </div>
                ),
              },
            ]}
          />

          {/* Buttons */}
          <div className="mt-6 flex gap-4">
            <Button
              type="primary"
              htmlType="submit"
              loading={saving}
              size="large"
            >
              {isEditMode ? 'Güncelle' : 'Oluştur'}
            </Button>
            <Button size="large" onClick={() => navigate('/customers')}>
              İptal
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

