import { useState } from 'react';
import { 
  Card, 
  Button, 
  Space, 
  Table, 
  Row, 
  Col,
  Spin,
  Select,
  DatePicker
} from 'antd';
import { ArrowLeftOutlined, FilePdfOutlined, FileExcelOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

import { reportsApi } from '@/api/reports';
import type { InventoryReportItem } from '@/types/report';
import { formatCurrency, formatDate, downloadFile } from '@/lib/utils';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function InventoryReport() {
  usePageTitle('Stok Durumu Raporu');
  const navigate = useNavigate();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();
  const [asOfDate, setAsOfDate] = useState(dayjs());

  // Fetch data
  const { data, isLoading } = useQuery({
    queryKey: ['inventoryReport', selectedCategoryId, asOfDate],
    queryFn: () => reportsApi.getInventoryReport({
      categoryId: selectedCategoryId,
      asOfDate: asOfDate.format('YYYY-MM-DD')
    })
  });

  const handleExport = async (format: 'pdf' | 'excel') => {
    const params = {
      categoryId: selectedCategoryId,
      asOfDate: asOfDate.format('YYYY-MM-DD')
    };

    const blob = format === 'pdf' 
      ? await reportsApi.exportPdf('inventory', params)
      : await reportsApi.exportExcel('inventory', params);

    downloadFile(blob as Blob, `stok-raporu.${format === 'pdf' ? 'pdf' : 'xlsx'}`);
  };

  const columns: ColumnsType<InventoryReportItem> = [
    {
      title: 'Ürün Kodu',
      dataIndex: 'productCode',
      key: 'productCode',
      width: 120,
      render: (code: string) => <span className="font-mono">{code}</span>
    },
    {
      title: 'Ürün Adı',
      dataIndex: 'productName',
      key: 'productName',
      ellipsis: true
    },
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      width: 150
    },
    {
      title: 'Miktar',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 120,
      align: 'right',
      render: (qty: number, record) => (
        <span className={qty <= 0 ? 'text-red-600' : ''}>
          {qty.toFixed(2)} {record.unit}
        </span>
      )
    },
    {
      title: 'Birim Maliyet',
      dataIndex: 'unitCost',
      key: 'unitCost',
      width: 120,
      align: 'right',
      render: (cost: number) => formatCurrency(cost, 'TRY')
    },
    {
      title: 'Toplam Değer',
      dataIndex: 'totalValue',
      key: 'totalValue',
      width: 150,
      align: 'right',
      render: (value: number) => (
        <span className="font-semibold text-blue-600">
          {formatCurrency(value, 'TRY')}
        </span>
      )
    },
    {
      title: 'Son Hareket',
      dataIndex: 'lastMovementDate',
      key: 'lastMovementDate',
      width: 120,
      render: (date?: string) => date ? formatDate(date) : '-'
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
            <h1 className="text-2xl font-bold text-gray-900">Stok Durumu Raporu</h1>
            <p className="text-gray-600 mt-1">
              Mevcut stok ve değerleme raporu
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
            <div className="mb-2 text-sm text-gray-600">Rapor Tarihi</div>
            <DatePicker
              className="w-full"
              value={asOfDate}
              onChange={(date) => date && setAsOfDate(date)}
              format="DD/MM/YYYY"
            />
          </Col>
        </Row>
      </Card>

      {/* Summary Cards */}
      {data && (
        <Row gutter={16} className="mb-6">
          <Col xs={24} sm={12} md={6}>
            <Card>
              <div className="text-gray-600 mb-2">Toplam Ürün</div>
              <div className="text-2xl font-bold text-blue-600">
                {data.summary.totalProducts}
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <div className="text-gray-600 mb-2">Toplam Miktar</div>
              <div className="text-2xl font-bold text-purple-600">
                {data.summary.totalQuantity.toFixed(2)}
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <div className="text-gray-600 mb-2">Toplam Değer</div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(data.summary.totalValue, 'TRY')}
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <div className="text-gray-600 mb-2">Ort. Birim Değer</div>
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(data.summary.averageValue, 'TRY')}
              </div>
            </Card>
          </Col>
        </Row>
      )}

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={data?.products || []}
          rowKey="productId"
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} ürün`
          }}
        />
      </Card>
    </div>
  );
}

