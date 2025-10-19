import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ModalForm, ProFormText, ProFormTextArea, ProFormSelect, ProFormDigit, ProFormSwitch } from '@ant-design/pro-components';
import { message } from 'antd';
import { useCreateProduct, useUpdateProduct } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import type { Product } from '@/types/product';

interface ProductFormModalProps {
  open: boolean;
  product: Product | null;
  onClose: (refresh?: boolean) => void;
}

/**
 * Ürün ekleme/düzenleme modal formu - ModalForm ile
 * ModalForm otomatik modal yönetimi ve form handling sağlar
 */
export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  open,
  product,
  onClose
}) => {
  const { t } = useTranslation();

  // Kategori listesi
  const { data: categories } = useCategories({ pageSize: 1000 });

  // Create/Update mutations
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  /**
   * Form submit işlemi
   */
  const handleSubmit = async (values: any) => {
    try {
      if (product) {
        // Güncelleme
        await updateProduct.mutateAsync({ id: product.id, ...values });
        message.success(t('products.updateSuccess'));
      } else {
        // Yeni ekleme
        await createProduct.mutateAsync(values);
        message.success(t('products.createSuccess'));
      }

      onClose(true);
      return true;
    } catch (error) {
      message.error(t('products.saveError'));
      return false;
    }
  };

  return (
    <ModalForm
      title={product ? t('products.editProduct') : t('products.addProduct')}
      open={open}
      onOpenChange={(visible) => {
        if (!visible) {
          onClose(false);
        }
      }}
      onFinish={handleSubmit}
      modalProps={{
        destroyOnClose: true,
        width: 800
      }}
      initialValues={
        product || {
          stockTrackingEnabled: true,
          isActive: true,
          taxRate: 20
        }
      }
      submitter={{
        searchConfig: {
          submitText: t('common.save'),
          resetText: t('common.cancel')
        }
      }}
    >
      {/* Ürün Kodu ve Barkod */}
      <ProFormText
        name="code"
        label={t('products.form.code')}
        placeholder={t('products.form.codePlaceholder')}
        width="md"
        rules={[
          { required: true, message: t('products.form.codeRequired') },
          { max: 50, message: t('products.form.codeTooLong') }
        ]}
      />

      <ProFormText
        name="barcode"
        label={t('products.form.barcode')}
        placeholder={t('products.form.barcodePlaceholder')}
        width="md"
        rules={[{ max: 50, message: t('products.form.barcodeTooLong') }]}
      />

      {/* Ürün Adı */}
      <ProFormText
        name="name"
        label={t('products.form.name')}
        placeholder={t('products.form.namePlaceholder')}
        rules={[
          { required: true, message: t('products.form.nameRequired') },
          { max: 200, message: t('products.form.nameTooLong') }
        ]}
      />

      {/* Açıklama */}
      <ProFormTextArea
        name="description"
        label={t('products.form.description')}
        placeholder={t('products.form.descriptionPlaceholder')}
        fieldProps={{
          rows: 3
        }}
        rules={[{ max: 1000, message: t('products.form.descriptionTooLong') }]}
      />

      {/* Kategori ve Birim */}
      <ProFormSelect
        name="categoryId"
        label={t('products.form.category')}
        width="md"
        placeholder={t('products.form.categoryPlaceholder')}
        options={categories?.items?.map((cat) => ({
          label: cat.name,
          value: cat.id
        }))}
        showSearch
      />

      <ProFormSelect
        name="unit"
        label={t('products.form.unit')}
        width="md"
        placeholder={t('products.form.unitPlaceholder')}
        rules={[{ required: true, message: t('products.form.unitRequired') }]}
        valueEnum={{
          Adet: t('products.units.piece'),
          Kg: t('products.units.kg'),
          Lt: t('products.units.liter'),
          M: t('products.units.meter'),
          'M²': t('products.units.squareMeter'),
          'M³': t('products.units.cubicMeter'),
          Kutu: t('products.units.box'),
          Paket: t('products.units.package')
        }}
      />

      {/* Fiyatlar */}
      <ProFormDigit
        name="purchasePrice"
        label={t('products.form.purchasePrice')}
        width="md"
        min={0}
        fieldProps={{
          precision: 2,
          prefix: '₺'
        }}
        rules={[
          { required: true, message: t('products.form.purchasePriceRequired') }
        ]}
      />

      <ProFormDigit
        name="salePrice"
        label={t('products.form.salePrice')}
        width="md"
        min={0}
        fieldProps={{
          precision: 2,
          prefix: '₺'
        }}
        rules={[
          { required: true, message: t('products.form.salePriceRequired') }
        ]}
      />

      <ProFormDigit
        name="taxRate"
        label={t('products.form.taxRate')}
        width="sm"
        min={0}
        max={100}
        fieldProps={{
          precision: 2,
          suffix: '%'
        }}
        rules={[{ required: true, message: t('products.form.taxRateRequired') }]}
      />

      {/* Stok Takibi */}
      <ProFormSwitch
        name="stockTrackingEnabled"
        label={t('products.form.stockTracking')}
      />

      {/* Stok Seviyeleri - Sadece stok takibi açıksa göster */}
      <ProFormDigit
        name="minStockLevel"
        label={t('products.form.minStock')}
        width="md"
        min={0}
        fieldProps={{
          precision: 2
        }}
        dependencies={['stockTrackingEnabled']}
        hidden={(form) => !form?.getFieldValue('stockTrackingEnabled')}
      />

      <ProFormDigit
        name="maxStockLevel"
        label={t('products.form.maxStock')}
        width="md"
        min={0}
        fieldProps={{
          precision: 2
        }}
        dependencies={['stockTrackingEnabled']}
        hidden={(form) => !form?.getFieldValue('stockTrackingEnabled')}
      />

      {/* Aktif/Pasif */}
      <ProFormSwitch
        name="isActive"
        label={t('products.form.status')}
        checkedChildren={t('common.active')}
        unCheckedChildren={t('common.inactive')}
      />
    </ModalForm>
  );
};