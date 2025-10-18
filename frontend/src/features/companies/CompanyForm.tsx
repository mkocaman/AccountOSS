import { useEffect, useState } from 'react';
import { Form, Input, Button, Card, Select, message, Spin, Space } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { companiesApi, type CreateCompanyRequest } from '@/api/companies';

// Şirket oluştur/düzenle formu
export const CompanyForm = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const isEditMode = !!id;

  useEffect(() => {
    if (isEditMode) {
      loadCompany();
    }
  }, [id]);

  // Şirket bilgilerini yükle (edit mode)
  const loadCompany = async () => {
    setLoading(true);
    try {
      const response = await companiesApi.getById(id!);
      if (response.success) {
        form.setFieldsValue(response.data);
      }
    } catch (error) {
      message.error('Şirket bilgileri yüklenemedi');
      navigate('/companies');
    } finally {
      setLoading(false);
    }
  };

  // Form submit
  const handleSubmit = async (values: CreateCompanyRequest) => {
    setSaving(true);
    try {
      if (isEditMode) {
        // UpdateCompanyRequest tipine uygun hale getir
        const updateData: UpdateCompanyRequest = { ...values, id: id! };
        await companiesApi.update(id!, updateData);
        message.success('Şirket güncellendi');
      } else {
        await companiesApi.create(values);
        message.success('Şirket oluşturuldu');
      }
      navigate('/companies');
    } catch (error) {
      message.error(isEditMode ? 'Şirket güncellenemedi' : 'Şirket oluşturulamadı');
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
          {isEditMode ? 'Şirket Düzenle' : 'Yeni Şirket'}
        </h1>
        <p className="text-gray-500">
          {isEditMode ? 'Şirket bilgilerini güncelleyin' : 'Yeni şirket bilgilerini girin'}
        </p>
      </div>

      {/* Form */}
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Form.Item
            name="name"
            label="Şirket Adı"
            rules={[{ required: true, message: 'Şirket adı gerekli!' }]}
          >
            <Input placeholder="Örn: ABC Ticaret Ltd. Şti." size="large" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="taxNumber"
              label="Vergi Numarası"
              rules={[{ required: true, message: 'Vergi numarası gerekli!' }]}
            >
              <Input placeholder="1234567890" size="large" />
            </Form.Item>

            <Form.Item name="taxOffice" label="Vergi Dairesi">
              <Input placeholder="Örn: Kadıköy" size="large" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="email"
              label="E-posta"
              rules={[{ type: 'email', message: 'Geçerli bir e-posta girin!' }]}
            >
              <Input placeholder="sirket@email.com" size="large" />
            </Form.Item>

            <Form.Item name="phone" label="Telefon">
              <Input placeholder="+90 555 123 4567" size="large" />
            </Form.Item>
          </div>

          <Form.Item name="address" label="Adres">
            <Input.TextArea
              placeholder="Şirket adresi"
              rows={3}
              size="large"
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="baseCurrency"
              label="Ana Para Birimi"
              rules={[{ required: true, message: 'Para birimi gerekli!' }]}
              initialValue="TRY"
            >
              <Select size="large" placeholder="Para birimi seçin">
                <Select.Option value="TRY">🇹🇷 Türk Lirası (TRY)</Select.Option>
                <Select.Option value="USD">🇺🇸 Amerikan Doları (USD)</Select.Option>
                <Select.Option value="EUR">🇪🇺 Euro (EUR)</Select.Option>
                <Select.Option value="GBP">🇬🇧 İngiliz Sterlini (GBP)</Select.Option>
                <Select.Option value="RUB">🇷🇺 Rus Rublesi (RUB)</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="country"
              label="Ülke"
              rules={[{ required: true, message: 'Ülke gerekli!' }]}
              initialValue="TR"
            >
              <Select size="large" placeholder="Ülke seçin">
                <Select.Option value="TR">🇹🇷 Türkiye</Select.Option>
                <Select.Option value="US">🇺🇸 Amerika</Select.Option>
                <Select.Option value="DE">🇩🇪 Almanya</Select.Option>
                <Select.Option value="GB">🇬🇧 İngiltere</Select.Option>
                <Select.Option value="RU">🇷🇺 Rusya</Select.Option>
              </Select>
            </Form.Item>
          </div>

          {/* Buttons */}
          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={saving}
                size="large"
              >
                {isEditMode ? 'Güncelle' : 'Oluştur'}
              </Button>
              <Button size="large" onClick={() => navigate('/companies')}>
                İptal
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

