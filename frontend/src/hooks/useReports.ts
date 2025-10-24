import { useQuery, useMutation } from '@tanstack/react-query';
import { reportService, ReportFilters, ExportFormat } from '../services/reportService';
import { useMessage } from './useMessage';

/**
 * Reports hook
 */
export const useSalesReport = (filters: ReportFilters) => {
  return useQuery({
    queryKey: ['salesReport', filters],
    queryFn: () => reportService.getSalesReport(filters),
    enabled: !!filters.startDate && !!filters.endDate,
    staleTime: 5 * 60 * 1000 // 5 dakika
  });
};

export const useProfitLossReport = (filters: ReportFilters) => {
  return useQuery({
    queryKey: ['profitLossReport', filters],
    queryFn: () => reportService.getProfitLossReport(filters),
    enabled: !!filters.startDate && !!filters.endDate,
    staleTime: 5 * 60 * 1000
  });
};

export const usePartnerAgingReport = (filters?: Partial<ReportFilters>) => {
  return useQuery({
    queryKey: ['partnerAgingReport', filters],
    queryFn: () => reportService.getPartnerAgingReport(filters || {}),
    staleTime: 5 * 60 * 1000
  });
};

export const useStockValuationReport = () => {
  return useQuery({
    queryKey: ['stockValuationReport'],
    queryFn: reportService.getStockValuationReport,
    staleTime: 5 * 60 * 1000
  });
};

export const useTaxReport = (filters: ReportFilters) => {
  return useQuery({
    queryKey: ['taxReport', filters],
    queryFn: () => reportService.getTaxReport(filters),
    enabled: !!filters.startDate && !!filters.endDate,
    staleTime: 5 * 60 * 1000
  });
};

/**
 * Export mutation
 */
export const useExportReport = () => {
  const message = useMessage();

  return useMutation({
    mutationFn: async ({
      reportType,
      format,
      filters
    }: {
      reportType: any;
      format: ExportFormat;
      filters: ReportFilters;
    }) => {
      const blob = await reportService.exportReport(reportType, format, filters);
      
      // Dosyayı indir
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportType}-${new Date().getTime()}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return blob;
    },
    onSuccess: () => {
      message.success('Rapor başarıyla indirildi');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Rapor indirilemedi';
      message.error(errorMessage);
    }
  });
};

/**
 * Invoice PDF download
 */
export const useDownloadInvoicePdf = () => {
  const message = useMessage();

  return useMutation({
    mutationFn: async (invoiceId: string) => {
      const blob = await reportService.downloadInvoicePdf(invoiceId);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `fatura-${invoiceId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return blob;
    },
    onSuccess: () => {
      message.success('Fatura PDF indirildi');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'PDF indirilemedi';
      message.error(errorMessage);
    }
  });
};

/**
 * List export
 */
export const useExportList = () => {
  const message = useMessage();

  return useMutation({
    mutationFn: async ({
      entityType,
      format,
      filters
    }: {
      entityType: 'partners' | 'products' | 'invoices' | 'payments';
      format: 'excel' | 'csv';
      filters?: any;
    }) => {
      const blob = await reportService.exportList(entityType, format, filters);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${entityType}-${new Date().getTime()}.${format === 'excel' ? 'xlsx' : 'csv'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return blob;
    },
    onSuccess: () => {
      message.success('Liste başarıyla dışa aktarıldı');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Dışa aktarma başarısız';
      message.error(errorMessage);
    }
  });
};
