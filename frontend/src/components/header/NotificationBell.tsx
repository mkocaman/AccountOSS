import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Badge, Dropdown, List, Button, Typography, Empty, Spin } from 'antd';
import {
  BellOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  FileTextOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { useNotifications } from '../../hooks/useNotifications';
import type { Notification } from '../../types/notification';
import './NotificationBell.css';

const { Text, Title } = Typography;

/**
 * Bildirim zili component
 */
export const NotificationBell: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  
  const { 
    notifications, 
    stats, 
    isLoading, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();

  /**
   * Bildirim tipine göre ikon
   */
  const getNotificationIcon = (type: Notification['type']) => {
    const iconStyle = { fontSize: 20 };
    
    switch (type) {
      case 'payment':
        return <DollarOutlined style={{ ...iconStyle, color: '#faad14' }} />;
      case 'stock':
        return <WarningOutlined style={{ ...iconStyle, color: '#ff4d4f' }} />;
      case 'invoice':
        return <FileTextOutlined style={{ ...iconStyle, color: '#1890ff' }} />;
      case 'success':
        return <CheckOutlined style={{ ...iconStyle, color: '#52c41a' }} />;
      case 'error':
        return <CloseCircleOutlined style={{ ...iconStyle, color: '#ff4d4f' }} />;
      default:
        return <InfoCircleOutlined style={{ ...iconStyle, color: '#1890ff' }} />;
    }
  };

  /**
   * Bildirime tıklama
   */
  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
    
    setOpen(false);
  };

  /**
   * Dropdown içeriği
   */
  const dropdownContent = (
    <div className="notification-dropdown">
      {/* Header */}
      <div className="notification-header">
        <div>
          <Title level={5} style={{ margin: 0 }}>
            {t('notifications.title')}
          </Title>
          {stats.unread > 0 && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {t('notifications.unreadCount', { count: stats.unread })}
            </Text>
          )}
        </div>
        
        {stats.unread > 0 && (
          <Button 
            type="link" 
            size="small"
            onClick={() => markAllAsRead()}
          >
            {t('notifications.markAllRead')}
          </Button>
        )}
      </div>

      {/* Liste */}
      <div className="notification-list">
        {isLoading ? (
          <div className="notification-loading">
            <Spin />
          </div>
        ) : notifications.length > 0 ? (
          <List
            dataSource={notifications}
            renderItem={(notification) => (
              <List.Item
                className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <List.Item.Meta
                  avatar={getNotificationIcon(notification.type)}
                  title={
                    <div className="notification-title">
                      <Text strong={!notification.isRead}>
                        {notification.title}
                      </Text>
                      {!notification.isRead && (
                        <div className="unread-dot" />
                      )}
                    </div>
                  }
                  description={
                    <div className="notification-content">
                      <Text type="secondary">{notification.message}</Text>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        <ClockCircleOutlined style={{ marginRight: 4 }} />
                        {formatTimeAgo(notification.createdAt)}
                      </Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t('notifications.empty')}
            style={{ padding: '40px 0' }}
          />
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="notification-footer">
          <Button 
            type="link" 
            block
            onClick={() => {
              navigate('/notifications');
              setOpen(false);
            }}
          >
            {t('notifications.viewAll')}
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <Dropdown
      open={open}
      onOpenChange={setOpen}
      dropdownRender={() => dropdownContent}
      placement="bottomRight"
      trigger={['click']}
      overlayClassName="notification-dropdown-overlay"
    >
      <div className="notification-bell">
        <Badge count={stats.unread} size="small" offset={[-2, 2]}>
          <BellOutlined style={{ fontSize: 18 }} />
        </Badge>
      </div>
    </Dropdown>
  );
};

/**
 * Zamanı "2 saat önce" formatında göster
 */
function formatTimeAgo(date: string): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Şimdi';
  if (diffMins < 60) return `${diffMins} dakika önce`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} saat önce`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} gün önce`;
  
  return past.toLocaleDateString('tr-TR');
}
