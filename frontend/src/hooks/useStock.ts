import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { stockService, StockFilters } from '../services/stockService';
import type { StockAdjustment } from '../services/stockService';
import { transformToProTableResponse } from '../utils/api-helpers';
import { useMessage } from './useMessage';

/**
 * Stock movements hook
 */
export const useStockMovements = (filters: StockFilters = {}) => {
  const query = useQuery({
    queryKey: ['stockMovements', filters],
    queryFn: () => stockService.getMovements(filters),
    staleTime: 10000 // 10 saniye
  });

  const proTableData = query.data ? transformToProTableResponse(query.data) : undefined;

  return {
    ...query,
    proTableData
  };
};

/**
 * Stock levels hook
 */
export const useStockLevels = () => {
  const query = useQuery({
    queryKey: ['stockLevels'],
    queryFn: () => stockService.getStockLevels(),
    staleTime: 30000 // 30 saniye
  });

  const proTableData = query.data ? transformToProTableResponse(query.data) : undefined;

  return {
    ...query,
    proTableData
  };
};

/**
 * FIFO calculation hook
 */
export const useFIFOCalculation = (productId: string) => {
  return useQuery({
    queryKey: ['fifo', productId],
    queryFn: () => stockService.calculateFIFO(productId),
    enabled: !!productId,
    staleTime: 60000 // 1 dakika
  });
};

/**
 * Low stock alerts hook
 */
export const useLowStockAlerts = () => {
  return useQuery({
    queryKey: ['lowStockAlerts'],
    queryFn: stockService.getLowStockAlerts,
    staleTime: 60000, // 1 dakika
    refetchInterval: 5 * 60 * 1000 // 5 dakikada bir otomatik yenile
  });
};

/**
 * Product stock hook
 */
export const useProductStock = (productId: string) => {
  return useQuery({
    queryKey: ['productStock', productId],
    queryFn: () => stockService.getProductStock(productId),
    enabled: !!productId,
    staleTime: 30000
  });
};

/**
 * Stock adjustment mutation
 */
export const useStockAdjustment = () => {
  const queryClient = useQueryClient();
  const message = useMessage();

  return useMutation({
    mutationFn: stockService.adjustStock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
      queryClient.invalidateQueries({ queryKey: ['stockLevels'] });
      queryClient.invalidateQueries({ queryKey: ['lowStockAlerts'] });
      message.success('Stok ayarlaması başarıyla yapıldı');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Stok ayarlaması yapılamadı';
      message.error(errorMessage);
    }
  });
};
