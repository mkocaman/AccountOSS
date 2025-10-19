import { useState, useEffect } from 'react';
import { Table, Button, Select, InputNumber, Space } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { productsApi } from '@/api/products';
import type { Product } from '@/types/product';
import type { InvoiceItem } from '@/types/invoice';
import type { ColumnsType } from 'antd/es/table';

interface InvoiceItemsProps {
  value?: InvoiceItem[];
  onChange?: (items: InvoiceItem[]) => void;
  currency: string;
}

// Fatura kalemleri bileşeni
export const InvoiceItems = ({ value = [], onChange, currency }: InvoiceItemsProps) => {
  const [items, setItems] = useState<InvoiceItem[]>(value);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    // Parent'a değişiklikleri bildir
    onChange?.(items);
  }, [items]);

  const loadProducts = async () => {
    try {
      const response = await productsApi.getAll({ pageSize: 1000 });
      if (response.success) {
        setProducts(response.data.items || []);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Ürünler yüklenemedi');
      setProducts([]);
    }
  };

  // Yeni satır ekle
  const addItem = () => {
    const newItem: InvoiceItem = {
      id: `temp-${Date.now()}`, // Geçici ID
      invoiceId: '',
      productId: '',
      lineNumber: items.length + 1,
      description: '',
      quantity: 1,
      unit: 'Adet',
      unitPrice: 0,
      discountRate: 0,
      discountAmount: 0,
      vatRate: 20,
      vatAmount: 0,
      lineTotal: 0,
      lineTotalInBase: 0,
    };

    setItems([...items, newItem]);
  };

  // Satır sil
  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    // Line number'ları yeniden düzenle
    const reorderedItems = newItems.map((item, idx) => ({
      ...item,
      lineNumber: idx + 1,
    }));
    setItems(reorderedItems);
  };

  // Ürün seçildiğinde
  const handleProductChange = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      productId,
      description: product.name,
      unit: product.unit,
      unitPrice: product.salePrice,
      vatRate: product.vatRate,
      product: {
        id: product.id,
        name: product.name,
        code: product.code,
        unit: product.unit,
      },
    };

    // Hesapla
    calculateLineTotal(newItems, index);
  };

  // Satır toplamı hesapla
  const calculateLineTotal = (itemsList: InvoiceItem[], index: number) => {
    const item = itemsList[index];

    // 1. Brüt tutar
    const grossAmount = item.quantity * item.unitPrice;

    // 2. İndirim hesapla
    if (item.discountRate > 0) {
      item.discountAmount = (grossAmount * item.discountRate) / 100;
    } else {
      item.discountAmount = 0;
    }

    // 3. İndirimli tutar
    const discountedAmount = grossAmount - item.discountAmount;

    // 4. KDV hesapla
    item.vatAmount = (discountedAmount * item.vatRate) / 100;

    // 5. Satır toplamı (KDV dahil)
    item.lineTotal = discountedAmount + item.vatAmount;
    item.lineTotalInBase = item.lineTotal; // Backend exchange rate ile çarpacak

    setItems([...itemsList]);
  };

  // Field değişikliği
  const handleFieldChange = (
    index: number,
    field: keyof InvoiceItem,
    value: any
  ) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    calculateLineTotal(newItems, index);
  };

  // Tablo kolonları
  const columns: ColumnsType<InvoiceItem> = [
    {
      title: '#',
      dataIndex: 'lineNumber',
      key: 'lineNumber',
      width: 50,
      align: 'center',
    },
    {
      title: 'Ürün *',
      key: 'product',
      width: 250,
      render: (_, record, index) => (
        <Select
          showSearch
          placeholder="Ürün seçin"
          value={record.productId || undefined}
          onChange={(value) => handleProductChange(index, value)}
          optionFilterProp="children"
          style={{ width: '100%' }}
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
          options={products?.map((p) => ({
            label: `${p.name} (${p.code})`,
            value: p.id,
          })) || []}
        />
      ),
    },
    {
      title: 'Açıklama',
      key: 'description',
      width: 200,
      render: (_, record, index) => (
        <input
          type="text"
          className="ant-input"
          value={record.description}
          onChange={(e) =>
            handleFieldChange(index, 'description', e.target.value)
          }
          placeholder="Açıklama"
        />
      ),
    },
    {
      title: 'Miktar *',
      key: 'quantity',
      width: 120,
      render: (_, record, index) => (
        <InputNumber
          min={0.01}
          value={record.quantity}
          onChange={(value) =>
            handleFieldChange(index, 'quantity', value || 0)
          }
          style={{ width: '100%' }}
          precision={2}
        />
      ),
    },
    {
      title: 'Birim',
      dataIndex: 'unit',
      key: 'unit',
      width: 80,
    },
    {
      title: 'Birim Fiyat *',
      key: 'unitPrice',
      width: 120,
      render: (_, record, index) => (
        <InputNumber
          min={0}
          value={record.unitPrice}
          onChange={(value) =>
            handleFieldChange(index, 'unitPrice', value || 0)
          }
          style={{ width: '100%' }}
          precision={2}
          addonAfter={currency}
        />
      ),
    },
    {
      title: 'İndirim %',
      key: 'discountRate',
      width: 100,
      render: (_, record, index) => (
        <InputNumber
          min={0}
          max={100}
          value={record.discountRate}
          onChange={(value) =>
            handleFieldChange(index, 'discountRate', value || 0)
          }
          style={{ width: '100%' }}
          precision={2}
          addonAfter="%"
        />
      ),
    },
    {
      title: 'KDV %',
      key: 'vatRate',
      width: 100,
      render: (_, record, index) => (
        <Select
          value={record.vatRate}
          onChange={(value) => handleFieldChange(index, 'vatRate', value)}
          style={{ width: '100%' }}
        >
          <Select.Option value={20}>%20</Select.Option>
          <Select.Option value={18}>%18</Select.Option>
          <Select.Option value={10}>%10</Select.Option>
          <Select.Option value={8}>%8</Select.Option>
          <Select.Option value={1}>%1</Select.Option>
          <Select.Option value={0}>%0</Select.Option>
        </Select>
      ),
    },
    {
      title: 'Tutar',
      key: 'lineTotal',
      width: 150,
      align: 'right',
      render: (_, record) => (
        <div>
          <div className="font-medium">
            {record.lineTotal.toFixed(2)} {currency}
          </div>
          {record.discountAmount > 0 && (
            <div className="text-xs text-gray-500">
              İnd: -{record.discountAmount.toFixed(2)}
            </div>
          )}
        </div>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      align: 'center',
      render: (_, __, index) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeItem(index)}
          size="small"
        />
      ),
    },
  ];

  return (
    <div>
      <Table
        columns={columns}
        dataSource={items}
        rowKey={(record) => record.id}
        pagination={false}
        scroll={{ x: 1400 }}
        footer={() => (
          <Button type="dashed" onClick={addItem} icon={<PlusOutlined />} block>
            Yeni Satır Ekle
          </Button>
        )}
      />
    </div>
  );
};

