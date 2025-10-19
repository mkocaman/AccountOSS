import React from 'react';
import { Card, Row, Col } from 'antd';
import {
  DollarOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  InboxOutlined,
  FileTextOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { usePageTitle } from '@/hooks/usePageTitle';
import { ReportCategory, reportCategoryLabels } from '@/types/report';

interface ReportCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: ReportCategory;
  path: string;
}

const reportCards: ReportCard[] = [
  {
    id: 'income-statement',
    title: 'Gelir Tablosu',
    description: 'Gelir, gider ve kar/zarar analizi',
    icon: <DollarOutlined />,
    category: ReportCategory.Financial,
    path: '/reports/income-statement'
  },
  {
    id: 'balance-sheet',
    title: 'Bilanço',
    description: 'Varlık, borç ve özkaynak durumu',
    icon: <FileTextOutlined />,
    category: ReportCategory.Financial,
    path: '/reports/balance-sheet'
  },
  {
    id: 'sales-report',
    title: 'Satış Raporu',
    description: 'Satış analizi ve müşteri bazlı raporlar',
    icon: <ShoppingCartOutlined />,
    category: ReportCategory.Sales,
    path: '/reports/sales'
  },
  {
    id: 'purchase-report',
    title: 'Satın Alma Raporu',
    description: 'Alış analizi ve tedarikçi bazlı raporlar',
    icon: <ShoppingOutlined />,
    category: ReportCategory.Purchase,
    path: '/reports/purchases'
  },
  {
    id: 'inventory-report',
    title: 'Stok Durumu',
    description: 'Mevcut stok ve değerleme raporu',
    icon: <InboxOutlined />,
    category: ReportCategory.Inventory,
    path: '/reports/inventory'
  },
  {
    id: 'stock-movements',
    title: 'Stok Hareketleri',
    description: 'Giriş-çıkış ve hareket detayları',
    icon: <InboxOutlined />,
    category: ReportCategory.Inventory,
    path: '/reports/stock-movements-report'
  },
  {
    id: 'receivables-aging',
    title: 'Alacak Yaşlandırma',
    description: 'Müşteri alacakları vade analizi',
    icon: <UserOutlined />,
    category: ReportCategory.Accounting,
    path: '/reports/receivables-aging'
  },
  {
    id: 'payables-aging',
    title: 'Borç Yaşlandırma',
    description: 'Tedarikçi borçları vade analizi',
    icon: <UserOutlined />,
    category: ReportCategory.Accounting,
    path: '/reports/payables-aging'
  }
];

export default function ReportsDashboard() {
  usePageTitle('Raporlar');
  const navigate = useNavigate();

  // Group reports by category
  const reportsByCategory = React.useMemo(() => {
    const grouped: Record<ReportCategory, ReportCard[]> = {
      [ReportCategory.Financial]: [],
      [ReportCategory.Inventory]: [],
      [ReportCategory.Sales]: [],
      [ReportCategory.Purchase]: [],
      [ReportCategory.Accounting]: [],
      [ReportCategory.Custom]: []
    };

    reportCards.forEach(report => {
      grouped[report.category].push(report);
    });

    return grouped;
  }, []);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Raporlar</h1>
        <p className="text-gray-600 mt-1">
          İşletme analitiği ve karar destek raporları
        </p>
      </div>

      {/* Report Categories */}
      {Object.entries(reportsByCategory).map(([category, reports]) => {
        if (reports.length === 0) return null;

        return (
          <div key={category} className="mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {reportCategoryLabels[category as ReportCategory]}
            </h2>
            <Row gutter={[16, 16]}>
              {reports.map(report => (
                <Col key={report.id} xs={24} sm={12} md={8} lg={6}>
                  <Card
                    hoverable
                    onClick={() => navigate(report.path)}
                    className="h-full"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="text-4xl text-blue-600 mb-3">
                        {report.icon}
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        {report.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {report.description}
                      </p>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        );
      })}
    </div>
  );
}

