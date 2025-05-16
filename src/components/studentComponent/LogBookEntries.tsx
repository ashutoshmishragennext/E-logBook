/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { ScrollArea } from "@/components/ui/scroll-area";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCurrentUser } from "@/hooks/auth";
import useLogbookStore from "@/store/logBook";
import { UploadButton } from "@/utils/uploadthing";
import { format } from "date-fns";
import {
  CalendarIcon,
  FileText,
  Loader2,
  PlusCircle,
  Save,
  X
} from "lucide-react";
import React, { useEffect, useState } from "react";

const LogbookEntryPage: React.FC = () => {
  const user = useCurrentUser();
  const userId = user?.id;
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [existingEntries, setExistingEntries] = useState<any[]>([]);
  
  const {
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
    if (selectedType && ((selectedType === "general") || (selectedType === "subject" && studentSubjects.length > 0))) {
      fetchTemplates();
      if (selectedType === "general") {
        fetchAllTeachers();
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
            queryParams.append('studentSubjectId', selectedStudentSubjectId);
          }
          
          const response = await fetch(`/api/log-books?${queryParams.toString()}`);
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
    const success = await submitLogbookEntry();
    if (success) {
      setShowNewEntry(false);
      resetForm();
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

  const handleFileUpload = (fieldName: string) => (files: { url: string; name: string }[]) => {
    if (files.length > 0) {
      updateFileUpload(fieldName, { url: files[0].url, name: files[0].name });
    }
  };

  const handleRemoveFile = (fieldName: string) => {
    removeFileUpload(fieldName);
  };

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
  
  // Flatten groups to get all fields
  const allFields = selectedTemplate
    ? selectedTemplate.dynamicSchema.groups.flatMap(group => 
        group.fields.map(field => ({ ...field, groupName: group.groupName }))
      )
    : [];

  const renderFieldInput = (field: any) => {
    switch (field.fieldType) {
      case 'text':
        return (
          <Input
            className="w-full"
            value={formData[field.fieldName] || ''}
            onChange={(e) => updateFormData(field.fieldName, e.target.value)}
            placeholder={field.fieldLabel}
          />
        );
      case 'textarea':
        return (
          <Textarea
            className="w-full h-24"
            value={formData[field.fieldName] || ''}
            onChange={(e) => updateFormData(field.fieldName, e.target.value)}
            placeholder={field.fieldLabel}
          />
        );
      case 'select':
        return (
          <Select
            value={formData[field.fieldName] || ''}
            onValueChange={(value) => updateFormData(field.fieldName, value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={`Select ${field.fieldLabel}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options && field.options[0].split(',').map((option: string, i: number) => (
                <SelectItem key={i} value={option.trim()}>
                  {option.trim()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData[field.fieldName] ? format(new Date(formData[field.fieldName]), "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData[field.fieldName] ? new Date(formData[field.fieldName]) : undefined}
                onSelect={(date) => updateFormData(field.fieldName, date ? format(date, "yyyy-MM-dd") : '')}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );
      case 'file':
        return (
          <div className="space-y-2">
            {fileUploads[field.fieldName] ? (
              <div className="flex items-center justify-between p-2 border rounded-md bg-gray-50">
                <span className="truncate max-w-xs">{fileUploads[field.fieldName]?.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFile(field.fieldName)}
                >
                  <X className="h-4 w-4 text-red-500" />
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
                  },
                  allowedContent: "hidden",
                }}
              />
            )}
          </div>
        );
      default:
        return <Input />;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col space-y-4">
        {/* Top controls */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-2 flex-grow">
            {/* Template Type Selection */}
            <Select value={selectedType} onValueChange={handleTypeChange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Template Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="subject">Subject</SelectItem>
              </SelectContent>
            </Select>

            {/* Conditional Teacher/Subject Selection */}
            {selectedType === "general" && (
              <Select value={selectedTeacherId} onValueChange={handleTeacherChange}>
                <SelectTrigger className="w-[200px]">
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
            )}

            {selectedType === "subject" && (
              <Select value={selectedStudentSubjectId} onValueChange={handleSubjectChange}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  {studentSubjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subjectNames[subject.subjectId] || `Subject ID: ${subject.subjectId}`}
                      {subject.teacher && ` (${subject.teacher.fullName})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Template Selection */}
            <Select value={selectedTemplateId} onValueChange={handleTemplateChange}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select Template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <FileImporter
                      onImport={handleImport}
                      buttonText="Import"
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-green-400"
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
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
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
              className="bg-primary hover:bg-primary/90"
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
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-semibold">{selectedTemplate.name}</h2>
                <div className="text-sm text-muted-foreground">
                  Type: {selectedTemplate.templateType.charAt(0).toUpperCase() + selectedTemplate.templateType.slice(1)}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Entries Table with Fixed Layout and Better Scrolling */}
        {selectedTemplate && (
          <div className="border rounded-md overflow-hidden">
            {/* This div controls the outer container with a fixed height */}
            <div className="h-[500px] relative">
              {/* This ScrollArea enables both horizontal and vertical scrolling */}
              <ScrollArea className="h-full" type="always">
                <div className="min-w-max">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px] bg-white sticky left-0 z-20">
                          Date
                        </TableHead>
                        {allFields.map((field, index) => (
                          <TableHead 
                            key={index} 
                            className="min-w-[150px]"
                            title={`${field.groupName}: ${field.fieldLabel}`}
                          >
                            {field.fieldLabel}
                            {field.isRequired && <span className="text-red-500 ml-1">*</span>}
                          </TableHead>
                        ))}
                        <TableHead className="min-w-[150px]">Remarks</TableHead>
                        <TableHead className="w-[100px] text-right bg-white sticky right-0 z-20">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* New Entry Row */}
                      {showNewEntry && (
                        <TableRow>
                          <TableCell className="bg-white sticky left-0 z-10">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="w-full justify-start text-left font-normal"
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0 z-30">
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
                            <TableCell key={index} className="min-w-[150px] p-2">
                              <div className="w-full">
                                {renderFieldInput(field)}
                              </div>
                            </TableCell>
                          ))}
                          
                          {/* Remarks */}
                          <TableCell className="min-w-[150px]">
                            <Textarea
                              className="w-full h-24"
                              value={formData.studentRemarks || ''}
                              onChange={(e) => updateFormData('studentRemarks', e.target.value)}
                              placeholder="Additional remarks..."
                            />
                          </TableCell>
                          
                          {/* Actions */}
                          <TableCell className="text-right bg-white sticky right-0 z-10">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowNewEntry(false)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={handleSubmit}
                                disabled={isLoading}
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
                          <TableRow key={index}>
                            <TableCell className="bg-white sticky left-0 z-10">
                              {entry.createdAt && format(new Date(entry.createdAt), "MMM d, yyyy")}
                            </TableCell>
                            
                            {/* Dynamic Fields */}
                            {allFields.map((field, fieldIndex) => (
                              <TableCell key={fieldIndex} className="min-w-[150px]">
                                {entry.dynamicFields?.[field.fieldName] ? (
                                  field.fieldType === 'file' ? (
                                    <a 
                                      href={entry.dynamicFields[field.fieldName]} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="flex items-center text-blue-600 hover:underline"
                                    >
                                      <FileText className="h-4 w-4 mr-1" />
                                      View File
                                    </a>
                                  ) : (
                                    entry.dynamicFields[field.fieldName]
                                  )
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </TableCell>
                            ))}
                            
                            <TableCell className="min-w-[150px]">
                              {entry.studentRemarks || <span className="text-muted-foreground">-</span>}
                            </TableCell>
                            
                            <TableCell className="text-right bg-white sticky right-0 z-10">
                              <div className="flex justify-end space-x-2">
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
                          <TableCell colSpan={allFields.length + 3} className="h-24 text-center">
                            {selectedTemplateId ? (
                              <div className="flex flex-col items-center justify-center">
                                <p className="text-muted-foreground">No entries found</p>
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
                              <p className="text-muted-foreground">Select a template to view entries</p>
                            )}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogbookEntryPage;