import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Result, Button } from 'antd';

/**
 * 403 - Yetkisiz Erişim sayfası
 */
export const Error403: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Result
        status="403"
        title="403"
        subTitle={t('errors.403.message')}
        extra={
          <Button type="primary" onClick={() => navigate('/dashboard')}>
            {t('errors.backToHome')}
          </Button>
        }
      />
    </div>
  );
};
