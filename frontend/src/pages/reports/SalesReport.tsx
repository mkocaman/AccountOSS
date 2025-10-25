import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import {
  Row,
  Col,
  DatePicker,
  Select,
  Button,
  Space,
  Table,
  Statistic,
  Card,
  Empty,
  Spin
} from 'antd';
import {
  DownloadOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { Column, Pie } from '@ant-design/plots';
import { useSalesReport, useExportReport } from '../../hooks/useReports';
import { formatCurrency, formatDate } from '../../utils/formatters';
import type { ReportFilters, ReportPeriod } from '../../services/reportService';
import dayjs from 'dayjs';
import './SalesReport.css';

const { RangePicker } = DatePicker;

/**
 * Satış raporu sayfası
 * Grafik ve tablo ile detaylı satış analizi
 */
export const SalesReport: React.FC = () => {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<ReportPeriod>('monthly');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().startOf('month'),
    dayjs().endOf('month')
  ]);

  // Report filters
  const filters: ReportFilters = {
    reportType: 'sales',
    period: period === 'custom' ? undefined : period,
    startDate: dateRange[0].format('YYYY-MM-DD'),
    endDate: dateRange[1].format('YYYY-MM-DD')
  };

  // Fetch report data
  const { data: report, isLoading, refetch } = useSalesReport(filters);
  const exportMutation = useExportReport();

  /**
   * Periyot değiştiğinde tarih aralığını otomatik ayarla
   */
  const handlePeriodChange = (newPeriod: ReportPeriod) => {
    setPeriod(newPeriod);

    if (newPeriod !== 'custom') {
      const today = dayjs();
      let start: dayjs.Dayjs;
      let end: dayjs.Dayjs;

      switch (newPeriod) {
        case 'daily':
          start = today.startOf('day');
          end = today.endOf('day');
          break;
        case 'weekly':
          start = today.startOf('week');
          end = today.endOf('week');
          break;
        case 'monthly':
          start = today.startOf('month');
          end = today.endOf('month');
          break;
        case 'quarterly':
          start = today.startOf('quarter');
          end = today.endOf('quarter');
          break;
        case 'yearly':
          start = today.startOf('year');
          end = today.endOf('year');
          break;
        default:
          start = today.startOf('month');
          end = today.endOf('month');
      }

      setDateRange([start, end]);
    }
  };

  /**
   * Export raporu
   */
  const handleExport = (format: 'pdf' | 'excel') => {
    exportMutation.mutate({
      reportType: 'sales',
      format,
      filters
    });
  };

  /**
   * Top products chart config
   */
  const topProductsChartConfig = {
    data: report?.topProducts || [],
    xField: 'productName',
    yField: 'revenue',
    label: {
      position: 'top' as const,
      formatter: (datum: any) => formatCurrency(datum.revenue)
    },
    xAxis: {
      label: {
        autoRotate: true,
        autoHide: false
      }
    },
    meta: {
      revenue: {
        alias: t('reports.sales.revenue')
      }
    }
  };

  /**
   * Top partners pie chart config
   */
  const topPartnersChartConfig = {
    data: report?.topPartners || [],
    angleField: 'totalSales',
    colorField: 'partnerName',
    radius: 0.8,
    label: {
      type: 'outer' as const,
      formatter: (datum: any) => `${datum.partnerName}: ${formatCurrency(datum.totalSales)}`
    },
    legend: {
      position: 'bottom' as const
    }
  };

  return (
    <PageContainer
      header={{
        title: t('reports.sales.title'),
        breadcrumb: {
          items: [
            { title: t('menu.home'), path: '/' },
            { title: t('menu.reports') },
            { title: t('reports.sales.title') }
          ]
        }
      }}
    >
      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col xs={24} md={8}>
            <Space>
              <span>{t('reports.period')}:</span>
              <Select
                value={period}
                onChange={handlePeriodChange}
                style={{ width: 150 }}
                options={[
                  { label: t('reports.periods.daily'), value: 'daily' },
                  { label: t('reports.periods.weekly'), value: 'weekly' },
                  { label: t('reports.periods.monthly'), value: 'monthly' },
                  { label: t('reports.periods.quarterly'), value: 'quarterly' },
                  { label: t('reports.periods.yearly'), value: 'yearly' },
                  { label: t('reports.periods.custom'), value: 'custom' }
                ]}
              />
            </Space>
          </Col>

          <Col xs={24} md={8}>
            <RangePicker
              value={dateRange}
              onChange={(dates) => {
                if (dates) {
                  setDateRange([dates[0]!, dates[1]!]);
                  setPeriod('custom');
                }
              }}
              format="DD/MM/YYYY"
              style={{ width: '100%' }}
            />
          </Col>

          <Col xs={24} md={8}>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => refetch()}
                loading={isLoading}
              >
                {t('common.refresh')}
              </Button>

              <Button
                icon={<FilePdfOutlined />}
                onClick={() => handleExport('pdf')}
                loading={exportMutation.isPending}
              >
                PDF
              </Button>

              <Button
                icon={<FileExcelOutlined />}
                onClick={() => handleExport('excel')}
                loading={exportMutation.isPending}
              >
                Excel
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {isLoading ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <Spin size="large" />
          </div>
        </Card>
      ) : !report ? (
        <Card>
          <Empty description={t('reports.noData')} />
        </Card>
      ) : (
        <>
          {/* Summary Stats */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <ProCard>
                <Statistic
                  title={t('reports.sales.totalSales')}
                  value={report.totalSales}
                  precision={2}
                  prefix="₺"
                  valueStyle={{ color: '#1890ff' }}
                />
              </ProCard>
            </Col>

            <Col xs={24} sm={8}>
              <ProCard>
                <Statistic
                  title={t('reports.sales.totalQuantity')}
                  value={report.totalQuantity}
                  valueStyle={{ color: '#52c41a' }}
                />
              </ProCard>
            </Col>

            <Col xs={24} sm={8}>
              <ProCard>
                <Statistic
                  title={t('reports.sales.averageOrderValue')}
                  value={report.averageOrderValue}
                  precision={2}
                  prefix="₺"
                  valueStyle={{ color: '#faad14' }}
                />
              </ProCard>
            </Col>
          </Row>

          {/* Charts */}
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24} lg={12}>
              <ProCard title={t('reports.sales.topProducts')} headerBordered>
                {report.topProducts.length > 0 ? (
                  <Column {...topProductsChartConfig} height={300} />
                ) : (
                  <Empty description={t('reports.noData')} />
                )}
              </ProCard>
            </Col>

            <Col xs={24} lg={12}>
              <ProCard title={t('reports.sales.topPartners')} headerBordered>
                {report.topPartners.length > 0 ? (
                  <Pie {...topPartnersChartConfig} height={300} />
                ) : (
                  <Empty description={t('reports.noData')} />
                )}
              </ProCard>
            </Col>
          </Row>

          {/* Top Products Table */}
          <ProCard
            title={t('reports.sales.topProductsDetail')}
            headerBordered
            style={{ marginTop: 16 }}
          >
            <Table
              dataSource={report.topProducts}
              rowKey="productId"
              pagination={false}
              columns={[
                {
                  title: t('reports.sales.columns.product'),
                  dataIndex: 'productName',
                  key: 'productName'
                },
                {
                  title: t('reports.sales.columns.quantity'),
                  dataIndex: 'quantity',
                  key: 'quantity',
                  align: 'right'
                },
                {
                  title: t('reports.sales.columns.revenue'),
                  dataIndex: 'revenue',
                  key: 'revenue',
                  align: 'right',
                  render: (value) => formatCurrency(value)
                }
              ]}
            />
          </ProCard>

          {/* Top Partners Table */}
          <ProCard
            title={t('reports.sales.topPartnersDetail')}
            headerBordered
            style={{ marginTop: 16 }}
          >
            <Table
              dataSource={report.topPartners}
              rowKey="partnerId"
              pagination={false}
              columns={[
                {
                  title: t('reports.sales.columns.partner'),
                  dataIndex: 'partnerName',
                  key: 'partnerName'
                },
                {
                  title: t('reports.sales.columns.invoiceCount'),
                  dataIndex: 'invoiceCount',
                  key: 'invoiceCount',
                  align: 'right'
                },
                {
                  title: t('reports.sales.columns.totalSales'),
                  dataIndex: 'totalSales',
                  key: 'totalSales',
                  align: 'right',
                  render: (value) => formatCurrency(value)
                }
              ]}
            />
          </ProCard>

          {/* Sales by Day Table */}
          <ProCard
            title={t('reports.sales.salesByDay')}
            headerBordered
            style={{ marginTop: 16 }}
          >
            <Table
              dataSource={report.salesByDay}
              rowKey="date"
              pagination={{ pageSize: 10 }}
              columns={[
                {
                  title: t('reports.sales.columns.date'),
                  dataIndex: 'date',
                  key: 'date',
                  render: (value) => formatDate(value)
                },
                {
                  title: t('reports.sales.columns.invoiceCount'),
                  dataIndex: 'invoiceCount',
                  key: 'invoiceCount',
                  align: 'right'
                },
                {
                  title: t('reports.sales.columns.sales'),
                  dataIndex: 'sales',
                  key: 'sales',
                  align: 'right',
                  render: (value) => formatCurrency(value)
                }
              ]}
            />
          </ProCard>
        </>
      )}
    </PageContainer>
  );
};

export default SalesReport;
