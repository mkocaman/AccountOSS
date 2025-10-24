import { useEffect } from 'react';
import { useCompanyStore } from '@/stores/companyStore';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';

function CompanyGate({ children }: { children: React.ReactNode }) {
  const { companyId, hydrate, setCompanyId } = useCompanyStore();
  
  const { data } = useQuery({ 
    queryKey: ['me'], 
    queryFn: async () => {
      const response = await apiClient.get('/auth/me');
      return response;
    },
    enabled: !!localStorage.getItem('accessToken')
  });

  useEffect(() => { 
    hydrate(); 
  }, [hydrate]);

  useEffect(() => {
    if (!companyId && data?.data) {
      const userData = data.data?.data ?? data.data;
      const list: any[] =
        userData?.companies ?? userData?.tenants ?? userData?.organizations ?? [];
      const direct = userData?.companyId ?? userData?.tenantId ?? null;
      const pick = (list.find((x: any) => x?.isDefault) ?? list[0]) ?? (direct ? { id: direct } : null);
      if (pick?.id) {
        setCompanyId(pick.id);
        console.debug('[CompanyGate] Company set from me():', pick.id);
      }
    }
  }, [companyId, data, setCompanyId]);

  return <>{children}</>;
}

export default CompanyGate;
