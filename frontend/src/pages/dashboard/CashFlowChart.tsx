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
  ReferenceLine,
} from 'recharts';
import { Empty, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import type { CashFlowData } from '@/types/dashboard';
import {
  formatCurrencyShort,
  formatDate,
  chartColors,
  CustomTooltipWrapper,
  formatCurrency,
} from '@/utils/chartUtils';

interface CashFlowChartProps {
  data: CashFlowData[];
  loading?: boolean;
  height?: number;
}

export const CashFlowChart: React.FC<CashFlowChartProps> = ({
  data,
  loading = false,
  height = 350,
}) => {
  const { t, i18n } = useTranslation();

  // Grafik verisi formatla
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.map((item) => ({
      date: formatDate(item.date, i18n.language),
      [t('dashboard.cashFlow.collections')]: item.collections,
      [t('dashboard.cashFlow.payments')]: item.payments,
      [t('dashboard.cashFlow.netCashFlow')]: item.netCashFlow,
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

        {/* X Axis (Tarihler) */}
        <XAxis
          dataKey="date"
          tick={{ fill: '#8c8c8c', fontSize: 11 }}
          tickLine={false}
          interval="preserveStartEnd"
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

        {/* Reference line at y=0 */}
        <ReferenceLine y={0} stroke="#d9d9d9" strokeDasharray="3 3" />

        {/* Areas (Tahsilatlar, Ödemeler, Net) */}
        <Area
          type="monotone"
          dataKey={t('dashboard.cashFlow.collections')}
          stroke={chartColors.success}
          fill={chartColors.success}
          fillOpacity={0.3}
        />
        <Area
          type="monotone"
          dataKey={t('dashboard.cashFlow.payments')}
          stroke={chartColors.error}
          fill={chartColors.error}
          fillOpacity={0.3}
        />
        <Area
          type="monotone"
          dataKey={t('dashboard.cashFlow.netCashFlow')}
          stroke={chartColors.primary}
          fill={chartColors.primary}
          fillOpacity={0.5}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
