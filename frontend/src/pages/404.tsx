import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HomeOutlined } from '@ant-design/icons';

const NotFoundPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Result
        status="404"
        title={t('errors.404')}
        subTitle={t('errors.404Message')}
        extra={
          <Button 
            type="primary" 
            icon={<HomeOutlined />}
            onClick={() => navigate('/dashboard')}
          >
            {t('errors.backToHome')}
          </Button>
        }
      />
    </div>
  );
};

export default NotFoundPage;
