import { useState } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Input, 
  Select, 
  DatePicker,
  Space, 
  Tag,
  Row,
  Col,
  message,
  Dropdown
} from 'antd';
import type { MenuProps } from 'antd';
import { 
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
  MoreOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

import { expensesApi, expenseCategoriesApi } from '@/api/expenses';
import { partnersApi } from '@/api/partners';
import { PartnerType } from '@/types/partner';
import type { Expense, ExpenseFilters } from '@/types/expense';
import { 
  ExpenseStatus, 
  PaymentStatus,
  expenseStatusLabels, 
  expenseStatusColors,
  paymentStatusLabels,
  paymentStatusColors
} from '@/types/expense';
import { formatCurrency, formatDate } from '@/lib/utils';
import { usePageTitle } from '@/hooks/usePageTitle';
import { showConfirm } from '@/components/ui/ConfirmModal';

const { Search } = Input;
const { RangePicker } = DatePicker;

export default function ExpenseList() {
  usePageTitle('Masraflar');
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<ExpenseFilters>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Fetch expenses
  const { data, isLoading } = useQuery({
    queryKey: ['expenses', filters, page, pageSize],
    queryFn: () => expensesApi.getAll({ ...filters, page, pageSize })
  });

  // Fetch categories for filter
  const { data: categories } = useQuery({
    queryKey: ['expenseCategoriesAll'],
    queryFn: () => expenseCategoriesApi.getAllNoPaging()
  });

  // Fetch suppliers for filter
  const { data: suppliersResponse } = useQuery({
    queryKey: ['suppliers-all'],
    queryFn: () => partnersApi.getAll({ type: PartnerType.Supplier, pageSize: 1000 })
  });

  const suppliers = suppliersResponse?.data;

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => expensesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      message.success('Masraf silindi');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Silme başarısız');
    }
  });

  // Submit for approval mutation
  const submitMutation = useMutation({
    mutationFn: (id: string) => expensesApi.submitForApproval(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      message.success('Onaya gönderildi');
    }
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: (id: string) => expensesApi.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      message.success('Masraf onaylandı');
    }
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => 
      expensesApi.reject(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      message.success('Masraf reddedildi');
    }
  });

  // Table columns
  const columns: ColumnsType<Expense> = [
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      align: 'center',
      render: (status: ExpenseStatus, record) => (
        <Space direction="vertical" size={2}>
          <Tag color={expenseStatusColors[status]}>
            {expenseStatusLabels[status]}
          </Tag>
          <Tag color={paymentStatusColors[record.paymentStatus]}>
            {paymentStatusLabels[record.paymentStatus]}
          </Tag>
        </Space>
      )
    },
    {
      title: 'Masraf No',
      dataIndex: 'expenseNumber',
      key: 'expenseNumber',
      width: 130,
      fixed: 'left',
      render: (num: string) => (
        <span className="font-mono font-semibold">{num}</span>
      )
    },
    {
      title: 'Tarih',
      dataIndex: 'expenseDate',
      key: 'expenseDate',
      width: 110,
      render: (date: string) => formatDate(date),
      sorter: true
    },
    {
      title: 'Kategori',
      key: 'category',
      width: 200,
      ellipsis: true,
      render: (_, record) => (
        <div>
          <div className="font-semibold">{record.category?.name}</div>
          <div className="text-xs text-gray-500">{record.category?.code}</div>
        </div>
      )
    },
    {
      title: 'Tedarikçi',
      key: 'supplier',
      width: 180,
      ellipsis: true,
      render: (_, record) => record.supplier ? (
        <div>
          <div className="font-semibold">{record.supplier.name}</div>
          <div className="text-xs text-gray-500">{record.supplier.code}</div>
        </div>
      ) : (
        <span className="text-gray-400">-</span>
      )
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (desc: string, record) => (
        <div>
          <div>{desc}</div>
          {record.invoiceNumber && (
            <div className="text-xs text-gray-500">Fatura No: {record.invoiceNumber}</div>
          )}
        </div>
      )
    },
    {
      title: 'Tutar',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      align: 'right',
      render: (amount: number, record) => (
        <div>
          <div className="font-semibold">
            {formatCurrency(amount, record.currency)}
          </div>
          {record.taxAmount > 0 && (
            <div className="text-xs text-gray-500">
              KDV: {formatCurrency(record.taxAmount, record.currency)}
            </div>
          )}
        </div>
      ),
      sorter: true
    },
    {
      title: 'Toplam',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      align: 'right',
      render: (total: number, record) => (
        <span className="font-semibold text-lg">
          {formatCurrency(total, record.currency)}
        </span>
      ),
      sorter: true
    },
    {
      title: 'Ödeme',
      key: 'payment',
      width: 120,
      align: 'right',
      render: (_, record) => (
        <div>
          <div className="text-green-600 font-semibold">
            {formatCurrency(record.paidAmount, record.currency)}
          </div>
          {record.paidAmount < record.totalAmount && (
            <div className="text-xs text-orange-600">
              Kalan: {formatCurrency(record.totalAmount - record.paidAmount, record.currency)}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Oluşturan',
      key: 'creator',
      width: 120,
      render: (_, record) => record.createdByUser?.name || '-'
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => {
        const menuItems: MenuProps['items'] = [
          {
            key: 'view',
            icon: <EyeOutlined />,
            label: 'Detay',
            onClick: () => navigate(`/expenses/${record.id}`)
          }
        ];

        if (record.status === ExpenseStatus.Draft) {
          menuItems.push(
            {
              key: 'edit',
              icon: <EditOutlined />,
              label: 'Düzenle',
              onClick: () => navigate(`/expenses/edit/${record.id}`)
            },
            {
              key: 'submit',
              icon: <CheckOutlined />,
              label: 'Onaya Gönder',
              onClick: () => submitMutation.mutate(record.id)
            },
            {
              type: 'divider'
            },
            {
              key: 'delete',
              icon: <DeleteOutlined />,
              label: 'Sil',
              danger: true,
              onClick: () => handleDelete(record)
            }
          );
        }

        if (record.status === ExpenseStatus.PendingApproval) {
          menuItems.push(
            {
              key: 'approve',
              icon: <CheckOutlined />,
              label: 'Onayla',
              onClick: () => approveMutation.mutate(record.id)
            },
            {
              key: 'reject',
              icon: <CloseOutlined />,
              label: 'Reddet',
              danger: true,
              onClick: () => handleReject(record)
            }
          );
        }

        if (record.status === ExpenseStatus.Approved && record.paymentStatus !== PaymentStatus.Paid) {
          menuItems.push({
            key: 'payment',
            icon: <DollarOutlined />,
            label: 'Ödeme Kaydet',
            onClick: () => navigate(`/expenses/${record.id}?payment=true`)
          });
        }

        return (
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <Button size="small" icon={<MoreOutlined />} />
          </Dropdown>
        );
      }
    }
  ];

  const handleDelete = (expense: Expense) => {
    showConfirm({
      title: 'Masrafı Sil',
      content: `${expense.expenseNumber} numaralı masrafı silmek istediğinize emin misiniz?`,
      okType: 'danger',
      onOk: async () => {
        await deleteMutation.mutateAsync(expense.id);
      }
    });
  };

  const handleReject = (expense: Expense) => {
    const reason = prompt('Red nedeni:');
    if (reason) {
      rejectMutation.mutate({ id: expense.id, reason });
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Masraflar</h1>
            <p className="text-gray-600 mt-1">
              Şirket giderleri ve masraf yönetimi
            </p>
          </div>
          <Space>
            <Button
              icon={<PlusOutlined />}
              onClick={() => navigate('/expense-categories')}
            >
              Kategoriler
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={() => navigate('/expenses/new')}
            >
              Yeni Masraf
            </Button>
          </Space>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <Row gutter={16}>
          <Col xs={24} sm={12} md={5}>
            <div className="mb-2 text-sm text-gray-600">Kategori</div>
            <Select
              className="w-full"
              placeholder="Tüm kategoriler"
              allowClear
              showSearch
              optionFilterProp="label"
              value={filters.categoryId}
              onChange={(value) => setFilters({ ...filters, categoryId: value })}
              options={categories?.map(c => ({
                label: `${c.code} - ${c.name}`,
                value: c.id
              }))}
            />
          </Col>
          <Col xs={24} sm={12} md={5}>
            <div className="mb-2 text-sm text-gray-600">Tedarikçi</div>
            <Select
              className="w-full"
              placeholder="Tüm tedarikçiler"
              allowClear
              showSearch
              optionFilterProp="label"
              value={filters.supplierId}
              onChange={(value) => setFilters({ ...filters, supplierId: value })}
              options={suppliers?.items?.map((s: any) => ({
                label: `${s.code} - ${s.name}`,
                value: s.id
              }))}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <div className="mb-2 text-sm text-gray-600">Durum</div>
            <Select
              className="w-full"
              placeholder="Tüm durumlar"
              allowClear
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
              options={[
                { label: 'Taslak', value: ExpenseStatus.Draft },
                { label: 'Onay Bekliyor', value: ExpenseStatus.PendingApproval },
                { label: 'Onaylandı', value: ExpenseStatus.Approved },
                { label: 'Reddedildi', value: ExpenseStatus.Rejected },
                { label: 'Ödendi', value: ExpenseStatus.Paid }
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <div className="mb-2 text-sm text-gray-600">Ödeme Durumu</div>
            <Select
              className="w-full"
              placeholder="Tümü"
              allowClear
              value={filters.paymentStatus}
              onChange={(value) => setFilters({ ...filters, paymentStatus: value })}
              options={[
                { label: 'Ödenmedi', value: PaymentStatus.Unpaid },
                { label: 'Kısmen Ödendi', value: PaymentStatus.PartiallyPaid },
                { label: 'Ödendi', value: PaymentStatus.Paid }
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="mb-2 text-sm text-gray-600">Tarih Aralığı</div>
            <RangePicker
              className="w-full"
              value={[
                filters.dateFrom ? dayjs(filters.dateFrom) : null,
                filters.dateTo ? dayjs(filters.dateTo) : null
              ]}
              onChange={(dates) => {
                setFilters({
                  ...filters,
                  dateFrom: dates?.[0]?.format('YYYY-MM-DD'),
                  dateTo: dates?.[1]?.format('YYYY-MM-DD')
                });
              }}
              presets={[
                { label: 'Bu Ay', value: [dayjs().startOf('month'), dayjs().endOf('month')] },
                { label: 'Son 3 Ay', value: [dayjs().subtract(3, 'months'), dayjs()] },
                { label: 'Bu Yıl', value: [dayjs().startOf('year'), dayjs().endOf('year')] }
              ]}
            />
          </Col>
        </Row>
        <Row gutter={16} className="mt-4">
          <Col xs={24} sm={12} md={6}>
            <Search
              placeholder="Masraf no, açıklama..."
              allowClear
              onSearch={(value) => setFilters({ ...filters, search: value })}
            />
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={data?.items || []}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 1800 }}
          pagination={{
            current: page,
            pageSize,
            total: data?.totalCount || 0,
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} masraf`,
            onChange: (page, pageSize) => {
              setPage(page);
              setPageSize(pageSize);
            }
          }}
        />
      </Card>
    </div>
  );
}

