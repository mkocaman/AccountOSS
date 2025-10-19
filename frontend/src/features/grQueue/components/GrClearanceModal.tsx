import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Form, 
  Select, 
  InputNumber, 
  Input,
  Alert,
  Space,
  Tag,
  Divider,
  Row,
  Col,
  Statistic,
  Button,
  message
} from 'antd';
import { 
  InfoCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';

import { grQueueApi } from '@/api/grQueue';
import { invoicesApi } from '@/api/invoices';
import type { GrQueueEntry, ClearGrQueueRequest } from '@/types/grQueue';
import type { Invoice } from '@/types/invoice';

interface Props {
  open: boolean;
  grQueueEntry: GrQueueEntry;
  onCancel: () => void;
  onSuccess: () => void;
}

// GR Aklama Modal
const GrClearanceModal = ({ open, grQueueEntry, onCancel, onSuccess }: Props) => {
  const [form] = Form.useForm();
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>();
  const [suggestions, setSuggestions] = useState<any>(null);
  const [purchaseInvoices, setPurchaseInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadSuggestions();
      loadPurchaseInvoices();
    }
  }, [open, grQueueEntry.id]);

  const loadSuggestions = async () => {
    try {
      const response = await grQueueApi.getSuggestions(grQueueEntry.id);
      if (response.success) {
        setSuggestions(response.data);
      }
    } catch (error) {
      console.error('Öneriler yüklenemedi');
    }
  };

  const loadPurchaseInvoices = async () => {
    setLoading(true);
    try {
      const response = await invoicesApi.getAll({ 
        type: 1, // Purchase
        isOfficial: true,
        pageSize: 100 
      });
      if (response.success) {
        setPurchaseInvoices(response.data.items);
      }
    } catch (error) {
      message.error('Alış faturaları yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  // Auto-fill amount when invoice selected
  useEffect(() => {
    if (selectedInvoiceId) {
      const invoice = purchaseInvoices.find(i => i.id === selectedInvoiceId);
      if (invoice) {
        // Kalan tutar ile fatura tutarının küçüğünü al
        const suggestedAmount = Math.min(
          grQueueEntry.remainingAmount,
          invoice.grandTotal
        );
        form.setFieldValue('amount', suggestedAmount);
      }
    }
  }, [selectedInvoiceId, purchaseInvoices, grQueueEntry.remainingAmount]);

  const handleSubmit = async (values: any) => {
    try {
      await grQueueApi.clear({
        grQueueEntryId: grQueueEntry.id,
        officialInvoiceId: values.officialInvoiceId,
        amount: values.amount,
        notes: values.notes
      });
      onSuccess();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Aklama işlemi başarısız');
    }
  };

  const selectedInvoice = purchaseInvoices.find(i => i.id === selectedInvoiceId);

  const formatCurrency = (amount: number, currency: string) => {
    return `${amount.toFixed(2)} ${currency}`;
  };

  const formatDate = (date: string) => {
    return dayjs(date).format('DD.MM.YYYY');
  };

  return (
    <Modal
      title="GR Aklama İşlemi"
      open={open}
      onCancel={onCancel}
      width={800}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          İptal
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={() => form.submit()}
        >
          Akla
        </Button>
      ]}
    >
      {/* GR Entry Info */}
      <Alert
        message="Gayriresmi Satış Bilgileri"
        description={
          <div className="mt-2">
            <Row gutter={16}>
              <Col span={8}>
                <div className="text-gray-600 text-sm">Fatura No</div>
                <div className="font-semibold">
                  {grQueueEntry.unofficialInvoice.invoiceNumber}
                </div>
              </Col>
              <Col span={8}>
                <div className="text-gray-600 text-sm">Müşteri</div>
                <div className="font-semibold">
                  {grQueueEntry.unofficialInvoice.customer.name}
                </div>
              </Col>
              <Col span={8}>
                <div className="text-gray-600 text-sm">Tarih</div>
                <div className="font-semibold">
                  {formatDate(grQueueEntry.entryDate)}
                </div>
              </Col>
            </Row>
            <Row gutter={16} className="mt-4">
              <Col span={12}>
                <Statistic
                  title="Orijinal Tutar"
                  value={grQueueEntry.originalAmount}
                  precision={2}
                  suffix={grQueueEntry.currency}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Kalan Tutar"
                  value={grQueueEntry.remainingAmount}
                  precision={2}
                  suffix={grQueueEntry.currency}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Col>
            </Row>
          </div>
        }
        type="info"
        icon={<InfoCircleOutlined />}
        className="mb-4"
      />

      {/* Suggestions */}
      {suggestions && suggestions.suggestedInvoices.length > 0 && (
        <Alert
          message="Önerilen Eşleştirmeler"
          description={
            <div className="mt-2">
              {suggestions.suggestedInvoices.slice(0, 3).map((sug: any) => (
                <div key={sug.invoiceId} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <div>
                    <span className="font-semibold">{sug.invoiceNumber}</span>
                    <span className="ml-2 text-gray-600">{formatDate(sug.invoiceDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{formatCurrency(sug.amount, grQueueEntry.currency)}</span>
                    <Tag color="green">{sug.matchScore}% uyum</Tag>
                    <Button
                      size="small"
                      onClick={() => {
                        form.setFieldValue('officialInvoiceId', sug.invoiceId);
                        setSelectedInvoiceId(sug.invoiceId);
                      }}
                    >
                      Seç
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          }
          type="success"
          icon={<CheckCircleOutlined />}
          className="mb-4"
        />
      )}

      <Divider />

      {/* Form */}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="officialInvoiceId"
          label="Resmi Alış Faturası"
          rules={[{ required: true, message: 'Fatura seçimi zorunludur' }]}
        >
          <Select
            placeholder="Fatura seçin"
            showSearch
            optionFilterProp="children"
            onChange={setSelectedInvoiceId}
            loading={loading}
            options={purchaseInvoices.map(inv => ({
              label: `${inv.invoiceNumber} - ${formatCurrency(inv.grandTotal, inv.currency)} - ${formatDate(inv.invoiceDate)}`,
              value: inv.id
            }))}
          />
        </Form.Item>

        {/* Selected Invoice Info */}
        {selectedInvoice && (
          <Alert
            message="Seçili Fatura Detayı"
            description={
              <Row gutter={16}>
                <Col span={8}>
                  <div className="text-gray-600 text-sm">Fatura No</div>
                  <div className="font-semibold">{selectedInvoice.invoiceNumber}</div>
                </Col>
                <Col span={8}>
                  <div className="text-gray-600 text-sm">Tarih</div>
                  <div className="font-semibold">{formatDate(selectedInvoice.invoiceDate)}</div>
                </Col>
                <Col span={8}>
                  <div className="text-gray-600 text-sm">Tutar</div>
                  <div className="font-semibold">
                    {formatCurrency(selectedInvoice.grandTotal, selectedInvoice.currency)}
                  </div>
                </Col>
              </Row>
            }
            type="info"
            className="mb-4"
          />
        )}

        <Form.Item
          name="amount"
          label="Aklama Tutarı"
          rules={[
            { required: true, message: 'Tutar zorunludur' },
            { 
              type: 'number', 
              max: grQueueEntry.remainingAmount,
              message: `Tutar ${grQueueEntry.remainingAmount} ${grQueueEntry.currency}'den fazla olamaz`
            }
          ]}
        >
          <InputNumber
            className="w-full"
            min={0}
            max={grQueueEntry.remainingAmount}
            precision={2}
            addonAfter={grQueueEntry.currency}
            placeholder="Aklama tutarı"
          />
        </Form.Item>

        {/* Warning if amount != remaining */}
        <Form.Item noStyle shouldUpdate>
          {() => {
            const amount = form.getFieldValue('amount');
            if (amount && amount < grQueueEntry.remainingAmount) {
              return (
                <Alert
                  message="Kısmi Aklama"
                  description={`Girilen tutar kalan tutardan düşük. İşlem sonrası ${grQueueEntry.remainingAmount - amount} ${grQueueEntry.currency} bakiye kalacak.`}
                  type="warning"
                  icon={<WarningOutlined />}
                  showIcon
                  className="mb-4"
                />
              );
            }
            return null;
          }}
        </Form.Item>

        <Form.Item
          name="notes"
          label="Notlar (Opsiyonel)"
        >
          <Input.TextArea
            rows={3}
            placeholder="Aklama işlemi hakkında notlar..."
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default GrClearanceModal;
