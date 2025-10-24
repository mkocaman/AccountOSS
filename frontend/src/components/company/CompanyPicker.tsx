import React, { useState, useEffect } from 'react';
import { Card, Button, List, Avatar, Spin, message } from 'antd';
import { BankOutlined, CheckOutlined } from '@ant-design/icons';
import { useCompanyStore } from '@/stores/companyStore';
import { useNavigate } from 'react-router-dom';

interface Company {
  id: string;
  name: string;
  code?: string;
  isDefault?: boolean;
}

interface CompanyPickerProps {
  companies: { id: string; name: string; isDefault?: boolean }[];
}

export const CompanyPicker: React.FC<CompanyPickerProps> = ({ companies }) => {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const { setCompanyId } = useCompanyStore();
  const navigate = useNavigate();

  console.log('🏢 CompanyPicker - Companies:', {
    companies,
    companiesCount: companies.length
  });

  const handleCompanySelect = async (companyId: string) => {
    try {
      setSelectedCompanyId(companyId);
      setCompanyId(companyId);
      message.success('Şirket seçildi');
      navigate('/dashboard');
    } catch (error) {
      message.error('Şirket seçimi başarısız');
      setSelectedCompanyId(null);
    }
  };

  if (companies.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-4xl mb-4">🏢</div>
            <h2 className="text-xl font-semibold mb-2">Şirket Bulunamadı</h2>
            <p className="text-gray-600 mb-4">
              Bu hesaba bağlı herhangi bir şirket bulunamadı.
            </p>
            <Button type="primary" onClick={() => window.location.reload()}>
              Tekrar Dene
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="max-w-2xl w-full mx-4">
        <div className="text-center mb-6">
          <div className="text-4xl mb-4">🏢</div>
          <h1 className="text-2xl font-bold mb-2">Şirket Seçin</h1>
          <p className="text-gray-600">
            Devam etmek için bir şirket seçin
          </p>
        </div>

        <List
          dataSource={companies}
          renderItem={(company) => (
            <List.Item
              className="cursor-pointer hover:bg-gray-50 p-4 rounded-lg border border-gray-200 mb-2"
              onClick={() => handleCompanySelect(company.id)}
            >
              <List.Item.Meta
                avatar={
                  <Avatar 
                    icon={<BankOutlined />} 
                    size="large"
                    className="bg-blue-100 text-blue-600"
                  />
                }
                title={
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-lg">{company.name}</span>
                    {company.isDefault && (
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                        Varsayılan
                      </span>
                    )}
                  </div>
                }
                description={
                  <div>
                    {company.code && (
                      <div className="text-sm text-gray-500">Kod: {company.code}</div>
                    )}
                    <div className="text-sm text-gray-500">ID: {company.id}</div>
                  </div>
                }
              />
              {selectedCompanyId === company.id && (
                <CheckOutlined className="text-green-500 text-xl" />
              )}
            </List.Item>
          )}
        />

        <div className="text-center mt-6">
          <Button 
            type="link" 
            onClick={() => navigate('/logout')}
            className="text-gray-500"
          >
            Farklı hesap ile giriş yap
          </Button>
        </div>
      </Card>
    </div>
  );
};
