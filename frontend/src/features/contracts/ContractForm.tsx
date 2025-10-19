import React, { useState } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Select, 
  DatePicker,
  Button,
  InputNumber,
  Space,
  message,
  Row,
  Col,
  Upload,
  Alert
} from 'antd';
import type { UploadFile } from 'antd';
import { 
  SaveOutlined,
  ArrowLeftOutlined,
  UploadOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';

import { contractsApi } from '@/api/contracts';
import { partnersApi } from '@/api/partners';
import { PartnerType } from '@/types/partner';
import type { CreateContractRequest } from '@/types/contract';
import { ContractType } from '@/types/contract';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function ContractForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  usePageTitle(id ? 'Sözleşme Düzenle' : 'Yeni Sözleşme');

  // Fetch existing contract
  const { data: contract } = useQuery({
    queryKey: ['contract', id],
    queryFn: () => contractsApi.getById(id!),
    enabled: !!id
  });

  // Fetch customers
  const { data: customersResponse } = useQuery({
    queryKey: ['customers-all'],
    queryFn: () => partnersApi.getAll({ type: PartnerType.Customer, pageSize: 1000 })
  });

  const customers = customersResponse?.data;

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: (data: CreateContractRequest) => {
      if (id) {
        return contractsApi.update(id, data);
      }
      return contractsApi.create(data);
    },
    onSuccess: async (savedContract: any) => {
      // Upload document if exists
      if (fileList.length > 0 && fileList[0].originFileObj) {
        await contractsApi.uploadDocument(savedContract.id, fileList[0].originFileObj);
      }
      
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      message.success(id ? 'Sözleşme güncellendi' : 'Sözleşme oluşturuldu');
      navigate('/contracts');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'İşlem başarısız');
    }
  });

  // Load existing contract data
  React.useEffect(() => {
    if (contract) {
      form.setFieldsValue({
        contractDate: dayjs(contract.contractDate),
        startDate: dayjs(contract.startDate),
        endDate: dayjs(contract.endDate),
        customerId: contract.customerId,
        title: contract.title,
        description: contract.description,
        contractType: contract.contractType,
        totalValue: contract.totalValue,
        currency: contract.currency,
        paymentTerms: contract.paymentTerms,
        notes: contract.notes,
        terms: contract.terms
      });
    }
  }, [contract, form]);

  // Handle customer change
  const handleCustomerChange = (customerId: string) => {
    const customer = customers?.items?.find((c: any) => c.id === customerId);
    if (customer) {
      form.setFieldValue('currency', customer.currency);
    }
  };

  // Form submit
  const handleSubmit = async (values: any) => {
    const data: CreateContractRequest = {
      contractDate: values.contractDate.format('YYYY-MM-DD'),
      startDate: values.startDate.format('YYYY-MM-DD'),
      endDate: values.endDate.format('YYYY-MM-DD'),
      customerId: values.customerId,
      title: values.title,
      description: values.description,
      contractType: values.contractType,
      totalValue: values.totalValue,
      currency: values.currency,
      paymentTerms: values.paymentTerms,
      notes: values.notes,
      terms: values.terms
    };

    await saveMutation.mutateAsync(data);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/contracts')}
          className="mb-4"
        >
          Geri
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {id ? 'Sözleşme Düzenle' : 'Yeni Sözleşme'}
        </h1>
      </div>

      <Alert
        message="Özbekistan Özel Modül"
        description="Bu modül Özbekistan'daki yasal gereklilikler için tasarlanmıştır. Sözleşme ve vekalet belgesi yönetimi sağlar."
        type="info"
        showIcon
        className="mb-4"
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          contractDate: dayjs(),
          startDate: dayjs(),
          endDate: dayjs().add(1, 'year'),
          contractType: ContractType.Sales,
          currency: 'UZS'
        }}
      >
        {/* Basic Info */}
        <Card title="Genel Bilgiler" className="mb-4">
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="contractDate"
                label="Sözleşme Tarihi"
                rules={[{ required: true, message: 'Tarih zorunludur' }]}
              >
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="startDate"
                label="Başlangıç Tarihi"
                rules={[{ required: true, message: 'Başlangıç tarihi zorunludur' }]}
              >
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="endDate"
                label="Bitiş Tarihi"
                rules={[{ required: true, message: 'Bitiş tarihi zorunludur' }]}
              >
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="customerId"
                label="Müşteri"
                rules={[{ required: true, message: 'Müşteri seçimi zorunludur' }]}
              >
                <Select
                  showSearch
                  placeholder="Müşteri seçin"
                  optionFilterProp="label"
                  onChange={handleCustomerChange}
                  options={customers?.items?.map((c: any) => ({
                    label: `${c.code} - ${c.name}`,
                    value: c.id
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="contractType"
                label="Sözleşme Tipi"
                rules={[{ required: true, message: 'Tip seçimi zorunludur' }]}
              >
                <Select
                  options={[
                    { label: 'Satış Sözleşmesi', value: ContractType.Sales },
                    { label: 'Hizmet Sözleşmesi', value: ContractType.Service },
                    { label: 'Distribütörlük', value: ContractType.Distribution },
                    { label: 'Acentelik', value: ContractType.Agency },
                    { label: 'Ortaklık', value: ContractType.Partnership }
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="title"
            label="Sözleşme Başlığı"
            rules={[{ required: true, message: 'Başlık zorunludur' }]}
          >
            <Input placeholder="Örn: 2025 Yılı Distribütörlük Sözleşmesi" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Açıklama"
          >
            <Input.TextArea rows={3} placeholder="Sözleşme açıklaması..." />
          </Form.Item>
        </Card>

        {/* Financial Info */}
        <Card title="Mali Bilgiler" className="mb-4">
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="totalValue"
                label="Toplam Değer"
                rules={[{ required: true, message: 'Değer zorunludur' }]}
              >
                <InputNumber
                  className="w-full"
                  min={0}
                  precision={2}
                  placeholder="0.00"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="currency"
                label="Para Birimi"
                rules={[{ required: true, message: 'Para birimi zorunludur' }]}
              >
                <Select
                  options={[
                    { label: 'UZS - Özbek Somu', value: 'UZS' },
                    { label: 'USD - Dolar', value: 'USD' },
                    { label: 'EUR - Euro', value: 'EUR' },
                    { label: 'RUB - Ruble', value: 'RUB' }
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="paymentTerms"
            label="Ödeme Şartları"
          >
            <Input.TextArea rows={2} placeholder="Ödeme koşulları ve vadeler..." />
          </Form.Item>
        </Card>

        {/* Terms & Conditions */}
        <Card title="Şartlar ve Koşullar" className="mb-4">
          <Form.Item
            name="terms"
            label="Sözleşme Maddeleri"
          >
            <Input.TextArea 
              rows={6} 
              placeholder="Sözleşme maddeleri ve koşulları..."
            />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Notlar"
          >
            <Input.TextArea rows={3} placeholder="Özel notlar..." />
          </Form.Item>
        </Card>

        {/* Document Upload */}
        <Card title="Sözleşme Belgesi" className="mb-4">
          <Form.Item
            label="PDF Belgesi"
            help="Sözleşme belgesini yükleyin (PDF formatında)"
          >
            <Upload
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              beforeUpload={() => false}
              maxCount={1}
              accept=".pdf"
            >
              <Button icon={<UploadOutlined />}>Belge Seç</Button>
            </Upload>
          </Form.Item>
        </Card>

        {/* Actions */}
        <Card>
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              size="large"
              loading={saveMutation.isPending}
            >
              {id ? 'Güncelle' : 'Oluştur'}
            </Button>
            <Button
              size="large"
              onClick={() => navigate('/contracts')}
            >
              İptal
            </Button>
          </Space>
        </Card>
      </Form>
    </div>
  );
}

