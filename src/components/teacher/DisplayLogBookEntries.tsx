import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
// import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { ChevronsUpDown } from "lucide-react";

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

const DisplayLogBookEntries = () => {
  const [logBookEntries, setLogBookEntries] = useState<LogBookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<LogBookEntryStatus | "ALL">("ALL");
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRowExpansion = (entryId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [entryId]: !prev[entryId],
    }));
  };

  // Fetch log book entries with student data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const entriesResponse = await fetch("/api/log-books");
        if (!entriesResponse.ok) {
          throw new Error("Failed to fetch log book entries");
        }
        const entriesData = await entriesResponse.json();

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
        setLoading(false);
      } catch (error: any) {
        console.error("Error fetching data:", error);
        setError(error.message);
        setLoading(false);
        toast.error("Failed to load log book entries");
      }
    };

    fetchData();
  }, []);

  // Handle log book entry approval
  const handleApprove = async (entryId: string) => {
    try {
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
            ? { ...entry, status: LogBookEntryStatus.REVIEWED }
            : entry
        )
      );

      toast.success("Log book entry approved successfully");
    } catch (error: any) {
      console.error("Approval error:", error);
      toast.error(error.message || "Failed to approve log book entry");
    }
  };

  // Filter log book entries
  const filteredEntries = logBookEntries.filter((entry) => {
    if (filter === "ALL") return true;
    return entry.status === filter;
  });

  // Render loading state
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Log Book Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading entries...</p>
        </CardContent>
      </Card>
    );
  }

  // Render error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Log Book Entries</CardTitle>
          <div className="flex items-center space-x-4">
            <Select
              value={filter}
              onValueChange={(value: LogBookEntryStatus | "ALL") =>
                setFilter(value)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter Entries" />
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
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Roll No</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted Date</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEntries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No log book entries found
                </TableCell>
              </TableRow>
            ) : (
              filteredEntries.map((entry) => (
                <React.Fragment key={entry.id}>
                  <TableRow>
                    <TableCell>{entry.student?.name || "N/A"}</TableCell>
                    <TableCell>{entry.student?.rollNo || "N/A"}</TableCell>
                    <TableCell>{entry.student?.subject || "N/A"}</TableCell>
                    <TableCell>
                      <span
                        className={`
                          px-2 py-1 rounded-full text-xs font-bold
                          ${
                            entry.status === LogBookEntryStatus.DRAFT
                              ? "bg-yellow-100 text-yellow-800"
                              : entry.status === LogBookEntryStatus.SUBMITTED
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }
                        `}
                      >
                        {entry.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(entry.updatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRowExpansion(entry.id)}
                      >
                        <ChevronsUpDown className="h-4 w-4" />
                        <span className="sr-only">Toggle</span>
                      </Button>
                      {entry.status === LogBookEntryStatus.SUBMITTED && (
                        <Button
                          size="sm"
                          onClick={() => handleApprove(entry.id)}
                        >
                          Approve
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                  {expandedRows[entry.id] && (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          {Object.entries(entry.dynamicFields)
                            .filter(([section]) => section !== "personalInfo") // Filter out personalInfo
                            .map(([section, fields]) => (
                              <div key={section} className="mb-4">
                                <h4 className="font-medium capitalize mb-3">
                                  {section}
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  {Object.entries(
                                    fields as Record<string, any>
                                  ).map(([field, value]) => (
                                    <div
                                      key={field}
                                      className="bg-white p-3 rounded border"
                                    >
                                      <p className="text-sm font-medium capitalize">
                                        {field.replace(/_/g, " ")}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        {typeof value === "string" &&
                                        !isNaN(Date.parse(value))
                                          ? new Date(value).toLocaleDateString()
                                          : String(value)}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default DisplayLogBookEntries;
