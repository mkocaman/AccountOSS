import { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Select, 
  DatePicker,
  Button,
  InputNumber,
  Space,
  message,
  Row,
  Col,
  Upload,
  Alert
} from 'antd';
import type { UploadFile } from 'antd';
import { 
  SaveOutlined,
  ArrowLeftOutlined,
  UploadOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';

import { expensesApi, expenseCategoriesApi } from '@/api/expenses';
import { partnersApi } from '@/api/partners';
import { PartnerType } from '@/types/partner';
import type { CreateExpenseRequest } from '@/types/expense';
import { PaymentMethod, paymentMethodLabels } from '@/types/expense';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function ExpenseForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  usePageTitle(id ? 'Masraf Düzenle' : 'Yeni Masraf');

  // Fetch existing expense
  const { data: expense } = useQuery({
    queryKey: ['expense', id],
    queryFn: () => expensesApi.getById(id!),
    enabled: !!id
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['expenseCategoriesAll'],
    queryFn: () => expenseCategoriesApi.getAllNoPaging()
  });

  // Fetch suppliers
  const { data: suppliersResponse } = useQuery({
    queryKey: ['suppliers-all'],
    queryFn: () => partnersApi.getAll({ type: PartnerType.Supplier, pageSize: 1000 })
  });

  const suppliers = suppliersResponse?.data;

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: (data: CreateExpenseRequest) => {
      if (id) {
        return expensesApi.update(id, data);
      }
      return expensesApi.create(data);
    },
    onSuccess: async (savedExpense: any) => {
      // Upload attachments
      if (fileList.length > 0) {
        for (const file of fileList) {
          if (file.originFileObj) {
            await expensesApi.uploadAttachment(savedExpense.id, file.originFileObj);
          }
        }
      }
      
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      message.success(id ? 'Masraf güncellendi' : 'Masraf oluşturuldu');
      navigate('/expenses');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'İşlem başarısız');
    }
  });

  // Load existing expense data
  useEffect(() => {
    if (expense) {
      form.setFieldsValue({
        expenseDate: dayjs(expense.expenseDate),
        categoryId: expense.categoryId,
        supplierId: expense.supplierId,
        amount: expense.amount,
        currency: expense.currency,
        taxAmount: expense.taxAmount,
        paymentMethod: expense.paymentMethod,
        description: expense.description,
        notes: expense.notes,
        invoiceNumber: expense.invoiceNumber
      });
      setSelectedCategory(expense.categoryId);
    }
  }, [expense, form]);

  // Handle category change
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    const category = categories?.find(c => c.id === categoryId);
    if (category?.defaultPaymentMethod) {
      form.setFieldValue('paymentMethod', category.defaultPaymentMethod);
    }
  };

  // Calculate total
  const calculateTotal = () => {
    const amount = form.getFieldValue('amount') || 0;
    const taxAmount = form.getFieldValue('taxAmount') || 0;
    return amount + taxAmount;
  };

  // Form submit
  const handleSubmit = async (values: any) => {
    const data: CreateExpenseRequest = {
      expenseDate: values.expenseDate.format('YYYY-MM-DD'),
      categoryId: values.categoryId,
      supplierId: values.supplierId,
      amount: values.amount,
      currency: values.currency,
      taxAmount: values.taxAmount || 0,
      paymentMethod: values.paymentMethod,
      description: values.description,
      notes: values.notes,
      invoiceNumber: values.invoiceNumber
    };

    await saveMutation.mutateAsync(data);
  };

  const selectedCategoryData = categories?.find(c => c.id === selectedCategory);
  const requiresApproval = selectedCategoryData?.requiresApproval || false;
  const maxAmount = selectedCategoryData?.maxAmountWithoutApproval;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/expenses')}
          className="mb-4"
        >
          Geri
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {id ? 'Masraf Düzenle' : 'Yeni Masraf'}
        </h1>
      </div>

      {requiresApproval && (
        <Alert
          message="Bu kategori onay gerektirir"
          description={maxAmount ? `${maxAmount} TRY üzerindeki masraflar onay gerektirir.` : 'Tüm masraflar onay gerektirir.'}
          type="info"
          showIcon
          className="mb-4"
        />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          expenseDate: dayjs(),
          currency: 'TRY',
          taxAmount: 0,
          paymentMethod: PaymentMethod.BankTransfer
        }}
      >
        {/* Basic Info */}
        <Card title="Genel Bilgiler" className="mb-4">
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="expenseDate"
                label="Masraf Tarihi"
                rules={[{ required: true, message: 'Tarih zorunludur' }]}
              >
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="categoryId"
                label="Kategori"
                rules={[{ required: true, message: 'Kategori seçimi zorunludur' }]}
              >
                <Select
                  showSearch
                  placeholder="Kategori seçin"
                  optionFilterProp="label"
                  onChange={handleCategoryChange}
                  options={categories?.map(c => ({
                    label: `${c.code} - ${c.name}`,
                    value: c.id
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="supplierId"
                label="Tedarikçi"
                help="Opsiyonel"
              >
                <Select
                  showSearch
                  placeholder="Tedarikçi seçin"
                  optionFilterProp="label"
                  allowClear
                  options={suppliers?.items?.map((s: any) => ({
                    label: `${s.code} - ${s.name}`,
                    value: s.id
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Açıklama"
            rules={[{ required: true, message: 'Açıklama zorunludur' }]}
          >
            <Input.TextArea rows={2} placeholder="Masraf açıklaması..." />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="invoiceNumber"
                label="Fatura/Fiş No"
              >
                <Input placeholder="Fatura numarası..." />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="notes"
                label="Notlar"
              >
                <Input.TextArea rows={2} placeholder="Ek notlar..." />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Financial Info */}
        <Card title="Mali Bilgiler" className="mb-4">
          <Row gutter={16}>
            <Col xs={24} sm={12} md={6}>
              <Form.Item
                name="amount"
                label="Tutar"
                rules={[{ required: true, message: 'Tutar zorunludur' }]}
              >
                <InputNumber
                  className="w-full"
                  min={0}
                  precision={2}
                  placeholder="0.00"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item
                name="currency"
                label="Para Birimi"
                rules={[{ required: true }]}
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
            <Col xs={24} sm={12} md={6}>
              <Form.Item
                name="taxAmount"
                label="KDV Tutarı"
              >
                <InputNumber
                  className="w-full"
                  min={0}
                  precision={2}
                  placeholder="0.00"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item
                name="paymentMethod"
                label="Ödeme Yöntemi"
                rules={[{ required: true, message: 'Ödeme yöntemi zorunludur' }]}
              >
                <Select
                  options={Object.entries(paymentMethodLabels).map(([value, label]) => ({
                    label,
                    value: Number(value)
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Alert
            message="Toplam Tutar"
            description={
              <div className="text-2xl font-bold text-green-600">
                {calculateTotal().toFixed(2)} {form.getFieldValue('currency') || 'TRY'}
              </div>
            }
            type="success"
          />
        </Card>

        {/* Attachments */}
        <Card title="Ekler" className="mb-4">
          <Form.Item
            label="Fatura/Fiş Görseli"
            help="Fatura, fiş veya makbuz görsellerini yükleyin"
          >
            <Upload
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              beforeUpload={() => false}
              accept="image/*,.pdf"
              listType="picture"
            >
              <Button icon={<UploadOutlined />}>Dosya Seç</Button>
            </Upload>
          </Form.Item>
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
            >
              {id ? 'Güncelle' : 'Kaydet'}
            </Button>
            <Button
              size="large"
              onClick={() => navigate('/expenses')}
            >
              İptal
            </Button>
          </Space>
        </Card>
      </Form>
    </div>
  );
}

