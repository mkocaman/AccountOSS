import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ReloadOutlined, HomeOutlined } from '@ant-design/icons';

const ServerErrorPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Result
        status="500"
        title={t('errors.500')}
        subTitle={t('errors.500Message')}
        extra={[
          <Button 
            key="reload"
            type="primary" 
            icon={<ReloadOutlined />}
            onClick={handleReload}
            className="mr-2"
          >
            {t('errors.reload')}
          </Button>,
          <Button 
            key="home"
            icon={<HomeOutlined />}
            onClick={() => navigate('/dashboard')}
          >
            {t('errors.backToHome')}
          </Button>
        ]}
      />
    </div>
  );
};

export default ServerErrorPage;
