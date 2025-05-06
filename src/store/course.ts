// stores/useCourseStore.ts
import { create } from 'zustand';

interface Course {
  id: string;
  name: string;
  branchId: string;
  // Add other course fields as needed
}

interface CourseStore {
  courses: Course[];
  loading: boolean;
  error: string | null;
  fetchCourses: (branchId?: string) => Promise<void>;
  addCourse: (course: Partial<Course>) => Promise<void>;
  updateCourse: (id: string, updates: Partial<Course>) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
}

export const useCourseStore = create<CourseStore>((set) => ({
  courses: [],
  loading: false,
  error: null,

  fetchCourses: async (branchId) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/courses${branchId ? `?branchId=${branchId}` : ''}`);
      const data = await res.json();
      set({ courses: data, loading: false });
    } catch (err) {
      set({ error: 'Failed to fetch courses', loading: false });
    }
  },

  addCourse: async (course) => {
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(course),
      });
      const newCourse = await res.json();
      set((state) => ({ courses: [...state.courses, newCourse] }));
    } catch {
      set({ error: 'Failed to add course' });
    }
  },

  updateCourse: async (id, updates) => {
    try {
      const res = await fetch(`/api/courses?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const updatedCourse = await res.json();
      set((state) => ({
        courses: state.courses.map((c) => (c.id === id ? updatedCourse : c)),
      }));
    } catch {
      set({ error: 'Failed to update course' });
    }
  },

  deleteCourse: async (id) => {
    try {
      await fetch(`/api/courses?id=${id}`, { method: 'DELETE' });
      set((state) => ({
        courses: state.courses.filter((course) => course.id !== id),
      }));
    } catch {
      set({ error: 'Failed to delete course' });
    }
  },
}));
