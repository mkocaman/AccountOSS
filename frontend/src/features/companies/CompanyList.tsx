import { useState, useEffect } from 'react';
import { Button, Table, Space, Tag, message, Modal, Card } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { companiesApi } from '@/api/companies';
import { Company } from '@/store/companyStore';
import type { ColumnsType } from 'antd/es/table';

// Şirket listesi sayfası
export const CompanyList = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCompanies();
  }, []);

  // Şirketleri yükle
  const loadCompanies = async () => {
    setLoading(true);
    try {
      const response = await companiesApi.getAll();
      if (response.success) {
        setCompanies(response.data.items);
      }
    } catch (error) {
      message.error('Şirketler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  // Şirket sil
  const handleDelete = (company: Company) => {
    Modal.confirm({
      title: 'Şirketi Sil',
      icon: <ExclamationCircleOutlined />,
      content: `"${company.name}" şirketini silmek istediğinize emin misiniz? Bu işlem geri alınamaz!`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await companiesApi.delete(company.id);
          message.success('Şirket silindi');
          loadCompanies();
        } catch (error) {
          message.error('Şirket silinemedi');
        }
      },
    });
  };

  // Tablo kolonları
  const columns: ColumnsType<Company> = [
    {
      title: 'Şirket Adı',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div className="flex items-center gap-2">
          {record.logoUrl ? (
            <img
              src={record.logoUrl}
              alt={text}
              className="w-8 h-8 rounded"
            />
          ) : (
            <div className="w-8 h-8 bg-primary rounded text-white flex items-center justify-center">
              {text.charAt(0)}
            </div>
          )}
          <span className="font-medium">{text}</span>
        </div>
      ),
    },
    {
      title: 'Vergi No',
      dataIndex: 'taxNumber',
      key: 'taxNumber',
    },
    {
      title: 'Vergi Dairesi',
      dataIndex: 'taxOffice',
      key: 'taxOffice',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Telefon',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Para Birimi',
      dataIndex: 'baseCurrency',
      key: 'baseCurrency',
      render: (currency) => <Tag color="blue">{currency}</Tag>,
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Aktif' : 'Pasif'}
        </Tag>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => navigate(`/companies/edit/${record.id}`)}
          />
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Başlık */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Şirketler</h1>
          <p className="text-gray-500">Şirket listesi ve yönetimi</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/companies/create')}
          size="large"
        >
          Yeni Şirket
        </Button>
      </div>

      {/* Tablo */}
      <Card>
        <Table
          columns={columns}
          dataSource={companies}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} şirket`,
          }}
        />
      </Card>
    </div>
  );
};

