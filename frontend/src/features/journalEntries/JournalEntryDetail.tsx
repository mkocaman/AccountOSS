import { 
  Card, 
  Descriptions, 
  Table,
  Button, 
  Space, 
  Tag,
  Spin,
  message,
  Alert
} from 'antd';
import { 
  ArrowLeftOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ColumnsType } from 'antd/es/table';

import { journalEntriesApi } from '@/api/journalEntries';
import { 
  JournalEntryStatus,
  journalEntryStatusLabels,
  journalEntryStatusColors,
  journalEntryTypeLabels,
  journalEntryTypeColors
} from '@/types/journalEntry';
import type { JournalEntryLine } from '@/types/journalEntry';
import { formatCurrency, formatDate } from '@/lib/utils';
import { usePageTitle } from '@/hooks/usePageTitle';
import { showConfirm } from '@/components/ui/ConfirmModal';

export default function JournalEntryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch entry
  const { data: entry, isLoading } = useQuery({
    queryKey: ['journalEntry', id],
    queryFn: () => journalEntriesApi.getById(id!),
    enabled: !!id
  });

  usePageTitle(entry ? `${entry.entryNumber} - Yevmiye Kaydı` : 'Yevmiye Kaydı');

  // Post mutation
  const postMutation = useMutation({
    mutationFn: (id: string) => journalEntriesApi.post(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journalEntry', id] });
      queryClient.invalidateQueries({ queryKey: ['chartOfAccounts'] });
      message.success('Kayıt kesinleştirildi');
    }
  });

  // Reverse mutation
  const reverseMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => 
      journalEntriesApi.reverse(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journalEntry', id] });
      queryClient.invalidateQueries({ queryKey: ['chartOfAccounts'] });
      message.success('Kayıt iptal edildi');
    }
  });

  const handlePost = () => {
    showConfirm({
      title: 'Kaydı Kesinleştir',
      content: `${entry?.entryNumber} kaydını kesinleştirmek istediğinize emin misiniz? Bu işlem geri alınamaz.`,
      onOk: async () => {
        await postMutation.mutateAsync(id!);
      }
    });
  };

  const handleReverse = () => {
    const reason = prompt('İptal nedeni:');
    if (reason) {
      reverseMutation.mutate({ id: id!, reason });
    }
  };

  // Line columns
  const lineColumns: ColumnsType<JournalEntryLine> = [
    {
      title: '#',
      dataIndex: 'lineNumber',
      width: 50
    },
    {
      title: 'Hesap Kodu',
      key: 'accountCode',
      width: 120,
      render: (_, record) => (
        <span className="font-mono font-semibold">{record.account?.code}</span>
      )
    },
    {
      title: 'Hesap Adı',
      key: 'accountName',
      render: (_, record) => record.account?.name
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      ellipsis: true,
      render: (desc) => desc || '-'
    },
    {
      title: 'Borç',
      dataIndex: 'debit',
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
      title: 'Referans',
      dataIndex: 'reference',
      width: 100,
      render: (ref) => ref || '-'
    }
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">Kayıt bulunamadı</div>
            <Button type="primary" onClick={() => navigate('/journal-entries')} className="mt-4">
              Yevmiye Listesine Dön
            </Button>
          </div>
        </Card>
      </div>
    );
  }

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
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {entry.entryNumber}
            </h1>
            <h2 className="text-lg text-gray-700 mb-2">{entry.description}</h2>
            <Space>
              <Tag color={journalEntryStatusColors[entry.status]} className="text-base px-3 py-1">
                {journalEntryStatusLabels[entry.status]}
              </Tag>
              <Tag color={journalEntryTypeColors[entry.entryType]} className="text-base px-3 py-1">
                {journalEntryTypeLabels[entry.entryType]}
              </Tag>
              {entry.isBalanced ? (
                <Tag color="green" className="text-base px-3 py-1">✓ Dengede</Tag>
              ) : (
                <Tag color="red" className="text-base px-3 py-1">✗ Dengesiz</Tag>
              )}
            </Space>
          </div>

          <Space>
            {entry.status === JournalEntryStatus.Draft && (
              <>
                <Button
                  icon={<EditOutlined />}
                  onClick={() => navigate(`/journal-entries/edit/${entry.id}`)}
                >
                  Düzenle
                </Button>
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={handlePost}
                  loading={postMutation.isPending}
                  disabled={!entry.isBalanced}
                >
                  Kesinleştir
                </Button>
              </>
            )}
            {entry.status === JournalEntryStatus.Posted && (
              <Button
                danger
                icon={<CloseOutlined />}
                onClick={handleReverse}
                loading={reverseMutation.isPending}
              >
                İptal Et
              </Button>
            )}
          </Space>
        </div>
      </div>

      {/* Posted Info */}
      {entry.isPosted && entry.postedByUser && (
        <Alert
          message="Kayıt Kesinleştirildi"
          description={
            <div>
              <div>Kesinleştiren: {entry.postedByUser.name}</div>
              <div>Tarih: {formatDate(entry.postedDate!)}</div>
            </div>
          }
          type="success"
          showIcon
          className="mb-4"
        />
      )}

      {/* Reversal Info */}
      {entry.isReversed && entry.reversalEntryId && (
        <Alert
          message="Kayıt İptal Edildi"
          description={
            <div>
              İptal Kaydı: <Button 
                type="link" 
                size="small" 
                onClick={() => navigate(`/journal-entries/${entry.reversalEntryId}`)}
              >
                Görüntüle
              </Button>
            </div>
          }
          type="error"
          showIcon
          className="mb-4"
        />
      )}

      {/* Entry Info */}
      <Card title="Kayıt Bilgileri" className="mb-4">
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 2 }}>
          <Descriptions.Item label="Kayıt No">{entry.entryNumber}</Descriptions.Item>
          <Descriptions.Item label="Durum">
            <Tag color={journalEntryStatusColors[entry.status]}>
              {journalEntryStatusLabels[entry.status]}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Tarih">{formatDate(entry.entryDate)}</Descriptions.Item>
          <Descriptions.Item label="Kayıt Tipi">
            <Tag color={journalEntryTypeColors[entry.entryType]}>
              {journalEntryTypeLabels[entry.entryType]}
            </Tag>
          </Descriptions.Item>
          {entry.reference && (
            <Descriptions.Item label="Referans">{entry.reference}</Descriptions.Item>
          )}
          {entry.sourceModule && (
            <Descriptions.Item label="Kaynak Modül">
              <Tag color="blue">{entry.sourceModule}</Tag>
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Borç Toplamı">
            <span className="font-semibold text-blue-600">
              {formatCurrency(entry.totalDebit, 'TRY')}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="Alacak Toplamı">
            <span className="font-semibold text-green-600">
              {formatCurrency(entry.totalCredit, 'TRY')}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="Denge Durumu">
            {entry.isBalanced ? (
              <Tag color="green">✓ Dengede</Tag>
            ) : (
              <Tag color="red">✗ Dengesiz</Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Oluşturan">
            {entry.createdByUser?.name || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Oluşturma Tarihi">
            {formatDate(entry.createdAt)}
          </Descriptions.Item>
          {entry.description && (
            <Descriptions.Item label="Açıklama" span={2}>
              {entry.description}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* Lines Table */}
      <Card title="Kayıt Satırları">
        <Table
          columns={lineColumns}
          dataSource={entry.lines}
          rowKey="id"
          pagination={false}
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={4}>
                  <strong className="text-lg">TOPLAM</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4} align="right">
                  <strong className="text-lg text-blue-600">
                    {formatCurrency(entry.totalDebit, 'TRY')}
                  </strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={5} align="right">
                  <strong className="text-lg text-green-600">
                    {formatCurrency(entry.totalCredit, 'TRY')}
                  </strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={6} />
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </Card>
    </div>
  );
}

