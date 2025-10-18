import { Row, Col, Card, Statistic, Progress } from 'antd';
import {
  ArrowUpOutlined,
  DollarOutlined,
  ShoppingOutlined,
  UserOutlined,
  FileTextOutlined,
} from '@ant-design/icons';

// Dashboard ana sayfası
export const Dashboard = () => {
  return (
    <div>
      {/* Başlık */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500">Genel bakış ve önemli metrikler</p>
      </div>

      {/* KPI Cards */}
      <Row gutter={[16, 16]}>
        {/* Toplam Satış */}
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Toplam Satış"
              value={125000}
              precision={2}
              prefix={<DollarOutlined />}
              suffix="TRY"
              valueStyle={{ color: '#3f8600' }}
            />
            <div className="mt-2 flex items-center gap-1 text-sm">
              <ArrowUpOutlined className="text-green-500" />
              <span className="text-green-500">12.5%</span>
              <span className="text-gray-500">vs geçen ay</span>
            </div>
          </Card>
        </Col>

        {/* Toplam Fatura */}
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Toplam Fatura"
              value={156}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <div className="mt-2 flex items-center gap-1 text-sm">
              <ArrowUpOutlined className="text-green-500" />
              <span className="text-green-500">8.2%</span>
              <span className="text-gray-500">vs geçen ay</span>
            </div>
          </Card>
        </Col>

        {/* Toplam Müşteri */}
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Toplam Müşteri"
              value={342}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
            <div className="mt-2 flex items-center gap-1 text-sm">
              <ArrowUpOutlined className="text-green-500" />
              <span className="text-green-500">5.1%</span>
              <span className="text-gray-500">vs geçen ay</span>
            </div>
          </Card>
        </Col>

        {/* Ürün Sayısı */}
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Ürün Sayısı"
              value={1289}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
            <div className="mt-2 flex items-center gap-1 text-sm">
              <ArrowUpOutlined className="text-green-500" />
              <span className="text-green-500">15.3%</span>
              <span className="text-gray-500">vs geçen ay</span>
            </div>
          </Card>
        </Col>
      </Row>

      {/* İkinci Satır */}
      <Row gutter={[16, 16]} className="mt-6">
        {/* Son Faturalar */}
        <Col xs={24} lg={12}>
          <Card title="Son Faturalar" extra={<a href="/invoices">Tümünü Gör</a>}>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <div>
                    <div className="font-medium">Fatura #2025/000{item}</div>
                    <div className="text-sm text-gray-500">Müşteri Adı</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">12,500.00 TRY</div>
                    <div className="text-sm text-gray-500">2 gün önce</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* Stok Durumu */}
        <Col xs={24} lg={12}>
          <Card title="Düşük Stok Uyarıları" extra={<a href="/stock">Detay</a>}>
            <div className="space-y-4">
              {[
                { name: 'Ürün A', stock: 5, min: 10, percent: 50 },
                { name: 'Ürün B', stock: 12, min: 20, percent: 60 },
                { name: 'Ürün C', stock: 3, min: 15, percent: 20 },
                { name: 'Ürün D', stock: 8, min: 10, percent: 80 },
              ].map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">{item.name}</span>
                    <span className="text-sm text-gray-500">
                      {item.stock} / {item.min}
                    </span>
                  </div>
                  <Progress
                    percent={item.percent}
                    status={item.percent < 50 ? 'exception' : 'normal'}
                    size="small"
                  />
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* GR Kuyruğu Özeti */}
      <Row gutter={[16, 16]} className="mt-6">
        <Col span={24}>
          <Card title="GR Kuyruğu Özeti">
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="Bekleyen GR Kayıtları"
                  value={23}
                  valueStyle={{ color: '#faad14' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Toplam Bekleyen Tutar"
                  value={45600}
                  prefix="$"
                  valueStyle={{ color: '#cf1322' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Bu Ay Aklanan"
                  value={12}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

