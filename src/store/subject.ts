// stores/useSubjectStore.ts
import { create } from 'zustand';

interface Subject {
  id: string;
  name: string;
  code?: string;
  approved?: boolean;
}

interface SubjectStore {
  subjects: Subject[];
  isLoading: boolean;
  error: string;
  currentSubject: Subject | null;
  sidebarOpen: boolean;

  fetchSubjects: () => Promise<void>;
  setSubjects: (subjects: Subject[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;

  setCurrentSubject: (subject: Subject | null) => void;
  setSidebarOpen: (open: boolean) => void;
  removeSubjectById: (id: string) => void;
}

export const useSubjectStore = create<SubjectStore>((set) => ({
  subjects: [],
  isLoading: true,
  error: "",
  currentSubject: null,
  sidebarOpen: false,

  fetchSubjects: async () => {
    try {
      set({ isLoading: true, error: "" });
      const res = await fetch("/api/subject");
      if (!res.ok) throw new Error("Failed to fetch subjects");
      const data = await res.json();
      set({ subjects: data });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Unknown error" });
    } finally {
      set({ isLoading: false });
    }
  },

  setSubjects: (subjects) => set({ subjects }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setCurrentSubject: (subject) => set({ currentSubject: subject }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  removeSubjectById: (id) =>
    set((state) => ({
      subjects: state.subjects.filter((s) => s.id !== id),
    })),
}));
