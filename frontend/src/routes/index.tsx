import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Spin } from 'antd';

/**
 * Lazy loading wrapper component
 */
const LazyLoad = (Component: React.LazyExoticComponent<any>) => {
  return (
    <Suspense
      fallback={
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh'
        }}>
          <Spin size="large" />
        </div>
      }
    >
      <Component />
    </Suspense>
  );
};

// Lazy load all pages
const Login = lazy(() => import('../features/auth/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('../features/auth/Register').then(m => ({ default: m.Register })));
const ForgotPassword = lazy(() => import('../features/auth/ForgotPassword').then(m => ({ default: m.ForgotPassword })));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const ComingSoon = lazy(() => import('../pages/common/ComingSoon'));
const InvoiceList = lazy(() => import('../pages/invoices/InvoiceList'));
const InvoiceForm = lazy(() => import('../pages/invoices/InvoiceForm'));
const InvoiceDetail = lazy(() => import('../pages/invoices/InvoiceDetail'));
const ProMainLayout = lazy(() => import('../layouts/ProMainLayout').then(m => ({ default: m.ProMainLayout })));
const ProtectedRoute = lazy(() => import('../components/auth/ProtectedRoute').then(m => ({ default: m.ProtectedRoute })));
const ProfilePage = lazy(() => import('../pages/profile/ProfilePage').then(m => ({ default: m.ProfilePage })));
const SettingsLayout = lazy(() => import('../pages/settings/SettingsLayout').then(m => ({ default: m.SettingsLayout })));
const AccountSettings = lazy(() => import('../pages/settings/AccountSettings').then(m => ({ default: m.AccountSettings })));
const CompanySettings = lazy(() => import('../pages/settings/CompanySettings').then(m => ({ default: m.CompanySettings })));
const ApiTestPage = lazy(() => import('../pages/debug/ApiTestPage').then(m => ({ default: m.ApiTestPage })));
const Error403 = lazy(() => import('../pages/errors/403').then(m => ({ default: m.Error403 })));
const Error404 = lazy(() => import('../pages/errors/404').then(m => ({ default: m.Error404 })));
const NotFoundPage = lazy(() => import('../pages/errors/404'));
const ServerErrorPage = lazy(() => import('../pages/500'));
const CompanyList = lazy(() => import('../features/companies/CompanyList').then(m => ({ default: m.CompanyList })));
const CompanyForm = lazy(() => import('../features/companies/CompanyForm').then(m => ({ default: m.CompanyForm })));
const CategoryList = lazy(() => import('../features/categories/CategoryList'));
const PartnerList = lazy(() => import('../pages/common/ComingSoon'));
const PartnerDetail = lazy(() => import('../pages/common/ComingSoon'));
const ProductList = lazy(() => import('../pages/common/ComingSoon'));
const ProductForm = lazy(() => import('../features/products/ProductForm').then(m => ({ default: m.ProductForm })));
const ProductCategoryList = lazy(() => import('../features/categories/CategoryList'));
// Invoice routes moved to pages/invoices
const PaymentList = lazy(() => import('../features/payments/PaymentList').then(m => ({ default: m.PaymentList })));
const PaymentForm = lazy(() => import('../features/payments/PaymentForm').then(m => ({ default: m.PaymentForm })));
const CashAccountList = lazy(() => import('../features/payments/CashAccountList').then(m => ({ default: m.CashAccountList })));
const BankAccountList = lazy(() => import('../features/payments/BankAccountList').then(m => ({ default: m.BankAccountList })));
const GrQueueList = lazy(() => import('../features/grQueue/GrQueueList').then(m => ({ default: m.GrQueueList })));
const ReportsPage = lazy(() => import('../features/reports/ReportsPage'));
const SettingsPage = lazy(() => import('../features/settings/SettingsPage'));
const StockMovementList = lazy(() => import('@/features/stockMovements/StockMovementList'));
const PurchaseOrderList = lazy(() => import('@/features/purchaseOrders/PurchaseOrderList'));
const PurchaseOrderForm = lazy(() => import('@/features/purchaseOrders/PurchaseOrderForm'));
const PurchaseOrderDetail = lazy(() => import('@/features/purchaseOrders/PurchaseOrderDetail'));
const GoodsReceiptList = lazy(() => import('@/features/goodsReceipts/GoodsReceiptList'));
const GoodsReceiptForm = lazy(() => import('@/features/goodsReceipts/GoodsReceiptForm'));
const GoodsReceiptDetail = lazy(() => import('@/features/goodsReceipts/GoodsReceiptDetail'));
const QuotationList = lazy(() => import('../pages/common/ComingSoon'));
const QuotationForm = lazy(() => import('../pages/common/ComingSoon'));
const QuotationDetail = lazy(() => import('../pages/common/ComingSoon'));
const SalesOrderList = lazy(() => import('@/features/salesOrders/SalesOrderList'));
const SalesOrderForm = lazy(() => import('@/features/salesOrders/SalesOrderForm'));
const SalesOrderDetail = lazy(() => import('@/features/salesOrders/SalesOrderDetail'));
const ContractList = lazy(() => import('@/features/contracts/ContractList'));
const ContractForm = lazy(() => import('@/features/contracts/ContractForm'));
const ContractDetail = lazy(() => import('@/features/contracts/ContractDetail'));
const PowerOfAttorneyList = lazy(() => import('@/features/powerOfAttorney/PowerOfAttorneyList'));
const OwnerSettingsPage = lazy(() => import('@/features/ownerSettings/OwnerSettingsPage'));
const ExpenseCategoryList = lazy(() => import('@/features/expenses/ExpenseCategoryList'));
const ExpenseList = lazy(() => import('@/features/expenses/ExpenseList'));
const ExpenseForm = lazy(() => import('@/features/expenses/ExpenseForm'));
const ExpenseDetail = lazy(() => import('@/features/expenses/ExpenseDetail'));
const ChartOfAccountsList = lazy(() => import('@/features/chartOfAccounts/ChartOfAccountsList'));
const TrialBalance = lazy(() => import('@/features/chartOfAccounts/TrialBalance'));
const JournalEntryList = lazy(() => import('@/features/journalEntries/JournalEntryList'));
const JournalEntryForm = lazy(() => import('@/features/journalEntries/JournalEntryForm'));
const JournalEntryDetail = lazy(() => import('@/features/journalEntries/JournalEntryDetail'));
const LedgerView = lazy(() => import('@/features/journalEntries/LedgerView'));
const ReportsDashboard = lazy(() => import('@/features/reports/ReportsDashboard'));
const IncomeStatementReport = lazy(() => import('@/features/reports/IncomeStatementReport'));
const SalesReport = lazy(() => import('@/pages/reports/SalesReport'));
const InventoryReport = lazy(() => import('@/features/reports/InventoryReport'));
const AgingReport = lazy(() => import('@/features/reports/AgingReport'));

// Protected Route komponenti - useAuth hook'u kullanıyor

// Router yapılandırması
export const router = createBrowserRouter([
  // Public routes
  {
    path: '/login',
    element: LazyLoad(Login),
  },
  {
    path: '/register',
    element: LazyLoad(Register),
  },
  {
    path: '/forgot-password',
    element: LazyLoad(ForgotPassword),
  },

  // Protected routes (Layout içinde)
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <ProMainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: LazyLoad(Dashboard),
      },
      {
        path: 'companies',
        children: [
          {
            index: true,
            element: <CompanyList />,
          },
          {
            path: 'create',
            element: <CompanyForm />,
          },
          {
            path: 'edit/:id',
            element: <CompanyForm />,
          },
        ],
      },
      {
        path: 'invoices',
        children: [
          {
            index: true,
            element: <InvoiceList />,
          },
          {
            path: 'create',
            element: <InvoiceForm />,
          },
          {
            path: 'edit/:id',
            element: <InvoiceForm />,
          },
          {
            path: ':id',
            element: <InvoiceDetail />,
          },
        ],
      },
      {
        path: 'payments',
        children: [
          {
            index: true,
            element: <PaymentList />,
          },
          {
            path: 'create',
            element: <PaymentForm />,
          },
          {
            path: 'edit/:id',
            element: <PaymentForm />,
          },
          {
            path: ':id',
            element: <div className="text-2xl">Payment Detail (TODO)</div>,
          },
        ],
      },
      {
        path: 'cash-accounts',
        element: <CashAccountList />,
      },
      {
        path: 'bank-accounts',
        element: <BankAccountList />,
      },
      {
        path: 'gr-queue',
        element: <GrQueueList />,
      },
      {
        path: 'reports',
        element: <ReportsPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: 'partners',
        children: [
          {
            index: true,
            element: <PartnerList />,
          },
          {
            path: ':id',
            element: <PartnerDetail />,
          },
        ],
      },
      {
        path: 'categories',
        element: <CategoryList />,
      },
      {
        path: 'products',
        children: [
          {
            index: true,
            element: <ProductList />,
          },
          {
            path: 'create',
            element: <ProductForm />,
          },
          {
            path: 'edit/:id',
            element: <ProductForm />,
          },
          {
            path: 'categories',
            element: <ProductCategoryList />,
          },
          {
            path: ':id',
            element: <div className="text-2xl">Ürün Detay (TODO)</div>,
          },
        ],
      },
              {
                path: 'quotations',
                children: [
                  {
                    index: true,
                    element: <QuotationList />,
                  },
                  {
                    path: 'new',
                    element: <QuotationForm />,
                  },
                  {
                    path: 'edit/:id',
                    element: <QuotationForm />,
                  },
                  {
                    path: ':id',
                    element: <QuotationDetail />,
                  },
                ],
              },
              {
                path: 'sales-orders',
                children: [
                  {
                    index: true,
                    element: <SalesOrderList />,
                  },
                  {
                    path: 'new',
                    element: <SalesOrderForm />,
                  },
                  {
                    path: 'edit/:id',
                    element: <SalesOrderForm />,
                  },
                  {
                    path: ':id',
                    element: <SalesOrderDetail />,
                  },
                ],
              },
              {
                path: 'contracts',
                children: [
                  {
                    index: true,
                    element: <ContractList />,
                  },
                  {
                    path: 'new',
                    element: <ContractForm />,
                  },
                  {
                    path: 'edit/:id',
                    element: <ContractForm />,
                  },
                  {
                    path: ':id',
                    element: <ContractDetail />,
                  },
                ],
              },
              {
                path: 'power-of-attorney',
                children: [
                  {
                    index: true,
                    element: <PowerOfAttorneyList />,
                  },
                ],
              },
              {
                path: 'owner',
                children: [
                  {
                    path: 'settings',
                    element: <OwnerSettingsPage />,
                  },
                ],
              },
              {
                path: 'expense-categories',
                element: <ExpenseCategoryList />,
              },
              {
                path: 'expenses',
                children: [
                  {
                    index: true,
                    element: <ExpenseList />,
                  },
                  {
                    path: 'new',
                    element: <ExpenseForm />,
                  },
                  {
                    path: 'edit/:id',
                    element: <ExpenseForm />,
                  },
                  {
                    path: ':id',
                    element: <ExpenseDetail />,
                  },
                ],
              },
              {
                path: 'chart-of-accounts',
                element: <ChartOfAccountsList />,
              },
              {
                path: 'trial-balance',
                element: <TrialBalance />,
              },
              {
                path: 'journal-entries',
                children: [
                  {
                    index: true,
                    element: <JournalEntryList />,
                  },
                  {
                    path: 'new',
                    element: <JournalEntryForm />,
                  },
                  {
                    path: 'edit/:id',
                    element: <JournalEntryForm />,
                  },
                  {
                    path: ':id',
                    element: <JournalEntryDetail />,
                  },
                  {
                    path: 'ledger',
                    element: <LedgerView />,
                  },
                ],
              },
              {
                path: 'reports',
                children: [
                  {
                    index: true,
                    element: <ReportsDashboard />,
                  },
                  {
                    path: 'income-statement',
                    element: <IncomeStatementReport />,
                  },
                  {
                    path: 'sales',
                    element: <SalesReport />,
                  },
                  {
                    path: 'inventory',
                    element: <InventoryReport />,
                  },
                  {
                    path: 'receivables-aging',
                    element: <AgingReport />,
                  },
                  {
                    path: 'payables-aging',
                    element: <AgingReport />,
                  },
                ],
              },
      {
        path: 'stock-movements',
        element: <StockMovementList />,
      },
      {
        path: 'purchase-orders',
        children: [
          {
            index: true,
            element: <PurchaseOrderList />,
          },
          {
            path: 'new',
            element: <PurchaseOrderForm />,
          },
          {
            path: 'edit/:id',
            element: <PurchaseOrderForm />,
          },
          {
            path: ':id',
            element: <PurchaseOrderDetail />,
          },
        ],
      },
      {
        path: 'goods-receipts',
        children: [
          {
            index: true,
            element: <GoodsReceiptList />,
          },
          {
            path: 'new',
            element: <GoodsReceiptForm />,
          },
          {
            path: 'edit/:id',
            element: <GoodsReceiptForm />,
          },
          {
            path: ':id',
            element: <GoodsReceiptDetail />,
          },
        ],
      },
      {
        path: 'payments',
        element: <div className="text-2xl">Tahsilat/Ödeme (TODO)</div>,
      },
      {
        path: 'cash-accounts',
        element: <div className="text-2xl">Kasa (TODO)</div>,
      },
      {
        path: 'bank-accounts',
        element: <div className="text-2xl">Banka (TODO)</div>,
      },
      {
        path: 'expenses',
        element: <div className="text-2xl">Masraflar (TODO)</div>,
      },
      {
        path: 'chart-of-accounts',
        element: <div className="text-2xl">Hesap Planı (TODO)</div>,
      },
      {
        path: 'journal-entries',
        element: <div className="text-2xl">Yevmiye (TODO)</div>,
      },
      {
        path: 'trial-balance',
        element: <div className="text-2xl">Mizan (TODO)</div>,
      },
      {
        path: 'tax-rates',
        element: <div className="text-2xl">Vergi Oranları (TODO)</div>,
      },
      {
        path: 'reports/profit-loss',
        element: <div className="text-2xl">Kar/Zarar Raporu (TODO)</div>,
      },
      {
        path: 'reports/stock',
        element: <div className="text-2xl">Stok Raporu (TODO)</div>,
      },
      {
        path: 'reports/fifo',
        element: <div className="text-2xl">FIFO Maliyet Raporu (TODO)</div>,
      },
      {
        path: 'reports/gr-balance',
        element: <div className="text-2xl">GR Bakiyesi Raporu (TODO)</div>,
      },
      {
        path: 'settings/company',
        element: <div className="text-2xl">Şirket Bilgileri (TODO)</div>,
      },
      {
        path: 'settings/users',
        element: <div className="text-2xl">Kullanıcılar (TODO)</div>,
      },
      {
        path: 'settings/preferences',
        element: <div className="text-2xl">Tercihler (TODO)</div>,
      },
      {
        path: 'settings',
        element: <SettingsLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/settings/account" replace />
          },
          {
            path: 'account',
            element: <AccountSettings />
          },
          {
            path: 'company',
            element: <CompanySettings />
          }
        ]
      },
      {
        path: 'debug/api-test',
        element: <ApiTestPage />
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'notifications',
        element: <div className="text-2xl">Bildirimler (TODO)</div>,
      },
    ],
  },

  // Error pages
  {
    path: '/404',
    element: <Error404 />,
  },
  {
    path: '/403',
    element: <Error403 />,
  },
  {
    path: '/500',
    element: <ServerErrorPage />,
  },
  
  // 404 fallback
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

