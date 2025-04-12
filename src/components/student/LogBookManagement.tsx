/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCurrentUser } from "@/hooks/auth";
import React, { useEffect, useState } from "react";

// UI Components
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  ArrowUpCircle,
  Check,
  Edit,
  Loader2,
  Plus,
  X,
} from "lucide-react";
import { LogBookFilters } from "../common/LogBookFilters";
import { FileDown, Printer } from "lucide-react";

// Types
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

interface Teacher {
  id: string;
  userId: string;
  name: string;
  email?: string;
}

interface FilterOption {
  id: string;
  name: string;
}

interface LogBookEntry {
  isEditing: any;
  target: any;
  remarks: string;
  isNew: any;
  id: string;
  studentId: string;
  teacherId: string;
  logBookTemplateId: string;
  status: string;
  studentRemarks?: string;
  teacherRemarks?: string;
  dynamicFields: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  template?: LogBookTemplate;
  teacher?: Teacher;
}

interface LoadingState {
  template: boolean;
  student: boolean;
  academicYears: boolean;
  batches: boolean;
  subjects: boolean;
  modules: boolean;
  teachers: boolean;
  entries: boolean;
  submit: boolean;
}

const LogBookManagement: React.FC = () => {
  // User and student details
  const user = useCurrentUser();
  const [studentDetails, setStudentDetails] = useState<{
    id: string;
    personalInfo?: Record<string, any>;
  } | null>(null);

  // Template and form state
  const [logBookTemplate, setLogBookTemplate] =
    useState<LogBookTemplate | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<LoadingState>({
    template: false,
    student: true,
    academicYears: true,
    batches: false,
    subjects: false,
    modules: false,
    teachers: true,
    entries: false,
    submit: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  // Teacher and remarks state
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  // Filter options
  const [academicYears, setAcademicYears] = useState<FilterOption[]>([]);
  const [batches, setBatches] = useState<FilterOption[]>([]);
  const [subjects, setSubjects] = useState<FilterOption[]>([]);
  const [modules, setModules] = useState<FilterOption[]>([]);

  // Selected filter values
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>("");
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedModule, setSelectedModule] = useState<string>("");

  const [submittingEntryId, setSubmittingEntryId] = useState<string | null>(
    null
  );
  // Entries table state
  const [entries, setEntries] = useState<LogBookEntry[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [activeTab, setActiveTab] = useState<string>("entries");

  // Fetch student details
  useEffect(() => {
    const fetchStudentDetails = async () => {
      if (!user) return;

      try {
        const response = await fetch(
          `/api/student-profile?byUserId=${user.id}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch student details");
        }

        const students = await response.json();

        if (students) {
          setStudentDetails(students);
        } else {
          throw new Error("No student found for this user");
        }
      } catch (err) {
        console.error("Student details fetch error:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading((prev) => ({ ...prev, student: false }));
      }
    };

    fetchStudentDetails();
  }, [user]);

  // Fetch teachers
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await fetch("/api/teacher-profile");
        if (!response.ok) {
          throw new Error("Failed to fetch teachers");
        }
        const data = await response.json();
        setTeachers(data);
      } catch (err) {
        console.error("Teachers fetch error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load teachers"
        );
      } finally {
        setLoading((prev) => ({ ...prev, teachers: false }));
      }
    };

    fetchTeachers();
  }, []);

  // Fetch filter options - Academic Years
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

  // Fetch log book template and entries when filters are complete
  useEffect(() => {
    const fetchLogBookTemplateAndEntries = async () => {
      if (
        !selectedAcademicYear ||
        !selectedBatch ||
        !selectedSubject ||
        !studentDetails?.id
      ) {
        return;
      }

      try {
        setLoading((prev) => ({ ...prev, template: true, entries: true }));

        // Fetch template
        let templateUrl =
          `/api/log-book-template?` +
          `academicYearId=${selectedAcademicYear}&` +
          `batchId=${selectedBatch}&` +
          `subjectId=${selectedSubject}`;

        if (selectedModule) {
          templateUrl += `&moduleId=${selectedModule}`;
        }

        const templateResponse = await fetch(templateUrl);

        if (!templateResponse.ok) {
          throw new Error(
            `Failed to fetch template: ${templateResponse.status}`
          );
        }

        const templates = await templateResponse.json();

        if (templates.length === 0) {
          setLogBookTemplate(null);
          setError("No template found for the selected filters");
        } else {
          const template = templates[0];

          if (!template.dynamicSchema || !template.dynamicSchema.groups) {
            throw new Error("Invalid template structure");
          }

          // Initialize form data with default values
          const initialFormData: Record<string, any> = {};
          template.dynamicSchema.groups.forEach((group: DynamicGroup) => {
            initialFormData[group.name] = {};
            group.fields.forEach((field: DynamicField) => {
              const fieldName = field.label.toLowerCase().replace(/\s+/g, "_");
              initialFormData[group.name][fieldName] = field.defaultValue || "";
            });
          });

          setLogBookTemplate(template);
          setFormData(initialFormData);
          setError(null);
        }

        // Fetch entries
        let entriesUrl =
          `/api/log-books?` +
          `studentId=${studentDetails.id}&` +
          `includeTemplate=true`;

        if (templates.length > 0) {
          entriesUrl += `&logBookTemplateId=${templates[0].id}`;
        }

        const entriesResponse = await fetch(entriesUrl);

        if (!entriesResponse.ok) {
          throw new Error(`Failed to fetch entries: ${entriesResponse.status}`);
        }

        const entriesData = await entriesResponse.json();
        setEntries(entriesData);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        setLogBookTemplate(null);
        setEntries([]);
      } finally {
        setLoading((prev) => ({ ...prev, template: false, entries: false }));
      }
    };

    fetchLogBookTemplateAndEntries();
  }, [
    selectedAcademicYear,
    selectedBatch,
    selectedSubject,
    selectedModule,
    studentDetails?.id,
  ]);

  const handleSubmit = (entry: LogBookEntry) => {
    // Prevent submission if already processing
    if (loading.submit) return;
    setSubmittingEntryId(entry.id);

    // Set loading state
    setLoading((prev) => ({ ...prev, submit: true }));

    // Create the payload for the API
    const payload = {
      logBookTemplateId: entry.logBookTemplateId || logBookTemplate?.id,
      studentId: entry.studentId || studentDetails?.id,
      teacherId: entry.teacherId || "",
      studentRemarks: entry.remarks || "",
      dynamicFields: entry.dynamicFields || {},
      status: "SUBMITTED", // Use DRAFT for initial save
    };

    // Determine if this is a new entry or editing an existing one
    const isNew = entry.isNew;

    // Define endpoint and method
    const method = isNew ? "POST" : "PUT";
    const endpoint = isNew
      ? "/api/log-books"
      : `/api/log-books/${entry.id.replace("temp-", "")}`;

    // Make the API request
    fetch(endpoint, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to save logbook entry");
        }
        return response.json();
      })
      .then((data) => {
        // On success, update the entry list
        if (isNew) {
          // Remove temporary entry and add real one from server
          const updatedEntries = entries.filter((e) => e.id !== entry.id);
          setEntries([...updatedEntries, { ...data, isEditing: false }]);
        } else {
          // Update the entry in the list
          const updatedEntries = entries.map((e) =>
            e.id === entry.id ? { ...data, isEditing: false } : e
          );
          setEntries(updatedEntries);
        }

        setSubmitSuccess(true);

        // Clear success message after 3 seconds
        setTimeout(() => setSubmitSuccess(false), 3000);
      })
      .catch((error) => {
        console.error("Error saving entry:", error);
        setError(error.message || "Failed to save entry");

        // Clear error after 3 seconds
        setTimeout(() => setError(null), 3000);
      })
      .finally(() => {
        setLoading((prev) => ({ ...prev, submit: false }));
      });
  };

  function renderField(
    group: DynamicGroup,
    field: DynamicField,
    entry: LogBookEntry
  ) {
    const groupName = group.name;
    const fieldName = field.label.toLowerCase().replace(/\s+/g, "_");

    // Common onChange handler for input fields
    const handleChange = (value: string) => {
      const newEntries = entries.map((e) => {
        if (e.id === entry.id) {
          // Ensure the group exists
          if (!e.dynamicFields[groupName]) {
            e.dynamicFields[groupName] = {};
          }
          // Update the specific field
          e.dynamicFields[groupName][fieldName] = value;
        }
        return e;
      });
      setEntries([...newEntries]);
    };

    // Get current field value
    const fieldValue = entry.dynamicFields?.[groupName]?.[fieldName] || "";

    switch (field.type) {
      case "text":
        return (
          <Input
            type="text"
            value={fieldValue}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full"
          />
        );

      case "number":
        return (
          <Input
            type="number"
            value={fieldValue}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full"
          />
        );

      case "textarea":
        return (
          <Textarea
            value={fieldValue}
            onChange={(e) => handleChange(e.target.value)}
            rows={2}
            className="w-full"
          />
        );

      case "select":
        return (
          <Select
            value={fieldValue}
            onValueChange={(value) => handleChange(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={`Select ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, index) => (
                <SelectItem
                  key={`${groupName}-${fieldName}-${index}`}
                  value={option}
                >
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "date":
        return (
          <Input
            type="date"
            value={fieldValue}
            onChange={(e) => handleChange(e.target.value)}
            max={new Date().toISOString().split("T")[0]}
            min={
              new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0]
            }
            className="w-full"
          />
        );

      case "file":
        return (
          <Input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleChange(file.name); // Just store filename for now
            }}
            className="w-full"
          />
        );

      default:
        return <div>Unsupported field type: {field.type}</div>;
    }
  }

  const sortData = (key: string) => {
    let direction: "asc" | "desc" = "asc";

    if (sortConfig && sortConfig.key === key) {
      direction = sortConfig.direction === "asc" ? "desc" : "asc";
    }

    setSortConfig({ key, direction });

    const sortedEntries = [...entries].sort((a, b) => {
      let aValue, bValue;

      const parts = key.split(".");

      // Handle static fields
      if (parts.length === 1) {
        if (key === "Created At") {
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
        } else if (
          ["Academic Year", "Batch", "Subject", "Module"].includes(key)
        ) {
          // Handle template fields
          switch (key) {
            case "Academic Year":
              aValue = a.template?.academicYear?.name || "";
              bValue = b.template?.academicYear?.name || "";
              break;
            case "Batch":
              aValue = a.template?.batch?.name || "";
              bValue = b.template?.batch?.name || "";
              break;
            case "Subject":
              aValue = a.template?.subject?.name || "";
              bValue = b.template?.subject?.name || "";
              break;
            case "Module":
              aValue = a.template?.module?.name || "";
              bValue = b.template?.module?.name || "";
              break;
            default:
              aValue = "";
              bValue = "";
          }
        }
      }
      // Handle nested fields
      else if (parts.length === 2) {
        const [group, field] = parts;

        aValue = a.dynamicFields?.[group]?.[field] || "";
        bValue = b.dynamicFields?.[group]?.[field] || "";

        // Handle date fields for sorting
        if (field.includes("date")) {
          if (typeof aValue === "string" && aValue.includes("T")) {
            aValue = new Date(aValue).getTime();
          }
          if (typeof bValue === "string" && bValue.includes("T")) {
            bValue = new Date(bValue).getTime();
          }
        }
      }

      if (typeof aValue === "string") aValue = aValue.toLowerCase();
      if (typeof bValue === "string") bValue = bValue.toLowerCase();

      if (aValue < bValue) return direction === "asc" ? -1 : 1;
      if (aValue > bValue) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setEntries(sortedEntries);
  };

  // Add this function to export the table data to Excel
  const exportToExcel = () => {
    if (!entries.length || !logBookTemplate) return;

    // Create headers from template fields
    const headers = [];

    // Add dynamic fields as headers
    logBookTemplate.dynamicSchema.groups.forEach((group) => {
      group.fields.forEach((field) => {
        headers.push(field.label);
      });
    });

    // Add other important columns
    headers.push("Supervisor", "Remarks", "Status");

    // Create rows for each entry
    const rows = entries.map((entry) => {
      const row = [];

      // Add dynamic field values
      logBookTemplate.dynamicSchema.groups.forEach((group) => {
        group.fields.forEach((field) => {
          const fieldName = field.label.toLowerCase().replace(/\s+/g, "_");
          row.push(entry.dynamicFields?.[group.name]?.[fieldName] || "");
        });
      });

      // Add other values
      const teacherName =
        teachers.find((t) => t.id === entry.teacherId)?.name || "-";
      row.push(teacherName, entry.remarks || "-", entry.status);

      return row;
    });

    // Create CSV content
    let csvContent = headers.join(",") + "\n";
    rows.forEach((row) => {
      // Ensure values with commas are properly quoted
      const formattedRow = row.map((cell) => {
        const cellStr = String(cell);
        return cellStr.includes(",") ? `"${cellStr}"` : cellStr;
      });
      csvContent += formattedRow.join(",") + "\n";
    });

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `logbook-entries-${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add this function to print the table
  const printTable = () => {
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      alert("Please allow popups to print the table");
      return;
    }

    // Basic styling for the printed page
    const tableHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          h1 { margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <h1>Logbook Entries</h1>
        <table>
          <thead>
            <tr>
              ${logBookTemplate?.dynamicSchema.groups
                .map((group) =>
                  group.fields
                    .map((field) => `<th>${field.label}</th>`)
                    .join("")
                )
                .join("")}
              <th>Supervisor</th>
              <th>Remarks</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${entries
              .map(
                (entry) => `
              <tr>
                ${logBookTemplate?.dynamicSchema.groups
                  .map((group) =>
                    group.fields
                      .map((field) => {
                        const fieldName = field.label
                          .toLowerCase()
                          .replace(/\s+/g, "_");
                        return `<td>${
                          entry.dynamicFields?.[group.name]?.[fieldName] || ""
                        }</td>`;
                      })
                      .join("")
                  )
                  .join("")}
                <td>${
                  teachers.find((t) => t.id === entry.teacherId)?.name || "-"
                }</td>
                <td>${entry.remarks || "-"}</td>
                <td>${entry.status}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(tableHTML);
    printWindow.document.close();

    // Wait for content to load before printing
    printWindow.onload = function () {
      printWindow.print();
      printWindow.close(); // Uncomment to automatically close after print dialog
    };
  };
  // Render
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Student Logbook</h1>

      {/* Filter Section */}
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

      {/* Status Messages */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {submitSuccess && (
        <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
          <Check className="h-4 w-4" />
          <AlertDescription>
            Logbook entry submitted successfully!
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content - Full Width */}
      <div className="flex space-x-2">
        {/* Only show export/print buttons when we have data */}
        {entries.length > 0 && (
          <>
            <Button
              variant="outline"
              onClick={exportToExcel}
              disabled={loading.entries || entries.length === 0}
            >
              <FileDown className="h-4 w-4 mr-2" />
              Export CSV
            </Button>

            <Button
              variant="outline"
              onClick={printTable}
              disabled={loading.entries || entries.length === 0}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </>
        )}

        {logBookTemplate && (
          <Button
            onClick={() => {
              // Create proper structure for new entry with dynamicFields
              const dynamicFields: Record<string, Record<string, any>> = {};

              // Initialize dynamic fields based on template structure
              logBookTemplate.dynamicSchema.groups.forEach((group) => {
                dynamicFields[group.name] = {};

                // Set sequence if available
                if (group.sequence !== undefined) {
                  dynamicFields[group.name]["_sequence"] = group.sequence;
                }

                // Initialize each field with default values
                group.fields.forEach((field) => {
                  const fieldName = field.label
                    .toLowerCase()
                    .replace(/\s+/g, "_");
                  if (field.type === "date") {
                    dynamicFields[group.name][fieldName] = new Date()
                      .toISOString()
                      .split("T")[0];
                  } else {
                    dynamicFields[group.name][fieldName] =
                      field.defaultValue || "";
                  }
                });
              });

              // Create complete new entry
              const newEntry = {
                id: `temp-${Date.now()}`,
                isNew: true,
                isEditing: true,
                studentId: studentDetails?.id || "",
                logBookTemplateId: logBookTemplate?.id || "",
                dynamicFields: dynamicFields,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                teacherId: "",
                remarks: "",
                status: "DRAFT",
                template: logBookTemplate,
              };

              // Add new entry at the TOP of the table
              setEntries([{ ...newEntry, target: null }, ...entries]);
            }}
            disabled={loading.template}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Entry
          </Button>
        )}
      </div>

      {loading.entries ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : entries.length > 0 ? (
        <Card>
          <div className="overflow-x-auto p-2">
            <Table>
              <TableHeader>
                <TableRow>
                  {/* Show only dynamic fields in the header, excluding system fields */}
                  {logBookTemplate?.dynamicSchema.groups.map((group) =>
                    group.fields.map((field) => {
                      const fieldName = field.label
                        .toLowerCase()
                        .replace(/\s+/g, "_");
                      const keyValue = `${group.name}-${fieldName}`; // Ensure unique keys

                      return (
                        <TableHead
                          key={keyValue}
                          className="whitespace-nowrap font-medium text-primary cursor-pointer"
                          onClick={() => sortData(`${group.name}.${fieldName}`)}
                        >
                          {field.label}
                          {sortConfig &&
                            sortConfig.key === `${group.name}.${fieldName}` && (
                              <span className="ml-1">
                                {sortConfig.direction === "asc" ? "↑" : "↓"}
                              </span>
                            )}
                        </TableHead>
                      );
                    })
                  )}
                  <TableHead>Supervisor</TableHead>
                  <TableHead>Remarks</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    {/* Render each dynamic field cell */}
                    {logBookTemplate?.dynamicSchema.groups.map((group) =>
                      group.fields.map((field) => {
                        const fieldName = field.label
                          .toLowerCase()
                          .replace(/\s+/g, "_");

                        return (
                          <TableCell
                            key={`${entry.id}-${group.name}-${fieldName}`}
                          >
                            {entry.isEditing
                              ? renderField(group, field, entry)
                              : // Display regular cell value when not editing
                                entry.dynamicFields?.[group.name]?.[
                                  fieldName
                                ] || ""}
                          </TableCell>
                        );
                      })
                    )}

                    {/* Supervisor Cell */}
                    <TableCell>
                      {entry.isEditing ? (
                        <Select
                          value={entry.teacherId || ""}
                          onValueChange={(value) => {
                            const newEntries = entries.map((e) =>
                              e.id === entry.id ? { ...e, teacherId: value } : e
                            );
                            setEntries([...newEntries]);
                          }}
                          disabled={loading.teachers}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Teacher" />
                          </SelectTrigger>
                          <SelectContent>
                            {teachers.map((teacher) => (
                              <SelectItem key={teacher.id} value={teacher.id}>
                                {teacher.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        teachers.find((t) => t.id === entry.teacherId)?.name ||
                        "-"
                      )}
                    </TableCell>

                    {/* Remarks Cell */}
                    <TableCell>
                      {entry.isEditing ? (
                        <Textarea
                          value={entry.remarks || ""}
                          onChange={(e) => {
                            const newEntries = entries.map((ent) =>
                              ent.id === entry.id
                                ? { ...ent, remarks: e.target.value }
                                : ent
                            );
                            setEntries([...newEntries]);
                          }}
                          placeholder="Any additional comments..."
                          rows={2}
                          className="w-full"
                        />
                      ) : (
                        entry.remarks || "-"
                      )}
                    </TableCell>

                    {/* Status Cell with Submit Functionality */}
                    <TableCell>
                      {entry.isEditing ? (
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (entry.isNew) {
                                // Remove the temporary entry if canceled
                                setEntries(
                                  entries.filter((e) => e.id !== entry.id)
                                );
                              } else {
                                // Just disable editing mode
                                const newEntries = entries.map((e) =>
                                  e.id === entry.id
                                    ? { ...e, isEditing: false }
                                    : e
                                );
                                setEntries([...newEntries]);
                              }
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSubmit(entry)}
                            disabled={loading.submit}
                          >
                            {loading.submit ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      ) : entry.status === "DRAFT" ? (
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant="outline"
                            className="cursor-pointer"
                            onClick={() => {
                              // Submit the entry
                              const updatedEntry = {
                                ...entry,
                                status: "SUBMITTED",
                              };
                              handleSubmit(updatedEntry);
                            }}
                          >
                            {loading.submit &&
                            entry.id === submittingEntryId ? (
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            ) : (
                              <ArrowUpCircle className="h-3 w-3 mr-1" />
                            )}
                            DRAFT (Click to Submit)
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // Enable editing mode for this entry
                              const newEntries = entries.map((e) =>
                                e.id === entry.id
                                  ? { ...e, isEditing: true }
                                  : e
                              );
                              setEntries([...newEntries]);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Badge variant="default">{entry.status}</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">
            No logbook entries found.
          </p>
          {logBookTemplate && (
            <Button
              onClick={() => {
                // Create proper structure for new entry with dynamicFields
                const dynamicFields: Record<string, Record<string, any>> = {};

                // Initialize dynamic fields based on template structure
                logBookTemplate.dynamicSchema.groups.forEach((group) => {
                  dynamicFields[group.name] = {};

                  // Set sequence if available
                  if (group.sequence !== undefined) {
                    dynamicFields[group.name]["_sequence"] = group.sequence;
                  }

                  // Initialize each field with default values
                  group.fields.forEach((field) => {
                    const fieldName = field.label
                      .toLowerCase()
                      .replace(/\s+/g, "_");
                    if (field.type === "date") {
                      dynamicFields[group.name][fieldName] = new Date()
                        .toISOString()
                        .split("T")[0];
                    } else {
                      dynamicFields[group.name][fieldName] =
                        field.defaultValue || "";
                    }
                  });
                });

                // Create complete new entry
                const newEntry = {
                  id: `temp-${Date.now()}`,
                  isNew: true,
                  isEditing: true,
                  studentId: studentDetails?.id || "",
                  logBookTemplateId: logBookTemplate?.id || "",
                  dynamicFields: dynamicFields,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  teacherId: "",
                  remarks: "",
                  status: "DRAFT",
                  template: logBookTemplate,
                };

                // Add the new entry to the list
                setEntries([{ ...newEntry, target: null }]);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create your first entry
            </Button>
          )}
        </Card>
      )}
    </div>
  );
};

export default LogBookManagement;
