import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageContainer, ProTable, ProCard } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { Button, Space, Modal, Tooltip, Statistic, Row, Col, App } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '@/utils/formatters';
import type { Invoice } from '@/types/invoice';

/**
 * Fatura listesi sayfası - ProTable ile gelişmiş tablo özellikleri
 * Sayfalama, sıralama, filtreleme, arama otomatik yönetilir
 */
export const InvoiceList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const actionRef = useRef<ActionType>();
  const { message } = App.useApp();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // Fatura silme mutation'ı - Mock implementation
  const deleteInvoice = {
    mutateAsync: async (id: string) => {
      console.log('Delete invoice:', id);
      return Promise.resolve();
    }
  };

  /**
   * Fatura silme onayı
   */
  const handleDelete = (invoice: Invoice) => {
    Modal.confirm({
      title: t('invoices.deleteConfirmTitle'),
      content: t('invoices.deleteConfirmMessage', { number: invoice.invoiceNumber }),
      okText: t('common.yes'),
      cancelText: t('common.no'),
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteInvoice.mutateAsync(invoice.id);
          message.success(t('invoices.deleteSuccess'));
          actionRef.current?.reload(); // Tabloyu yenile
        } catch (error) {
          message.error(t('invoices.deleteError'));
        }
      }
    });
  };

  /**
   * ProTable kolonları - gelişmiş özelliklerde
   */
  const columns: ProColumns<Invoice>[] = [
    {
      title: t('invoices.columns.invoiceNumber'),
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      width: 140,
      fixed: 'left',
      copyable: true, // Kopyalama butonu otomatik eklenir
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
      title: t('invoices.columns.date'),
      dataIndex: 'invoiceDate',
      key: 'invoiceDate',
      width: 120,
      valueType: 'date', // ProTable otomatik tarih formatlar
      sorter: true
    },
    {
      title: t('invoices.columns.partner'),
      dataIndex: 'partnerName',
      key: 'partnerName',
      width: 200,
      ellipsis: true,
      copyable: true
    },
    {
      title: t('invoices.columns.type'),
      dataIndex: 'invoiceType',
      key: 'invoiceType',
      width: 120,
      valueType: 'select',
      valueEnum: {
        SALES: { text: t('invoices.types.sales'), status: 'Success' },
        PURCHASE: { text: t('invoices.types.purchase'), status: 'Processing' }
      },
      filters: true // Filtre otomatik eklenir
    },
    {
      title: t('invoices.columns.isOfficial'),
      dataIndex: 'isOfficial',
      key: 'isOfficial',
      width: 120,
      align: 'center',
      valueType: 'select',
      valueEnum: {
        true: { text: t('invoices.official'), status: 'Success' },
        false: { text: t('invoices.unofficial'), status: 'Default' }
      }
    },
    {
      title: t('invoices.columns.subtotal'),
      dataIndex: 'subtotal',
      key: 'subtotal',
      width: 130,
      align: 'right',
      valueType: 'money', // ProTable otomatik para formatı
      sorter: true,
      render: (_, record) => formatCurrency(record.subtotal)
    },
    {
      title: t('invoices.columns.taxAmount'),
      dataIndex: 'taxAmount',
      key: 'taxAmount',
      width: 120,
      align: 'right',
      valueType: 'money',
      render: (_, record) => formatCurrency(record.taxAmount)
    },
    {
      title: t('invoices.columns.total'),
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
      title: t('invoices.columns.status'),
      dataIndex: 'status',
      key: 'status',
      width: 120,
      align: 'center',
      valueType: 'select',
      valueEnum: {
        DRAFT: { text: t('invoices.status.draft'), status: 'Default' },
        APPROVED: { text: t('invoices.status.approved'), status: 'Success' },
        CANCELLED: { text: t('invoices.status.cancelled'), status: 'Error' }
      },
      filters: true
    },
    {
      title: t('invoices.columns.actions'),
      key: 'actions',
      width: 150,
      fixed: 'right',
      align: 'center',
      valueType: 'option',
      render: (_, record) => [
        <Tooltip key="view" title={t('common.view')}>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/invoices/${record.id}`)}
          />
        </Tooltip>,
        <Tooltip key="edit" title={t('common.edit')}>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => navigate(`/invoices/${record.id}/edit`)}
          />
        </Tooltip>,
        <Tooltip key="delete" title={t('common.delete')}>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
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
      {t('invoices.addInvoice')}
    </Button>
  ];

  /**
   * Seçili satırlar için toplu işlem menüsü
   */
  const tableAlertOptionRender = () => (
    <Space size={16}>
      <Button type="link" onClick={() => console.log('Toplu onayla')}>
        {t('invoices.bulkApprove')}
      </Button>
      <Button type="link" onClick={() => console.log('Toplu sil')}>
        {t('invoices.bulkDelete')}
      </Button>
    </Space>
  );

  return (
    <PageContainer
      header={{
        title: t('invoices.title'),
        subTitle: t('invoices.subtitle'),
        breadcrumb: {
          items: [
            { title: t('menu.home') },
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
          {t('common.export')}
        </Button>
      ]}
    >
      {/* Özet İstatistikler */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <ProCard>
            <Statistic
              title={t('invoices.stats.totalInvoices')}
              value={1234}
              prefix={<FileTextOutlined />}
            />
          </ProCard>
        </Col>
        <Col span={6}>
          <ProCard>
            <Statistic
              title={t('invoices.stats.totalAmount')}
              value={1234567.89}
              precision={2}
              prefix="₺"
              valueStyle={{ color: '#3f8600' }}
            />
          </ProCard>
        </Col>
        <Col span={6}>
          <ProCard>
            <Statistic
              title={t('invoices.stats.pending')}
              value={45}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </ProCard>
        </Col>
        <Col span={6}>
          <ProCard>
            <Statistic
              title={t('invoices.stats.approved')}
              value={1189}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </ProCard>
        </Col>
      </Row>

      {/* Gelişmiş Tablo */}
      <ProTable<Invoice>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={async () => {
          // Backend API henüz hazır değil, boş data döndür
          return {
            data: [],
            success: true,
            total: 0
          };
        }}
        rowKey="id"
        search={{
          labelWidth: 'auto',
          defaultCollapsed: false, // Arama formu varsayılan açık
          optionRender: ({ searchText, resetText }, { form }) => [
            <Button
              key="search"
              type="primary"
              onClick={() => form?.submit()}
            >
              {searchText}
            </Button>,
            <Button
              key="reset"
              onClick={() => {
                form?.resetFields();
                form?.submit();
              }}
            >
              {resetText}
            </Button>
          ]
        }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => t('common.totalItems', { total })
        }}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys
        }}
        tableAlertRender={({ selectedRowKeys }) => (
          <Space size={24}>
            <span>
              {t('common.selected')} {selectedRowKeys.length} {t('common.items')}
            </span>
          </Space>
        )}
        tableAlertOptionRender={tableAlertOptionRender}
        toolBarRender={toolBarRender}
        scroll={{ x: 1500 }}
        sticky
        options={{
          reload: true,
          density: true, // Yoğunluk ayarı
          setting: true // Kolon göster/gizle
        }}
        dateFormatter="string"
        headerTitle={t('invoices.tableTitle')}
      />
    </PageContainer>
  );
};

export default InvoiceList;