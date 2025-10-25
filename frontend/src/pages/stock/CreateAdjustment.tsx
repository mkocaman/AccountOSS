import React, { useState } from 'react';
import {
  Card,
  Form,
  Select,
  Input,
  InputNumber,
  Button,
  Space,
  Row,
  Col,
  Alert,
  Statistic,
  Divider,
  message,
  Spin,
} from 'antd';
import {
  SaveOutlined,
  CloseOutlined,
  ExclamationCircleOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { stockService } from '@/services/stockService';
import type {
  CreateStockAdjustmentRequest,
  AdjustmentReasonCode,
  StockLevel,
} from '@/types/stock';

const { TextArea } = Input;

export const CreateAdjustment: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // Form state - Seçilen ürün ve depo bilgileri
  const [selectedProduct, setSelectedProduct] = useState<string | undefined>();
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | undefined>();
  const [currentStockInfo, setCurrentStockInfo] = useState<StockLevel | null>(null);
  const [adjustedStock, setAdjustedStock] = useState<number | undefined>();

  // Stok seviyelerini getir - Mevcut stok bilgileri
  const {
    data: stockLevels,
    isLoading: levelsLoading,
  } = useQuery({
    queryKey: ['stockLevels'],
    queryFn: () => stockService.getStockLevels(),
    staleTime: 30 * 1000,
  });

  // Seçilen ürünün stok bilgilerini getir - Ürün bazlı stok detayları
  const {
    data: productStock,
    isLoading: stockLoading,
  } = useQuery({
    queryKey: ['productStock', selectedProduct, selectedWarehouse],
    queryFn: () => {
      if (!selectedProduct || !selectedWarehouse) return null;
      return stockService.getStockLevels({
        productId: selectedProduct,
        warehouseId: selectedWarehouse,
      });
    },
    enabled: !!selectedProduct && !!selectedWarehouse,
    staleTime: 30 * 1000,
  });

  // Mevcut stok bilgisini güncelle - Seçilen ürün/depo değiştiğinde
  React.useEffect(() => {
    if (productStock && productStock.length > 0) {
      const stock = productStock[0];
      setCurrentStockInfo(stock);
      form.setFieldsValue({
        currentStock: stock.quantity,
        unitCost: stock.unitCost,
      });
    } else {
      setCurrentStockInfo(null);
      form.setFieldsValue({
        currentStock: undefined,
        unitCost: undefined,
      });
    }
  }, [productStock, form]);

  // Düzeltme oluşturma mutation - Yeni düzeltme kaydetme
  const createMutation = useMutation({
    mutationFn: (data: CreateStockAdjustmentRequest) =>
      stockService.createStockAdjustment(data),
    onSuccess: () => {
      message.success(t('stock.adjustments.messages.created'));
      navigate('/stock/adjustments');
    },
    onError: () => {
      message.error(t('stock.adjustments.messages.createError'));
    },
  });

  // Form gönderimi - Düzeltme oluşturma
  const handleSubmit = async (values: any) => {
    if (!selectedProduct || !selectedWarehouse) {
      message.error(t('stock.adjustments.form.productWarehouseRequired'));
      return;
    }

    const data: CreateStockAdjustmentRequest = {
      productId: selectedProduct,
      warehouseId: selectedWarehouse,
      adjustedStock: values.adjustedStock,
      reasonCode: values.reasonCode,
      reason: values.reason,
      notes: values.notes,
    };

    createMutation.mutate(data);
  };

  // Fark hesaplama - Mevcut stok ile yeni stok arasındaki fark
  const difference = React.useMemo(() => {
    if (!currentStockInfo || adjustedStock === undefined) return 0;
    return adjustedStock - currentStockInfo.quantity;
  }, [currentStockInfo, adjustedStock]);

  // Fark rengi - Pozitif/negatif fark için renk
  const getDifferenceColor = () => {
    if (difference > 0) return '#52c41a';
    if (difference < 0) return '#ff4d4f';
    return '#8c8c8c';
  };

  // Ürün değişikliği - Ürün seçildiğinde stok bilgilerini güncelle
  const handleProductChange = (value: string) => {
    setSelectedProduct(value);
    setAdjustedStock(undefined);
    form.setFieldsValue({ adjustedStock: undefined });
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Header - Sayfa başlığı ve navigasyon */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/stock/adjustments')}
            >
              {t('common.back')}
            </Button>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 600, margin: 0 }}>
                {t('stock.adjustments.create.title')}
              </h1>
              <p style={{ color: '#8c8c8c', margin: '8px 0 0' }}>
                {t('stock.adjustments.create.description')}
              </p>
            </div>
          </Space>
        </Col>
        <Col>
          <Space>
            <Button
              icon={<CloseOutlined />}
              onClick={() => navigate('/stock/adjustments')}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={() => form.submit()}
              loading={createMutation.isPending}
            >
              {t('stock.adjustments.create.save')}
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Uyarı - Düzeltme işlemi hakkında bilgilendirme */}
      <Alert
        message={t('stock.adjustments.info.title')}
        description={t('stock.adjustments.info.description')}
        type="warning"
        icon={<ExclamationCircleOutlined />}
        style={{ marginBottom: 24 }}
        showIcon
      />

      <Row gutter={[16, 16]}>
        {/* Form - Düzeltme oluşturma formu */}
        <Col xs={24} lg={16}>
          <Card>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              autoComplete="off"
            >
              <Row gutter={[16, 16]}>
                {/* Ürün Seçimi */}
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={t('stock.adjustments.form.product')}
                    name="productId"
                    rules={[
                      {
                        required: true,
                        message: t('stock.adjustments.form.productRequired'),
                      },
                    ]}
                  >
                    <Select
                      placeholder={t('stock.adjustments.form.productPlaceholder')}
                      showSearch
                      optionFilterProp="children"
                      loading={levelsLoading}
                      onChange={handleProductChange}
                      options={
                        stockLevels?.map((level) => ({
                          label: `${level.productName} (${level.productCode})`,
                          value: level.productId,
                        })) || []
                      }
                    />
                  </Form.Item>
                </Col>

                {/* Depo Seçimi */}
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={t('stock.adjustments.form.warehouse')}
                    name="warehouseId"
                    rules={[
                      {
                        required: true,
                        message: t('stock.adjustments.form.warehouseRequired'),
                      },
                    ]}
                  >
                    <Select
                      placeholder={t('stock.adjustments.form.warehousePlaceholder')}
                      onChange={(value) => setSelectedWarehouse(value)}
                      options={[
                        { label: 'Ana Depo', value: 'warehouse-1' },
                        { label: 'Yan Depo', value: 'warehouse-2' },
                        { label: 'Soğuk Depo', value: 'warehouse-3' },
                      ]}
                    />
                  </Form.Item>
                </Col>

                {/* Mevcut Stok Bilgileri */}
                {currentStockInfo && (
                  <>
                    <Col xs={24} sm={8}>
                      <Form.Item
                        label={t('stock.adjustments.form.currentStock')}
                        name="currentStock"
                      >
                        <InputNumber
                          style={{ width: '100%' }}
                          disabled
                          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={8}>
                      <Form.Item
                        label={t('stock.adjustments.form.unitCost')}
                        name="unitCost"
                      >
                        <InputNumber
                          style={{ width: '100%' }}
                          disabled
                          formatter={(value) => `₺${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={8}>
                      <Form.Item
                        label={t('stock.adjustments.form.totalValue')}
                      >
                        <InputNumber
                          style={{ width: '100%' }}
                          disabled
                          value={currentStockInfo.quantity * currentStockInfo.unitCost}
                          formatter={(value) => `₺${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        />
                      </Form.Item>
                    </Col>
                  </>
                )}

                {/* Yeni Stok Miktarı */}
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={t('stock.adjustments.form.adjustedStock')}
                    name="adjustedStock"
                    rules={[
                      {
                        required: true,
                        message: t('stock.adjustments.form.adjustedStockRequired'),
                      },
                      {
                        type: 'number',
                        min: 0,
                        message: t('stock.adjustments.form.adjustedStockMin'),
                      },
                    ]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder={t('stock.adjustments.form.adjustedStockPlaceholder')}
                      min={0}
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                      onChange={(value) => setAdjustedStock(value || 0)}
                    />
                  </Form.Item>
                </Col>

                {/* Düzeltme Nedeni Kodu */}
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={t('stock.adjustments.form.reasonCode')}
                    name="reasonCode"
                    rules={[
                      {
                        required: true,
                        message: t('stock.adjustments.form.reasonCodeRequired'),
                      },
                    ]}
                  >
                    <Select
                      placeholder={t('stock.adjustments.form.reasonCodePlaceholder')}
                      options={[
                        {
                          label: t('stock.adjustments.reasonCodes.count'),
                          value: 'count',
                        },
                        {
                          label: t('stock.adjustments.reasonCodes.damage'),
                          value: 'damage',
                        },
                        {
                          label: t('stock.adjustments.reasonCodes.theft'),
                          value: 'theft',
                        },
                        {
                          label: t('stock.adjustments.reasonCodes.correction'),
                          value: 'correction',
                        },
                        {
                          label: t('stock.adjustments.reasonCodes.expiry'),
                          value: 'expiry',
                        },
                        {
                          label: t('stock.adjustments.reasonCodes.other'),
                          value: 'other',
                        },
                      ]}
                    />
                  </Form.Item>
                </Col>

                {/* Düzeltme Nedeni */}
                <Col xs={24}>
                  <Form.Item
                    label={t('stock.adjustments.form.reason')}
                    name="reason"
                    rules={[
                      {
                        required: true,
                        message: t('stock.adjustments.form.reasonRequired'),
                      },
                      {
                        min: 10,
                        message: t('stock.adjustments.form.reasonMinLength'),
                      },
                    ]}
                  >
                    <TextArea
                      rows={3}
                      placeholder={t('stock.adjustments.form.reasonPlaceholder')}
                      maxLength={500}
                      showCount
                    />
                  </Form.Item>
                </Col>

                {/* Ek Notlar */}
                <Col xs={24}>
                  <Form.Item
                    label={t('stock.adjustments.form.notes')}
                    name="notes"
                  >
                    <TextArea
                      rows={2}
                      placeholder={t('stock.adjustments.form.notesPlaceholder')}
                      maxLength={200}
                      showCount
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>

        {/* Özet Panel - Düzeltme özeti */}
        <Col xs={24} lg={8}>
          <Card title={t('stock.adjustments.summary.title')}>
            {stockLoading ? (
              <Spin size="large" />
            ) : currentStockInfo ? (
              <>
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <Statistic
                      title={t('stock.adjustments.summary.currentStock')}
                      value={currentStockInfo.quantity}
                      formatter={(value) => value?.toLocaleString()}
                    />
                  </Col>
                  <Col span={24}>
                    <Statistic
                      title={t('stock.adjustments.summary.adjustedStock')}
                      value={adjustedStock || 0}
                      formatter={(value) => value?.toLocaleString()}
                    />
                  </Col>
                  <Col span={24}>
                    <Divider />
                    <Statistic
                      title={t('stock.adjustments.summary.difference')}
                      value={difference}
                      valueStyle={{
                        color: getDifferenceColor(),
                        fontSize: 20,
                        fontWeight: 600,
                      }}
                      formatter={(value) => {
                        const val = value as number;
                        return `${val > 0 ? '+' : ''}${val.toLocaleString()}`;
                      }}
                    />
                  </Col>
                  <Col span={24}>
                    <Statistic
                      title={t('stock.adjustments.summary.unitCost')}
                      value={currentStockInfo.unitCost}
                      formatter={(value) => `₺${value?.toLocaleString()}`}
                    />
                  </Col>
                  <Col span={24}>
                    <Statistic
                      title={t('stock.adjustments.summary.totalValue')}
                      value={currentStockInfo.quantity * currentStockInfo.unitCost}
                      formatter={(value) => `₺${value?.toLocaleString()}`}
                    />
                  </Col>
                </Row>
              </>
            ) : (
              <div style={{ textAlign: 'center', color: '#8c8c8c' }}>
                {t('stock.adjustments.summary.selectProduct')}
              </div>
            )}
          </Card>

          {/* Bilgi Kutusu - Düzeltme işlemi hakkında */}
          <Card
            title={t('stock.adjustments.info.title')}
            style={{ marginTop: 16 }}
            size="small"
          >
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>
              <p>{t('stock.adjustments.info.step1')}</p>
              <p>{t('stock.adjustments.info.step2')}</p>
              <p>{t('stock.adjustments.info.step3')}</p>
              <p>{t('stock.adjustments.info.step4')}</p>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CreateAdjustment;
