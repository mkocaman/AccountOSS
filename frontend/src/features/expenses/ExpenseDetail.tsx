import { useState } from 'react';
import { 
  Card, 
  Descriptions, 
  Button, 
  Space, 
  Tag,
  Row,
  Col,
  Spin,
  message,
  Alert,
  Modal,
  Form,
  InputNumber,
  DatePicker,
  Select,
  Image,
  Input
} from 'antd';
import { 
  ArrowLeftOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  DollarOutlined,
  FileImageOutlined
} from '@ant-design/icons';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';

import { expensesApi } from '@/api/expenses';
import { 
  ExpenseStatus, 
  PaymentStatus,
  expenseStatusLabels, 
  expenseStatusColors,
  paymentStatusLabels,
  paymentStatusColors,
  paymentMethodLabels,
  PaymentMethod
} from '@/types/expense';
import type { RecordPaymentRequest } from '@/types/expense';
import { formatCurrency, formatDate } from '@/lib/utils';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function ExpenseDetail() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [paymentModalOpen, setPaymentModalOpen] = useState(searchParams.get('payment') === 'true');
  const [paymentForm] = Form.useForm();

  // Fetch expense
  const { data: expense, isLoading } = useQuery({
    queryKey: ['expense', id],
    queryFn: () => expensesApi.getById(id!),
    enabled: !!id
  });

  usePageTitle(expense ? `${expense.expenseNumber} - Masraf Detayı` : 'Masraf Detayı');

  // Submit for approval mutation
  const submitMutation = useMutation({
    mutationFn: (id: string) => expensesApi.submitForApproval(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense', id] });
      message.success('Onaya gönderildi');
    }
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: (id: string) => expensesApi.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense', id] });
      message.success('Masraf onaylandı');
    }
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => 
      expensesApi.reject(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense', id] });
      message.success('Masraf reddedildi');
    }
  });

  // Payment mutation
  const paymentMutation = useMutation({
    mutationFn: (data: RecordPaymentRequest) => 
      expensesApi.recordPayment(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense', id] });
      setPaymentModalOpen(false);
      paymentForm.resetFields();
      message.success('Ödeme kaydedildi');
    }
  });

  const handleReject = () => {
    const reason = prompt('Red nedeni:');
    if (reason) {
      rejectMutation.mutate({ id: id!, reason });
    }
  };

  const handlePaymentSubmit = async (values: any) => {
    const data: RecordPaymentRequest = {
      amount: values.amount,
      paymentDate: values.paymentDate.format('YYYY-MM-DD'),
      paymentMethod: values.paymentMethod,
      notes: values.notes
    };

    await paymentMutation.mutateAsync(data);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">Masraf bulunamadı</div>
            <Button type="primary" onClick={() => navigate('/expenses')} className="mt-4">
              Masraf Listesine Dön
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const remainingAmount = expense.totalAmount - expense.paidAmount;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/expenses')}
          className="mb-4"
        >
          Geri
        </Button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {expense.expenseNumber}
            </h1>
            <h2 className="text-lg text-gray-700 mb-2">{expense.description}</h2>
            <Space>
              <Tag color={expenseStatusColors[expense.status]} className="text-base px-3 py-1">
                {expenseStatusLabels[expense.status]}
              </Tag>
              <Tag color={paymentStatusColors[expense.paymentStatus]} className="text-base px-3 py-1">
                {paymentStatusLabels[expense.paymentStatus]}
              </Tag>
              {expense.requiresApproval && (
                <Tag color="orange" className="text-base px-3 py-1">
                  Onay Gerekli
                </Tag>
              )}
            </Space>
          </div>

          <Space>
            {expense.status === ExpenseStatus.Draft && (
              <>
                <Button
                  icon={<EditOutlined />}
                  onClick={() => navigate(`/expenses/edit/${expense.id}`)}
                >
                  Düzenle
                </Button>
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={() => submitMutation.mutate(expense.id)}
                  loading={submitMutation.isPending}
                >
                  Onaya Gönder
                </Button>
              </>
            )}
            {expense.status === ExpenseStatus.PendingApproval && (
              <>
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={() => approveMutation.mutate(expense.id)}
                  loading={approveMutation.isPending}
                >
                  Onayla
                </Button>
                <Button
                  danger
                  icon={<CloseOutlined />}
                  onClick={handleReject}
                  loading={rejectMutation.isPending}
                >
                  Reddet
                </Button>
              </>
            )}
            {expense.status === ExpenseStatus.Approved && expense.paymentStatus !== PaymentStatus.Paid && (
              <Button
                type="primary"
                icon={<DollarOutlined />}
                onClick={() => setPaymentModalOpen(true)}
              >
                Ödeme Kaydet
              </Button>
            )}
          </Space>
        </div>
      </div>

      {/* Rejection Info */}
      {expense.status === ExpenseStatus.Rejected && expense.rejectionReason && (
        <Alert
          message="Masraf Reddedildi"
          description={`Red Nedeni: ${expense.rejectionReason}`}
          type="error"
          showIcon
          className="mb-4"
        />
      )}

      {/* Approval Info */}
      {expense.status === ExpenseStatus.Approved && expense.approvedByUser && (
        <Alert
          message="Masraf Onaylandı"
          description={
            <div>
              <div>Onaylayan: {expense.approvedByUser.name}</div>
              <div>Onay Tarihi: {formatDate(expense.approvedDate!)}</div>
            </div>
          }
          type="success"
          showIcon
          className="mb-4"
        />
      )}

      {/* Summary Cards */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <div className="text-gray-600 mb-2">Toplam Tutar</div>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(expense.totalAmount, expense.currency)}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <div className="text-gray-600 mb-2">Ödenen</div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(expense.paidAmount, expense.currency)}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <div className="text-gray-600 mb-2">Kalan</div>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(remainingAmount, expense.currency)}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <div className="text-gray-600 mb-2">KDV</div>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(expense.taxAmount, expense.currency)}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Expense Info */}
      <Card title="Masraf Bilgileri" className="mb-4">
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 2 }}>
          <Descriptions.Item label="Masraf No">{expense.expenseNumber}</Descriptions.Item>
          <Descriptions.Item label="Durum">
            <Space>
              <Tag color={expenseStatusColors[expense.status]}>
                {expenseStatusLabels[expense.status]}
              </Tag>
              <Tag color={paymentStatusColors[expense.paymentStatus]}>
                {paymentStatusLabels[expense.paymentStatus]}
              </Tag>
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Tarih">{formatDate(expense.expenseDate)}</Descriptions.Item>
          <Descriptions.Item label="Kategori">
            {expense.category?.name}
            <div className="text-xs text-gray-500">{expense.category?.code}</div>
          </Descriptions.Item>
          <Descriptions.Item label="Tedarikçi">
            {expense.supplier ? (
              <div>
                <div>{expense.supplier.name}</div>
                <div className="text-xs text-gray-500">{expense.supplier.code}</div>
              </div>
            ) : (
              <span className="text-gray-400">-</span>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Fatura/Fiş No">
            {expense.invoiceNumber || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Tutar">
            <span className="font-semibold">
              {formatCurrency(expense.amount, expense.currency)}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="KDV">
            {formatCurrency(expense.taxAmount, expense.currency)}
          </Descriptions.Item>
          <Descriptions.Item label="Toplam Tutar">
            <span className="text-lg font-bold text-green-600">
              {formatCurrency(expense.totalAmount, expense.currency)}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="Ödeme Yöntemi">
            {paymentMethodLabels[expense.paymentMethod]}
          </Descriptions.Item>
          {expense.paidAmount > 0 && (
            <>
              <Descriptions.Item label="Ödenen Tutar">
                <span className="text-green-600 font-semibold">
                  {formatCurrency(expense.paidAmount, expense.currency)}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Ödeme Tarihi">
                {expense.paidDate ? formatDate(expense.paidDate) : '-'}
              </Descriptions.Item>
            </>
          )}
          <Descriptions.Item label="Oluşturan">
            {expense.createdByUser?.name || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Oluşturma Tarihi">
            {formatDate(expense.createdAt)}
          </Descriptions.Item>
          {expense.description && (
            <Descriptions.Item label="Açıklama" span={2}>
              {expense.description}
            </Descriptions.Item>
          )}
          {expense.notes && (
            <Descriptions.Item label="Notlar" span={2}>
              {expense.notes}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* Attachments */}
      {expense.attachments && expense.attachments.length > 0 && (
        <Card title="Ekler" className="mb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {expense.attachments.map((attachment) => (
              <div key={attachment.id} className="border rounded p-2">
                {attachment.fileName.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                  <Image
                    src={attachment.fileUrl}
                    alt={attachment.fileName}
                    className="w-full h-32 object-cover rounded"
                  />
                ) : (
                  <div className="flex items-center justify-center h-32 bg-gray-100 rounded">
                    <FileImageOutlined className="text-4xl text-gray-400" />
                  </div>
                )}
                <div className="mt-2 text-xs text-gray-600 truncate">
                  {attachment.fileName}
                </div>
                <div className="text-xs text-gray-400">
                  {(attachment.fileSize / 1024).toFixed(2)} KB
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Payment Modal */}
      <Modal
        title="Ödeme Kaydet"
        open={paymentModalOpen}
        onCancel={() => setPaymentModalOpen(false)}
        onOk={() => paymentForm.submit()}
        confirmLoading={paymentMutation.isPending}
      >
        <Form
          form={paymentForm}
          layout="vertical"
          onFinish={handlePaymentSubmit}
          initialValues={{
            amount: remainingAmount,
            paymentDate: dayjs(),
            paymentMethod: expense.paymentMethod
          }}
        >
          <Alert
            message="Kalan Tutar"
            description={
              <div className="text-xl font-bold">
                {formatCurrency(remainingAmount, expense.currency)}
              </div>
            }
            type="info"
            className="mb-4"
          />

          <Form.Item
            name="amount"
            label="Ödeme Tutarı"
            rules={[
              { required: true, message: 'Tutar zorunludur' },
              { 
                validator: (_, value) => {
                  if (value > remainingAmount) {
                    return Promise.reject('Tutar kalan tutardan fazla olamaz');
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <InputNumber
              className="w-full"
              min={0}
              max={remainingAmount}
              precision={2}
              addonAfter={expense.currency}
            />
          </Form.Item>

          <Form.Item
            name="paymentDate"
            label="Ödeme Tarihi"
            rules={[{ required: true, message: 'Tarih zorunludur' }]}
          >
            <DatePicker className="w-full" />
          </Form.Item>

          <Form.Item
            name="paymentMethod"
            label="Ödeme Yöntemi"
            rules={[{ required: true, message: 'Ödeme yöntemi zorunludur' }]}
          >
            <Select
              options={Object.entries(paymentMethodLabels).map(([value, label]) => ({
                label,
                value: Number(value)
              }))}
            />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Notlar"
          >
            <Input.TextArea rows={2} placeholder="Ödeme notları..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

