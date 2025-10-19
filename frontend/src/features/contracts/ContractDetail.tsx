import { useState } from 'react';
import { 
  Card, 
  Descriptions, 
  Button, 
  Space, 
  Tag,
  Spin,
  message,
  Alert,
  Modal,
  Form,
  Input
} from 'antd';
import { 
  ArrowLeftOutlined,
  EditOutlined,
  CheckOutlined,
  FilePdfOutlined,
  FileProtectOutlined,
  SafetyOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';

import { contractsApi } from '@/api/contracts';
import { 
  ContractStatus, 
  contractStatusLabels, 
  contractStatusColors,
  contractTypeLabels
} from '@/types/contract';
import { formatCurrency, formatDate, downloadFile } from '@/lib/utils';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function ContractDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [signModalOpen, setSignModalOpen] = useState(false);
  const [signForm] = Form.useForm();

  // Fetch contract
  const { data: contract, isLoading } = useQuery({
    queryKey: ['contract', id],
    queryFn: () => contractsApi.getById(id!),
    enabled: !!id
  });

  usePageTitle(contract ? `${contract.contractNumber} - Sözleşme Detayı` : 'Sözleşme Detayı');

  // Activate mutation
  const activateMutation = useMutation({
    mutationFn: (id: string) => contractsApi.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract', id] });
      message.success('Sözleşme aktif edildi');
    }
  });

  // Sign mutation
  const signMutation = useMutation({
    mutationFn: (data: { signedBy: string }) => 
      contractsApi.sign(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract', id] });
      setSignModalOpen(false);
      signForm.resetFields();
      message.success('Sözleşme imzalandı');
    }
  });

  // Create POA mutation
  const createPoaMutation = useMutation({
    mutationFn: (id: string) => contractsApi.createPowerOfAttorney(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract', id] });
      message.success('Vekalet belgesi oluşturuldu');
    }
  });

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: (id: string) => contractsApi.exportPdf(id),
    onSuccess: (blob: any) => {
      downloadFile(blob as Blob, `${contract?.contractNumber}.pdf`);
      message.success('PDF indirildi');
    }
  });

  const handleSign = async (values: any) => {
    await signMutation.mutateAsync(values);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">Sözleşme bulunamadı</div>
            <Button type="primary" onClick={() => navigate('/contracts')} className="mt-4">
              Sözleşme Listesine Dön
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const isExpired = dayjs(contract.endDate).isBefore(dayjs()) && 
                   contract.status === ContractStatus.Active;
  const daysRemaining = dayjs(contract.endDate).diff(dayjs(), 'days');

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
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {contract.contractNumber}
            </h1>
            <h2 className="text-lg text-gray-700 mb-2">{contract.title}</h2>
            <Space>
              <Tag color={contractStatusColors[contract.status]} className="text-base px-3 py-1">
                {contractStatusLabels[contract.status]}
              </Tag>
              {isExpired && (
                <Tag color="orange" className="text-base px-3 py-1">
                  Süresi Doldu
                </Tag>
              )}
              {contract.isSigned && (
                <Tag color="green" className="text-base px-3 py-1">
                  <SafetyOutlined /> İmzalandı
                </Tag>
              )}
              {contract.hasPowerOfAttorney && (
                <Tag color="purple" className="text-base px-3 py-1">
                  <FileProtectOutlined /> Vekaletli
                </Tag>
              )}
            </Space>
          </div>

          <Space>
            {contract.status === ContractStatus.Draft && (
              <>
                <Button
                  icon={<EditOutlined />}
                  onClick={() => navigate(`/contracts/edit/${contract.id}`)}
                >
                  Düzenle
                </Button>
                {!contract.isSigned && (
                  <Button
                    icon={<SafetyOutlined />}
                    onClick={() => setSignModalOpen(true)}
                  >
                    İmzala
                  </Button>
                )}
                {contract.isSigned && (
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    onClick={() => activateMutation.mutate(contract.id)}
                    loading={activateMutation.isPending}
                  >
                    Aktif Et
                  </Button>
                )}
              </>
            )}
            {contract.status === ContractStatus.Active && !contract.hasPowerOfAttorney && (
              <Button
                type="primary"
                icon={<FileProtectOutlined />}
                onClick={() => createPoaMutation.mutate(contract.id)}
                loading={createPoaMutation.isPending}
              >
                Vekalet Belgesi Oluştur
              </Button>
            )}
            <Button
              icon={<FilePdfOutlined />}
              onClick={() => exportMutation.mutate(contract.id)}
              loading={exportMutation.isPending}
            >
              PDF İndir
            </Button>
          </Space>
        </div>
      </div>

      {/* Expiry Warning */}
      {isExpired && (
        <Alert
          message="Bu sözleşmenin süresi dolmuştur"
          description={`Bitiş tarihi: ${formatDate(contract.endDate)}`}
          type="warning"
          showIcon
          className="mb-4"
        />
      )}

      {/* Active Contract Info */}
      {contract.status === ContractStatus.Active && !isExpired && (
        <Alert
          message={`Sözleşme sona ermesine ${daysRemaining} gün kaldı`}
          description={`Bitiş tarihi: ${formatDate(contract.endDate)}`}
          type={daysRemaining < 30 ? 'warning' : 'info'}
          showIcon
          className="mb-4"
        />
      )}

      {/* POA Reference */}
      {contract.hasPowerOfAttorney && contract.powerOfAttorney && (
        <Alert
          message="Bu sözleşmeye ait vekalet belgesi mevcut"
          description={
            <div>
              Vekalet No: <Button 
                type="link" 
                size="small" 
                onClick={() => navigate(`/power-of-attorney/${contract.powerOfAttorneyId}`)}
              >
                {contract.powerOfAttorney.poaNumber}
              </Button>
            </div>
          }
          type="success"
          showIcon
          className="mb-4"
        />
      )}

      {/* Contract Info */}
      <Card title="Sözleşme Bilgileri" className="mb-4">
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 2 }}>
          <Descriptions.Item label="Sözleşme No">{contract.contractNumber}</Descriptions.Item>
          <Descriptions.Item label="Durum">
            <Tag color={contractStatusColors[contract.status]}>
              {contractStatusLabels[contract.status]}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Sözleşme Tipi">
            {contractTypeLabels[contract.contractType]}
          </Descriptions.Item>
          <Descriptions.Item label="Sözleşme Tarihi">
            {formatDate(contract.contractDate)}
          </Descriptions.Item>
          <Descriptions.Item label="Başlangıç Tarihi">
            {formatDate(contract.startDate)}
          </Descriptions.Item>
          <Descriptions.Item label="Bitiş Tarihi">
            <span className={isExpired ? 'text-red-600 font-semibold' : ''}>
              {formatDate(contract.endDate)}
              {isExpired && ' (Süresi Doldu)'}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="Müşteri">
            {contract.customer?.name}
            <div className="text-xs text-gray-500">{contract.customer?.code}</div>
          </Descriptions.Item>
          <Descriptions.Item label="Toplam Değer">
            <span className="font-semibold text-lg">
              {formatCurrency(contract.totalValue, contract.currency)}
            </span>
          </Descriptions.Item>
          {contract.isSigned && (
            <>
              <Descriptions.Item label="İmza Durumu">
                <Tag color="green">İmzalandı</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="İmzalayan">
                {contract.signedBy || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="İmza Tarihi">
                {contract.signedDate ? formatDate(contract.signedDate) : '-'}
              </Descriptions.Item>
            </>
          )}
          <Descriptions.Item label="Oluşturan">
            {contract.createdByUser?.name || '-'}
          </Descriptions.Item>
          {contract.paymentTerms && (
            <Descriptions.Item label="Ödeme Şartları" span={2}>
              {contract.paymentTerms}
            </Descriptions.Item>
          )}
          {contract.description && (
            <Descriptions.Item label="Açıklama" span={2}>
              {contract.description}
            </Descriptions.Item>
          )}
          {contract.terms && (
            <Descriptions.Item label="Sözleşme Maddeleri" span={2}>
              <div className="whitespace-pre-wrap">{contract.terms}</div>
            </Descriptions.Item>
          )}
          {contract.notes && (
            <Descriptions.Item label="Notlar" span={2}>
              {contract.notes}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* Sign Modal */}
      <Modal
        title="Sözleşmeyi İmzala"
        open={signModalOpen}
        onCancel={() => setSignModalOpen(false)}
        onOk={() => signForm.submit()}
        confirmLoading={signMutation.isPending}
      >
        <Form
          form={signForm}
          layout="vertical"
          onFinish={handleSign}
        >
          <Form.Item
            name="signedBy"
            label="İmzalayan Kişi"
            rules={[{ required: true, message: 'İmzalayan kişi adı zorunludur' }]}
          >
            <Input placeholder="Ad Soyad" />
          </Form.Item>

          <Alert
            message="Dijital İmza"
            description="Sözleşme dijital olarak imzalanacaktır. İmza sonrası sözleşme aktif edilebilir."
            type="info"
            showIcon
          />
        </Form>
      </Modal>
    </div>
  );
}

