import React from 'react';
import { useTranslation } from 'react-i18next';
import { ProCard, ProForm, ProFormText, ProFormTextArea, ProFormUploadButton } from '@ant-design/pro-components';
import { useMessage } from '../../hooks/useMessage';

/**
 * Şirket ayarları sayfası
 */
export const CompanySettings: React.FC = () => {
  const { t } = useTranslation();
  const message = useMessage();

  const handleSubmit = async (values: any) => {
    try {
      console.log('Save company settings:', values);
      message.success(t('settings.saveSuccess'));
      return true;
    } catch (error) {
      message.error(t('settings.saveError'));
      return false;
    }
  };

  return (
    <ProCard title={t('settings.company.title')}>
      <ProForm
        onFinish={handleSubmit}
        submitter={{
          searchConfig: {
            submitText: t('common.save'),
            resetText: t('common.reset')
          }
        }}
      >
        <ProFormUploadButton
          name="logo"
          label={t('settings.company.logo')}
          max={1}
          fieldProps={{
            listType: 'picture-card'
          }}
          extra={t('settings.company.logoHint')}
        />

        <ProFormText
          name="companyName"
          label={t('settings.company.name')}
          width="lg"
          rules={[{ required: true }]}
          placeholder={t('settings.company.namePlaceholder')}
        />

        <ProFormText
          name="taxNumber"
          label={t('settings.company.taxNumber')}
          width="md"
          placeholder="1234567890"
        />

        <ProFormText
          name="taxOffice"
          label={t('settings.company.taxOffice')}
          width="md"
          placeholder={t('settings.company.taxOfficePlaceholder')}
        />

        <ProFormTextArea
          name="address"
          label={t('settings.company.address')}
          width="xl"
          fieldProps={{
            rows: 3
          }}
          placeholder={t('settings.company.addressPlaceholder')}
        />

        <ProFormText
          name="phone"
          label={t('settings.company.phone')}
          width="md"
          placeholder="+90 XXX XXX XX XX"
        />

        <ProFormText
          name="email"
          label={t('settings.company.email')}
          width="md"
          rules={[{ type: 'email' }]}
          placeholder="info@company.com"
        />

        <ProFormText
          name="website"
          label={t('settings.company.website')}
          width="md"
          placeholder="https://www.company.com"
        />
      </ProForm>
    </ProCard>
  );
};
