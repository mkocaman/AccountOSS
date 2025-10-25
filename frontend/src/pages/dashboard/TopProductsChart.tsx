import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Empty, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import type { TopProduct } from '@/types/dashboard';
import {
  formatCurrencyShort,
  chartColors,
  formatCurrency,
} from '@/utils/chartUtils';

interface TopProductsChartProps {
  data: TopProduct[];
  loading?: boolean;
  height?: number;
}

export const TopProductsChart: React.FC<TopProductsChartProps> = ({
  data,
  loading = false,
  height = 350,
}) => {
  const { t, i18n } = useTranslation();

  console.log('🟡🟡🟡 TopProductsChart rendering!', { dataLength: data?.length, loading });

  // Grafik verisi formatla
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.map((item) => ({
      name: item.productName,
      [t('dashboard.charts.revenue')]: item.revenue,
      [t('dashboard.charts.quantity')]: item.quantity,
    }));
  }, [data, t]);

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
      <BarChart
        data={chartData}
        margin={{ top: 10, right: 10, left: 0, bottom: 60 }}
      >
        {/* Grid */}
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

        {/* X Axis (Ürün Adları) */}
        <XAxis
          dataKey="name"
          tick={{ fill: '#8c8c8c', fontSize: 11 }}
          tickLine={false}
          angle={-45}
          textAnchor="end"
          height={80}
        />

        {/* Y Axis (Gelir) */}
        <YAxis
          tick={{ fill: '#8c8c8c', fontSize: 12 }}
          tickLine={false}
          tickFormatter={(value) => formatCurrencyShort(value, i18n.language)}
        />

        {/* Tooltip */}
        <Tooltip
          formatter={(value, name) => {
            if (name === t('dashboard.charts.revenue')) {
              return [formatCurrency(value, i18n.language), name];
            }
            return [`${value} ${t('dashboard.charts.quantity')}`, name];
          }}
        />

        {/* Legend */}
        <Legend
          wrapperStyle={{ paddingTop: 10 }}
          iconType="rect"
          iconSize={10}
        />

        {/* Bar (Gelir) */}
        <Bar
          dataKey={t('dashboard.charts.revenue')}
          radius={[8, 8, 0, 0]}
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={chartColors.palette[index % chartColors.palette.length]}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
