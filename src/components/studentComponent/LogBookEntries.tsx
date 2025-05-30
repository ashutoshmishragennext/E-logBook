/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps*/
import { FileExporter, FileImporter } from "@/components/common/FileHandler";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCurrentUser } from "@/hooks/auth";
import useLogbookStore from "@/store/logBook";
import { UploadButton } from "@/utils/uploadthing";
import { format, isAfter, isBefore, startOfDay, subDays } from "date-fns";
import {
  CalendarIcon,
  FileText,
  Loader2,
  PlusCircle,
  Save,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import SearchableSubjectSelect from "../adminComponent/SubjectSerachSelect";

const LogbookEntryPage: React.FC = () => {
  const user = useCurrentUser();
  const userId = user?.id;
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [existingEntries, setExistingEntries] = useState<any[]>([]);

  const {
    collegeId,
    studentId,
    selectedType,
    selectedTemplateId,
    selectedStudentSubjectId,
    selectedTeacherId,
    teachers,
    studentSubjects,
    templates,
    subjectNames,
    formData,
    fileUploads,
    isLoading,

    // Actions
    setSelectedType,
    setSelectedTemplateId,
    setSelectedStudentSubjectId,
    setSelectedTeacherId,
    updateFormData,
    updateFileUpload,
    removeFileUpload,
    fetchStudentData,
    fetchAllTeachers,
    fetchStudentSubjects,
    fetchTemplates,
    submitLogbookEntry,
    resetForm,
  } = useLogbookStore();

  // Fetch student profile
  useEffect(() => {
    if (userId) {
      fetchStudentData(userId);
    }
  }, [userId, fetchStudentData]);

  // Fetch student subjects
  useEffect(() => {
    if (studentId) {
      fetchStudentSubjects();
    }
  }, [studentId, fetchStudentSubjects]);

  // Fetch templates and teachers when type changes
  useEffect(() => {
    if (
      selectedType &&
      (selectedType === "general" ||
        (selectedType === "subject" && studentSubjects.length > 0))
    ) {
      fetchTemplates();
      if (selectedType === "general" && collegeId) {
        fetchAllTeachers(collegeId);
      }
    }
  }, [selectedType, studentSubjects, fetchTemplates, fetchAllTeachers]);

  // Fetch existing entries when template is selected
  useEffect(() => {
    const fetchExistingEntries = async () => {
      if (studentId && selectedTemplateId) {
        try {
          const queryParams = new URLSearchParams({
            studentId,
            logBookTemplateId: selectedTemplateId,
          });

          if (selectedStudentSubjectId) {
            queryParams.append("studentSubjectId", selectedStudentSubjectId);
          }

          const response = await fetch(
            `/api/log-books?${queryParams.toString()}`
          );
          if (response.ok) {
            const data = await response.json();
            setExistingEntries(data);
          }
        } catch (error) {
          console.error("Failed to fetch existing entries:", error);
        }
      }
    };

    fetchExistingEntries();
  }, [studentId, selectedTemplateId, selectedStudentSubjectId]);

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    resetForm();
  };

  const handleTemplateChange = (value: string) => {
    setSelectedTemplateId(value);
  };

  const handleSubjectChange = (value: string) => {
    setSelectedStudentSubjectId(value);
  };

  const handleTeacherChange = (value: string) => {
    setSelectedTeacherId(value);
  };

  const handleSubmit = async () => {
    // Add the selected date to formData before submitting
    if (date) {
      updateFormData("entryDate", format(date, "yyyy-MM-dd"));
    }

    const success = await submitLogbookEntry();
    if (success) {
      setShowNewEntry(false);
      setDate(new Date()); // Reset date to today
      resetForm();

      // Refresh existing entries
      if (studentId && selectedTemplateId) {
        const queryParams = new URLSearchParams({
          studentId,
          logBookTemplateId: selectedTemplateId,
        });

        if (selectedStudentSubjectId) {
          queryParams.append("studentSubjectId", selectedStudentSubjectId);
        }

        try {
          const response = await fetch(
            `/api/log-books?${queryParams.toString()}`
          );
          if (response.ok) {
            const data = await response.json();
            setExistingEntries(data);
          }
        } catch (error) {
          console.error("Failed to refresh entries:", error);
        }
      }
    }
  };

  const handleImport = async (data: any[]) => {
    try {
      console.log("Imported data:", data);
      // Process the imported data here
      // For example, you might want to convert the data to match your template format
      // then loop through each entry and submit it
    } catch (error) {
      console.error("Failed to import data:", error);
    }
  };

  const handleFileUpload =
    (fieldName: string) => (files: { url: string; name: string }[]) => {
      if (files.length > 0) {
        updateFileUpload(fieldName, { url: files[0].url, name: files[0].name });
      }
    };

  const handleRemoveFile = (fieldName: string) => {
    removeFileUpload(fieldName);
  };

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  // Flatten groups to get all fields
  const allFields = selectedTemplate
    ? selectedTemplate.dynamicSchema.groups.flatMap((group) =>
        group.fields.map((field) => ({ ...field, groupName: group.groupName }))
      )
    : [];

  // Prepare options for searchable selectors
  const templateTypeOptions = [
    { label: "General", value: "general" },
    { label: "Subject", value: "subject" },
  ];

  const teacherOptions = teachers.map((teacher) => ({
    label: teacher.name,
    value: teacher.id,
  }));

  const subjectOptions = studentSubjects.map((subject) => ({
    label: `${
      subjectNames[subject.subjectId] || `Subject ID: ${subject.subjectId}`
    }${subject.teacher ? ` (${subject.teacher.fullName})` : ""}`,
    value: subject.id,
  }));

  const templateOptions = templates.map((template) => ({
    label: template.name,
    value: template.id,
  }));

  const renderFieldInput = (field: any) => {
    switch (field.fieldType) {
      case "text":
        return (
          <Input
            className="w-full min-w-[120px]"
            value={formData[field.fieldName] || ""}
            onChange={(e) => updateFormData(field.fieldName, e.target.value)}
            placeholder={field.fieldLabel}
          />
        );
      case "textarea":
        return (
          <Textarea
            className="w-full min-w-[150px] h-20 resize-none"
            value={formData[field.fieldName] || ""}
            onChange={(e) => updateFormData(field.fieldName, e.target.value)}
            placeholder={field.fieldLabel}
          />
        );
      case "select":
        const selectOptions =
          field.options && field.options[0]
            ? field.options[0].split(",").map((option: string) => ({
                label: option.trim(),
                value: option.trim(),
              }))
            : [];

        return (
          <div className="min-w-[120px]">
            <SearchableSubjectSelect
              options={selectOptions}
              value={formData[field.fieldName] || ""}
              onChange={(value) => updateFormData(field.fieldName, value)}
              placeholder={`Select ${field.fieldLabel}`}
            />
          </div>
        );
      case "date":
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full min-w-[140px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData[field.fieldName] ? (
                  format(new Date(formData[field.fieldName]), "MMM d, yyyy")
                ) : (
                  <span className="text-muted-foreground">Pick date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={
                  formData[field.fieldName]
                    ? new Date(formData[field.fieldName])
                    : undefined
                }
                onSelect={(date) =>
                  updateFormData(
                    field.fieldName,
                    date ? format(date, "yyyy-MM-dd") : ""
                  )
                }
                initialFocus
                disabled={(date) => {
                  const today = startOfDay(new Date());
                  const sevenDaysAgo = subDays(today, 7);
                  return isBefore(date, sevenDaysAgo) || isAfter(date, today);
                }}
              />
            </PopoverContent>
          </Popover>
        );
      case "file":
        return (
          <div className="space-y-2 min-w-[150px]">
            {fileUploads[field.fieldName] ? (
              <div className="flex items-center justify-between p-2 border rounded-md bg-gray-50">
                <span
                  className="truncate text-sm max-w-[100px]"
                  title={fileUploads[field.fieldName]?.name}
                >
                  {fileUploads[field.fieldName]?.name}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFile(field.fieldName)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3 text-red-500" />
                </Button>
              </div>
            ) : (
              <UploadButton
                endpoint="docUploader"
                onClientUploadComplete={handleFileUpload(field.fieldName)}
                onUploadError={(error: Error) => {
                  console.error(`Upload failed: ${error.message}`);
                }}
                appearance={{
                  button: {
                    background: "bg-blue-600",
                    color: "text-white",
                    width: "w-full",
                    fontSize: "12px",
                    height: "32px",
                  },
                  allowedContent: "hidden",
                }}
              />
            )}
          </div>
        );
      case "number":
        return (
          <Input
            type="number"
            className="w-full min-w-[120px]"
            value={formData[field.fieldName] || ""}
            onChange={(e) => updateFormData(field.fieldName, e.target.value)}
            placeholder={field.fieldLabel}
          />
        );
      default:
        return <Input className="min-w-[120px]" />;
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-full">
      <div className="flex flex-col space-y-4">
        {/* Top controls - Made responsive */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 flex-grow">
            {/* Template Type Selection */}
            <div className="w-full sm:w-[150px]">
              <SearchableSubjectSelect
                options={templateTypeOptions}
                value={selectedType}
                onChange={handleTypeChange}
                placeholder="Template Type"
              />
            </div>

            {/* Conditional Teacher/Subject Selection */}
            {selectedType === "general" && (
              <div className="w-full sm:w-[200px]">
                <SearchableSubjectSelect
                  options={teacherOptions}
                  value={selectedTeacherId}
                  onChange={handleTeacherChange}
                  placeholder="Select Teacher"
                />
              </div>
            )}

            {selectedType === "subject" && (
              <div className="w-full sm:w-[200px]">
                <SearchableSubjectSelect
                  options={subjectOptions}
                  value={selectedStudentSubjectId}
                  onChange={handleSubjectChange}
                  placeholder="Select Subject"
                />
              </div>
            )}

            {/* Template Selection */}
            <div className="w-full sm:w-[250px]">
              <SearchableSubjectSelect
                options={templateOptions}
                value={selectedTemplateId}
                onChange={handleTemplateChange}
                placeholder="Select Template"
              />
            </div>
          </div>

          {/* Action Buttons - Made responsive */}
          <div className="flex flex-col sm:flex-row gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <FileImporter
                      onImport={handleImport}
                      buttonText="Import"
                      className="flex items-center justify-center w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-green-400"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Import entries from Excel or CSV</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <FileExporter
                      data={existingEntries}
                      buttonText="Export"
                      className="flex items-center justify-center w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Export entries to Excel</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button
              onClick={() => setShowNewEntry(true)}
              disabled={!selectedTemplateId}
              className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              New Entry
            </Button>
          </div>
        </div>

        {/* Template Info */}
        {selectedTemplate && (
          <Card className="mb-4">
            <CardContent className="pt-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
                <h2 className="text-xl font-semibold">
                  {selectedTemplate.name}
                </h2>
                <div className="text-sm text-muted-foreground">
                  Type:{" "}
                  {selectedTemplate.templateType.charAt(0).toUpperCase() +
                    selectedTemplate.templateType.slice(1)}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedTemplate.description}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Entries Table with Improved Horizontal Scrolling */}
        {selectedTemplate && (
          <div className="border rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <div
                style={{
                  minWidth: `${Math.max(800, (allFields.length + 3) * 150)}px`,
                }}
              >
                <div className="h-[500px] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-white z-10">
                      <TableRow>
                        <TableHead className="w-[120px] bg-white sticky left-0 z-20 border-r">
                          Date
                        </TableHead>
                        {allFields.map((field, index) => (
                          <TableHead
                            key={index}
                            className="min-w-[150px] px-2"
                            title={`${field.groupName}: ${field.fieldLabel}`}
                          >
                            <div className="truncate">
                              {field.fieldLabel}
                              {field.isRequired && (
                                <span className="text-red-500 ml-1">*</span>
                              )}
                            </div>
                          </TableHead>
                        ))}
                        <TableHead className="min-w-[150px] px-2">
                          Remarks
                        </TableHead>
                        <TableHead className="w-[100px] text-right bg-white sticky right-0 z-20 border-l">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* New Entry Row */}
                      {showNewEntry && (
                        <TableRow className="bg-blue-50/50">
                          <TableCell className="bg-white sticky left-0 z-10 border-r p-2">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="w-full justify-start text-left font-normal h-9"
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  <span className="truncate">
                                    {date ? format(date, "MMM d") : "Pick date"}
                                  </span>
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0 z-30"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={date}
                                  onSelect={setDate}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </TableCell>

                          {/* Dynamic Fields */}
                          {allFields.map((field, index) => (
                            <TableCell key={index} className="p-2">
                              {renderFieldInput(field)}
                            </TableCell>
                          ))}

                          {/* Remarks */}
                          <TableCell className="p-2">
                            <Textarea
                              className="w-full min-w-[150px] h-20 resize-none"
                              value={formData.studentRemarks || ""}
                              onChange={(e) =>
                                updateFormData("studentRemarks", e.target.value)
                              }
                              placeholder="Additional remarks..."
                            />
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="text-right bg-white sticky right-0 z-10 border-l p-2">
                            <div className="flex justify-end space-x-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setShowNewEntry(false);
                                  setDate(new Date());
                                  resetForm();
                                }}
                                className="h-8 w-8 p-0"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="h-8 w-8 p-0"
                              >
                                {isLoading ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Save className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}

                      {/* Existing Entries */}
                      {existingEntries.length > 0 ? (
                        existingEntries.map((entry, index) => (
                          <TableRow key={index} className="hover:bg-gray-50/50">
                            <TableCell className="bg-white sticky left-0 z-10 border-r p-2">
                              <div className="text-sm">
                                {entry.createdAt &&
                                  format(
                                    new Date(entry.createdAt),
                                    "MMM d, yyyy"
                                  )}
                              </div>
                            </TableCell>

                            {/* Dynamic Fields */}
                            {allFields.map((field, fieldIndex) => (
                              <TableCell key={fieldIndex} className="p-2">
                                <div className="min-w-0">
                                  {entry.dynamicFields?.[field.fieldName] ? (
                                    field.fieldType === "file" ? (
                                      <a
                                        href={
                                          entry.dynamicFields[field.fieldName]
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center text-blue-600 hover:underline text-sm"
                                      >
                                        <FileText className="h-4 w-4 mr-1 flex-shrink-0" />
                                        <span className="truncate">
                                          View File
                                        </span>
                                      </a>
                                    ) : (
                                      <div
                                        className="text-sm break-words"
                                        title={
                                          entry.dynamicFields[field.fieldName]
                                        }
                                      >
                                        {entry.dynamicFields[field.fieldName]}
                                      </div>
                                    )
                                  ) : (
                                    <span className="text-muted-foreground text-sm">
                                      -
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                            ))}

                            <TableCell className="p-2">
                              <div
                                className="text-sm break-words"
                                title={entry.studentRemarks}
                              >
                                {entry.studentRemarks || (
                                  <span className="text-muted-foreground">
                                    -
                                  </span>
                                )}
                              </div>
                            </TableCell>

                            <TableCell className="text-right bg-white sticky right-0 z-10 border-l p-2">
                              <div className="flex justify-end">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                >
                                  <FileText className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={allFields.length + 3}
                            className="h-24 text-center"
                          >
                            {selectedTemplateId ? (
                              <div className="flex flex-col items-center justify-center">
                                <p className="text-muted-foreground">
                                  No entries found
                                </p>
                                {!showNewEntry && (
                                  <Button
                                    variant="outline"
                                    className="mt-2"
                                    onClick={() => setShowNewEntry(true)}
                                  >
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Create New Entry
                                  </Button>
                                )}
                              </div>
                            ) : (
                              <p className="text-muted-foreground">
                                Select a template to view entries
                              </p>
                            )}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogbookEntryPage;
