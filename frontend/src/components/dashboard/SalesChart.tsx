import React from 'react';
import { Line } from '@ant-design/plots';
import { ChartCard } from './ChartCard';

interface SalesChartProps {
  data?: Array<{
    period: string;
    sales: number;
    target: number;
  }>;
  loading?: boolean;
}

export const SalesChart: React.FC<SalesChartProps> = ({ data = [], loading = false }) => {
  const config = {
    data,
    xField: 'period',
    yField: 'sales',
    point: {
      size: 5,
      shape: 'diamond',
    },
    label: {
      style: {
        fill: '#aaa',
      },
    },
    smooth: true,
    color: '#1890ff',
  };

  return (
    <ChartCard title="Satış Trendi" loading={loading}>
      <Line {...config} />
    </ChartCard>
  );
};
