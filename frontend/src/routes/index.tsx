import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Login } from '@/features/auth/Login';
import { Dashboard } from '@/features/dashboard/Dashboard';
import { MainLayout } from '@/components/layout/MainLayout';
import { CompanyList } from '@/features/companies/CompanyList';
import { CompanyForm } from '@/features/companies/CompanyForm';
import { useAuthStore } from '@/store/authStore';

// Protected Route komponenti
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Router yapılandırması
export const router = createBrowserRouter([
  // Public routes
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <div>Register Page (TODO)</div>,
  },

  // Protected routes (Layout içinde)
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
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
        element: <div className="text-2xl">Fatura Listesi (TODO)</div>,
      },
      {
        path: 'invoices/create',
        element: <div className="text-2xl">Yeni Fatura (TODO)</div>,
      },
      {
        path: 'invoices/gr-queue',
        element: <div className="text-2xl">GR Kuyruğu (TODO)</div>,
      },
      {
        path: 'customers',
        element: <div className="text-2xl">Müşteri Listesi (TODO)</div>,
      },
      {
        path: 'suppliers',
        element: <div className="text-2xl">Tedarikçi Listesi (TODO)</div>,
      },
      {
        path: 'products',
        element: <div className="text-2xl">Ürün Listesi (TODO)</div>,
      },
      {
        path: 'categories',
        element: <div className="text-2xl">Kategoriler (TODO)</div>,
      },
      {
        path: 'stock',
        element: <div className="text-2xl">Stok Hareketleri (TODO)</div>,
      },
      {
        path: 'purchase-orders',
        element: <div className="text-2xl">Sipariş Listesi (TODO)</div>,
      },
      {
        path: 'goods-receipts',
        element: <div className="text-2xl">Mal Kabul (TODO)</div>,
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
        element: <div className="text-2xl">Ayarlar (TODO)</div>,
      },
      {
        path: 'profile',
        element: <div className="text-2xl">Profilim (TODO)</div>,
      },
      {
        path: 'notifications',
        element: <div className="text-2xl">Bildirimler (TODO)</div>,
      },
    ],
  },

  // 404
  {
    path: '*',
    element: <div className="text-2xl p-8">404 - Sayfa bulunamadı</div>,
  },
]);

