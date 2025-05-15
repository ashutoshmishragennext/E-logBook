/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  TableRow
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentUser } from "@/hooks/auth";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Download } from "lucide-react";
import React, { useEffect, useState } from "react";
import * as XLSX from 'xlsx';

// Constants for template selection
const ACADEMIC_YEAR_ID = "2f8ab354-1f21-4d0f-ad41-87a39e44b0be";
const BATCH_ID = "86f6cdd7-281c-4eba-b423-e835360b012e";
const MODULE_ID = "13f35a6b-2c2a-4386-b99e-d5685127afe2";
const SUBJECT_ID = "e92e5996-bfcc-4097-8605-63dd00f4156c";

// Interfaces for type safety
interface DynamicField {
  type: string;
  label: string;
  required: boolean;
  options?: string[];
  validationRegex?: string;
  defaultValue?: string;
}

interface DynamicGroup {
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
}

const LogBookEntries: React.FC = () => {
  // State management
  const [logBookTemplate, setLogBookTemplate] = useState<LogBookTemplate | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [studentDetails, setStudentDetails] = useState<{
    id: string;
    personalInfo?: Record<string, any>;
  } | null>(null);
  const user = useCurrentUser();
  useEffect(() => {
    const fetchStudentDetails = async () => {
      if (!user) return;

      try {
        const response = await fetch(`/api/student-profile?byUserId=${user.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch student details');
        }

        const students = await response.json();
        
        if (students) {
          setStudentDetails(students);
        } else {
          throw new Error('No student found for this user');
        }
      } catch (err) {
        console.error('Student details fetch error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    fetchStudentDetails();
  }, [user]);
  // Fetch log book template
  const fetchLogBookTemplate = async () => {
    try {
      const response = await fetch(
        `/api/log-book-template?` +
          `academicYearId=${ACADEMIC_YEAR_ID}&` +
          `batchId=${BATCH_ID}&` +
          `subjectId=${SUBJECT_ID}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const templates = await response.json();
      console.log("Fetched templates:", templates);

      if (templates.length === 0) {
        throw new Error("No templates found");
      }

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
          if (field.defaultValue) {
            initialFormData[group.name][fieldName] = field.defaultValue;
          } else {
            initialFormData[group.name][fieldName] = "";
          }
        });
      });

      setLogBookTemplate(template);
      setFormData(initialFormData);
      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      setLoading(false);
    }
  };

  // Validation of individual fields
  const validateField = (field: DynamicField, value: any): string | null => {
    if (field.required && !value) {
      return `${field.label} is required`;
    }

    if (field.validationRegex && value) {
      const regex = new RegExp(field.validationRegex);
      if (!regex.test(value)) {
        return `${field.label} format is invalid`;
      }
    }

    return null;
  };

  // Handle input changes
  const handleInputChange = (
    groupName: string,
    fieldName: string,
    value: any,
    fieldType: string
  ) => {
    const updatedFormData = {
      ...formData,
      [groupName]: {
        ...formData[groupName],
        [fieldName]: value,
      },
    };

    setFormData(updatedFormData);

    const field = logBookTemplate?.dynamicSchema.groups
      .find((g) => g.name === groupName)
      ?.fields.find(
        (f) => f.label.toLowerCase().replace(/\s+/g, "_") === fieldName
      );

    if (field) {
      const error = validateField(field, value);
      setErrors((prev) => ({
        ...prev,
        [`${groupName}.${fieldName}`]: error || "",
      }));
    }
  };

  // Handle file changes
  const handleFileChange = (
    groupName: string,
    fieldName: string,
    file: File
  ) => {
    setSelectedFiles((prev) => ({
      ...prev,
      [`${groupName}.${fieldName}`]: file,
    }));
    handleInputChange(groupName, fieldName, file.name, "file");
  };

  // Submit form data
  const handleSubmit = async () => {
    // Validate inputs and check for errors (previous validation logic)
    if (!logBookTemplate || !studentDetails) return;

    const validationErrors: Record<string, string> = {};
    let hasErrors = false;

    logBookTemplate.dynamicSchema.groups.forEach((group) => {
      group.fields.forEach((field) => {
        const fieldName = field.label.toLowerCase().replace(/\s+/g, "_");
        const value = formData[group.name]?.[fieldName];
        const error = validateField(field, value);
        if (error) {
          validationErrors[`${group.name}.${fieldName}`] = error;
          hasErrors = true;
        }
      });
    });

    setErrors(validationErrors);
    if (hasErrors) return;

    try {
      // Prepare dynamic fields with student information
      const dynamicFieldsWithStudentInfo = {
        ...formData,
        personalInfo: {
          ...formData.personalInfo,
          studentId: studentDetails.id,
          userId: user?.id,
          name: studentDetails.personalInfo?.name || user?.name,
        }
      };

      const payload = {
        logBookTemplateId: logBookTemplate.id,
        studentId: studentDetails.id,
        dynamicFields: dynamicFieldsWithStudentInfo,
        status: 'SUBMITTED'
      };

      const response = await fetch("/api/log-books", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Submission failed");
      }

      alert("Submitted successfully!");
      setFormData({});
      setSelectedFiles({});
    } catch (err) {
      console.error("Submission error:", err);
      alert(err instanceof Error ? err.message : "Submission failed. Please try again.");
    }
  };
  // Excel export
  const exportToExcel = () => {
    if (!logBookTemplate) return;

    const flattenedData: Record<string, any> = {};
    
    logBookTemplate.dynamicSchema.groups.forEach((group) => {
      group.fields.forEach((field) => {
        const fieldName = field.label.toLowerCase().replace(/\s+/g, "_");
        const value = formData[group.name]?.[fieldName] || '';
        
        const columnName = `${group.name} - ${field.label}`;
        flattenedData[columnName] = value;
      });
    });

    const worksheet = XLSX.utils.json_to_sheet([flattenedData]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Log Book Entry");
    
    XLSX.writeFile(workbook, `LogBookEntry_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Render field based on type
  const renderField = (group: DynamicGroup, field: DynamicField) => {
    const groupName = group.name;
    const fieldName = field.label.toLowerCase().replace(/\s+/g, "_");
    const errorKey = `${groupName}.${fieldName}`;
    const fieldValue = formData[groupName]?.[fieldName] || "";

    const commonProps = {
      id: `${groupName}-${fieldName}`,
      required: field.required,
      className: cn(
        errors[errorKey] && "border-red-500 focus-visible:ring-red-500"
      ),
    };

    const renderError = () =>
      errors[errorKey] && (
        <p className="text-red-500 text-sm">{errors[errorKey]}</p>
      );

    switch (field.type) {
      case "text":
        return (
          <div className="space-y-2">
            <Label htmlFor={commonProps.id}>{field.label}</Label>
            <Input
              {...commonProps}
              type="text"
              value={fieldValue}
              onChange={(e) =>
                handleInputChange(groupName, fieldName, e.target.value, "text")
              }
            />
            {renderError()}
          </div>
        );

      case "number":
        return (
          <div className="space-y-2">
            <Label htmlFor={commonProps.id}>{field.label}</Label>
            <Input
              {...commonProps}
              type="number"
              value={fieldValue}
              onChange={(e) =>
                handleInputChange(
                  groupName,
                  fieldName,
                  e.target.value,
                  "number"
                )
              }
            />
            {renderError()}
          </div>
        );

      case "textarea":
        return (
          <div className="space-y-2">
            <Label htmlFor={commonProps.id}>{field.label}</Label>
            <Textarea
              {...commonProps}
              value={fieldValue}
              onChange={(e) =>
                handleInputChange(
                  groupName,
                  fieldName,
                  e.target.value,
                  "textarea"
                )
              }
            />
            {renderError()}
          </div>
        );

      case "select":
        return (
          <div className="space-y-2">
            <Label>{field.label}</Label>
            <Select
              value={fieldValue}
              onValueChange={(value) =>
                handleInputChange(groupName, fieldName, value, "select")
              }
            >
              <SelectTrigger className={commonProps.className}>
                <SelectValue placeholder={`Select ${field.label}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option, optionIndex) => (
                  <SelectItem
                    key={`option-${groupName}-${fieldName}-${optionIndex}`}
                    value={option}
                  >
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {renderError()}
          </div>
        );

      case "date":
        return (
          <div className="space-y-2">
            <Label>{field.label}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !fieldValue && "text-muted-foreground",
                    commonProps.className
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {fieldValue ? (
                    format(new Date(fieldValue), "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={fieldValue ? new Date(fieldValue) : undefined}
                  onSelect={(date) =>
                    handleInputChange(
                      groupName,
                      fieldName,
                      date?.toISOString(),
                      "date"
                    )
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {renderError()}
          </div>
        );

      case "file":
        return (
          <div className="space-y-2">
            <Label htmlFor={commonProps.id}>{field.label}</Label>
            <Input
              {...commonProps}
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileChange(groupName, fieldName, file);
              }}
            />
            {selectedFiles[errorKey] && (
              <p className="text-sm text-muted-foreground">
                Selected: {selectedFiles[errorKey].name}
              </p>
            )}
            {renderError()}
          </div>
        );

      default:
        return (
          <div className="space-y-2">
            <Label>
              {field.label} (Unsupported type: {field.type})
            </Label>
            {renderError()}
          </div>
        );
    }
  };

  // Lifecycle hook to fetch template
  useEffect(() => {
    fetchLogBookTemplate();
  }, []);

  // Render loading state
  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex justify-center items-center h-64">
          <p>Loading...</p>
        </CardContent>
      </Card>
    );
  }

  // Render error state
  if (error) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex justify-center items-center h-64">
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  // Render no template found state
  if (!logBookTemplate) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex justify-center items-center h-64">
          <p>No template found</p>
        </CardContent>
      </Card>
    );
  }

  // Main render method
    return (
      <div className="w-full max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold">
              {logBookTemplate ? logBookTemplate.name : "Loading Template"}
            </h2>
            {logBookTemplate?.description && (
              <p className="text-sm text-muted-foreground">
                {logBookTemplate.description}
              </p>
            )}
          </div>
          <Button 
            variant="outline" 
            onClick={exportToExcel}
            disabled={!logBookTemplate}
          >
            <Download className="mr-2 h-4 w-4" /> Export to Excel
          </Button>
        </div>
  
        {logBookTemplate?.dynamicSchema?.groups && 
         logBookTemplate.dynamicSchema.groups.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Group</TableHead>
                <TableHead>Field Name</TableHead>
                <TableHead>Input</TableHead>
                <TableHead>Validation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logBookTemplate.dynamicSchema.groups.map((group, groupIndex) => (
                <>
                  {group.fields.map((field, fieldIndex) => (
                    <TableRow 
                      key={`field-${groupIndex}-${fieldIndex}-${field.label}`}
                    >
                      {fieldIndex === 0 && (
                        <TableCell 
                          rowSpan={group.fields.length} 
                          className="font-medium border-r"
                        >
                          {group.name}
                        </TableCell>
                      )}
                      <TableCell>{field.label}</TableCell>
                      <TableCell>
                        {renderField(group, field)}
                      </TableCell>
                      <TableCell>
                        {errors[`${group.name}.${field.label.toLowerCase().replace(/\s+/g, "_")}`] && (
                          <span className="text-red-500 text-sm">
                            {errors[`${group.name}.${field.label.toLowerCase().replace(/\s+/g, "_")}`]}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center text-muted-foreground">No form fields available</p>
        )}
  
        <div className="mt-6">
          <Button 
            onClick={handleSubmit} 
            className="w-full" 
            size="lg"
          >
            Submit Entry
          </Button>
        </div>
      </div>
    );
  };
  


export default LogBookEntries;





// import React, { useEffect, useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Calendar } from "@/components/ui/calendar";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Textarea } from "@/components/ui/textarea";
// import { 
//   Table, 
//   TableBody, 
//   TableCell, 
//   TableHeader, 
//   TableHead, 
//   TableRow 
// } from "@/components/ui/table";
// import { format } from "date-fns";
// import { Calendar as CalendarIcon, Download, Plus, Trash2 } from "lucide-react";
// import * as XLSX from 'xlsx';
// import { useCurrentUser } from "@/hooks/auth";

// // Constants
// const ACADEMIC_YEAR_ID = "2f8ab354-1f21-4d0f-ad41-87a39e44b0be";
// const BATCH_ID = "86f6cdd7-281c-4eba-b423-e835360b012e";
// const MODULE_ID = "13f35a6b-2c2a-4386-b99e-d5685127afe2";
// const SUBJECT_ID = "e92e5996-bfcc-4097-8605-63dd00f4156c";

// // Interfaces
// interface DynamicField {
//   type: string;
//   label: string;
//   required: boolean;
//   options?: string[];
//   validationRegex?: string;
//   defaultValue?: string;
// }

// interface DynamicGroup {
//   name: string;
//   fields: DynamicField[];
// }

// interface LogBookTemplate {
//   id: string;
//   name: string;
//   description: string;
//   dynamicSchema: {
//     groups: DynamicGroup[];
//   };
//   academicYearId: string;
//   batchId: string;
//   moduleId: string;
//   subjectId: string;
// }

// interface StudentDetails {
//   id: string;
//   name: string;
//   email: string;
// }

// const LogBookEntries: React.FC = () => {
//   // State Management
//   const [template, setTemplate] = useState<LogBookTemplate | null>(null);
//   const [dynamicRows, setDynamicRows] = useState<Record<string, any>[]>([]);
//   const [errors, setErrors] = useState<Record<string, string>>({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [studentDetails, setStudentDetails] = useState<StudentDetails | null>(null);
//   const user = useCurrentUser();

//   // Fetch Template
//   const fetchLogBookTemplate = async () => {
//     try {
//       const response = await fetch(
//         `/api/log-book-template?` +
//         `academicYearId=${ACADEMIC_YEAR_ID}&` +
//         `batchId=${BATCH_ID}&` +
//         `subjectId=${SUBJECT_ID}`
//       );

//       if (!response.ok) {
//         throw new Error('Failed to fetch template');
//       }

//       const templates = await response.json();
      
//       if (templates.length === 0) {
//         throw new Error("No templates found");
//       }

//       setTemplate(templates[0]);
//       setLoading(false);
//     } catch (err) {
//       console.error("Template fetch error:", err);
//       setError(err instanceof Error ? err.message : "Unknown error");
//       setLoading(false);
//     }
//   };

//   // Fetch Student Details
//   const fetchStudentDetails = async () => {
//     try {
//       const response = await fetch('/api/student-profile?id=' + user?.id);
      
//       if (!response.ok) {
//         throw new Error('Failed to fetch student details');
//       }

//       const studentData = await response.json();
//       setStudentDetails(studentData);
//     } catch (err) {
//       console.error("Student details fetch error:", err);
//       setError(err instanceof Error ? err.message : "Unknown error");
//     }
//   };

//   // Validation
//   const validateField = (field: DynamicField, value: any): string | null => {
//     if (field.required && !value) {
//       return `${field.label} is required`;
//     }

//     if (field.validationRegex && value) {
//       const regex = new RegExp(field.validationRegex);
//       if (!regex.test(value)) {
//         return `${field.label} format is invalid`;
//       }
//     }

//     return null;
//   };

//   // Add Dynamic Row
//   const addDynamicRow = () => {
//     if (!template) return;

//     const newRow: Record<string, any> = {};
//     template.dynamicSchema.groups.forEach((group) => {
//       newRow[group.name] = {};
//       group.fields.forEach((field) => {
//         const fieldName = field.label.toLowerCase().replace(/\s+/g, "_");
//         newRow[group.name][fieldName] = field.defaultValue || "";
//       });
//     });

//     setDynamicRows([...dynamicRows, newRow]);
//   };

//   // Remove Dynamic Row
//   const removeDynamicRow = (indexToRemove: number) => {
//     setDynamicRows(dynamicRows.filter((_, index) => index !== indexToRemove));
//   };

//   // Handle Field Change
//   const handleFieldChange = (
//     rowIndex: number, 
//     groupName: string, 
//     fieldName: string, 
//     value: any
//   ) => {
//     const updatedRows = [...dynamicRows];
//     updatedRows[rowIndex][groupName][fieldName] = value;
//     setDynamicRows(updatedRows);

//     // Optional: Validate field
//     if (template) {
//       const group = template.dynamicSchema.groups.find(g => g.name === groupName);
//       const field = group?.fields.find(f => 
//         f.label.toLowerCase().replace(/\s+/g, "_") === fieldName
//       );

//       if (field) {
//         const error = validateField(field, value);
//         setErrors(prev => ({
//           ...prev,
//           [`${rowIndex}.${groupName}.${fieldName}`]: error || ""
//         }));
//       }
//     }
//   };

//   // Submit Entries
//   const handleSubmit = async () => {
//     if (!template || !studentDetails) return;

//     // Validate all rows
//     const validationErrors: Record<string, string> = {};
//     let hasErrors = false;

//     dynamicRows.forEach((row, rowIndex) => {
//       template.dynamicSchema.groups.forEach((group) => {
//         group.fields.forEach((field) => {
//           const fieldName = field.label.toLowerCase().replace(/\s+/g, "_");
//           const value = row[group.name]?.[fieldName];
//           const error = validateField(field, value);
          
//           if (error) {
//             validationErrors[`${rowIndex}.${group.name}.${fieldName}`] = error;
//             hasErrors = true;
//           }
//         });
//       });
//     });

//     setErrors(validationErrors);
//     if (hasErrors) return;

//     try {
//       // Prepare submissions
//       const submissions = dynamicRows.map(row => ({
//         logBookTemplateId: template.id,
//         studentId: studentDetails.id,
//         dynamicFields: row,
//         status: 'SUBMITTED'
//       }));

//       // Submit all entries
//       const responses = await Promise.all(
//         submissions.map(submission => 
//           fetch("/api/log-books", {
//             method: "POST",
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(submission)
//           })
//         )
//       );

//       // Check submission success
//       const allSuccessful = responses.every(response => response.ok);

//       if (allSuccessful) {
//         alert("All entries submitted successfully!");
//         setDynamicRows([]);
//       } else {
//         throw new Error("Some entries failed to submit");
//       }
//     } catch (err) {
//       console.error("Submission error:", err);
//       alert(err instanceof Error ? err.message : "Submission failed");
//     }
//   };

//   // Export to Excel
//   const exportToExcel = () => {
//     if (!template || dynamicRows.length === 0) return;

//     const excelData = dynamicRows.map(row => {
//       const flattenedRow: Record<string, any> = {};
      
//       template.dynamicSchema.groups.forEach((group) => {
//         group.fields.forEach((field) => {
//           const fieldName = field.label.toLowerCase().replace(/\s+/g, "_");
//           const value = row[group.name]?.[fieldName] || '';
//           flattenedRow[`${group.name} - ${field.label}`] = value;
//         });
//       });

//       return flattenedRow;
//     });

//     const worksheet = XLSX.utils.json_to_sheet(excelData);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Log Book Entries");
    
//     XLSX.writeFile(workbook, `LogBookEntries_${new Date().toISOString().split('T')[0]}.xlsx`);
//   };

//   // Render Field
//   const renderField = (
//     rowIndex: number,
//     group: DynamicGroup, 
//     field: DynamicField
//   ) => {
//     const groupName = group.name;
//     const fieldName = field.label.toLowerCase().replace(/\s+/g, "_");
//     const errorKey = `${rowIndex}.${groupName}.${fieldName}`;
//     const fieldValue = dynamicRows[rowIndex]?.[groupName]?.[fieldName] || "";

//     const renderError = () => 
//       errors[errorKey] && (
//         <p className="text-red-500 text-sm">{errors[errorKey]}</p>
//       );

//     switch (field.type) {
//       case "text":
//         return (
//           <div className="space-y-2">
//             <Label>{field.label}</Label>
//             <Input
//               type="text"
//               value={fieldValue}
//               onChange={(e) => 
//                 handleFieldChange(
//                   rowIndex, 
//                   groupName, 
//                   fieldName, 
//                   e.target.value
//                 )
//               }
//               required={field.required}
//             />
//             {renderError()}
//           </div>
//         );

//       case "select":
//         return (
//           <div className="space-y-2">
//             <Label>{field.label}</Label>
//             <Select
//               value={fieldValue}
//               onValueChange={(value) => 
//                 handleFieldChange(
//                   rowIndex, 
//                   groupName, 
//                   fieldName, 
//                   value
//                 )
//               }
//             >
//               <SelectTrigger>
//                 <SelectValue placeholder={`Select ${field.label}`} />
//               </SelectTrigger>
//               <SelectContent>
//                 {field.options?.map((option) => (
//                   <SelectItem key={option} value={option}>
//                     {option}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//             {renderError()}
//           </div>
//         );

//       // Add more field types as needed (date, number, textarea, etc.)
//       default:
//         return <div>Unsupported field type</div>;
//     }
//   };

//   // Lifecycle Hooks
//   useEffect(() => {
//     fetchLogBookTemplate();
//     fetchStudentDetails();
//   }, []);

//   // Render Methods
//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   if (error) {
//     return <div className="text-red-500">{error}</div>;
//   }

//   if (!template) {
//     return <div>No template available</div>;
//   }

//   return (
//     <div className="container mx-auto p-4">
//       <Card>
//         <CardHeader>
//           <div className="flex justify-between items-center">
//             <CardTitle>{template.name}</CardTitle>
//             <div className="flex space-x-2">
//               <Button 
//                 variant="outline" 
//                 onClick={exportToExcel}
//                 disabled={dynamicRows.length === 0}
//               >
//                 <Download className="mr-2 h-4 w-4" /> Export
//               </Button>
//               <Button onClick={addDynamicRow}>
//                 <Plus className="mr-2 h-4 w-4" /> Add Entry
//               </Button>
//             </div>
//           </div>
//         </CardHeader>
//         <CardContent>
//           {dynamicRows.map((row, rowIndex) => (
//             <Card key={rowIndex} className="mb-4">
//               <CardHeader className="flex flex-row justify-between items-center">
//                 <CardTitle>Entry {rowIndex + 1}</CardTitle>
//                 <Button 
//                   variant="destructive" 
//                   size="sm" 
//                   onClick={() => removeDynamicRow(rowIndex)}
//                 >
//                   <Trash2 className="mr-2 h-4 w-4" /> Remove
//                 </Button>
//               </CardHeader>
//               <CardContent>
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead>Field</TableHead>
//                       <TableHead>Input</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {template.dynamicSchema.groups.map((group) => (
//                       group.fields.map((field) => (
//                         <TableRow key={field.label}>
//                           <TableCell>{field.label}</TableCell>
//                           <TableCell>
//                             {renderField(rowIndex, group, field)}
//                           </TableCell>
//                         </TableRow>
//                       ))
//                     ))}
//                   </TableBody>
//                 </Table>
//               </CardContent>
//             </Card>
//           ))}
          
//           {dynamicRows.length > 0 && (
//             <Button 
//               onClick={handleSubmit} 
//               className="w-full mt-4"
//             >
//               Submit All Entries
//             </Button>
//           )}

//           {dynamicRows.length === 0 && (
//             <div className="text-center py-8">
//               <p className="text-muted-foreground mb-4">
//                 No entries added. Click "Add Entry" to get started.
//               </p>
//               <Button onClick={addDynamicRow}>
//                 <Plus className="mr-2 h-4 w-4" /> Add First Entry
//               </Button>
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default LogBookEntries;