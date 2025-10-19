import React from 'react';
import { Form, Input, Switch, InputNumber, Button, message, Spin, Divider } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SaveOutlined } from '@ant-design/icons';

import { ownerSettingsApi } from '@/api/ownerSettings';
import type { UpdateOwnerSettingsRequest } from '@/types/ownerSettings';

export default function SystemConfiguration() {
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
      message.success('Settings updated successfully');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Update failed');
    }
  });

  // Set initial values
  React.useEffect(() => {
    if (settings) {
      form.setFieldsValue({
        systemName: settings.systemName,
        maintenanceMode: settings.maintenanceMode,
        allowNewRegistrations: settings.allowNewRegistrations,
        maxCompaniesPerUser: settings.maxCompaniesPerUser,
        maxUsersPerCompany: settings.maxUsersPerCompany,
        maxStoragePerCompany: settings.maxStoragePerCompany,
        maxApiCallsPerDay: settings.maxApiCallsPerDay,
        analyticsEnabled: settings.analyticsEnabled,
        errorTrackingEnabled: settings.errorTrackingEnabled,
        'globalFeatures.multiCurrencyEnabled': settings.globalFeatures.multiCurrencyEnabled,
        'globalFeatures.multiLanguageEnabled': settings.globalFeatures.multiLanguageEnabled,
        'globalFeatures.apiAccessEnabled': settings.globalFeatures.apiAccessEnabled,
        'globalFeatures.webhooksEnabled': settings.globalFeatures.webhooksEnabled,
        'globalFeatures.advancedReportsEnabled': settings.globalFeatures.advancedReportsEnabled
      });
    }
  }, [settings, form]);

  const handleSubmit = async (values: any) => {
    const data: UpdateOwnerSettingsRequest = {
      systemName: values.systemName,
      maintenanceMode: values.maintenanceMode,
      allowNewRegistrations: values.allowNewRegistrations,
      maxCompaniesPerUser: values.maxCompaniesPerUser,
      maxUsersPerCompany: values.maxUsersPerCompany,
      globalFeatures: {
        multiCurrencyEnabled: values['globalFeatures.multiCurrencyEnabled'],
        multiLanguageEnabled: values['globalFeatures.multiLanguageEnabled'],
        apiAccessEnabled: values['globalFeatures.apiAccessEnabled'],
        webhooksEnabled: values['globalFeatures.webhooksEnabled'],
        advancedReportsEnabled: values['globalFeatures.advancedReportsEnabled']
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
    <div className="max-w-3xl">
      <h3 className="text-lg font-semibold mb-4">System Configuration</h3>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="systemName"
          label="System Name"
          rules={[{ required: true, message: 'System name is required' }]}
        >
          <Input placeholder="AccountOS" />
        </Form.Item>

        <Divider />

        <h4 className="text-md font-semibold mb-3">System Status</h4>

        <Form.Item
          name="maintenanceMode"
          label={
            <div>
              <div className="font-medium">Maintenance Mode</div>
              <div className="text-sm text-gray-500">
                Enable to prevent user access during updates
              </div>
            </div>
          }
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name="allowNewRegistrations"
          label={
            <div>
              <div className="font-medium">Allow New Registrations</div>
              <div className="text-sm text-gray-500">
                Allow new companies to register
              </div>
            </div>
          }
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Divider />

        <h4 className="text-md font-semibold mb-3">Limits</h4>

        <Form.Item
          name="maxCompaniesPerUser"
          label="Max Companies Per User"
          rules={[{ required: true }]}
        >
          <InputNumber min={1} max={100} className="w-full" />
        </Form.Item>

        <Form.Item
          name="maxUsersPerCompany"
          label="Max Users Per Company"
          rules={[{ required: true }]}
        >
          <InputNumber min={1} max={1000} className="w-full" />
        </Form.Item>

        <Form.Item
          name="maxStoragePerCompany"
          label="Max Storage Per Company (GB)"
        >
          <InputNumber min={1} max={1000} className="w-full" />
        </Form.Item>

        <Form.Item
          name="maxApiCallsPerDay"
          label="Max API Calls Per Day"
        >
          <InputNumber min={1000} max={1000000} className="w-full" />
        </Form.Item>

        <Divider />

        <h4 className="text-md font-semibold mb-3">Global Features</h4>

        <Form.Item
          name="globalFeatures.multiCurrencyEnabled"
          label="Multi-Currency Support"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name="globalFeatures.multiLanguageEnabled"
          label="Multi-Language Support"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name="globalFeatures.apiAccessEnabled"
          label="API Access"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name="globalFeatures.webhooksEnabled"
          label="Webhooks"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name="globalFeatures.advancedReportsEnabled"
          label="Advanced Reports"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Divider />

        <h4 className="text-md font-semibold mb-3">Monitoring</h4>

        <Form.Item
          name="analyticsEnabled"
          label="Analytics Enabled"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name="errorTrackingEnabled"
          label="Error Tracking Enabled"
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

