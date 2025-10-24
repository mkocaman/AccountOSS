/**
 * Bildirim tipleri
 */
export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'payment' | 'stock' | 'invoice';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export interface NotificationStats {
  total: number;
  unread: number;
}
