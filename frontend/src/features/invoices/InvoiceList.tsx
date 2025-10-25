import { useRef, useState, useEffect } from 'react';
import { PageContainer, ProTable, ProCard } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { Button, Space, Modal, message, Tooltip, Statistic, Row, Col, Tag, DatePicker, Select, Input } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '@/utils/formatters';
import type { Invoice, InvoiceStatus } from '@/types/invoice';
import { getInvoices, deleteInvoice } from '@/services/invoiceService';
import dayjs from 'dayjs';

// Filtre tipleri
interface InvoiceFilters {
  searchTerm?: string;
  customerId?: string;
  isOfficial?: boolean;
  status?: InvoiceStatus;
  startDate?: string;
  endDate?: string;
}

// Sayfalama tipleri
interface PaginationState {
  current: number;
  pageSize: number;
  total: number;
}

// API sorgu parametreleri
interface InvoiceQueryParams {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  customerId?: string;
  isOfficial?: boolean;
  status?: InvoiceStatus;
  startDate?: string;
  endDate?: string;
}

/**
 * Fatura listesi sayfası - Gerçek API ile entegre edilmiş
 * Sayfalama, sıralama, filtreleme, arama ve CRUD işlemleri
 */
export const InvoiceList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const actionRef = useRef<ActionType>();
  
  // State yönetimi
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  
  // Sayfalama state'i
  const [pagination, setPagination] = useState<PaginationState>({
    current: 1,
    pageSize: 10,
    total: 0
  });
  
  // Filtre state'i
  const [filters, setFilters] = useState<InvoiceFilters>({
    searchTerm: undefined,
    customerId: undefined,
    isOfficial: undefined,
    status: undefined,
    startDate: undefined,
    endDate: undefined,
  });

  /**
   * API'den fatura listesini çek
   */
  const fetchInvoices = async () => {
    try {
      setLoading(true);
      
      // API parametrelerini hazırla
      const params: InvoiceQueryParams = {
        pageNumber: pagination.current,
        pageSize: pagination.pageSize,
        searchTerm: filters.searchTerm,
        customerId: filters.customerId,
        isOfficial: filters.isOfficial,
        status: filters.status,
        startDate: filters.startDate,
        endDate: filters.endDate,
      };
      
      // API çağrısı yap
      const response = await getInvoices(params);
      
      // State'leri güncelle
      setInvoices(response.items);
      setPagination({
        ...pagination,
        total: response.totalCount,
      });
      
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      message.error(error.message || t('invoice.errors.loadFailed'));
      console.error('❌ Fatura listesi hatası:', error);
    }
  };

  /**
   * Sayfa yüklendiğinde faturaları çek
   */
  useEffect(() => {
    fetchInvoices();
  }, []);

  /**
   * Filtreler veya sayfalama değiştiğinde yeniden çek
   */
  useEffect(() => {
    fetchInvoices();
  }, [pagination.current, pagination.pageSize, filters]);

  /**
   * Fatura silme işlemi
   */
  const handleDelete = async (id: string) => {
    try {
      await deleteInvoice(id);
      message.success(t('invoice.messages.deleteSuccess'));
      fetchInvoices(); // Listeyi yenile
    } catch (error: any) {
      message.error(error.message || t('invoice.errors.deleteFailed'));
    }
  };

  /**
   * Fatura silme onayı
   */
  const confirmDelete = (invoice: Invoice) => {
    Modal.confirm({
      title: t('invoice.messages.deleteConfirmTitle'),
      content: t('invoice.messages.deleteConfirmContent'),
      okText: t('invoice.confirmModal.okText'),
      okType: 'danger',
      cancelText: t('invoice.confirmModal.cancelText'),
      onOk: () => handleDelete(invoice.id),
    });
  };

  /**
   * Filtre değişikliği
   */
  const handleFilterChange = (key: string, value: any) => {
    setFilters({
      ...filters,
      [key]: value,
    });
    // Pagination'ı resetle
    setPagination({
      ...pagination,
      current: 1,
    });
  };

  /**
   * Filtreleri temizle
   */
  const handleResetFilters = () => {
    setFilters({
      searchTerm: undefined,
      customerId: undefined,
      isOfficial: undefined,
      status: undefined,
      startDate: undefined,
      endDate: undefined,
    });
    setPagination({
      ...pagination,
      current: 1,
    });
  };

  /**
   * Sayfa değişikliği
   */
  const handleTableChange = (newPagination: any) => {
    setPagination({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
      total: pagination.total,
    });
  };

  /**
   * Durum badge renkleri
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'default';
      case 'sent':
        return 'processing';
      case 'paid':
        return 'success';
      case 'overdue':
        return 'error';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  /**
   * ProTable kolonları - gerçek API verileri ile
   */
  const columns: ProColumns<Invoice>[] = [
    {
      title: t('invoice.labels.invoiceNumber'),
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      width: 140,
      fixed: 'left',
      copyable: true,
      render: (_, record) => (
        <Space>
          <FileTextOutlined />
          <a onClick={() => navigate(`/invoices/${record.id}`)}>
            {record.invoiceNumber}
          </a>
        </Space>
      )
    },
    {
      title: t('invoice.labels.invoiceDate'),
      dataIndex: 'invoiceDate',
      key: 'invoiceDate',
      width: 120,
      valueType: 'date',
      sorter: true,
      render: (_, record) => dayjs(record.invoiceDate).format('DD.MM.YYYY')
    },
    {
      title: t('invoice.labels.customer'),
      dataIndex: 'partnerName',
      key: 'partnerName',
      width: 200,
      ellipsis: true,
      copyable: true
    },
    {
      title: t('invoice.labels.invoiceType'),
      dataIndex: 'invoiceType',
      key: 'invoiceType',
      width: 120,
      valueType: 'select',
      valueEnum: {
        SALES: { text: t('invoice.type.sales'), status: 'Success' },
        PURCHASE: { text: t('invoice.type.purchase'), status: 'Processing' }
      },
      filters: true
    },
    {
      title: t('invoice.labels.official'),
      dataIndex: 'isOfficial',
      key: 'isOfficial',
      width: 120,
      align: 'center',
      valueType: 'select',
      valueEnum: {
        true: { text: t('invoice.labels.official'), status: 'Success' },
        false: { text: t('invoice.labels.unofficial'), status: 'Default' }
      },
      render: (_, record) => (
        <Tag color="default">
          {record.invoiceType === 'sales' ? t('invoice.type.sales') : t('invoice.type.purchase')}
        </Tag>
      )
    },
    {
      title: t('invoice.labels.subtotal'),
      dataIndex: 'subtotal',
      key: 'subtotal',
      width: 130,
      align: 'right',
      valueType: 'money',
      sorter: true,
      render: (_, record) => formatCurrency(record.subtotal)
    },
    {
      title: t('invoice.labels.taxRate'),
      dataIndex: 'taxAmount',
      key: 'taxAmount',
      width: 120,
      align: 'right',
      valueType: 'money',
      render: (_, record) => formatCurrency(record.taxAmount)
    },
    {
      title: t('invoice.labels.grandTotal'),
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 140,
      align: 'right',
      valueType: 'money',
      sorter: true,
      render: (_, record) => (
        <strong style={{ color: '#1890ff' }}>
          {formatCurrency(record.totalAmount || 0)}
        </strong>
      )
    },
    {
      title: t('invoice.labels.status'),
      dataIndex: 'status',
      key: 'status',
      width: 120,
      align: 'center',
      valueType: 'select',
      valueEnum: {
        draft: { text: t('invoice.status.draft'), status: 'Default' },
        sent: { text: t('invoice.status.pending'), status: 'Processing' },
        paid: { text: t('invoice.status.paid'), status: 'Success' },
        overdue: { text: t('invoice.status.overdue'), status: 'Error' },
        cancelled: { text: t('invoice.status.cancelled'), status: 'Default' }
      },
      filters: true,
      render: (_, record) => (
        <Tag color={getStatusColor(record.status)}>
          {t(`invoice.status.${record.status}`)}
        </Tag>
      )
    },
    {
      title: t('invoice.table.actions'),
      key: 'actions',
      width: 150,
      fixed: 'right',
      align: 'center',
      valueType: 'option',
      render: (_, record) => [
        <Tooltip key="view" title={t('invoice.buttons.edit')}>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/invoices/${record.id}`)}
          />
        </Tooltip>,
        <Tooltip key="edit" title={t('invoice.buttons.edit')}>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => navigate(`/invoices/${record.id}/edit`)}
          />
        </Tooltip>,
        <Tooltip key="delete" title={t('invoice.buttons.delete')}>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => confirmDelete(record)}
          />
        </Tooltip>
      ]
    }
  ];

  /**
   * Toplu işlemler için toolbar
   */
  const toolBarRender = () => [
    <Button
      key="add"
      type="primary"
      icon={<PlusOutlined />}
      onClick={() => navigate('/invoices/create')}
    >
      {t('invoice.buttons.new')}
    </Button>,
    <Button
      key="refresh"
      icon={<ReloadOutlined />}
      onClick={fetchInvoices}
    >
      {t('invoice.buttons.reload')}
    </Button>
  ];

  /**
   * Seçili satırlar için toplu işlem menüsü
   */
  const tableAlertOptionRender = () => (
    <Space size={16}>
      <Button type="link" onClick={() => console.log('Toplu onayla')}>
        Toplu Onayla
      </Button>
      <Button type="link" onClick={() => console.log('Toplu sil')}>
        Toplu Sil
      </Button>
    </Space>
  );

  return (
    <PageContainer
      header={{
        title: t('invoice.title'),
        subTitle: t('invoice.subtitle'),
        breadcrumb: {
          items: [
            { title: t('menu.dashboard') },
            { title: t('menu.invoices') },
            { title: t('menu.invoiceList') }
          ]
        }
      }}
      extra={[
        <Button
          key="export"
          onClick={() => console.log('Export')}
        >
          Dışa Aktar
        </Button>
      ]}
    >
      {/* Özet İstatistikler */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <ProCard>
            <Statistic
              title={t('invoice.statistics.total')}
              value={pagination.total}
              prefix={<FileTextOutlined />}
            />
          </ProCard>
        </Col>
        <Col span={6}>
          <ProCard>
            <Statistic
              title={t('invoice.statistics.totalAmount')}
              value={invoices.reduce((sum, invoice) => sum + (invoice.totalAmount || 0), 0)}
              precision={2}
              prefix="₺"
              valueStyle={{ color: '#3f8600' }}
            />
          </ProCard>
        </Col>
        <Col span={6}>
          <ProCard>
            <Statistic
              title={t('invoice.statistics.pending')}
              value={invoices.filter(inv => inv.status === 'sent').length}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </ProCard>
        </Col>
        <Col span={6}>
          <ProCard>
          <Statistic
            title={t('invoice.statistics.paid')}
            value={invoices.filter(inv => inv.status === 'paid').length}
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
        </ProCard>
        </Col>
      </Row>

      {/* Filtreler */}
      <ProCard style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Input
              placeholder={t('invoice.placeholders.search')}
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              prefix={<SearchOutlined />}
              allowClear
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder={t('invoice.labels.status')}
              value={filters.status}
              onChange={(value) => handleFilterChange('status', value)}
              allowClear
              style={{ width: '100%' }}
            >
              <Select.Option value="draft">{t('invoice.status.draft')}</Select.Option>
              <Select.Option value="sent">{t('invoice.status.pending')}</Select.Option>
              <Select.Option value="paid">{t('invoice.status.paid')}</Select.Option>
              <Select.Option value="overdue">{t('invoice.status.overdue')}</Select.Option>
              <Select.Option value="cancelled">{t('invoice.status.cancelled')}</Select.Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder={t('invoice.labels.invoiceType')}
              value={filters.isOfficial}
              onChange={(value) => handleFilterChange('isOfficial', value)}
              allowClear
              style={{ width: '100%' }}
            >
              <Select.Option value={true}>{t('invoice.labels.official')}</Select.Option>
              <Select.Option value={false}>{t('invoice.labels.unofficial')}</Select.Option>
            </Select>
          </Col>
          <Col span={5}>
            <DatePicker.RangePicker
              placeholder={[t('invoice.filters.startDate'), t('invoice.filters.endDate')]}
              onChange={(dates) => {
                if (dates) {
                  handleFilterChange('startDate', dates[0]?.format('YYYY-MM-DD'));
                  handleFilterChange('endDate', dates[1]?.format('YYYY-MM-DD'));
                } else {
                  handleFilterChange('startDate', undefined);
                  handleFilterChange('endDate', undefined);
                }
              }}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={5}>
            <Space>
              <Button onClick={handleResetFilters}>
                {t('invoice.buttons.reset')}
              </Button>
              <Button type="primary" onClick={fetchInvoices}>
                {t('invoice.buttons.search')}
              </Button>
            </Space>
          </Col>
        </Row>
      </ProCard>

      {/* Gelişmiş Tablo */}
      <ProTable<Invoice>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        dataSource={invoices}
        loading={loading}
        rowKey="id"
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => t('invoice.table.showTotal', { total }),
        }}
        onChange={handleTableChange}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys
        }}
        tableAlertRender={({ selectedRowKeys }) => (
          <Space size={24}>
            <span>
              Seçili {selectedRowKeys.length} öğe
            </span>
          </Space>
        )}
        tableAlertOptionRender={tableAlertOptionRender}
        toolBarRender={toolBarRender}
        scroll={{ x: 1500 }}
        sticky
        options={{
          reload: true,
          density: true,
          setting: true
        }}
        dateFormatter="string"
        headerTitle={t('invoice.title')}
      />
    </PageContainer>
  );
};

export default InvoiceList;