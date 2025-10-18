import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Company tipi
export interface Company {
  id: string;
  name: string;
  taxNumber: string;
  taxOffice?: string;
  phone?: string;
  email?: string;
  address?: string;
  logoUrl?: string;
  primaryColor?: string;
  baseCurrency: string;
  isActive: boolean;
}

// Company store
interface CompanyState {
  companies: Company[];
  currentCompany: Company | null;
  isLoading: boolean;

  // Actions
  setCompanies: (companies: Company[]) => void;
  setCurrentCompany: (company: Company) => void;
  addCompany: (company: Company) => void;
  updateCompany: (company: Company) => void;
  removeCompany: (companyId: string) => void;
  clearCompanies: () => void;
}

export const useCompanyStore = create<CompanyState>()(
  persist(
    (set) => ({
      companies: [],
      currentCompany: null,
      isLoading: false,

      setCompanies: (companies) => {
        set({ companies });
        
        // Eğer currentCompany yoksa ilk şirketi seç
        set((state) => {
          if (!state.currentCompany && companies.length > 0) {
            localStorage.setItem('currentCompanyId', companies[0].id);
            return { currentCompany: companies[0] };
          }
          return {};
        });
      },

      setCurrentCompany: (company) => {
        localStorage.setItem('currentCompanyId', company.id);
        set({ currentCompany: company });
      },

      addCompany: (company) =>
        set((state) => ({
          companies: [...state.companies, company],
        })),

      updateCompany: (company) =>
        set((state) => ({
          companies: state.companies.map((c) =>
            c.id === company.id ? company : c
          ),
          currentCompany:
            state.currentCompany?.id === company.id
              ? company
              : state.currentCompany,
        })),

      removeCompany: (companyId) =>
        set((state) => ({
          companies: state.companies.filter((c) => c.id !== companyId),
          currentCompany:
            state.currentCompany?.id === companyId
              ? null
              : state.currentCompany,
        })),

      clearCompanies: () =>
        set({
          companies: [],
          currentCompany: null,
        }),
    }),
    {
      name: 'company-storage',
      partialize: (state) => ({
        currentCompany: state.currentCompany,
      }),
    }
  )
);

