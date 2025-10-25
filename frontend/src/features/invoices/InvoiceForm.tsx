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
      message.success(t('invoice.messages.createSuccess'));
      navigate('/invoices/list');
      return true;
    } catch (error) {
      message.error(t('invoice.errors.createFailed'));
      return false;
    }
  };

  return (
    <PageContainer
      header={{
        title: t('invoice.createTitle'),
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
        <Card title={t('invoice.labels.information')} style={{ marginBottom: 16 }}>
          <ProForm.Group>
            <ProFormText
              name="invoiceNumber"
              label={t('invoice.labels.invoiceNumber')}
              width="md"
              placeholder={t('invoice.placeholders.invoiceNumber')}
              rules={[
                { required: true, message: t('invoice.validation.invoiceNumberRequired') }
              ]}
            />

            <ProFormDatePicker
              name="invoiceDate"
              label={t('invoice.labels.invoiceDate')}
              width="md"
              rules={[
                { required: true, message: t('invoice.validation.invoiceDateRequired') }
              ]}
            />

            <ProFormSelect
              name="invoiceType"
              label={t('invoice.labels.invoiceType')}
              width="md"
              valueEnum={{
                SALES: t('invoice.type.sales'),
                PURCHASE: t('invoice.type.purchase')
              }}
              rules={[
                { required: true, message: t('invoice.validation.invoiceTypeRequired') }
              ]}
            />
          </ProForm.Group>

          <ProForm.Group>
            <ProFormSelect
              name="partnerId"
              label={t('invoice.labels.customer')}
              width="xl"
              showSearch
              request={async () => {
                // Cari hesapları API'den çek
                return [
                  { label: t('invoice.placeholders.selectCustomer') + ' 1', value: '1' },
                  { label: t('invoice.placeholders.selectCustomer') + ' 2', value: '2' }
                ];
              }}
              rules={[
                { required: true, message: t('invoice.validation.customerRequired') }
              ]}
            />

            <ProFormSwitch
              name="isOfficial"
              label={t('invoice.labels.invoiceType')}
              checkedChildren={t('invoice.labels.official')}
              unCheckedChildren={t('invoice.labels.unofficial')}
            />
          </ProForm.Group>

          <ProFormText
            name="description"
            label={t('invoice.labels.notes')}
            placeholder={t('invoice.placeholders.enterNotes')}
          />
        </Card>

        {/* Fatura Kalemleri - ProFormList ile dinamik liste */}
        <Card title={t('invoice.labels.items')}>
          <ProFormList
            name="items"
            creatorButtonProps={{
              creatorButtonText: t('invoice.buttons.addItem'),
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
                    throw new Error(t('invoice.validation.itemsRequired'));
                  }
                }
              }
            ]}
          >
            <ProForm.Group>
              <ProFormSelect
                name="productId"
                label={t('invoice.labels.product')}
                width="lg"
                showSearch
                request={async () => {
                  // Ürünleri API'den çek
                  return [
                    { label: t('invoice.labels.product') + ' 1', value: '1' },
                    { label: t('invoice.labels.product') + ' 2', value: '2' }
                  ];
                }}
                rules={[
                  { required: true, message: t('invoice.validation.productRequired') }
                ]}
              />

              <ProFormDigit
                name="quantity"
                label={t('invoice.labels.quantity')}
                width="sm"
                min={0.01}
                fieldProps={{
                  precision: 2
                }}
                rules={[
                  { required: true, message: t('invoice.validation.quantityRequired') }
                ]}
              />

              <ProFormDigit
                name="unitPrice"
                label={t('invoice.labels.unitPrice')}
                width="md"
                min={0}
                fieldProps={{
                  precision: 2,
                  prefix: '₺'
                }}
                rules={[
                  { required: true, message: t('invoice.validation.priceRequired') }
                ]}
              />

              <ProFormDigit
                name="taxRate"
                label={t('invoice.labels.taxRate')}
                width="sm"
                min={0}
                max={100}
                fieldProps={{
                  precision: 2,
                  suffix: '%'
                }}
                initialValue={20}
                rules={[
                  { required: true, message: t('invoice.validation.taxRateRequired') }
                ]}
              />

              <ProFormDigit
                name="discount"
                label={t('invoice.labels.discount')}
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
        <Card title={t('invoice.labels.summary')} style={{ marginTop: 16 }}>
          <ProForm.Group>
            <ProFormDigit
              name="subtotal"
              label={t('invoice.labels.subtotal')}
              width="md"
              readonly
              fieldProps={{
                precision: 2,
                prefix: '₺'
              }}
            />

            <ProFormDigit
              name="totalTax"
              label={t('invoice.labels.totalTax')}
              width="md"
              readonly
              fieldProps={{
                precision: 2,
                prefix: '₺'
              }}
            />

            <ProFormDigit
              name="totalAmount"
              label={t('invoice.labels.grandTotal')}
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