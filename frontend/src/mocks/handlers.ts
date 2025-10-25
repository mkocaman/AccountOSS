import { http, HttpResponse } from 'msw';

/**
 * Mock API handlers - Backend hazır olana kadar
 * Development modda 404 hatalarını önler
 */

const BASE_URL = 'http://localhost:7043/api/v1';

export const handlers = [
  // Settings - Languages
  http.get(`${BASE_URL}/settings/languages`, () => {
    return HttpResponse.json([
      { code: 'tr', name: 'Türkçe', flag: '🇹🇷', isDefault: true },
      { code: 'en', name: 'English', flag: '🇬🇧', isDefault: false }
    ]);
  }),

  // Settings - Company
  http.get(`${BASE_URL}/settings/company`, () => {
    return HttpResponse.json({
      companyName: 'AccountOS Demo Şirketi',
      taxNumber: '1234567890',
      taxOffice: 'Demo Vergi Dairesi',
      address: 'Demo Mahallesi, Demo Sokak No:1 İstanbul',
      phone: '+90 555 555 55 55',
      email: 'demo@accountos.com',
      website: 'https://accountos.com'
    });
  }),

  // Settings - Owner/User settings
  http.get(`${BASE_URL}/owner/settings`, () => {
    return HttpResponse.json({
      userId: '1',
      preferences: {
        language: 'tr',
        theme: 'light',
        dateFormat: 'DD/MM/YYYY',
        numberFormat: 'comma'
      }
    });
  }),

  // Notifications
  http.get(`${BASE_URL}/notifications`, () => {
    return HttpResponse.json({
      items: [
        {
          id: '1',
          type: 'payment',
          title: 'Ödeme Hatırlatması',
          message: '3 adet ödeme vadesi yaklaşıyor',
          isRead: false,
          createdAt: new Date(Date.now() - 3600000).toISOString() // 1 saat önce
        },
        {
          id: '2',
          type: 'stock',
          title: 'Düşük Stok Uyarısı',
          message: '5 üründe stok seviyesi kritik',
          isRead: false,
          createdAt: new Date(Date.now() - 7200000).toISOString() // 2 saat önce
        },
        {
          id: '3',
          type: 'invoice',
          title: 'Yeni Fatura',
          message: 'FAT-2025-001 numaralı fatura oluşturuldu',
          isRead: true,
          createdAt: new Date(Date.now() - 86400000).toISOString() // 1 gün önce
        }
      ],
      stats: {
        total: 3,
        unread: 2
      }
    });
  }),

  // Invoices List
  http.get(`${BASE_URL}/invoices`, () => {
    return HttpResponse.json({
      items: [],
      totalCount: 0,
      pageNumber: 1,
      pageSize: 10,
      totalPages: 0
    });
  }),

  // Customers/Partners List
  http.get(`${BASE_URL}/customers/list`, () => {
    return HttpResponse.json({
      items: [],
      totalCount: 0,
      pageNumber: 1,
      pageSize: 10,
      totalPages: 0
    });
  }),

  // Partners List (alternative endpoint)
  http.get(`${BASE_URL}/partners/list`, () => {
    return HttpResponse.json({
      items: [],
      totalCount: 0,
      pageNumber: 1,
      pageSize: 10,
      totalPages: 0
    });
  }),

  // Products List
  http.get(`${BASE_URL}/products/list`, () => {
    return HttpResponse.json({
      items: [],
      totalCount: 0,
      pageNumber: 1,
      pageSize: 10,
      totalPages: 0
    });
  }),

  // Dashboard Stats
  http.get(`${BASE_URL}/dashboard/stats`, () => {
    return HttpResponse.json({
      totalSales: 1234567.89,
      totalPurchases: 987654.32,
      profit: 246913.57,
      invoiceCount: 2234,
      recentInvoices: 45,
      lowStockProducts: 8,
      pendingPayments: 234567.89,
      activePartners: 567
    });
  }),

  // User Profile
  http.get(`${BASE_URL}/users/profile`, () => {
    return HttpResponse.json({
      id: '1',
      name: 'Demo Kullanıcı',
      email: 'demo@accountos.com',
      phone: '+90 555 555 55 55',
      company: 'AccountOS Demo',
      address: 'İstanbul, Türkiye',
      role: 'admin',
      avatar: null,
      createdAt: '2024-01-01T00:00:00Z'
    });
  }),

  // Dashboard stats
  http.get(`${BASE_URL}/dashboard/stats`, ({ request }) => {
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || 'month';

    return HttpResponse.json({
      totalSales: 1234567.89,
      totalPurchases: 987654.32,
      profit: 246913.57,
      profitMargin: 20,
      invoiceCount: 2234,
      recentInvoices: 45,
      lowStockProducts: 8,
      activePartners: 567,
      salesTrend: 12.5,
      purchasesTrend: 8.3
    });
  }),

  // Sales chart
  http.get(`${BASE_URL}/dashboard/sales-chart`, () => {
    const data = [];
    const today = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        sales: Math.random() * 50000 + 10000,
        purchases: Math.random() * 40000 + 8000
      });
    }
    
    return HttpResponse.json(data);
  }),

  // Recent activities
  http.get(`${BASE_URL}/dashboard/recent-activities`, () => {
    return HttpResponse.json([
      {
        id: '1',
        type: 'invoice',
        title: 'Yeni Fatura Oluşturuldu',
        description: 'FAT-2025-001 numaralı satış faturası',
        amount: 15000,
        createdAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: '2',
        type: 'payment',
        title: 'Ödeme Alındı',
        description: 'ABC Şirketi - Havale',
        amount: 25000,
        createdAt: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: '3',
        type: 'partner',
        title: 'Yeni Cari Hesap',
        description: 'XYZ Ltd. Şti. eklendi',
        createdAt: new Date(Date.now() - 86400000).toISOString()
      }
    ]);
  }),

  // Stock movements
  http.get(`${BASE_URL}/stock/movements`, () => {
    return HttpResponse.json({
      items: [],
      totalCount: 0,
      pageNumber: 1,
      pageSize: 10,
      totalPages: 0
    });
  }),

  // Stock levels
  http.get(`${BASE_URL}/stock/levels`, () => {
    return HttpResponse.json({
      items: [],
      totalCount: 0,
      pageNumber: 1,
      pageSize: 10,
      totalPages: 0
    });
  }),

  // Low stock alerts
  http.get(`${BASE_URL}/stock/low-stock-alerts`, () => {
    return HttpResponse.json([
      {
        productId: '1',
        productCode: 'PRD-001',
        productName: 'Ürün A',
        currentStock: 5,
        minStockLevel: 20,
        difference: -15
      },
      {
        productId: '2',
        productCode: 'PRD-002',
        productName: 'Ürün B',
        currentStock: 3,
        minStockLevel: 10,
        difference: -7
      }
    ]);
  }),

  // FIFO calculation
  http.get(`${BASE_URL}/stock/fifo/:productId`, ({ params }) => {
    return HttpResponse.json({
      productId: params.productId,
      currentStock: 100,
      fifoCost: 45.50,
      layers: [
        {
          date: '2025-01-15',
          quantity: 50,
          unitCost: 40.00,
          remainingQuantity: 50
        },
        {
          date: '2025-01-20',
          quantity: 50,
          unitCost: 51.00,
          remainingQuantity: 50
        }
      ]
    });
  }),

  // Payments
  http.get(`${BASE_URL}/payments`, () => {
    return HttpResponse.json({
      items: [],
      totalCount: 0,
      pageNumber: 1,
      pageSize: 10,
      totalPages: 0
    });
  }),

  // Payment summary
  http.get(`${BASE_URL}/payments/summary`, () => {
    return HttpResponse.json({
      totalCollections: 350000,
      totalPayments: 280000,
      netCashFlow: 70000,
      pendingCollections: 45000,
      pendingPayments: 32000
    });
  }),

  // Generate invoice number
  http.get(`${BASE_URL}/invoices/generate-number/:type`, ({ params }) => {
    const prefix = params.type === 'sales' ? 'SAT' : 'ALI';
    const number = `${prefix}-2025-${String(Math.floor(Math.random() * 1000)).padStart(4, '0')}`;
    
    return HttpResponse.json({
      invoiceNumber: number
    });
  }),

  // Generate payment number
  http.get(`${BASE_URL}/payments/generate-number/:type`, ({ params }) => {
    const prefix = params.type === 'collection' ? 'TAH' : 'ODE';
    const number = `${prefix}-2025-${String(Math.floor(Math.random() * 1000)).padStart(4, '0')}`;
    
    return HttpResponse.json({
      paymentNumber: number
    });
  }),

  // Reports
  http.get(`${BASE_URL}/reports/sales`, () => {
    return HttpResponse.json({
      period: 'monthly',
      totalSales: 1234567.89,
      totalQuantity: 5432,
      averageOrderValue: 45678.90,
      topProducts: [
        { productId: '1', productName: 'Ürün A', quantity: 150, revenue: 250000 },
        { productId: '2', productName: 'Ürün B', quantity: 120, revenue: 180000 },
        { productId: '3', productName: 'Ürün C', quantity: 100, revenue: 150000 }
      ],
      topPartners: [
        { partnerId: '1', partnerName: 'ABC Ltd.', totalSales: 450000, invoiceCount: 25 },
        { partnerId: '2', partnerName: 'XYZ A.Ş.', totalSales: 380000, invoiceCount: 18 },
        { partnerId: '3', partnerName: 'DEF Tic.', totalSales: 290000, invoiceCount: 15 }
      ],
      salesByDay: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
        sales: Math.random() * 50000 + 10000,
        invoiceCount: Math.floor(Math.random() * 10) + 1
      }))
    });
  }),

  // Global search
  http.get(`${BASE_URL}/search/global`, ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('query');

    return HttpResponse.json([
      {
        type: 'invoice',
        id: '1',
        title: `FAT-2025-001`,
        subtitle: 'ABC Ltd. - ₺15,000',
        url: '/invoices/1'
      },
      {
        type: 'partner',
        id: '1',
        title: 'ABC Ltd. Şti.',
        subtitle: 'Müşteri - Bakiye: ₺25,000',
        url: '/partners/1'
      },
      {
        type: 'product',
        id: '1',
        title: 'PRD-001 - Ürün A',
        subtitle: 'Stok: 150 adet',
        url: '/products/1'
      }
    ]);
  }),

  // Export endpoints
  http.get(`${BASE_URL}/reports/:type/export`, () => {
    // Return mock blob
    return HttpResponse.blob(new Blob(['Mock PDF/Excel data'], { type: 'application/pdf' }));
  }),

  http.get(`${BASE_URL}/:entity/export`, () => {
    return HttpResponse.blob(new Blob(['Mock export data'], { type: 'application/vnd.ms-excel' }));
  }),

  http.post(`${BASE_URL}/:entity/export-selected`, () => {
    return HttpResponse.blob(new Blob(['Mock bulk export'], { type: 'application/pdf' }));
  })
];
