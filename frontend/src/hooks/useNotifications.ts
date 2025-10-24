import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notificationService';
import { useMessage } from './useMessage';

/**
 * Bildirim yönetimi hook'u
 */
export const useNotifications = () => {
  const queryClient = useQueryClient();
  const message = useMessage();

  // Bildirimleri çek
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getNotifications(),
    refetchInterval: 30000, // 30 saniyede bir yenile
    staleTime: 10000
  });

  // Okundu işaretleme
  const markAsReadMutation = useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  // Tümünü okundu işaretle
  const markAllAsReadMutation = useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: () => {
      message.success('Tüm bildirimler okundu olarak işaretlendi');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  return {
    notifications: data?.items || [],
    stats: data?.stats || { total: 0, unread: 0 },
    isLoading,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    refetch
  };
};
