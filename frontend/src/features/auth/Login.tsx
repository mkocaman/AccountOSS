import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { ProForm, ProFormText, ProFormCheckbox } from '@ant-design/pro-components';
import { Card, Space, Divider, Button, Tooltip } from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  GoogleOutlined, 
  FacebookOutlined,
  GithubOutlined,
  RocketOutlined
} from '@ant-design/icons';
import { useAuth } from '@/hooks/useAuth';

/**
 * Giriş sayfası - ProForm ile modern tasarım
 * Social login ve form validation entegre
 */
export const Login: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [form] = ProForm.useForm();

  // CRITICAL: Eğer zaten giriş yapılmışsa dashboard'a yönlendir
  useEffect(() => {
    if (isAuthenticated) {
      console.log('✅ Already authenticated, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Eğer authenticated ise loading göster
  if (isAuthenticated) {
    return (
      <div style={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ 
          color: 'white', 
          fontSize: '18px',
          textAlign: 'center'
        }}>
          Yönlendiriliyor...
        </div>
      </div>
    );
  }

  /**
   * Form submit handler
   */
  const handleSubmit = async (values: any) => {
    console.log('📝 Login form submitted:', { email: values.email });
    
    login({
      email: values.email,
      password: values.password
    });
  };

  /**
   * Hızlı giriş - Test kullanıcı bilgilerini otomatik doldur
   */
  const handleQuickLogin = () => {
    const testCredentials = {
      email: 'test@accountos.com',
      password: 'Test123!'
    };
    
    console.log('⚡ Quick login with test credentials');
    
    // Form'u test bilgileriyle doldur
    form.setFieldsValue(testCredentials);
    
    // Otomatik giriş yap
    login(testCredentials);
  };

  /**
   * Demo kullanıcı seçenekleri
   */
  const demoUsers = [
    {
      name: 'Admin',
      email: 'admin@accountos.com',
      password: 'Admin123!',
      role: 'Yönetici'
    },
    {
      name: 'Muhasebeci',
      email: 'muhasebe@accountos.com', 
      password: 'Muhasebe123!',
      role: 'Muhasebeci'
    },
    {
      name: 'Satış',
      email: 'satis@accountos.com',
      password: 'Satis123!',
      role: 'Satış Temsilcisi'
    }
  ];

  /**
   * Demo kullanıcı ile giriş
   */
  const handleDemoLogin = (user: typeof demoUsers[0]) => {
    console.log(`⚡ Demo login with ${user.name}`);
    
    // Form'u demo kullanıcı bilgileriyle doldur
    form.setFieldsValue({
      email: user.email,
      password: user.password
    });
    
    // Otomatik giriş yap
    login({
      email: user.email,
      password: user.password
    });
  };

  /**
   * Social login handler'ları
   */
  const handleSocialLogin = (provider: string) => {
    // Social login implementation
    console.log(`Social login with ${provider}`);
  };

  // Login sayfasından gelinen yönlendirme (şimdilik kullanılmıyor)
  // const from = location.state?.from?.pathname || '/dashboard';

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
            {t('auth.welcome')}
          </p>
        </div>

        {/* Hızlı Giriş Butonları */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            marginBottom: '8px',
            flexWrap: 'wrap'
          }}>
            {demoUsers.map((user, index) => (
              <Tooltip key={index} title={`${user.role} olarak giriş yap`}>
                <Button
                  type="dashed"
                  size="small"
                  onClick={() => handleDemoLogin(user)}
                  style={{ 
                    flex: '1',
                    minWidth: '80px',
                    fontSize: '12px'
                  }}
                >
                  {user.name}
                </Button>
              </Tooltip>
            ))}
          </div>
          
          <Tooltip title="Ana test kullanıcı bilgileriyle hızlı giriş">
            <Button
              type="primary"
              icon={<RocketOutlined />}
              onClick={handleQuickLogin}
              style={{ width: '100%' }}
            >
              ⚡ Hızlı Giriş (test@accountos.com)
            </Button>
          </Tooltip>
        </div>

        {/* Login Form */}
        <ProForm
          form={form}
          onFinish={handleSubmit}
          submitter={{
            searchConfig: {
              submitText: t('auth.login'),
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
              prefix: <UserOutlined style={{ color: '#bfbfbf' }} />
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

          <ProFormCheckbox
            name="rememberMe"
            fieldProps={{
              children: t('auth.rememberMe')
            }}
          />

          <div style={{ textAlign: 'right', marginBottom: '24px' }}>
            <Link to="/forgot-password" style={{ color: '#1890ff' }}>
              {t('auth.forgotPassword')}
            </Link>
          </div>
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

        {/* Register Link */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <span style={{ color: '#666' }}>
            {t('auth.noAccount')}
          </span>
          <Link 
            to="/register" 
            style={{ 
              color: '#1890ff', 
              marginLeft: '8px',
              fontWeight: '500'
            }}
          >
            {t('auth.register')}
          </Link>
        </div>
      </Card>
    </div>
  );
};