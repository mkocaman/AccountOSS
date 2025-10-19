import React from 'react';
import { Column } from '@ant-design/plots';
import { ChartCard } from './ChartCard';

interface RevenueChartProps {
  data?: Array<{
    month: string;
    revenue: number;
    profit: number;
  }>;
  loading?: boolean;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data = [], loading = false }) => {
  const config = {
    data,
    xField: 'month',
    yField: 'revenue',
    seriesField: 'type',
    isGroup: true,
    columnStyle: {
      radius: [4, 4, 0, 0],
    },
    color: ['#1890ff', '#52c41a'],
  };

  return (
    <ChartCard title="Aylık Gelir Analizi" loading={loading}>
      <Column {...config} />
    </ChartCard>
  );
};
