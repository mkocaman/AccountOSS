import { useState } from 'react';
import { 
  Card, 
  DatePicker, 
  Button, 
  Space, 
  Table, 
  Row, 
  Col,
  Spin,
  Select,
  Alert
} from 'antd';
import { 
  ArrowLeftOutlined, 
  FilePdfOutlined, 
  FileExcelOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

import { reportsApi } from '@/api/reports';
import { partnersApi } from '@/api/partners';
import { PartnerType } from '@/types/partner';
import type { TopProductItem, TopCustomerItem } from '@/types/report';
import { formatCurrency, downloadFile } from '@/lib/utils';
import { usePageTitle } from '@/hooks/usePageTitle';

const { RangePicker } = DatePicker;

export default function SalesReport() {
  usePageTitle('Satış Raporu');
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().startOf('month'),
    dayjs()
  ]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | undefined>();

  // Fetch customers
  const { data: customersResponse } = useQuery({
    queryKey: ['customers-all'],
    queryFn: () => partnersApi.getAll({ type: PartnerType.Customer, pageSize: 1000 })
  });

  const customers = customersResponse?.data;

  // Fetch data
  const { data, isLoading } = useQuery({
    queryKey: ['salesReport', dateRange, selectedCustomerId],
    queryFn: () => reportsApi.getSalesReport({
      startDate: dateRange[0].format('YYYY-MM-DD'),
      endDate: dateRange[1].format('YYYY-MM-DD'),
      customerId: selectedCustomerId
    })
  });

  const handleExport = async (format: 'pdf' | 'excel') => {
    const params = {
      startDate: dateRange[0].format('YYYY-MM-DD'),
      endDate: dateRange[1].format('YYYY-MM-DD'),
      customerId: selectedCustomerId
    };

    const blob = format === 'pdf' 
      ? await reportsApi.exportPdf('sales', params)
      : await reportsApi.exportExcel('sales', params);

    downloadFile(blob as Blob, `satis-raporu.${format === 'pdf' ? 'pdf' : 'xlsx'}`);
  };

  // Top Products Table
  const productColumns: ColumnsType<TopProductItem> = [
    {
      title: '#',
      width: 50,
      render: (_, __, index) => index + 1
    },
    {
      title: 'Ürün',
      dataIndex: 'productName',
      key: 'productName'
    },
    {
      title: 'Miktar',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'right',
      render: (qty: number) => qty.toFixed(2)
    },
    {
      title: 'Gelir',
      dataIndex: 'revenue',
      key: 'revenue',
      align: 'right',
      render: (revenue: number) => (
        <span className="font-semibold text-green-600">
          {formatCurrency(revenue, 'TRY')}
        </span>
      )
    }
  ];

  // Top Customers Table
  const customerColumns: ColumnsType<TopCustomerItem> = [
    {
      title: '#',
      width: 50,
      render: (_, __, index) => index + 1
    },
    {
      title: 'Müşteri',
      dataIndex: 'customerName',
      key: 'customerName'
    },
    {
      title: 'Fatura Sayısı',
      dataIndex: 'invoiceCount',
      key: 'invoiceCount',
      align: 'right'
    },
    {
      title: 'Toplam Gelir',
      dataIndex: 'totalRevenue',
      key: 'totalRevenue',
      align: 'right',
      render: (revenue: number) => (
        <span className="font-semibold text-green-600">
          {formatCurrency(revenue, 'TRY')}
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
            <h1 className="text-2xl font-bold text-gray-900">Satış Raporu</h1>
            <p className="text-gray-600 mt-1">
              Satış analizi ve performans raporları
            </p>
          </div>
          <Space>
            <Button icon={<FilePdfOutlined />} onClick={() => handleExport('pdf')}>
              PDF
            </Button>
            <Button icon={<FileExcelOutlined />} onClick={() => handleExport('excel')}>
              Excel
            </Button>
          </Space>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <Row gutter={16}>
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
          <Col xs={24} md={12}>
            <div className="mb-2 text-sm text-gray-600">Müşteri (Opsiyonel)</div>
            <Select
              className="w-full"
              placeholder="Tüm müşteriler"
              allowClear
              showSearch
              optionFilterProp="label"
              value={selectedCustomerId}
              onChange={setSelectedCustomerId}
              options={customers?.items?.map((c: any) => ({
                label: `${c.code} - ${c.name}`,
                value: c.id
              }))}
            />
          </Col>
        </Row>
      </Card>

      {/* Summary Cards */}
      {data && (
        <Row gutter={16} className="mb-6">
          <Col xs={24} sm={12} md={6}>
            <Card>
              <div className="text-gray-600 mb-2">Toplam Satış</div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(data.summary.totalSales, 'TRY')}
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <div className="text-gray-600 mb-2">Fatura Sayısı</div>
              <div className="text-2xl font-bold text-blue-600">
                {data.summary.totalInvoices}
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <div className="text-gray-600 mb-2">Ort. Fatura Tutarı</div>
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(data.summary.averageInvoiceValue, 'TRY')}
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <div className="text-gray-600 mb-2">En Çok Satan</div>
              <div className="text-lg font-bold text-orange-600">
                {data.summary.topProducts[0]?.productName || '-'}
              </div>
            </Card>
          </Col>
        </Row>
      )}

      {/* Charts Placeholder */}
      {data?.monthlySales && (
        <Alert
          message="Grafik Görünümü"
          description="Aylık satış trendi ve kategori bazlı grafikler için Chart.js entegrasyonu yapılacak."
          type="info"
          showIcon
          className="mb-4"
        />
      )}

      {/* Top Products */}
      {data && data.summary.topProducts.length > 0 && (
        <Card title="En Çok Satan Ürünler (Top 10)" className="mb-4">
          <Table
            columns={productColumns}
            dataSource={data.summary.topProducts}
            rowKey="productName"
            pagination={false}
          />
        </Card>
      )}

      {/* Top Customers */}
      {data && data.summary.topCustomers.length > 0 && (
        <Card title="En Çok Satış Yapılan Müşteriler (Top 10)">
          <Table
            columns={customerColumns}
            dataSource={data.summary.topCustomers}
            rowKey="customerName"
            pagination={false}
          />
        </Card>
      )}
    </div>
  );
}

