import { Modal } from 'antd';

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
  okText = 'Tamam',
  cancelText = 'İptal',
  okType = 'primary',
  onOk,
  onCancel
}: ConfirmModalProps) => {
  Modal.confirm({
    title,
    content,
    okText,
    cancelText,
    okType,
    onOk,
    onCancel
  });
};
