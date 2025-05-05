import { create } from "zustand";

type Batch = {
  id: string;
  name: string;
  academicYearId: string;
  collegeId: string;
};

interface BatchState {
  batches: Batch[];
  loading: boolean;
  error: string | null;
  fetchBatches: (collegeId: string, academicYearId: string) => Promise<void>;
  createBatch: (batch: Omit<Batch, "id">) => Promise<void>;
  updateBatch: (id: string, data: Partial<Batch>) => Promise<void>;
  deleteBatch: (id: string) => Promise<void>;
}

export const useBatchStore = create<BatchState>((set) => ({
  batches: [],
  loading: false,
  error: null,

  fetchBatches: async (collegeId, academicYearId) => {
    set({ loading: true, error: null });
    try {
      const query = new URLSearchParams({
        collegeId,
        academicYears: academicYearId,
      }).toString();

      const res = await fetch(`/api/phase?${query}`);
      if (!res.ok) throw new Error("Failed to fetch batches");

      const data = await res.json();
      set({ batches: data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  createBatch: async (batch) => {
    try {
      const res = await fetch(`/api/phase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(batch),
      });

      if (!res.ok) throw new Error("Failed to create batch");

      const newBatch = await res.json();
      set((state) => ({
        batches: [...state.batches, newBatch],
      }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  updateBatch: async (id, data) => {
    try {
      const res = await fetch(`/api/phase`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...data }),
      });

      if (!res.ok) throw new Error("Failed to update batch");

      const updated = await res.json();
      set((state) => ({
        batches: state.batches.map((b) => (b.id === id ? updated : b)),
      }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  deleteBatch: async (id) => {
    try {
      const res = await fetch(`/api/phase?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete batch");

      set((state) => ({
        batches: state.batches.filter((b) => b.id !== id),
      }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },
}));
