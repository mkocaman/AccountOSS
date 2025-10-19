import React from 'react';
import { Form, Switch, Button, message, Spin, Alert, Divider } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SaveOutlined, InfoCircleOutlined } from '@ant-design/icons';

import { settingsApi } from '@/api/settings';
import type { UpdateCompanySettingsRequest } from '@/types/settings';

export default function FeatureFlagsSettings() {
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
      message.success('Özellikler başarıyla güncellendi');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Güncelleme başarısız');
    }
  });

  // Set initial values
  React.useEffect(() => {
    if (settings) {
      form.setFieldsValue(settings.features);
    }
  }, [settings, form]);

  const handleSubmit = async (values: any) => {
    await updateMutation.mutateAsync({
      features: values
    });
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
      <h3 className="text-lg font-semibold mb-4">Sistem Özellikleri</h3>
      
      <Alert
        message="Özellik Yönetimi"
        description="Sistemdeki özellikleri açıp kapatarak ihtiyacınıza göre özelleştirebilirsiniz. Bazı özellikler abonelik planınıza göre kısıtlı olabilir."
        type="info"
        icon={<InfoCircleOutlined />}
        showIcon
        className="mb-6"
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        {/* Core Features */}
        <div className="mb-6">
          <h4 className="text-md font-semibold mb-3 text-gray-700">Temel Özellikler</h4>
          
          <Form.Item
            name="grSystemEnabled"
            label={
              <div>
                <div className="font-medium">GR Kuyruk Sistemi</div>
                <div className="text-sm text-gray-500">
                  Gayriresmi satışların resmileştirilme sistemi (Türkiye özel)
                </div>
              </div>
            }
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="multiWarehouseEnabled"
            label={
              <div>
                <div className="font-medium">Çoklu Depo</div>
                <div className="text-sm text-gray-500">
                  Birden fazla depo yönetimi ve transfer işlemleri
                </div>
              </div>
            }
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="advancedReportsEnabled"
            label={
              <div>
                <div className="font-medium">Gelişmiş Raporlar</div>
                <div className="text-sm text-gray-500">
                  Detaylı analiz raporları ve Excel export
                </div>
              </div>
            }
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="apiAccessEnabled"
            label={
              <div>
                <div className="font-medium">API Erişimi</div>
                <div className="text-sm text-gray-500">
                  REST API ile harici sistem entegrasyonları
                </div>
              </div>
            }
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </div>

        <Divider />

        {/* Security Features */}
        <div className="mb-6">
          <h4 className="text-md font-semibold mb-3 text-gray-700">Güvenlik</h4>
          
          <Form.Item
            name="twoFactorAuthRequired"
            label={
              <div>
                <div className="font-medium">2FA Zorunlu</div>
                <div className="text-sm text-gray-500">
                  Tüm kullanıcılar için iki faktörlü kimlik doğrulama zorunlu
                </div>
              </div>
            }
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </div>

        <Divider />

        {/* Notification Features */}
        <div className="mb-6">
          <h4 className="text-md font-semibold mb-3 text-gray-700">Bildirimler</h4>
          
          <Form.Item
            name="emailNotificationsEnabled"
            label={
              <div>
                <div className="font-medium">Email Bildirimleri</div>
                <div className="text-sm text-gray-500">
                  Otomatik email bildirimleri gönder
                </div>
              </div>
            }
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="smsNotificationsEnabled"
            label={
              <div>
                <div className="font-medium">SMS Bildirimleri</div>
                <div className="text-sm text-gray-500">
                  Önemli olaylar için SMS gönder (ek ücretli)
                </div>
              </div>
            }
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </div>

        <Divider />

        {/* Regional Features */}
        <div className="mb-6">
          <h4 className="text-md font-semibold mb-3 text-gray-700">Bölgesel Özellikler</h4>
          
          <Form.Item
            name="contractSystemEnabled"
            label={
              <div>
                <div className="font-medium">Sözleşme Sistemi</div>
                <div className="text-sm text-gray-500">
                  Sözleşme yönetimi ve dijital imza (Özbekistan özel)
                </div>
              </div>
            }
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="powerOfAttorneyRequired"
            label={
              <div>
                <div className="font-medium">Vekalet Zorunlu</div>
                <div className="text-sm text-gray-500">
                  Fatura kesmek için vekalet belgesi gerekli (Özbekistan özel)
                </div>
              </div>
            }
            valuePropName="checked"
            dependencies={['contractSystemEnabled']}
          >
            <Switch disabled={!form.getFieldValue('contractSystemEnabled')} />
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
