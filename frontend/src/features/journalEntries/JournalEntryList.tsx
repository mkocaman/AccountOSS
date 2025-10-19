import { useState } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Input, 
  Select, 
  DatePicker,
  Space, 
  Tag,
  Row,
  Col,
  message,
  Dropdown
} from 'antd';
import type { MenuProps } from 'antd';
import { 
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
  MoreOutlined,
  BookOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

import { journalEntriesApi } from '@/api/journalEntries';
import { chartOfAccountsApi } from '@/api/chartOfAccounts';
import type { JournalEntry, JournalEntryFilters } from '@/types/journalEntry';
import { 
  JournalEntryType,
  JournalEntryStatus,
  journalEntryTypeLabels,
  journalEntryTypeColors,
  journalEntryStatusLabels,
  journalEntryStatusColors
} from '@/types/journalEntry';
import { formatCurrency, formatDate } from '@/lib/utils';
import { usePageTitle } from '@/hooks/usePageTitle';
import { showConfirm } from '@/components/ui/ConfirmModal';

const { Search } = Input;
const { RangePicker } = DatePicker;

export default function JournalEntryList() {
  usePageTitle('Yevmiye Kayıtları');
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<JournalEntryFilters>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Fetch entries
  const { data, isLoading } = useQuery({
    queryKey: ['journalEntries', filters, page, pageSize],
    queryFn: () => journalEntriesApi.getAll({ ...filters, page, pageSize })
  });

  // Fetch accounts for filter
  const { data: accounts } = useQuery({
    queryKey: ['chartOfAccountsAll'],
    queryFn: () => chartOfAccountsApi.getAllNoPaging()
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => journalEntriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
      message.success('Kayıt silindi');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Silme başarısız');
    }
  });

  // Post mutation
  const postMutation = useMutation({
    mutationFn: (id: string) => journalEntriesApi.post(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
      queryClient.invalidateQueries({ queryKey: ['chartOfAccounts'] });
      message.success('Kayıt kesinleştirildi');
    }
  });

  // Reverse mutation
  const reverseMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => 
      journalEntriesApi.reverse(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
      queryClient.invalidateQueries({ queryKey: ['chartOfAccounts'] });
      message.success('Kayıt iptal edildi');
    }
  });

  // Table columns
  const columns: ColumnsType<JournalEntry> = [
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      align: 'center',
      render: (status: JournalEntryStatus, record) => (
        <Space direction="vertical" size={2}>
          <Tag color={journalEntryStatusColors[status]}>
            {journalEntryStatusLabels[status]}
          </Tag>
          {!record.isBalanced && status === JournalEntryStatus.Draft && (
            <Tag color="red">Dengesiz</Tag>
          )}
        </Space>
      )
    },
    {
      title: 'Kayıt No',
      dataIndex: 'entryNumber',
      key: 'entryNumber',
      width: 130,
      fixed: 'left',
      render: (num: string) => (
        <span className="font-mono font-semibold">{num}</span>
      )
    },
    {
      title: 'Tarih',
      dataIndex: 'entryDate',
      key: 'entryDate',
      width: 110,
      render: (date: string) => formatDate(date),
      sorter: true
    },
    {
      title: 'Tip',
      dataIndex: 'entryType',
      key: 'entryType',
      width: 120,
      render: (type: JournalEntryType) => (
        <Tag color={journalEntryTypeColors[type]}>
          {journalEntryTypeLabels[type]}
        </Tag>
      )
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (desc: string, record) => (
        <div>
          <div>{desc}</div>
          {record.reference && (
            <div className="text-xs text-gray-500">Ref: {record.reference}</div>
          )}
          {record.sourceModule && (
            <div className="text-xs text-blue-500">
              Kaynak: {record.sourceModule}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Satır Sayısı',
      key: 'lineCount',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Tag color="blue">{record.lines.length}</Tag>
      )
    },
    {
      title: 'Borç',
      dataIndex: 'totalDebit',
      key: 'totalDebit',
      width: 130,
      align: 'right',
      render: (total: number) => (
        <span className="text-blue-600 font-semibold">
          {formatCurrency(total, 'TRY')}
        </span>
      ),
      sorter: true
    },
    {
      title: 'Alacak',
      dataIndex: 'totalCredit',
      key: 'totalCredit',
      width: 130,
      align: 'right',
      render: (total: number) => (
        <span className="text-green-600 font-semibold">
          {formatCurrency(total, 'TRY')}
        </span>
      ),
      sorter: true
    },
    {
      title: 'Oluşturan',
      key: 'creator',
      width: 120,
      render: (_, record) => record.createdByUser?.name || '-'
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => {
        const menuItems: MenuProps['items'] = [
          {
            key: 'view',
            icon: <EyeOutlined />,
            label: 'Detay',
            onClick: () => navigate(`/journal-entries/${record.id}`)
          }
        ];

        if (record.status === JournalEntryStatus.Draft) {
          menuItems.push(
            {
              key: 'edit',
              icon: <EditOutlined />,
              label: 'Düzenle',
              onClick: () => navigate(`/journal-entries/edit/${record.id}`)
            },
            {
              key: 'post',
              icon: <CheckOutlined />,
              label: 'Kesinleştir',
              disabled: !record.isBalanced,
              onClick: () => handlePost(record)
            },
            {
              type: 'divider'
            },
            {
              key: 'delete',
              icon: <DeleteOutlined />,
              label: 'Sil',
              danger: true,
              onClick: () => handleDelete(record)
            }
          );
        }

        if (record.status === JournalEntryStatus.Posted) {
          menuItems.push({
            key: 'reverse',
            icon: <CloseOutlined />,
            label: 'İptal Et',
            danger: true,
            onClick: () => handleReverse(record)
          });
        }

        return (
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <Button size="small" icon={<MoreOutlined />} />
          </Dropdown>
        );
      }
    }
  ];

  const handlePost = (entry: JournalEntry) => {
    showConfirm({
      title: 'Kaydı Kesinleştir',
      content: `${entry.entryNumber} kaydını kesinleştirmek istediğinize emin misiniz? Bu işlem geri alınamaz.`,
      onOk: async () => {
        await postMutation.mutateAsync(entry.id);
      }
    });
  };

  const handleReverse = (entry: JournalEntry) => {
    const reason = prompt('İptal nedeni:');
    if (reason) {
      reverseMutation.mutate({ id: entry.id, reason });
    }
  };

  const handleDelete = (entry: JournalEntry) => {
    showConfirm({
      title: 'Kaydı Sil',
      content: `${entry.entryNumber} kaydını silmek istediğinize emin misiniz?`,
      okType: 'danger',
      onOk: async () => {
        await deleteMutation.mutateAsync(entry.id);
      }
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Yevmiye Kayıtları</h1>
            <p className="text-gray-600 mt-1">
              Muhasebe defteri ve kayıt yönetimi
            </p>
          </div>
          <Space>
            <Button
              icon={<BookOutlined />}
              onClick={() => navigate('/journal-entries/ledger')}
            >
              Hesap Defteri
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={() => navigate('/journal-entries/new')}
            >
              Yeni Kayıt
            </Button>
          </Space>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <Row gutter={16}>
          <Col xs={24} sm={12} md={5}>
            <div className="mb-2 text-sm text-gray-600">Hesap</div>
            <Select
              className="w-full"
              placeholder="Tüm hesaplar"
              allowClear
              showSearch
              optionFilterProp="label"
              value={filters.accountId}
              onChange={(value) => setFilters({ ...filters, accountId: value })}
              options={accounts?.map(a => ({
                label: `${a.code} - ${a.name}`,
                value: a.id
              }))}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <div className="mb-2 text-sm text-gray-600">Tip</div>
            <Select
              className="w-full"
              placeholder="Tüm tipler"
              allowClear
              value={filters.entryType}
              onChange={(value) => setFilters({ ...filters, entryType: value })}
              options={Object.entries(journalEntryTypeLabels).map(([value, label]) => ({
                label,
                value: Number(value)
              }))}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <div className="mb-2 text-sm text-gray-600">Durum</div>
            <Select
              className="w-full"
              placeholder="Tüm durumlar"
              allowClear
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
              options={[
                { label: 'Taslak', value: JournalEntryStatus.Draft },
                { label: 'Kesinleşmiş', value: JournalEntryStatus.Posted },
                { label: 'İptal Edilmiş', value: JournalEntryStatus.Reversed }
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={7}>
            <div className="mb-2 text-sm text-gray-600">Tarih Aralığı</div>
            <RangePicker
              className="w-full"
              value={[
                filters.dateFrom ? dayjs(filters.dateFrom) : null,
                filters.dateTo ? dayjs(filters.dateTo) : null
              ]}
              onChange={(dates) => {
                setFilters({
                  ...filters,
                  dateFrom: dates?.[0]?.format('YYYY-MM-DD'),
                  dateTo: dates?.[1]?.format('YYYY-MM-DD')
                });
              }}
              presets={[
                { label: 'Bu Ay', value: [dayjs().startOf('month'), dayjs().endOf('month')] },
                { label: 'Son 3 Ay', value: [dayjs().subtract(3, 'months'), dayjs()] },
                { label: 'Bu Yıl', value: [dayjs().startOf('year'), dayjs().endOf('year')] }
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <div className="mb-2 text-sm text-gray-600">Ara</div>
            <Search
              placeholder="Kayıt no, açıklama..."
              allowClear
              onSearch={(value) => setFilters({ ...filters, search: value })}
            />
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={data?.items || []}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 1600 }}
          pagination={{
            current: page,
            pageSize,
            total: data?.totalCount || 0,
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} kayıt`,
            onChange: (page, pageSize) => {
              setPage(page);
              setPageSize(pageSize);
            }
          }}
        />
      </Card>
    </div>
  );
}

