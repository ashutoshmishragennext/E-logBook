// useTeacherStore.ts
import { create } from 'zustand';

type Teacher = {
  name: string;
  email: string;
  designation: string;
  employeeId: string;
  mobileNo: string;
};

type TeacherState = {
  teachers: Teacher[];
  isLoading: boolean;
  fetchTeachers: (collegeId: string) => Promise<void>;
};

export const useTeacherStore = create<TeacherState>((set) => ({
  teachers: [], // ✅ Must be an array initially
  isLoading: false,
  fetchTeachers: async (collegeId: string) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`/api/teacher-profile?collegeId=${collegeId}`);
      const data = await res.json();
      set({ teachers: Array.isArray(data?.data) ? data.data : [] }); // ✅ Always set array
    } catch (err) {
      console.error("Failed to fetch teachers", err);
      set({ teachers: [] });
    } finally {
      set({ isLoading: false });
    }
  },
}));
