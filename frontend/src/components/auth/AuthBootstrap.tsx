import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/api/client';
import { useCompanyStore } from '@/stores/companyStore';

/**
 * AuthBootstrap - Auth hidrasyonu tamamlanmadan Router'ı render etme
 * 
 * Bu komponent:
 * 1. localStorage'dan token'ları yükler
 * 2. Auth store'u günceller  
 * 3. Hidrasyon tamamlanana kadar bekler
 * 4. Router'ın render edilmesini engeller
 */
export default function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const { isHydrated, hydrate, setAuth } = useAuthStore();
  const hydrateCompany = useCompanyStore((s) => s.hydrate);

  useEffect(() => {
    const run = async () => {
      if (import.meta.env.DEV) {
        console.log('🔧 [AuthBootstrap] Starting hydration...');
      }
      // Persist middleware otomatik hydration yapıyor, sadece flag'i set et
      hydrate();
      hydrateCompany();
      
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const meRes = await apiClient.get('/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const userData = (meRes as any).data?.data ?? (meRes as any).data;
          setAuth({
            user: userData,
            accessToken: token,
            refreshToken: localStorage.getItem('refreshToken') || '',
          });

          // Company seçimi yap
          const companies: Array<any> =
            (userData?.companies as any[]) ??
            (userData?.tenants as any[]) ??
            (userData?.organizations as any[]) ??
            [];
          const directId =
            userData?.companyId ??
            userData?.tenantId ??
            null;
          const preferred =
            (companies.find((c) => c?.isDefault) ??
             companies[0]) ??
            (directId ? { id: directId } : null);

          if (preferred?.id) {
            useCompanyStore.getState().setCompanyId(preferred.id);
            console.debug('[AuthBootstrap] Company set:', preferred.id);
          } else {
            useCompanyStore.getState().setCompanyId(null);
            console.warn('[AuthBootstrap] No company found on user');
          }
        } catch (err) {
          console.warn('[AuthBootstrap] /auth/me failed', err);
        }
      }
    };
    run();
  }, [hydrate, setAuth, hydrateCompany]);

  if (!isHydrated) {
    if (import.meta.env.DEV) {
      console.log('⏳ [AuthBootstrap] Waiting for hydration...');
    }
    return null; // küçük bir splash da koyabilirsin
  }

  if (import.meta.env.DEV) {
    console.log('✅ [AuthBootstrap] Hydration completed, rendering app');
  }
  return <>{children}</>;
}
