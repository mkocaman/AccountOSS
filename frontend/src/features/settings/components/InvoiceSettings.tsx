import React from 'react';
import { Form, Input, InputNumber, Switch, Select, Button, message, Spin, Divider } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SaveOutlined } from '@ant-design/icons';

import { settingsApi } from '@/api/settings';
import type { UpdateCompanySettingsRequest } from '@/types/settings';

export default function InvoiceSettings() {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // Fetch settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['companySettings'],
    queryFn: () => settingsApi.getCompanySettings()
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateCompanySettingsRequest) => 
      settingsApi.updateCompanySettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companySettings'] });
      message.success('Fatura ayarları kaydedildi');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Kayıt başarısız');
    }
  });

  // Set initial values
  React.useEffect(() => {
    if (settings?.invoiceSettings) {
      form.setFieldsValue(settings.invoiceSettings);
    }
  }, [settings, form]);

  const handleSubmit = async (values: any) => {
    await updateMutation.mutateAsync({
      invoiceSettings: values
    });
  };

  // Preview invoice number
  const previewInvoiceNumber = () => {
    const prefix = form.getFieldValue('numberPrefix') || 'INV-';
    const format = form.getFieldValue('numberFormat') || 'YYYY/0000';
    const startingNumber = form.getFieldValue('startingNumber') || 1;
    
    const year = new Date().getFullYear();
    const paddedNumber = String(startingNumber).padStart(4, '0');
    
    return `${prefix}${format.replace('YYYY', String(year)).replace('0000', paddedNumber)}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <h3 className="text-lg font-semibold mb-4">Fatura Ayarları</h3>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        {/* Numbering Settings */}
        <div className="mb-6">
          <h4 className="text-md font-semibold mb-3 text-gray-700">Numaralandırma</h4>
          
          <Form.Item
            name="autoNumbering"
            label="Otomatik Numaralandırma"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="numberPrefix"
            label="Numara Ön Eki"
            rules={[{ required: true, message: 'Ön ek zorunludur' }]}
          >
            <Input placeholder="INV-" />
          </Form.Item>

          <Form.Item
            name="numberFormat"
            label="Numara Formatı"
            rules={[{ required: true, message: 'Format seçimi zorunludur' }]}
          >
            <Select
              placeholder="Format seçin"
              options={[
                { label: 'YYYY/0000 (2025/0001)', value: 'YYYY/0000' },
                { label: 'YYYYMM/0000 (202510/0001)', value: 'YYYYMM/0000' },
                { label: '0000 (0001)', value: '0000' },
                { label: 'YYYY-0000 (2025-0001)', value: 'YYYY-0000' }
              ]}
            />
          </Form.Item>

          <Form.Item
            name="startingNumber"
            label="Başlangıç Numarası"
            rules={[{ required: true, message: 'Başlangıç numarası zorunludur' }]}
          >
            <InputNumber
              min={1}
              className="w-full"
              placeholder="1"
            />
          </Form.Item>

          {/* Preview */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Önizleme:</div>
            <div className="text-lg font-semibold text-blue-600">
              {previewInvoiceNumber()}
            </div>
          </div>
        </div>

        <Divider />

        {/* Default Values */}
        <div className="mb-6">
          <h4 className="text-md font-semibold mb-3 text-gray-700">Varsayılan Değerler</h4>
          
          <Form.Item
            name="defaultVatRate"
            label="Varsayılan KDV Oranı (%)"
            rules={[{ required: true, message: 'KDV oranı zorunludur' }]}
          >
            <Select
              placeholder="KDV oranı seçin"
              options={[
                { label: '%20 (Genel)', value: 20 },
                { label: '%18', value: 18 },
                { label: '%10', value: 10 },
                { label: '%8', value: 8 },
                { label: '%1', value: 1 },
                { label: '%0 (İstisna)', value: 0 }
              ]}
            />
          </Form.Item>

          <Form.Item
            name="defaultCurrency"
            label="Varsayılan Para Birimi"
            rules={[{ required: true, message: 'Para birimi seçimi zorunludur' }]}
          >
            <Select
              placeholder="Para birimi seçin"
              options={[
                { label: 'TRY - Türk Lirası', value: 'TRY' },
                { label: 'USD - Amerikan Doları', value: 'USD' },
                { label: 'EUR - Euro', value: 'EUR' },
                { label: 'GBP - İngiliz Sterlini', value: 'GBP' }
              ]}
            />
          </Form.Item>
        </div>

        <Divider />

        {/* Validation Rules */}
        <div className="mb-6">
          <h4 className="text-md font-semibold mb-3 text-gray-700">Doğrulama Kuralları</h4>
          
          <Form.Item
            name="requireCustomerTaxNumber"
            label={
              <div>
                <div className="font-medium">Müşteri Vergi Numarası Zorunlu</div>
                <div className="text-sm text-gray-500">
                  Fatura oluştururken müşterinin vergi numarası girilmiş olmalı
                </div>
              </div>
            }
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="requireProductCode"
            label={
              <div>
                <div className="font-medium">Ürün Kodu Zorunlu</div>
                <div className="text-sm text-gray-500">
                  Fatura satırlarında ürün kodu girilmiş olmalı
                </div>
              </div>
            }
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </div>

        <Divider />

        {/* Edit/Delete Permissions */}
        <div className="mb-6">
          <h4 className="text-md font-semibold mb-3 text-gray-700">Düzenleme İzinleri</h4>
          
          <Form.Item
            name="allowEditAfterIssued"
            label={
              <div>
                <div className="font-medium">Kesilmiş Fatura Düzenlenebilir</div>
                <div className="text-sm text-gray-500">
                  Onaylanmış (Issued) faturaların düzenlenmesine izin ver
                </div>
              </div>
            }
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="allowDeleteAfterIssued"
            label={
              <div>
                <div className="font-medium">Kesilmiş Fatura Silinebilir</div>
                <div className="text-sm text-gray-500 text-red-500">
                  ⚠️ Dikkatli kullanın! Yasal sorumluluk doğurabilir.
                </div>
              </div>
            }
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </div>

        <Divider />

        {/* PDF Settings */}
        <div className="mb-6">
          <h4 className="text-md font-semibold mb-3 text-gray-700">PDF Ayarları</h4>
          
          <Form.Item
            name="pdfTemplate"
            label="PDF Şablonu"
            rules={[{ required: true, message: 'Şablon seçimi zorunludur' }]}
          >
            <Select
              placeholder="Şablon seçin"
              options={[
                { label: 'Varsayılan', value: 'default' },
                { label: 'Modern', value: 'modern' },
                { label: 'Klasik', value: 'classic' },
                { label: 'Minimal', value: 'minimal' }
              ]}
            />
          </Form.Item>

          <Form.Item
            name="logoOnInvoice"
            label="Faturada Logo Göster"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </div>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
            loading={updateMutation.isPending}
            size="large"
          >
            Değişiklikleri Kaydet
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
