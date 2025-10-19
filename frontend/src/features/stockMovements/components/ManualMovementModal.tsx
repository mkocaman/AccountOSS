import { useState } from 'react';
import { Modal, Form, Select, InputNumber, DatePicker, Input, message, Alert } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';

import { stockMovementsApi } from '@/api/stockMovements';
import { productsApi } from '@/api/products';
import type { CreateStockMovementRequest } from '@/types/stockMovement';
import { StockMovementType } from '@/types/stockMovement';

interface Props {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function ManualMovementModal({ open, onCancel, onSuccess }: Props) {
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

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateStockMovementRequest) => 
      stockMovementsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      form.resetFields();
      setSelectedProduct(null);
      onSuccess();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Hareket eklenemedi');
    }
  });

  const handleProductChange = (productId: string) => {
    const product = products?.items?.find((p: any) => p.id === productId);
    setSelectedProduct(product);
  };

  const handleSubmit = async (values: any) => {
    const data: CreateStockMovementRequest = {
      ...values,
      movementDate: values.movementDate.format('YYYY-MM-DD')
    };
    await createMutation.mutateAsync(data);
  };

  return (
    <Modal
      title="Manuel Stok Hareketi"
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={createMutation.isPending}
      width={600}
      destroyOnClose
    >
      <Alert
        message="Manuel Hareket"
        description="Fatura veya sipariş olmadan manuel stok giriş/çıkış işlemi yapın."
        type="info"
        showIcon
        className="mb-4"
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          movementDate: dayjs(),
          type: StockMovementType.In
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

        <Form.Item
          name="type"
          label="Hareket Tipi"
          rules={[{ required: true, message: 'Tip seçimi zorunludur' }]}
        >
          <Select
            options={[
              { label: '➕ Giriş (Stok Artışı)', value: StockMovementType.In },
              { label: '➖ Çıkış (Stok Azalışı)', value: StockMovementType.Out }
            ]}
          />
        </Form.Item>

        <Form.Item
          name="quantity"
          label="Miktar"
          rules={[
            { required: true, message: 'Miktar zorunludur' },
            { type: 'number', min: 0.01, message: 'Miktar 0\'dan büyük olmalı' }
          ]}
        >
          <InputNumber
            className="w-full"
            placeholder="Miktar"
            min={0.01}
            precision={2}
            addonAfter={selectedProduct?.unit || 'Adet'}
          />
        </Form.Item>

        <Form.Item
          name="unitCost"
          label="Birim Maliyet"
          rules={[
            { required: true, message: 'Birim maliyet zorunludur' },
            { type: 'number', min: 0, message: 'Maliyet 0 veya daha büyük olmalı' }
          ]}
        >
          <InputNumber
            className="w-full"
            placeholder="Birim maliyet"
            min={0}
            precision={2}
            addonAfter="₺"
          />
        </Form.Item>

        <Form.Item
          name="movementDate"
          label="Hareket Tarihi"
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
            placeholder="Hareket ile ilgili açıklama..."
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

