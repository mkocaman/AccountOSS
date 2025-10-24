import { useCompanyStore } from '@/stores/companyStore';

export const useCompany = () => {
  const companyId = useCompanyStore(s => s.companyId);
  return { companyId };
};
