import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useCurrentUser } from '@/hooks/auth';
import { useStudentProfileStore } from '@/store/student';
import { useStudentSubjectStore } from '@/store/studentSubjectStore';
import { UploadButton } from '@/utils/uploadthing';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, Plus, Trash2 } from 'lucide-react';

const AcademicTeacherAllocationForm = () => {
  const user = useCurrentUser();
  const userId = user?.id;
  
  const { 
    profile, 
    loading: profileLoading, 
    fetchProfile, 
    createProfile, 
    updateProfile 
  } = useStudentProfileStore();
  
  const {
    college,
    fetchCollege,
    branches,
    fetchBranches,
    subjects,
    teacherSubjects,
    academicYears,
    fetchAcademicYears,
    fetchCourses,
    course,
    phases,
    fetchPhases,
    studentAllocations,
    selectedSubjectId,
    selectedTeacherSubjectId,
    loading,
    error,
    fetchSubjects,
    fetchStudentAllocations,
    fetchTeacherSubjectsBySubjectId,
    setSelectedSubjectId,
    setSelectedTeacherSubjectId,
    createAllocation,
    deleteAllocation,
    resetSelections,
  } = useStudentSubjectStore();

  const [collegeIdProofUrl, setCollegeIdProofUrl] = useState('');
  const [collegeId, setCollegeId] = useState<string | null>(null);
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<string | null>(null);
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      rollNo: '',
      collegeId: '',
      branchId: '',
      courseId: '',
      academicYearId: '',
      yearOfPassing: '',
    }
  });

  // Fetch profile when userId is available
  useEffect(() => {
    if (userId) {
      fetchProfile({ byUserId: userId });
    }
  }, [userId, fetchProfile]);

  // Set collegeId when profile is fetched
  useEffect(() => {
    if (profile?.collegeId) {
      setCollegeId(profile.collegeId);
      form.setValue('collegeId', profile.collegeId);
      
      // Set other form values from profile if available
      if (profile.rollNo) form.setValue('rollNo', profile.rollNo);
      if (profile.branchId) form.setValue('branchId', profile.branchId);
      if (profile.courseId) form.setValue('courseId', profile.courseId);
      if (profile.academicYearId) {
        form.setValue('academicYearId', profile.academicYearId);
        setSelectedAcademicYearId(profile.academicYearId);
      }
      if (profile.yearOfPassing) form.setValue('yearOfPassing', profile.yearOfPassing);
    }
  }, [profile, form]);

  // Fetch college, branches, academic years, courses and subjects when collegeId is set
  useEffect(() => {
    if (collegeId) {
      fetchCollege(collegeId);
      fetchBranches();
      fetchAcademicYears();
      fetchCourses();
      fetchSubjects();
    }
  }, [collegeId, fetchCollege, fetchBranches, fetchAcademicYears, fetchCourses, fetchSubjects]);

  // Fetch phases when collegeId and academicYearId are available
  useEffect(() => {
    if (collegeId && selectedAcademicYearId) {
      fetchPhases({
        collegeId,
        academicYears: selectedAcademicYearId // Fixed parameter name to match the store
      });
    }
  }, [collegeId, selectedAcademicYearId, fetchPhases]);

  // Fetch student allocations when profile is available
  useEffect(() => {
    if (profile?.id) {
      fetchStudentAllocations(profile.id);
    }
  }, [profile?.id, fetchStudentAllocations]);

  // Handle subject selection
  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    // Explicitly fetch teacher subjects since the setSelectedSubjectId might not trigger it in some cases
    if (subjectId) {
      fetchTeacherSubjectsBySubjectId(subjectId);
    }
  };

  // Handle allocation creation
  const handleAddAllocation = async () => {
    if (!profile?.id || !selectedSubjectId || !selectedTeacherSubjectId || !selectedAcademicYearId || !selectedPhaseId) {
      return;
    }

    try {
      await createAllocation({
        studentId: profile.id,
        subjectId: selectedSubjectId,
        teacherSubjectId: selectedTeacherSubjectId,
        academicYearId: selectedAcademicYearId,
        phaseId: selectedPhaseId,
      });
    } catch (err) {
      console.error("Failed to allocate teacher and subject", err);
    }
  };

  // Handle allocation deletion
  const handleDeleteAllocation = async (id: string | number) => {
    try {
      await deleteAllocation(String(id));
    } catch (err) {
      console.error("Failed to remove allocation", err);
    }
  };

  // Handle academic year change
  const handleAcademicYearChange = (value: string) => {
    setSelectedAcademicYearId(value);
    form.setValue('academicYearId', value);
    // Reset phase when academic year changes
    setSelectedPhaseId(null);
  };

  // Handle phase change
  const handlePhaseChange = (value:string) => {
    setSelectedPhaseId(value);
  };

  // Check if all required selections are made
  const isAllSelectionsMade = selectedSubjectId && selectedTeacherSubjectId && 
    selectedAcademicYearId && selectedPhaseId;

  // Function to find teacher name from teacher subject
  const getTeacherName = (teacherSubject) => {
    if (teacherSubject.teacher?.name) {
      return teacherSubject.teacher.name;
    }
    
    // Fallback for when the API response doesn't include teacher object
    return "Unknown Teacher";
  };

  // Handle form submission
  const handleSaveProfile = async (data: Record<string, any>) => {
    if (profile?.id) {
      await updateProfile({
        id: profile.id,
        ...data,
        CollegeIdProof: collegeIdProofUrl,
      }, userId);
    } else if (userId) {
      await createProfile({
        userId,
        ...data,
        collegeIdProofUrl,
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Academic & Teacher Allocation</CardTitle>
        <CardDescription>
          Allocate subjects and teachers for your academic program
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Selection Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium mt-6">Academic Information</h3>
                
                <Form {...form}>
                  <FormField
                    control={form.control}
                    name="rollNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Roll Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your roll number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="collegeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>College</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            setCollegeId(value);
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={college?.name || "Select college"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {college && (
                              <SelectItem key={college.id} value={college.id}>
                                {college.name}
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="branchId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Branch</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select branch" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {branches?.map((branch) => (
                                <SelectItem key={branch.id} value={branch.id}>
                                  {branch.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="courseId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Course</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select course" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {course?.map((course) => (
                                <SelectItem key={course.id} value={course.id}>
                                  {course.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="academicYearId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Academic Year</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              handleAcademicYearChange(value);
                            }}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select year" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {academicYears?.map((year) => (
                                <SelectItem key={year.id} value={year.id}>
                                  {year.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="yearOfPassing"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Year of Passing</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter passing year" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </Form>
                
                <div className="space-y-4 mt-4">
                  <h4 className="text-md font-medium">Upload College ID Proof</h4>
                  <div className="flex flex-col space-y-2">
                    {collegeIdProofUrl && (
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 truncate">{collegeIdProofUrl.split('/').pop()}</div>
                      </div>
                    )}
                    <UploadButton
                      endpoint="imageUploader"
                      onClientUploadComplete={(res) => {
                        if (res && res.length > 0 && res[0].serverData?.fileUrl) {
                          setCollegeIdProofUrl(res[0].serverData.fileUrl);
                        }
                      }}
                      onUploadError={(error) => {
                        console.error("Upload Error:", error.message);
                      }}
                    />
                  </div>
                </div>

                <Button 
                  onClick={() => handleSaveProfile(form.getValues())}
                  className="mt-4"
                  disabled={profileLoading}
                >
                  {profileLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Save Profile
                </Button>

                <h3 className="text-sm font-medium mt-8">Subject</h3>
                <Select
                  value={selectedSubjectId || ""}
                  onValueChange={handleSubjectChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects?.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Teacher</h3>
                <Select
                  value={selectedTeacherSubjectId || ""}
                  onValueChange={(value) => setSelectedTeacherSubjectId(value)}
                  disabled={!selectedSubjectId || !teacherSubjects || teacherSubjects.length === 0}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={
                      !selectedSubjectId 
                        ? "Select a subject first" 
                        : !teacherSubjects || teacherSubjects.length === 0 
                        ? "No teachers available" 
                        : "Select a teacher"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {teacherSubjects?.map((teacherSubject) => (
                      <SelectItem key={teacherSubject.id} value={teacherSubject.id}>
                        {teacherSubject.teacher?.name || `Teacher ID: ${teacherSubject.teacherId}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Academic Year</h3>
                <Select
                  value={selectedAcademicYearId || ""}
                  onValueChange={handleAcademicYearChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select academic year" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicYears?.map((year) => (
                      <SelectItem key={year.id} value={year.id}>
                        {year.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Phase</h3>
                <Select
                  value={selectedPhaseId || ""}
                  onValueChange={handlePhaseChange}
                  disabled={!selectedAcademicYearId || !phases || phases.length === 0}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={
                      !selectedAcademicYearId
                        ? "Select academic year first"
                        : !phases || phases.length === 0
                        ? "No phases available"
                        : "Select phase"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {phases?.map((phase) => (
                      <SelectItem key={phase.id} value={phase.id}>
                        {phase.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleAddAllocation}
              disabled={!isAllSelectionsMade || loading}
              className="flex items-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Allocate Subject & Teacher
            </Button>
          </div>

          {/* Current Allocations Table */}
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Current Allocations</h3>
            {error && (
              <div className="p-4 mb-4 bg-red-50 text-red-600 rounded">
                {error}
                <Button variant="link" className="p-0 ml-2" onClick={() => clearError()}>
                  Dismiss
                </Button>
              </div>
            )}
            {studentAllocations && studentAllocations.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Academic Year</TableHead>
                    <TableHead>Phase</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentAllocations.map((allocation) => (
                    <TableRow key={allocation.id}>
                      <TableCell>{allocation.subject?.name || "Unknown Subject"}</TableCell>
                      <TableCell>
                        {allocation.teacherSubject?.teacher?.name || 
                         `Teacher ID: ${allocation.teacherSubject?.teacherId || "Unknown"}`}
                      </TableCell>
                      <TableCell>
                        {academicYears && academicYears.length > 0
                          ? (academicYears.find(year => year.id === allocation.academicYearId)?.name || "Unknown")
                          : "Unknown Year"}
                      </TableCell>
                      <TableCell>
                        {phases && phases.length > 0 
                          ? (phases.find(phase => phase.id === allocation.phaseId)?.name || "Unknown")
                          : "Unknown Phase"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            allocation.verificationStatus === "APPROVED"
                              ? "default"
                              : allocation.verificationStatus === "REJECTED"
                              ? "destructive"
                              : "outline"
                          }
                        >
                          {allocation.verificationStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAllocation(allocation.id)}
                          disabled={allocation.verificationStatus === "APPROVED"}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {loading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Loading allocations...
                  </div>
                ) : (
                  "No allocations found. Please allocate subjects and teachers."
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AcademicTeacherAllocationForm;