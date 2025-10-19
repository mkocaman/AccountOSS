import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { ProForm, ProFormText } from '@ant-design/pro-components';
import { Card, Result, Button } from 'antd';
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useAuth } from '@/hooks/useAuth';

/**
 * Şifre sıfırlama sayfası - E-posta gönderimi
 */
export const ForgotPassword: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();
  const [emailSent, setEmailSent] = useState(false);

  /**
   * Form submit handler
   */
  const handleSubmit = async (values: { email: string }) => {
    try {
      await forgotPassword(values.email);
      setEmailSent(true);
    } catch (error) {
      // Error handling useAuth hook'unda yapılıyor
    }
  };

  // E-posta gönderildi durumu
  if (emailSent) {
    return (
      <div 
        style={{ 
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}
      >
        <Card
          style={{ 
            width: '100%',
            maxWidth: 500,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            borderRadius: '12px'
          }}
        >
          <Result
            status="success"
            title={t('auth.emailSentTitle')}
            subTitle={t('auth.emailSentMessage')}
            extra={[
              <Button 
                type="primary" 
                key="back"
                onClick={() => navigate('/login')}
              >
                {t('auth.backToLogin')}
              </Button>,
              <Button 
                key="resend"
                onClick={() => setEmailSent(false)}
              >
                {t('auth.resendEmail')}
              </Button>
            ]}
          />
        </Card>
      </div>
    );
  }

  return (
    <div 
      style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <Card
        style={{ 
          width: '100%',
          maxWidth: 400,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          borderRadius: '12px'
        }}
      >
        {/* Logo ve Başlık */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: 'bold', 
            color: '#1890ff',
            margin: 0 
          }}>
            AccountOS
          </h1>
          <p style={{ 
            color: '#666', 
            margin: '8px 0 0 0',
            fontSize: '16px'
          }}>
            {t('auth.forgotPasswordTitle')}
          </p>
        </div>

        {/* Forgot Password Form */}
        <ProForm
          onFinish={handleSubmit}
          submitter={{
            searchConfig: {
              submitText: t('auth.sendResetLink'),
              resetText: t('auth.cancel')
            },
            render: (_, dom) => (
              <div style={{ width: '100%' }}>
                {dom}
              </div>
            )
          }}
        >
          <ProFormText
            name="email"
            label={t('auth.email')}
            placeholder={t('auth.emailPlaceholder')}
            rules={[
              { required: true, message: t('auth.emailRequired') },
              { type: 'email', message: t('auth.invalidEmail') }
            ]}
            fieldProps={{
              size: 'large',
              prefix: <MailOutlined style={{ color: '#bfbfbf' }} />
            }}
          />
        </ProForm>

        {/* Back to Login */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Link 
            to="/login" 
            style={{ 
              color: '#1890ff',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <ArrowLeftOutlined />
            {t('auth.backToLogin')}
          </Link>
        </div>
      </Card>
    </div>
  );
};
