import { useState } from 'react';
import { 
  Card, 
  Table, 
  Select,
  DatePicker,
  Button, 
  Space,
  Row,
  Col,
  Statistic
} from 'antd';
import { ArrowLeftOutlined, FilePdfOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

import { journalEntriesApi } from '@/api/journalEntries';
import { chartOfAccountsApi } from '@/api/chartOfAccounts';
import type { LedgerEntry } from '@/types/journalEntry';
import { formatCurrency, formatDate } from '@/lib/utils';
import { usePageTitle } from '@/hooks/usePageTitle';

const { RangePicker } = DatePicker;

export default function LedgerView() {
  usePageTitle('Hesap Defteri');
  const navigate = useNavigate();
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().startOf('month'),
    dayjs()
  ]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Fetch accounts for selection
  const { data: accounts } = useQuery({
    queryKey: ['chartOfAccountsAll'],
    queryFn: () => chartOfAccountsApi.getAllNoPaging()
  });

  // Fetch ledger entries
  const { data: ledgerData, isLoading } = useQuery({
    queryKey: ['ledger', selectedAccountId, dateRange, page, pageSize],
    queryFn: () => journalEntriesApi.getLedger(selectedAccountId!, {
      startDate: dateRange[0].format('YYYY-MM-DD'),
      endDate: dateRange[1].format('YYYY-MM-DD'),
      page,
      pageSize
    }),
    enabled: !!selectedAccountId
  });

  // Get selected account details
  const selectedAccount = accounts?.find(a => a.id === selectedAccountId);

  const columns: ColumnsType<LedgerEntry> = [
    {
      title: 'Tarih',
      dataIndex: 'date',
      key: 'date',
      width: 110,
      render: (date: string) => formatDate(date)
    },
    {
      title: 'Kayıt No',
      dataIndex: 'entryNumber',
      key: 'entryNumber',
      width: 130,
      render: (num: string, record) => (
        <Button
          type="link"
          size="small"
          onClick={() => navigate(`/journal-entries/${record.journalEntryId}`)}
        >
          {num}
        </Button>
      )
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: 'Borç',
      dataIndex: 'debit',
      key: 'debit',
      width: 150,
      align: 'right',
      render: (debit: number) => (
        debit > 0 ? (
          <span className="text-blue-600 font-semibold">
            {formatCurrency(debit, 'TRY')}
          </span>
        ) : '-'
      )
    },
    {
      title: 'Alacak',
      dataIndex: 'credit',
      key: 'credit',
      width: 150,
      align: 'right',
      render: (credit: number) => (
        credit > 0 ? (
          <span className="text-green-600 font-semibold">
            {formatCurrency(credit, 'TRY')}
          </span>
        ) : '-'
      )
    },
    {
      title: 'Bakiye',
      dataIndex: 'balance',
      key: 'balance',
      width: 150,
      align: 'right',
      render: (balance: number) => (
        <span className={`font-semibold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
          {formatCurrency(Math.abs(balance), 'TRY')}
          {balance < 0 && ' (A)'}
        </span>
      )
    }
  ];

  // Calculate totals
  const totals = React.useMemo(() => {
    if (!ledgerData?.items) return { totalDebit: 0, totalCredit: 0, balance: 0 };

    let totalDebit = 0;
    let totalCredit = 0;

    ledgerData.items.forEach(entry => {
      totalDebit += entry.debit;
      totalCredit += entry.credit;
    });

    const balance = totalDebit - totalCredit;

    return { totalDebit, totalCredit, balance };
  }, [ledgerData?.items]);

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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hesap Defteri</h1>
            <p className="text-gray-600 mt-1">
              Hesap bazlı hareket görüntüleme ve bakiye takibi
            </p>
          </div>
          <Space>
            <Button 
              icon={<FilePdfOutlined />}
              disabled={!selectedAccountId}
            >
              PDF İndir
            </Button>
          </Space>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <div className="mb-2 text-sm text-gray-600">Hesap Seçin *</div>
            <Select
              className="w-full"
              showSearch
              placeholder="Hesap seçin"
              optionFilterProp="label"
              value={selectedAccountId}
              onChange={setSelectedAccountId}
              options={accounts?.filter(a => !a.isGroup).map(a => ({
                label: `${a.code} - ${a.name}`,
                value: a.id
              }))}
            />
          </Col>
          <Col xs={24} md={12}>
            <div className="mb-2 text-sm text-gray-600">Tarih Aralığı</div>
            <RangePicker
              className="w-full"
              value={dateRange}
              onChange={(dates) => dates && setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
              format="DD/MM/YYYY"
              presets={[
                { label: 'Bu Ay', value: [dayjs().startOf('month'), dayjs().endOf('month')] },
                { label: 'Son 3 Ay', value: [dayjs().subtract(3, 'months'), dayjs()] },
                { label: 'Bu Yıl', value: [dayjs().startOf('year'), dayjs().endOf('year')] }
              ]}
            />
          </Col>
        </Row>
      </Card>

      {/* Account Info & Summary */}
      {selectedAccount && (
        <Row gutter={16} className="mb-4">
          <Col xs={24} md={6}>
            <Card>
              <div className="text-gray-600 mb-2">Hesap</div>
              <div className="font-bold text-lg">{selectedAccount.code}</div>
              <div className="text-gray-700">{selectedAccount.name}</div>
            </Card>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Card>
              <Statistic
                title="Toplam Borç"
                value={totals.totalDebit}
                precision={2}
                suffix="TRY"
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Card>
              <Statistic
                title="Toplam Alacak"
                value={totals.totalCredit}
                precision={2}
                suffix="TRY"
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Card>
              <Statistic
                title="Bakiye"
                value={Math.abs(totals.balance)}
                precision={2}
                suffix={`TRY ${totals.balance < 0 ? '(A)' : ''}`}
                valueStyle={{ color: totals.balance >= 0 ? '#1890ff' : '#ff4d4f' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Ledger Table */}
      <Card>
        {selectedAccountId ? (
          <Table
            columns={columns}
            dataSource={ledgerData?.items || []}
            rowKey={(record) => `${record.journalEntryId}-${record.date}`}
            loading={isLoading}
            pagination={{
              current: page,
              pageSize,
              total: ledgerData?.totalCount || 0,
              showSizeChanger: true,
              showTotal: (total) => `Toplam ${total} hareket`,
              onChange: (page, pageSize) => {
                setPage(page);
                setPageSize(pageSize);
              }
            }}
          />
        ) : (
          <div className="text-center py-12 text-gray-500">
            Lütfen yukarıdan bir hesap seçin
          </div>
        )}
      </Card>
    </div>
  );
}

