/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCurrentUser } from "@/hooks/auth";
import React, { useEffect, useState } from "react";

// UI Components
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

// Icons
import {
  AlertCircle,
  Check,
  ChevronsUpDown,
  Loader2,
  Search,
} from "lucide-react";

export enum LogBookEntryStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  REVIEWED = "REVIEWED",
  ALL = "ALL",
}

export interface LogBookEntry {
  id: string;
  studentId: string;
  logBookTemplateId: string;
  status: LogBookEntryStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
  dynamicFields: Record<string, any>;
  studentRemarks: string | null;
  teacherRemarks: string | null;
  student?: StudentProfile;
  template?: LogBookTemplate;
}

export interface StudentProfile {
  id: string;
  name: string;
  rollNo: string;
  email: string;
  mobileNo: string;
  profilePhoto?: string;
  subject: string;
}

interface DynamicField {
  name: any;
  sequence: number;
  type: string;
  label: string;
  required: boolean;
  options?: string[];
  validationRegex?: string;
  defaultValue?: string;
}

interface DynamicGroup {
  sequence: number;
  name: string;
  fields: DynamicField[];
}

interface LogBookTemplate {
  id: string;
  name: string;
  description: string;
  dynamicSchema: {
    groups: DynamicGroup[];
  };
  academicYearId: string;
  batchId: string;
  moduleId: string;
  subjectId: string;
  createdAt: string;
  updatedAt: string;
  academicYear?: { id: string; name: string };
  batch?: { id: string; name: string };
  subject?: { id: string; name: string };
  module?: { id: string; name: string };
}

interface FilterOption {
  id: string;
  name: string;
}

interface LoadingState {
  entries: boolean;
  students: boolean;
  academicYears: boolean;
  batches: boolean;
  subjects: boolean;
  modules: boolean;
  approval: boolean;
}

const DisplayLogBookEntries = () => {
  // State for entries and filters
  const [logBookEntries, setLogBookEntries] = useState<LogBookEntry[]>([]);
  const [loading, setLoading] = useState<LoadingState>({
    entries: true,
    students: false,
    academicYears: true,
    batches: false,
    subjects: false,
    modules: false,
    approval: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [processingEntry, setProcessingEntry] = useState<string | null>(null);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<LogBookEntryStatus | "ALL">(
    "ALL"
  );
  const [academicYears, setAcademicYears] = useState<FilterOption[]>([]);
  const [batches, setBatches] = useState<FilterOption[]>([]);
  const [subjects, setSubjects] = useState<FilterOption[]>([]);
  const [modules, setModules] = useState<FilterOption[]>([]);

  // Selected filter values
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>("");
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedModule, setSelectedModule] = useState<string>("");
  const [teacherRemarks, setTeacherRemarks] = useState<Record<string, string>>(
    {}
  );

  // User context
  const user = useCurrentUser();
  const UserId = user?.id || "";
  const [teacherId, setTeacherId] = useState<string>("");

  // Toggle row expansion
  const toggleRowExpansion = (entryId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [entryId]: !prev[entryId],
    }));
  };

  useEffect(() => {
    const fetchTeacherProfile = async () => {
      if (!UserId) return;
    
      try {
        const response = await fetch("/api/teacher-profile?id=" + UserId);
        if (!response.ok) {
          throw new Error("Failed to fetch teacher profile");
        }
        const teacherData = await response.json();
        setTeacherId(teacherData[0].id); // This line assumes teacherData[0] exists
        console.log("Fetched teacher data:", teacherData);
      } catch (error) {
        console.error("Error fetching teacher profile:", error);
        alert("Failed to load teacher profile. Please try again.");
      }
    };

    if (UserId) {
      fetchTeacherProfile();
    }
  }, [UserId]);
  // Fetch academic years
  useEffect(() => {
    const fetchAcademicYears = async () => {
      try {
        const response = await fetch("/api/academicYears");
        if (response.ok) {
          const data = await response.json();
          setAcademicYears(data);
          if (data.length > 0) {
            setSelectedAcademicYear(data[0].id);
          }
        } else {
          console.error("Failed to fetch academic years");
        }
      } catch (error) {
        console.error("Error fetching academic years:", error);
      } finally {
        setLoading((prev) => ({ ...prev, academicYears: false }));
      }
    };

    fetchAcademicYears();
  }, []);

  // Fetch batches when academic year changes
  useEffect(() => {
    const fetchBatches = async () => {
      if (!selectedAcademicYear) {
        setBatches([]);
        setSelectedBatch("");
        setLoading((prev) => ({ ...prev, batches: false }));
        return;
      }

      try {
        setLoading((prev) => ({ ...prev, batches: true }));
        const response = await fetch(
          `/api/phase?academicYears=${selectedAcademicYear}`
        );
        if (response.ok) {
          const data = await response.json();
          setBatches(data);
          if (data.length > 0) {
            setSelectedBatch(data[0].id);
          } else {
            setSelectedBatch("");
          }
        } else {
          console.error("Failed to fetch batches");
        }
      } catch (error) {
        console.error("Error fetching batches:", error);
      } finally {
        setLoading((prev) => ({ ...prev, batches: false }));
      }
    };

    fetchBatches();
  }, [selectedAcademicYear]);

  // Fetch subjects when batch changes
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!selectedBatch) {
        setSubjects([]);
        setSelectedSubject("");
        setLoading((prev) => ({ ...prev, subjects: false }));
        return;
      }

      try {
        setLoading((prev) => ({ ...prev, subjects: true }));
        const response = await fetch(`/api/subject?PhaseId=${selectedBatch}`);
        if (response.ok) {
          const data = await response.json();
          setSubjects(data);
          if (data.length > 0) {
            setSelectedSubject(data[0].id);
          } else {
            setSelectedSubject("");
          }
        } else {
          console.error("Failed to fetch subjects");
        }
      } catch (error) {
        console.error("Error fetching subjects:", error);
      } finally {
        setLoading((prev) => ({ ...prev, subjects: false }));
      }
    };

    fetchSubjects();
  }, [selectedBatch]);

  // Fetch modules when subject changes
  useEffect(() => {
    const fetchModules = async () => {
      if (!selectedSubject) {
        setModules([]);
        setSelectedModule("");
        setLoading((prev) => ({ ...prev, modules: false }));
        return;
      }

      try {
        setLoading((prev) => ({ ...prev, modules: true }));
        const response = await fetch(
          `/api/module?subjectId=${selectedSubject}`
        );
        if (response.ok) {
          const data = await response.json();
          setModules(data);
          if (data.length > 0) {
            setSelectedModule(data[0].id);
          } else {
            setSelectedModule("");
          }
        } else {
          console.error("Failed to fetch modules");
        }
      } catch (error) {
        console.error("Error fetching modules:", error);
      } finally {
        setLoading((prev) => ({ ...prev, modules: false }));
      }
    };

    fetchModules();
  }, [selectedSubject]);

  // Fetch log book entries when filters change

  useEffect(() => {
    const fetchData = async () => {
      if (!teacherId) {
        console.error("Teacher ID is not set");
        return;
      }
      try {
        setLoading((prev) => ({ ...prev, entries: true }));

        const entriesResponse = await fetch(
          `/api/log-books?teacherId=${teacherId}`
        );
        if (!entriesResponse.ok) {
          throw new Error("Failed to fetch log book entries");
        }
        const entriesData = await entriesResponse.json();
        console.log("entriesData", entriesData);

        const enrichedEntries = await Promise.all(
          entriesData.map(async (entry: LogBookEntry) => {
            try {
              const studentResponse = await fetch(
                `/api/student-profile?id=${entry.studentId}`
              );
              const studentData = studentResponse.ok
                ? await studentResponse.json()
                : null;

              return {
                ...entry,
                student: studentData,
              };
            } catch (error) {
              console.error(
                `Error fetching student for entry ${entry.id}:`,
                error
              );
              return entry;
            }
          })
        );

        setLogBookEntries(enrichedEntries);
        setLoading((prev) => ({ ...prev, entries: false }));
      } catch (error: any) {
        console.error("Error fetching data:", error);
        setError(error.message);
        setLoading((prev) => ({ ...prev, entries: false }));
        // toast.error("Failed to load log book entries");
      }
    };

    fetchData();
  }, [teacherId]);

  // Handle log book entry approval
  const handleApprove = async (entryId: string) => {
    try {
      setProcessingEntry(entryId);
      setLoading((prev) => ({ ...prev, approval: true }));

      const entry = logBookEntries.find((e) => e.id === entryId);
      if (!entry) {
        throw new Error("Entry not found");
      }

      const response = await fetch(`/api/log-books?id=${entryId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: entryId,
          logBookTemplateId: entry.logBookTemplateId,
          studentId: entry.studentId,
          status: LogBookEntryStatus.REVIEWED,
          teacherRemarks: teacherRemarks[entryId] || "",
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(errorBody.error || "Failed to approve log book entry");
      }

      const updatedEntry = await response.json();

      setLogBookEntries((prevEntries) =>
        prevEntries.map((entry) =>
          entry.id === entryId
            ? { ...updatedEntry, student: entry.student }
            : entry
        )
      );

      setSuccessMessage("Log book entry approved successfully");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      console.error("Approval error:", error);
      setError(error.message || "Failed to approve log book entry");
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading((prev) => ({ ...prev, approval: false }));
      setProcessingEntry(null);
    }
  };

  // Function to check if a value is a valid date
  function isValidDate(value: any): boolean {
    if (typeof value !== "string") return false;

    if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
      const date = new Date(value);
      return !isNaN(date.getTime());
    }

    return false;
  }

  // Filter log book entries
  const filteredEntries = logBookEntries.filter((entry) => {
    if (statusFilter === "ALL") return true;
    return entry.status === statusFilter;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Log Book Reviews</h1>

      {/* Filter Section */}
      {/* <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div >
              <div>
                <LogBookFilters
                  academicYears={academicYears}
                  batches={batches}
                  subjects={subjects}
                  modules={modules}
                  selectedAcademicYear={selectedAcademicYear}
                  selectedBatch={selectedBatch}
                  selectedSubject={selectedSubject}
                  selectedModule={selectedModule}
                  onAcademicYearChange={setSelectedAcademicYear}
                  onBatchChange={setSelectedBatch}
                  onSubjectChange={setSelectedSubject}
                  onModuleChange={setSelectedModule}
                  loading={{
                    academicYears: loading.academicYears,
                    batches: loading.batches,
                    subjects: loading.subjects,
                    modules: loading.modules,
                  }}
                />
              </div>
              
              <div>
                <Select
                  value={statusFilter}
                  onValueChange={(value: LogBookEntryStatus | "ALL") => setStatusFilter(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Entries</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="SUBMITTED">Submitted</SelectItem>
                    <SelectItem value="REVIEWED">Reviewed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div> */}

      {/* Status Messages */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
          <Check className="h-4 w-4" />
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Entries Table */}
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Log Book Entries</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {loading.entries ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-8">
              <Search className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
              <p className="text-muted-foreground">No log book entries found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Roll No</TableHead>

                  <TableHead>Status</TableHead>
                  <TableHead>Submitted Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => (
                  <React.Fragment key={entry.id}>
                    <TableRow>
                      <TableCell className="font-medium">
                        {entry.student?.name || "N/A"}
                      </TableCell>
                      <TableCell>{entry.student?.rollNo || "N/A"}</TableCell>

                      <TableCell>
                        <Badge
                          variant={
                            entry.status === LogBookEntryStatus.DRAFT
                              ? "outline"
                              : entry.status === LogBookEntryStatus.SUBMITTED
                              ? "secondary"
                              : "default"
                          }
                        >
                          {entry.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleRowExpansion(entry.id)}
                        >
                          <ChevronsUpDown className="h-4 w-4" />
                          <span className="sr-only">Toggle Details</span>
                        </Button>
                        {entry.status === LogBookEntryStatus.SUBMITTED && (
                          <Button
                            size="sm"
                            onClick={() => handleApprove(entry.id)}
                            disabled={
                              loading.approval && processingEntry === entry.id
                            }
                          >
                            {loading.approval &&
                            processingEntry === entry.id ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <Check className="h-4 w-4 mr-2" />
                            )}
                            Approve
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                    {expandedRows[entry.id] && (
                      <TableRow>
                        <TableCell colSpan={8}>
                          <div className="p-4 bg-slate-50 rounded-lg">
                            {/* Dynamic Fields Section */}
                            {Object.entries(entry.dynamicFields)
                              .filter(([section]) => section !== "personalInfo")
                              .sort(
                                ([, a], [, b]) =>
                                  (a._sequence || 0) - (b._sequence || 0)
                              )
                              .map(([section, fields]) => {
                                const { _sequence, ...cleanFields } =
                                  fields as Record<string, any>;
                                return (
                                  <div key={section} className="mb-6">
                                    <h4 className="font-semibold text-lg mb-2 capitalize">
                                      {section.replace(/_/g, " ").trim()}
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      {Object.entries(cleanFields).map(
                                        ([field, value]) => (
                                          <div
                                            key={field}
                                            className="bg-white p-3 rounded border"
                                          >
                                            <p className="text-sm font-medium capitalize">
                                              {field.replace(/_/g, " ").trim()}
                                            </p>
                                            <p className="text-sm">
                                              {isValidDate(value)
                                                ? new Date(
                                                    value
                                                  ).toLocaleDateString()
                                                : String(value)}
                                            </p>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                );
                              })}

                            {/* Remarks Section */}
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Student Remarks */}
                              <div>
                                <h4 className="font-semibold mb-2">
                                  Student Remarks
                                </h4>
                                <div className="p-3 bg-white rounded border min-h-24">
                                  {entry.studentRemarks ||
                                    "No remarks provided"}
                                </div>
                              </div>

                              {/* Teacher Remarks */}
                              <div>
                                <h4 className="font-semibold mb-2">
                                  Teacher Remarks
                                </h4>
                                {entry.status ===
                                LogBookEntryStatus.REVIEWED ? (
                                  <div className="p-3 bg-white rounded border min-h-24">
                                    {entry.teacherRemarks ||
                                      "No remarks provided"}
                                  </div>
                                ) : (
                                  <Textarea
                                    placeholder="Add your remarks here..."
                                    className="min-h-24"
                                    value={teacherRemarks[entry.id] || ""}
                                    onChange={(e) => {
                                      setTeacherRemarks((prev) => ({
                                        ...prev,
                                        [entry.id]: e.target.value,
                                      }));
                                    }}
                                  />
                                )}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            {entry.status === LogBookEntryStatus.SUBMITTED && (
                              <div className="mt-4 flex justify-end">
                                <Button
                                  onClick={() => handleApprove(entry.id)}
                                  disabled={
                                    loading.approval &&
                                    processingEntry === entry.id
                                  }
                                >
                                  {loading.approval &&
                                  processingEntry === entry.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  ) : (
                                    <Check className="h-4 w-4 mr-2" />
                                  )}
                                  Approve Entry
                                </Button>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DisplayLogBookEntries;
