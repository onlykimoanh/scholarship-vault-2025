import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Application, FilterOptions, SortOptions } from '../types';

interface ApplicationStore {
  applications: Application[];
  filters: FilterOptions;
  sortOptions: SortOptions;
  
  // Actions
  addApplication: (application: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateApplication: (id: string, updates: Partial<Application>) => void;
  deleteApplication: (id: string) => void;
  setFilters: (filters: FilterOptions) => void;
  setSortOptions: (sortOptions: SortOptions) => void;
  importFromCSV: (applications: Application[]) => void;
  getFilteredApplications: () => Application[];
}

export const useApplicationStore = create<ApplicationStore>()(
  persist(
    (set, get) => ({
      applications: [],
      filters: {},
      sortOptions: { field: 'deadline', direction: 'asc' },

      addApplication: (applicationData: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>) => {
        const application: Application = {
          ...applicationData,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as Application;

        set((state) => ({
          applications: [...state.applications, application]
        }));
      },

      updateApplication: (id, updates) => {
        set((state) => ({
          applications: state.applications.map((app) =>
            app.id === id
              ? { ...app, ...updates, updatedAt: new Date().toISOString() } as Application
              : app
          ),
        }));
      },

      deleteApplication: (id) => {
        set((state) => ({
          applications: state.applications.filter((app) => app.id !== id),
        }));
      },

      setFilters: (filters) => {
        set({ filters });
      },

      setSortOptions: (sortOptions) => {
        set({ sortOptions });
      },

      importFromCSV: (newApplications) => {
        set((state) => ({
          applications: [...state.applications, ...newApplications],
        }));
      },

      getFilteredApplications: () => {
        const { applications, filters, sortOptions } = get();
        let filtered = [...applications];

        // Apply filters
        if (filters.stage && filters.stage.length > 0) {
          filtered = filtered.filter((app) => filters.stage!.includes(app.stage));
        }

        if (filters.country && filters.country.length > 0) {
          filtered = filtered.filter((app) => filters.country!.includes(app.country));
        }

        if (filters.type && filters.type.length > 0) {
          filtered = filtered.filter((app) => filters.type!.includes(app.type));
        }

        // Apply sorting
        filtered.sort((a, b) => {
          let aValue: string | Date;
          let bValue: string | Date;

          switch (sortOptions.field) {
            case 'deadline':
              aValue = new Date(a.deadline);
              bValue = new Date(b.deadline);
              break;
            case 'createdAt':
              aValue = new Date(a.createdAt);
              bValue = new Date(b.createdAt);
              break;
            case 'name':
              aValue = a.type === 'scholarship' ? a.scholarshipName : a.programName;
              bValue = b.type === 'scholarship' ? b.scholarshipName : b.programName;
              break;
            default:
              return 0;
          }

          if (aValue < bValue) return sortOptions.direction === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortOptions.direction === 'asc' ? 1 : -1;
          return 0;
        });

        return filtered;
      },
    }),
    {
      name: 'scholarflow-applications',
    }
  )
); 