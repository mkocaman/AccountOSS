import React from 'react';
import { Modal, Form, Input, TreeSelect, Switch, message, ColorPicker } from 'antd';
import type { Color } from 'antd/es/color-picker';
import { useMutation, useQuery } from '@tanstack/react-query';

import { categoriesApi } from '@/api/categories';
import type { ProductCategory, CreateCategoryRequest } from '@/types/category';

interface Props {
  open: boolean;
  category?: ProductCategory;
  parentCategory?: ProductCategory;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function CategoryForm({ 
  open, 
  category, 
  parentCategory,
  onCancel, 
  onSuccess 
}: Props) {
  const [form] = Form.useForm();

  // Fetch categories for parent selection
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getTree(),
    enabled: open
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: (data: CreateCategoryRequest) => {
      if (category) {
        return categoriesApi.update(category.id, data);
      }
      return categoriesApi.create(data);
    },
    onSuccess: () => {
      form.resetFields();
      onSuccess();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'İşlem başarısız');
    }
  });

  // Convert categories to tree select data
  const convertToTreeSelectData = (cats: ProductCategory[]): any[] => {
    if (!cats) return [];

    return cats
      .filter(cat => cat.id !== category?.id) // Exclude self
      .map(cat => ({
        title: cat.name,
        value: cat.id,
        children: cat.children ? convertToTreeSelectData(cat.children) : undefined
      }));
  };

  // Set initial values
  React.useEffect(() => {
    if (category) {
      form.setFieldsValue({
        name: category.name,
        code: category.code,
        description: category.description,
        parentId: category.parentId,
        color: category.color,
        displayOrder: category.displayOrder,
        isActive: category.isActive
      });
    } else if (parentCategory) {
      form.setFieldsValue({
        parentId: parentCategory.id,
        isActive: true
      });
    } else {
      form.resetFields();
    }
  }, [category, parentCategory, form, open]);

  const handleSubmit = async (values: any) => {
    await saveMutation.mutateAsync(values);
  };

  return (
    <Modal
      title={category ? 'Kategori Düzenle' : 'Yeni Kategori'}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={saveMutation.isPending}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          isActive: true,
          displayOrder: 0
        }}
      >
        <Form.Item
          name="name"
          label="Kategori Adı"
          rules={[{ required: true, message: 'Kategori adı zorunludur' }]}
        >
          <Input placeholder="Örn: Elektronik" />
        </Form.Item>

        <Form.Item
          name="code"
          label="Kategori Kodu"
          help="Boş bırakılırsa otomatik oluşturulur"
        >
          <Input placeholder="CAT-0001" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Açıklama"
        >
          <Input.TextArea rows={3} placeholder="Kategori açıklaması..." />
        </Form.Item>

        <Form.Item
          name="parentId"
          label="Üst Kategori"
          help="Boş bırakılırsa ana kategori olarak eklenir"
        >
          <TreeSelect
            placeholder="Üst kategori seçin (opsiyonel)"
            allowClear
            treeData={convertToTreeSelectData(categories || [])}
            showSearch
            treeNodeFilterProp="title"
          />
        </Form.Item>

        <Form.Item
          name="color"
          label="Renk (Opsiyonel)"
        >
          <ColorPicker
            showText
            format="hex"
            onChange={(value: Color) => {
              form.setFieldValue('color', value.toHexString());
            }}
          />
        </Form.Item>

        <Form.Item
          name="displayOrder"
          label="Sıra Numarası"
          help="Kategorilerin gösterim sırası"
        >
          <Input type="number" min={0} placeholder="0" />
        </Form.Item>

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
