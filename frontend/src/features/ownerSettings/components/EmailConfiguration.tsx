import React from 'react';
import { Form, Input, InputNumber, Switch, Button, message, Spin } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SaveOutlined } from '@ant-design/icons';

import { ownerSettingsApi } from '@/api/ownerSettings';
import type { UpdateOwnerSettingsRequest } from '@/types/ownerSettings';

export default function EmailConfiguration() {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // Fetch settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['ownerSettings'],
    queryFn: () => ownerSettingsApi.getSettings()
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateOwnerSettingsRequest) => 
      ownerSettingsApi.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerSettings'] });
      message.success('Email settings updated');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Update failed');
    }
  });

  // Set initial values
  React.useEffect(() => {
    if (settings?.emailSettings) {
      form.setFieldsValue(settings.emailSettings);
    }
  }, [settings, form]);

  const handleSubmit = async (values: any) => {
    const data: UpdateOwnerSettingsRequest = {
      emailSettings: values
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
    <div className="max-w-3xl">
      <h3 className="text-lg font-semibold mb-4">Email Configuration</h3>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="smtpHost"
          label="SMTP Host"
          rules={[{ required: true, message: 'SMTP host is required' }]}
        >
          <Input placeholder="smtp.gmail.com" />
        </Form.Item>

        <Form.Item
          name="smtpPort"
          label="SMTP Port"
          rules={[{ required: true, message: 'SMTP port is required' }]}
        >
          <InputNumber min={1} max={65535} className="w-full" placeholder="587" />
        </Form.Item>

        <Form.Item
          name="smtpUsername"
          label="SMTP Username"
          rules={[{ required: true, message: 'Username is required' }]}
        >
          <Input placeholder="your-email@gmail.com" />
        </Form.Item>

        <Form.Item
          name="smtpPassword"
          label="SMTP Password"
          help="Leave blank to keep existing password"
        >
          <Input.Password placeholder="••••••••" />
        </Form.Item>

        <Form.Item
          name="senderEmail"
          label="Sender Email"
          rules={[
            { required: true, message: 'Sender email is required' },
            { type: 'email', message: 'Invalid email address' }
          ]}
        >
          <Input placeholder="noreply@yourdomain.com" />
        </Form.Item>

        <Form.Item
          name="senderName"
          label="Sender Name"
          rules={[{ required: true, message: 'Sender name is required' }]}
        >
          <Input placeholder="AccountOS" />
        </Form.Item>

        <Form.Item
          name="useTLS"
          label="Use TLS"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
            loading={updateMutation.isPending}
            size="large"
          >
            Save Changes
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

