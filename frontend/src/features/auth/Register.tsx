import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { ProForm, ProFormText, ProFormCheckbox } from '@ant-design/pro-components';
import { Card, Space, Divider, Button } from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  MailOutlined,
  PhoneOutlined,
  GoogleOutlined, 
  FacebookOutlined,
  GithubOutlined 
} from '@ant-design/icons';
import { useAuth } from '@/hooks/useAuth';

/**
 * Kayıt sayfası - ProForm ile modern tasarım
 * Form validation ve social login entegre
 */
export const Register: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();

  // Zaten giriş yapmış kullanıcıları dashboard'a yönlendir
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  /**
   * Form submit handler
   */
  const handleSubmit = async (values: any) => {
    try {
      await register(values);
    } catch (error) {
      // Error handling useAuth hook'unda yapılıyor
    }
  };

  /**
   * Social login handler'ları
   */
  const handleSocialLogin = (provider: string) => {
    // Social login implementation
    console.log(`Social login with ${provider}`);
  };

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
            {t('auth.registerTitle')}
          </p>
        </div>

        {/* Register Form */}
        <ProForm
          onFinish={handleSubmit}
          submitter={{
            searchConfig: {
              submitText: t('auth.register'),
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
            name="name"
            label={t('auth.name')}
            placeholder={t('auth.namePlaceholder')}
            rules={[
              { required: true, message: t('auth.nameRequired') },
              { min: 2, message: t('auth.nameMinLength') }
            ]}
            fieldProps={{
              size: 'large',
              prefix: <UserOutlined style={{ color: '#bfbfbf' }} />
            }}
          />

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

          <ProFormText
            name="phone"
            label={t('auth.phone')}
            placeholder={t('auth.phonePlaceholder')}
            rules={[
              { required: true, message: t('auth.phoneRequired') },
              { 
                pattern: /^[0-9]{10}$/, 
                message: t('auth.invalidPhone') 
              }
            ]}
            fieldProps={{
              size: 'large',
              prefix: <PhoneOutlined style={{ color: '#bfbfbf' }} />
            }}
          />

          <ProFormText.Password
            name="password"
            label={t('auth.password')}
            placeholder={t('auth.passwordPlaceholder')}
            rules={[
              { required: true, message: t('auth.passwordRequired') },
              { min: 6, message: t('auth.passwordMinLength') }
            ]}
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined style={{ color: '#bfbfbf' }} />
            }}
          />

          <ProFormText.Password
            name="confirmPassword"
            label={t('auth.confirmPassword')}
            placeholder={t('auth.confirmPasswordPlaceholder')}
            rules={[
              { required: true, message: t('auth.confirmPasswordRequired') },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(t('auth.passwordMismatch')));
                },
              }),
            ]}
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined style={{ color: '#bfbfbf' }} />
            }}
          />

          <ProFormCheckbox
            name="acceptTerms"
            rules={[
              { 
                validator: (_, value) => 
                  value ? Promise.resolve() : Promise.reject(new Error(t('auth.agreementRequired')))
              }
            ]}
            fieldProps={{
              children: (
                <span>
                  {t('auth.iAccept')}{' '}
                  <a href="/terms" target="_blank" rel="noopener noreferrer">
                    {t('auth.termsOfService')}
                  </a>
                </span>
              )
            }}
          />
        </ProForm>

        {/* Social Login */}
        <div>
          <Divider>{t('auth.or')}</Divider>
          
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button
              type="default"
              size="large"
              icon={<GoogleOutlined />}
              onClick={() => handleSocialLogin('google')}
              style={{ width: '100%' }}
            >
              {t('auth.socialLogin')} Google
            </Button>
            
            <Button
              type="default"
              size="large"
              icon={<FacebookOutlined />}
              onClick={() => handleSocialLogin('facebook')}
              style={{ width: '100%' }}
            >
              {t('auth.socialLogin')} Facebook
            </Button>
            
            <Button
              type="default"
              size="large"
              icon={<GithubOutlined />}
              onClick={() => handleSocialLogin('github')}
              style={{ width: '100%' }}
            >
              {t('auth.socialLogin')} GitHub
            </Button>
          </Space>
        </div>

        {/* Login Link */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <span style={{ color: '#666' }}>
            {t('auth.hasAccount')}
          </span>
          <Link 
            to="/login" 
            style={{ 
              color: '#1890ff', 
              marginLeft: '8px',
              fontWeight: '500'
            }}
          >
            {t('auth.login')}
          </Link>
        </div>
      </Card>
    </div>
  );
};
