import type { Invoice, InvoiceSummary } from '@/types/invoice';

/**
 * Mock fatura verileri - Backend hazır olana kadar
 */

export const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'FT-2025-0001',
    invoiceType: 'sales',
    status: 'paid',
    partnerId: '1',
    partnerCode: 'C001',
    partnerName: 'ABC Ticaret Ltd. Şti.',
    partnerTaxNumber: '1234567890',
    invoiceDate: '2025-01-15',
    dueDate: '2025-02-15',
    subtotal: 10000,
    taxAmount: 1800,
    discountAmount: 0,
    totalAmount: 11800,
    currency: 'TRY',
    exchangeRate: 1,
    items: [
      {
        id: '1',
        invoiceId: '1',
        productId: '1',
        productCode: 'URN-001',
        productName: 'Laptop Dell XPS 15',
        quantity: 2,
        unitPrice: 5000,
        discountRate: 0,
        discountAmount: 0,
        taxRate: 18,
        taxAmount: 1800,
        subtotal: 10000,
        totalAmount: 11800,
        lineNumber: 1
      }
    ],
    description: 'Ocak ayı satışı',
    companyId: '1',
    createdAt: '2025-01-15T10:00:00',
    createdBy: 'Test User',
    updatedAt: '2025-01-15T10:00:00'
  },
  {
    id: '2',
    invoiceNumber: 'FT-2025-0002',
    invoiceType: 'sales',
    status: 'sent',
    partnerId: '2',
    partnerCode: 'C002',
    partnerName: 'XYZ Teknoloji A.Ş.',
    partnerTaxNumber: '9876543210',
    invoiceDate: '2025-01-20',
    dueDate: '2025-02-20',
    subtotal: 25000,
    taxAmount: 4500,
    discountAmount: 500,
    totalAmount: 29000,
    currency: 'TRY',
    exchangeRate: 1,
    items: [
      {
        id: '2',
        invoiceId: '2',
        productId: '2',
        productCode: 'URN-002',
        productName: 'iPhone 15 Pro',
        quantity: 5,
        unitPrice: 5000,
        discountRate: 2,
        discountAmount: 500,
        taxRate: 18,
        taxAmount: 4500,
        subtotal: 24500,
        totalAmount: 29000,
        lineNumber: 1
      }
    ],
    companyId: '1',
    createdAt: '2025-01-20T14:30:00',
    createdBy: 'Test User',
    updatedAt: '2025-01-20T14:30:00'
  },
  {
    id: '3',
    invoiceNumber: 'FT-2025-0003',
    invoiceType: 'sales',
    status: 'draft',
    partnerId: '1',
    partnerCode: 'C001',
    partnerName: 'ABC Ticaret Ltd. Şti.',
    invoiceDate: '2025-01-25',
    subtotal: 8000,
    taxAmount: 1440,
    discountAmount: 0,
    totalAmount: 9440,
    currency: 'TRY',
    exchangeRate: 1,
    items: [],
    description: 'Taslak fatura',
    companyId: '1',
    createdAt: '2025-01-25T09:00:00',
    createdBy: 'Test User'
  }
];

export const mockInvoiceSummary: InvoiceSummary = {
  totalCount: 3,
  draftCount: 1,
  sentCount: 1,
  paidCount: 1,
  overdueCount: 0,
  totalAmount: 50240,
  paidAmount: 11800,
  unpaidAmount: 29000,
  overdueAmount: 0
};
