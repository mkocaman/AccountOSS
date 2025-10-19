import React from 'react';
import { Modal, Form, Input, Select, Switch, message } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { partnersApi } from '@/api/partners';
import type { PartnerAddress } from '@/types/partner';

interface Props {
  open: boolean;
  partnerId: string;
  address?: PartnerAddress;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function PartnerAddressModal({ 
  open, 
  partnerId, 
  address, 
  onCancel, 
  onSuccess 
}: Props) {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      if (address) {
        return partnersApi.updateAddress(partnerId, address.id, data);
      }
      return partnersApi.addAddress(partnerId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partnerDetail', partnerId] });
      form.resetFields();
      onSuccess();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'İşlem başarısız');
    }
  });

  // Set initial values
  React.useEffect(() => {
    if (address) {
      form.setFieldsValue(address);
    } else {
      form.resetFields();
    }
  }, [address, form, open]);

  const handleSubmit = async (values: any) => {
    await saveMutation.mutateAsync(values);
  };

  return (
    <Modal
      title={address ? 'Adres Düzenle' : 'Yeni Adres Ekle'}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={saveMutation.isPending}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          type: 'Billing',
          isDefault: false
        }}
      >
        <Form.Item
          name="type"
          label="Adres Tipi"
          rules={[{ required: true, message: 'Tip seçimi zorunludur' }]}
        >
          <Select
            options={[
              { label: 'Fatura Adresi', value: 'Billing' },
              { label: 'Sevkiyat Adresi', value: 'Shipping' }
            ]}
          />
        </Form.Item>

        <Form.Item
          name="title"
          label="Adres Başlığı"
          rules={[{ required: true, message: 'Başlık zorunludur' }]}
        >
          <Input placeholder="Örn: Şirket Merkezi" />
        </Form.Item>

        <Form.Item
          name="address"
          label="Adres"
          rules={[{ required: true, message: 'Adres zorunludur' }]}
        >
          <Input.TextArea rows={3} placeholder="Sokak, mahalle, bina no..." />
        </Form.Item>

        <Form.Item
          name="district"
          label="İlçe"
        >
          <Input placeholder="İlçe" />
        </Form.Item>

        <Form.Item
          name="city"
          label="İl"
          rules={[{ required: true, message: 'İl zorunludur' }]}
        >
          <Input placeholder="İl" />
        </Form.Item>

        <Form.Item
          name="postalCode"
          label="Posta Kodu"
        >
          <Input placeholder="34000" />
        </Form.Item>

        <Form.Item
          name="country"
          label="Ülke"
          rules={[{ required: true, message: 'Ülke zorunludur' }]}
        >
          <Select
            showSearch
            placeholder="Ülke seçin"
            options={[
              { label: 'Türkiye', value: 'TR' },
              { label: 'Almanya', value: 'DE' },
              { label: 'Fransa', value: 'FR' },
              { label: 'İngiltere', value: 'GB' },
              { label: 'ABD', value: 'US' }
            ]}
          />
        </Form.Item>

        <Form.Item
          name="isDefault"
          label="Varsayılan Adres"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
}
