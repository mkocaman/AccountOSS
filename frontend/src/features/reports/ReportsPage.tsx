import React, { useState } from 'react';
import { 
  Card, 
  Tabs, 
  DatePicker, 
  Select, 
  Button,
  Row,
  Col,
  message
} from 'antd';
import { 
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

  const renderReportContent = () => {
    switch (activeTab) {
      case ReportType.Sales:
        return <SalesReport filters={filters} />;
      case ReportType.Payment:
        return <PaymentReport filters={filters} />;
      case ReportType.Stock:
        return <StockReport filters={filters} />;
      case ReportType.GrBalance:
        return <GrBalanceReport filters={filters} />;
      case ReportType.ProfitLoss:
        return <ProfitLossReport filters={filters} />;
      default:
        return null;
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
          <Col xs={24} sm={12} md={10}>
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
                { label: 'Geçen Yıl', value: [dayjs().subtract(1, 'year').startOf('year'), dayjs().subtract(1, 'year').endOf('year')] },
                { label: 'Son 90 Gün', value: [dayjs().subtract(90, 'days'), dayjs()] }
              ]}
            />
          </Col>

          <Col xs={24} sm={12} md={6}>
            <div className="mb-2 text-sm text-gray-600">Para Birimi</div>
            <Select
              className="w-full"
              placeholder="Tümü"
              allowClear
              value={filters.currency}
              onChange={(value) => setFilters({ ...filters, currency: value })}
              options={[
                { label: 'TRY - Türk Lirası', value: 'TRY' },
                { label: 'USD - Dolar', value: 'USD' },
                { label: 'EUR - Euro', value: 'EUR' },
                { label: 'GBP - Sterlin', value: 'GBP' }
              ]}
            />
          </Col>
        </Row>
      </Card>

      {/* Reports Tabs */}
      <Card>
        <Tabs 
          activeKey={activeTab} 
          onChange={(key) => setActiveTab(key as ReportType)}
          type="card"
          items={[
            {
              key: ReportType.Sales,
              label: reportTypeLabels[ReportType.Sales],
              children: renderReportContent()
            },
            {
              key: ReportType.Payment,
              label: reportTypeLabels[ReportType.Payment],
              children: renderReportContent()
            },
            {
              key: ReportType.Stock,
              label: reportTypeLabels[ReportType.Stock],
              children: renderReportContent()
            },
            {
              key: ReportType.GrBalance,
              label: reportTypeLabels[ReportType.GrBalance],
              children: renderReportContent()
            },
            {
              key: ReportType.ProfitLoss,
              label: reportTypeLabels[ReportType.ProfitLoss],
              children: renderReportContent()
            }
          ]}
        />
      </Card>
    </div>
  );
}
