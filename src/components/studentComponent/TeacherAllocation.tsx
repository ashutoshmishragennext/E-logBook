/* eslint-disable react-hooks/exhaustive-deps*/
/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { useStudentProfileStore } from "@/store/student";
import { useStudentSubjectStore } from "@/store/studentSubjectStore";
import { AlertCircle, CheckCircle2, Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface StudentSubjectSelectionProps {
  studentId: string;
}

interface SelectedSubjectTeacher {
  subjectId: string;
  teacherSubjectId: string;
  subjectName: string;
  teacherName: string;
}

// Interface for teacher subject data
interface TeacherSubjectData {
  id: string;
  teacherId: string;
  subjectId: string;
}

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
    teacher,
    fetchTeacherName,
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
  const [teacherNames, setTeacherNames] = useState<Record<string, string>>({});
  const [subjectNames, setSubjectNames] = useState<Record<string, string>>({});
  const [fetchingTeacherNames, setFetchingTeacherNames] = useState(false);
  const [cachedTeacherSubjects, setCachedTeacherSubjects] = useState<
    Record<string, TeacherSubjectData>
  >({});

  // Improved function to fetch teacher name directly
  const getTeacherName = async (teacherId: string) => {
    if (!teacherId) return "Unknown Teacher";

    console.log("Fetching teacher name for ID:", teacherId);

    // Return cached name if available
    if (teacherNames[teacherId]) {
      return teacherNames[teacherId];
    }

    console.log("Fetching teacher name for ID:", teacherId);

    try {
      // Direct API call to fetch teacher name
      const response = await fetch(`/api/teacher-profile?id=${teacherId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch teacher: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched teacher data:", data);
      const name = data?.name || "Unknown Teacher";

      // Update the cache
      setTeacherNames((prev) => ({
        ...prev,
        [teacherId]: name,
      }));

      return name;
    } catch (error) {
      console.error(`Error fetching teacher name for ID ${teacherId}:`, error);
      return "Unknown Teacher";
    }
  };

  const fetchTeacherSubjectDetails = async (teacherSubjectId: string) => {
    if (!teacherSubjectId) return null;

    // Return from cache if available
    if (cachedTeacherSubjects[teacherSubjectId]) {
      return cachedTeacherSubjects[teacherSubjectId];
    }

    try {
      const response = await fetch(
        `/api/teacher-subjects?id=${teacherSubjectId}`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch teacher subject: ${response.status}`);
      }

      const data = await response.json();

      // Update the cache
      setCachedTeacherSubjects((prev) => ({
        ...prev,
        [teacherSubjectId]: data,
      }));

      // If we have a teacherId, immediately initiate fetching the teacher's name
      if (data && data.teacherId) {
        getTeacherName(data.teacherId);
      }

      return data;
    } catch (error) {
      console.error(
        `Error fetching teacher subject details for ID ${teacherSubjectId}:`,
        error
      );
      return null;
    }
  };
  useEffect(() => {
    const fetchSubjectsForAllocations = async () => {
      const uniqueSubjectIds = new Set(
        studentAllocations.map((a) => a.subjectId)
      );

      const newSubjectNames: Record<string, string> = {};

      for (const subjectId of uniqueSubjectIds) {
        if (!subjectNames[subjectId]) {
          const subject = await fetchSubjectById(subjectId);
          if (subject?.name) {
            newSubjectNames[subjectId] = subject.name;
          }
        }
      }

      setSubjectNames((prev) => ({ ...prev, ...newSubjectNames }));
    };

    if (studentAllocations.length > 0) {
      fetchSubjectsForAllocations();
    }
  }, [studentAllocations]);
  4;

  // Improved teacher names fetching for allocations
  // Improved useEffect for fetching teacher names
  useEffect(() => {
    const fetchAllocationTeacherInfo = async () => {
      if (studentAllocations.length === 0) return;

      setFetchingTeacherNames(true);

      try {
        for (const allocation of studentAllocations) {
          const teacherSubjectId = allocation.teacherSubjectId;

          // Skip if we don't have a valid teacherSubjectId
          if (!teacherSubjectId) continue;

          let teacherId = null;

          // First check if we already know about this teacher subject
          const existingTeacherSubject = teacherSubjects.find(
            (ts) => ts.id === teacherSubjectId
          );
          

          if (existingTeacherSubject && existingTeacherSubject.teacherId) {
            teacherId = existingTeacherSubject.teacherId;
          } else {
            // If not in our current list, check cache or fetch it
            let teacherSubjectData = cachedTeacherSubjects[teacherSubjectId];

            if (!teacherSubjectData) {
              teacherSubjectData = await fetchTeacherSubjectDetails(
                teacherSubjectId
              );
            }

            if (teacherSubjectData && teacherSubjectData.teacherId) {
              teacherId = teacherSubjectData.teacherId;
            }
          }

          console.log("Teacher ID for allocation:", teacherId);

          // If we found a teacherId, make sure we have the name
          if (teacherId && !teacherNames[teacherId]) {
            await getTeacherName(teacherId);
          }
        }
      } catch (error) {
        console.error("Error fetching allocation teacher info:", error);
      } finally {
        setFetchingTeacherNames(false);
      }
    };

    fetchAllocationTeacherInfo();
  }, [
    studentAllocations,
    teacherSubjects,
    cachedTeacherSubjects,
    teacherNames,
  ]);

  // Fetch teacher names for available teachers when teacherSubjects changes
  useEffect(() => {
    const fetchAvailableTeacherNames = async () => {
      if (teacherSubjects.length === 0) return;

      const teacherIdsToFetch = teacherSubjects
        .map((ts) => ts.teacherId)
        .filter((id) => id && !teacherNames[id]);

      if (teacherIdsToFetch.length === 0) return;

      const newTeacherNames: Record<string, string> = {};

      for (const teacherId of teacherIdsToFetch) {
        const name = await getTeacherName(teacherId);
        newTeacherNames[teacherId] = name;
      }

      setTeacherNames((prev) => ({
        ...prev,
        ...newTeacherNames,
      }));
    };

    fetchAvailableTeacherNames();
  }, [teacherSubjects]);

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

  // Fetch initial data
  useEffect(() => {
    if (profile && profile.verificationStatus === "APPROVED") {
      fetchAcademicYears();
      fetchcolleges();
      fetchStudentAllocations(studentId);
    }
  }, [
    fetchAcademicYears,
    fetchcolleges,
    fetchStudentAllocations,
    studentId,
    profile,
  ]);

  // Fetch phases when academic year and college are selected
  useEffect(() => {
    if (selectedAcademicYearId && selectedCollegeId) {
      fetchPhases({
        academicYearId: selectedAcademicYearId,
        collegeId: selectedCollegeId,
      });
    }
  }, [selectedAcademicYearId, selectedCollegeId, fetchPhases]);

  // Clear selections when criteria changes
  useEffect(() => {
    setSelectedSubjects([]);
    setCurrentSubjectId("");
    setCurrentTeacherSubjectId("");
  }, [selectedAcademicYearId, selectedCollegeId, selectedPhaseId]);

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

  // Handle phase selection
  const handlePhaseChange = (value: string) => {
    setSelectedPhaseId(value);
  };

  // Handle subject selection
  const handleSubjectSelect = (subjectId: string) => {
    setCurrentSubjectId(subjectId);
    fetchTeacherSubjectsBySubjectId(subjectId);
    setCurrentTeacherSubjectId("");
  };

  // Handle teacher selection for a subject
  const handleTeacherSelect = (teacherSubjectId: string) => {
    setCurrentTeacherSubjectId(teacherSubjectId);
  };

  const fetchSubjectById = async (subjectId: string) => {
    try {
      const response = await fetch(`/api/subject?SubjectId=${subjectId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch subject: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching subject details:", error);
      return null;
    }
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

      if (!teacherSubject) {
        return;
      }

      // Fetch the subject details directly
      let subjectName = "Unknown Subject";
      const subjectDetails = await fetchSubjectById(currentSubjectId);

      if (subjectDetails && subjectDetails.name) {
        subjectName = subjectDetails.name;
      }

      // Get teacher name - use our improved method
      const teacherId = teacherSubject.teacherId;
      const teacherName = await getTeacherName(teacherId);

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

      // Add to selections
      const newSelection = {
        subjectId: currentSubjectId,
        teacherSubjectId: currentTeacherSubjectId,
        subjectName: subjectName,
        teacherName: teacherName,
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

  // Submit all selected subject-teacher pairs
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
          academicYearId: selectedAcademicYearId,
          phaseId: selectedPhaseId,
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

  // Helper function to get teacher name from teacherSubject
  const getTeacherNameFromSubject = (teacherSubjectId: string) => {
    const teacherSubject = teacherSubjects.find(
      (ts) => ts.id === teacherSubjectId
    );
    if (!teacherSubject || !teacherSubject.teacherId) return "Unknown Teacher";
    return teacherNames[teacherSubject.teacherId] || "Loading...";
  };

  // Fixed getAllocationTeacherName function
  const getAllocationTeacherName = (allocation: { teacherSubjectId?: string }) => {
    if (!allocation || !allocation.teacherSubjectId) {
      return "Unknown Teacher";
    }

    // First check if we have this teacher subject in our cache or main list
    const teacherSubject = teacherSubjects.find(
      (ts) => ts.id === allocation.teacherSubjectId
    );

    const cachedTeacherSubject =
      cachedTeacherSubjects[allocation.teacherSubjectId];

    let teacherId = null;

    // Get the teacherId from wherever it's available
    if (teacherSubject && teacherSubject.teacherId) {
      teacherId = teacherSubject.teacherId;
    } else if (cachedTeacherSubject && cachedTeacherSubject.teacherId) {
      teacherId = cachedTeacherSubject.teacherId;
    }

    // If we have a teacher ID, return the name if available
    if (teacherId && teacherNames[teacherId]) {
      return teacherNames[teacherId];
    }

    // Handle loading state
    if (fetchingTeacherNames) {
      return "Loading...";
    }

    // If we have a teacher subject ID but name isn't loaded yet, trigger a fetch
    if (allocation.teacherSubjectId && !fetchingTeacherNames) {
      // This will start fetching in the background
      setTimeout(async () => {
        const teacherSubjectData = await fetchTeacherSubjectDetails(
          allocation.teacherSubjectId ?? ""
        );
        if (teacherSubjectData && teacherSubjectData.teacherId) {

          await getTeacherName(teacherSubjectData.teacherId);
        }
      }, 0);
      return "Loading...";
    }

    return "Unknown Teacher";
  };

  // Determine if form is ready for submission
  const isFormValid =
    selectedAcademicYearId &&
    selectedCollegeId &&
    selectedPhaseId &&
    selectedSubjects.length > 0;

  // Check if a subject is already allocated to student
  const isSubjectAllocated = (subjectId: string): boolean => {
    return studentAllocations.some(
      (allocation) =>
        allocation.subjectId === subjectId &&
        allocation.academicYearId === selectedAcademicYearId &&
        allocation.phaseId === selectedPhaseId &&
        allocation.verificationStatus !== "REJECTED" // Optionally exclude rejected allocations
    );
  };

  return (
    <div className="w-full">
      <Card className="mb-6 w-full">
        <CardHeader className="pb-3">
          <CardTitle>Subject Selection</CardTitle>
          <CardDescription>
            Select subjects and teachers for the phase
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Step 1: Selection Criteria - Only phase selection is needed */}
          <div className="w-full">
            <Label htmlFor="phase">Phase</Label>
            <Select
              value={selectedPhaseId}
              onValueChange={handlePhaseChange}
              disabled={!selectedAcademicYearId || !selectedCollegeId}
            >
              <SelectTrigger id="phase" className="w-full">
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

          <Separator className="my-4" />

          {/* Step 2 & 3: Subject and Teacher Selection */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Subject Selection */}
            <div className="space-y-3">
              <Label>Search and Select Subject</Label>
              <SubjectSelector
                onSubjectSelect={handleSubjectSelect}
                selectedSubjectIds={currentSubjectId ? [currentSubjectId] : []}
                disabled={!selectedPhaseId}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onSubjectRequest={function (subjectName: string): void {
                  throw new Error("Function not implemented.");
                }}
              />

              {loading && currentSubjectId && (
                <div className="flex items-center justify-center p-2">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                </div>
              )}
            </div>

            {/* Teacher Selection */}
            <div className="space-y-3">
              <Label>Available Teachers</Label>
              <ScrollArea className="h-40 w-full border rounded-md">
                {currentSubjectId ? (
                  teacherSubjects.length > 0 ? (
                    <div className="p-2">
                      {teacherSubjects.map((teacherSubject) => {
                        const teacherId = teacherSubject.teacherId;
                        const displayName = teacherId
                          ? teacherNames[teacherId] || "Loading teacher..."
                          : "Unknown Teacher";

                        return (
                          <div
                            key={teacherSubject.id}
                            className={`p-2 mb-2 rounded-md cursor-pointer flex items-center justify-between
                ${
                  currentTeacherSubjectId === teacherSubject.id
                    ? "bg-primary/10 border border-primary/20"
                    : "bg-gray-50 hover:bg-gray-100"
                }`}
                            onClick={() =>
                              handleTeacherSelect(teacherSubject.id)
                            }
                          >
                            <p className="font-medium">{displayName}</p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                      ) : (
                        <>
                          <AlertCircle className="h-5 w-5 mx-auto mb-2" />
                          <p>No teachers available for this subject</p>
                        </>
                      )}
                    </div>
                  )
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    <p>Select a subject first</p>
                  </div>
                )}
              </ScrollArea>

              {/* Add Button - Moved below teacher selection for better flow */}
              <Button
                onClick={handleAddSubjectTeacher}
                disabled={
                  !currentSubjectId ||
                  !currentTeacherSubjectId ||
                  isSubjectAllocated(currentSubjectId)
                }
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Subject & Teacher
              </Button>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Selected Subjects Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Selected Subjects</h3>
              <Badge variant="outline">
                {selectedSubjects.length}{" "}
                {selectedSubjects.length === 1 ? "subject" : "subjects"}
              </Badge>
            </div>

            {selectedSubjects.length > 0 ? (
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedSubjects.map((item) => (
                      <TableRow key={item.subjectId}>
                        <TableCell className="font-medium">
                          {item.subjectName}
                        </TableCell>
                        <TableCell>{item.teacherName}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveSubject(item.subjectId)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="p-6 text-center border rounded-md bg-gray-50">
                <p className="text-gray-500">No subjects selected yet</p>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex-col items-start space-y-3 pt-0">
          {error && (
            <Alert variant="destructive" className="w-full">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {submitSuccess && (
            <Alert className="w-full border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">
                Subject selections submitted successfully
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end w-full">
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid || submitLoading}
            >
              {submitLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Submit for Approval
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Existing Allocations */}
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle>Your Subject Allocations</CardTitle>
          <CardDescription>
            View the status of your current subject allocations
          </CardDescription>
        </CardHeader>

        <CardContent>
          {studentAllocations.length > 0 ? (
            <div className="border rounded-md overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Academic Year</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Logbook Access</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentAllocations.map((allocation) => {
                    // Get subject name, either from cache or display placeholder
                    const subjectName =
                      subjectNames[allocation.subjectId] || "Loading...";

                    // Get teacher name using our fixed function
                    const teacherName = getAllocationTeacherName(allocation);

                    // Find academic year name
                    const academicYear = academicYears.find(
                      (year) => year.id === allocation.academicYearId
                    );

                    return (
                      <TableRow key={allocation.id}>
                        <TableCell className="font-medium">
                          {subjectName}
                        </TableCell>
                        <TableCell>{teacherName}</TableCell>
                        <TableCell>
                          {academicYear?.name || allocation.academicYearId}
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
                                ? "bg-green-100 text-green-800"
                                : allocation.verificationStatus === "REJECTED"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {allocation.verificationStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {allocation.verificationStatus === "APPROVED" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <a href={`/student/logbook/${allocation.id}`}>
                                Access Logbook
                              </a>
                            </Button>
                          ) : (
                            <Badge variant="outline" className="bg-gray-100">
                              Pending Approval
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-6 text-center border rounded-md bg-gray-50">
              <p className="text-gray-500">No subject allocations found</p>
              {!selectedPhaseId && (
                <p className="text-sm mt-2 text-gray-400">
                  Select a phase to make new subject allocations
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
