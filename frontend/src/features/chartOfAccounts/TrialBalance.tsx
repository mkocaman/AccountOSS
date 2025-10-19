import { useState } from 'react';
import { Card, Table, DatePicker, Button, Space, Row, Col, Statistic } from 'antd';
import { ArrowLeftOutlined, FilePdfOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

import { chartOfAccountsApi } from '@/api/chartOfAccounts';
import { formatCurrency } from '@/lib/utils';
import { usePageTitle } from '@/hooks/usePageTitle';

const { RangePicker } = DatePicker;

interface TrialBalanceRow {
  accountCode: string;
  accountName: string;
  debitBalance: number;
  creditBalance: number;
}

export default function TrialBalance() {
  usePageTitle('Mizan');
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().startOf('year'),
    dayjs()
  ]);

  // Fetch trial balance
  const { data, isLoading } = useQuery({
    queryKey: ['trialBalance', dateRange],
    queryFn: () => chartOfAccountsApi.getTrialBalance({
      startDate: dateRange[0].format('YYYY-MM-DD'),
      endDate: dateRange[1].format('YYYY-MM-DD')
    })
  });

  const columns: ColumnsType<TrialBalanceRow> = [
    {
      title: 'Hesap Kodu',
      dataIndex: 'accountCode',
      key: 'accountCode',
      width: 150,
      render: (code: string) => (
        <span className="font-mono font-semibold">{code}</span>
      )
    },
    {
      title: 'Hesap Adı',
      dataIndex: 'accountName',
      key: 'accountName'
    },
    {
      title: 'Borç',
      dataIndex: 'debitBalance',
      key: 'debitBalance',
      width: 150,
      align: 'right',
      render: (balance: number) => (
        balance > 0 ? (
          <span className="text-blue-600 font-semibold">
            {formatCurrency(balance, 'TRY')}
          </span>
        ) : '-'
      )
    },
    {
      title: 'Alacak',
      dataIndex: 'creditBalance',
      key: 'creditBalance',
      width: 150,
      align: 'right',
      render: (balance: number) => (
        balance > 0 ? (
          <span className="text-green-600 font-semibold">
            {formatCurrency(balance, 'TRY')}
          </span>
        ) : '-'
      )
    }
  ];

  const totalDebit = data?.items?.reduce((sum: number, item: any) => sum + item.debitBalance, 0) || 0;
  const totalCredit = data?.items?.reduce((sum: number, item: any) => sum + item.creditBalance, 0) || 0;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/chart-of-accounts')}
          className="mb-4"
        >
          Geri
        </Button>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mizan</h1>
            <p className="text-gray-600 mt-1">
              Hesap hareketleri özeti ve bakiye kontrolü
            </p>
          </div>
          <Space>
            <RangePicker
              value={dateRange}
              onChange={(dates) => dates && setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
              format="DD/MM/YYYY"
            />
            <Button icon={<FilePdfOutlined />}>
              PDF İndir
            </Button>
          </Space>
        </div>
      </div>

      {/* Summary */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="Toplam Borç"
              value={totalDebit}
              precision={2}
              suffix="TRY"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="Toplam Alacak"
              value={totalCredit}
              precision={2}
              suffix="TRY"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={data?.items || []}
          rowKey="accountCode"
          loading={isLoading}
          pagination={false}
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={2}>
                  <strong className="text-lg">TOPLAM</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} align="right">
                  <strong className="text-lg text-blue-600">
                    {formatCurrency(totalDebit, 'TRY')}
                  </strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3} align="right">
                  <strong className="text-lg text-green-600">
                    {formatCurrency(totalCredit, 'TRY')}
                  </strong>
                </Table.Summary.Cell>
              </Table.Summary.Row>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={2}>
                  <strong>FARK</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} colSpan={2} align="right">
                  <strong className={totalDebit - totalCredit === 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatCurrency(Math.abs(totalDebit - totalCredit), 'TRY')}
                    {totalDebit - totalCredit === 0 && ' ✓ Dengede'}
                  </strong>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </Card>
    </div>
  );
}

