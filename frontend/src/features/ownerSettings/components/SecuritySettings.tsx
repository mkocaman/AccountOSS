import React from 'react';
import { Form, InputNumber, Switch, Button, message, Spin, Divider } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SaveOutlined } from '@ant-design/icons';

import { ownerSettingsApi } from '@/api/ownerSettings';
import type { UpdateOwnerSettingsRequest } from '@/types/ownerSettings';

export default function SecuritySettings() {
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
      message.success('Security settings updated');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Update failed');
    }
  });

  // Set initial values
  React.useEffect(() => {
    if (settings?.securitySettings) {
      form.setFieldsValue({
        passwordMinLength: settings.securitySettings.passwordMinLength,
        requireUppercase: settings.securitySettings.requireUppercase,
        requireNumbers: settings.securitySettings.requireNumbers,
        requireSpecialChars: settings.securitySettings.requireSpecialChars,
        sessionTimeout: settings.securitySettings.sessionTimeout,
        maxLoginAttempts: settings.securitySettings.maxLoginAttempts,
        lockoutDuration: settings.securitySettings.lockoutDuration,
        twoFactorRequired: settings.securitySettings.twoFactorRequired
      });
    }
  }, [settings, form]);

  const handleSubmit = async (values: any) => {
    const data: UpdateOwnerSettingsRequest = {
      securitySettings: values
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
      <h3 className="text-lg font-semibold mb-4">Security Settings</h3>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <h4 className="text-md font-semibold mb-3">Password Policy</h4>

        <Form.Item
          name="passwordMinLength"
          label="Minimum Password Length"
          rules={[{ required: true }]}
        >
          <InputNumber min={6} max={32} className="w-full" />
        </Form.Item>

        <Form.Item
          name="requireUppercase"
          label="Require Uppercase Characters"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name="requireNumbers"
          label="Require Numbers"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name="requireSpecialChars"
          label="Require Special Characters"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Divider />

        <h4 className="text-md font-semibold mb-3">Session Management</h4>

        <Form.Item
          name="sessionTimeout"
          label="Session Timeout (minutes)"
          rules={[{ required: true }]}
        >
          <InputNumber min={5} max={1440} className="w-full" />
        </Form.Item>

        <Divider />

        <h4 className="text-md font-semibold mb-3">Login Security</h4>

        <Form.Item
          name="maxLoginAttempts"
          label="Max Login Attempts"
          rules={[{ required: true }]}
        >
          <InputNumber min={3} max={10} className="w-full" />
        </Form.Item>

        <Form.Item
          name="lockoutDuration"
          label="Lockout Duration (minutes)"
          rules={[{ required: true }]}
        >
          <InputNumber min={5} max={1440} className="w-full" />
        </Form.Item>

        <Form.Item
          name="twoFactorRequired"
          label={
            <div>
              <div className="font-medium">Require Two-Factor Authentication</div>
              <div className="text-sm text-gray-500">
                Force all users to enable 2FA
              </div>
            </div>
          }
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

