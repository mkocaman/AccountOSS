import React from 'react';
import { Empty, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import './EmptyState.css';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  tips?: string[];
}

/**
 * Genel boş durum component'i
 * Liste boşken gösterilir
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  tips
}) => {
  return (
    <div className="empty-state-container">
      {icon && <div className="empty-state-icon">{icon}</div>}
      
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <div className="empty-state-description">
            <h3>{title}</h3>
            {description && <p>{description}</p>}
          </div>
        }
      >
        {actionText && onAction && (
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            size="large"
            onClick={onAction}
          >
            {actionText}
          </Button>
        )}
      </Empty>

      {tips && tips.length > 0 && (
        <div className="empty-state-tips">
          <h4>💡 Hızlı İpuçları</h4>
          <ul>
            {tips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
