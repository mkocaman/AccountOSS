import React from 'react';
import { useTranslation } from 'react-i18next';
import { Space, Button, Dropdown, Popconfirm } from 'antd';
import type { MenuProps } from 'antd';
import {
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
  DownloadOutlined,
  MoreOutlined
} from '@ant-design/icons';

/**
 * Toplu işlem component'i
 * Seçili kayıtlar üzerinde toplu işlem yapar
 */

interface BulkActionsProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkDelete?: () => void;
  onBulkApprove?: () => void;
  onBulkCancel?: () => void;
  onBulkExport?: (format: 'excel' | 'pdf') => void;
  customActions?: Array<{
    key: string;
    label: string;
    icon?: React.ReactNode;
    danger?: boolean;
    onClick: () => void;
  }>;
  loading?: boolean;
}

export const BulkActions: React.FC<BulkActionsProps> = ({
  selectedCount,
  onClearSelection,
  onBulkDelete,
  onBulkApprove,
  onBulkCancel,
  onBulkExport,
  customActions = [],
  loading = false
}) => {
  const { t } = useTranslation();

  if (selectedCount === 0) return null;

  // Dropdown menu items
  const menuItems: MenuProps['items'] = [
    onBulkExport && {
      key: 'export-excel',
      icon: <DownloadOutlined />,
      label: t('bulk.exportExcel'),
      onClick: () => onBulkExport('excel')
    },
    onBulkExport && {
      key: 'export-pdf',
      icon: <DownloadOutlined />,
      label: t('bulk.exportPdf'),
      onClick: () => onBulkExport('pdf')
    },
    ...customActions.map(action => ({
      key: action.key,
      icon: action.icon,
      label: action.label,
      danger: action.danger,
      onClick: action.onClick
    }))
  ].filter(Boolean) as MenuProps['items'];

  return (
    <div className="bulk-actions-bar">
      <Space>
        <span className="bulk-actions-count">
          {t('bulk.selected', { count: selectedCount })}
        </span>

        <Button
          size="small"
          onClick={onClearSelection}
        >
          {t('bulk.clearSelection')}
        </Button>

        {onBulkApprove && (
          <Popconfirm
            title={t('bulk.approveConfirm', { count: selectedCount })}
            onConfirm={onBulkApprove}
            okText={t('common.yes')}
            cancelText={t('common.no')}
          >
            <Button
              type="primary"
              size="small"
              icon={<CheckOutlined />}
              loading={loading}
            >
              {t('bulk.approve')}
            </Button>
          </Popconfirm>
        )}

        {onBulkCancel && (
          <Popconfirm
            title={t('bulk.cancelConfirm', { count: selectedCount })}
            onConfirm={onBulkCancel}
            okText={t('common.yes')}
            cancelText={t('common.no')}
          >
            <Button
              size="small"
              icon={<CloseOutlined />}
              loading={loading}
            >
              {t('bulk.cancel')}
            </Button>
          </Popconfirm>
        )}

        {onBulkDelete && (
          <Popconfirm
            title={t('bulk.deleteConfirm', { count: selectedCount })}
            onConfirm={onBulkDelete}
            okText={t('common.yes')}
            cancelText={t('common.no')}
            okButtonProps={{ danger: true }}
          >
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              loading={loading}
            >
              {t('bulk.delete')}
            </Button>
          </Popconfirm>
        )}

        {menuItems.length > 0 && (
          <Dropdown menu={{ items: menuItems }} placement="bottomRight">
            <Button size="small" icon={<MoreOutlined />}>
              {t('bulk.more')}
            </Button>
          </Dropdown>
        )}
      </Space>
    </div>
  );
};
