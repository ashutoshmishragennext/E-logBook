
// store/useStudentProfileStore.ts
import { create } from 'zustand';

// Use an enum to match the schema
export enum VerificationStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED"
}

interface StudentProfile {
  id: string;
  userId: string;
  email:string;
  name: string;
  rollNo: string;
  mobileNo: string;
  profilePhoto: string;
  dateOfBirth: string;
  Address: string;
  country: string;
  state: string;
  city: string;
  adharNo: string;
  maritalStatus: string;
  collegeId: string;
  branchId: string;
  courseId: string;
  academicYearId: string;
  collegeIdProof: string;
  yearOfPassing: string;
  createdAt: string;
  updatedAt: string;
  teacherId?: string;
  rejectionReason?: string;
  verificationStatus?: VerificationStatus;
}

interface StudentProfileStore {
  profile: StudentProfile | null;
  profiles: StudentProfile[];
  loading: boolean;
  error: string | null;

  fetchProfile: (query: { id?: string; byUserId?: string; teacherId?: string ,collegeId?:String ,verificationStatus?:string}) => Promise<void>;
  createProfile: (data: Partial<StudentProfile>) => Promise<void>;
  updateProfile: (query: { id?: string; userId?: string }, data: Partial<StudentProfile>) => Promise<void>;
  deleteProfile: (query: { id?: string; userId?: string }) => Promise<void>;
  clearError: () => void;
}

export const useStudentProfileStore = create<StudentProfileStore>((set) => ({
  profile: null,
  profiles: [],
  loading: false,
  error: null,

  fetchProfile: async (query) => {
    set({ loading: true, error: null });
    const searchParams = new URLSearchParams(query as any).toString();
    try {
      const res = await fetch(`/api/student-profile?${searchParams}`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Failed to fetch profile');
      
      if (Array.isArray(data)) {
        set({ profiles: data, profile: null, loading: false });
      } else {
        set({ profile: data, profiles: [], loading: false });
      }
    } catch (err: any) {
      console.error('Error fetching student profile:', err);
      set({ error: err.message, loading: false });
    }
  },

  createProfile: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/student-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result = await res.json();
      
      if (!res.ok) throw new Error(result.message || 'Failed to create profile');
      
      set({ profile: result, loading: false });
    } catch (err: any) {
      console.error('Error creating student profile:', err);
      set({ error: err.message, loading: false });
    }
  },

  updateProfile: async (query, data) => {
    set({ loading: true, error: null });
    const searchParams = new URLSearchParams(query as any).toString();
    try {
      const res = await fetch(`/api/student-profile?${searchParams}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result = await res.json();
      
      if (!res.ok) throw new Error(result.message || 'Failed to update profile');
      
      set({ profile: result, loading: false });
      
      // If this is part of a list view, update the profiles array too
      set((state) => ({
        profiles: state.profiles.map(profile => 
          profile.id === result.id ? { ...profile, ...result } : profile
        )
      }));
    } catch (err: any) {
      console.error('Error updating student profile:', err);
      set({ error: err.message, loading: false });
    }
  },

  deleteProfile: async (query) => {
    set({ loading: true, error: null });
    const searchParams = new URLSearchParams(query as any).toString();
    try {
      const res = await fetch(`/api/student-profile?${searchParams}`, {
        method: 'DELETE',
      });
      
      const result = await res.json();
      
      if (!res.ok) throw new Error(result.message || 'Failed to delete profile');
      
      set((state) => ({
        profile: null,
        // If id is in the query and exists in profiles, remove it
        profiles: query.id ? state.profiles.filter(p => p.id !== query.id) : [],
        loading: false
      }));
    } catch (err: any) {
      console.error('Error deleting student profile:', err);
      set({ error: err.message, loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));