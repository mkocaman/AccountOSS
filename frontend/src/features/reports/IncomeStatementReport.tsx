import React, { useState } from 'react';
import { Card, DatePicker, Button, Space, Table, Row, Col, Spin } from 'antd';
import { ArrowLeftOutlined, FilePdfOutlined, FileExcelOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

import { reportsApi } from '@/api/reports';
import { formatCurrency, downloadFile } from '@/lib/utils';
import { usePageTitle } from '@/hooks/usePageTitle';

const { RangePicker } = DatePicker;

interface ReportRow {
  key: string;
  label: string;
  amount: number;
  isHeader?: boolean;
  isTotal?: boolean;
  isSubtotal?: boolean;
  indent?: number;
}

export default function IncomeStatementReport() {
  usePageTitle('Gelir Tablosu');
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().startOf('year'),
    dayjs()
  ]);

  // Fetch data
  const { data, isLoading } = useQuery({
    queryKey: ['incomeStatement', dateRange],
    queryFn: () => reportsApi.getIncomeStatement({
      startDate: dateRange[0].format('YYYY-MM-DD'),
      endDate: dateRange[1].format('YYYY-MM-DD')
    })
  });

  const handleExport = async (format: 'pdf' | 'excel') => {
    const params = {
      startDate: dateRange[0].format('YYYY-MM-DD'),
      endDate: dateRange[1].format('YYYY-MM-DD')
    };

    const blob = format === 'pdf' 
      ? await reportsApi.exportPdf('income-statement', params)
      : await reportsApi.exportExcel('income-statement', params);

    downloadFile(blob as Blob, `gelir-tablosu.${format === 'pdf' ? 'pdf' : 'xlsx'}`);
  };

  const columns: ColumnsType<ReportRow> = [
    {
      title: 'Hesap',
      dataIndex: 'label',
      key: 'label',
      render: (text, record) => {
        const style: React.CSSProperties = {
          fontWeight: record.isHeader || record.isTotal ? 'bold' : 'normal',
          fontSize: record.isTotal ? '16px' : record.isSubtotal ? '15px' : '14px',
          paddingLeft: `${(record.indent || 0) * 20}px`
        };
        return <span style={style}>{text}</span>;
      }
    },
    {
      title: 'Tutar (TRY)',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      width: 200,
      render: (amount, record) => {
        const color = amount < 0 ? 'red' : record.isTotal ? 'green' : 'inherit';
        const style: React.CSSProperties = {
          fontWeight: record.isTotal || record.isSubtotal ? 'bold' : 'normal',
          fontSize: record.isTotal ? '16px' : '14px',
          color
        };
        return <span style={style}>{formatCurrency(amount, 'TRY')}</span>;
      }
    }
  ];

  // Build table data
  const tableData: ReportRow[] = React.useMemo(() => {
    if (!data) return [];

    return [
      { key: 'revenue-header', label: 'GELİRLER', amount: 0, isHeader: true },
      { key: 'sales-revenue', label: 'Satış Gelirleri', amount: data.revenue.salesRevenue, indent: 1 },
      { key: 'service-revenue', label: 'Hizmet Gelirleri', amount: data.revenue.serviceRevenue, indent: 1 },
      { key: 'other-revenue', label: 'Diğer Gelirler', amount: data.revenue.otherRevenue, indent: 1 },
      { key: 'total-revenue', label: 'Toplam Gelir', amount: data.revenue.total, isSubtotal: true },
      
      { key: 'cost-header', label: 'SATIŞLARIN MALİYETİ', amount: 0, isHeader: true },
      { key: 'cost-goods', label: 'Satılan Malın Maliyeti', amount: -data.costOfSales.costOfGoods, indent: 1 },
      { key: 'cost-services', label: 'Hizmet Maliyeti', amount: -data.costOfSales.costOfServices, indent: 1 },
      { key: 'total-cost', label: 'Toplam Maliyet', amount: -data.costOfSales.total, isSubtotal: true },
      
      { key: 'gross-profit', label: 'BRÜT KAR', amount: data.grossProfit, isSubtotal: true },
      
      { key: 'expenses-header', label: 'FAALİYET GİDERLERİ', amount: 0, isHeader: true },
      { key: 'operating', label: 'Faaliyet Giderleri', amount: -data.expenses.operating, indent: 1 },
      { key: 'administrative', label: 'Genel Yönetim Giderleri', amount: -data.expenses.administrative, indent: 1 },
      { key: 'marketing', label: 'Pazarlama Giderleri', amount: -data.expenses.marketing, indent: 1 },
      { key: 'financial', label: 'Finansman Giderleri', amount: -data.expenses.financial, indent: 1 },
      { key: 'other-expenses', label: 'Diğer Giderler', amount: -data.expenses.other, indent: 1 },
      { key: 'total-expenses', label: 'Toplam Giderler', amount: -data.expenses.total, isSubtotal: true },
      
      { key: 'net-profit', label: 'NET KAR/ZARAR', amount: data.netProfit, isTotal: true }
    ];
  }, [data]);

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
            <h1 className="text-2xl font-bold text-gray-900">Gelir Tablosu</h1>
            <p className="text-gray-600 mt-1">
              Dönemsel gelir, gider ve kar/zarar analizi
            </p>
          </div>
          <Space>
            <RangePicker
              value={dateRange}
              onChange={(dates) => dates && setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
              format="DD/MM/YYYY"
              presets={[
                { label: 'Bu Ay', value: [dayjs().startOf('month'), dayjs().endOf('month')] },
                { label: 'Bu Çeyrek', value: [dayjs().startOf('quarter'), dayjs().endOf('quarter')] },
                { label: 'Bu Yıl', value: [dayjs().startOf('year'), dayjs().endOf('year')] }
              ]}
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

      {/* Summary Cards */}
      {data && (
        <Row gutter={16} className="mb-6">
          <Col xs={24} sm={12} md={6}>
            <Card>
              <div className="text-gray-600 mb-2">Toplam Gelir</div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(data.revenue.total, 'TRY')}
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <div className="text-gray-600 mb-2">Brüt Kar</div>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(data.grossProfit, 'TRY')}
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <div className="text-gray-600 mb-2">Net Kar/Zarar</div>
              <div className={`text-2xl font-bold ${data.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(data.netProfit, 'TRY')}
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <div className="text-gray-600 mb-2">Kar Marjı</div>
              <div className={`text-2xl font-bold ${data.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {data.profitMargin.toFixed(2)}%
              </div>
            </Card>
          </Col>
        </Row>
      )}

      {/* Report Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={tableData}
          pagination={false}
          showHeader={false}
        />
      </Card>
    </div>
  );
}

