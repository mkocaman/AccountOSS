import React from 'react';
import { Card, Statistic } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

interface StatisticCardProps {
  title: string;
  value: number;
  precision?: number;
  prefix?: React.ReactNode;
  suffix?: string;
  valueStyle?: React.CSSProperties;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  loading?: boolean;
}

export const StatisticCard: React.FC<StatisticCardProps> = ({
  title,
  value,
  precision = 2,
  prefix,
  suffix,
  valueStyle,
  trend,
  loading = false,
}) => {
  return (
    <Card loading={loading}>
      <Statistic
        title={title}
        value={value}
        precision={precision}
        prefix={prefix}
        suffix={suffix}
        valueStyle={valueStyle}
      />
      {trend && (
        <div className="mt-2 flex items-center text-sm">
          {trend.isPositive ? (
            <ArrowUpOutlined className="text-green-600 mr-1" />
          ) : (
            <ArrowDownOutlined className="text-red-600 mr-1" />
          )}
          <span className={trend.isPositive ? 'text-green-600' : 'text-red-600'}>
            {Math.abs(trend.value).toFixed(1)}%
          </span>
          <span className="text-gray-500 ml-1">bu ay</span>
        </div>
      )}
    </Card>
  );
};
