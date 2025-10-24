import { apiClient } from '@/api/client';
import { useCompanyStore } from '@/stores/companyStore';

export type LoginDto = {
  email: string;
  password: string;
  company?: string; // id veya slug
};

export type MeResponse = {
  user: any;
  defaultCompanyId?: string | null;
  companies?: { id: string; name: string; isDefault?: boolean }[];
};

export async function login(payload: LoginDto) {
  const res = await apiClient.post('/auth/login', payload);
  const { accessToken, companyId, user } = res.data?.data ?? res.data;

  // Token'ı sakla
  localStorage.setItem('accessToken', accessToken);

  // CompanyId'yi store'a yaz
  if (companyId) {
    useCompanyStore.getState().setCompanyId(companyId);
    console.info('[AuthService] Company set from login:', companyId);
  }

  return { user, companyId };
}

export async function me(): Promise<MeResponse> {
  const res = await apiClient.get('/auth/me');
  return res.data?.data ?? res.data;
}
