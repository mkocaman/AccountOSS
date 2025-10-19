import React from 'react';
import { Card } from 'antd';

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  loading?: boolean;
  extra?: React.ReactNode;
  style?: React.CSSProperties;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  children,
  loading = false,
  extra,
  style,
}) => {
  return (
    <Card
      title={title}
      loading={loading}
      extra={extra}
      style={style}
      styles={{ body: { padding: '24px' } }}
    >
      {children}
    </Card>
  );
};
