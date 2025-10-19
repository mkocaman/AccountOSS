import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Modal,
  Form,
  Input,
  Select,
  Switch,
  message
} from 'antd';

const { TextArea } = Input;
const { Option } = Select;

interface Category {
  id: string;
  name: string;
  description?: string;
  parentCategoryId?: string;
  isActive: boolean;
}

interface CategoryFormModalProps {
  open: boolean;
  category: Category | null;
  onClose: (refresh?: boolean) => void;
}

/**
 * Kategori ekleme/düzenleme form modalı
 */
export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  open,
  category,
  onClose
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  /**
   * Modal açıldığında formu doldur
   */
  useEffect(() => {
    if (open && category) {
      form.setFieldsValue(category);
    } else if (open) {
      form.resetFields();
      form.setFieldsValue({
        isActive: true
      });
    }
  }, [open, category, form]);

  /**
   * Form submit işlemi
   */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // API çağrısı burada yapılacak (categoriesApi.create veya update)
      console.log('Form values:', values);
      
      message.success(category ? t('categories.updateSuccess') : t('categories.createSuccess'));
      onClose(true);
    } catch (error: any) {
      if (error?.errorFields) {
        // Form validasyon hatası
        return;
      }
      message.error(t('categories.saveError'));
    }
  };

  /**
   * Modal'ı kapat
   */
  const handleCancel = () => {
    form.resetFields();
    onClose(false);
  };

  return (
    <Modal
      title={category ? t('categories.editCategory') : t('categories.addCategory')}
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      width={600}
      okText={t('common.save')}
      cancelText={t('common.cancel')}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          isActive: true
        }}
      >
        {/* Kategori Adı */}
        <Form.Item
          name="name"
          label={t('categories.columns.name')}
          rules={[
            { required: true, message: t('validation.required') },
            { max: 100, message: t('validation.maxLength', { max: 100 }) }
          ]}
        >
          <Input placeholder={t('categories.columns.name')} />
        </Form.Item>

        {/* Açıklama */}
        <Form.Item
          name="description"
          label={t('categories.columns.description')}
          rules={[
            { max: 500, message: t('validation.maxLength', { max: 500 }) }
          ]}
        >
          <TextArea
            rows={3}
            placeholder={t('categories.columns.description')}
          />
        </Form.Item>

        {/* Üst Kategori */}
        <Form.Item
          name="parentCategoryId"
          label={t('categories.columns.parentCategory')}
        >
          <Select
            placeholder={t('categories.columns.parentCategory')}
            allowClear
          >
            {/* Kategoriler buraya dinamik olarak yüklenecek */}
            <Option value="cat1">Elektronik</Option>
            <Option value="cat2">Gıda</Option>
            <Option value="cat3">Giyim</Option>
          </Select>
        </Form.Item>

        {/* Aktif/Pasif */}
        <Form.Item
          name="isActive"
          label={t('categories.columns.status')}
          valuePropName="checked"
        >
          <Switch
            checkedChildren={t('common.active')}
            unCheckedChildren={t('common.inactive')}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

