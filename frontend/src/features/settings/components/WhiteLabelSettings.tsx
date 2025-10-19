import React, { useState } from 'react';
import { Form, Input, Button, message, Spin, Upload, ColorPicker } from 'antd';
import type { Color } from 'antd/es/color-picker';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SaveOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';

import { settingsApi } from '@/api/settings';
import type { UpdateCompanySettingsRequest } from '@/types/settings';

export default function WhiteLabelSettings() {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [logoFile, setLogoFile] = useState<UploadFile[]>([]);
  const [faviconFile, setFaviconFile] = useState<UploadFile[]>([]);

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
      message.success('Tema ayarları kaydedildi');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Kayıt başarısız');
    }
  });

  // Upload logo mutation
  const uploadLogoMutation = useMutation({
    mutationFn: (file: File) => settingsApi.uploadLogo(file),
    onSuccess: (data) => {
      form.setFieldValue('logoUrl', data.url);
      message.success('Logo yüklendi');
    }
  });

  // Set initial values
  React.useEffect(() => {
    if (settings?.whiteLabel) {
      form.setFieldsValue(settings.whiteLabel);
    }
  }, [settings, form]);

  const handleSubmit = async (values: any) => {
    await updateMutation.mutateAsync({
      whiteLabel: values
    });
  };

  const handleLogoUpload = async (file: File) => {
    await uploadLogoMutation.mutateAsync(file);
    return false; // Prevent default upload
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
      <h3 className="text-lg font-semibold mb-4">Tema & Logo Ayarları</h3>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="companyName"
          label="Şirket Adı (Gösterim)"
          rules={[{ required: true, message: 'Şirket adı zorunludur' }]}
        >
          <Input placeholder="Şirket adını girin" />
        </Form.Item>

        {/* Logo Upload */}
        <Form.Item
          label="Logo"
        >
          <Upload
            listType="picture-card"
            fileList={logoFile}
            beforeUpload={handleLogoUpload}
            onChange={({ fileList }) => setLogoFile(fileList)}
            maxCount={1}
          >
            {logoFile.length === 0 && (
              <div>
                <UploadOutlined />
                <div className="mt-2">Logo Yükle</div>
              </div>
            )}
          </Upload>
          <div className="text-sm text-gray-500 mt-2">
            Önerilen boyut: 200x50px, PNG veya SVG formatı
          </div>
        </Form.Item>

        <Form.Item name="logoUrl" hidden>
          <Input />
        </Form.Item>

        {/* Color Pickers */}
        <Form.Item
          name="primaryColor"
          label="Ana Renk"
          rules={[{ required: true, message: 'Ana renk seçimi zorunludur' }]}
        >
          <ColorPicker
            showText
            format="hex"
            onChange={(value: Color) => {
              form.setFieldValue('primaryColor', value.toHexString());
            }}
          />
        </Form.Item>

        <Form.Item
          name="secondaryColor"
          label="İkincil Renk"
          rules={[{ required: true, message: 'İkincil renk seçimi zorunludur' }]}
        >
          <ColorPicker
            showText
            format="hex"
            onChange={(value: Color) => {
              form.setFieldValue('secondaryColor', value.toHexString());
            }}
          />
        </Form.Item>

        <Form.Item
          name="accentColor"
          label="Vurgu Rengi"
        >
          <ColorPicker
            showText
            format="hex"
            onChange={(value: Color) => {
              form.setFieldValue('accentColor', value.toHexString());
            }}
          />
        </Form.Item>

        <Form.Item
          name="loginBackgroundColor"
          label="Giriş Arka Plan Rengi"
        >
          <ColorPicker
            showText
            format="hex"
            onChange={(value: Color) => {
              form.setFieldValue('loginBackgroundColor', value.toHexString());
            }}
          />
        </Form.Item>

        {/* Preview */}
        <div className="my-6 p-6 border rounded-lg bg-gray-50">
          <h4 className="font-semibold mb-4">Önizleme</h4>
          <div className="flex gap-4">
            <div
              className="w-24 h-24 rounded-lg"
              style={{ backgroundColor: form.getFieldValue('primaryColor') || '#1890ff' }}
            />
            <div
              className="w-24 h-24 rounded-lg"
              style={{ backgroundColor: form.getFieldValue('secondaryColor') || '#52c41a' }}
            />
            <div
              className="w-24 h-24 rounded-lg"
              style={{ backgroundColor: form.getFieldValue('accentColor') || '#faad14' }}
            />
          </div>
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
