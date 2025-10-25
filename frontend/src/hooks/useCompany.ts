import { useCompanyStore } from '@/store/companyStore';

export const useCompany = () => {
  const companyId = useCompanyStore(s => s.companyId);
  return { companyId };
};
