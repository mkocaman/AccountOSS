import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';

export const useMe = () => {
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const response = await apiClient.get('/auth/me');
      return response.data?.data ?? response.data;
    },
    staleTime: 5 * 60_000, // 5 dakika
    refetchOnMount: false,
    retry: false,
    enabled: true, // Her zaman aktif
  });
};
