import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HomeOutlined, LoginOutlined } from '@ant-design/icons';

const ForbiddenPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Result
        status="403"
        title={t('errors.403')}
        subTitle={t('errors.403Message')}
        extra={[
          <Button 
            key="home"
            type="primary" 
            icon={<HomeOutlined />}
            onClick={() => navigate('/dashboard')}
            className="mr-2"
          >
            {t('errors.backToHome')}
          </Button>,
          <Button 
            key="login"
            icon={<LoginOutlined />}
            onClick={() => navigate('/login')}
          >
            {t('auth.login')}
          </Button>
        ]}
      />
    </div>
  );
};

export default ForbiddenPage;
