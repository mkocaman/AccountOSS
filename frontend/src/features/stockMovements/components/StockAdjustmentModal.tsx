import { useState } from 'react';
import { Modal, Form, Select, InputNumber, Input, message, Alert } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { stockMovementsApi } from '@/api/stockMovements';
import { productsApi } from '@/api/products';
import type { StockAdjustmentRequest } from '@/types/stockMovement';

interface Props {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function StockAdjustmentModal({ open, onCancel, onSuccess }: Props) {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Fetch products
  const { data: products } = useQuery({
    queryKey: ['products-all'],
    queryFn: () => productsApi.getAll({ pageSize: 1000 }),
    enabled: open
  });

  // Adjust mutation
  const adjustMutation = useMutation({
    mutationFn: (data: StockAdjustmentRequest) => 
      stockMovementsApi.adjust(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      form.resetFields();
      setSelectedProduct(null);
      onSuccess();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Düzeltme başarısız');
    }
  });

  const handleProductChange = (productId: string) => {
    const product = products?.items?.find(p => p.id === productId);
    setSelectedProduct(product);
  };

  const handleSubmit = async (values: any) => {
    await adjustMutation.mutateAsync(values);
  };

  return (
    <Modal
      title="Stok Düzeltme"
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={adjustMutation.isPending}
      width={600}
      destroyOnClose
    >
      <Alert
        message="Dikkat"
        description="Stok düzeltme işlemi, mevcut stok miktarını manuel olarak değiştirir. Bu işlem geri alınamaz!"
        type="warning"
        showIcon
        className="mb-4"
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
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
            options={products?.items?.map(p => ({
              label: `${p.code} - ${p.name}`,
              value: p.id
            }))}
          />
        </Form.Item>

        <Form.Item
          name="warehouseId"
          label="Depo"
          rules={[{ required: true, message: 'Depo seçimi zorunludur' }]}
        >
          <Select
            placeholder="Depo seçin"
            options={[
              { label: 'Ana Depo', value: 'main-warehouse-id' }
              // TODO: Fetch from warehouses API
            ]}
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
          name="newQuantity"
          label="Yeni Miktar"
          rules={[
            { required: true, message: 'Yeni miktar zorunludur' },
            { type: 'number', min: 0, message: 'Miktar 0 veya daha büyük olmalı' }
          ]}
        >
          <InputNumber
            className="w-full"
            placeholder="Yeni stok miktarı"
            min={0}
            precision={2}
            addonAfter={selectedProduct?.unit || 'Adet'}
          />
        </Form.Item>

        <Form.Item
          name="reason"
          label="Düzeltme Nedeni"
          rules={[{ required: true, message: 'Neden belirtilmesi zorunludur' }]}
        >
          <Input.TextArea
            rows={3}
            placeholder="Örn: Sayım sonucu düzeltme, fire, vb..."
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

