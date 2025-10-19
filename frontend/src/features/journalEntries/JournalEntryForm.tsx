import { useState } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Select, 
  DatePicker,
  Button,
  InputNumber,
  Space,
  message,
  Row,
  Col,
  Table,
  Alert
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  SaveOutlined,
  ArrowLeftOutlined,
  PlusOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';

import { journalEntriesApi } from '@/api/journalEntries';
import { chartOfAccountsApi } from '@/api/chartOfAccounts';
import type { CreateJournalEntryRequest, CreateJournalEntryLineRequest } from '@/types/journalEntry';
import { JournalEntryType, journalEntryTypeLabels } from '@/types/journalEntry';
import { formatCurrency } from '@/lib/utils';
import { usePageTitle } from '@/hooks/usePageTitle';

interface FormLine extends CreateJournalEntryLineRequest {
  key: string;
  account?: any;
}

export default function JournalEntryForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [lines, setLines] = useState<FormLine[]>([]);

  usePageTitle(id ? 'Yevmiye Kaydı Düzenle' : 'Yeni Yevmiye Kaydı');

  // Fetch existing entry
  const { data: entry } = useQuery({
    queryKey: ['journalEntry', id],
    queryFn: () => journalEntriesApi.getById(id!),
    enabled: !!id
  });

  // Fetch accounts
  const { data: accounts } = useQuery({
    queryKey: ['chartOfAccountsAll'],
    queryFn: () => chartOfAccountsApi.getAllNoPaging()
  });

  // Filter accounts for manual entry
  const manualEntryAccounts = accounts?.filter(a => !a.isGroup && a.allowManualEntry) || [];

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: (data: CreateJournalEntryRequest) => {
      if (id) {
        return journalEntriesApi.update(id, data);
      }
      return journalEntriesApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
      message.success(id ? 'Kayıt güncellendi' : 'Kayıt oluşturuldu');
      navigate('/journal-entries');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'İşlem başarısız');
    }
  });

  // Load existing entry data
  React.useEffect(() => {
    if (entry) {
      form.setFieldsValue({
        entryDate: dayjs(entry.entryDate),
        entryType: entry.entryType,
        description: entry.description,
        reference: entry.reference
      });
      setLines(entry.lines.map((line: any, index: number) => ({
        key: `line-${index}`,
        accountId: line.accountId,
        debit: line.debit,
        credit: line.credit,
        description: line.description,
        reference: line.reference,
        account: line.account
      })));
    }
  }, [entry, form]);

  // Add line
  const addLine = () => {
    setLines([...lines, {
      key: `new-${Date.now()}`,
      accountId: '',
      debit: 0,
      credit: 0
    }]);
  };

  // Remove line
  const removeLine = (key: string) => {
    setLines(lines.filter(line => line.key !== key));
  };

  // Update line
  const updateLine = (key: string, field: string, value: any) => {
    setLines(lines.map(line => {
      if (line.key === key) {
        const updated = { ...line, [field]: value };
        
        // Auto-clear opposite amount
        if (field === 'debit' && value > 0) {
          updated.credit = 0;
        } else if (field === 'credit' && value > 0) {
          updated.debit = 0;
        }
        
        return updated;
      }
      return line;
    }));
  };

  // Handle account selection
  const handleAccountSelect = (key: string, accountId: string) => {
    const account = accounts?.find(a => a.id === accountId);
    if (account) {
      updateLine(key, 'accountId', accountId);
      updateLine(key, 'account', account);
    }
  };

  // Calculate totals
  const totals = React.useMemo(() => {
    let totalDebit = 0;
    let totalCredit = 0;

    lines.forEach(line => {
      totalDebit += line.debit;
      totalCredit += line.credit;
    });

    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;
    const difference = totalDebit - totalCredit;

    return { totalDebit, totalCredit, isBalanced, difference };
  }, [lines]);

  // Line columns
  const lineColumns: ColumnsType<FormLine> = [
    {
      title: '#',
      width: 50,
      render: (_, __, index) => index + 1
    },
    {
      title: 'Hesap *',
      dataIndex: 'accountId',
      width: 250,
      render: (accountId, record) => (
        <Select
          className="w-full"
          showSearch
          placeholder="Hesap seçin"
          optionFilterProp="label"
          value={accountId || undefined}
          onChange={(value) => handleAccountSelect(record.key, value)}
          options={manualEntryAccounts.map(a => ({
            label: `${a.code} - ${a.name}`,
            value: a.id
          }))}
        />
      )
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      width: 200,
      render: (desc, record) => (
        <Input
          value={desc}
          onChange={(e) => updateLine(record.key, 'description', e.target.value)}
          placeholder="Satır açıklaması..."
        />
      )
    },
    {
      title: 'Borç',
      dataIndex: 'debit',
      width: 150,
      render: (debit, record) => (
        <InputNumber
          className="w-full"
          min={0}
          precision={2}
          value={debit}
          onChange={(value) => updateLine(record.key, 'debit', value || 0)}
          addonAfter="TRY"
        />
      )
    },
    {
      title: 'Alacak',
      dataIndex: 'credit',
      width: 150,
      render: (credit, record) => (
        <InputNumber
          className="w-full"
          min={0}
          precision={2}
          value={credit}
          onChange={(value) => updateLine(record.key, 'credit', value || 0)}
          addonAfter="TRY"
        />
      )
    },
    {
      title: 'Referans',
      dataIndex: 'reference',
      width: 120,
      render: (ref, record) => (
        <Input
          value={ref}
          onChange={(e) => updateLine(record.key, 'reference', e.target.value)}
          placeholder="Ref..."
        />
      )
    },
    {
      title: '',
      width: 50,
      render: (_, record) => (
        <Button
          type="text"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => removeLine(record.key)}
        />
      )
    }
  ];

  // Form submit
  const handleSubmit = async (values: any) => {
    if (lines.length < 2) {
      message.error('En az 2 satır eklemelisiniz');
      return;
    }

    const invalidLines = lines.filter(line => 
      !line.accountId || (line.debit === 0 && line.credit === 0)
    );
    if (invalidLines.length > 0) {
      message.error('Tüm satırlar için hesap ve tutar girilmelidir');
      return;
    }

    if (!totals.isBalanced) {
      message.error('Borç ve alacak toplamları eşit olmalıdır!');
      return;
    }

    const data: CreateJournalEntryRequest = {
      entryDate: values.entryDate.format('YYYY-MM-DD'),
      description: values.description,
      reference: values.reference,
      entryType: values.entryType,
      lines: lines.map(line => ({
        accountId: line.accountId,
        debit: line.debit,
        credit: line.credit,
        description: line.description,
        reference: line.reference
      }))
    };

    await saveMutation.mutateAsync(data);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/journal-entries')}
          className="mb-4"
        >
          Geri
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {id ? 'Yevmiye Kaydı Düzenle' : 'Yeni Yevmiye Kaydı'}
        </h1>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          entryDate: dayjs(),
          entryType: JournalEntryType.Manual
        }}
      >
        {/* Basic Info */}
        <Card title="Genel Bilgiler" className="mb-4">
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                name="entryDate"
                label="Kayıt Tarihi"
                rules={[{ required: true, message: 'Tarih zorunludur' }]}
              >
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="entryType"
                label="Kayıt Tipi"
                rules={[{ required: true, message: 'Tip zorunludur' }]}
              >
                <Select
                  options={Object.entries(journalEntryTypeLabels).map(([value, label]) => ({
                    label,
                    value: Number(value)
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="reference"
                label="Referans No"
              >
                <Input placeholder="Fiş no, fatura no..." />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Açıklama"
            rules={[{ required: true, message: 'Açıklama zorunludur' }]}
          >
            <Input.TextArea rows={2} placeholder="Kayıt açıklaması..." />
          </Form.Item>
        </Card>

        {/* Lines */}
        <Card 
          title="Kayıt Satırları" 
          className="mb-4"
          extra={
            <Button 
              type="dashed" 
              icon={<PlusOutlined />}
              onClick={addLine}
            >
              Satır Ekle
            </Button>
          }
        >
          <Table
            columns={lineColumns}
            dataSource={lines}
            rowKey="key"
            pagination={false}
            scroll={{ x: 1000 }}
            locale={{
              emptyText: 'Henüz satır eklenmedi. "Satır Ekle" butonuna tıklayın.'
            }}
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={3}>
                    <strong className="text-lg">TOPLAM</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3} align="right">
                    <strong className="text-lg text-blue-600">
                      {formatCurrency(totals.totalDebit, 'TRY')}
                    </strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={4} align="right">
                    <strong className="text-lg text-green-600">
                      {formatCurrency(totals.totalCredit, 'TRY')}
                    </strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={5}>
                    {totals.isBalanced ? (
                      <Tag color="green" className="text-base">✓ Dengede</Tag>
                    ) : (
                      <Tag color="red" className="text-base">
                        ✗ Fark: {formatCurrency(Math.abs(totals.difference), 'TRY')}
                      </Tag>
                    )}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={6} />
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </Card>

        {/* Balance Warning */}
        {!totals.isBalanced && lines.length > 0 && (
          <Alert
            message="Kayıt Dengesiz"
            description={`Borç ve alacak toplamları eşit değil. Fark: ${formatCurrency(Math.abs(totals.difference), 'TRY')}`}
            type="error"
            showIcon
            className="mb-4"
          />
        )}

        {/* Actions */}
        <Card>
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              size="large"
              loading={saveMutation.isPending}
              disabled={!totals.isBalanced}
            >
              {id ? 'Güncelle' : 'Kaydet'}
            </Button>
            <Button
              size="large"
              onClick={() => navigate('/journal-entries')}
            >
              İptal
            </Button>
          </Space>
        </Card>
      </Form>
    </div>
  );
}

