import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { Button, Tag, Space, Modal } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { usePartners, useDeletePartner } from '../../hooks/usePartners';
import { EmptyState } from '../../components/common/EmptyState';
import { TeamOutlined } from '@ant-design/icons';
import { formatCurrency } from '../../utils/formatters';
import type { Partner } from '../../services/partnerService';
import { useMessage } from '../../hooks/useMessage';

/**
 * Cari hesap listesi - Real API ile çalışır
 */
export const PartnerList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const actionRef = useRef<ActionType>();
  const message = useMessage();
  const [filters, setFilters] = useState({});

  // Delete mutation
  const deleteMutation = useDeletePartner();

  /**
   * Silme onayı
   */
  const handleDelete = (partner: Partner) => {
    Modal.confirm({
      title: t('partners.deleteConfirmTitle'),
      content: t('partners.deleteConfirmMessage', { name: partner.name }),
      okText: t('common.yes'),
      cancelText: t('common.no'),
      okButtonProps: { danger: true },
      onOk: async () => {
        deleteMutation.mutate(partner.id);
        actionRef.current?.reload();
      }
    });
  };

  /**
   * ProTable kolonları
   */
  const columns: ProColumns<Partner>[] = [
    {
      title: t('partners.columns.code'),
      dataIndex: 'code',
      width: 120,
      fixed: 'left',
      copyable: true
    },
    {
      title: t('partners.columns.name'),
      dataIndex: 'name',
      width: 200,
      fixed: 'left',
      ellipsis: true,
      copyable: true
    },
    {
      title: t('partners.columns.type'),
      dataIndex: 'type',
      width: 120,
      valueType: 'select',
      valueEnum: {
        customer: { text: t('partners.types.customer'), status: 'Success' },
        supplier: { text: t('partners.types.supplier'), status: 'Processing' },
        both: { text: t('partners.types.both'), status: 'Default' }
      },
      filters: true
    },
    {
      title: t('partners.columns.taxNumber'),
      dataIndex: 'taxNumber',
      width: 130,
      search: false
    },
    {
      title: t('partners.columns.phone'),
      dataIndex: 'phone',
      width: 140,
      search: false
    },
    {
      title: t('partners.columns.email'),
      dataIndex: 'email',
      width: 200,
      ellipsis: true,
      search: false
    },
    {
      title: t('partners.columns.balance'),
      dataIndex: 'balance',
      width: 140,
      align: 'right',
      valueType: 'money',
      search: false,
      render: (_, record) => (
        <span style={{ color: record.balance >= 0 ? '#52c41a' : '#ff4d4f' }}>
          {formatCurrency(record.balance)}
        </span>
      )
    },
    {
      title: t('partners.columns.status'),
      dataIndex: 'isActive',
      width: 100,
      align: 'center',
      valueType: 'select',
      valueEnum: {
        true: { text: t('common.active'), status: 'Success' },
        false: { text: t('common.inactive'), status: 'Error' }
      },
      filters: true
    },
    {
      title: t('partners.columns.actions'),
      key: 'actions',
      width: 150,
      fixed: 'right',
      align: 'center',
      valueType: 'option',
      render: (_, record) => [
        <Button
          key="view"
          type="text"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/partners/${record.id}`)}
        />,
        <Button
          key="edit"
          type="text"
          icon={<EditOutlined />}
          onClick={() => navigate(`/partners/${record.id}/edit`)}
        />,
        <Button
          key="delete"
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record)}
        />
      ]
    }
  ];

  return (
    <PageContainer
      header={{
        title: t('partners.title'),
        breadcrumb: {
          items: [
            { title: t('menu.home'), path: '/' },
            { title: t('menu.partners') }
          ]
        }
      }}
    >
      <ProTable<Partner>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={async (params, sort, filter) => {
          // ProTable params'larını API format'ına çevir
          const { usePartners } = await import('../../hooks/usePartners');
          const { partnerService } = await import('../../services/partnerService');
          const { transformToProTableResponse } = await import('../../utils/api-helpers');
          
          const response = await partnerService.getPartners({
            pageNumber: params.current,
            pageSize: params.pageSize,
            searchTerm: params.keyword,
            type: filter.type?.[0],
            isActive: filter.isActive?.[0],
            sortBy: Object.keys(sort)[0],
            sortOrder: Object.values(sort)[0] === 'ascend' ? 'asc' : 'desc'
          });

          return transformToProTableResponse(response);
        }}
        rowKey="id"
        search={{
          labelWidth: 'auto',
          defaultCollapsed: false
        }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => t('common.totalItems', { total })
        }}
        toolBarRender={() => [
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/partners/create')}
          >
            {t('partners.addPartner')}
          </Button>
        ]}
        options={{
          reload: true,
          density: true,
          setting: true
        }}
        scroll={{ x: 1200 }}
      />
    </PageContainer>
  );
};