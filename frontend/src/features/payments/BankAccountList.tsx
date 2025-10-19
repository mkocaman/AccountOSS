import { useState, useEffect } from 'react';
import { Button, Table, Tag, Space, Modal, Form, Input, Select, message, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { bankAccountsApi } from '@/api/payments';
import type { BankAccount } from '@/types/payment';
import type { ColumnsType } from 'antd/es/table';

// Banka hesapları listesi
export const BankAccountList = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const response = await bankAccountsApi.getAll();
      if (response.success) {
        setAccounts(response.data);
      }
    } catch (error) {
      message.error('Banka hesapları yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingAccount) {
        await bankAccountsApi.update(editingAccount.id, values);
        message.success('Banka hesabı güncellendi');
      } else {
        await bankAccountsApi.create(values);
        message.success('Banka hesabı oluşturuldu');
      }
      setModalOpen(false);
      form.resetFields();
      setEditingAccount(null);
      loadAccounts();
    } catch (error) {
      message.error('İşlem başarısız');
    }
  };

  const handleEdit = (account: BankAccount) => {
    setEditingAccount(account);
    form.setFieldsValue(account);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingAccount(null);
    form.resetFields();
    setModalOpen(true);
  };

  const columns: ColumnsType<BankAccount> = [
    {
      title: 'Banka Adı',
      dataIndex: 'bankName',
      key: 'bankName',
      render: (name) => <span className="font-medium">{name}</span>,
    },
    {
      title: 'Hesap No',
      dataIndex: 'accountNumber',
      key: 'accountNumber',
      render: (number) => <span className="font-mono text-sm">{number}</span>,
    },
    {
      title: 'IBAN',
      dataIndex: 'iban',
      key: 'iban',
      render: (iban) => iban ? <span className="font-mono text-sm">{iban}</span> : '-',
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
          <h1 className="text-2xl font-bold">Banka Hesapları</h1>
          <p className="text-gray-500">Banka hesap yönetimi</p>
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
            Yeni Banka Hesabı
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
        title={editingAccount ? 'Banka Hesabı Düzenle' : 'Yeni Banka Hesabı'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="bankName"
            label="Banka Adı"
            rules={[{ required: true, message: 'Banka adı gerekli!' }]}
          >
            <Input placeholder="Örn: Türkiye İş Bankası" size="large" />
          </Form.Item>

          <Form.Item
            name="accountNumber"
            label="Hesap Numarası"
            rules={[{ required: true, message: 'Hesap numarası gerekli!' }]}
          >
            <Input placeholder="1234567890" size="large" />
          </Form.Item>

          <Form.Item
            name="iban"
            label="IBAN (Opsiyonel)"
          >
            <Input placeholder="TR00 0000 0000 0000 0000 0000 00" size="large" />
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
