import React, { useState } from 'react';
import { 
  Card, 
  Tabs, 
  DatePicker, 
  Select, 
  Button, 
  Space,
  Row,
  Col,
  message
} from 'antd';
import { 
  DownloadOutlined,
  FileExcelOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';

import { ReportType, reportTypeLabels } from '@/types/report';
import type { ReportFilters } from '@/types/report';
import SalesReport from './components/SalesReport';
import PaymentReport from './components/PaymentReport';
import StockReport from './components/StockReport';
import GrBalanceReport from './components/GrBalanceReport';
import ProfitLossReport from './components/ProfitLossReport';
import { reportsApi } from '@/api/reports';

const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportType>(ReportType.Sales);
  const [filters, setFilters] = useState<ReportFilters>({
    dateFrom: dayjs().startOf('month').format('YYYY-MM-DD'),
    dateTo: dayjs().endOf('month').format('YYYY-MM-DD')
  });
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    try {
      setExporting(true);
      await reportsApi.exportReport({
        reportType: activeTab,
        filters,
        format: 'excel'
      });
      message.success('Rapor Excel olarak indirildi');
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Excel export başarısız');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Raporlar</h1>
            <p className="text-gray-600 mt-1">
              Detaylı iş raporları ve analizler
            </p>
          </div>

          <Button
            type="primary"
            icon={<FileExcelOutlined />}
            onClick={handleExport}
            loading={exporting}
            size="large"
          >
            Excel İndir
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <Row gutter={16}>
          <Col xs={24} sm={12} md={8}>
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
                { label: 'Geçen Ay', value: [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')] },
                { label: 'Bu Yıl', value: [dayjs().startOf('year'), dayjs().endOf('year')] },
                { label: 'Son 90 Gün', value: [dayjs().subtract(90, 'days'), dayjs()] }
              ]}
            />
          </Col>

          <Col xs={24} sm={12} md={8}>
            <div className="mb-2 text-sm text-gray-600">Para Birimi</div>
            <Select
              className="w-full"
              placeholder="Tümü"
              allowClear
              value={filters.currency}
              onChange={(value) => setFilters({ ...filters, currency: value })}
              options={[
                { label: 'TRY', value: 'TRY' },
                { label: 'USD', value: 'USD' },
                { label: 'EUR', value: 'EUR' },
                { label: 'GBP', value: 'GBP' }
              ]}
            />
          </Col>

          {/* Add more filters based on active tab */}
        </Row>
      </Card>

      {/* Reports Tabs */}
      <Card>
        <Tabs 
          activeKey={activeTab} 
          onChange={(key) => setActiveTab(key as ReportType)}
          type="card"
        >
          <TabPane 
            tab={reportTypeLabels[ReportType.Sales]} 
            key={ReportType.Sales}
          >
            <SalesReport filters={filters} />
          </TabPane>

          <TabPane 
            tab={reportTypeLabels[ReportType.Payment]} 
            key={ReportType.Payment}
          >
            <PaymentReport filters={filters} />
          </TabPane>

          <TabPane 
            tab={reportTypeLabels[ReportType.Stock]} 
            key={ReportType.Stock}
          >
            <StockReport filters={filters} />
          </TabPane>

          <TabPane 
            tab={reportTypeLabels[ReportType.GrBalance]} 
            key={ReportType.GrBalance}
          >
            <GrBalanceReport filters={filters} />
          </TabPane>

          <TabPane 
            tab={reportTypeLabels[ReportType.ProfitLoss]} 
            key={ReportType.ProfitLoss}
          >
            <ProfitLossReport filters={filters} />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
}
