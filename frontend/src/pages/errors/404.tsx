import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Result, Button } from 'antd';

/**
 * 404 - Sayfa Bulunamadı
 */
export const Error404: React.FC = () => {
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
        status="404"
        title="404"
        subTitle={t('errors.404.message')}
        extra={
          <Button type="primary" onClick={() => navigate('/dashboard')}>
            {t('errors.backToHome')}
          </Button>
        }
      />
    </div>
  );
};
