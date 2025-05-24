"use client";

import SubjectSelector from "@/components/clgAdmin/SubjectComponent";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useStudentProfileStore } from "@/store/student";
import { useStudentSubjectStore } from "@/store/studentSubjectStore";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Plus,
  Trash2,
  Info,
} from "lucide-react";
import { useEffect, useState, useCallback, useMemo } from "react";

interface StudentSubjectSelectionProps {
  studentId: string;
}

interface SelectedSubjectTeacher {
  subjectId: string;
  teacherSubjectId: string;
  teacherId: string;
  subjectName: string;
  teacherName: string;
}

// Create a cache to store data between component renders
const GLOBAL_CACHE = {
  teachers: new Map<string, string>(),
  subjects: new Map<string, string>(),
};

export default function StudentSubjectSelection({
  studentId,
}: StudentSubjectSelectionProps) {
  // Access store state and actions
  const {
    academicYears,
    phases,
    teacherSubjects,
    studentAllocations,
    loading,
    error,
    fetchAcademicYears,
    fetchPhases,
    fetchcolleges,
    fetchTeacherSubjectsBySubjectId,
    fetchStudentAllocations,
    createAllocation,
  } = useStudentSubjectStore();

  // Local state
  const [selectedAcademicYearId, setSelectedAcademicYearId] =
    useState<string>("");
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>("");
  const [selectedPhaseId, setSelectedPhaseId] = useState<string>("");
  const [selectedSubjects, setSelectedSubjects] = useState<
    SelectedSubjectTeacher[]
  >([]);
  const [currentSubjectId, setCurrentSubjectId] = useState<string>("");
  const [currentTeacherSubjectId, setCurrentTeacherSubjectId] =
    useState<string>("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { profile, fetchProfile } = useStudentProfileStore();
  const [profileLoading, setProfileLoading] = useState(true);
  // Add new state for the no teachers dialog
  const [noTeachersDialog, setNoTeachersDialog] = useState({
    isOpen: false,
    subjectId: "",
    subjectName: "",
  });
  // State to track if teachers are being loaded for a subject
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  // Create a local cache that persists between renders but is specific to this component instance
  const [dataCache, setDataCache] = useState<{
    teachers: Record<string, string>;
    subjects: Record<string, string>;
  }>({
    teachers: {},
    subjects: {},
  });

  // Use this state to track fetches in progress to prevent duplicate requests
  const [pendingFetches, setPendingFetches] = useState<{
    teachers: Record<string, boolean>;
    subjects: Record<string, boolean>;
  }>({
    teachers: {},
    subjects: {},
  });

  const [loadingData, setLoadingData] = useState(false);

  // Efficiently batch fetch teacher data
  const batchFetchTeachers = useCallback(
    async (teacherIds: string[]) => {
      if (!teacherIds.length) return;

      // Filter to only get IDs we don't already have in cache and aren't already fetching
      const idsToFetch = teacherIds.filter(
        (id) =>
          !dataCache.teachers[id] &&
          !GLOBAL_CACHE.teachers.has(id) &&
          !pendingFetches.teachers[id]
      );

      if (!idsToFetch.length) return;

      // Mark these IDs as pending
      setPendingFetches((prev) => ({
        ...prev,
        teachers: idsToFetch.reduce((acc, id) => ({ ...acc, [id]: true }), {
          ...prev.teachers,
        }),
      }));

      setLoadingData(true);

      try {
        // Create a new cache object to store results
        const newTeachers: Record<string, string> = {};

        // Process in smaller batches if there are many teachers
        const BATCH_SIZE = 10;

        for (let i = 0; i < idsToFetch.length; i += BATCH_SIZE) {
          const batchIds = idsToFetch.slice(i, i + BATCH_SIZE);

          // Process this batch in parallel
          await Promise.all(
            batchIds.map(async (teacherId) => {
              try {
                const response = await fetch(
                  `/api/teacher-profile?id=${teacherId}`
                );
                if (response.ok) {
                  const data = await response.json();
                  const name =
                    data?.name || data?.data?.name || "Unknown Teacher";

                  // Add to our local results
                  newTeachers[teacherId] = name;

                  // Also add to global cache for persistence
                  GLOBAL_CACHE.teachers.set(teacherId, name);
                }
              } catch (err) {
                console.error(`Error fetching teacher ${teacherId}:`, err);
                newTeachers[teacherId] = "Unknown Teacher";
                GLOBAL_CACHE.teachers.set(teacherId, "Unknown Teacher");
              }
            })
          );
        }

        // Update the cache with all new teacher data at once
        if (Object.keys(newTeachers).length > 0) {
          setDataCache((prev) => ({
            ...prev,
            teachers: { ...prev.teachers, ...newTeachers },
          }));
        }
      } catch (err) {
        console.error("Error in batch fetch teachers:", err);
      } finally {
        // Clear the pending flags
        setPendingFetches((prev) => ({
          ...prev,
          teachers: idsToFetch.reduce((acc, id) => ({ ...acc, [id]: false }), {
            ...prev.teachers,
          }),
        }));
        setLoadingData(false);
      }
    },
    [dataCache.teachers, pendingFetches.teachers]
  );

  // Efficiently batch fetch subject data
  const batchFetchSubjects = useCallback(
    async (subjectIds: string[]) => {
      if (!subjectIds.length) return;

      // Filter to only get IDs we don't already have in cache and aren't already fetching
      const idsToFetch = subjectIds.filter(
        (id) =>
          !dataCache.subjects[id] &&
          !GLOBAL_CACHE.subjects.has(id) &&
          !pendingFetches.subjects[id]
      );

      if (!idsToFetch.length) return;

      // Mark these IDs as pending
      setPendingFetches((prev) => ({
        ...prev,
        subjects: idsToFetch.reduce((acc, id) => ({ ...acc, [id]: true }), {
          ...prev.subjects,
        }),
      }));

      setLoadingData(true);

      try {
        // Create a new cache object to store results
        const newSubjects: Record<string, string> = {};

        // Process in smaller batches
        const BATCH_SIZE = 10;

        for (let i = 0; i < idsToFetch.length; i += BATCH_SIZE) {
          const batchIds = idsToFetch.slice(i, i + BATCH_SIZE);

          // Process this batch in parallel
          await Promise.all(
            batchIds.map(async (subjectId) => {
              try {
                const response = await fetch(
                  `/api/subject?SubjectId=${subjectId}`
                );
                if (response.ok) {
                  const data = await response.json();
                  const name = data?.name || "Unknown Subject";

                  // Add to our local results
                  newSubjects[subjectId] = name;

                  // Also add to global cache for persistence
                  GLOBAL_CACHE.subjects.set(subjectId, name);
                }
              } catch (err) {
                console.error(`Error fetching subject ${subjectId}:`, err);
                newSubjects[subjectId] = "Unknown Subject";
                GLOBAL_CACHE.subjects.set(subjectId, "Unknown Subject");
              }
            })
          );
        }

        // Update the cache with all new subject data at once
        if (Object.keys(newSubjects).length > 0) {
          setDataCache((prev) => ({
            ...prev,
            subjects: { ...prev.subjects, ...newSubjects },
          }));
        }
      } catch (err) {
        console.error("Error in batch fetch subjects:", err);
      } finally {
        // Clear the pending flags
        setPendingFetches((prev) => ({
          ...prev,
          subjects: idsToFetch.reduce((acc, id) => ({ ...acc, [id]: false }), {
            ...prev.subjects,
          }),
        }));
        setLoadingData(false);
      }
    },
    [dataCache.subjects, pendingFetches.subjects]
  );

  // Initialize component with data from global cache
  useEffect(() => {
    // Copy from global cache to local state at first render
    const cachedTeachers: Record<string, string> = {};
    const cachedSubjects: Record<string, string> = {};

    GLOBAL_CACHE.teachers.forEach((value, key) => {
      cachedTeachers[key] = value;
    });

    GLOBAL_CACHE.subjects.forEach((value, key) => {
      cachedSubjects[key] = value;
    });

    if (
      Object.keys(cachedTeachers).length > 0 ||
      Object.keys(cachedSubjects).length > 0
    ) {
      setDataCache((prev) => ({
        teachers: { ...prev.teachers, ...cachedTeachers },
        subjects: { ...prev.subjects, ...cachedSubjects },
      }));
    }
  }, []);

  // Fetch student profile once
  useEffect(() => {
    const fetchStudentProfile = async () => {
      setProfileLoading(true);
      if (studentId) {
        await fetchProfile({ id: studentId });
      }
      setProfileLoading(false);
    };

    fetchStudentProfile();
  }, [studentId, fetchProfile]);

  // Set academic year and college when profile is loaded and approved
  useEffect(() => {
    if (profile && profile.verificationStatus === "APPROVED") {
      setSelectedAcademicYearId(profile.academicYearId);
      setSelectedCollegeId(profile.collegeId);
    }
  }, [profile]);

  // Load initial data only once when profile is approved
  useEffect(() => {
    if (profile && profile.verificationStatus === "APPROVED") {
      // Load base data
      fetchAcademicYears();
      fetchcolleges();

      // Load student allocations
      fetchStudentAllocations(studentId);
    }
  }, [
    fetchAcademicYears,
    fetchcolleges,
    fetchStudentAllocations,
    studentId,
    profile,
  ]);

  // Extract all IDs from allocations for batch loading
  useEffect(() => {
    if (studentAllocations.length > 0) {
      // Extract unique teacher IDs and subject IDs
      const teacherIds: string[] = [];
      const subjectIds: string[] = [];

      studentAllocations.forEach((allocation) => {
        if (allocation.teacherId) teacherIds.push(allocation.teacherId);
        if (allocation.subjectId) subjectIds.push(allocation.subjectId);
      });

      // Batch fetch the data
      if (teacherIds.length > 0) batchFetchTeachers(teacherIds);
      if (subjectIds.length > 0) batchFetchSubjects(subjectIds);
    }
  }, [studentAllocations, batchFetchTeachers, batchFetchSubjects]);

  // Extract teacher IDs from teacher subjects for batch loading
  useEffect(() => {
    if (teacherSubjects.length > 0) {
      const teacherIds = teacherSubjects
        .filter((ts) => ts.teacherId)
        .map((ts) => ts.teacherId);

      if (teacherIds.length > 0) {
        batchFetchTeachers(teacherIds);
      }
    }
  }, [teacherSubjects, batchFetchTeachers]);

  // Fetch phases when academic year and college are selected
  useEffect(() => {
    if (selectedAcademicYearId && selectedCollegeId) {
      console.log(
        "Fetching phases for academic year and college:", selectedAcademicYearId, selectedCollegeId)
      fetchPhases({
        academicYears: selectedAcademicYearId,
        collegeId: selectedCollegeId,
      });
    }
  }, [selectedAcademicYearId, selectedCollegeId, fetchPhases]);
  console.log("phases", phases);

  // Clear selections when criteria changes
  useEffect(() => {
    setSelectedSubjects([]);
    setCurrentSubjectId("");
    setCurrentTeacherSubjectId("");
  }, [selectedAcademicYearId, selectedCollegeId, selectedPhaseId]);

  // Handle phase selection
  const handlePhaseChange = (value: string) => {
    setSelectedPhaseId(value);
  };

// Update the handleSubjectSelect function in your component
const handleSubjectSelect = (subjectId: string) => {
  setCurrentSubjectId(subjectId);
  setLoadingTeachers(true);

  // Prefetch subject name if not in cache
  if (
    subjectId &&
    !dataCache.subjects[subjectId] &&
    !GLOBAL_CACHE.subjects.has(subjectId)
  ) {
    batchFetchSubjects([subjectId]);
  }

  // Fetch teachers for this subject with college ID filter
  fetchTeacherSubjectsBySubjectId(subjectId, selectedCollegeId).then(() => {
    setLoadingTeachers(false);

    // Check if there are no teachers for this subject
    if (teacherSubjects.length === 0) {
      // Get the subject name
      const subjectName = getSubjectName(subjectId);

      // Show the dialog for no teachers
      setNoTeachersDialog({
        isOpen: true,
        subjectId,
        subjectName,
      });
    }
  });

  setCurrentTeacherSubjectId("");
};

  // Handle teacher selection for a subject
  const handleTeacherSelect = (teacherSubjectId: string) => {
    setCurrentTeacherSubjectId(teacherSubjectId);

    // Prefetch teacher data if needed
    const teacherSubject = teacherSubjects.find(
      (ts) => ts.id === teacherSubjectId
    );
    if (
      teacherSubject?.teacherId &&
      !dataCache.teachers[teacherSubject.teacherId] &&
      !GLOBAL_CACHE.teachers.has(teacherSubject.teacherId)
    ) {
      batchFetchTeachers([teacherSubject.teacherId]);
    }
  };

  // Get teacher name efficiently using the cache
  const getTeacherName = useCallback(
    (teacherId: string | null | undefined): string => {
      if (!teacherId) return "Unknown Teacher";

      // Try local cache first
      if (dataCache.teachers[teacherId]) {
        return dataCache.teachers[teacherId];
      }

      // Try global cache next
      if (GLOBAL_CACHE.teachers.has(teacherId)) {
        return GLOBAL_CACHE.teachers.get(teacherId)!;
      }

      // Not found in cache, trigger fetch if not already fetching
      if (!pendingFetches.teachers[teacherId]) {
        batchFetchTeachers([teacherId]);
      }

      return "Loading teacher...";
    },
    [dataCache.teachers, pendingFetches.teachers, batchFetchTeachers]
  );

  // Get subject name efficiently using the cache
  const getSubjectName = useCallback(
    (subjectId: string | null | undefined): string => {
      if (!subjectId) return "Unknown Subject";

      // Try local cache first
      if (dataCache.subjects[subjectId]) {
        return dataCache.subjects[subjectId];
      }

      // Try global cache next
      if (GLOBAL_CACHE.subjects.has(subjectId)) {
        return GLOBAL_CACHE.subjects.get(subjectId)!;
      }

      // Not found in cache, trigger fetch if not already fetching
      if (!pendingFetches.subjects[subjectId]) {
        batchFetchSubjects([subjectId]);
      }

      return "Loading subject...";
    },
    [dataCache.subjects, pendingFetches.subjects, batchFetchSubjects]
  );

  // Function to handle submitting a teacher profile for a subject
  const handleTeacherProfileSubmit = () => {
    // Here you would typically navigate to a teacher profile creation page
    // or open a form to submit a teacher profile

    // For now, just close the dialog
    setNoTeachersDialog({
      isOpen: false,
      subjectId: "",
      subjectName: "",
    });

    // Reset the current subject selection
    setCurrentSubjectId("");
  };

  const handleAddSubjectTeacher = async () => {
    if (!currentSubjectId || !currentTeacherSubjectId) {
      return;
    }

    try {
      // Find teacher subject
      const teacherSubject = teacherSubjects.find(
        (ts) => ts.id === currentTeacherSubjectId
      );

      if (!teacherSubject || !teacherSubject.teacherId) {
        return;
      }

      // Get subject name from cache or fetch if needed
      const subjectName = getSubjectName(currentSubjectId);

      // Get teacher name and ID directly
      const teacherId = teacherSubject.teacherId;
      const teacherName = getTeacherName(teacherId);

      // Check if already selected
      const alreadySelected = selectedSubjects.some(
        (item) => item.subjectId === currentSubjectId
      );

      if (alreadySelected) {
        return;
      }

      // Check if subject is already allocated
      const isAllocated = isSubjectAllocated(currentSubjectId);
      if (isAllocated) {
        return;
      }

      // Add to selections - now including the teacherId
      const newSelection = {
        subjectId: currentSubjectId,
        teacherSubjectId: currentTeacherSubjectId,
        teacherId: teacherId,
        subjectName,
        teacherName,
      };

      setSelectedSubjects((prev) => [...prev, newSelection]);

      // Reset current selections
      setCurrentSubjectId("");
      setCurrentTeacherSubjectId("");
      setSearchQuery("");
    } catch (error) {
      console.error("Error adding subject-teacher:", error);
    }
  };

  // Remove subject from selection
  const handleRemoveSubject = (subjectId: string) => {
    setSelectedSubjects(
      selectedSubjects.filter((item) => item.subjectId !== subjectId)
    );
  };

 // Update the handleSubmit function in your component
const handleSubmit = async () => {
  setSubmitLoading(true);
  setSubmitSuccess(false);

  try {
    // Create allocation for each selected subject-teacher pair
    for (const item of selectedSubjects) {
      await createAllocation({
        studentId,
        subjectId: item.subjectId,
        teacherSubjectId: item.teacherSubjectId,
        teacherId: item.teacherId,
        academicYearId: selectedAcademicYearId,
        phaseId: selectedPhaseId,
        collegeId: selectedCollegeId, // Add collegeId here
      });
    }

    // Reset selections and show success
    setSelectedSubjects([]);
    setSubmitSuccess(true);
    fetchStudentAllocations(studentId);

    // Clear success message after 3 seconds
    setTimeout(() => {
      setSubmitSuccess(false);
    }, 3000);
  } catch (err) {
    console.error("Error submitting allocations:", err);
  } finally {
    setSubmitLoading(false);
  }
};

  // Check if a subject is already allocated to student
  const isSubjectAllocated = (subjectId: string): boolean => {
    return studentAllocations.some(
      (allocation) =>
        allocation.subjectId === subjectId &&
        allocation.academicYearId === selectedAcademicYearId &&
        allocation.phaseId === selectedPhaseId &&
        allocation.verificationStatus !== "REJECTED" // Exclude rejected allocations
    );
  };

  // Determine if form is ready for submission
  const isFormValid = useMemo(() => {
    return (
      selectedAcademicYearId &&
      selectedCollegeId &&
      selectedPhaseId &&
      selectedSubjects.length > 0
    );
  }, [
    selectedAcademicYearId,
    selectedCollegeId,
    selectedPhaseId,
    selectedSubjects.length,
  ]);

  // Display loading state
  if (profileLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading profile...</span>
      </div>
    );
  }

  // Display message if profile doesn't exist
  if (!profile) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Student Profile Required</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You need to create your student profile first before accessing
              this section.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Display message if profile is not approved
  if (profile.verificationStatus !== "APPROVED") {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Access Restricted</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your profile verification status is {profile.verificationStatus}.
              Only students with approved profiles can access this section.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* No Teachers Dialog */}
      <Dialog
        open={noTeachersDialog.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setNoTeachersDialog((prev) => ({ ...prev, isOpen: false }));
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>No Teachers Available</DialogTitle>
            <DialogDescription>
              There are no teachers currently allocated to teach{" "}
              {noTeachersDialog.subjectName}. Would you like to submit your
              profile as a potential teacher for this subject?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-between space-x-2 mt-4">
            <Button
              variant="outline"
              onClick={() =>
                setNoTeachersDialog((prev) => ({ ...prev, isOpen: false }))
              }
            >
              Cancel
            </Button>
            <Button onClick={handleTeacherProfileSubmit}>
              Submit Teacher Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Existing Allocations - Moved to top */}
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle>Your Subject Allocations</CardTitle>
          <CardDescription>
            View the status of your current subject allocations
          </CardDescription>
        </CardHeader>

        <CardContent>
          {loadingData && (
            <div className="flex items-center justify-center p-2 mb-4">
              <Loader2 className="h-5 w-5 animate-spin mr-2 text-gray-500" />
              <span className="text-sm text-gray-500">
                Loading allocation data...
              </span>
            </div>
          )}

          {studentAllocations.length > 0 ? (
            <div className="border rounded-md overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Phase</TableHead>
                    <TableHead>Academic Year</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentAllocations
                    .sort((a, b) => {
                      const statusOrder = {
                        PENDING: 0,
                        APPROVED: 1,
                        REJECTED: 2,
                      };
                      const statusA = statusOrder[a.verificationStatus] || 3;
                      const statusB = statusOrder[b.verificationStatus] || 3;

                      if (statusA !== statusB) {
                        return statusA - statusB;
                      }

                      const subjectNameA = getSubjectName(a.subjectId);
                      const subjectNameB = getSubjectName(b.subjectId);
                      return subjectNameA.localeCompare(subjectNameB);
                    })
                    .map((allocation) => {
                      const phase = phases.find(
                        (p) => p.id === allocation.phaseId
                      );
                      const academicYear = academicYears.find(
                        (year) => year.id === allocation.academicYearId
                      );

                      return (
                        <TableRow key={allocation.id}>
                          <TableCell className="font-medium">
                            {getSubjectName(allocation.subjectId) ===
                            "Loading subject..." ? (
                              <>
                                Loading subject...
                                <Loader2 className="inline-block ml-2 h-3 w-3 animate-spin" />
                              </>
                            ) : (
                              getSubjectName(allocation.subjectId)
                            )}
                          </TableCell>
                          <TableCell>
                            {getTeacherName(allocation.teacherId) ===
                            "Loading teacher..." ? (
                              <>
                                Loading teacher...
                                <Loader2 className="inline-block ml-2 h-3 w-3 animate-spin" />
                              </>
                            ) : (
                              getTeacherName(allocation.teacherId)
                            )}
                          </TableCell>
                          <TableCell>
                            {phase?.name || "Unknown Phase"}
                          </TableCell>
                          <TableCell>
                            {academicYear?.name || "Unknown Year"}
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
                              className={
                                allocation.verificationStatus === "APPROVED"
                                  ? "bg-green-100 text-green-800 hover:bg-green-200"
                                  : allocation.verificationStatus === "REJECTED"
                                  ? "bg-red-100 text-red-800 hover:bg-red-200"
                                  : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                              }
                            >
                              {allocation.verificationStatus}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-6 text-center border rounded-md bg-gray-50">
              <p className="text-gray-500">
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                    Loading allocations...
                  </>
                ) : (
                  "No subject allocations found"
                )}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add New Subjects Section */}
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle>Add More Subjects</CardTitle>
          <CardDescription>
            Select additional subjects and teachers for approval
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* All in one line container with relative positioning */}
          <div className="relative grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
            {/* Phase Selection */}
            <div className="space-y-3 z-10">
              <Label>Phase</Label>
              <Select
                value={selectedPhaseId}
                onValueChange={handlePhaseChange}
                disabled={!selectedAcademicYearId || !selectedCollegeId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select phase" />
                </SelectTrigger>
                <SelectContent>
                  {phases.map((phase) => (
                    <SelectItem key={phase.id} value={phase.id}>
                      {phase.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject Selection Component */}
            <div className="space-y-3 z-20">
              <Label>Subject</Label>
              <SubjectSelector
                selectedPhaseId={selectedPhaseId}
                onSelectSubject={handleSubjectSelect}
                disabled={!selectedPhaseId}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            </div>

            {/* Teacher Selection */}
            <div className="space-y-3 z-10">
              <Label>Teacher</Label>
              <Select
                value={currentTeacherSubjectId}
                onValueChange={handleTeacherSelect}
                disabled={!currentSubjectId || loadingTeachers}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      loadingTeachers ? "Loading teachers..." : "Select teacher"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {teacherSubjects.map((teacherSubject) => (
                    <SelectItem
                      key={teacherSubject.id}
                      value={teacherSubject.id}
                    >
                      {getTeacherName(teacherSubject.teacherId)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Add Button */}
            <div className="mt-8">
              <Button
                onClick={handleAddSubjectTeacher}
                disabled={!currentSubjectId || !currentTeacherSubjectId}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" /> Add Subject
              </Button>
            </div>

            {/* Overlay loading indicator during fetches */}
            {loadingTeachers && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-md z-30">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
          </div>

          {/* Information card when teachers are being loaded */}
          {loadingTeachers && (
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-blue-600">
                Loading available teachers for this subject...
              </AlertDescription>
            </Alert>
          )}

          {/* Selected Subjects Section */}
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-3">Selected Subjects</h3>
            <div className="border rounded-md p-1">
              <ScrollArea className={selectedSubjects.length > 5 ? "h-52" : ""}>
                {selectedSubjects.length > 0 ? (
                  <div className="space-y-2 p-2">
                    {selectedSubjects.map((item) => (
                      <div
                        key={item.subjectId}
                        className="flex items-center justify-between bg-gray-50 p-3 rounded-md"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{item.subjectName}</p>
                          <p className="text-sm text-gray-600">
                            Teacher: {item.teacherName}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveSubject(item.subjectId)}
                          title="Remove subject"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <p className="text-gray-500">No subjects selected</p>
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>

          {/* Success/Error Messages */}
          {submitSuccess && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-600">
                Subject allocations submitted successfully!
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Separator before submit button */}
          <Separator className="my-4" />
        </CardContent>

        <CardFooter>
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid || submitLoading}
            className="w-full"
          >
            {submitLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Allocation Request"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
