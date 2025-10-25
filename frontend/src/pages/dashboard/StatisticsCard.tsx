import React from 'react';
import { Card, Statistic, Row, Col, Badge, Tooltip } from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

interface StatisticsCardProps {
  title: string;
  value: number | string;
  prefix?: React.ReactNode;
  suffix?: string;
  precision?: number;
  valueStyle?: React.CSSProperties;
  change?: number; // Önceki döneme göre % değişim
  loading?: boolean;
  tooltip?: string;
  icon?: React.ReactNode;
  color?: string; // Kart rengi: 'blue' | 'green' | 'red' | 'orange' | 'purple'
}

export const StatisticsCard: React.FC<StatisticsCardProps> = ({
  title,
  value,
  prefix,
  suffix,
  precision = 0,
  valueStyle,
  change,
  loading = false,
  tooltip,
  icon,
  color = 'blue',
}) => {
  const { t } = useTranslation();

  // Renk teması
  const colorMap = {
    blue: { bg: '#e6f7ff', border: '#1890ff', text: '#1890ff' },
    green: { bg: '#f6ffed', border: '#52c41a', text: '#52c41a' },
    red: { bg: '#fff1f0', border: '#ff4d4f', text: '#ff4d4f' },
    orange: { bg: '#fff7e6', border: '#fa8c16', text: '#fa8c16' },
    purple: { bg: '#f9f0ff', border: '#722ed1', text: '#722ed1' },
  };

  const theme = colorMap[color];

  // Değişim göstergesi
  const renderChange = () => {
    if (change === undefined || change === null) return null;

    const isPositive = change >= 0;
    const changeColor = isPositive ? '#52c41a' : '#ff4d4f';
    const ChangeIcon = isPositive ? ArrowUpOutlined : ArrowDownOutlined;

    return (
      <div style={{ marginTop: 8, fontSize: 12 }}>
        <span style={{ color: changeColor }}>
          <ChangeIcon style={{ marginRight: 4 }} />
          {Math.abs(change).toFixed(1)}%
        </span>
        <span style={{ color: '#8c8c8c', marginLeft: 4 }}>
          {t('dashboard.stats.vsLastPeriod')}
        </span>
      </div>
    );
  };

  return (
    <Card
      loading={loading}
      bordered={false}
      style={{
        borderLeft: `4px solid ${theme.border}`,
        backgroundColor: theme.bg,
        height: '100%',
      }}
      bodyStyle={{ padding: '20px 24px' }}
    >
      <Row gutter={16} align="middle">
        {/* İkon */}
        {icon && (
          <Col>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 8,
                backgroundColor: theme.text,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                color: '#fff',
              }}
            >
              {icon}
            </div>
          </Col>
        )}

        {/* İstatistik */}
        <Col flex={1}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ color: '#8c8c8c', fontSize: 14 }}>{title}</span>
            {tooltip && (
              <Tooltip title={tooltip}>
                <InfoCircleOutlined
                  style={{ marginLeft: 4, color: '#8c8c8c', fontSize: 12 }}
                />
              </Tooltip>
            )}
          </div>

          <Statistic
            value={value}
            prefix={prefix}
            suffix={suffix}
            precision={precision}
            valueStyle={{
              color: theme.text,
              fontSize: 28,
              fontWeight: 600,
              ...valueStyle,
            }}
          />

          {renderChange()}
        </Col>
      </Row>
    </Card>
  );
};
