import { Card, Divider } from 'antd';
import type { InvoiceItem } from '@/types/invoice';

interface InvoiceSummaryProps {
  items: InvoiceItem[];
  currency: string;
}

// Fatura özeti (ara toplam, KDV, genel toplam)
export const InvoiceSummary = ({ items, currency }: InvoiceSummaryProps) => {
  // Hesaplamalar
  const subTotal = items.reduce((sum, item) => {
    const gross = item.quantity * item.unitPrice;
    return sum + (gross - item.discountAmount);
  }, 0);

  const totalDiscount = items.reduce((sum, item) => sum + item.discountAmount, 0);
  const totalVat = items.reduce((sum, item) => sum + item.vatAmount, 0);
  const grandTotal = items.reduce((sum, item) => sum + item.lineTotal, 0);

  return (
    <Card className="bg-gray-50">
      <div className="max-w-md ml-auto">
        <div className="flex justify-between py-2">
          <span className="text-gray-600">Ara Toplam:</span>
          <span className="font-medium">
            {subTotal.toFixed(2)} {currency}
          </span>
        </div>

        {totalDiscount > 0 && (
          <div className="flex justify-between py-2 text-red-600">
            <span>Toplam İndirim:</span>
            <span className="font-medium">
              -{totalDiscount.toFixed(2)} {currency}
            </span>
          </div>
        )}

        <div className="flex justify-between py-2">
          <span className="text-gray-600">Toplam KDV:</span>
          <span className="font-medium">
            {totalVat.toFixed(2)} {currency}
          </span>
        </div>

        <Divider className="my-3" />

        <div className="flex justify-between py-2">
          <span className="text-lg font-medium">Genel Toplam:</span>
          <span className="text-2xl font-bold text-primary">
            {grandTotal.toFixed(2)} {currency}
          </span>
        </div>

        {/* KDV Detayı */}
        <div className="mt-4 text-xs text-gray-500 space-y-1">
          {getVatBreakdown(items).map((vat, index) => (
            <div key={index} className="flex justify-between">
              <span>%{vat.rate} KDV Matrahı:</span>
              <span>
                {vat.base.toFixed(2)} {currency}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

// KDV dağılımı hesapla
function getVatBreakdown(items: InvoiceItem[]) {
  const vatMap = new Map<number, number>();

  items.forEach((item) => {
    const base = item.quantity * item.unitPrice - item.discountAmount;
    const currentBase = vatMap.get(item.vatRate) || 0;
    vatMap.set(item.vatRate, currentBase + base);
  });

  return Array.from(vatMap.entries())
    .map(([rate, base]) => ({ rate, base }))
    .sort((a, b) => b.rate - a.rate);
}

