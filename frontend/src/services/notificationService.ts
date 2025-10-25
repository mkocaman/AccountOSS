import { apiClient } from '@/api/client';
import type { Notification, NotificationStats } from '@/types/notification';

/**
 * Bildirim servisi
 */
export const notificationService = {
  /**
   * Bildirimleri getirir
   */
  getNotifications: async (params?: {
    page?: number;
    pageSize?: number;
    unreadOnly?: boolean;
  }): Promise<{ items: Notification[]; stats: NotificationStats }> => {
    try {
      const response = await apiClient.get<{ items: Notification[]; stats: NotificationStats }>('/notifications', { params });
      return response;
    } catch (error) {
      // Fallback - Mock data
      return {
        items: [
          {
            id: '1',
            type: 'payment',
            title: 'Ödeme Hatırlatması',
            message: '3 adet ödeme vadesi yaklaşıyor',
            isRead: false,
            createdAt: new Date().toISOString()
          },
          {
            id: '2',
            type: 'stock',
            title: 'Düşük Stok Uyarısı',
            message: '5 üründe stok seviyesi kritik',
            isRead: false,
            createdAt: new Date().toISOString()
          },
          {
            id: '3',
            type: 'invoice',
            title: 'Yeni Fatura',
            message: 'FAT-2025-001 numaralı fatura oluşturuldu',
            isRead: true,
            createdAt: new Date().toISOString()
          }
        ],
        stats: { total: 3, unread: 2 }
      };
    }
  },

  /**
   * Bildirimi okundu olarak işaretle
   */
  markAsRead: async (notificationId: string): Promise<void> => {
    try {
      await apiClient.put(`/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('Mark as read failed:', error);
    }
  },

  /**
   * Tüm bildirimleri okundu olarak işaretle
   */
  markAllAsRead: async (): Promise<void> => {
    try {
      await apiClient.put('/notifications/read-all');
    } catch (error) {
      console.error('Mark all as read failed:', error);
    }
  }
};
