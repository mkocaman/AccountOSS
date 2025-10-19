import React from 'react';
import { Form, Input, Select, Button, message, Spin } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SaveOutlined } from '@ant-design/icons';

import { settingsApi } from '@/api/settings';
import type { UpdateCompanySettingsRequest } from '@/types/settings';

export default function GeneralSettings() {
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
      message.success('Ayarlar başarıyla kaydedildi');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Ayarlar kaydedilemedi');
    }
  });

  // Set initial values
  React.useEffect(() => {
    if (settings) {
      form.setFieldsValue({
        baseCurrency: settings.baseCurrency,
        defaultLanguage: settings.defaultLanguage,
        timeZone: settings.timeZone,
        dateFormat: settings.dateFormat
      });
    }
  }, [settings, form]);

  const handleSubmit = async (values: any) => {
    await updateMutation.mutateAsync(values);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h3 className="text-lg font-semibold mb-4">Genel Ayarlar</h3>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="baseCurrency"
          label="Ana Para Birimi"
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

        <Form.Item
          name="defaultLanguage"
          label="Varsayılan Dil"
          rules={[{ required: true, message: 'Dil seçimi zorunludur' }]}
        >
          <Select
            placeholder="Dil seçin"
            options={[
              { label: '🇹🇷 Türkçe', value: 'tr' },
              { label: '🇬🇧 English', value: 'en' },
              { label: '🇷🇺 Русский', value: 'ru' },
              { label: '🇺🇿 O\'zbekcha', value: 'uz' },
              { label: '🇸🇦 العربية', value: 'ar' }
            ]}
          />
        </Form.Item>

        <Form.Item
          name="timeZone"
          label="Saat Dilimi"
          rules={[{ required: true, message: 'Saat dilimi seçimi zorunludur' }]}
        >
          <Select
            placeholder="Saat dilimi seçin"
            showSearch
            options={[
              { label: 'Europe/Istanbul (UTC+3)', value: 'Europe/Istanbul' },
              { label: 'Europe/London (UTC+0)', value: 'Europe/London' },
              { label: 'Europe/Moscow (UTC+3)', value: 'Europe/Moscow' },
              { label: 'Asia/Dubai (UTC+4)', value: 'Asia/Dubai' },
              { label: 'Asia/Tashkent (UTC+5)', value: 'Asia/Tashkent' }
            ]}
          />
        </Form.Item>

        <Form.Item
          name="dateFormat"
          label="Tarih Formatı"
          rules={[{ required: true, message: 'Tarih formatı seçimi zorunludur' }]}
        >
          <Select
            placeholder="Format seçin"
            options={[
              { label: 'DD/MM/YYYY (17/10/2025)', value: 'DD/MM/YYYY' },
              { label: 'MM/DD/YYYY (10/17/2025)', value: 'MM/DD/YYYY' },
              { label: 'YYYY-MM-DD (2025-10-17)', value: 'YYYY-MM-DD' },
              { label: 'DD.MM.YYYY (17.10.2025)', value: 'DD.MM.YYYY' }
            ]}
          />
        </Form.Item>

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
