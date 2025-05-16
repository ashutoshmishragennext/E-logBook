// zustand/store/academicYearStore.ts
import { create } from 'zustand'

export interface AcademicYear {
  id: string
  name: string
  startDate: string
  endDate: string
}

interface AcademicYearStore {
  years: AcademicYear[]
  fetchYears: () => Promise<void>
  addYear: (year: Omit<AcademicYear, 'id'>) => Promise<void>
  updateYear: (id: string, updated: Partial<AcademicYear>) => Promise<void>
  deleteYear: (id: string) => Promise<void>
}

export const useAcademicYearStore = create<AcademicYearStore>((set) => ({
  years: [],

  fetchYears: async () => {
    const res = await fetch('/api/academicYears')
    const data = await res.json()
    set({ years: data })
  },

  addYear: async (year) => {
    const res = await fetch('/api/academicYears', {
      method: 'POST',
      body: JSON.stringify(year),
      headers: { 'Content-Type': 'application/json' },
    })
    const newYear = await res.json()
    set((state) => ({ years: [...state.years, newYear] }))
  },

  updateYear: async (id, updated) => {
    await fetch(`/api/academicYears?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(updated),
      headers: { 'Content-Type': 'application/json' },
    })
    set((state) => ({
      years: state.years.map((y) => (y.id === id ? { ...y, ...updated } : y)),
    }))
  },

  deleteYear: async (id) => {
    await fetch(`/api/academicYears?id=${id}`, { method: 'DELETE' })
    set((state) => ({
      years: state.years.filter((y) => y.id !== id),
    }))
  },
}))
