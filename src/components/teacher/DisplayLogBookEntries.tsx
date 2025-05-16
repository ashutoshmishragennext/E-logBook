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
  X,
} from "lucide-react";

export enum LogBookEntryStatus {
  SUBMITTED = "SUBMITTED",
  REVIEWED = "REVIEWED",
  REJECTED = "REJECTED", // Added new status for rejected entries
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
  logBookTemplate?: LogBookTemplate;
  teacherId?: string;
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
  fieldName: string;
  fieldType: string;
  fieldLabel: string;
  isRequired: boolean;
  options?: string[];
}

interface DynamicSchema {
  groups: {
    groupName: string;
    fields: DynamicField[];
  }[];
}

interface LogBookTemplate {
  id: string;
  name: string;
  description: string;
  dynamicSchema: DynamicSchema;
  templateType: string;
  academicYearId: string | null;
  batchId: string | null;
  subjectId: string | null;
  createdAt: string;
  updatedAt: string;
}

const DisplayLogBookEntries = () => {
  // State for entries
  const [logBookEntries, setLogBookEntries] = useState<LogBookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [processingEntry, setProcessingEntry] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<LogBookEntryStatus | "ALL">("ALL");
  const [teacherRemarks, setTeacherRemarks] = useState<Record<string, string>>({});

  // User context
  const user = useCurrentUser();
  const userId = user?.id || "";
  const [teacherId, setTeacherId] = useState<string | null>(null);

  // Toggle row expansion
  const toggleRowExpansion = (entryId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [entryId]: !prev[entryId],
    }));
  };

  // Fetch teacher profile
  useEffect(() => {
    const fetchTeacherProfile = async () => {
      if (!userId) return;

      try {
        const response = await fetch(`/api/teacher-profile?userId=${userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch teacher profile");
        }

        const result = await response.json();
        const teacherData = result.data;

        if (teacherData && teacherData.id) {
          setTeacherId(teacherData.id);
        } else {
          console.warn("No teacher ID found in response");
        }

        console.log("Fetched teacher data:", teacherData);
      } catch (error) {
        console.error("Error fetching teacher profile:", error);
        setError("Failed to load teacher profile. Please try again.");
      }
    };

    if (userId) fetchTeacherProfile();
  }, [userId]);

  // Fetch log book entries with student & template info
  useEffect(() => {
    const fetchLogBookEntries = async () => {
      if (!teacherId) return;

      setLoading(true);
      try {
        const response = await fetch(`/api/log-books?teacherId=${teacherId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch log book entries");
        }

        const entries = await response.json();

        // Fetch student and template data for each entry
        const entriesWithDetails = await Promise.all(
          entries.map(async (entry: LogBookEntry) => {
            try {
              // Fetch student data
              const studentResponse = await fetch(`/api/student-profile?id=${entry.studentId}`);
              const studentData = studentResponse.ok ? await studentResponse.json() : null;

              // Fetch template data if needed
              let templateData = entry.logBookTemplate;
              if (!templateData && entry.logBookTemplateId) {
                const templateResponse = await fetch(`/api/log-book-template?id=${entry.logBookTemplateId}`);
                if (templateResponse.ok) {
                  const templates = await templateResponse.json();
                  templateData = templates[0] || null;
                }
              }

              return {
                ...entry,
                student: studentData,
                logBookTemplate: templateData,
              };
            } catch (error) {
              console.error(`Error fetching details for entry ${entry.id}:`, error);
              return entry;
            }
          })
        );

        setLogBookEntries(entriesWithDetails);
        console.log("Detailed log book entries:", entriesWithDetails);
      } catch (error: any) {
        console.error("Error fetching log book entries:", error);
        setError(error.message || "Failed to load log book entries");
      } finally {
        setLoading(false);
      }
    };

    if (teacherId) fetchLogBookEntries();
  }, [teacherId]);

  // Handle log book entry approval
  const handleApprove = async (entryId: string) => {
    try {
      setProcessingEntry(entryId);

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
            ? { ...entry, status: LogBookEntryStatus.REVIEWED, teacherRemarks: teacherRemarks[entryId] || "" }
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
      setProcessingEntry(null);
    }
  };

  // Handle log book entry rejection
  const handleReject = async (entryId: string) => {
    try {
      setProcessingEntry(entryId);

      const entry = logBookEntries.find((e) => e.id === entryId);
      if (!entry) {
        throw new Error("Entry not found");
      }

      // Ensure teacher remarks are provided before rejection
      if (!teacherRemarks[entryId] || teacherRemarks[entryId].trim() === "") {
        alert("Please provide feedback in the Teacher Remarks field before rejecting");
        return
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
          status: LogBookEntryStatus.REJECTED,
          teacherRemarks: teacherRemarks[entryId] || "",
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(errorBody.error || "Failed to reject log book entry");
      }

      const updatedEntry = await response.json();

      setLogBookEntries((prevEntries) =>
        prevEntries.map((entry) =>
          entry.id === entryId
            ? { ...entry, status: LogBookEntryStatus.REJECTED, teacherRemarks: teacherRemarks[entryId] || "" }
            : entry
        )
      );

      setSuccessMessage("Log book entry rejected successfully");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      console.error("Rejection error:", error);
      setError(error.message || "Failed to reject log book entry");
      setTimeout(() => setError(null), 3000);
    } finally {
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

  // Function to render dynamic fields
  const renderDynamicFields = (entry: LogBookEntry) => {
    if (!entry.dynamicFields) return null;

    return (
      <>
        {Object.entries(entry.dynamicFields).map(([fieldName, value]) => {
          // Try to find the field label if template is available
          let fieldLabel = fieldName;
          if (entry.logBookTemplate?.dynamicSchema?.groups) {
            for (const group of entry.logBookTemplate.dynamicSchema.groups) {
              const field = group.fields.find(f => f.fieldName === fieldName);
              if (field) {
                fieldLabel = field.fieldLabel;
                break;
              }
            }
          }
          
          // Format display value appropriately
          let displayValue = value;
          
          // Handle file URLs (just display as "File Uploaded")
          if (typeof value === 'string' && value.startsWith('https://')) {
            displayValue = <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View File</a>;
          }
          // Handle dates
          else if (isValidDate(value)) {
            displayValue = new Date(value).toLocaleDateString();
          }
          
          return (
            <div key={fieldName} className="bg-white p-3 rounded border">
              <p className="text-sm font-medium">{fieldLabel}</p>
              <p className="text-sm">{displayValue}</p>
            </div>
          );
        })}
      </>
    );
  };

  // Get badge variant based on status
  const getBadgeVariant = (status: LogBookEntryStatus) => {
    switch (status) {
      case LogBookEntryStatus.SUBMITTED:
        return "secondary";
      case LogBookEntryStatus.REVIEWED:
        return "default";
      case LogBookEntryStatus.REJECTED:
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="container mx-auto p-2">
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
            <div className="flex gap-2 flex-wrap">
              <Button 
                variant={statusFilter === "ALL" ? "default" : "outline"}
                onClick={() => setStatusFilter("ALL")}
                size="sm"
              >
                All
              </Button>
              <Button 
                variant={statusFilter === "SUBMITTED" ? "default" : "outline"}
                onClick={() => setStatusFilter("SUBMITTED" as LogBookEntryStatus)}
                size="sm"
              >
                Submitted
              </Button>
              <Button 
                variant={statusFilter === "REVIEWED" ? "default" : "outline"}
                onClick={() => setStatusFilter("REVIEWED" as LogBookEntryStatus)}
                size="sm"
              >
                Reviewed
              </Button>
              <Button 
                variant={statusFilter === "REJECTED" ? "default" : "outline"}
                onClick={() => setStatusFilter("REJECTED" as LogBookEntryStatus)}
                size="sm"
              >
                Rejected
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
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
                  <TableHead>Template</TableHead>
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
                      <TableCell>{entry.logBookTemplate?.name || "N/A"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={getBadgeVariant(entry.status)}
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
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleApprove(entry.id)}
                              disabled={processingEntry === entry.id}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {processingEntry === entry.id ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <Check className="h-4 w-4 mr-2" />
                              )}
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(entry.id)}
                              disabled={processingEntry === entry.id}
                            >
                              {processingEntry === entry.id ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <X className="h-4 w-4 mr-2" />
                              )}
                              Reject
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                    {expandedRows[entry.id] && (
                      <TableRow>
                        <TableCell colSpan={8}>
                          <div className="p-4 bg-slate-50 rounded-lg">
                            {/* Template information */}
                            {entry.logBookTemplate && (
                              <div className="mb-4">
                                <h4 className="font-semibold text-lg mb-2">
                                  {entry.logBookTemplate.name}
                                </h4>
                                <p className="text-sm text-gray-600 mb-4">
                                  {entry.logBookTemplate.description}
                                </p>
                              </div>
                            )}
                            
                            {/* Dynamic Fields Section */}
                            <div className="mb-6">
                              <h4 className="font-semibold text-lg mb-2">Form Fields</h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {renderDynamicFields(entry)}
                              </div>
                            </div>

                            {/* Remarks Section */}
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Student Remarks */}
                              <div>
                                <h4 className="font-semibold mb-2">
                                  Student Remarks
                                </h4>
                                <div className="p-3 bg-white rounded border min-h-24">
                                  {entry.studentRemarks || "No remarks provided"}
                                </div>
                              </div>

                              {/* Teacher Remarks */}
                              <div>
                                <h4 className="font-semibold mb-2">
                                  Teacher Remarks {entry.status === LogBookEntryStatus.SUBMITTED && <span className="text-red-500 text-xs">*Required for rejection</span>}
                                </h4>
                                {entry.status === LogBookEntryStatus.REVIEWED || entry.status === LogBookEntryStatus.REJECTED ? (
                                  <div className="p-3 bg-white rounded border min-h-24">
                                    {entry.teacherRemarks || "No remarks provided"}
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
                              <div className="mt-4 flex justify-end gap-4">
                                <Button
                                  onClick={() => handleApprove(entry.id)}
                                  disabled={processingEntry === entry.id}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  {processingEntry === entry.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  ) : (
                                    <Check className="h-4 w-4 mr-2" />
                                  )}
                                  Approve Entry
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => handleReject(entry.id)}
                                  disabled={processingEntry === entry.id}
                                >
                                  {processingEntry === entry.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  ) : (
                                    <X className="h-4 w-4 mr-2" />
                                  )}
                                  Reject Entry
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