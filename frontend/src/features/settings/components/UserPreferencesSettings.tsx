import React from 'react';
import { Form, Select, Switch, InputNumber, Button, message, Spin, Divider } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SaveOutlined } from '@ant-design/icons';

import { settingsApi } from '@/api/settings';
import type { UpdateUserPreferencesRequest } from '@/types/settings';

export default function UserPreferencesSettings() {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // Fetch preferences
  const { data: preferences, isLoading } = useQuery({
    queryKey: ['userPreferences'],
    queryFn: () => settingsApi.getUserPreferences()
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateUserPreferencesRequest) => 
      settingsApi.updateUserPreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPreferences'] });
      message.success('Tercihleriniz kaydedildi');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Kayıt başarısız');
    }
  });

  // Set initial values
  React.useEffect(() => {
    if (preferences) {
      form.setFieldsValue({
        theme: preferences.theme,
        language: preferences.language,
        currency: preferences.currency,
        dashboardLayout: preferences.dashboardLayout,
        tablePageSize: preferences.tablePageSize,
        'notifications.desktop': preferences.notifications.desktop,
        'notifications.email': preferences.notifications.email,
        'notifications.sound': preferences.notifications.sound
      });
    }
  }, [preferences, form]);

  const handleSubmit = async (values: any) => {
    // Restructure flat form values
    const data: UpdateUserPreferencesRequest = {
      theme: values.theme,
      language: values.language,
      currency: values.currency,
      dashboardLayout: values.dashboardLayout,
      tablePageSize: values.tablePageSize,
      notifications: {
        desktop: values['notifications.desktop'],
        email: values['notifications.email'],
        sound: values['notifications.sound']
      }
    };

    await updateMutation.mutateAsync(data);
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
      <h3 className="text-lg font-semibold mb-4">Kişisel Tercihler</h3>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        {/* Appearance */}
        <div className="mb-6">
          <h4 className="text-md font-semibold mb-3 text-gray-700">Görünüm</h4>
          
          <Form.Item
            name="theme"
            label="Tema"
            rules={[{ required: true, message: 'Tema seçimi zorunludur' }]}
          >
            <Select
              options={[
                { label: '☀️ Açık', value: 'light' },
                { label: '🌙 Koyu', value: 'dark' },
                { label: '🔄 Otomatik (Sistem)', value: 'auto' }
              ]}
            />
          </Form.Item>

          <Form.Item
            name="language"
            label="Dil"
            rules={[{ required: true, message: 'Dil seçimi zorunludur' }]}
          >
            <Select
              options={[
                { label: '🇹🇷 Türkçe', value: 'tr' },
                { label: '🇬🇧 English', value: 'en' },
                { label: '🇷🇺 Русский', value: 'ru' },
                { label: '🇺🇿 O\'zbekcha', value: 'uz' }
              ]}
            />
          </Form.Item>

          <Form.Item
            name="currency"
            label="Tercih Edilen Para Birimi"
            rules={[{ required: true, message: 'Para birimi seçimi zorunludur' }]}
          >
            <Select
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

        {/* Dashboard */}
        <div className="mb-6">
          <h4 className="text-md font-semibold mb-3 text-gray-700">Dashboard</h4>
          
          <Form.Item
            name="dashboardLayout"
            label="Dashboard Düzeni"
            rules={[{ required: true, message: 'Düzen seçimi zorunludur' }]}
          >
            <Select
              options={[
                { label: 'Varsayılan', value: 'default' },
                { label: 'Kompakt', value: 'compact' },
                { label: 'Detaylı', value: 'detailed' }
              ]}
            />
          </Form.Item>

          <Form.Item
            name="tablePageSize"
            label="Tablo Sayfa Boyutu"
            rules={[{ required: true, message: 'Sayfa boyutu zorunludur' }]}
          >
            <Select
              options={[
                { label: '25 kayıt', value: 25 },
                { label: '50 kayıt', value: 50 },
                { label: '100 kayıt', value: 100 }
              ]}
            />
          </Form.Item>
        </div>

        <Divider />

        {/* Notifications */}
        <div className="mb-6">
          <h4 className="text-md font-semibold mb-3 text-gray-700">Bildirim Tercihleri</h4>
          
          <Form.Item
            name="notifications.desktop"
            label="Masaüstü Bildirimleri"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="notifications.email"
            label="Email Bildirimleri"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="notifications.sound"
            label="Ses Bildirimleri"
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
