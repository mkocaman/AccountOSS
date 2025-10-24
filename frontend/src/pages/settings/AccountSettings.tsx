import React from 'react';
import { useTranslation } from 'react-i18next';
import { ProCard, ProForm, ProFormText, ProFormSelect } from '@ant-design/pro-components';
import { Divider } from 'antd';
import { useMessage } from '../../hooks/useMessage';
import { useAuth } from '../../hooks/useAuth';

/**
 * Hesap ayarları sayfası
 */
export const AccountSettings: React.FC = () => {
  const { t } = useTranslation();
  const message = useMessage();
  const { user } = useAuth();

  const handleSubmit = async (values: any) => {
    try {
      console.log('Save account settings:', values);
      message.success(t('settings.saveSuccess'));
      return true;
    } catch (error) {
      message.error(t('settings.saveError'));
      return false;
    }
  };

  return (
    <ProCard title={t('settings.account.title')}>
      <ProForm
        onFinish={handleSubmit}
        initialValues={user}
        submitter={{
          searchConfig: {
            submitText: t('common.save'),
            resetText: t('common.reset')
          }
        }}
      >
        <ProFormText
          name="name"
          label={t('settings.account.fullName')}
          width="lg"
          rules={[{ required: true }]}
          placeholder={t('settings.account.fullNamePlaceholder')}
        />

        <ProFormText
          name="email"
          label={t('settings.account.email')}
          width="lg"
          rules={[
            { required: true },
            { type: 'email' }
          ]}
          disabled
          tooltip={t('settings.account.emailTooltip')}
        />

        <ProFormText
          name="phone"
          label={t('settings.account.phone')}
          width="md"
          placeholder="+90 5XX XXX XX XX"
        />

        <Divider>{t('settings.account.preferences')}</Divider>

        <ProFormSelect
          name="dateFormat"
          label={t('settings.account.dateFormat')}
          width="md"
          valueEnum={{
            'DD/MM/YYYY': 'DD/MM/YYYY (Gün/Ay/Yıl)',
            'MM/DD/YYYY': 'MM/DD/YYYY (Ay/Gün/Yıl)',
            'YYYY-MM-DD': 'YYYY-MM-DD (Yıl-Ay-Gün)'
          }}
          initialValue="DD/MM/YYYY"
        />

        <ProFormSelect
          name="numberFormat"
          label={t('settings.account.numberFormat')}
          width="md"
          valueEnum={{
            'comma': '1.234,56 (Virgül - Türkiye)',
            'dot': '1,234.56 (Nokta - ABD/İngiltere)'
          }}
          initialValue="comma"
        />
      </ProForm>
    </ProCard>
  );
};
