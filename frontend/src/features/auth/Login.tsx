import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';

export const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const response = await authApi.login({
        email: values.email,
        password: values.password,
      });

      if (response.success) {
        const { user, accessToken, refreshToken } = response.data;
        setAuth(user, accessToken, refreshToken);
        
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">AccountOS</h1>
          <p className="text-gray-500 mt-2">Modern ERP & Muhasebe Sistemi</p>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="email"
            label="E-posta"
            rules={[
              { required: true, message: 'E-posta gerekli!' },
              { type: 'email', message: 'Geçerli bir e-posta girin!' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="ornek@email.com"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Şifre"
            rules={[{ required: true, message: 'Şifre gerekli!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Şifrenizi girin"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              block
            >
              Giriş Yap
            </Button>
          </Form.Item>

          <div className="text-center">
            <a href="/register" className="text-primary">
              Hesabınız yok mu? Kayıt olun
            </a>
          </div>
        </Form>
      </Card>
    </div>
  );
};

