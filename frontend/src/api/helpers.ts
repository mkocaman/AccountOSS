import { apiClient } from './client';

export async function getWithFallbacks<T>(paths: string[], params?: any): Promise<T> {
  let lastErr: any;
  for (const p of paths) {
    try {
      const { data } = await apiClient.get<T>(p, { params });
      return data;
    } catch (err: any) {
      if (err?.response?.status !== 404) throw err; // 404 dışı hatayı patlat
      lastErr = err;
      console.warn('[API] 404, alternatif deneniyor →', p);
    }
  }
  // tümü 404 ise kontrollü boş dön
  throw Object.assign(new Error('Endpoint not found'), { code: 404, cause: lastErr });
}
