import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Tag, 
  Button, 
  Space, 
  DatePicker, 
  Select,
  Input,
  Row,
  Col,
  Statistic,
  message
} from 'antd';
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  DollarOutlined,
  SyncOutlined 
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

import { grQueueApi } from '@/api/grQueue';
import { GrQueueStatus, grQueueStatusLabels, grQueueStatusColors } from '@/types/grQueue';
import type { GrQueueEntry, GrQueueFilters } from '@/types/grQueue';
import GrClearanceModal from './components/GrClearanceModal';

const { RangePicker } = DatePicker;

// GR Kuyruk listesi sayfası
export const GrQueueList = () => {
  const [grQueueEntries, setGrQueueEntries] = useState<GrQueueEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<GrQueueFilters>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [selectedEntry, setSelectedEntry] = useState<GrQueueEntry | null>(null);
  const [clearanceModalOpen, setClearanceModalOpen] = useState(false);
  const [stats, setStats] = useState({
    totalWaiting: 0,
    totalWaitingAmount: 0,
    totalPartial: 0,
    totalCleared: 0
  });

  useEffect(() => {
    loadGrQueueEntries();
    loadStats();
  }, [filters, page, pageSize]);

  const loadGrQueueEntries = async () => {
    setLoading(true);
    try {
      const response = await grQueueApi.getAll({ ...filters, page, pageSize });
      if (response.success) {
        setGrQueueEntries(response.data.items);
        setTotalCount(response.data.totalCount);
      }
    } catch (error) {
      message.error('GR kuyruk kayıtları yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await grQueueApi.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('İstatistikler yüklenemedi');
    }
  };

  const handleClearClick = (entry: GrQueueEntry) => {
    setSelectedEntry(entry);
    setClearanceModalOpen(true);
  };

  const handleViewDetails = (entry: GrQueueEntry) => {
    message.info('Detay sayfası yakında eklenecek');
  };

  const handleClearanceSuccess = () => {
    setClearanceModalOpen(false);
    setSelectedEntry(null);
    loadGrQueueEntries();
    loadStats();
    message.success('Aklama işlemi başarıyla tamamlandı');
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${amount.toFixed(2)} ${currency}`;
  };

  const formatDate = (date: string) => {
    return dayjs(date).format('DD.MM.YYYY');
  };

  // Table columns
  const columns: ColumnsType<GrQueueEntry> = [
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: GrQueueStatus) => (
        <Tag color={grQueueStatusColors[status]}>
          {grQueueStatusLabels[status]}
        </Tag>
      ),
      filters: [
        { text: 'Bekliyor', value: GrQueueStatus.Waiting },
        { text: 'Kısmi', value: GrQueueStatus.Partial },
        { text: 'Aklandı', value: GrQueueStatus.Cleared }
      ]
    },
    {
      title: 'Tarih',
      dataIndex: 'entryDate',
      key: 'entryDate',
      width: 120,
      render: (date: string) => formatDate(date),
      sorter: true
    },
    {
      title: 'Gayriresmi Fatura',
      dataIndex: ['unofficialInvoice', 'invoiceNumber'],
      key: 'invoiceNumber',
      width: 150
    },
    {
      title: 'Müşteri',
      dataIndex: ['unofficialInvoice', 'customer', 'name'],
      key: 'customerName',
      ellipsis: true
    },
    {
      title: 'Para Birimi',
      dataIndex: 'currency',
      key: 'currency',
      width: 100,
      align: 'center'
    },
    {
      title: 'Orijinal Tutar',
      dataIndex: 'originalAmount',
      key: 'originalAmount',
      width: 150,
      align: 'right',
      render: (amount: number, record) => formatCurrency(amount, record.currency)
    },
    {
      title: 'Kalan Tutar',
      dataIndex: 'remainingAmount',
      key: 'remainingAmount',
      width: 150,
      align: 'right',
      render: (amount: number, record) => (
        <span className={amount > 0 ? 'text-red-600 font-semibold' : 'text-green-600'}>
          {formatCurrency(amount, record.currency)}
        </span>
      )
    },
    {
      title: 'Aklamalar',
      dataIndex: 'clearances',
      key: 'clearances',
      width: 100,
      align: 'center',
      render: (clearances: any[]) => (
        <Tag color="blue">{clearances?.length || 0}</Tag>
      )
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            disabled={record.status === GrQueueStatus.Cleared}
            onClick={() => handleClearClick(record)}
          >
            Akla
          </Button>
          <Button
            size="small"
            onClick={() => handleViewDetails(record)}
          >
            Detay
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">GR Kuyruğu</h1>
        <p className="text-gray-600 mt-1">
          Gayriresmi satışların resmileştirilme (aklama) yönetimi
        </p>
      </div>

      {/* Statistics */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Bekleyen"
              value={stats.totalWaiting}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Kısmi"
              value={stats.totalPartial}
              prefix={<SyncOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Aklandı"
              value={stats.totalCleared}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Toplam Bekleyen Tutar"
              value={stats.totalWaitingAmount}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4">
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Durum"
              allowClear
              className="w-full"
              onChange={(value) => setFilters({ ...filters, status: value })}
              options={[
                { label: 'Bekliyor', value: GrQueueStatus.Waiting },
                { label: 'Kısmi', value: GrQueueStatus.Partial },
                { label: 'Aklandı', value: GrQueueStatus.Cleared }
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <RangePicker
              className="w-full"
              placeholder={['Başlangıç', 'Bitiş']}
              onChange={(dates) => {
                setFilters({
                  ...filters,
                  dateFrom: dates?.[0]?.format('YYYY-MM-DD'),
                  dateTo: dates?.[1]?.format('YYYY-MM-DD')
                });
              }}
            />
          </Col>
          <Col xs={24} sm={12} md={5}>
            <Input
              placeholder="Min tutar"
              type="number"
              onChange={(e) => setFilters({ ...filters, minAmount: Number(e.target.value) })}
            />
          </Col>
          <Col xs={24} sm={12} md={5}>
            <Input
              placeholder="Max tutar"
              type="number"
              onChange={(e) => setFilters({ ...filters, maxAmount: Number(e.target.value) })}
            />
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={grQueueEntries}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            current: page,
            pageSize,
            total: totalCount,
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} kayıt`,
            onChange: (page, pageSize) => {
              setPage(page);
              setPageSize(pageSize);
            }
          }}
        />
      </Card>

      {/* Clearance Modal */}
      {selectedEntry && (
        <GrClearanceModal
          open={clearanceModalOpen}
          grQueueEntry={selectedEntry}
          onCancel={() => {
            setClearanceModalOpen(false);
            setSelectedEntry(null);
          }}
          onSuccess={handleClearanceSuccess}
        />
      )}
    </div>
  );
};
