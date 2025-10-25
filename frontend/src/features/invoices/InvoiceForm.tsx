import React from 'react';
import { useTranslation } from 'react-i18next';
import { PageContainer, ProForm, ProFormText, ProFormSelect, ProFormDatePicker, ProFormDigit, ProFormSwitch, ProFormList } from '@ant-design/pro-components';
import { Card, Space, App } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

/**
 * Fatura oluşturma/düzenleme formu - ProForm ile
 * ProForm otomatik validasyon, loading state ve submit yönetir
 */
export const InvoiceForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { message } = App.useApp();

  /**
   * Form submit handler
   */
  const handleSubmit = async (values: any) => {
    try {
      console.log('Form values:', values);
      // API call buraya
      message.success(t('invoices.createSuccess'));
      navigate('/invoices/list');
      return true;
    } catch (error) {
      message.error(t('invoices.createError'));
      return false;
    }
  };

  return (
    <PageContainer
      header={{
        title: t('invoices.createInvoice'),
        onBack: () => navigate('/invoices/list')
      }}
    >
      <ProForm
        onFinish={handleSubmit}
        submitter={{
          searchConfig: {
            submitText: t('common.save'),
            resetText: t('common.cancel')
          },
          render: (_, dom) => (
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              {dom}
            </Space>
          )
        }}
      >
        <Card title={t('invoices.form.basicInfo')} style={{ marginBottom: 16 }}>
          <ProForm.Group>
            <ProFormText
              name="invoiceNumber"
              label={t('invoices.form.invoiceNumber')}
              width="md"
              placeholder={t('invoices.form.invoiceNumberPlaceholder')}
              rules={[
                { required: true, message: t('invoices.form.invoiceNumberRequired') }
              ]}
            />

            <ProFormDatePicker
              name="invoiceDate"
              label={t('invoices.form.invoiceDate')}
              width="md"
              rules={[
                { required: true, message: t('invoices.form.invoiceDateRequired') }
              ]}
            />

            <ProFormSelect
              name="invoiceType"
              label={t('invoices.form.invoiceType')}
              width="md"
              valueEnum={{
                SALES: t('invoices.types.sales'),
                PURCHASE: t('invoices.types.purchase')
              }}
              rules={[
                { required: true, message: t('invoices.form.invoiceTypeRequired') }
              ]}
            />
          </ProForm.Group>

          <ProForm.Group>
            <ProFormSelect
              name="partnerId"
              label={t('invoices.form.partner')}
              width="xl"
              showSearch
              request={async () => {
                // Cari hesapları API'den çek
                return [
                  { label: 'Müşteri 1', value: '1' },
                  { label: 'Müşteri 2', value: '2' }
                ];
              }}
              rules={[
                { required: true, message: t('invoices.form.partnerRequired') }
              ]}
            />

            <ProFormSwitch
              name="isOfficial"
              label={t('invoices.form.isOfficial')}
              checkedChildren={t('invoices.official')}
              unCheckedChildren={t('invoices.unofficial')}
            />
          </ProForm.Group>

          <ProFormText
            name="description"
            label={t('invoices.form.description')}
            placeholder={t('invoices.form.descriptionPlaceholder')}
          />
        </Card>

        {/* Fatura Kalemleri - ProFormList ile dinamik liste */}
        <Card title={t('invoices.form.items')}>
          <ProFormList
            name="items"
            creatorButtonProps={{
              creatorButtonText: t('invoices.form.addItem'),
              icon: <PlusOutlined />
            }}
            deleteIconProps={{
              Icon: DeleteOutlined,
              tooltipText: t('common.delete')
            }}
            copyIconProps={false}
            min={1}
            rules={[
              {
                validator: async (_, value) => {
                  if (!value || value.length === 0) {
                    throw new Error(t('invoices.form.itemsRequired'));
                  }
                }
              }
            ]}
          >
            <ProForm.Group>
              <ProFormSelect
                name="productId"
                label={t('invoices.form.product')}
                width="lg"
                showSearch
                request={async () => {
                  // Ürünleri API'den çek
                  return [
                    { label: 'Ürün 1', value: '1' },
                    { label: 'Ürün 2', value: '2' }
                  ];
                }}
                rules={[
                  { required: true, message: t('invoices.form.productRequired') }
                ]}
              />

              <ProFormDigit
                name="quantity"
                label={t('invoices.form.quantity')}
                width="sm"
                min={0.01}
                fieldProps={{
                  precision: 2
                }}
                rules={[
                  { required: true, message: t('invoices.form.quantityRequired') }
                ]}
              />

              <ProFormDigit
                name="unitPrice"
                label={t('invoices.form.unitPrice')}
                width="md"
                min={0}
                fieldProps={{
                  precision: 2,
                  prefix: '₺'
                }}
                rules={[
                  { required: true, message: t('invoices.form.unitPriceRequired') }
                ]}
              />

              <ProFormDigit
                name="taxRate"
                label={t('invoices.form.taxRate')}
                width="sm"
                min={0}
                max={100}
                fieldProps={{
                  precision: 2,
                  suffix: '%'
                }}
                initialValue={20}
                rules={[
                  { required: true, message: t('invoices.form.taxRateRequired') }
                ]}
              />

              <ProFormDigit
                name="discount"
                label={t('invoices.form.discount')}
                width="sm"
                min={0}
                max={100}
                fieldProps={{
                  precision: 2,
                  suffix: '%'
                }}
                initialValue={0}
              />
            </ProForm.Group>
          </ProFormList>
        </Card>

        {/* Fatura Toplamları */}
        <Card title={t('invoices.form.totals')} style={{ marginTop: 16 }}>
          <ProForm.Group>
            <ProFormDigit
              name="subtotal"
              label={t('invoices.form.subtotal')}
              width="md"
              readonly
              fieldProps={{
                precision: 2,
                prefix: '₺'
              }}
            />

            <ProFormDigit
              name="totalTax"
              label={t('invoices.form.totalTax')}
              width="md"
              readonly
              fieldProps={{
                precision: 2,
                prefix: '₺'
              }}
            />

            <ProFormDigit
              name="totalAmount"
              label={t('invoices.form.totalAmount')}
              width="md"
              readonly
              fieldProps={{
                precision: 2,
                prefix: '₺',
                style: { fontWeight: 'bold', fontSize: '16px' }
              }}
            />
          </ProForm.Group>
        </Card>
      </ProForm>
    </PageContainer>
  );
};