import React from 'react';
import { Modal, Form, Input, Select, InputNumber, Switch, Row, Col, message } from 'antd';
import { useMutation } from '@tanstack/react-query';

import { suppliersApi } from '@/api/suppliers';
import type { Supplier, CreateSupplierRequest } from '@/types/supplier';
import { SupplierType } from '@/types/supplier';

interface Props {
  open: boolean;
  supplier?: Supplier;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function SupplierForm({ open, supplier, onCancel, onSuccess }: Props) {
  const [form] = Form.useForm();

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: (data: CreateSupplierRequest) => {
      if (supplier) {
        return suppliersApi.update(supplier.id, data);
      }
      return suppliersApi.create(data);
    },
    onSuccess: () => {
      form.resetFields();
      onSuccess();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'İşlem başarısız');
    }
  });

  // Set initial values
  React.useEffect(() => {
    if (supplier) {
      form.setFieldsValue(supplier);
    } else {
      form.resetFields();
    }
  }, [supplier, form, open]);

  const handleSubmit = async (values: any) => {
    await saveMutation.mutateAsync(values);
  };

  return (
    <Modal
      title={supplier ? 'Tedarikçi Düzenle' : 'Yeni Tedarikçi'}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={saveMutation.isPending}
      width={800}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          type: SupplierType.Domestic,
          currency: 'TRY',
          paymentTermDays: 30,
          isActive: true
        }}
      >
        {/* Basic Info */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Tedarikçi Adı"
              rules={[{ required: true, message: 'Tedarikçi adı zorunludur' }]}
            >
              <Input placeholder="Tedarikçi adı" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="type"
              label="Tip"
              rules={[{ required: true, message: 'Tip seçimi zorunludur' }]}
            >
              <Select
                options={[
                  { label: 'Yerli', value: SupplierType.Domestic },
                  { label: 'Yabancı', value: SupplierType.Foreign }
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Contact */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="contactPerson"
              label="İlgili Kişi"
            >
              <Input placeholder="Ad Soyad" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[{ type: 'email', message: 'Geçerli bir email adresi girin' }]}
            >
              <Input placeholder="email@example.com" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="phone"
              label="Telefon"
            >
              <Input placeholder="+90 xxx xxx xx xx" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="mobilePhone"
              label="Mobil Telefon"
            >
              <Input placeholder="+90 xxx xxx xx xx" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="website"
          label="Website"
        >
          <Input placeholder="https://www.example.com" />
        </Form.Item>

        {/* Tax Info */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="taxNumber"
              label="Vergi Numarası"
            >
              <Input placeholder="1234567890" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="taxOffice"
              label="Vergi Dairesi"
            >
              <Input placeholder="Vergi dairesi" />
            </Form.Item>
          </Col>
        </Row>

        {/* Address */}
        <Form.Item
          name="address"
          label="Adres"
        >
          <Input.TextArea rows={2} placeholder="Sokak, mahalle, bina no..." />
        </Form.Item>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="city"
              label="Şehir"
            >
              <Input placeholder="İstanbul" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="country"
              label="Ülke"
            >
              <Select
                showSearch
                placeholder="Ülke seçin"
                options={[
                  { label: 'Türkiye', value: 'TR' },
                  { label: 'Almanya', value: 'DE' },
                  { label: 'Çin', value: 'CN' },
                  { label: 'ABD', value: 'US' },
                  { label: 'İtalya', value: 'IT' }
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="postalCode"
              label="Posta Kodu"
            >
              <Input placeholder="34000" />
            </Form.Item>
          </Col>
        </Row>

        {/* Financial */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="currency"
              label="Para Birimi"
              rules={[{ required: true, message: 'Para birimi seçimi zorunludur' }]}
            >
              <Select
                options={[
                  { label: 'TRY - Türk Lirası', value: 'TRY' },
                  { label: 'USD - Dolar', value: 'USD' },
                  { label: 'EUR - Euro', value: 'EUR' },
                  { label: 'GBP - Sterlin', value: 'GBP' }
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="paymentTermDays"
              label="Vade Günü"
              rules={[{ required: true, message: 'Vade günü zorunludur' }]}
            >
              <InputNumber
                min={0}
                max={365}
                className="w-full"
                placeholder="30"
                addonAfter="gün"
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Notes */}
        <Form.Item
          name="notes"
          label="Notlar"
        >
          <Input.TextArea rows={3} placeholder="Özel notlar..." />
        </Form.Item>

        {/* Status */}
        <Form.Item
          name="isActive"
          label="Aktif"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
}
