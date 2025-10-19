import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { PageContainer, ProForm, ProFormText, ProFormTextArea, ProFormSelect, ProFormDigit, ProFormSwitch } from '@ant-design/pro-components';
import { Card, message } from 'antd';
import { useCreateProduct, useUpdateProduct } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import type { Product, ProductCategory } from '@/types/product';

/**
 * Ürün oluşturma/düzenleme formu - ProForm ile
 */
export const ProductForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  // Hooks
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const { data: categories } = useCategories();

  /**
   * Form submit handler
   */
  const handleSubmit = async (values: any) => {
    try {
      if (isEdit) {
        await updateProduct.mutateAsync({ id: id!, ...values });
      } else {
        await createProduct.mutateAsync(values);
      }
      navigate('/products/list');
    } catch (error) {
      // Error handling hooks'ta yapılıyor
    }
  };

  return (
    <PageContainer
      header={{
        title: isEdit ? t('products.editProduct') : t('products.createProduct'),
        onBack: () => navigate('/products/list')
      }}
    >
      <Card>
        <ProForm
          onFinish={handleSubmit}
          submitter={{
            searchConfig: {
              submitText: t('common.save'),
              resetText: t('common.cancel')
            }
          }}
        >
          <ProForm.Group>
            <ProFormText
              name="code"
              label={t('products.form.code')}
              placeholder={t('products.form.codePlaceholder')}
              rules={[
                { required: true, message: t('products.form.codeRequired') }
              ]}
              width="md"
            />

            <ProFormText
              name="name"
              label={t('products.form.name')}
              placeholder={t('products.form.namePlaceholder')}
              rules={[
                { required: true, message: t('products.form.nameRequired') }
              ]}
              width="md"
            />
          </ProForm.Group>

          <ProFormTextArea
            name="description"
            label={t('products.form.description')}
            placeholder={t('products.form.descriptionPlaceholder')}
            width="xl"
          />

          <ProForm.Group>
            <ProFormText
              name="barcode"
              label={t('products.form.barcode')}
              placeholder={t('products.form.barcodePlaceholder')}
              width="md"
            />

            <ProFormSelect
              name="unit"
              label={t('products.form.unit')}
              placeholder={t('products.form.unitPlaceholder')}
              rules={[
                { required: true, message: t('products.form.unitRequired') }
              ]}
              options={[
                { label: t('products.units.piece'), value: 'Adet' },
                { label: t('products.units.kg'), value: 'Kg' },
                { label: t('products.units.liter'), value: 'Litre' },
                { label: t('products.units.meter'), value: 'Metre' },
                { label: t('products.units.box'), value: 'Kutu' }
              ]}
              width="md"
            />
          </ProForm.Group>

          <ProForm.Group>
            <ProFormDigit
              name="purchasePrice"
              label={t('products.form.purchasePrice')}
              placeholder={t('products.form.purchasePricePlaceholder')}
              rules={[
                { required: true, message: t('products.form.purchasePriceRequired') }
              ]}
              fieldProps={{
                precision: 2,
                prefix: '₺'
              }}
              width="md"
            />

            <ProFormDigit
              name="salePrice"
              label={t('products.form.salePrice')}
              placeholder={t('products.form.salePricePlaceholder')}
              rules={[
                { required: true, message: t('products.form.salePriceRequired') }
              ]}
              fieldProps={{
                precision: 2,
                prefix: '₺'
              }}
              width="md"
            />
          </ProForm.Group>

          <ProForm.Group>
            <ProFormDigit
              name="taxRate"
              label={t('products.form.taxRate')}
              placeholder={t('products.form.taxRatePlaceholder')}
              rules={[
                { required: true, message: t('products.form.taxRateRequired') }
              ]}
              fieldProps={{
                precision: 2,
                suffix: '%',
                min: 0,
                max: 100
              }}
              initialValue={20}
              width="md"
            />

            <ProFormSelect
              name="categoryId"
              label={t('products.form.category')}
              placeholder={t('products.form.categoryPlaceholder')}
              options={categories?.items?.map((cat: ProductCategory) => ({
                label: cat.name,
                value: cat.id
              })) || []}
              width="md"
            />
          </ProForm.Group>

          <ProForm.Group>
            <ProFormDigit
              name="minStockLevel"
              label={t('products.form.minStockLevel')}
              placeholder={t('products.form.minStockLevelPlaceholder')}
              rules={[
                { required: true, message: t('products.form.minStockLevelRequired') }
              ]}
              fieldProps={{
                precision: 2,
                min: 0
              }}
              width="md"
            />

            <ProFormDigit
              name="maxStockLevel"
              label={t('products.form.maxStockLevel')}
              placeholder={t('products.form.maxStockLevelPlaceholder')}
              fieldProps={{
                precision: 2,
                min: 0
              }}
              width="md"
            />
          </ProForm.Group>

          <ProFormSwitch
            name="isActive"
            label={t('products.form.isActive')}
            checkedChildren={t('common.active')}
            unCheckedChildren={t('common.inactive')}
            initialValue={true}
          />
        </ProForm>
      </Card>
    </PageContainer>
  );
};

export default ProductForm;