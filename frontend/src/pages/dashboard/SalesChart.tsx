import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Empty, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import type { SalesChartData } from '@/types/dashboard';
import {
  formatCurrencyShort,
  formatMonth,
  chartColors,
  CustomTooltipWrapper,
  formatCurrency,
} from '@/utils/chartUtils';

interface SalesChartProps {
  data: SalesChartData[];
  loading?: boolean;
  height?: number;
}

export const SalesChart: React.FC<SalesChartProps> = ({
  data,
  loading = false,
  height = 350,
}) => {
  const { t, i18n } = useTranslation();

  console.log('🔵🔵🔵 SalesChart component rendering!');
  console.log('🔵 SalesChart props:', { 
    dataLength: data?.length, 
    loading, 
    height,
    hasData: !!data && data.length > 0 
  });
  console.log('🔵 SalesChart data:', data);

  // Grafik verisi formatla
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.map((item) => ({
      month: formatMonth(item.month, i18n.language),
      [t('dashboard.charts.sales')]: item.sales,
      [t('dashboard.charts.purchases')]: item.purchases,
      [t('dashboard.charts.profit')]: item.profit,
    }));
  }, [data, t, i18n.language]);

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

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart
        data={chartData}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        {/* Grid */}
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

        {/* X Axis (Aylar) */}
        <XAxis
          dataKey="month"
          tick={{ fill: '#8c8c8c', fontSize: 12 }}
          tickLine={false}
        />

        {/* Y Axis (Tutar) */}
        <YAxis
          tick={{ fill: '#8c8c8c', fontSize: 12 }}
          tickLine={false}
          tickFormatter={(value) => formatCurrencyShort(value, i18n.language)}
        />

        {/* Tooltip */}
        <Tooltip
          content={(props) => (
            <CustomTooltipWrapper
              {...props}
              formatter={(value) => formatCurrency(value, i18n.language)}
            />
          )}
        />

        {/* Legend */}
        <Legend
          wrapperStyle={{ paddingTop: 20 }}
          iconType="rect"
          iconSize={10}
        />

        {/* Areas (Satış, Alış, Kâr) */}
        <Area
          type="monotone"
          dataKey={t('dashboard.charts.sales')}
          stackId="1"
          stroke={chartColors.success}
          fill={chartColors.success}
          fillOpacity={0.6}
        />
        <Area
          type="monotone"
          dataKey={t('dashboard.charts.purchases')}
          stackId="2"
          stroke={chartColors.warning}
          fill={chartColors.warning}
          fillOpacity={0.6}
        />
        <Area
          type="monotone"
          dataKey={t('dashboard.charts.profit')}
          stackId="3"
          stroke={chartColors.primary}
          fill={chartColors.primary}
          fillOpacity={0.6}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
