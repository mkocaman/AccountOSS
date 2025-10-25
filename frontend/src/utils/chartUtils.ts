import type { TooltipProps } from 'recharts';

// Para birimi formatı
export const formatCurrency = (value: number, locale: string = 'tr-TR'): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Kısa para formatı (K, M notasyonu ile)
export const formatCurrencyShort = (value: number, locale: string = 'tr-TR'): string => {
  if (value >= 1000000) {
    return `₺${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `₺${(value / 1000).toFixed(0)}K`;
  }
  return formatCurrency(value, locale);
};

// Sayı formatı (binlik ayırıcı)
export const formatNumber = (value: number, locale: string = 'tr-TR'): string => {
  return new Intl.NumberFormat(locale).format(value);
};

// Yüzde formatı
export const formatPercent = (value: number): string => {
  return `%${value.toFixed(1)}`;
};

// Tarih formatı (Grafik için)
export const formatDate = (dateString: string, locale: string = 'tr-TR'): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
  }).format(date);
};

// Ay formatı (YYYY-MM -> Ocak 2024)
export const formatMonth = (monthString: string, locale: string = 'tr-TR'): string => {
  const [year, month] = monthString.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
  }).format(date);
};

// Grafik renk paleti
export const chartColors = {
  primary: '#1890ff',
  success: '#52c41a',
  warning: '#faad14',
  error: '#ff4d4f',
  purple: '#722ed1',
  cyan: '#13c2c2',
  
  // Çok renkli set (Pie/Donut chart için)
  palette: [
    '#1890ff', // Mavi
    '#52c41a', // Yeşil
    '#faad14', // Turuncu
    '#ff4d4f', // Kırmızı
    '#722ed1', // Mor
    '#13c2c2', // Cyan
    '#eb2f96', // Pembe
    '#fa8c16', // Turuncu 2
  ],
};

// Custom Tooltip bileşeni için wrapper
export const CustomTooltipWrapper: React.FC<
  TooltipProps<number, string> & {
    formatter?: (value: number) => string;
    labelFormatter?: (label: string) => string;
  }
> = ({ active, payload, label, formatter, labelFormatter }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div
      style={{
        backgroundColor: '#fff',
        padding: '12px',
        border: '1px solid #d9d9d9',
        borderRadius: '4px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      }}
    >
      {label && (
        <div style={{ marginBottom: 8, fontWeight: 600, color: '#262626' }}>
          {labelFormatter ? labelFormatter(label) : label}
        </div>
      )}
      {payload.map((entry, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 4,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              backgroundColor: entry.color,
              marginRight: 8,
              borderRadius: 2,
            }}
          />
          <span style={{ color: '#595959', marginRight: 8 }}>
            {entry.name}:
          </span>
          <span style={{ fontWeight: 600, color: '#262626' }}>
            {formatter ? formatter(entry.value as number) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// Responsive chart boyutları
export const getResponsiveChartHeight = (windowWidth: number): number => {
  if (windowWidth < 576) return 250; // Mobile
  if (windowWidth < 992) return 300; // Tablet
  return 350; // Desktop
};
