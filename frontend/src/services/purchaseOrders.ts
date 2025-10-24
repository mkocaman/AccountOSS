import { apiClient } from '@/api/client';

export async function getPurchaseOrders(params: { page?: number; pageSize?: number } = {}) {
  const res = await apiClient.get('/purchase-orders', {
    params: { page: 1, pageSize: 50, ...params },
    // backend bu route yoksa 404'ü sessiz geç
    meta: { ignore404: true } as any,
  } as any);
  return res.data;
}
