import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { signalRService, SignalRNotification } from '../services/signalRService';
import { useMessage, useNotification } from './useMessage';
import { useQueryClient } from '@tanstack/react-query';

/**
 * SignalR hook - Real-time bağlantı yönetimi
 */
export const useSignalR = () => {
  const { user, isAuthenticated } = useAuth();
  const message = useMessage();
  const notification = useNotification();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    // SignalR bağlantısını başlat
    const startConnection = async () => {
      try {
        await signalRService.start(token);

        // Bildirim event listener'ı
        const handleNotification = (data: SignalRNotification) => {
          notification.info({
            message: data.title,
            description: data.message,
            placement: 'topRight',
            duration: 4
          });
        };

        // Invoice created
        const handleInvoiceCreated = (data: any) => {
          notification.success({
            message: 'Yeni Fatura',
            description: `${data.invoiceNumber} numaralı fatura oluşturuldu`,
            placement: 'topRight'
          });
          
          // Liste'yi yenile
          queryClient.invalidateQueries({ queryKey: ['invoices'] });
          queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
        };

        // Invoice approved
        const handleInvoiceApproved = (data: any) => {
          notification.success({
            message: 'Fatura Onaylandı',
            description: `${data.invoiceNumber} numaralı fatura onaylandı`,
            placement: 'topRight'
          });
          
          queryClient.invalidateQueries({ queryKey: ['invoices'] });
          queryClient.invalidateQueries({ queryKey: ['invoice', data.invoiceId] });
        };

        // Payment received
        const handlePaymentReceived = (data: any) => {
          notification.success({
            message: 'Ödeme Alındı',
            description: `${data.amount} TL tahsilat yapıldı`,
            placement: 'topRight'
          });
          
          queryClient.invalidateQueries({ queryKey: ['payments'] });
          queryClient.invalidateQueries({ queryKey: ['paymentSummary'] });
        };

        // Low stock alert
        const handleLowStockAlert = (data: any) => {
          notification.warning({
            message: 'Düşük Stok Uyarısı',
            description: `${data.productName} ürününde stok seviyesi düşük`,
            placement: 'topRight',
            duration: 6
          });
          
          queryClient.invalidateQueries({ queryKey: ['lowStockAlerts'] });
        };

        // Event listeners'ı ekle
        signalRService.on('notification', handleNotification);
        signalRService.on('invoice_created', handleInvoiceCreated);
        signalRService.on('invoice_approved', handleInvoiceApproved);
        signalRService.on('payment_received', handlePaymentReceived);
        signalRService.on('low_stock_alert', handleLowStockAlert);

        // Cleanup
        return () => {
          signalRService.off('notification', handleNotification);
          signalRService.off('invoice_created', handleInvoiceCreated);
          signalRService.off('invoice_approved', handleInvoiceApproved);
          signalRService.off('payment_received', handlePaymentReceived);
          signalRService.off('low_stock_alert', handleLowStockAlert);
        };

      } catch (error) {
        console.error('SignalR connection failed:', error);
      }
    };

    startConnection();

    // Component unmount'ta bağlantıyı kapat
    return () => {
      signalRService.stop();
    };
  }, [isAuthenticated, user, notification, queryClient]);

  return {
    isConnected: signalRService.isConnected,
    connectionState: signalRService.connectionState,
    send: signalRService.send.bind(signalRService)
  };
};
