import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, message, Checkbox, Divider } from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  EyeInvisibleOutlined, 
  EyeTwoTone,
  SafetyOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';

export const Login = () => {
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [initialEmail, setInitialEmail] = useState('');
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  // Sayfa yüklendiğinde kayıtlı bilgileri kontrol et
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedRememberMe = localStorage.getItem('rememberMe') === 'true';
    
    if (savedEmail && savedRememberMe) {
      setRememberMe(true);
      setInitialEmail(savedEmail);
    }
  }, []);

  const onFinish = async (values: { email: string; password: string; rememberMe?: boolean }) => {
    setLoading(true);
    try {
      const response = await authApi.login({
        email: values.email,
        password: values.password,
      });

      if (response.success) {
        const { user, accessToken, refreshToken } = response.data;
        setAuth(user, accessToken, refreshToken);
        
        // Beni hatırla seçiliyse bilgileri kaydet
        if (values.rememberMe) {
          localStorage.setItem('rememberedEmail', values.email);
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('rememberedEmail');
          localStorage.removeItem('rememberMe');
        }
        
        message.success('Giriş başarılı!');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      // Hata mesajı interceptor'da gösteriliyor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-100/50 to-indigo-100/50"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.15) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}></div>
      </div>
      
      <div className="relative z-10 w-full max-w-md px-4">
        <Card 
          className="shadow-2xl border-0 rounded-2xl overflow-hidden"
          bodyStyle={{ padding: '48px 40px' }}
        >
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4">
              <SafetyOutlined className="text-2xl text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">AccountOS</h1>
            <p className="text-gray-600 text-sm">Modern ERP & Muhasebe Sistemi</p>
          </div>

          <Form
            name="login"
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
            initialValues={{ 
              email: initialEmail,
              rememberMe: rememberMe 
            }}
          >
            <Form.Item
              name="email"
              label={<span className="text-gray-700 font-medium">E-posta</span>}
              rules={[
                { required: true, message: 'E-posta adresi gerekli!' },
                { type: 'email', message: 'Geçerli bir e-posta adresi girin!' },
              ]}
            >
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder="ornek@email.com"
                size="large"
                className="rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500"
                style={{ height: '48px' }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span className="text-gray-700 font-medium">Şifre</span>}
              rules={[
                { required: true, message: 'Şifre gerekli!' },
                { min: 6, message: 'Şifre en az 6 karakter olmalı!' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Şifrenizi girin"
                size="large"
                className="rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500"
                style={{ height: '48px' }}
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              />
            </Form.Item>

            <Form.Item name="rememberMe" valuePropName="checked" className="mb-6">
              <div className="flex items-center justify-between">
                <Checkbox 
                  className="text-gray-600"
                  onChange={(e) => setRememberMe(e.target.checked)}
                >
                  Beni hatırla
                </Checkbox>
                <a href="#" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Şifremi unuttum?
                </a>
              </div>
            </Form.Item>

            <Form.Item className="mb-6">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                block
                className="h-12 rounded-lg font-semibold text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </Button>
            </Form.Item>

            <Divider className="my-6">
              <span className="text-gray-400 text-sm">veya</span>
            </Divider>

            <div className="text-center">
              <p className="text-gray-600 text-sm">
                Hesabınız yok mu?{' '}
                <a 
                  href="/register" 
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Kayıt olun
                </a>
              </p>
            </div>
          </Form>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            <GlobalOutlined className="mr-1" />
            Güvenli giriş ile korunuyorsunuz
          </p>
        </div>
      </div>
    </div>
  );
};