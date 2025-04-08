/* eslint-disable @typescript-eslint/no-explicit-any */
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentUser } from "@/hooks/auth";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { AlertCircle, Calendar as CalendarIcon, Check, Info } from "lucide-react";
import React, { useEffect, useState } from "react";
import { LogBookFilters } from "../common/LogBookFilters";

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
}

interface FilterOption {
  id: string;
  name: string;
}

interface Teacher {
  id: string;
  userId: string;
  name: string;
  email?: string;
}

const LogBookEntries: React.FC = () => {
  // User and student details
  const user = useCurrentUser();
  const [studentDetails, setStudentDetails] = useState<{
    id: string;
    personalInfo?: Record<string, any>;
  } | null>(null);

  // Template and form state
  const [logBookTemplate, setLogBookTemplate] = useState<LogBookTemplate | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({
    template: true,
    student: true,
    academicYears: true,
    batches: true,
    subjects: true,
    modules: true,
    teachers: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  // Teacher and remarks state
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [studentRemarks, setStudentRemarks] = useState<string>("");

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

  // Fetch student details
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
      } finally {
        setLoading(prev => ({ ...prev, student: false }));
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
          throw new Error('Failed to fetch teachers');
        }
        const data = await response.json();
        console.log("Fetched teachers:", data);
        setTeachers(data);
      } catch (err) {
        console.error('Teachers fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load teachers');
      } finally {
        setLoading(prev => ({ ...prev, teachers: false }));
      }
    };

    fetchTeachers();
  }, []);

  // Fetch filter options
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
        setLoading(prev => ({ ...prev, academicYears: false }));
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
        setLoading(prev => ({ ...prev, batches: false }));
        return;
      }
      
      try {
        setLoading(prev => ({ ...prev, batches: true }));
        const response = await fetch(`/api/phase?academicYears=${selectedAcademicYear}`);
        if (response.ok) {
          const data = await response.json();
          setBatches(data);
          if (data.length > 0) {
            setSelectedBatch(data[0].id);
          }
        } else {
          console.error("Failed to fetch batches");
        }
      } catch (error) {
        console.error("Error fetching batches:", error);
      } finally {
        setLoading(prev => ({ ...prev, batches: false }));
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
        setLoading(prev => ({ ...prev, subjects: false }));
        return;
      }
      
      try {
        setLoading(prev => ({ ...prev, subjects: true }));
        const response = await fetch(`/api/subject?PhaseId=${selectedBatch}`);
        if (response.ok) {
          const data = await response.json();
          setSubjects(data);
          if (data.length > 0) {
            setSelectedSubject(data[0].id);
          }
        } else {
          console.error("Failed to fetch subjects");
        }
      } catch (error) {
        console.error("Error fetching subjects:", error);
      } finally {
        setLoading(prev => ({ ...prev, subjects: false }));
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
        setLoading(prev => ({ ...prev, modules: false }));
        return;
      }
      
      try {
        setLoading(prev => ({ ...prev, modules: true }));
        const response = await fetch(`/api/module?subjectId=${selectedSubject}`);
        if (response.ok) {
          const data = await response.json();
          setModules(data);
          if (data.length > 0) {
            setSelectedModule(data[0].id);
          }
        } else {
          console.error("Failed to fetch modules");
        }
      } catch (error) {
        console.error("Error fetching modules:", error);
      } finally {
        setLoading(prev => ({ ...prev, modules: false }));
      }
    };
    
    fetchModules();
  }, [selectedSubject]);

  // Fetch log book template based on selected filters
  useEffect(() => {
    const fetchLogBookTemplate = async () => {
      if (!selectedAcademicYear || !selectedBatch || !selectedSubject) {
        return;
      }
      
      try {
        setLoading(prev => ({ ...prev, template: true }));
        
        let url = `/api/log-book-template?` +
          `academicYearId=${selectedAcademicYear}&` +
          `batchId=${selectedBatch}&` +
          `subjectId=${selectedSubject}`;
          
        if (selectedModule) {
          url += `&moduleId=${selectedModule}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }

        const templates = await response.json();

        if (templates.length === 0) {
          setLogBookTemplate(null);
          setError("No template found for the selected filters");
          return;
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
            initialFormData[group.name][fieldName] = field.defaultValue || "";
          });
        });

        setLogBookTemplate(template);
        setFormData(initialFormData);
        setError(null);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        setLogBookTemplate(null);
      } finally {
        setLoading(prev => ({ ...prev, template: false }));
      }
    };

    fetchLogBookTemplate();
  }, [selectedAcademicYear, selectedBatch, selectedSubject, selectedModule]);

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
  ) => {
    setSubmitSuccess(false);
    
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
    handleInputChange(groupName, fieldName, file.name);
  };

  // Submit form data
  const handleSubmit = async () => {
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

    // Validate teacher selection if required
    if (!selectedTeacherId) {
      validationErrors["teacher"] = "Please select a teacher";
      hasErrors = true;
    }

    setErrors(validationErrors);
    if (hasErrors) return;

    try {
      // Create a new object that includes sequence numbers for each group
      const dynamicFieldsWithSequence: Record<string, any> = {};
      
      // Process each group and add sequence number
      logBookTemplate.dynamicSchema.groups.forEach((group) => {
        // Get the sequence from the group or default to 0 if not present
        const sequence = group.sequence || 0;
        
        // Create the group data with sequence
        dynamicFieldsWithSequence[group.name] = {
          ...formData[group.name],
          _sequence: sequence // Add sequence as a special property
        };
      });
      
      // Add student information
      const dynamicFieldsWithStudentInfo = {
        ...dynamicFieldsWithSequence,
        personalInfo: {
          ...(formData.personalInfo || {}),
          studentId: studentDetails.id,
          userId: user?.id,
          name: studentDetails.personalInfo?.name || user?.name,
        }
      };

      const payload = {
        logBookTemplateId: logBookTemplate.id,
        studentId: studentDetails.id,
        teacherId: selectedTeacherId,
        studentRemarks: studentRemarks,
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

      setSubmitSuccess(true);
      
      // Reset form
      const initialFormData: Record<string, any> = {};
      logBookTemplate.dynamicSchema.groups.forEach((group: DynamicGroup) => {
        initialFormData[group.name] = {};
        group.fields.forEach((field: DynamicField) => {
          const fieldName = field.label.toLowerCase().replace(/\s+/g, "_");
          initialFormData[group.name][fieldName] = field.defaultValue || "";
        });
      });
      
      setFormData(initialFormData);
      setSelectedFiles({});
      setSelectedTeacherId("");
      setStudentRemarks("");
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error("Submission error:", err);
      setError(err instanceof Error ? err.message : "Submission failed. Please try again.");
    }
  };

  // Render field based on type
  const renderField = (group: DynamicGroup, field: DynamicField) => {
    const groupName = group.name;
    const fieldName = field.label.toLowerCase().replace(/\s+/g, "_");
    const errorKey = `${groupName}.${fieldName}`;
    const fieldValue = formData[groupName]?.[fieldName] || "";
    const hasError = !!errors[errorKey];

    const commonProps = {
      id: `${groupName}-${fieldName}`,
      required: field.required,
      className: cn(
        hasError && "border-red-500 focus-visible:ring-red-500"
      ),
    };

    switch (field.type) {
      case "text":
        return (
          <div className="space-y-2">
            <Label htmlFor={commonProps.id} className={cn(hasError && "text-red-500")}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              {...commonProps}
              type="text"
              value={fieldValue}
              onChange={(e) =>
                handleInputChange(groupName, fieldName, e.target.value)
              }
            />
            {hasError && (
              <p className="text-red-500 text-sm">{errors[errorKey]}</p>
            )}
          </div>
        );

      case "number":
        return (
          <div className="space-y-2">
            <Label htmlFor={commonProps.id} className={cn(hasError && "text-red-500")}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              {...commonProps}
              type="number"
              value={fieldValue}
              onChange={(e) =>
                handleInputChange(
                  groupName,
                  fieldName,
                  e.target.value,
                )
              }
            />
            {hasError && (
              <p className="text-red-500 text-sm">{errors[errorKey]}</p>
            )}
          </div>
        );

      case "textarea":
        return (
          <div className="space-y-2">
            <Label htmlFor={commonProps.id} className={cn(hasError && "text-red-500")}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              {...commonProps}
              value={fieldValue}
              onChange={(e) =>
                handleInputChange(
                  groupName,
                  fieldName,
                  e.target.value,
                )
              }
            />
            {hasError && (
              <p className="text-red-500 text-sm">{errors[errorKey]}</p>
            )}
          </div>
        );

      case "select":
        return (
          <div className="space-y-2">
            <Label className={cn(hasError && "text-red-500")}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select
              value={fieldValue}
              onValueChange={(value) =>
                handleInputChange(groupName, fieldName, value)
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
            {hasError && (
              <p className="text-red-500 text-sm">{errors[errorKey]}</p>
            )}
          </div>
        );

      case "date":
        return (
          <div className="space-y-2">
            <Label className={cn(hasError && "text-red-500")}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
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
                    format(new Date(), "PPP")
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
                    )
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {hasError && (
              <p className="text-red-500 text-sm">{errors[errorKey]}</p>
            )}
          </div>
        );

      case "file":
        return (
          <div className="space-y-2">
            <Label htmlFor={commonProps.id} className={cn(hasError && "text-red-500")}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
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
            {hasError && (
              <p className="text-red-500 text-sm">{errors[errorKey]}</p>
            )}
          </div>
        );

      default:
        return (
          <div className="space-y-2">
            <Label className={cn(hasError && "text-red-500")}>
              {field.label} (Unsupported type: {field.type})
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {hasError && (
              <p className="text-red-500 text-sm">{errors[errorKey]}</p>
            )}
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Page Header */}
      {/* <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Log Book Entries</h1>
          <p className="text-muted-foreground mt-1">
            Record and maintain your academic log book entries
          </p>
        </div>
      </div> */}
      
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
          modules: loading.modules
        }}
      />
      
      {/* Loading State */}
      {loading.template && (
        <Card>
          <CardContent className="flex justify-center items-center py-12">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="text-sm text-muted-foreground">Loading template...</p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Error State */}
      {error && !loading.template && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Success Message */}
      {submitSuccess && (
        <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
          <Check className="h-4 w-4" />
          <AlertDescription>
            Log book entry submitted successfully!
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content - When template is loaded */}
      {!loading.template && logBookTemplate && (
        <>
          {/* Template Info */}
          {/* <Card className="mb-6">
            <CardHeader>
              <CardTitle>{logBookTemplate.name}</CardTitle>
              {logBookTemplate.description && (
                <CardDescription>
                  {logBookTemplate.description}
                </CardDescription>
              )}
            </CardHeader>
          </Card> */}
          
          {/* Form Groups */}
          {logBookTemplate.dynamicSchema.groups.map((group, groupIndex) => (
            <Card key={`group-${groupIndex}`} className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">{group.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {group.fields.map((field, fieldIndex) => (
                    <div 
                      key={`field-${groupIndex}-${fieldIndex}`}
                      className={field.type === 'textarea' ? 'md:col-span-2' : ''}
                    >
                      {renderField(group, field)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
          
          {/* Additional Information Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6">
                {/* Teacher Selection */}
                <div className="space-y-2">
                  <Label className={cn(errors.teacher && "text-red-500")}>
                    Assign Teacher
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Select
                    value={selectedTeacherId}
                    onValueChange={setSelectedTeacherId}
                  >
                    <SelectTrigger className={cn(errors.teacher && "border-red-500")}>
                      <SelectValue placeholder="Select a teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.teacher && (
                    <p className="text-red-500 text-sm">{errors.teacher}</p>
                  )}
                </div>

                {/* Student Remarks */}
                <div className="space-y-2">
                  <Label>Your Remarks</Label>
                  <Textarea
                    value={studentRemarks}
                    onChange={(e) => setStudentRemarks(e.target.value)}
                    placeholder="Enter any additional comments or remarks..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Submit Button */}
          <Button 
            onClick={handleSubmit} 
            className="w-full py-6 text-lg font-medium" 
            size="lg"
          >
            Submit Entry
          </Button>
        </>
      )}
      
      {/* No Template Found State */}
      {!loading.template && !logBookTemplate && !error && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Info className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Template Available</h3>
            <p className="text-muted-foreground max-w-md">
              Please select different filter options or contact your administrator if you believe this is an error.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LogBookEntries;