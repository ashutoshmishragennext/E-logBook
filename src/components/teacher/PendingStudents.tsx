/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCurrentUser } from "@/hooks/auth";
import {
  CheckCircle,
  Filter,
  Search,
  SortAsc,
  SortDesc,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function StudentVerificationSystem() {
  const [students, setStudents] = useState<any[]>([]);

  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [filters, setFilters] = useState({
    verificationStatus: "",
    subject: "",
    phase: "",
  });
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: "ascending" | "descending";
  }>({
    key: null,
    direction: "ascending",
  });

  const user = useCurrentUser();
  const userId = user?.id;
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // First fetch the teacher profile to get teacherId
  useEffect(() => {
    const fetchTeacherProfile = async () => {
      if (!userId) return;

      try {
        setIsLoading(true);
        const response = await fetch("/api/teacher-profile?userId=" + userId);
        if (!response.ok) {
          throw new Error("Failed to fetch teacher profile");
        }
        const teacherData = await response.json();

        if (teacherData.data && teacherData.data.id) {
          setTeacherId(teacherData.data.id);
        } else {
          throw new Error("Teacher profile data structure is invalid");
        }
      } catch (error) {
        console.error("Error fetching teacher profile:", error);
        setError("Failed to load teacher profile. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchTeacherProfile();
    }
  }, [userId]);

  // Fetch the students data using the teacherId
  useEffect(() => {
    const fetchStudents = async () => {
      if (!teacherId) return;

      try {
        setIsLoading(true);
        const response = await fetch(
          "/api/student-subject?teacherId=" + teacherId
        );
        if (!response.ok) {
          throw new Error("Failed to fetch students");
        }
        const studentsData = await response.json();

        // Create an array to hold all promises for student, subject, and phase details
        const detailsPromises = studentsData.map(
          async (studentSubject: any) => {
            const studentId = studentSubject.studentId;
            const subjectId = studentSubject.subjectId;
            const phaseId = studentSubject.phaseId;

            // Create an object to store results
            const result = {
              ...studentSubject,
              studentDetails: null,
              subjectDetails: null,
              phaseDetails: null,
            };

            // Fetch student details
            try {
              const studentDataResponse = await fetch(
                "/api/student-profile?id=" + studentId
              );
              if (studentDataResponse.ok) {
                const studentData = await studentDataResponse.json();
                result.studentDetails = studentData.data || studentData;
              }
            } catch (error) {
              console.error(
                `Error fetching details for student ${studentId}:`,
                error
              );
            }

            // Fetch subject details
            try {
              const subjectDataResponse = await fetch(
                "/api/subject?SubjectId=" + subjectId
              );
              if (subjectDataResponse.ok) {
                const subjectData = await subjectDataResponse.json();
                result.subjectDetails = subjectData.data || subjectData;
              }
            } catch (error) {
              console.error(
                `Error fetching details for subject ${subjectId}:`,
                error
              );
            }

            // Fetch phase details
            if (phaseId) {
              try {
                const phaseResponse = await fetch(`/api/phase?id=${phaseId}`);
                if (phaseResponse.ok) {
                  const phaseData = await phaseResponse.json();
                  result.phaseDetails = phaseData.data || phaseData;
                }
              } catch (error) {
                console.error(
                  `Error fetching phase details for phase ${phaseId}:`,
                  error
                );
              }
            }

            return result;
          }
        );

        // Wait for all details to be fetched
        const studentsWithDetails = await Promise.all(detailsPromises);
        setStudents(studentsWithDetails);
      } catch (error) {
        console.error("Error fetching students:", error);
        setError("Failed to load students. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (teacherId) {
      fetchStudents();
    }
  }, [teacherId]);

  useEffect(() => {
    // Apply filters and search
    let filtered = [...students];

    // Apply search term
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (student) =>
          student.studentDetails?.name
            ?.toLowerCase()
            .includes(lowerSearchTerm) ||
          student.studentDetails?.rollNo
            ?.toLowerCase()
            .includes(lowerSearchTerm) ||
          student.subjectDetails?.name
            ?.toLowerCase()
            .includes(lowerSearchTerm) ||
          student.subjectDetails?.code?.toLowerCase().includes(lowerSearchTerm)
      );
    }

    // Apply dropdown filters
    if (filters.verificationStatus) {
      filtered = filtered.filter(
        (student) => student.verificationStatus === filters.verificationStatus
      );
    }

    if (filters.subject) {
      filtered = filtered.filter(
        (student) => student.subjectDetails?.name === filters.subject
      );
    }

    if (filters.phase) {
      filtered = filtered.filter(
        (student) => student.phaseDetails?.name === filters.phase
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue, bValue;

        // Handle nested properties
        if (sortConfig.key && sortConfig.key.includes(".")) {
          const [parent, child] = sortConfig.key.split(".");
          aValue = a[parent]?.[child];
          bValue = b[parent]?.[child];
        } else {
          aValue = sortConfig.key ? a[sortConfig.key] : undefined;
          bValue = sortConfig.key ? b[sortConfig.key] : undefined;
        }

        // Handle string comparison
        if (typeof aValue === "string" && typeof bValue === "string") {
          if (sortConfig.direction === "ascending") {
            return aValue.localeCompare(bValue);
          } else {
            return bValue.localeCompare(aValue);
          }
        }

        // Handle other types
        if (aValue < bValue)
          return sortConfig.direction === "ascending" ? -1 : 1;
        if (aValue > bValue)
          return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }

    setFilteredStudents(filtered);
  }, [students, searchTerm, filters, sortConfig]);

  // Get unique values for filter dropdowns
  const getUniqueValues = (key: string, nestedKey: string | null = null) => {
    return [
      ...new Set(
        students
          .map((student) =>
            nestedKey ? student[key]?.[nestedKey] : student[key]
          )
          .filter(Boolean)
      ),
    ];
  };

  const uniqueStatuses = getUniqueValues("verificationStatus");
  const uniqueSubjects = getUniqueValues("subjectDetails", "name");
  const uniquePhases = getUniqueValues("phaseDetails", "name");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters({
      ...filters,
      [filterName]: value,
    });
  };

  const handleSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

 

  const handleReject = (student: any) => {
    setSelectedStudent(student);
    setShowRejectionModal(true);
  };

  const handleApprove = async (student: any) => {
  try {
    const response = await fetch("/api/student-subject?id=" + student?.id, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...student,
        verificationStatus: "APPROVED",
        approvedAt: new Date(),
        hasLogbookAccess: "true",
      }),
    });

    if (response.ok) {
      const updatedStudent = await response.json();
      
      // Preserve the nested details from the original student object
      const studentWithDetails = {
        ...updatedStudent,
        studentDetails: student.studentDetails,
        subjectDetails: student.subjectDetails,
        phaseDetails: student.phaseDetails,
      };

      setStudents((prev) =>
        prev.map((s) => (s.id === studentWithDetails.id ? studentWithDetails : s))
      );

      // Close modal if approval is happening from modal
      if (showProfileModal) {
        setShowProfileModal(false);
        setSelectedStudent(null);
      }
    } else {
      alert("Failed to approve the student");
    }
  } catch (error) {
    console.error("Error approving student:", error);
    alert("An error occurred while approving the student");
  }
};

const confirmReject = async () => {
  if (!rejectionReason.trim()) {
    alert("Please provide a reason for rejection");
    return;
  }

  try {
    const response = await fetch("/api/student-subject?id=" + selectedStudent.id, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...selectedStudent,
        verificationStatus: "REJECTED",
        rejectionReason: rejectionReason,
        hasLogbookAccess: "false",
      }),
    });

    if (response.ok) {
      const updatedStudent = await response.json();
      
      // Preserve the nested details from the original student object
      const studentWithDetails = {
        ...updatedStudent,
        studentDetails: selectedStudent.studentDetails,
        subjectDetails: selectedStudent.subjectDetails,
        phaseDetails: selectedStudent.phaseDetails,
      };

      setStudents((prev) =>
        prev.map((s) => (s.id === studentWithDetails.id ? studentWithDetails : s))
      );
      
      setShowRejectionModal(false);
      setRejectionReason("");
      setSelectedStudent(null);
      
      // Also close profile modal if it's open
      if (showProfileModal) {
        setShowProfileModal(false);
      }
    } else {
      alert("Failed to reject the student");
    }
  } catch (error) {
    console.error("Error rejecting student:", error);
    alert("An error occurred while rejecting the student");
  }
};



  const viewProfile = (student: any) => {
    setSelectedStudent(student);
    setShowProfileModal(true);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="w-full p-6 bg-gray-50">
      <h1 className="text-2xl font-bold mb-6">Student Subject Verification</h1>

      {/* Search and Filter Bar */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search by name, roll no, subject..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
            value={searchTerm}
            onChange={handleSearch}
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            className="border rounded-lg px-3 py-2"
            value={filters.verificationStatus}
            onChange={(e) =>
              handleFilterChange("verificationStatus", e.target.value)
            }
          >
            <option value="">All Statuses</option>
            {uniqueStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <select
            className="border rounded-lg px-3 py-2"
            value={filters.subject}
            onChange={(e) => handleFilterChange("subject", e.target.value)}
          >
            <option value="">All Subjects</option>
            {uniqueSubjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>

          <select
            className="border rounded-lg px-3 py-2"
            value={filters.phase}
            onChange={(e) => handleFilterChange("phase", e.target.value)}
          >
            <option value="">All Phases</option>
            {uniquePhases.map((phase) => (
              <option key={phase} value={phase}>
                {phase}
              </option>
            ))}
          </select>

          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            onClick={() =>
              setFilters({
                verificationStatus: "",
                subject: "",
                phase: "",
              })
            }
          >
            <Filter className="h-4 w-4" />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Excel-like Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("studentDetails.name")}
              >
                <div className="flex items-center">
                  Student Name
                  {sortConfig.key === "studentDetails.name" &&
                    (sortConfig.direction === "ascending" ? (
                      <SortAsc className="ml-1 h-4 w-4" />
                    ) : (
                      <SortDesc className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("studentDetails.rollNo")}
              >
                <div className="flex items-center">
                  Roll No.
                  {sortConfig.key === "studentDetails.rollNo" &&
                    (sortConfig.direction === "ascending" ? (
                      <SortAsc className="ml-1 h-4 w-4" />
                    ) : (
                      <SortDesc className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("subjectDetails.name")}
              >
                <div className="flex items-center">
                  Subject
                  {sortConfig.key === "subjectDetails.name" &&
                    (sortConfig.direction === "ascending" ? (
                      <SortAsc className="ml-1 h-4 w-4" />
                    ) : (
                      <SortDesc className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("subjectDetails.code")}
              >
                <div className="flex items-center">
                  Subject Code
                  {sortConfig.key === "subjectDetails.code" &&
                    (sortConfig.direction === "ascending" ? (
                      <SortAsc className="ml-1 h-4 w-4" />
                    ) : (
                      <SortDesc className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("phaseDetails.name")}
              >
                <div className="flex items-center">
                  Phase
                  {sortConfig.key === "phaseDetails.name" &&
                    (sortConfig.direction === "ascending" ? (
                      <SortAsc className="ml-1 h-4 w-4" />
                    ) : (
                      <SortDesc className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("verificationStatus")}
              >
                <div className="flex items-center">
                  Status
                  {sortConfig.key === "verificationStatus" &&
                    (sortConfig.direction === "ascending" ? (
                      <SortAsc className="ml-1 h-4 w-4" />
                    ) : (
                      <SortDesc className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("createdAt")}
              >
                <div className="flex items-center">
                  Request Date
                  {sortConfig.key === "createdAt" &&
                    (sortConfig.direction === "ascending" ? (
                      <SortAsc className="ml-1 h-4 w-4" />
                    ) : (
                      <SortDesc className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <Image
                          className="h-10 w-10 rounded-full cursor-pointer"
                          src={
                            student.studentDetails?.profilePhoto ||
                            "/api/placeholder/40/40"
                          }
                          width={40}
                          height={40}
                          alt=""
                          onClick={() => viewProfile(student)}
                        />
                      </div>
                      <div className="ml-4">
                        <div
                          className="text-sm font-medium text-gray-900 cursor-pointer"
                          onClick={() => viewProfile(student)}
                        >
                          {student.studentDetails?.name || "N/A"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {student.studentDetails?.email || "N/A"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.studentDetails?.rollNo || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.subjectDetails?.name || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.subjectDetails?.code || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.phaseDetails?.name || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${
                        student.verificationStatus === "APPROVED"
                          ? "bg-green-100 text-green-800"
                          : student.verificationStatus === "REJECTED"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {student.verificationStatus}
                    </span>
                    {student.verificationStatus === "REJECTED" &&
                      student.rejectionReason && (
                        <div className="text-xs text-red-600 mt-1">
                          Reason: {student.rejectionReason}
                        </div>
                      )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(student.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {student.verificationStatus === "PENDING" && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprove(student)}
                          className="text-green-600 hover:text-green-900 flex items-center gap-1"
                        >
                          <CheckCircle className="h-4 w-4" /> Approve
                        </button>
                        <button
                          onClick={() => handleReject(student)}
                          className="text-red-600 hover:text-red-900 flex items-center gap-1"
                        >
                          <XCircle className="h-4 w-4" /> Reject
                        </button>
                      </div>
                    )}
                    {student.verificationStatus === "APPROVED" && (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" /> Approved
                      </span>
                    )}
                    {student.verificationStatus === "REJECTED" && (
                      <span className="text-red-600 flex items-center gap-1">
                        <XCircle className="h-4 w-4" /> Rejected
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  No students found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              Reject Student Subject Request
            </h2>
            <p className="mb-4">
              Student: {selectedStudent?.studentDetails?.name}
              <br />
              Subject: {selectedStudent?.subjectDetails?.name} (
              {selectedStudent?.subjectDetails?.code})
            </p>
            <label className="block mb-2">
              Reason for rejection:
              <textarea
                className="w-full border rounded-lg p-2 mt-1"
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a detailed reason for rejection..."
              />
            </label>
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-4 py-2 border rounded-lg"
                onClick={() => {
                  setShowRejectionModal(false);
                  setRejectionReason("");
                  setSelectedStudent(null);
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
                onClick={confirmReject}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">Student Profile</h2>
              <button
                className="text-gray-400 hover:text-gray-600"
                onClick={() => {
                  setShowProfileModal(false);
                  setSelectedStudent(null);
                }}
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3 flex flex-col items-center">
                <Image
                  src={
                    selectedStudent?.studentDetails?.profilePhoto ||
                    "/api/placeholder/200/200"
                  }
                  alt="Student profile"
                  width={200}
                  height={200}
                  className="w-40 h-40 rounded-full object-cover mb-4"
                />
                <h3 className="text-lg font-semibold">
                  {selectedStudent?.studentDetails?.name}
                </h3>
                <p className="text-gray-500">
                  {selectedStudent?.studentDetails?.rollNo}
                </p>
              </div>

              <div className="md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-700">
                    Personal Information
                  </h4>
                  <div className="mt-2 space-y-1">
                    <p>
                      <span className="text-gray-500">Email:</span>{" "}
                      {selectedStudent?.studentDetails?.email || "N/A"}
                    </p>
                    <p>
                      <span className="text-gray-500">Mobile:</span>{" "}
                      {selectedStudent?.studentDetails?.mobileNo || "N/A"}
                    </p>
                    <p>
                      <span className="text-gray-500">Date of Birth:</span>{" "}
                      {selectedStudent?.studentDetails?.dateOfBirth
                        ? formatDate(selectedStudent.studentDetails.dateOfBirth)
                        : "N/A"}
                    </p>
                    <p>
                      <span className="text-gray-500">Marital Status:</span>{" "}
                      {selectedStudent?.studentDetails?.maritalStatus || "N/A"}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700">
                    Address Information
                  </h4>
                  <div className="mt-2 space-y-1">
                    <p>
                      <span className="text-gray-500">Address:</span>{" "}
                      {selectedStudent?.studentDetails?.Address || "N/A"}
                    </p>
                    <p>
                      <span className="text-gray-500">City:</span>{" "}
                      {selectedStudent?.studentDetails?.city || "N/A"}
                    </p>
                    <p>
                      <span className="text-gray-500">State:</span>{" "}
                      {selectedStudent?.studentDetails?.state || "N/A"}
                    </p>
                    <p>
                      <span className="text-gray-500">Country:</span>{" "}
                      {selectedStudent?.studentDetails?.country || "N/A"}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700">
                    Academic Information
                  </h4>
                  <div className="mt-2 space-y-1">
                    <p>
                      <span className="text-gray-500">Subject:</span>{" "}
                      {selectedStudent?.subjectDetails?.name || "N/A"} (
                      {selectedStudent?.subjectDetails?.code || "N/A"})
                    </p>
                    <p>
                      <span className="text-gray-500">Phase:</span>{" "}
                      {selectedStudent?.phaseDetails?.name || "N/A"}
                    </p>
                    <p>
                      <span className="text-gray-500">Year of Passing:</span>{" "}
                      {selectedStudent?.studentDetails?.yearOfPassing || "N/A"}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700">Request Status</h4>
                  <div className="mt-2 space-y-1">
                    <p>
                      <span className="text-gray-500">
                        Verification Status:
                      </span>
                      <span
                        className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded-full 
                        ${
                          selectedStudent?.verificationStatus === "APPROVED"
                            ? "bg-green-100 text-green-800"
                            : selectedStudent?.verificationStatus === "REJECTED"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {selectedStudent?.verificationStatus}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-500">Created Date:</span>{" "}
                      {formatDate(selectedStudent?.createdAt)}
                    </p>
                    <p>
                      <span className="text-gray-500">Logbook Access:</span>{" "}
                      {selectedStudent?.hasLogbookAccess === "true"
                        ? "Yes"
                        : "No"}
                    </p>
                    {selectedStudent?.rejectionReason && (
                      <p>
                        <span className="text-gray-500">Rejection Reason:</span>{" "}
                        {selectedStudent.rejectionReason}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                className="px-4 py-2 border rounded-lg"
                onClick={() => {
                  setShowProfileModal(false);
                  setSelectedStudent(null);
                }}
              >
                Close
              </button>

              {selectedStudent?.verificationStatus === "PENDING" && (
                <>
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-1"
                    onClick={() => handleApprove(selectedStudent)}
                  >
                    <CheckCircle className="h-4 w-4" /> Approve
                  </button>
                  <button
                    className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-1"
                    onClick={() => {
                      setShowProfileModal(false);
                      handleReject(selectedStudent);
                    }}
                  >
                    <XCircle className="h-4 w-4" /> Reject
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
