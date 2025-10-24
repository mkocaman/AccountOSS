import * as signalR from '@microsoft/signalr';

/**
 * SignalR servisi - Real-time bildirimler ve güncellemeler
 */

export type NotificationEventType = 
  | 'invoice_created'
  | 'invoice_approved'
  | 'payment_received'
  | 'low_stock_alert'
  | 'user_online'
  | 'user_offline';

export interface SignalRNotification {
  type: NotificationEventType;
  title: string;
  message: string;
  data?: any;
  timestamp: string;
}

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private listeners: Map<string, Array<(data: any) => void>> = new Map();

  /**
   * SignalR bağlantısını başlat
   */
  async start(token: string): Promise<void> {
    try {
      const apiUrl = import.meta.env.VITE_API_URL.replace('/api/v1', '');
      
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(`${apiUrl}/hubs/notifications`, {
          accessTokenFactory: () => token,
          skipNegotiation: false,
          transport: signalR.HttpTransportType.WebSockets
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            // Exponential backoff: 0s, 2s, 10s, 30s
            if (retryContext.previousRetryCount === 0) return 0;
            if (retryContext.previousRetryCount === 1) return 2000;
            if (retryContext.previousRetryCount === 2) return 10000;
            return 30000;
          }
        })
        .configureLogging(
          import.meta.env.DEV ? signalR.LogLevel.Information : signalR.LogLevel.Warning
        )
        .build();

      // Event handlers
      this.connection.on('ReceiveNotification', this.handleNotification.bind(this));
      this.connection.on('InvoiceCreated', (data) => this.emit('invoice_created', data));
      this.connection.on('InvoiceApproved', (data) => this.emit('invoice_approved', data));
      this.connection.on('PaymentReceived', (data) => this.emit('payment_received', data));
      this.connection.on('LowStockAlert', (data) => this.emit('low_stock_alert', data));
      this.connection.on('UserOnline', (data) => this.emit('user_online', data));
      this.connection.on('UserOffline', (data) => this.emit('user_offline', data));

      // Connection lifecycle events
      this.connection.onreconnecting(() => {
        console.log('🔄 SignalR reconnecting...');
      });

      this.connection.onreconnected(() => {
        console.log('✅ SignalR reconnected');
      });

      this.connection.onclose((error) => {
        console.error('❌ SignalR connection closed', error);
      });

      await this.connection.start();
      console.log('🟢 SignalR connected');

      // Kullanıcı online olduğunu bildir
      await this.connection.invoke('UserConnected');

    } catch (error) {
      console.error('❌ SignalR connection failed:', error);
      throw error;
    }
  }

  /**
   * Bağlantıyı kapat
   */
  async stop(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.invoke('UserDisconnected');
        await this.connection.stop();
        console.log('🔴 SignalR disconnected');
      } catch (error) {
        console.error('Error stopping SignalR:', error);
      }
    }
  }

  /**
   * Event listener ekle
   */
  on(event: string, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  /**
   * Event listener kaldır
   */
  off(event: string, callback: (data: any) => void): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Event emit et
   */
  private emit(event: string, data: any): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  /**
   * Bildirim al
   */
  private handleNotification(notification: SignalRNotification): void {
    console.log('📬 New notification:', notification);
    this.emit('notification', notification);
  }

  /**
   * Mesaj gönder
   */
  async send(method: string, ...args: any[]): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      try {
        await this.connection.invoke(method, ...args);
      } catch (error) {
        console.error(`Error invoking ${method}:`, error);
      }
    } else {
      console.warn('SignalR not connected, cannot send message');
    }
  }

  /**
   * Bağlantı durumu
   */
  get isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }

  /**
   * Bağlantı durumunu al
   */
  get connectionState(): signalR.HubConnectionState | null {
    return this.connection?.state || null;
  }
}

// Singleton instance
export const signalRService = new SignalRService();
