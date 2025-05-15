// src/store/teacherStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Types based on the schema from the component
type College = {
  id: string;
  name: string;
  code: string;
};

type Subject = {
  id: string;
  name: string;
  code: string;
  phaseId: string;
  phaseName?: string;
  branchName?: string;
  courseName?: string;
  academicYearName?: string;
  subjectId?: string;
  academicYearId?: string;
  branchId?: string;
  courseId?: string;
};

type TeacherProfile = {
  id: string;
  name: string;
  email: string;
  mobileNo: string;
  Address?: string;
  profilePhoto?: string;
  teacherIdProof?: string;
  collegeId: string;
  designation: string;
  employeeId: string;
  userId: string;
};

type CollegeAdmin = {
  id: string;
  name: string;
  email: string;
  mobileNo: string;
};

// Define the store state
interface TeacherState {
  // Profile data
  profile: TeacherProfile | null;
  isLoadingProfile: boolean;
  profileError: string | null;
  
  // Subjects data
  subjects: Subject[];
  isLoadingSubjects: boolean;
  hasSubjects: boolean;
  subjectsError: string | null;
  
  // Colleges data
  colleges: College[];
  filteredColleges: College[];
  isLoadingColleges: boolean;
  
  // College admin data
  collegeAdmin: CollegeAdmin | null;
  isLoadingAdmin: boolean;
  
  // UI state
  isEditMode: boolean;
  
  // Actions
  fetchProfile: (userId: string) => Promise<void>;
  updateProfile: (profile: Partial<TeacherProfile>) => Promise<boolean>;
  createProfile: (profile: Omit<TeacherProfile, 'id'>) => Promise<string | null>;
  fetchSubjects: (teacherId: string) => Promise<void>;
  fetchColleges: (searchTerm: string) => Promise<void>;
  filterColleges: (searchTerm: string) => void;
  fetchCollegeAdmin: (collegeId: string) => Promise<void>;
  setEditMode: (isEdit: boolean) => void;
  resetStore: () => void;
}

export const useTeacherStore = create<TeacherState>()(
  devtools(
    (set, get) => ({
      // Initial state
      profile: null,
      isLoadingProfile: false,
      profileError: null,
      
      subjects: [],
      isLoadingSubjects: false,
      hasSubjects: false,
      subjectsError: null,
      
      colleges: [],
      filteredColleges: [],
      isLoadingColleges: false,
      
      collegeAdmin: null,
      isLoadingAdmin: false,
      
      isEditMode: false,
      
      // Actions
      fetchProfile: async (userId: string) => {
        try {
          set({ isLoadingProfile: true, profileError: null });
          const response = await fetch(`/api/teacher-profile?userId=${userId}`);
          const data = await response.json();
          
          if (data.success && data.data) {
            set({ profile: data.data });
            
            // If we have a profile, fetch subjects and college admin
            if (data.data.id) {
              get().fetchSubjects(data.data.id);
            }
            
            if (data.data.collegeId) {
              get().fetchCollegeAdmin(data.data.collegeId);
            }
            
            return;
          }
          
          set({ profileError: data.message || 'Failed to fetch profile' });
        } catch (error) {
          console.error('Error fetching profile:', error);
          set({ profileError: 'Network error while fetching profile' });
        } finally {
          set({ isLoadingProfile: false });
        }
      },
      
      updateProfile: async (profileData: Partial<TeacherProfile>) => {
        const { profile } = get();
        if (!profile?.id) return false;
        
        try {
          set({ isLoadingProfile: true, profileError: null });
          
          const response = await fetch(`/api/teacher-profile?id=${profile.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...profileData
            }),
          });
          
          const data = await response.json();
          
          if (response.ok) {
            set({ profile: { ...profile, ...profileData } });
            
            // If college changed, fetch new admin
            if (profileData.collegeId && profileData.collegeId !== profile.collegeId) {
              get().fetchCollegeAdmin(profileData.collegeId);
            }
            
            return true;
          }
          
          set({ profileError: data.message || 'Failed to update profile' });
          return false;
        } catch (error) {
          console.error('Error updating profile:', error);
          set({ profileError: 'Network error while updating profile' });
          return false;
        } finally {
          set({ isLoadingProfile: false });
        }
      },
      
      createProfile: async (profileData: Omit<TeacherProfile, 'id'>) => {
        try {
          set({ isLoadingProfile: true, profileError: null });
          
          const response = await fetch('/api/teacher-profile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(profileData),
          });
          
          const data = await response.json();
          
          if (response.ok) {
            set({ profile: data });
            
            // After creating profile, fetch college admin
            if (data.collegeId) {
              get().fetchCollegeAdmin(data.collegeId);
            }
            
            return data.id;
          }
          
          set({ profileError: data.message || 'Failed to create profile' });
          return null;
        } catch (error) {
          console.error('Error creating profile:', error);
          set({ profileError: 'Network error while creating profile' });
          return null;
        } finally {
          set({ isLoadingProfile: false });
        }
      },
      
      fetchSubjects: async (teacherId: string) => {
        try {
          set({ isLoadingSubjects: true, subjectsError: null });
          
          const response = await fetch(`/api/teacher-subjects?teacherId=${teacherId}`);
          const data = await response.json();
          console.log('Fetched subjects data:', data);
          
          if (data.success || Array.isArray(data)) {
            // Handle various data structures
            const subjectsData = Array.isArray(data) ? data : data.data || [];
            console.log('Parsed subjects data:', subjectsData);
            
            // Only process if we have an array
            if (Array.isArray(subjectsData) && subjectsData.length > 0) {
              // Enhanced logging to debug API responses
              console.log('First subject data structure:', JSON.stringify(subjectsData[0], null, 2));
              
              // Step 1: First fetch all the entities needed for all subjects
              const promises = [];
              const entityData: {
                subjects: Record<string, { name: string; code: string }>;
                phases: Record<string, { name: string }>;
                branches: Record<string, { name: string }>;
                courses: Record<string, { name: string }>;
                academicYears: Record<string, { name: string }>;
              } = {
                subjects: {},
                phases: {},
                branches: {},
                courses: {},
                academicYears: {}
              };
              
              // Fetch all subjects details
              for (const subject of subjectsData) {
                const subjectId = subject.subjectId || subject.id;
                if (subjectId && !entityData.subjects[subjectId]) {
                  promises.push(
                    fetch(`/api/subject?SubjectId=${subjectId}`)
                      .then(res => res.json())
                      .then(data => {
                        if (data && (data.data || data.name)) {
                          entityData.subjects[subjectId] = data.data || data;
                        }
                      })
                      .catch(err => console.error(`Error fetching subject ${subjectId}:`, err))
                  );
                }
                
                // Fetch phase details
                if (subject.phaseId && !entityData.phases[subject.phaseId]) {
                  promises.push(
                    fetch(`/api/phase?id=${subject.phaseId}`)
                      .then(res => res.json())
                      .then(data => {
                        if (data && (data.data || data.name)) {
                          entityData.phases[subject.phaseId] = data.data || data;
                        }
                      })
                      .catch(err => console.error(`Error fetching phase ${subject.phaseId}:`, err))
                  );
                }
                
                // Fetch branch details
                if (subject.branchId && !entityData.branches[subject.branchId]) {
                  promises.push(
                    fetch(`/api/branches?id=${subject.branchId}`)
                      .then(res => res.json())
                      .then(data => {
                        if (data && (data.data || data.name)) {
                          entityData.branches[subject.branchId] = data.data || data;
                        }
                      })
                      .catch(err => console.error(`Error fetching branch ${subject.branchId}:`, err))
                  );
                }
                
                // Fetch course details
                if (subject.courseId && !entityData.courses[subject.courseId]) {
                  promises.push(
                    fetch(`/api/course?id=${subject.courseId}`)
                      .then(res => res.json())
                      .then(data => {
                        if (data && (data.data || data.name)) {
                          entityData.courses[subject.courseId] = data.data || data;
                        }
                      })
                      .catch(err => console.error(`Error fetching course ${subject.courseId}:`, err))
                  );
                }
                
                // Fetch academic year details
                if (subject.academicYearId && !entityData.academicYears[subject.academicYearId]) {
                  promises.push(
                    fetch(`/api/academicYears?id=${subject.academicYearId}`)
                      .then(res => res.json())
                      .then(data => {
                        if (data && (data.data || data.name)) {
                          entityData.academicYears[subject.academicYearId] = data.data || data;
                        }
                      })
                      .catch(err => console.error(`Error fetching academic year ${subject.academicYearId}:`, err))
                  );
                }
              }
              
              // Wait for all promises to resolve
              await Promise.all(promises);
              
              console.log('Entity data fetched:', {
                subjects: Object.keys(entityData.subjects).length,
                phases: Object.keys(entityData.phases).length,
                branches: Object.keys(entityData.branches).length,
                courses: Object.keys(entityData.courses).length,
                academicYears: Object.keys(entityData.academicYears).length
              });
              
              // Step 2: Enrich all subjects with entity details
              const enrichedSubjects = subjectsData.map((subject: any) => {
                // Create a deep copy to avoid mutation
                const enrichedSubject = { ...subject };
                
                // Get the IDs
                const subjectId = subject.subjectId || subject.id;
                const phaseId = subject.phaseId;
                const branchId = subject.branchId;
                const courseId = subject.courseId;
                const academicYearId = subject.academicYearId;
                
                // Enrich from entity data
                if (subjectId && entityData.subjects[subjectId]) {
                  const subjectDetails = entityData.subjects[subjectId];
                  enrichedSubject.name = subjectDetails.name;
                  enrichedSubject.code = subjectDetails.code;
                }
                
                if (phaseId && entityData.phases[phaseId]) {
                  enrichedSubject.phaseName = entityData.phases[phaseId].name;
                }
                
                if (branchId && entityData.branches[branchId]) {
                  enrichedSubject.branchName = entityData.branches[branchId].name;
                }
                
                if (courseId && entityData.courses[courseId]) {
                  enrichedSubject.courseName = entityData.courses[courseId].name;
                }
                
                if (academicYearId && entityData.academicYears[academicYearId]) {
                  enrichedSubject.academicYearName = entityData.academicYears[academicYearId].name;
                }
                
                return enrichedSubject;
              });
              
              // Log the enriched subjects for debugging
              console.log('Final enriched subjects:', JSON.stringify(enrichedSubjects.slice(0, 2), null, 2));
              
              set({ 
                subjects: enrichedSubjects,
                hasSubjects: enrichedSubjects.length > 0
              });
              return;
            }
          }
          
          // If we reach here, either there are no subjects or there was an error
          set({ 
            subjects: [],
            hasSubjects: false,
            subjectsError: data.message || 'No subjects found'
          });
        } catch (error) {
          console.error('Error fetching subjects:', error);
          set({ 
            subjectsError: 'Network error while fetching subjects',
            subjects: [],
            hasSubjects: false
          });
        } finally {
          set({ isLoadingSubjects: false });
        }
      },
      
      fetchColleges: async (searchTerm: string) => {
        try {
          set({ isLoadingColleges: true });
          
          const response = await fetch(`/api/search/college?q=${searchTerm}`);
          const data = await response.json();
          
          set({ 
            colleges: data,
            filteredColleges: data
          });
        } catch (error) {
          console.error('Error fetching colleges:', error);
        } finally {
          set({ isLoadingColleges: false });
        }
      },
      
      filterColleges: (searchTerm: string) => {
        const { colleges } = get();
        
        if (colleges.length > 0) {
          const filtered = colleges.filter(
            (college) =>
              college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              college.code.toLowerCase().includes(searchTerm.toLowerCase())
          );
          set({ filteredColleges: filtered });
        } else {
          // If no colleges are loaded yet, fetch them
          get().fetchColleges(searchTerm);
        }
      },
      
      fetchCollegeAdmin: async (collegeId: string) => {
        if (!collegeId) return;
        
        try {
          set({ isLoadingAdmin: true });
          
          const response = await fetch(`/api/college?collegeId=${collegeId}`);
          const data = await response.json();
          
          if (data.success && data.data) {
            set({ collegeAdmin: data.data });
          } else {
            set({ collegeAdmin: null });
          }
        } catch (error) {
          console.error('Error fetching college admin:', error);
          set({ collegeAdmin: null });
        } finally {
          set({ isLoadingAdmin: false });
        }
      },
      
      setEditMode: (isEdit: boolean) => {
        set({ isEditMode: isEdit });
      },
      
      resetStore: () => {
        set({
          profile: null,
          isLoadingProfile: false,
          profileError: null,
          subjects: [],
          isLoadingSubjects: false,
          hasSubjects: false,
          subjectsError: null,
          collegeAdmin: null,
          isLoadingAdmin: false,
          isEditMode: false
        });
      }
    }),
    { name: 'teacher-store' }
  )
);