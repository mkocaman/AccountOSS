import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { RocketOutlined } from '@ant-design/icons';

interface ComingSoonProps {
  title?: string;
  description?: string;
}

/**
 * Yakında gelecek sayfalar için placeholder
 */
export const ComingSoon: React.FC<ComingSoonProps> = ({ 
  title = 'Bu Sayfa Yakında Gelecek',
  description = 'Bu özellik üzerinde çalışıyoruz. Yakında kullanıma sunulacak.'
}) => {
  const navigate = useNavigate();

  return (
    <Result
      icon={<RocketOutlined style={{ color: '#1890ff' }} />}
      title={title}
      subTitle={description}
      extra={
        <Button type="primary" onClick={() => navigate('/dashboard')}>
          Dashboard'a Dön
        </Button>
      }
    />
  );
};

export default ComingSoon;
