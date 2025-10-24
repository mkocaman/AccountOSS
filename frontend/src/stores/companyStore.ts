import { create } from 'zustand';

type CompanyState = {
  companyId: string | null;
  setCompanyId: (id: string | null) => void;
  hydrate: () => void;
};

const KEY = 'companyId';

// localStorage'dan güvenli şekilde değer al
const getInitialCompanyId = (): string | null => {
  try {
    const stored = localStorage.getItem(KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const useCompanyStore = create<CompanyState>((set) => {
  // İlk değer localStorage'dan al
  const initialCompanyId = getInitialCompanyId();
  
  return {
    companyId: initialCompanyId,
    setCompanyId: (id) => {
      try {
        if (id) {
          localStorage.setItem(KEY, JSON.stringify(id));
        } else {
          localStorage.removeItem(KEY);
        }
      } catch (error) {
        console.warn('[CompanyStore] localStorage error:', error);
      }
      set({ companyId: id });
      console.info('[CompanyStore] set ->', id);
    },
    hydrate: () => {
      const v = getInitialCompanyId();
      console.debug('[CompanyStore] hydrate ->', v);
      set({ companyId: v });
    },
  };
});
