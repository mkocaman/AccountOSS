import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Checkbox, App } from 'antd';
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
  const { message } = App.useApp();

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
      console.log('🔐 Login attempt:', { email: values.email });
      
      const response = await authApi.login({
        email: values.email,
        password: values.password,
      });

      console.log('✅ Login response:', response);

      if (response.data?.success) {
        const { user, accessToken, refreshToken } = response.data.data;
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
      } else {
        message.error('Giriş başarısız!');
      }
    } catch (error: any) {
      console.error('❌ Login error:', error);
      
      // Hata mesajını göster
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Giriş yapılırken bir hata oluştu!';
      
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-md mx-auto px-6 py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4">
              <SafetyOutlined className="text-2xl text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">AccountOS</h1>
            <p className="text-blue-100 text-sm">Modern ERP & Muhasebe Sistemi</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Hesabınıza Giriş Yapın</h2>
          <p className="text-gray-600 text-sm">
            E-posta adresiniz ve şifreniz ile hesabınıza güvenli giriş yapabilirsiniz
          </p>
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
            label={<span className="text-gray-700 font-medium">E-posta Adresiniz</span>}
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
            label={<span className="text-gray-700 font-medium">Parolanız</span>}
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
                Parolanızı mı unuttunuz?
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
              className="h-12 rounded-lg font-semibold text-base bg-blue-600 hover:bg-blue-700 border-0 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </Button>
          </Form.Item>

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