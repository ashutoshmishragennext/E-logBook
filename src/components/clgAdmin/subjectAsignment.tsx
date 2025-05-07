/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps*/
"use client";

import { useAcademicYearStore } from "@/store/academicYear";
import { useBatchStore } from "@/store/batch";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Check, CheckCircle, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import SubjectSelector from "./Settings";

// Form schema for subject assignment
const assignmentSchema = z.object({
  academicYearId: z.string().min(1, "Academic year is required"),
  phaseId: z.string().min(1, "Phase is required"),
  branchId: z.string().min(1, "Branch is required"),
  courseId: z.string().min(1, "Course is required"),
  subjectIds: z.array(z.string()).min(1, "At least one subject must be selected"),
});

type AssignmentFormValues = z.infer<typeof assignmentSchema>;

interface SubjectAssignmentProps {
  teacherId: string;
  teacherName: string;
  teacherDesignation: string;
  teacherEmail: string;
  onClose: () => void;
}

const SubjectAssignment: React.FC<SubjectAssignmentProps> = ({
  teacherId,
  teacherName,
  teacherDesignation,
  teacherEmail,
  onClose,
}) => {
  // States for data fetching
  const { years, fetchYears } = useAcademicYearStore();
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const { fetchBatches } = useBatchStore();
  
  const [phases, setPhases] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [assignedSubjects, setAssignedSubjects] = useState<any[]>([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [alreadyAssignedSubjects, setAlreadyAssignedSubjects] = useState<string[]>([]);
  const [formToSubmit, setFormToSubmit] = useState<AssignmentFormValues | null>(null);
  const [subjectSearchQuery, setSubjectSearchQuery] = useState("");
  console.log("years",years)

  // Form handling
  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      academicYearId: "",
      phaseId: "",
      branchId: "",
      courseId: "",
      subjectIds: [],
    },
  });

  const { watch, setValue, reset } = form;
  const academicYearId = watch("academicYearId");
  const phaseId = watch("phaseId");
  const branchId = watch("branchId");
  const courseId = watch("courseId");
  const selectedSubjectIds = watch("subjectIds");

  // Inside useEffect: Fetch academic years and assigned subjects
  useEffect(() => {
    const fetchData = async () => {
      await fetchYears(); // wait for the years to be fetched
      setAcademicYears(useAcademicYearStore.getState().years); // fetch from latest state
      fetchAssignedSubjects(); // fetch assigned subjects
    };

    fetchData();
  }, [teacherId]);

  // Fetch batches (phases) when academic year is selected
  useEffect(() => {
    const fetchPhases = async () => {
      if (!academicYearId) return;
      await fetchBatches("", academicYearId);
      setPhases(useBatchStore.getState().batches);
    };

    fetchPhases();
  }, [academicYearId]);

  // Fetch branches
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await fetch("/api/branches");
        const data = await res.json();
        setBranches(data);
      } catch (err) {
        console.error("Error fetching branches:", err);
      }
    };

    fetchBranches();
  }, []);

  // Fetch courses when branch is selected
  useEffect(() => {
    if (!branchId) return;

    const fetchCourses = async () => {
      try {
        const res = await fetch(`/api/course?branchId=${branchId}`);
        const data = await res.json();
        setCourses(data);
      } catch (err) {
        console.error("Error fetching courses:", err);
      }
    };

    fetchCourses();
  }, [branchId]);

  // Fetch subjects when course, phase and academic year are selected
  useEffect(() => {
    if (!courseId || !phaseId || !academicYearId) return;

    const fetchSubjects = async () => {
      try {
        const res = await fetch(`/api/subject?courseId=${courseId}&phaseId=${phaseId}&academicYearId=${academicYearId}`);
        const data = await res.json();
        setSubjects(data);
      } catch (err) {
        console.error("Error fetching subjects:", err);
      }
    };

    fetchSubjects();
  }, [courseId, phaseId, academicYearId]);

  // Check for already assigned subjects when selection criteria changes
  useEffect(() => {
    if (!academicYearId || !phaseId || !courseId || !selectedSubjectIds.length) {
      setAlreadyAssignedSubjects([]);
      return;
    }
    
    const getAlreadyAssignedSubjects = () => {
      const assigned = assignedSubjects.filter(assignment => 
        assignment.academicYearId === academicYearId &&
        assignment.phaseId === phaseId &&
        assignment.courseId === courseId &&
        selectedSubjectIds.includes(assignment.subjectId)
      );
      
      return assigned.map(a => a.subjectId);
    };
    
    setAlreadyAssignedSubjects(getAlreadyAssignedSubjects());
  }, [selectedSubjectIds, academicYearId, phaseId, courseId, assignedSubjects]);

  // Fetch teacher's assigned subjects with related data
  const fetchAssignedSubjects = async () => {
    try {
      const res = await fetch(`/api/teacher-subjects?teacherId=${teacherId}`);
      const data = await res.json();
      
      const enrichedData = await Promise.all(data.map(async (assignment: any) => {
        let subject = null;
        let academicYear = null;
        let phase = null;
        let branch = null;
        let course = null;
        
        if (assignment.subjectId) {
          try {
            const subjectRes = await fetch(`/api/subject?subjectId=${assignment.subjectId}`);
            subject = await subjectRes.json();
          } catch (err) {
            console.error(`Error fetching subject ${assignment.subjectId}:`, err);
          }
        }
        
        if (assignment.academicYearId) {
          try {
            const yearRes = await fetch(`/api/academicYears?id=${assignment.academicYearId}`);
            academicYear = await yearRes.json();
          } catch (err) {
            console.error(`Error fetching academic year ${assignment.academicYearId}:`, err);
          }
        }
        
        if (assignment.phaseId) {
          try {
            const phaseRes = await fetch(`/api/phase?id=${assignment.phaseId}`);
            phase = await phaseRes.json();
          } catch (err) {
            console.error(`Error fetching phase ${assignment.phaseId}:`, err);
          }
        }
        
        if (assignment.branchId) {
          try {
            const branchRes = await fetch(`/api/branches?id=${assignment.branchId}`);
            branch = await branchRes.json();
          } catch (err) {
            console.error(`Error fetching branch ${assignment.branchId}:`, err);
          }
        }
        
        if (assignment.courseId) {
          try {
            const courseRes = await fetch(`/api/course?id=${assignment.courseId}`);
            course = await courseRes.json();
          } catch (err) {
            console.error(`Error fetching course ${assignment.courseId}:`, err);
          }
        }
        
        return {
          ...assignment,
          subject,
          academicYear,
          phase,
          branch,
          course
        };
      }));
      
      setAssignedSubjects(enrichedData);
    } catch (err) {
      console.error("Error fetching assigned subjects:", err);
    }
  };

  const handleFormSubmit = (data: AssignmentFormValues) => {
    const duplicateSubjects = data.subjectIds.filter(id => 
      assignedSubjects.some(assignment => 
        assignment.subjectId === id && 
        assignment.academicYearId === data.academicYearId &&
        assignment.phaseId === data.phaseId &&
        assignment.courseId === data.courseId
      )
    );
    
    if (duplicateSubjects.length > 0) {
      setFormToSubmit(data);
      setShowConfirmation(true);
    } else {
      submitAssignments(data);
    }
  };

  const submitAssignments = async (data: AssignmentFormValues) => {
    setIsLoading(true);
    setStatus("Assigning subjects...");
    setError("");
    setShowConfirmation(false);
  
    try {
      const assignments = data.subjectIds.map(subjectId => ({
        teacherId,
        subjectId,
        academicYearId: data.academicYearId,
        phaseId: data.phaseId,
        courseId: data.courseId,
        branchId: data.branchId
      }));
  
      const res = await fetch("/api/teacher-subjects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(assignments),
      });
  
      const result = await res.json();
  
      if (res.ok) {
        setStatus("✅ Subjects assigned successfully!");
        fetchAssignedSubjects();
        reset();
        setSubjectSearchQuery(""); // Clear search query after successful assignment
      } else {
        setError(result.error || "Failed to assign subjects");
        setStatus("❌ Error occurred");
      }
    } catch (err) {
      console.error("Error assigning subjects:", err);
      setError("Request failed. Please try again.");
      setStatus("❌ Error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? `${subject.name} (${subject.code})` : `Subject ID: ${subjectId}`;
  };

  const isSubjectAssigned = (subjectId: string) => {
    return assignedSubjects.some(assignment => 
      assignment.subjectId === subjectId && 
      assignment.academicYearId === academicYearId &&
      assignment.phaseId === phaseId &&
      assignment.courseId === courseId
    );
  };

  const handleSubjectSelect = (subjectId: string) => {
    const currentSelected = form.getValues("subjectIds");
    if (currentSelected.includes(subjectId)) {
      setValue("subjectIds", currentSelected.filter(id => id !== subjectId));
    } else {
      setValue("subjectIds", [...currentSelected, subjectId]);
    }
  };

  const handleSubjectRequest = async (subjectName: string) => {
    try {
      const res = await fetch("/api/search/subject", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: subjectName }),
      });
      console.log("Response from subject request:", res);

      setStatus(`✅ Subject request for "${subjectName}" sent to admin`);
      setSubjectSearchQuery(""); // Clear search query after request
    } catch (err) {
      console.error(err);
      setError("Failed to send subject request.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-4/5 max-w-6xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Assign Subjects to {teacherName}</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left panel - 70% - Teacher info and currently assigned subjects */}
          <div className="w-[70%] p-6 overflow-y-auto border-r">
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Teacher Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <div className="grid grid-cols-2 gap-2">
                  <p><span className="font-medium text-gray-700">Name:</span> {teacherName}</p>
                  <p><span className="font-medium text-gray-700">Designation:</span> {teacherDesignation}</p>
                  <p><span className="font-medium text-gray-700">Email:</span> {teacherEmail}</p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center mb-3">
                <h3 className="text-lg font-medium">Currently Assigned Subjects</h3>
                <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  {assignedSubjects.length} Subject{assignedSubjects.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              {assignedSubjects.length === 0 ? (
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-gray-500 italic">No subjects currently assigned</p>
                </div>
              ) : (
                <div className="overflow-x-auto bg-white rounded-lg border shadow-sm">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">Subject</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">Academic Year</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">Phase</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">Branch</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">Course</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignedSubjects.map((assignment, index) => (
                        <tr 
                          key={index} 
                          className={index % 2 === 0 ? "bg-white hover:bg-gray-50" : "bg-gray-50 hover:bg-gray-100"}
                        >
                          <td className="px-4 py-3 text-sm text-gray-900 border-b">
                            {assignment.subject ? 
                              `${assignment.subject.name} (${assignment.subject.code})` : 
                              `Subject ID: ${assignment.subjectId ?? 'N/A'}`
                            }
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 border-b">
                            {assignment.academicYear ? 
                              assignment.academicYear.name : 
                              `Academic Year ID: ${assignment.academicYearId ?? 'N/A'}`
                            }
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 border-b">
                            {assignment.phase ? 
                              assignment.phase.name : 
                              `Phase ID: ${assignment.phaseId ?? 'N/A'}`
                            }
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 border-b">
                            {assignment.branch ? 
                              assignment.branch.name : 
                              `${assignment.branchId ? 'Branch ID: ' + assignment.branchId : 'Not assigned'}`
                            }
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 border-b">
                            {assignment.course ? 
                              assignment.course.name : 
                              `${assignment.courseId ? 'Course ID: ' + assignment.courseId : 'Not assigned'}`
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right panel - 30% - Assignment form */}
          <div className="w-[30%] p-6 overflow-y-auto bg-gray-50">
            <h3 className="text-lg font-medium mb-4">Assign New Subjects</h3>

            {/* Status and error messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4 flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            {status && (
              <div className={`${
                status.includes("✅") ? "bg-green-50 border-green-200 text-green-800" : "bg-blue-50 border-blue-200 text-blue-800"
              } border px-4 py-3 rounded mb-4 flex items-start`}>
                {status.includes("✅") ? (
                  <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                ) : (
                  <Loader2 className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5 animate-spin" />
                )}
                <span>{status}</span>
              </div>
            )}

            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
              {/* Academic Year */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Academic Year *</label>
                <select
                  {...form.register("academicYearId")}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Academic Year</option>
                  {academicYears.map(year => (
                    <option key={year.id} value={year.id}>{year.name}</option>
                  ))}
                </select>
                {form.formState.errors.academicYearId && (
                  <p className="text-red-500 text-xs mt-1">
                    {form.formState.errors.academicYearId.message}
                  </p>
                )}
              </div>

              {/* Phase */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Phase *</label>
                <select
                  {...form.register("phaseId")}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={!academicYearId}
                >
                  <option value="">Select Phase</option>
                  {phases.map(phase => (
                    <option key={phase.id} value={phase.id}>{phase.name}</option>
                  ))}
                </select>
                {form.formState.errors.phaseId && (
                  <p className="text-red-500 text-xs mt-1">
                    {form.formState.errors.phaseId.message}
                  </p>
                )}
              </div>

              {/* Branch */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Branch *</label>
                <select
                  {...form.register("branchId")}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Branch</option>
                  {branches.map(branch => (
                    <option key={branch.id} value={branch.id}>{branch.name} ({branch.code})</option>
                  ))}
                </select>
                {form.formState.errors.branchId && (
                  <p className="text-red-500 text-xs mt-1">
                    {form.formState.errors.branchId.message}
                  </p>
                )}
              </div>

              {/* Course */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Course *</label>
                <select
                  {...form.register("courseId")}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={!branchId}
                >
                  <option value="">Select Course</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.name}</option>
                  ))}
                </select>
                {form.formState.errors.courseId && (
                  <p className="text-red-500 text-xs mt-1">
                    {form.formState.errors.courseId.message}
                  </p>
                )}
              </div>

              {/* Subject Selector */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Subjects *</label>
                <div className="mb-2">
                  <SubjectSelector 
                    onSubjectSelect={handleSubjectSelect}
                    onSubjectRequest={handleSubjectRequest}
                    selectedSubjectIds={selectedSubjectIds}
                    disabled={!courseId || !phaseId || !academicYearId}
                    searchQuery={subjectSearchQuery}
                    onSearchChange={setSubjectSearchQuery}
                  />
                </div>
                
                {/* Selected subjects list */}
                {selectedSubjectIds.length > 0 && (
                  <div className="mt-2">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Selected Subjects:</h4>
                    <div className="max-h-32 overflow-y-auto border rounded-lg bg-white p-2">
                      {selectedSubjectIds.map(subjectId => {
                        const subject = subjects.find(s => s.id === subjectId);
                        const isAssigned = isSubjectAssigned(subjectId);
                        
                        return (
                          <div 
                            key={subjectId} 
                            className={`flex items-center justify-between py-1 px-2 rounded ${
                              isAssigned ? 'bg-blue-50' : 'hover:bg-gray-50'
                            }`}
                          >
                            <span className="text-sm">
                              {subject ? `${subject.name} (${subject.code})` : `Subject ID: ${subjectId}`}
                            </span>
                            {isAssigned && (
                              <span className="inline-flex items-center text-xs font-medium text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                                <Check size={12} className="mr-1" />
                                Assigned
                              </span>
                            )}
                            <button 
                              type="button"
                              onClick={() => handleSubjectSelect(subjectId)}
                              className="text-gray-500 hover:text-red-500 ml-2"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {alreadyAssignedSubjects.length > 0 && (
                  <p className="text-blue-600 text-xs mt-1 flex items-center">
                    <AlertCircle size={12} className="mr-1" />
                    {alreadyAssignedSubjects.length} subject(s) already assigned
                  </p>
                )}
                {form.formState.errors.subjectIds && (
                  <p className="text-red-500 text-xs mt-1">
                    {form.formState.errors.subjectIds.message}
                  </p>
                )}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading || selectedSubjectIds.length === 0}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Assigning...
                  </>
                ) : (
                  "Assign Subjects"
                )}
              </button>
            </form>
          </div>
        </div>
        
        {/* Confirmation Modal for already assigned subjects */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-96 p-6 max-h-[80vh] overflow-y-auto">
              <h3 className="text-lg font-medium mb-2">Confirm Assignment</h3>
              <p className="text-gray-700 mb-4">
                The following subjects are already assigned to this teacher for the selected criteria:
              </p>
              <ul className="list-disc ml-6 mb-4 text-sm">
                {alreadyAssignedSubjects.map(subjectId => (
                  <li key={subjectId} className="mb-1">
                    {getSubjectName(subjectId)}
                  </li>
                ))}
              </ul>
              <p className="text-gray-700 mb-4">
                Do you want to proceed with the assignment? This will update any existing assignments.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => formToSubmit && submitAssignments(formToSubmit)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  Proceed
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectAssignment;