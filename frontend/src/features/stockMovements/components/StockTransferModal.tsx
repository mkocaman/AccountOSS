import { useState } from 'react';
import { Modal, Form, Select, InputNumber, DatePicker, Input, message, Alert } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';

import { stockMovementsApi } from '@/api/stockMovements';
import { productsApi } from '@/api/products';
import type { StockTransferRequest } from '@/types/stockMovement';

interface Props {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function StockTransferModal({ open, onCancel, onSuccess }: Props) {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Fetch products
  const { data: productsResponse } = useQuery({
    queryKey: ['products-all'],
    queryFn: () => productsApi.getAll({ pageSize: 1000 }),
    enabled: open
  });

  const products = productsResponse?.data;

  // Transfer mutation
  const transferMutation = useMutation({
    mutationFn: (data: StockTransferRequest) => 
      stockMovementsApi.transfer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      form.resetFields();
      setSelectedProduct(null);
      onSuccess();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Transfer başarısız');
    }
  });

  const handleProductChange = (productId: string) => {
    const product = products?.items?.find((p: any) => p.id === productId);
    setSelectedProduct(product);
  };

  const handleSubmit = async (values: any) => {
    const data: StockTransferRequest = {
      ...values,
      transferDate: values.transferDate.format('YYYY-MM-DD')
    };
    await transferMutation.mutateAsync(data);
  };

  return (
    <Modal
      title="Depo Transferi"
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={transferMutation.isPending}
      width={600}
      destroyOnClose
    >
      <Alert
        message="Depo Transferi"
        description="Ürünü bir depodan başka bir depoya transfer edin. Kaynak depodan çıkış, hedef depoya giriş yapılır."
        type="info"
        showIcon
        className="mb-4"
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          transferDate: dayjs()
        }}
      >
        <Form.Item
          name="productId"
          label="Ürün"
          rules={[{ required: true, message: 'Ürün seçimi zorunludur' }]}
        >
          <Select
            showSearch
            placeholder="Ürün seçin"
            optionFilterProp="label"
            onChange={handleProductChange}
            options={products?.items?.map((p: any) => ({
              label: `${p.code} - ${p.name}`,
              value: p.id
            }))}
          />
        </Form.Item>

        {selectedProduct && (
          <Alert
            message={`Mevcut Stok: ${selectedProduct.stockQuantity} ${selectedProduct.unit}`}
            type="info"
            showIcon
            className="mb-4"
          />
        )}

        <Form.Item
          name="fromWarehouseId"
          label="Kaynak Depo"
          rules={[{ required: true, message: 'Kaynak depo seçimi zorunludur' }]}
        >
          <Select
            placeholder="Kaynak depo seçin"
            options={[
              { label: 'Ana Depo', value: 'main-warehouse-id' },
              { label: 'Yedek Depo', value: 'backup-warehouse-id' }
              // TODO: Fetch from warehouses API
            ]}
          />
        </Form.Item>

        <Form.Item
          name="toWarehouseId"
          label="Hedef Depo"
          rules={[
            { required: true, message: 'Hedef depo seçimi zorunludur' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('fromWarehouseId') !== value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Kaynak ve hedef depo aynı olamaz'));
              }
            })
          ]}
        >
          <Select
            placeholder="Hedef depo seçin"
            options={[
              { label: 'Ana Depo', value: 'main-warehouse-id' },
              { label: 'Yedek Depo', value: 'backup-warehouse-id' }
              // TODO: Fetch from warehouses API
            ]}
          />
        </Form.Item>

        <Form.Item
          name="quantity"
          label="Transfer Miktarı"
          rules={[
            { required: true, message: 'Miktar zorunludur' },
            { type: 'number', min: 0.01, message: 'Miktar 0\'dan büyük olmalı' }
          ]}
        >
          <InputNumber
            className="w-full"
            placeholder="Transfer edilecek miktar"
            min={0.01}
            precision={2}
            addonAfter={selectedProduct?.unit || 'Adet'}
          />
        </Form.Item>

        <Form.Item
          name="transferDate"
          label="Transfer Tarihi"
          rules={[{ required: true, message: 'Tarih seçimi zorunludur' }]}
        >
          <DatePicker className="w-full" />
        </Form.Item>

        <Form.Item
          name="notes"
          label="Notlar"
        >
          <Input.TextArea
            rows={3}
            placeholder="Transfer ile ilgili notlar..."
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

