import { useQuery } from '@tanstack/react-query';
import { 
  getStockMovements, 
  getStockLevels, 
  calculateFifoCost,
  StockMovement,
  StockLevel
} from '../services/stockService';

export const useStockMovements = (params?: any) => {
  return useQuery({
    queryKey: ['stockMovements', params],
    queryFn: () => getStockMovements(params || {}),
    enabled: true
  });
};

export const useStockLevels = (params?: any) => {
  return useQuery({
    queryKey: ['stockLevels', params],
    queryFn: () => getStockLevels(params || {}),
    enabled: true
  });
};

export const useLowStockAlerts = () => {
  return useQuery({
    queryKey: ['lowStockAlerts'],
    queryFn: () => getStockLevels({ lowStock: true, pageSize: 100 }),
    refetchInterval: 60000,
    select: (data) => {
      return data.items?.filter(
        (item: StockLevel) => item.currentStock <= item.minStock
      ) || [];
    }
  });
};

export const useFifoCost = (productId: string, quantity: number) => {
  return useQuery({
    queryKey: ['fifoCost', productId, quantity],
    queryFn: () => calculateFifoCost(productId, quantity),
    enabled: !!productId && quantity > 0
  });
};

/**
 * Stock level status
 */
export const getStockLevelStatus = (current: number, min: number, max: number) => {
  if (current <= min) return 'low';
  if (current >= max) return 'high';
  return 'normal';
};

/**
 * Stock level status colors
 */
export const getStockLevelColor = (status: string) => {
  switch (status) {
    case 'low': return '#ff4d4f';
    case 'high': return '#52c41a';
    default: return '#1890ff';
  }
};