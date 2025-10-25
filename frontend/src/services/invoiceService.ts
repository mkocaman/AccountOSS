import client from '../utils/client';
import type { 
  Invoice, 
  CreateInvoiceRequest, 
  UpdateInvoiceRequest,
  InvoiceFilters,
  InvoiceSummary
} from '@/types/invoice';
import { mockInvoices, mockInvoiceSummary } from '@/mocks/invoiceData';

/**
 * API yanıt tipini tanımla
 */
interface ApiResponse<T> {
  data: T;
  succeeded: boolean;
  message: string;
  errors: string[];
}

/**
 * Sayfalanmış yanıt tipi
 */
interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Sayfalama parametreleri
 */
interface PaginationParams {
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}


// Mock mode flag - Backend hazır olunca false yap
const USE_MOCK_DATA = false; // ✅ Gerçek API'ye geçiş

/**
 * API hata yönetimi
 * @param error - Yakalanan hata
 * @throws Error - Türkçe hata mesajı ile
 */
const handleApiError = (error: any): never => {
  console.error('❌ API Error:', error);
  
  if (error.response) {
    // Backend'den gelen hata
    const message = error.response.data?.message || 'Bir hata oluştu';
    throw new Error(message);
  } else if (error.request) {
    // İstek gönderildi ama yanıt gelmedi
    throw new Error('Sunucuya ulaşılamıyor. Lütfen internet bağlantınızı kontrol edin.');
  } else {
    // İstek hazırlanırken hata
    throw new Error(error.message || 'Beklenmeyen bir hata oluştu');
  }
};

/**
 * Query string oluşturucu
 * @param params - Query parametreleri
 * @returns URL query string
 */
const buildQueryString = (params: Record<string, any>): string => {
  const cleanParams = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value.map(v => `${key}=${encodeURIComponent(v)}`).join('&');
      }
      return `${key}=${encodeURIComponent(value)}`;
    })
    .join('&');
  return cleanParams ? `?${cleanParams}` : '';
};

/**
 * Tüm faturaları getirir - filtreleme ve sayfalama ile
 * @param params - Filtreleme ve sayfalama parametreleri
 * @returns Fatura listesi ve sayfalama bilgisi
 */
export const getInvoices = async (
  params: PaginationParams & InvoiceFilters
): Promise<PaginatedResponse<Invoice>> => {
  if (USE_MOCK_DATA) {
    // Mock data döndür
    console.log('📦 Using MOCK invoice data');
    
    // Sayfalama simülasyonu
    const pageNumber = params.pageNumber || 1;
    const pageSize = params.pageSize || 10;
    const startIndex = (pageNumber - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    // Filtreleme simülasyonu
    let filtered = [...mockInvoices];
    
    if (params.status) {
      filtered = filtered.filter(inv => inv.status === params.status);
    }
    
    if (params.invoiceType) {
      filtered = filtered.filter(inv => inv.invoiceType === params.invoiceType);
    }
    
    const paginatedItems = filtered.slice(startIndex, endIndex);
    
    return {
      items: paginatedItems,
      totalCount: filtered.length,
      pageNumber,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize),
      hasNextPage: endIndex < filtered.length,
      hasPreviousPage: pageNumber > 1
    };
  }
  
  try {
    // Query parametrelerini hazırla
    const queryString = buildQueryString(params);
    console.log('🔍 Fetching invoices with params:', params);
    
    // API isteği gönder
    const response = await client.get<ApiResponse<PaginatedResponse<Invoice>>>(
      `/invoices${queryString}`
    );
    
    // Başarılı yanıtı döndür
    console.log('✅ Invoices fetched successfully:', response.data);
    return response.data.data;
  } catch (error) {
    // Hata yönetimi
    handleApiError(error);
    throw error; // TypeScript için return statement
  }
};

/**
 * ID'ye göre fatura detayını getirir
 * @param id - Fatura ID'si
 * @returns Fatura detayı
 */
export const getInvoice = async (id: string): Promise<Invoice> => {
  if (USE_MOCK_DATA) {
    console.log('📦 Using MOCK invoice detail');
    const invoice = mockInvoices.find(inv => inv.id === id);
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    return invoice;
  }
  
  try {
    console.log('🔍 Fetching invoice detail for ID:', id);
    
    // API isteği gönder
    const response = await client.get<ApiResponse<Invoice>>(`/invoices/${id}`);
    
    // Başarılı yanıtı döndür
    console.log('✅ Invoice detail fetched successfully:', response.data);
    return response.data.data;
  } catch (error) {
    // Hata yönetimi
    handleApiError(error);
    throw error; // TypeScript için return statement
  }
};

/**
 * Yeni fatura oluşturur
 * @param data - Fatura oluşturma verisi
 * @returns Oluşturulan fatura
 */
export const createInvoice = async (data: CreateInvoiceRequest): Promise<Invoice> => {
  if (USE_MOCK_DATA) {
    console.log('📦 MOCK: Creating invoice');
    // Mock yeni fatura oluştur
    const newInvoice: Invoice = {
      id: String(mockInvoices.length + 1),
      invoiceNumber: `FT-2025-${String(mockInvoices.length + 1).padStart(4, '0')}`,
      invoiceType: data.invoiceType,
      status: 'draft',
      partnerId: data.partnerId,
      partnerName: 'Mock Partner',
      invoiceDate: data.invoiceDate,
      dueDate: data.dueDate,
      subtotal: 0,
      taxAmount: 0,
      discountAmount: 0,
      totalAmount: 0,
      currency: data.currency || 'TRY',
      exchangeRate: data.exchangeRate || 1,
      items: [],
      description: data.description,
      companyId: '1',
      createdAt: new Date().toISOString(),
      createdBy: 'Mock User'
    };
    
    mockInvoices.push(newInvoice);
    return newInvoice;
  }
  
  try {
    console.log('🔍 Creating new invoice:', data);
    
    // API isteği gönder
    const response = await client.post<ApiResponse<Invoice>>('/invoices', data);
    
    // Başarılı yanıtı döndür
    console.log('✅ Invoice created successfully:', response.data);
    return response.data.data;
  } catch (error) {
    // Hata yönetimi
    handleApiError(error);
    throw error; // TypeScript için return statement
  }
};

/**
 * Fatura günceller
 * @param data - Fatura güncelleme verisi
 * @returns Güncellenmiş fatura
 */
export const updateInvoice = async (data: UpdateInvoiceRequest): Promise<Invoice> => {
  if (USE_MOCK_DATA) {
    console.log('📦 MOCK: Updating invoice');
    const index = mockInvoices.findIndex(inv => inv.id === data.id);
    if (index === -1) {
      throw new Error('Invoice not found');
    }
    
    mockInvoices[index] = {
      ...mockInvoices[index],
      ...data,
      items: mockInvoices[index].items, // Mevcut items'ı koru
      updatedAt: new Date().toISOString()
    };
    
    return mockInvoices[index];
  }
  
  try {
    console.log('🔍 Updating invoice:', data.id, data);
    
    // API isteği gönder
    const response = await client.put<ApiResponse<Invoice>>(`/invoices/${data.id}`, data);
    
    // Başarılı yanıtı döndür
    console.log('✅ Invoice updated successfully:', response.data);
    return response.data.data;
  } catch (error) {
    // Hata yönetimi
    handleApiError(error);
    throw error; // TypeScript için return statement
  }
};

/**
 * Fatura siler (soft delete)
 * @param id - Silinecek fatura ID'si
 */
export const deleteInvoice = async (id: string): Promise<void> => {
  if (USE_MOCK_DATA) {
    console.log('📦 MOCK: Deleting invoice');
    const index = mockInvoices.findIndex(inv => inv.id === id);
    if (index !== -1) {
      mockInvoices.splice(index, 1);
    }
    return;
  }
  
  try {
    console.log('🔍 Deleting invoice:', id);
    
    // API isteği gönder
    await client.delete(`/invoices/${id}`);
    
    // Başarılı silme
    console.log('✅ Invoice deleted successfully:', id);
  } catch (error) {
    // Hata yönetimi
    handleApiError(error);
    throw error; // TypeScript için return statement
  }
};

/**
 * Fatura durumunu değiştirir
 * @param id - Fatura ID'si
 * @param status - Yeni durum
 * @returns Güncellenmiş fatura
 */
export const updateInvoiceStatus = async (
  id: string, 
  status: string
): Promise<Invoice> => {
  if (USE_MOCK_DATA) {
    console.log('📦 MOCK: Updating invoice status');
    const invoice = mockInvoices.find(inv => inv.id === id);
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    invoice.status = status as any;
    return invoice;
  }
  
  try {
    console.log('🔍 Updating invoice status:', id, status);
    
    // API isteği gönder
    const response = await client.patch<ApiResponse<Invoice>>(`/invoices/${id}/status`, { status });
    
    // Başarılı yanıtı döndür
    console.log('✅ Invoice status updated successfully:', response.data);
    return response.data.data;
  } catch (error) {
    // Hata yönetimi
    handleApiError(error);
    throw error; // TypeScript için return statement
  }
};

/**
 * Fatura PDF'ini oluşturur
 * @param id - Fatura ID'si
 * @returns PDF blob dosyası
 */
export const generateInvoicePDF = async (id: string): Promise<Blob> => {
  if (USE_MOCK_DATA) {
    console.log('📦 MOCK: Generating PDF (not implemented)');
    throw new Error('PDF generation not available in mock mode');
  }
  
  try {
    console.log('🔍 Generating PDF for invoice:', id);
    
    // API isteği gönder
    const response = await client.get(`/invoices/${id}/pdf`, {
      responseType: 'blob'
    });
    
    // Başarılı PDF oluşturma
    console.log('✅ PDF generated successfully:', id);
    return response.data;
  } catch (error) {
    // Hata yönetimi
    handleApiError(error);
    throw error; // TypeScript için return statement
  }
};

/**
 * Fatura özet istatistiklerini getirir
 * @param filters - Filtreleme parametreleri
 * @returns Fatura özet bilgileri
 */
export const getInvoiceSummary = async (
  filters?: InvoiceFilters
): Promise<InvoiceSummary> => {
  if (USE_MOCK_DATA) {
    console.log('📦 Using MOCK invoice summary');
    return mockInvoiceSummary;
  }
  
  try {
    console.log('🔍 Fetching invoice summary with filters:', filters);
    
    // Query parametrelerini hazırla
    const queryString = buildQueryString(filters || {});
    
    // API isteği gönder
    const response = await client.get<ApiResponse<InvoiceSummary>>(`/invoices/summary${queryString}`);
    
    // Başarılı yanıtı döndür
    console.log('✅ Invoice summary fetched successfully:', response.data);
    return response.data.data;
  } catch (error) {
    // Hata yönetimi
    handleApiError(error);
    throw error; // TypeScript için return statement
  }
};

/**
 * Fatura numarası önerir (sonraki sıradaki numara)
 * @param invoiceType - Fatura tipi
 * @returns Önerilen fatura numarası
 */
export const suggestInvoiceNumber = async (
  invoiceType: string
): Promise<string> => {
  if (USE_MOCK_DATA) {
    console.log('📦 MOCK: Suggesting invoice number');
    const count = mockInvoices.filter(inv => inv.invoiceType === invoiceType).length;
    return `FT-2025-${String(count + 1).padStart(4, '0')}`;
  }
  
  try {
    console.log('🔍 Suggesting invoice number for type:', invoiceType);
    
    // API isteği gönder
    const response = await client.get<ApiResponse<{ invoiceNumber: string }>>(`/invoices/suggest-number?type=${invoiceType}`);
    
    // Başarılı yanıtı döndür
    console.log('✅ Invoice number suggested successfully:', response.data);
    return response.data.data.invoiceNumber;
  } catch (error) {
    // Hata yönetimi
    handleApiError(error);
    throw error; // TypeScript için return statement
  }
};
