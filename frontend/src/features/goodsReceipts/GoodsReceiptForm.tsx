import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Select, 
  DatePicker,
  Button,
  Table,
  InputNumber,
  Space,
  message,
  Row,
  Col,
  Checkbox,
  Alert,
  Spin
} from 'antd';
import { 
  SaveOutlined,
  ArrowLeftOutlined,
  InboxOutlined
} from '@ant-design/icons';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';

import { goodsReceiptsApi } from '@/api/goodsReceipts';
import { purchaseOrdersApi } from '@/api/purchaseOrders';
import type { CreateGoodsReceiptRequest, CreateGoodsReceiptItemRequest } from '@/types/goodsReceipt';
import type { PurchaseOrderItem } from '@/types/purchaseOrder';
import { usePageTitle } from '@/hooks/usePageTitle';

interface FormItem extends CreateGoodsReceiptItemRequest {
  key: string;
  product?: any;
  orderedQuantity: number;
  previouslyReceivedQuantity: number;
  remainingQuantity: number;
}

export default function GoodsReceiptForm() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const poId = searchParams.get('poId');
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [items, setItems] = useState<FormItem[]>([]);
  const [selectedPOId, setSelectedPOId] = useState<string | undefined>(poId || undefined);

  usePageTitle(id ? 'Mal Kabul Düzenle' : 'Yeni Mal Kabul');

  // Fetch existing GR
  const { data: receipt } = useQuery({
    queryKey: ['goodsReceipt', id],
    queryFn: () => goodsReceiptsApi.getById(id!),
    enabled: !!id
  });

  // Fetch purchase order
  const { data: purchaseOrder, isLoading: poLoading } = useQuery({
    queryKey: ['purchaseOrder', selectedPOId],
    queryFn: () => purchaseOrdersApi.getById(selectedPOId!),
    enabled: !!selectedPOId
  });

  // Fetch all confirmed purchase orders for selection
  const { data: purchaseOrders } = useQuery({
    queryKey: ['purchaseOrders-confirmed'],
    queryFn: () => purchaseOrdersApi.getAll({ status: 1, pageSize: 1000 }) // Status: Confirmed
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: (data: CreateGoodsReceiptRequest) => {
      if (id) {
        return goodsReceiptsApi.update(id, data);
      }
      return goodsReceiptsApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goodsReceipts'] });
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
      message.success(id ? 'Mal kabul güncellendi' : 'Mal kabul oluşturuldu');
      navigate('/goods-receipts');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'İşlem başarısız');
    }
  });

  // Load existing GR data
  useEffect(() => {
    if (receipt) {
      form.setFieldsValue({
        receiptDate: dayjs(receipt.receiptDate),
        purchaseOrderId: receipt.purchaseOrderId,
        warehouseId: receipt.warehouseId,
        notes: receipt.notes
      });
      setSelectedPOId(receipt.purchaseOrderId);
      setItems(receipt.items.map((item: any, index: number) => ({
        key: `item-${index}`,
        purchaseOrderItemId: item.purchaseOrderItemId,
        productId: item.productId,
        receivedQuantity: item.receivedQuantity,
        unitCost: item.unitCost,
        isQualityApproved: item.isQualityApproved,
        qualityNotes: item.qualityNotes,
        notes: item.notes,
        product: item.product,
        orderedQuantity: item.orderedQuantity,
        previouslyReceivedQuantity: item.previouslyReceivedQuantity,
        remainingQuantity: item.remainingQuantity
      })));
    }
  }, [receipt, form]);

  // Load PO items when PO is selected
  useEffect(() => {
    if (purchaseOrder && !id) {
      form.setFieldValue('warehouseId', purchaseOrder.warehouseId);
      
      // Initialize items from PO
      const grItems: FormItem[] = purchaseOrder.items
        .filter((item: PurchaseOrderItem) => item.remainingQuantity > 0)
        .map((item: PurchaseOrderItem, index: number) => ({
          key: `po-item-${index}`,
          purchaseOrderItemId: item.id,
          productId: item.productId,
          receivedQuantity: item.remainingQuantity, // Default to remaining
          unitCost: item.unitPrice,
          isQualityApproved: true,
          product: item.product,
          orderedQuantity: item.orderedQuantity,
          previouslyReceivedQuantity: item.receivedQuantity,
          remainingQuantity: item.remainingQuantity
        }));
      
      setItems(grItems);
    }
  }, [purchaseOrder, id, form]);

  // Update item
  const updateItem = (key: string, field: string, value: any) => {
    setItems(items.map(item => 
      item.key === key ? { ...item, [field]: value } : item
    ));
  };

  // Item columns
  const itemColumns: ColumnsType<FormItem> = [
    {
      title: '#',
      width: 50,
      render: (_, __, index) => index + 1
    },
    {
      title: 'Ürün',
      key: 'product',
      width: 250,
      render: (_, record) => (
        <div>
          <div className="font-semibold">{record.product?.name}</div>
          <div className="text-xs text-gray-500">{record.product?.code}</div>
        </div>
      )
    },
    {
      title: 'Sipariş',
      dataIndex: 'orderedQuantity',
      width: 100,
      align: 'right',
      render: (qty, record) => (
        <div className="text-gray-500">
          {qty} {record.product?.unit}
        </div>
      )
    },
    {
      title: 'Önceki',
      dataIndex: 'previouslyReceivedQuantity',
      width: 100,
      align: 'right',
      render: (qty, record) => (
        <div className="text-blue-500">
          {qty} {record.product?.unit}
        </div>
      )
    },
    {
      title: 'Kalan',
      dataIndex: 'remainingQuantity',
      width: 100,
      align: 'right',
      render: (qty, record) => (
        <div className="text-orange-500 font-semibold">
          {qty} {record.product?.unit}
        </div>
      )
    },
    {
      title: 'Teslim Alınan *',
      dataIndex: 'receivedQuantity',
      width: 150,
      render: (qty, record) => (
        <InputNumber
          className="w-full"
          min={0.01}
          max={record.remainingQuantity}
          precision={2}
          value={qty}
          onChange={(value) => updateItem(record.key, 'receivedQuantity', value || 0)}
          addonAfter={record.product?.unit}
          status={qty > record.remainingQuantity ? 'error' : undefined}
        />
      )
    },
    {
      title: 'Birim Maliyet',
      dataIndex: 'unitCost',
      width: 130,
      align: 'right',
      render: (cost) => `${cost.toFixed(2)} ₺`
    },
    {
      title: 'Kalite Onayı',
      dataIndex: 'isQualityApproved',
      width: 120,
      align: 'center',
      render: (approved, record) => (
        <Checkbox
          checked={approved}
          onChange={(e) => updateItem(record.key, 'isQualityApproved', e.target.checked)}
        />
      )
    },
    {
      title: 'Kalite Notu',
      dataIndex: 'qualityNotes',
      width: 150,
      render: (notes, record) => (
        <Input.TextArea
          rows={1}
          value={notes}
          onChange={(e) => updateItem(record.key, 'qualityNotes', e.target.value)}
          placeholder="Kalite notu..."
        />
      )
    }
  ];

  // Calculate total received value
  const totalValue = React.useMemo(() => {
    return items.reduce((sum, item) => 
      sum + (item.receivedQuantity * item.unitCost), 0
    );
  }, [items]);

  // Form submit
  const handleSubmit = async (values: any) => {
    if (items.length === 0) {
      message.error('En az bir ürün teslim alınmalı');
      return;
    }

    const invalidItems = items.filter(item => 
      item.receivedQuantity <= 0 || 
      item.receivedQuantity > item.remainingQuantity
    );
    
    if (invalidItems.length > 0) {
      message.error('Teslim alınan miktarlar geçerli aralıkta olmalı');
      return;
    }

    const data: CreateGoodsReceiptRequest = {
      receiptDate: values.receiptDate.format('YYYY-MM-DD'),
      purchaseOrderId: values.purchaseOrderId,
      warehouseId: values.warehouseId,
      notes: values.notes,
      items: items.map(item => ({
        purchaseOrderItemId: item.purchaseOrderItemId,
        productId: item.productId,
        receivedQuantity: item.receivedQuantity,
        unitCost: item.unitCost,
        isQualityApproved: item.isQualityApproved,
        qualityNotes: item.qualityNotes,
        notes: item.notes
      }))
    };

    await saveMutation.mutateAsync(data);
  };

  if (poLoading && selectedPOId) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" tip="Sipariş yükleniyor..." />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/goods-receipts')}
          className="mb-4"
        >
          Geri
        </Button>
        <div className="flex items-center gap-3">
          <InboxOutlined className="text-3xl text-blue-500" />
          <h1 className="text-2xl font-bold text-gray-900">
            {id ? 'Mal Kabul Düzenle' : 'Yeni Mal Kabul'}
          </h1>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          receiptDate: dayjs()
        }}
      >
        {/* Basic Info */}
        <Card title="Genel Bilgiler" className="mb-4">
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="receiptDate"
                label="Kabul Tarihi"
                rules={[{ required: true, message: 'Tarih zorunludur' }]}
              >
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="purchaseOrderId"
                label="Satın Alma Siparişi"
                rules={[{ required: true, message: 'Sipariş seçimi zorunludur' }]}
              >
                <Select
                  showSearch
                  placeholder="Sipariş seçin"
                  optionFilterProp="label"
                  disabled={!!id || !!poId}
                  value={selectedPOId}
                  onChange={setSelectedPOId}
                  options={purchaseOrders?.items?.map((po: any) => ({
                    label: `${po.orderNumber} - ${po.supplier?.name}`,
                    value: po.id
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
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
            </Col>
          </Row>

          <Form.Item
            name="notes"
            label="Notlar"
          >
            <Input.TextArea rows={2} placeholder="Mal kabul notları..." />
          </Form.Item>
        </Card>

        {/* Purchase Order Info */}
        {purchaseOrder && (
          <Alert
            message="Sipariş Bilgileri"
            description={
              <div className="text-sm">
                <div><strong>Sipariş No:</strong> {purchaseOrder.orderNumber}</div>
                <div><strong>Tedarikçi:</strong> {purchaseOrder.supplier?.name}</div>
                <div><strong>Sipariş Tarihi:</strong> {dayjs(purchaseOrder.orderDate).format('DD.MM.YYYY')}</div>
              </div>
            }
            type="info"
            showIcon
            className="mb-4"
          />
        )}

        {/* Items */}
        <Card title="Teslim Alınan Ürünler" className="mb-4">
          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Lütfen bir satın alma siparişi seçin
            </div>
          ) : (
            <Table
              columns={itemColumns}
              dataSource={items}
              rowKey="key"
              pagination={false}
              scroll={{ x: 1200 }}
              summary={() => (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={5}>
                      <strong>TOPLAM</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={5} align="right">
                      <strong className="text-green-600">
                        {items.reduce((sum, item) => sum + item.receivedQuantity, 0).toFixed(2)}
                      </strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={6} align="right">
                      <strong>Toplam Değer:</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={7} colSpan={2}>
                      <strong className="text-lg text-blue-600">
                        {totalValue.toFixed(2)} ₺
                      </strong>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />
          )}
        </Card>

        {/* Actions */}
        <Card>
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              size="large"
              loading={saveMutation.isPending}
              disabled={items.length === 0}
            >
              {id ? 'Güncelle' : 'Oluştur'}
            </Button>
            <Button
              size="large"
              onClick={() => navigate('/goods-receipts')}
            >
              İptal
            </Button>
          </Space>
        </Card>
      </Form>
    </div>
  );
}

