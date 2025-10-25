import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Empty, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import type { CustomerRevenue } from '@/types/dashboard';
import {
  formatCurrency,
  formatPercent,
  chartColors,
} from '@/utils/chartUtils';

interface RevenueByCustomerChartProps {
  data: CustomerRevenue[];
  loading?: boolean;
  height?: number;
}

export const RevenueByCustomerChart: React.FC<RevenueByCustomerChartProps> = ({
  data,
  loading = false,
  height = 350,
}) => {
  const { t, i18n } = useTranslation();

  console.log('🟣🟣🟣 RevenueByCustomerChart rendering!', { dataLength: data?.length, loading });

  // Grafik verisi formatla ve yüzde hesapla
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);

    return data.map((item) => ({
      name: item.customerName,
      value: item.revenue,
      percent: (item.revenue / totalRevenue) * 100,
      invoiceCount: item.invoiceCount,
    }));
  }, [data]);

  // Loading state
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return <Empty description={t('dashboard.messages.noData')} />;
  }

  // Custom label
  const renderLabel = (entry: any) => {
    return `${formatPercent(entry.percent)}`;
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;

    return (
      <div
        style={{
          backgroundColor: '#fff',
          padding: '12px',
          border: '1px solid #d9d9d9',
          borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        }}
      >
        <div style={{ fontWeight: 600, color: '#262626', marginBottom: 8 }}>
          {data.name}
        </div>
        <div style={{ color: '#595959', marginBottom: 4 }}>
          {t('dashboard.charts.revenue')}:{' '}
          <span style={{ fontWeight: 600, color: '#262626' }}>
            {formatCurrency(data.value, i18n.language)}
          </span>
        </div>
        <div style={{ color: '#595959', marginBottom: 4 }}>
          {t('dashboard.stats.totalInvoices')}:{' '}
          <span style={{ fontWeight: 600, color: '#262626' }}>
            {data.invoiceCount}
          </span>
        </div>
        <div style={{ color: '#595959' }}>
          {t('dashboard.charts.percent')}:{' '}
          <span style={{ fontWeight: 600, color: '#262626' }}>
            {formatPercent(data.percent)}
          </span>
        </div>
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        {/* Pie (Donut style) */}
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderLabel}
          outerRadius={100}
          innerRadius={60} // Donut chart için
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={chartColors.palette[index % chartColors.palette.length]}
            />
          ))}
        </Pie>

        {/* Tooltip */}
        <Tooltip content={CustomTooltip} />

        {/* Legend */}
        <Legend
          verticalAlign="bottom"
          height={36}
          iconType="circle"
          iconSize={8}
          formatter={(value, entry: any) => (
            <span style={{ fontSize: 12, color: '#595959' }}>
              {value}
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};
