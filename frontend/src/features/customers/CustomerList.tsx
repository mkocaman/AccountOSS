import { useState, useEffect } from 'react';
import { Button, Tag, Space, Modal, message, Card, Select, App } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { customersApi, type CustomerListParams } from '@/api/customers';
import type { Customer } from '@/types/customer';
import { DataTable } from '@/components/ui/DataTable';
import { SearchBar } from '@/components/ui/SearchBar';
import type { ColumnsType } from 'antd/es/table';

// Müşteri listesi sayfası
export const CustomerList = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]); // Backend'den gelen tüm data
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState<CustomerListParams>({});
  const { modal } = App.useApp();

  useEffect(() => {
    loadCustomers();
  }, [params]);

  // Müşterileri yükle
  const loadCustomers = async () => {
    setLoading(true);
    try {
      const response = await customersApi.getAll(params);
      if (response.success) {
        const data = response.data;
        console.log('Loaded customers from API:', data);
        setAllCustomers(data);
        
        // Client-side type filter
        let filtered = data;
        if (params.type !== undefined) {
          filtered = filtered.filter((c) => c.type === params.type);
        }
        
        setCustomers(filtered);
      }
    } catch (error) {
      message.error('Müşteriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  // Arama
  const handleSearch = (value: string) => {
    setParams({ ...params, searchText: value });
  };

  // Müşteri sil
  const handleDelete = (customer: Customer) => {
    modal.confirm({
      title: 'Müşteriyi Sil',
      icon: <ExclamationCircleOutlined />,
      content: `"${customer.name}" müşterisini silmek istediğinize emin misiniz?`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await customersApi.delete(customer.id);
          message.success('Müşteri silindi');
          loadCustomers();
        } catch (error) {
          message.error('Müşteri silinemedi');
        }
      },
    });
  };

  // Tablo kolonları
  const columns: ColumnsType<Customer> = [
    {
      title: 'Müşteri Kodu',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (code) => <span className="font-mono font-medium">{code}</span>,
    },
    {
      title: 'Müşteri Adı',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      render: (name, record) => (
        <div>
          <div className="font-medium">{name}</div>
          <div className="text-xs text-gray-500">
            {record.type === 0 ? '👤 Bireysel' : '🏢 Kurumsal'}
          </div>
        </div>
      ),
    },
    {
      title: 'İletişim',
      key: 'contact',
      width: 200,
      render: (_, record) => (
        <div className="text-sm">
          {record.email && <div>📧 {record.email}</div>}
          {record.phone && <div>📞 {record.phone}</div>}
        </div>
      ),
    },
    {
      title: 'Vergi No',
      dataIndex: 'taxNumber',
      key: 'taxNumber',
      width: 150,
    },
    {
      title: 'Şehir',
      dataIndex: 'city',
      key: 'city',
      width: 120,
    },
    {
      title: 'Para Birimi',
      dataIndex: 'currency',
      key: 'currency',
      width: 100,
      render: (currency) => <Tag color="blue">{currency}</Tag>,
    },
    {
      title: 'Bakiye',
      dataIndex: 'currentBalance',
      key: 'currentBalance',
      width: 150,
      align: 'right',
      render: (balance, record) => (
        <span
          className={`font-medium ${
            balance > 0 ? 'text-green-600' : balance < 0 ? 'text-red-600' : ''
          }`}
        >
          {balance.toFixed(2)} {record.currency}
        </span>
      ),
    },
    {
      title: 'Durum',
      key: 'status',
      width: 100,
      render: (_, record) => (
        <div>
          {record.isActive ? (
            <Tag color="green">Aktif</Tag>
          ) : (
            <Tag color="red">Pasif</Tag>
          )}
          {record.isBlocked && <Tag color="orange">Bloke</Tag>}
        </div>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/customers/${record.id}`);
            }}
          />
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              console.log('🔧 Edit button clicked for customer ID:', record.id);
              console.log('🔧 Customer record:', record);
              navigate(`/customers/edit/${record.id}`);
            }}
          />
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(record);
            }}
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
          <h1 className="text-2xl font-bold">Müşteriler</h1>
          <p className="text-gray-500">Müşteri listesi ve yönetimi</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/customers/create')}
          size="large"
        >
          Yeni Müşteri
        </Button>
      </div>

      {/* Arama ve Filtreler */}
      <Card className="mb-4">
        <SearchBar
          onSearch={handleSearch}
          onRefresh={loadCustomers}
          placeholder="Müşteri adı, kod, vergi no..."
          filters={
            <Space>
              <Select
                placeholder="Tür"
                style={{ width: 150 }}
                allowClear
                onChange={(value) => setParams({ ...params, type: value })}
              >
                <Select.Option value={0}>Bireysel</Select.Option>
                <Select.Option value={1}>Kurumsal</Select.Option>
              </Select>

              <Select
                placeholder="Durum"
                style={{ width: 150 }}
                allowClear
                onChange={(value) => setParams({ ...params, isActive: value })}
              >
                <Select.Option value={true}>Aktif</Select.Option>
                <Select.Option value={false}>Pasif</Select.Option>
              </Select>
            </Space>
          }
        />
      </Card>

      {/* Tablo */}
      <Card>
        <DataTable
          columns={columns}
          data={customers}
          loading={loading}
          onRow={(record) => ({
            onClick: () => navigate(`/customers/${record.id}`),
            style: { cursor: 'pointer' }
          })}
        />
      </Card>
    </div>
  );
};

