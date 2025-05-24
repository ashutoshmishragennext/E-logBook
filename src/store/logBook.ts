/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { create } from 'zustand';
import { toast } from 'sonner';

// Types
export interface Teacher {
  id: string;
  userId: string;
  name: string;
}

export interface LogbookField {
  fieldName: string;
  fieldLabel: string;
  fieldType: string;
  isRequired: boolean;
  options?: string[];
}

export interface LogbookGroup {
  groupName: string;
  fields: LogbookField[];
}

export interface LogbookTemplate {
  id: string;
  name: string;
  description: string;
  templateType: string;
  dynamicSchema: {
    groups: LogbookGroup[];
  };
  subjectId: string | null;
}

export interface StudentSubject {
  id: string;
  subjectId: string;
  teacherId: string;
  teacher: {
    id: string;
    fullName: string;
  };
}

interface LogbookState {
  // Student data
  studentId: string | null;
  
  // Template selection
  selectedType: string;
  selectedTemplateId: string;
  selectedStudentSubjectId: string;
  selectedTeacherId: string;
  
  // Data collections
  teachers: Teacher[];
  studentSubjects: StudentSubject[];
  templates: LogbookTemplate[];
  subjectNames: Record<string, string>;
  
  // Form data
  formData: Record<string, any>;
  fileUploads: Record<string, { url: string; name: string } | null>;
  
  // UI state
  isLoading: boolean;
  
  // Actions
  setStudentId: (id: string | null) => void;
  setSelectedType: (type: string) => void;
  setSelectedTemplateId: (id: string) => void;
  setSelectedStudentSubjectId: (id: string) => void;
  setSelectedTeacherId: (id: string) => void;
  updateFormData: (fieldName: string, value: any) => void;
  updateFileUpload: (fieldName: string, file: { url: string; name: string } | null) => void;
  removeFileUpload: (fieldName: string) => void;
  resetForm: () => void;
  setIsLoading: (loading: boolean) => void;
  
  // API actions
  fetchStudentData: (userId: string) => Promise<void>;
  fetchAllTeachers: () => Promise<void>;
  fetchStudentSubjects: () => Promise<void>;
  fetchTemplates: () => Promise<void>;
  submitLogbookEntry: () => Promise<boolean>;
}

const useLogbookStore = create<LogbookState>((set, get) => ({
  // State
  studentId: null,
  selectedType: 'general',
  selectedTemplateId: '',
  selectedStudentSubjectId: '',
  selectedTeacherId: '',
  teachers: [],
  studentSubjects: [],
  templates: [],
  subjectNames: {},
  formData: {},
  fileUploads: {},
  isLoading: false,
  
  // Basic state setters
  setStudentId: (id) => set({ studentId: id }),
  setSelectedType: (type) => {
    set({ 
      selectedType: type, 
      selectedTemplateId: '',
      selectedStudentSubjectId: '',
      selectedTeacherId: '',
      formData: {},
      fileUploads: {}
    });
  },
  setSelectedTemplateId: (id) => set({ 
    selectedTemplateId: id,
    formData: {},
    fileUploads: {}
  }),
  setSelectedStudentSubjectId: (id) => set({ selectedStudentSubjectId: id }),
  setSelectedTeacherId: (id) => set({ selectedTeacherId: id }),
  updateFormData: (fieldName, value) => set(state => ({
    formData: { ...state.formData, [fieldName]: value }
  })),
  updateFileUpload: (fieldName, file) => set(state => ({
    fileUploads: { ...state.fileUploads, [fieldName]: file }
  })),
  removeFileUpload: (fieldName) => set(state => {
    const newUploads = { ...state.fileUploads };
    delete newUploads[fieldName];
    return { fileUploads: newUploads };
  }),
  resetForm: () => set({ 
    formData: {}, 
    fileUploads: {},
    selectedTeacherId: '',
    selectedStudentSubjectId: ''
  }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  // API Actions
  fetchStudentData: async (userId) => {
    try {
      const response = await fetch(`/api/student-profile?byUserId=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch student profile");
      const data = await response.json();
      set({ studentId: data.id });
      return;
    } catch (error) {
      console.error("Error fetching student profile:", error);
      toast.error("Failed to fetch student profile");
    }
  },
  
  fetchAllTeachers: async () => {
    try {
      const res = await fetch("/api/teacher-profile");
      if (!res.ok) throw new Error("Failed to fetch teachers");
      const data = await res.json();
      set({ teachers: data?.data || [] });
    } catch (error) {
      console.error("Error fetching teachers:", error);
      toast.error("Failed to load teachers");
    }
  },
  
  fetchStudentSubjects: async () => {
    const { studentId } = get();
    if (!studentId) return;
    
    try {
      const res = await fetch(
        `/api/student-subject?studentId=${studentId}&has_logbook_access=true&includeTeacher=true`
      );
      if (!res.ok) throw new Error("Failed to fetch student subjects");
      const data = await res.json();
      set({ studentSubjects: data });

      // Fetch subject names for each subject
      const subjectMap: Record<string, string> = {};
      await Promise.all(
        data.map(async (entry: StudentSubject) => {
          try {
            const res = await fetch(`/api/subject?SubjectId=${entry.subjectId}`);
            if (res.ok) {
              const subject = await res.json();
              subjectMap[entry.subjectId] = subject.name;
            }
          } catch (err) {
            console.error(`Error fetching subject name for ${entry.subjectId}:`, err);
          }
        })
      );
      set({ subjectNames: subjectMap });
    } catch (error) {
      console.error("Error fetching student subjects:", error);
      toast.error("Failed to fetch subjects");
    }
  },
  
  fetchTemplates: async () => {
    const { selectedType, studentSubjects } = get();
    
    try {
      set({ isLoading: true });
      let url = `/api/log-book-template?templateType=${selectedType}`;

      if (selectedType === "subject" && studentSubjects.length > 0) {
        const subjectIds = studentSubjects.map(s => s.subjectId);
        url += `&subjectId=${subjectIds[0]}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch logbook templates");
      const data = await res.json();
      set({ 
        templates: data,
        selectedTemplateId: "",
        formData: {},
        fileUploads: {}
      });
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast.error("Failed to fetch templates");
    } finally {
      set({ isLoading: false });
    }
  },
  
  submitLogbookEntry: async () => {
    const { 
      selectedTemplateId, templates, selectedType, studentId,
      selectedStudentSubjectId, selectedTeacherId, studentSubjects,
      formData, fileUploads
    } = get();
    
    try {
      set({ isLoading: true });
      
      if (!selectedTemplateId) {
        toast.error("Please select a template");
        return false;
      }
      
      const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
      if (!selectedTemplate) {
        toast.error("Template not found");
        return false;
      }
      
      // Validate based on template type
      if (selectedType === "subject" && !selectedStudentSubjectId) {
        toast.error("Please select a subject");
        return false;
      }
      
      if (selectedType === "general" && !selectedTeacherId) {
        toast.error("Please select a teacher");
        return false;
      }
      
      // Validate required fields
      const hasRequiredFieldsMissing = selectedTemplate.dynamicSchema.groups.some(group => 
        group.fields.some(field => 
          field.isRequired && 
          (field.fieldType !== 'file' ? !formData[field.fieldName] : !fileUploads[field.fieldName])
        )
      );
      
      if (hasRequiredFieldsMissing) {
        toast.error("Please fill in all required fields");
        return false;
      }
      
      // Prepare the payload
      const payload: any = {
        logBookTemplateId: selectedTemplateId,
        studentId,
        dynamicFields: {
          ...formData,
          ...Object.fromEntries(
            Object.entries(fileUploads)
              .filter(([_, file]) => file !== null)
              .map(([fieldName, file]) => [fieldName, file?.url])
          ),
        },
        studentRemarks: formData.studentRemarks || "",
        status: "SUBMITTED"
      };
      
      if (selectedType === "subject") {
        const selectedSubject = studentSubjects.find(s => s.id === selectedStudentSubjectId);
        if (!selectedSubject) {
          throw new Error("Selected subject not found");
        }
        payload.studentSubjectId = selectedStudentSubjectId;
        payload.teacherId = selectedSubject.teacherId;
      } else {
        payload.teacherId = selectedTeacherId;
        payload.studentSubjectId = null;
      }
      
      // Submit the entry
      const res = await fetch("/api/log-books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to submit logbook entry");
      }
      
      toast.success("Logbook entry submitted successfully!");
      
      // Reset form
      get().resetForm();
      return true;
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(error instanceof Error ? error.message : "Failed to submit logbook entry");
      return false;
    } finally {
      set({ isLoading: false });
    }
  }
}));

export default useLogbookStore;