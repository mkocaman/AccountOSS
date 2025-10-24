import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { partnerService, PartnerFilters, CreatePartnerDto, UpdatePartnerDto } from '../services/partnerService';
import { transformToProTableResponse } from '../utils/api-helpers';
import { useMessage } from './useMessage';

/**
 * Partners hook - API ile çalışır
 */
export const usePartners = (filters: PartnerFilters = {}) => {
  const query = useQuery({
    queryKey: ['partners', filters],
    queryFn: () => partnerService.getPartners(filters),
    staleTime: 30000 // 30 saniye
  });

  const proTableData = query.data ? transformToProTableResponse(query.data) : undefined;

  return {
    ...query,
    proTableData
  };
};

/**
 * Single partner hook
 */
export const usePartner = (id: string) => {
  return useQuery({
    queryKey: ['partner', id],
    queryFn: () => partnerService.getPartnerById(id),
    enabled: !!id
  });
};

/**
 * Create partner mutation
 */
export const useCreatePartner = () => {
  const queryClient = useQueryClient();
  const message = useMessage();

  return useMutation({
    mutationFn: partnerService.createPartner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      message.success('Cari hesap başarıyla oluşturuldu');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Cari hesap oluşturulamadı';
      message.error(errorMessage);
    }
  });
};

/**
 * Update partner mutation
 */
export const useUpdatePartner = () => {
  const queryClient = useQueryClient();
  const message = useMessage();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePartnerDto }) =>
      partnerService.updatePartner(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      queryClient.invalidateQueries({ queryKey: ['partner', variables.id] });
      message.success('Cari hesap başarıyla güncellendi');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Cari hesap güncellenemedi';
      message.error(errorMessage);
    }
  });
};

/**
 * Delete partner mutation
 */
export const useDeletePartner = () => {
  const queryClient = useQueryClient();
  const message = useMessage();

  return useMutation({
    mutationFn: partnerService.deletePartner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      message.success('Cari hesap başarıyla silindi');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Cari hesap silinemedi';
      message.error(errorMessage);
    }
  });
};
