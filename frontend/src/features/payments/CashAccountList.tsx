import { useState, useEffect } from 'react';
import { Button, Table, Tag, Space, Modal, Form, Input, Select, message, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { cashAccountsApi } from '@/api/payments';
import type { CashAccount } from '@/types/payment';
import type { ColumnsType } from 'antd/es/table';

// Kasa hesapları listesi
export const CashAccountList = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<CashAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<CashAccount | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const response = await cashAccountsApi.getAll();
      if (response.success) {
        setAccounts(response.data);
      }
    } catch (error) {
      message.error('Kasa hesapları yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingAccount) {
        await cashAccountsApi.update(editingAccount.id, values);
        message.success('Kasa hesabı güncellendi');
      } else {
        await cashAccountsApi.create(values);
        message.success('Kasa hesabı oluşturuldu');
      }
      setModalOpen(false);
      form.resetFields();
      setEditingAccount(null);
      loadAccounts();
    } catch (error) {
      message.error('İşlem başarısız');
    }
  };

  const handleEdit = (account: CashAccount) => {
    setEditingAccount(account);
    form.setFieldsValue(account);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingAccount(null);
    form.resetFields();
    setModalOpen(true);
  };

  const columns: ColumnsType<CashAccount> = [
    {
      title: 'Kasa Adı',
      dataIndex: 'name',
      key: 'name',
      render: (name) => <span className="font-medium">{name}</span>,
    },
    {
      title: 'Para Birimi',
      dataIndex: 'currency',
      key: 'currency',
      render: (currency) => <Tag color="blue">{currency}</Tag>,
    },
    {
      title: 'Bakiye',
      dataIndex: 'balance',
      key: 'balance',
      align: 'right',
      render: (balance, record) => (
        <span className="font-medium">
          {balance.toFixed(2)} {record.currency}
        </span>
      ),
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
      width: 100,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Kasa Hesapları</h1>
          <p className="text-gray-500">Nakit kasa yönetimi</p>
        </div>
        <Space>
          <Button onClick={() => navigate('/payments')}>
            Ödemelere Dön
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            size="large"
          >
            Yeni Kasa
          </Button>
        </Space>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={accounts}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Card>

      {/* Modal */}
      <Modal
        title={editingAccount ? 'Kasa Düzenle' : 'Yeni Kasa'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Kasa Adı"
            rules={[{ required: true, message: 'Kasa adı gerekli!' }]}
          >
            <Input placeholder="Örn: Ana Kasa" size="large" />
          </Form.Item>

          {!editingAccount && (
            <Form.Item
              name="currency"
              label="Para Birimi"
              rules={[{ required: true }]}
              initialValue="TRY"
            >
              <Select size="large">
                <Select.Option value="TRY">🇹🇷 TRY</Select.Option>
                <Select.Option value="USD">🇺🇸 USD</Select.Option>
                <Select.Option value="EUR">🇪🇺 EUR</Select.Option>
              </Select>
            </Form.Item>
          )}

          {editingAccount && (
            <Form.Item
              name="isActive"
              label="Durum"
              valuePropName="checked"
            >
              <Select size="large">
                <Select.Option value={true}>Aktif</Select.Option>
                <Select.Option value={false}>Pasif</Select.Option>
              </Select>
            </Form.Item>
          )}

          <div className="flex gap-4">
            <Button type="primary" htmlType="submit" size="large">
              {editingAccount ? 'Güncelle' : 'Oluştur'}
            </Button>
            <Button size="large" onClick={() => setModalOpen(false)}>
              İptal
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
