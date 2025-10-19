import { useState } from 'react';
import { 
  Card, 
  Button, 
  Space, 
  Table, 
  Row, 
  Col,
  Spin,
  DatePicker,
  Tabs
} from 'antd';
import { ArrowLeftOutlined, FilePdfOutlined, FileExcelOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

import { reportsApi } from '@/api/reports';
import type { AgingReportItem } from '@/types/report';
import { formatCurrency, downloadFile } from '@/lib/utils';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function AgingReport() {
  usePageTitle('Yaşlandırma Raporu');
  const navigate = useNavigate();
  const [asOfDate, setAsOfDate] = useState(dayjs());
  const [reportType, setReportType] = useState<'receivable' | 'payable'>('receivable');

  // Fetch data
  const { data: receivablesData, isLoading: receivablesLoading } = useQuery({
    queryKey: ['receivablesAging', asOfDate],
    queryFn: () => reportsApi.getReceivablesAging({
      asOfDate: asOfDate.format('YYYY-MM-DD')
    }),
    enabled: reportType === 'receivable'
  });

  const { data: payablesData, isLoading: payablesLoading } = useQuery({
    queryKey: ['payablesAging', asOfDate],
    queryFn: () => reportsApi.getPayablesAging({
      asOfDate: asOfDate.format('YYYY-MM-DD')
    }),
    enabled: reportType === 'payable'
  });

  const data = reportType === 'receivable' ? receivablesData : payablesData;
  const isLoading = reportType === 'receivable' ? receivablesLoading : payablesLoading;

  const handleExport = async (format: 'pdf' | 'excel') => {
    const params = { asOfDate: asOfDate.format('YYYY-MM-DD') };
    const reportName = reportType === 'receivable' ? 'receivables-aging' : 'payables-aging';

    const blob = format === 'pdf' 
      ? await reportsApi.exportPdf(reportName, params)
      : await reportsApi.exportExcel(reportName, params);

    downloadFile(blob as Blob, `yaslandirma-${reportType}.${format === 'pdf' ? 'pdf' : 'xlsx'}`);
  };

  const columns: ColumnsType<AgingReportItem> = [
    {
      title: 'Kod',
      dataIndex: 'partnerCode',
      key: 'partnerCode',
      width: 100,
      render: (code: string) => <span className="font-mono">{code}</span>
    },
    {
      title: reportType === 'receivable' ? 'Müşteri' : 'Tedarikçi',
      dataIndex: 'partnerName',
      key: 'partnerName',
      ellipsis: true
    },
    {
      title: 'Vadesi Gelmemiş',
      dataIndex: 'current',
      key: 'current',
      width: 150,
      align: 'right',
      render: (amount: number) => (
        amount > 0 ? (
          <span className="text-green-600">
            {formatCurrency(amount, 'TRY')}
          </span>
        ) : '-'
      )
    },
    {
      title: '1-30 Gün',
      dataIndex: 'days30to60',
      key: 'days30to60',
      width: 150,
      align: 'right',
      render: (amount: number) => (
        amount > 0 ? (
          <span className="text-blue-600">
            {formatCurrency(amount, 'TRY')}
          </span>
        ) : '-'
      )
    },
    {
      title: '31-60 Gün',
      dataIndex: 'days60to90',
      key: 'days60to90',
      width: 150,
      align: 'right',
      render: (amount: number) => (
        amount > 0 ? (
          <span className="text-orange-600">
            {formatCurrency(amount, 'TRY')}
          </span>
        ) : '-'
      )
    },
    {
      title: '60+ Gün',
      dataIndex: 'over90',
      key: 'over90',
      width: 150,
      align: 'right',
      render: (amount: number) => (
        amount > 0 ? (
          <span className="text-red-600 font-semibold">
            {formatCurrency(amount, 'TRY')}
          </span>
        ) : '-'
      )
    },
    {
      title: 'Toplam',
      dataIndex: 'total',
      key: 'total',
      width: 150,
      align: 'right',
      render: (amount: number) => (
        <span className="font-bold text-lg">
          {formatCurrency(amount, 'TRY')}
        </span>
      )
    }
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/reports')}
          className="mb-4"
        >
          Geri
        </Button>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Yaşlandırma Raporu</h1>
            <p className="text-gray-600 mt-1">
              Alacak/Borç yaşlandırma ve vade analizi
            </p>
          </div>
          <Space>
            <DatePicker
              value={asOfDate}
              onChange={(date) => date && setAsOfDate(date)}
              format="DD/MM/YYYY"
            />
            <Button icon={<FilePdfOutlined />} onClick={() => handleExport('pdf')}>
              PDF
            </Button>
            <Button icon={<FileExcelOutlined />} onClick={() => handleExport('excel')}>
              Excel
            </Button>
          </Space>
        </div>
      </div>

      {/* Tabs */}
      <Card>
        <Tabs
          activeKey={reportType}
          onChange={(key) => setReportType(key as 'receivable' | 'payable')}
          items={[
            {
              key: 'receivable',
              label: 'Alacaklar',
              children: null
            },
            {
              key: 'payable',
              label: 'Borçlar',
              children: null
            }
          ]}
        />

        {/* Summary Cards */}
        {data && (
          <Row gutter={16} className="mb-6 mt-4">
            <Col xs={24} sm={12} md={6}>
              <Card size="small">
                <div className="text-gray-600 text-sm mb-1">Vadesi Gelmemiş</div>
                <div className="text-lg font-bold text-green-600">
                  {formatCurrency(data.summary.current, 'TRY')}
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card size="small">
                <div className="text-gray-600 text-sm mb-1">1-30 Gün</div>
                <div className="text-lg font-bold text-blue-600">
                  {formatCurrency(data.summary.days30to60, 'TRY')}
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card size="small">
                <div className="text-gray-600 text-sm mb-1">31-60 Gün</div>
                <div className="text-lg font-bold text-orange-600">
                  {formatCurrency(data.summary.days60to90, 'TRY')}
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card size="small">
                <div className="text-gray-600 text-sm mb-1">60+ Gün (Vadesi Geçmiş)</div>
                <div className="text-lg font-bold text-red-600">
                  {formatCurrency(data.summary.over90, 'TRY')}
                </div>
              </Card>
            </Col>
          </Row>
        )}

        {/* Table */}
        <Table
          columns={columns}
          dataSource={data?.items || []}
          rowKey="partnerId"
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} kayıt`
          }}
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={2}>
                  <strong className="text-lg">TOPLAM</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} align="right">
                  <strong className="text-lg text-green-600">
                    {formatCurrency(data?.summary.current || 0, 'TRY')}
                  </strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3} align="right">
                  <strong className="text-lg text-blue-600">
                    {formatCurrency(data?.summary.days30to60 || 0, 'TRY')}
                  </strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4} align="right">
                  <strong className="text-lg text-orange-600">
                    {formatCurrency(data?.summary.days60to90 || 0, 'TRY')}
                  </strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={5} align="right">
                  <strong className="text-lg text-red-600">
                    {formatCurrency(data?.summary.over90 || 0, 'TRY')}
                  </strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={6} align="right">
                  <strong className="text-xl text-purple-600">
                    {formatCurrency(data?.summary.total || 0, 'TRY')}
                  </strong>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </Card>
    </div>
  );
}

