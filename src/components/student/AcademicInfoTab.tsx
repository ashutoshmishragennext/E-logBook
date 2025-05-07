/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import {
  CalendarIcon,
  Check,
  Loader2,
  Pencil,
  Search,
  Trash,
  X
} from 'lucide-react';
import { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import * as z from 'zod';
// import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';


// Define the form schema
const academicInfoSchema = z.object({
  collegeId: z.string({
    required_error: "Please select a college",
  }),
  branchId: z.string({
    required_error: "Please select a branch",
  }),
  courseId: z.string({
    required_error: "Please select a course",
  }),
  academicYearId: z.string({
    required_error: "Please select an academic year",
  }),
  phaseId: z.string({
    required_error: "Please select a phase/batch",
  }),
  enrollmentNo: z.string().min(1, "Enrollment number is required"),
  currentSemester: z.string().min(1, "Current semester is required"),
  dateOfJoining: z.date().nullable().optional(),
  dateOfCompletion: z.date().nullable().optional(),
  graduationDate: z.date().nullable().optional(),
  enrollmentStatus: z.string().default("ACTIVE"),
  // The file upload will be handled separately
  subjectTeachers: z.array(
    z.object({
      subjectId: z.string({
        required_error: "Subject is required",
      }),
      teacherId: z.string({
        required_error: "Teacher is required",
      })
    })
  ).optional(),
});

interface AcademicInfoComponentProps {
  userId: string;
  existingProfile?: any; // Replace 'any' with the appropriate type if known
  onProfileUpdate?: (updatedProfile: any) => void; // Replace 'any' with the appropriate type if known
}

export default function AcademicInfoComponent({ userId, existingProfile, onProfileUpdate }: AcademicInfoComponentProps) {
  const [editMode, setEditMode] = useState(!existingProfile);
  const [submitting, setSubmitting] = useState(false);
  const [collegeIdProofFile, setCollegeIdProofFile] = useState<File | null>(null);
  const [collegeIdProofPreview, setCollegeIdProofPreview] = useState(existingProfile?.collegeIdProof || null);
  
  // Data for dropdowns
  const [colleges, setColleges] = useState([]);
  const [branches, setBranches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  interface Phase {
    id: string;
    name: string;
  }
  const [phases, setPhases] = useState<Phase[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  interface Subject {
    id: string;
    name: string;
  }
  
  const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>([]);
  const [availableTeachers, setAvailableTeachers] = useState<Record<string, any[]>>({});
  const [subjectSearchTerm, setSubjectSearchTerm] = useState('');
  interface SubjectTeacher {
    subjectId: string;
    subjectName: string;
    teacherId: string;
    teacherName: string;
    verificationStatus: string;
  }
  
  const [existingSubjectTeachers, setExistingSubjectTeachers] = useState<SubjectTeacher[]>([]);
  
  // Loading states for dropdowns
  const [loadingColleges, setLoadingColleges] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingAcademicYears, setLoadingAcademicYears] = useState(false);
  const [loadingPhases, setLoadingPhases] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  
  // Create form with zod validation
  const form = useForm({
    resolver: zodResolver(academicInfoSchema),
    defaultValues: {
      collegeId: existingProfile?.collegeId || "",
      branchId: existingProfile?.branchId || "",
      courseId: existingProfile?.courseId || "",
      academicYearId: existingProfile?.academicYearId || "",
      phaseId: existingProfile?.phaseId || "",
      enrollmentNo: existingProfile?.enrollmentNo || "",
      currentSemester: existingProfile?.currentSemester || "",
      dateOfJoining: existingProfile?.dateOfJoining ? new Date(existingProfile.dateOfJoining) : null,
      dateOfCompletion: existingProfile?.dateOfCompletion ? new Date(existingProfile.dateOfCompletion) : null,
      graduationDate: existingProfile?.graduationDate ? new Date(existingProfile.graduationDate) : null,
      enrollmentStatus: existingProfile?.enrollmentStatus || "ACTIVE",
      subjectTeachers: existingProfile?.subjectTeachers || [],
    }
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "subjectTeachers",
  });
  
  const watchCollege = form.watch("collegeId");
  const watchBranch = form.watch("branchId");
  const watchCourse = form.watch("courseId");
  const watchAcademicYear = form.watch("academicYearId");
  const watchPhase = form.watch("phaseId");
  
  // Fetch colleges on component mount
  useEffect(() => {
    fetchColleges();
  }, []);
  
  // Fetch existing subject teachers if profile exists
  useEffect(() => {
    if (existingProfile?.id) {
      fetchExistingSubjectTeachers(existingProfile.id);
    }
  }, [existingProfile]);
  
  // Populate selected subjects from existing data
  useEffect(() => {
    if (existingSubjectTeachers.length > 0) {
      const subjectsFromExisting = existingSubjectTeachers.map(st => ({
        id: st.subjectId,
        name: st.subjectName
      }));
      setSelectedSubjects(subjectsFromExisting);
      
      // Initialize form with existing data
      form.setValue("subjectTeachers", existingSubjectTeachers.map(st => ({
        subjectId: st.subjectId,
        teacherId: st.teacherId
      })));
    }
  }, [existingSubjectTeachers, form]);
  
  // Update branches based on selected college
  useEffect(() => {
    if (watchCollege) {
      fetchBranches(watchCollege);
    } else {
      setBranches([]);
      form.setValue("branchId", "");
    }
  }, [watchCollege, form]);
  
  // Update courses based on selected branch
  useEffect(() => {
    if (watchBranch) {
      fetchCourses(watchBranch);
    } else {
      setCourses([]);
      form.setValue("courseId", "");
    }
  }, [watchBranch, form]);
  
  // Fetch academic years
  useEffect(() => {
    fetchAcademicYears();
  }, []);
  
  // Update phases based on selected academic year
  useEffect(() => {
    if (watchAcademicYear) {
      fetchPhases(watchAcademicYear);
    } else {
      setPhases([]);
      form.setValue("phaseId", "");
    }
  }, [watchAcademicYear, form]);
  
  // Fetch subjects based on phase selection
  useEffect(() => {
    if (watchPhase) {
      fetchSubjects(watchPhase);
    } else {
      setSubjects([]);
      setSelectedSubjects([]);
      form.setValue("subjectTeachers", []);
    }
  }, [watchPhase, form]);
  
  // Fetch available teachers for each selected subject
  useEffect(() => {
    const fetchTeachersForSubjects = async () => {
      if (selectedSubjects.length > 0 && watchAcademicYear && watchPhase) {
        setLoadingTeachers(true);
        const teachersBySubject: Record<string, any[]> = {};
        
        for (const subject of selectedSubjects) {
          try {
            const response = await fetch(`/api/subjects/${subject.id}/teachers?academicYearId=${watchAcademicYear}&phaseId=${watchPhase}`);
            if (response.ok) {
              const data = await response.json();
              teachersBySubject[subject.id] = data;
            } else {
              console.error(`Failed to fetch teachers for subject ${subject.id}`);
              teachersBySubject[subject.id] = [];
            }
          } catch (error) {
            console.error(`Error fetching teachers for subject ${subject.id}:`, error);
            teachersBySubject[subject.id] = [];
          }
        }
        
        setAvailableTeachers(teachersBySubject);
        setLoadingTeachers(false);
      }
    };
    
    fetchTeachersForSubjects();
  }, [selectedSubjects, watchAcademicYear, watchPhase]);
  
  // API call functions
  const fetchColleges = async () => {
    setLoadingColleges(true);
    try {
      const response = await fetch("/api/colleges");
      if (response.ok) {
        const data = await response.json();
        setColleges(data);
      } else {
        console.error("Failed to fetch colleges");
        // toast({
        //   title: "Error",
        //   description: "Failed to fetch colleges",
        //   variant: "destructive",
        // });
      }
    } catch (error) {
      console.error("Error fetching colleges:", error);
      // toast({
      //   title: "Error",
      //   description: "An error occurred while fetching colleges",
      //   variant: "destructive",
      // });
    } finally {
      setLoadingColleges(false);
    }
  };
  
  const fetchBranches = async (collegeId: string) => {
    setLoadingBranches(true);
    try {
      const response = await fetch(`/api/colleges/${collegeId}/branches`);
      if (response.ok) {
        const data = await response.json();
        setBranches(data);
      } else {
        console.error("Failed to fetch branches");
        setBranches([]);
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
      setBranches([]);
    } finally {
      setLoadingBranches(false);
    }
  };
  
  const fetchCourses = async (branchId:string) => {
    setLoadingCourses(true);
    try {
      const response = await fetch(`/api/branches/${branchId}/courses`);
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      } else {
        console.error("Failed to fetch courses");
        setCourses([]);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      setCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  };
  
  const fetchAcademicYears = async () => {
    setLoadingAcademicYears(true);
    try {
      const response = await fetch("/api/academic-years");
      if (response.ok) {
        const data = await response.json();
        setAcademicYears(data);
      } else {
        console.error("Failed to fetch academic years");
        setAcademicYears([]);
      }
    } catch (error) {
      console.error("Error fetching academic years:", error);
      setAcademicYears([]);
    } finally {
      setLoadingAcademicYears(false);
    }
  };
  
  const fetchPhases = async (academicYearId : string) => {
    setLoadingPhases(true);
    try {
      const response = await fetch(`/api/academic-years/${academicYearId}/phases`);
      if (response.ok) {
        const data = await response.json();
        setPhases(data);
      } else {
        console.error("Failed to fetch phases");
        setPhases([]);
      }
    } catch (error) {
      console.error("Error fetching phases:", error);
      setPhases([]);
    } finally {
      setLoadingPhases(false);
    }
  };
  
  const fetchSubjects = async (phaseId: string) => {
    setLoadingSubjects(true);
    try {
      const response = await fetch(`/api/phases/${phaseId}/subjects`);
      if (response.ok) {
        const data = await response.json();
        setSubjects(data);
      } else {
        console.error("Failed to fetch subjects");
        setSubjects([]);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
      setSubjects([]);
    } finally {
      setLoadingSubjects(false);
    }
  };
  
  const fetchExistingSubjectTeachers = async (profileId :string) => {
    try {
      const response = await fetch(`/api/student-profiles/${profileId}/subject-teachers`);
      if (response.ok) {
        const data = await response.json();
        setExistingSubjectTeachers(data);
      } else {
        console.error("Failed to fetch existing subject teachers");
      }
    } catch (error) {
      console.error("Error fetching existing subject teachers:", error);
    }
  };
  
  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files[0]) {
        const file = files[0];
        setCollegeIdProofFile(file);
        
        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setCollegeIdProofPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
  
  // Handle form submission
  const onSubmit = async (data: { [x: string]: string | Blob; }) => {
    setSubmitting(true);
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("userId", userId);
      
      // Add all form fields to FormData
      Object.keys(data).forEach(key => {
        if (key === "subjectTeachers") {
          formData.append(key, JSON.stringify(data[key]));
        } else if (key.includes("date") && data[key]) {
          formData.append(key, data[key].toString());
        } else if (data[key]) {
          formData.append(key, data[key]);
        }
      });
      
      // Add file if exists
      if (collegeIdProofFile) {
        formData.append("collegeIdProof", collegeIdProofFile);
      }
      
      // Determine if this is a create or update operation
      const url = existingProfile?.id 
        ? `/api/student-profiles/${existingProfile.id}/academic-info` 
        : "/api/student-profiles/academic-info";
      
      const method = existingProfile?.id ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        body: formData,
      });
      
      if (response.ok) {
        const updatedProfile = await response.json();
        // toast({
        //   title: "Success",
        //   description: existingProfile?.id 
        //     ? "Academic information updated successfully" 
        //     : "Academic information saved successfully",
        // });
        
        // Exit edit mode and pass updated profile to parent
        setEditMode(false);
        if (onProfileUpdate) {
          onProfileUpdate(updatedProfile);
        }
      } else {
        const errorData = await response.json();
        // toast({
        //   title: "Error",
        //   description: errorData.message || "Failed to save academic information",
        //   variant: "destructive",
        // });
      }
    } catch (error) {
      console.error("Error saving academic information:", error);
      // toast({
      //   title: "Error",
      //   description: "An unexpected error occurred",
      //   variant: "destructive",
      // });
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle subject selection
  const handleSubjectSelect = (subject: Subject) => {
    // Check if subject is already selected
    if (!selectedSubjects.some(s => s.id === subject.id)) {
      setSelectedSubjects([...selectedSubjects, subject]);
      
      // Add to form's subjectTeachers array
      append({ subjectId: subject.id, teacherId: "" });
    }
    
    // Clear search
    setSubjectSearchTerm("");
  };
  
  // Handle subject removal
  const handleRemoveSubject = (subjectId: string) => {
    setSelectedSubjects(selectedSubjects.filter(s => s.id !== subjectId));
    
    // Find index of subject in form array
    const index = fields.findIndex(field => field.subjectId === subjectId);
    if (index !== -1) {
      remove(index);
    }
  };
  
  // Filter subjects based on search term
  const filteredSubjects = subjects.filter(subject => 
    (subject as Subject).name.toLowerCase().includes(subjectSearchTerm.toLowerCase()) &&
    !selectedSubjects.some(s => s.id === subject.id)
  );
  
  // Get subject name by ID
  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId) || 
                   selectedSubjects.find(s => s.id === subjectId);
    return subject ? subject.name : "Unknown Subject";
  };
  
  return (
    <Card className="w-full mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Academic Information</CardTitle>
          <CardDescription>
            Your college details and enrollment information
          </CardDescription>
        </div>
        {existingProfile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditMode(!editMode)}
            disabled={submitting}
          >
            {editMode ? (
              <>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </>
            ) : (
              <>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </>
            )}
          </Button>
        )}
      </CardHeader>
      
      <CardContent>
        {!editMode && existingProfile ? (
          <div className="space-y-4">
            {/* Display Academic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">College</h4>
                <p className="text-base">{existingProfile.collegeName || "Not specified"}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Branch</h4>
                <p className="text-base">{existingProfile.branchName || "Not specified"}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Course</h4>
                <p className="text-base">{existingProfile.courseName || "Not specified"}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Academic Year</h4>
                <p className="text-base">{existingProfile.academicYearName || "Not specified"}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Phase/Batch</h4>
                <p className="text-base">{existingProfile.phaseName || "Not specified"}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Enrollment Number</h4>
                <p className="text-base">{existingProfile.enrollmentNo || "Not specified"}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Current Semester</h4>
                <p className="text-base">{existingProfile.currentSemester || "Not specified"}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Date of Joining</h4>
                <p className="text-base">
                  {existingProfile.dateOfJoining 
                    ? format(new Date(existingProfile.dateOfJoining), "PPP") 
                    : "Not specified"}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Date of Completion</h4>
                <p className="text-base">
                  {existingProfile.dateOfCompletion 
                    ? format(new Date(existingProfile.dateOfCompletion), "PPP") 
                    : "Not specified"}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Graduation Date</h4>
                <p className="text-base">
                  {existingProfile.graduationDate 
                    ? format(new Date(existingProfile.graduationDate), "PPP") 
                    : "Not specified"}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                <p className="text-base">{existingProfile.enrollmentStatus || "ACTIVE"}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">College ID Proof</h4>
                {collegeIdProofPreview ? (
                  <div className="mt-1">
                    <Image
                      width={100}
                      height={100} 
                      src={collegeIdProofPreview} 
                      alt="College ID" 
                      className="h-24 object-cover rounded-md" 
                    />
                  </div>
                ) : (
                  <p className="text-base text-muted-foreground">No ID proof uploaded</p>
                )}
              </div>
            </div>
            
            {/* Display Subject-Teacher Assignments */}
            <div>
              <h4 className="text-sm font-medium mb-2">Subject-Teacher Assignments</h4>
              {existingSubjectTeachers.length > 0 ? (
                <div className="space-y-2">
                  {existingSubjectTeachers.map((item) => (
                    <div 
                      key={item.subjectId} 
                      className="p-2 border rounded-md flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium">{item.subjectName}</p>
                        <p className="text-sm text-muted-foreground">Teacher: {item.teacherName}</p>
                      </div>
                      <Badge variant={
                        item.verificationStatus === 'APPROVED' ? 'outline' : 
                        item.verificationStatus === 'REJECTED' ? 'destructive' : 
                        'secondary'
                      }>
                        {item.verificationStatus}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No subject-teacher assignments yet</p>
              )}
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* College Selection */}
                <FormField
                  control={form.control}
                  name="collegeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>College</FormLabel>
                      <Select
                        disabled={!editMode || submitting || !watchAcademicYear}
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a phase/batch" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {loadingPhases ? (
                            <div className="flex items-center justify-center p-2">
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Loading phases...
                            </div>
                          ) : phases.length > 0 ? (
                            phases.map((phase) => (
                              <SelectItem key={phase.id} value={phase.id}>
                                {phase.name}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-2 text-sm text-muted-foreground">
                              {watchAcademicYear ? "No phases found for this academic year" : "Select an academic year first"}
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Enrollment Number */}
                <FormField
                  control={form.control}
                  name="enrollmentNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Enrollment Number</FormLabel>
                      <FormControl>
                        <Input
                          disabled={!editMode || submitting}
                          placeholder="Enter your enrollment number"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Current Semester */}
                <FormField
                  control={form.control}
                  name="currentSemester"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Semester</FormLabel>
                      <Select
                        disabled={!editMode || submitting}
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your current semester" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.from({ length: 8 }, (_, i) => i + 1).map((semester) => (
                            <SelectItem key={semester} value={semester.toString()}>
                              Semester {semester}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Date of Joining */}
                <FormField
                  control={form.control}
                  name="dateOfJoining"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date of Joining</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={`w-full pl-3 text-left font-normal ${!field.value ? "text-muted-foreground" : ""}`}
                              disabled={!editMode || submitting}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date() || date < new Date("2000-01-01")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Date of Completion (Expected) */}
                <FormField
                  control={form.control}
                  name="dateOfCompletion"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Expected Date of Completion</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={`w-full pl-3 text-left font-normal ${!field.value ? "text-muted-foreground" : ""}`}
                              disabled={!editMode || submitting}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Graduation Date */}
                <FormField
                  control={form.control}
                  name="graduationDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Expected Graduation Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={`w-full pl-3 text-left font-normal ${!field.value ? "text-muted-foreground" : ""}`}
                              disabled={!editMode || submitting}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Enrollment Status */}
                <FormField
                  control={form.control}
                  name="enrollmentStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Enrollment Status</FormLabel>
                      <Select
                        disabled={!editMode || submitting}
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your enrollment status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                          <SelectItem value="GRADUATED">Graduated</SelectItem>
                          <SelectItem value="DROPPED">Dropped</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* College ID Proof Upload */}
                <div className="md:col-span-2">
                  <FormLabel htmlFor="collegeIdProof">College ID Proof</FormLabel>
                  <div className="mt-1 flex items-center space-x-4">
                    <Input
                      id="collegeIdProof"
                      type="file"
                      accept="image/*"
                      disabled={!editMode || submitting}
                      onChange={handleFileChange}
                      className="flex-1"
                    />
                    {collegeIdProofPreview && (
                      <div className="relative h-16 w-16">
                        <img
                          src={collegeIdProofPreview}
                          alt="ID Preview"
                          className="h-full w-full object-cover rounded-md"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                          onClick={() => {
                            setCollegeIdProofFile(null);
                            setCollegeIdProofPreview(null);
                          }}
                          disabled={!editMode || submitting}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload your college ID card or enrollment document (JPG, PNG, PDF)
                  </p>
                </div>
              </div>
              
              {/* Subject-Teacher Selection */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Subject-Teacher Assignments</h3>
                  <p className="text-sm text-muted-foreground">
                    Select subjects and assign teachers for your current semester
                  </p>
                </div>
                
                {/* Subject Selection */}
                {watchPhase && (
                  <div className="space-y-2">
                    <FormLabel>Add Subjects</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          disabled={!editMode || submitting || loadingSubjects}
                          className="w-full justify-between"
                        >
                          {loadingSubjects ? (
                            <div className="flex items-center">
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Loading subjects...
                            </div>
                          ) : (
                            <>
                              <span>Search and select subjects</span>
                              <Search className="ml-2 h-4 w-4 opacity-50" />
                            </>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput 
                            placeholder="Search subjects..." 
                            className="h-9"
                            value={subjectSearchTerm}
                            onValueChange={setSubjectSearchTerm}
                          />
                          <CommandList>
                            <CommandEmpty>No subjects found</CommandEmpty>
                            <CommandGroup>
                              <ScrollArea className="h-60">
                                {filteredSubjects.map((subject) => (
                                  <CommandItem
                                    key={subject.id}
                                    value={subject.id}
                                    onSelect={() => handleSubjectSelect(subject)}
                                  >
                                    {subject.name}
                                    <Check
                                      className={`ml-auto h-4 w-4 ${
                                        selectedSubjects.some(s => s.id === subject.id)
                                          ? "opacity-100"
                                          : "opacity-0"
                                      }`}
                                    />
                                  </CommandItem>
                                ))}
                              </ScrollArea>
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    
                    {/* Selected Subjects */}
                    <div className="space-y-2 mt-2">
                      {selectedSubjects.length > 0 ? (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Selected Subjects</h4>
                          <div className="space-y-3">
                            {fields.map((field, index) => {
                              const subject = selectedSubjects.find(s => s.id === field.subjectId);
                              const teachers = availableTeachers[field.subjectId] || [];
                              
                              return (
                                <div key={field.id} className="border rounded-md p-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="font-medium">{subject?.name || getSubjectName(field.subjectId)}</div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleRemoveSubject(field.subjectId)}
                                      disabled={!editMode || submitting}
                                    >
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  
                                  <FormField
                                    control={form.control}
                                    name={`subjectTeachers.${index}.teacherId`}
                                    render={({ field: teacherField }) => (
                                      <FormItem>
                                        <FormLabel>Assign Teacher</FormLabel>
                                        <Select
                                          disabled={!editMode || submitting || loadingTeachers || teachers.length === 0}
                                          onValueChange={teacherField.onChange}
                                          value={teacherField.value}
                                        >
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select a teacher" />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            {loadingTeachers ? (
                                              <div className="flex items-center justify-center p-2">
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                Loading teachers...
                                              </div>
                                            ) : teachers.length > 0 ? (
                                              teachers.map((teacher: { id: Key | null | undefined; name: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; }) => (
                                                <SelectItem key={teacher.id} value={teacher.id ? String(teacher.id) : ''}>
                                                  {teacher.name}
                                                </SelectItem>
                                              ))
                                            ) : (
                                              <div className="p-2 text-sm text-muted-foreground">
                                                No teachers assigned to this subject
                                              </div>
                                            )}
                                          </SelectContent>
                                        </Select>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : watchPhase ? (
                        <div className="text-sm text-muted-foreground">
                          No subjects selected. Search and select subjects above.
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Form Actions */}
              <div className="flex justify-end space-x-2">
                {existingProfile && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditMode(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                )}
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {existingProfile ? "Update" : "Save"} Academic Information
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}