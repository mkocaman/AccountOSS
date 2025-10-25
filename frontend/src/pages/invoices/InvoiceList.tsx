import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Button, 
  Space, 
  Tag, 
  Dropdown,
  Typography,
  Card,
  Statistic,
  Row,
  Col,
  Alert
} from 'antd';
import { 
  PlusOutlined, 
  DownloadOutlined,
  MoreOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { useInvoices, useDeleteInvoice, useInvoiceSummary } from '@/hooks/useInvoice';
import type { Invoice } from '@/types/invoice';
import dayjs from 'dayjs';

const { Title } = Typography;

/**
 * Fatura listesi sayfası
 * Filtreleme, sayfalama, CRUD işlemleri
 */
const InvoiceList: React.FC = () => {
  const navigate = useNavigate();
  const [params, setParams] = useState({
    pageNumber: 1,
    pageSize: 10
  });

  const { data, isLoading } = useInvoices(params);
  const { data: summary } = useInvoiceSummary();
  const deleteMutation = useDeleteInvoice();

  /**
   * Fatura durumu renklendirme
   */
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'default',
      sent: 'processing',
      paid: 'success',
      cancelled: 'error',
      overdue: 'warning'
    };
    return colors[status] || 'default';
  };

  /**
   * Fatura durumu Türkçe
   */
  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      draft: 'Taslak',
      sent: 'Gönderildi',
      paid: 'Ödendi',
      cancelled: 'İptal',
      overdue: 'Vadesi Geçti'
    };
    return texts[status] || status;
  };

  /**
   * Tablo kolonları
   */
  const columns: ProColumns<Invoice>[] = [
    {
      title: 'Fatura No',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      width: 150,
      fixed: 'left',
      render: (text, record) => (
        <a onClick={() => navigate(`/invoices/${record.id}`)}>
          {text}
        </a>
      )
    },
    {
      title: 'Cari',
      dataIndex: 'partnerName',
      key: 'partnerName',
      ellipsis: true,
      width: 200
    },
    {
      title: 'Tarih',
      dataIndex: 'invoiceDate',
      key: 'invoiceDate',
      width: 120,
      render: (date: string) => dayjs(date).format('DD.MM.YYYY')
    },
    {
      title: 'Vade',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 120,
      render: (date: string) => date ? dayjs(date).format('DD.MM.YYYY') : '-'
    },
    {
      title: 'Tutar',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 150,
      align: 'right',
      render: (amount: number, record) => (
        <span style={{ fontWeight: 500 }}>
          {new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: record.currency || 'TRY'
          }).format(amount)}
        </span>
      )
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                icon: <EyeOutlined />,
                label: 'Görüntüle',
                onClick: () => navigate(`/invoices/${record.id}`)
              },
              {
                key: 'edit',
                icon: <EditOutlined />,
                label: 'Düzenle',
                onClick: () => navigate(`/invoices/${record.id}/edit`),
                disabled: record.status === 'paid'
              },
              {
                key: 'pdf',
                icon: <FileTextOutlined />,
                label: 'PDF İndir',
                onClick: () => {
                  // TODO: PDF download
                }
              },
              {
                type: 'divider'
              },
              {
                key: 'delete',
                icon: <DeleteOutlined />,
                label: 'Sil',
                danger: true,
                onClick: () => {
                  if (window.confirm('Faturayı silmek istediğinizden emin misiniz?')) {
                    deleteMutation.mutate(record.id);
                  }
                },
                disabled: record.status === 'paid'
              }
            ]
          }}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Mock Data Warning */}
        <Alert
          message="Geliştirme Modu"
          description="Şu an mock (test) verileri görüntüleniyor. Backend API hazır olduğunda gerçek veriler gösterilecektir."
          type="info"
          showIcon
          closable
        />
        
        {/* Başlık ve Yeni Fatura Butonu */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2} style={{ margin: 0 }}>Faturalar</Title>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => navigate('/invoices/create')}
          >
            Yeni Fatura
          </Button>
        </div>

        {/* Özet İstatistikler */}
        {summary && (
          <Row gutter={16}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Toplam Fatura"
                  value={summary.totalCount}
                  prefix={<FileTextOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Toplam Tutar"
                  value={summary.totalAmount}
                  precision={2}
                  suffix="₺"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Ödenen"
                  value={summary.paidAmount}
                  precision={2}
                  suffix="₺"
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Bekleyen"
                  value={summary.unpaidAmount}
                  precision={2}
                  suffix="₺"
                  valueStyle={{ color: '#cf1322' }}
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* Fatura Tablosu */}
        <ProTable<Invoice>
          columns={columns}
          dataSource={data?.items || []}
          loading={isLoading}
          rowKey="id"
          pagination={{
            current: params.pageNumber,
            pageSize: params.pageSize,
            total: data?.totalCount || 0,
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} fatura`
          }}
          search={false}
          options={{
            reload: () => setParams({ ...params }),
            density: true,
            fullScreen: true
          }}
          toolBarRender={() => [
            <Button
              key="export"
              icon={<DownloadOutlined />}
              onClick={() => {
                // TODO: Excel export
              }}
            >
              Excel İndir
            </Button>
          ]}
          onChange={(pagination, filters, sorter) => {
            setParams({
              ...params,
              pageNumber: pagination.current || 1,
              pageSize: pagination.pageSize || 10
            });
          }}
        />
      </Space>
    </div>
  );
};

export default InvoiceList;
