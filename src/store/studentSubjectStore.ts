/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { College } from './college';

// Type definitions
export interface Subject {
  id: string;
  name: string;
  courseId: string;
  branchId: string;
  credit: number;
}


export interface TeacherSubject {
  teacherName: string;
  id: string;
  teacherId: string;
  subjectId: string;
  teacher: {
    id: string;
    name: string;
  };
  subject: Subject;
}

export interface AcademicYear {
  id: string;
  name: string;
}

export interface Phase {
  id: string;
  name: string;
}

export interface StudentSubjectAllocation {
  hasLogbookAccess: any;
  id: string;
  studentId: string;
  subjectId: string;
  teacherSubjectId: string;
  academicYearId: string;
  phaseId: string;
  verificationStatus: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason?: string;
  subject: Subject;
  teacherSubject: TeacherSubject;
  teacherId: string;
  collegeId: string;
}

interface teacher{
  id: string;
  name: string;
}

interface StudentSubjectStore {
  // Data states
  subjects: Subject[];
  teacherSubjects: TeacherSubject[];
  academicYears: AcademicYear[];
  phases: Phase[];
  studentAllocations: StudentSubjectAllocation[];
  college: College | null;
  branches: any[];
  course: any[];
  colleges: College[];
  teacher: teacher|null;

  // UI states
  selectedSubjectId: string | null;
  selectedTeacherSubjectId: string | null;
  selectedAcademicYearId: string | null;
  selectedPhaseId: string | null;

  // Loading and error states
  loading: boolean;
  error: string | null;

  // Actions
  fetchTeacherName: (teacherId: string) => Promise<void>;
  fetchBranches: () => Promise<void>;
  fetchCollege: (collegeId: string) => Promise<void>;
  fetchCourses: () => Promise<void>;
  fetchcolleges: () => Promise<void>;
  fetchSubjects: () => Promise<void>;
  fetchTeacherSubjectsBySubjectId: (subjectId: string, collegeId?: string) => Promise<void>;
  fetchAcademicYears: () => Promise<void>;
  fetchPhases: (query: { id?: string; academicYears?: string; collegeId?: string }) => Promise<void>;
  fetchStudentAllocations: (studentId: string) => Promise<void>;

  // UI actions
  setSelectedSubjectId: (id: string | null) => void;
  setSelectedTeacherSubjectId: (id: string | null) => void;
  setSelectedAcademicYearId: (id: string | null) => void;
  setSelectedPhaseId: (id: string | null) => void;

  // CRUD operations
  createAllocation: (data: {
    studentId: string;
    subjectId: string;
    teacherSubjectId: string;
    academicYearId: string;
    phaseId: string;
    teacherId: string;
    collegeId: string;
  }) => Promise<void>;

  updateAllocation: (id: string, data: Partial<StudentSubjectAllocation>) => Promise<void>;
  deleteAllocation: (id: string) => Promise<void>;

  clearError: () => void;
  resetSelections: () => void;
}

export const useStudentSubjectStore = create<StudentSubjectStore>((set, get) => ({
  // Initial states
  subjects: [],
  teacherSubjects: [],
  academicYears: [],
  phases: [],
  studentAllocations: [],
  college: null,
  branches: [],
  colleges: [], // Fixed: Initialize colleges as empty array
  course: [],
  teacher: null,
  
  selectedSubjectId: null,
  selectedTeacherSubjectId: null,
  selectedAcademicYearId: null,
  selectedPhaseId: null,
  loading: false,
  error: null,

  // Fetch courses
  fetchTeacherName: async (teacherId: string) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/teacher-profile?id=${teacherId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch teacher');
      set({ teacher: data.data, loading: false });
    } catch (err: any) {
      console.error('Error fetching teacher:', err);
      set({ error: err.message, loading: false });
    }
  },
  fetchCourses: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/course');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch courses');
      set({ course: data, loading: false });
    } catch (err: any) {
      console.error('Error fetching courses:', err);
      set({ error: err.message, loading: false });
    }
  },
  
  // Fetch branches
  fetchBranches: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/branches');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch branches');
      set({ branches: data, loading: false });
    } catch (err: any) {
      console.error('Error fetching branches:', err);
      set({ error: err.message, loading: false });
    }
  },
  
  // Fetch single college
  fetchCollege: async (collegeId: string) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/college?collegeId=' + collegeId);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch college');
      set({ college: data, loading: false });
    } catch (err: any) {
      console.error('Error fetching college:', err);
      set({ error: err.message, loading: false });
    }
  },
  
  // Fetch all colleges - FIXED: Now properly sets colleges instead of college
  fetchcolleges: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/college');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch colleges');
      set({ colleges: data, loading: false }); // Fixed: Set colleges instead of college
    } catch (err: any) {
      console.error('Error fetching colleges:', err);
      set({ error: err.message, loading: false });
    }
  },

  fetchSubjects: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/subject');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch subjects');
      set({ subjects: data, loading: false });
    } catch (err: any) {
      console.error('Error fetching subjects:', err);
      set({ error: err.message, loading: false });
    }
  },

// Update the fetchTeacherSubjectsBySubjectId function in your store
fetchTeacherSubjectsBySubjectId: async (subjectId: string, collegeId?: string) => {
  set({ loading: true, error: null, selectedTeacherSubjectId: null });
  try {
    // Build the URL with both subjectId and collegeId if provided
    const params = new URLSearchParams({ subjectId });
    if (collegeId) {
      params.append('collegeId', collegeId);
    }
    
    const res = await fetch(`/api/teacher-subjects?${params.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch teacher subjects');
    set({ teacherSubjects: data, loading: false });
  } catch (err: any) {
    console.error('Error fetching teacher subjects:', err);
    set({ error: err.message, loading: false, teacherSubjects: [] });
  }
},

  fetchAcademicYears: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/academicYears');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch academic years');
      set({ academicYears: data, loading: false });
    } catch (err: any) {
      console.error('Error fetching academic years:', err);
      set({ error: err.message, loading: false });
    }
  },

  fetchPhases: async (query: { id?: string; academicYearId?: string; collegeId?: string }) => {
    set({ loading: true, error: null });
    const searchParams = new URLSearchParams(query as any).toString();
    try {
      const res = await fetch(`/api/phase?${searchParams}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch phases');
      set({ phases: data, loading: false });
    } catch (err: any) {
      console.error('Error fetching phases:', err);
      set({ error: err.message, loading: false });
    } 
  },

  fetchStudentAllocations: async (studentId: string) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/student-subject?studentId=${studentId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch student allocations');
      console.log('Student Allocations:', data);
      set({ studentAllocations: data, loading: false });
    } catch (err: any) {
      console.error('Error fetching student allocations:', err);
      set({ error: err.message, loading: false });
    }
  },

  setSelectedSubjectId: (id: string | null, collegeId?: string) => {
  set({ selectedSubjectId: id });
  if (id) {
    get().fetchTeacherSubjectsBySubjectId(id, collegeId);
  } else {
    set({ teacherSubjects: [], selectedTeacherSubjectId: null });
  }
},

  setSelectedTeacherSubjectId: (id: string | null) => set({ selectedTeacherSubjectId: id }),
  setSelectedAcademicYearId: (id: string | null) => set({ selectedAcademicYearId: id }),
  setSelectedPhaseId: (id: string | null) => set({ selectedPhaseId: id }),

 // Update the createAllocation function in your store
createAllocation: async (data: {
  studentId: string;
  subjectId: string;
  teacherSubjectId: string;
  academicYearId: string;
  phaseId: string;
  teacherId: string;
  collegeId: string; // Add collegeId to the interface
}) => {
  set({ loading: true, error: null });
  try {
    const res = await fetch('/api/student-subject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data), // This will now include collegeId
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Failed to create allocation');

    set((state) => ({
      studentAllocations: [...state.studentAllocations, result],
      loading: false,
    }));
    get().resetSelections();
  } catch (err: any) {
    console.error('Error creating allocation:', err);
    set({ error: err.message, loading: false });
  }
},

  updateAllocation: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/student-subject?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to update allocation');

      set((state) => ({
        studentAllocations: state.studentAllocations.map(allocation =>
          allocation.id === id ? { ...allocation, ...result } : allocation
        ),
        loading: false,
      }));
    } catch (err: any) {
      console.error('Error updating allocation:', err);
      set({ error: err.message, loading: false });
    }
  },

  deleteAllocation: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/student-subject?id=${id}`, {
        method: 'DELETE',
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to delete allocation');

      set((state) => ({
        studentAllocations: state.studentAllocations.filter(a => a.id !== id),
        loading: false,
      }));
    } catch (err: any) {
      console.error('Error deleting allocation:', err);
      set({ error: err.message, loading: false });
    }
  },

  clearError: () => set({ error: null }),

  resetSelections: () =>
    set({
      selectedSubjectId: null,
      selectedTeacherSubjectId: null,
      selectedAcademicYearId: null,
      selectedPhaseId: null,
    }),
}));