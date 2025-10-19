import React from 'react';
import { Modal, Form, Input, Select, Switch, message, Row, Col } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { chartOfAccountsApi } from '@/api/chartOfAccounts';
import type { ChartOfAccount, CreateChartOfAccountRequest } from '@/types/chartOfAccounts';
import { 
  AccountType, 
  AccountCategory,
  accountTypeLabels,
  accountCategoryLabels
} from '@/types/chartOfAccounts';

interface Props {
  open: boolean;
  account: ChartOfAccount | null;
  onClose: () => void;
}

export default function ChartOfAccountModal({ open, account, onClose }: Props) {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // Fetch all accounts for parent selection
  const { data: accounts } = useQuery({
    queryKey: ['chartOfAccountsAll'],
    queryFn: () => chartOfAccountsApi.getAllNoPaging()
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: (data: CreateChartOfAccountRequest) => {
      if (account) {
        return chartOfAccountsApi.update(account.id, data);
      }
      return chartOfAccountsApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chartOfAccounts'] });
      queryClient.invalidateQueries({ queryKey: ['chartOfAccountsAll'] });
      message.success(account ? 'Hesap güncellendi' : 'Hesap oluşturuldu');
      handleClose();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'İşlem başarısız');
    }
  });

  // Set initial values
  React.useEffect(() => {
    if (open) {
      if (account) {
        form.setFieldsValue({
          code: account.code,
          name: account.name,
          description: account.description,
          parentId: account.parentId,
          accountType: account.accountType,
          accountCategory: account.accountCategory,
          isGroup: account.isGroup,
          isActive: account.isActive,
          allowManualEntry: account.allowManualEntry,
          requiresDescription: account.requiresDescription,
          currency: account.currency,
          linkedModule: account.linkedModule
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          accountType: AccountType.Assets,
          accountCategory: AccountCategory.CurrentAssets,
          isGroup: false,
          isActive: true,
          allowManualEntry: true,
          requiresDescription: false,
          currency: 'TRY'
        });
      }
    }
  }, [open, account, form]);

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleSubmit = async (values: any) => {
    await saveMutation.mutateAsync(values);
  };

  // Filter parent options based on account type
  const getParentOptions = () => {
    if (!accounts) return [];
    
    const selectedType = form.getFieldValue('accountType');
    
    let filteredAccounts = accounts.filter(a => {
      // Aynı tipten hesapları göster
      if (selectedType && a.accountType !== selectedType) return false;
      
      // Düzenlemede: kendini ve alt hesaplarını hariç tut
      if (account) {
        if (a.id === account.id) return false;
        if (a.fullPath.startsWith(account.fullPath)) return false;
      }
      
      // Sadece grup hesapları göster
      return a.isGroup;
    });
    
    return filteredAccounts.map(a => ({
      label: `${a.code} - ${a.name}`,
      value: a.id
    }));
  };

  // Get category options based on account type
  const getCategoryOptions = () => {
    const selectedType = form.getFieldValue('accountType');
    
    const categoryMap: Record<AccountType, AccountCategory[]> = {
      [AccountType.Assets]: [
        AccountCategory.CurrentAssets,
        AccountCategory.FixedAssets
      ],
      [AccountType.Liabilities]: [
        AccountCategory.CurrentLiabilities,
        AccountCategory.LongTermLiabilities
      ],
      [AccountType.Equity]: [
        AccountCategory.Capital,
        AccountCategory.RetainedEarnings,
        AccountCategory.CurrentYearProfit
      ],
      [AccountType.Revenue]: [
        AccountCategory.SalesRevenue,
        AccountCategory.ServiceRevenue,
        AccountCategory.OtherRevenue
      ],
      [AccountType.CostOfSales]: [
        AccountCategory.CostOfGoods,
        AccountCategory.CostOfServices
      ],
      [AccountType.Expenses]: [
        AccountCategory.OperatingExpenses,
        AccountCategory.AdministrativeExpenses,
        AccountCategory.MarketingExpenses,
        AccountCategory.FinancialExpenses,
        AccountCategory.OtherExpenses
      ]
    };

    const categories = selectedType ? categoryMap[selectedType] : [];
    
    return categories.map(cat => ({
      label: accountCategoryLabels[cat],
      value: cat
    }));
  };

  return (
    <Modal
      title={account ? 'Hesap Düzenle' : 'Yeni Hesap'}
      open={open}
      onCancel={handleClose}
      onOk={() => form.submit()}
      confirmLoading={saveMutation.isPending}
      width={800}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="code"
              label="Hesap Kodu"
              rules={[{ required: true, message: 'Kod zorunludur' }]}
              extra="Örn: 100, 100.01, 100.01.001"
            >
              <Input placeholder="100" disabled={account?.isSystemAccount} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="name"
              label="Hesap Adı"
              rules={[{ required: true, message: 'Ad zorunludur' }]}
            >
              <Input placeholder="KASA" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="description"
          label="Açıklama"
        >
          <Input.TextArea rows={2} placeholder="Hesap açıklaması..." />
        </Form.Item>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="accountType"
              label="Hesap Tipi"
              rules={[{ required: true, message: 'Tip zorunludur' }]}
            >
              <Select
                placeholder="Seçiniz"
                disabled={account?.isSystemAccount}
                onChange={() => {
                  // Reset category when type changes
                  form.setFieldValue('accountCategory', undefined);
                  form.setFieldValue('parentId', undefined);
                }}
                options={Object.entries(accountTypeLabels).map(([value, label]) => ({
                  label,
                  value: Number(value)
                }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="accountCategory"
              label="Kategori"
              rules={[{ required: true, message: 'Kategori zorunludur' }]}
            >
              <Select
                placeholder="Seçiniz"
                disabled={account?.isSystemAccount}
                options={getCategoryOptions()}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="parentId"
          label="Üst Hesap"
          help="Boş bırakılırsa ana hesap olur"
        >
          <Select
            placeholder="Ana hesap"
            allowClear
            showSearch
            optionFilterProp="label"
            disabled={account?.isSystemAccount}
            options={getParentOptions()}
          />
        </Form.Item>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="currency"
              label="Para Birimi"
            >
              <Select
                placeholder="Varsayılan"
                allowClear
                options={[
                  { label: 'TRY - Türk Lirası', value: 'TRY' },
                  { label: 'USD - Dolar', value: 'USD' },
                  { label: 'EUR - Euro', value: 'EUR' },
                  { label: 'GBP - Sterlin', value: 'GBP' }
                ]}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="linkedModule"
              label="Bağlı Modül"
              help="Otomatik entegrasyon için"
            >
              <Select
                placeholder="Seçiniz"
                allowClear
                options={[
                  { label: 'Müşteriler', value: 'customers' },
                  { label: 'Tedarikçiler', value: 'suppliers' },
                  { label: 'Stok', value: 'inventory' },
                  { label: 'Banka', value: 'bank' },
                  { label: 'Kasa', value: 'cash' },
                  { label: 'KDV', value: 'vat' }
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        <div className="bg-gray-50 p-4 rounded mb-4">
          <h4 className="font-semibold mb-3">Hesap Özellikleri</h4>
          
          <Form.Item
            name="isGroup"
            label="Grup Hesap"
            valuePropName="checked"
            help="Alt hesapları olan grup hesap mı?"
          >
            <Switch disabled={account?.isSystemAccount} />
          </Form.Item>

          <Form.Item
            name="allowManualEntry"
            label="Manuel Kayıt İzni"
            valuePropName="checked"
            help="Bu hesaba manuel yevmiye kaydı yapılabilir mi?"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="requiresDescription"
            label="Açıklama Zorunlu"
            valuePropName="checked"
            help="Bu hesaba kayıt yapılırken açıklama zorunlu mu?"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="isActive"
            label="Durum"
            valuePropName="checked"
          >
            <Switch checkedChildren="Aktif" unCheckedChildren="Pasif" />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}

