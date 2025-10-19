import { Modal } from 'antd';
import { useTranslation } from 'react-i18next';

interface ConfirmModalProps {
  title: string;
  content: string;
  okText?: string;
  cancelText?: string;
  okType?: 'primary' | 'danger';
  onOk: () => void;
  onCancel?: () => void;
}

export const showConfirm = ({
  title,
  content,
  okText,
  cancelText,
  okType = 'primary',
  onOk,
  onCancel
}: ConfirmModalProps) => {
  const { t } = useTranslation();
  
  Modal.confirm({
    title,
    content,
    okText: okText || t('common.ok'),
    cancelText: cancelText || t('common.cancel'),
    okType,
    onOk,
    onCancel
  });
};
