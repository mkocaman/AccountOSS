import React from 'react';
import { Modal, Form, Input, Select, InputNumber, Switch, message } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { expenseCategoriesApi } from '@/api/expenses';
import type { ExpenseCategory, CreateExpenseCategoryRequest } from '@/types/expense';
import { PaymentMethod, paymentMethodLabels } from '@/types/expense';

interface Props {
  open: boolean;
  category: ExpenseCategory | null;
  onClose: () => void;
}

export default function ExpenseCategoryModal({ open, category, onClose }: Props) {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // Fetch all categories for parent selection
  const { data: categories } = useQuery({
    queryKey: ['expenseCategoriesAll'],
    queryFn: () => expenseCategoriesApi.getAllNoPaging()
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: (data: CreateExpenseCategoryRequest) => {
      if (category) {
        return expenseCategoriesApi.update(category.id, data);
      }
      return expenseCategoriesApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenseCategories'] });
      queryClient.invalidateQueries({ queryKey: ['expenseCategoriesAll'] });
      message.success(category ? 'Kategori güncellendi' : 'Kategori oluşturuldu');
      handleClose();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'İşlem başarısız');
    }
  });

  // Set initial values
  React.useEffect(() => {
    if (open) {
      if (category) {
        form.setFieldsValue({
          code: category.code,
          name: category.name,
          description: category.description,
          parentId: category.parentId,
          requiresApproval: category.requiresApproval,
          maxAmountWithoutApproval: category.maxAmountWithoutApproval,
          defaultPaymentMethod: category.defaultPaymentMethod,
          isActive: category.isActive
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          requiresApproval: false,
          isActive: true
        });
      }
    }
  }, [open, category, form]);

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleSubmit = async (values: any) => {
    await saveMutation.mutateAsync(values);
  };

  // Filter out current category and its children from parent options
  const getParentOptions = () => {
    if (!categories) return [];
    
    if (category) {
      // Exclude self and children
      return categories
        .filter(c => c.id !== category.id && !c.fullPath.startsWith(category.fullPath))
        .map(c => ({
          label: `${c.code} - ${c.name}`,
          value: c.id
        }));
    }
    
    return categories.map(c => ({
      label: `${c.code} - ${c.name}`,
      value: c.id
    }));
  };

  return (
    <Modal
      title={category ? 'Kategori Düzenle' : 'Yeni Kategori'}
      open={open}
      onCancel={handleClose}
      onOk={() => form.submit()}
      confirmLoading={saveMutation.isPending}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="code"
          label="Kategori Kodu"
          rules={[{ required: true, message: 'Kod zorunludur' }]}
        >
          <Input placeholder="EXP-001" />
        </Form.Item>

        <Form.Item
          name="name"
          label="Kategori Adı"
          rules={[{ required: true, message: 'Ad zorunludur' }]}
        >
          <Input placeholder="Örn: Pazarlama Giderleri" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Açıklama"
        >
          <Input.TextArea rows={2} placeholder="Kategori açıklaması..." />
        </Form.Item>

        <Form.Item
          name="parentId"
          label="Üst Kategori"
          help="Boş bırakılırsa ana kategori olur"
        >
          <Select
            placeholder="Ana kategori"
            allowClear
            showSearch
            optionFilterProp="label"
            options={getParentOptions()}
          />
        </Form.Item>

        <Form.Item
          name="requiresApproval"
          label="Onay Gereksinimi"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) => 
            prevValues.requiresApproval !== currentValues.requiresApproval
          }
        >
          {({ getFieldValue }) =>
            getFieldValue('requiresApproval') ? (
              <Form.Item
                name="maxAmountWithoutApproval"
                label="Onaysız Maksimum Tutar"
                help="Bu tutarın altındaki masraflar onaysız işlenebilir"
              >
                <InputNumber
                  className="w-full"
                  min={0}
                  precision={2}
                  placeholder="0.00"
                  addonAfter="TRY"
                />
              </Form.Item>
            ) : null
          }
        </Form.Item>

        <Form.Item
          name="defaultPaymentMethod"
          label="Varsayılan Ödeme Yöntemi"
        >
          <Select
            placeholder="Seçiniz"
            allowClear
            options={Object.entries(paymentMethodLabels).map(([value, label]) => ({
              label,
              value: Number(value)
            }))}
          />
        </Form.Item>

        <Form.Item
          name="isActive"
          label="Durum"
          valuePropName="checked"
        >
          <Switch checkedChildren="Aktif" unCheckedChildren="Pasif" />
        </Form.Item>
      </Form>
    </Modal>
  );
}

