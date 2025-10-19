import React from 'react';
import { Form, Switch, Input, Button, message, Spin, Divider } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SaveOutlined } from '@ant-design/icons';

import { settingsApi } from '@/api/settings';
import type { UpdateCompanySettingsRequest } from '@/types/settings';

export default function NotificationSettings() {
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
      message.success('Bildirim ayarları kaydedildi');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Kayıt başarısız');
    }
  });

  // Set initial values
  React.useEffect(() => {
    if (settings?.notificationSettings) {
      // Flatten nested object for form
      form.setFieldsValue({
        'emailNotifications.invoiceCreated': settings.notificationSettings.emailNotifications.invoiceCreated,
        'emailNotifications.paymentReceived': settings.notificationSettings.emailNotifications.paymentReceived,
        'emailNotifications.lowStock': settings.notificationSettings.emailNotifications.lowStock,
        'emailNotifications.grQueueAlert': settings.notificationSettings.emailNotifications.grQueueAlert,
        'inAppNotifications.invoiceCreated': settings.notificationSettings.inAppNotifications.invoiceCreated,
        'inAppNotifications.paymentReceived': settings.notificationSettings.inAppNotifications.paymentReceived,
        'inAppNotifications.lowStock': settings.notificationSettings.inAppNotifications.lowStock,
        'inAppNotifications.grQueueAlert': settings.notificationSettings.inAppNotifications.grQueueAlert,
        notificationEmail: settings.notificationSettings.notificationEmail,
        dailyDigest: settings.notificationSettings.dailyDigest,
        weeklyReport: settings.notificationSettings.weeklyReport
      });
    }
  }, [settings, form]);

  const handleSubmit = async (values: any) => {
    // Restructure flat form values to nested object
    const notificationSettings = {
      emailNotifications: {
        invoiceCreated: values['emailNotifications.invoiceCreated'],
        paymentReceived: values['emailNotifications.paymentReceived'],
        lowStock: values['emailNotifications.lowStock'],
        grQueueAlert: values['emailNotifications.grQueueAlert']
      },
      inAppNotifications: {
        invoiceCreated: values['inAppNotifications.invoiceCreated'],
        paymentReceived: values['inAppNotifications.paymentReceived'],
        lowStock: values['inAppNotifications.lowStock'],
        grQueueAlert: values['inAppNotifications.grQueueAlert']
      },
      notificationEmail: values.notificationEmail,
      dailyDigest: values.dailyDigest,
      weeklyReport: values.weeklyReport
    };

    await updateMutation.mutateAsync({ notificationSettings });
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
      <h3 className="text-lg font-semibold mb-4">Bildirim Ayarları</h3>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        {/* Email Notifications */}
        <div className="mb-6">
          <h4 className="text-md font-semibold mb-3 text-gray-700">Email Bildirimleri</h4>
          
          <Form.Item
            name="emailNotifications.invoiceCreated"
            label="Fatura Oluşturuldu"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="emailNotifications.paymentReceived"
            label="Ödeme Alındı"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="emailNotifications.lowStock"
            label="Düşük Stok Uyarısı"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="emailNotifications.grQueueAlert"
            label="GR Kuyruk Uyarısı"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </div>

        <Divider />

        {/* In-App Notifications */}
        <div className="mb-6">
          <h4 className="text-md font-semibold mb-3 text-gray-700">Uygulama İçi Bildirimler</h4>
          
          <Form.Item
            name="inAppNotifications.invoiceCreated"
            label="Fatura Oluşturuldu"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="inAppNotifications.paymentReceived"
            label="Ödeme Alındı"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="inAppNotifications.lowStock"
            label="Düşük Stok Uyarısı"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="inAppNotifications.grQueueAlert"
            label="GR Kuyruk Uyarısı"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </div>

        <Divider />

        {/* Email Settings */}
        <div className="mb-6">
          <h4 className="text-md font-semibold mb-3 text-gray-700">Email Ayarları</h4>
          
          <Form.Item
            name="notificationEmail"
            label="Bildirim Email Adresi"
            rules={[
              { type: 'email', message: 'Geçerli bir email adresi girin' }
            ]}
          >
            <Input placeholder="notifications@example.com" />
          </Form.Item>

          <Form.Item
            name="dailyDigest"
            label={
              <div>
                <div className="font-medium">Günlük Özet</div>
                <div className="text-sm text-gray-500">
                  Her gün saat 18:00'de günlük özet email gönder
                </div>
              </div>
            }
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="weeklyReport"
            label={
              <div>
                <div className="font-medium">Haftalık Rapor</div>
                <div className="text-sm text-gray-500">
                  Her Pazartesi saat 09:00'da haftalık rapor email gönder
                </div>
              </div>
            }
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
