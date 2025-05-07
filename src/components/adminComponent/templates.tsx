// src/app/dashboard/templates/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { PlusCircle, Trash2, MoveDown, MoveUp, Save } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Types based on your schema
type AcademicYear = {
  id: string;
  name: string;
};

type Phase = {
  id: string;
  name: string;
  academicYearId: string;
};

type Subject = {
  id: string;
  name: string;
  code: string;
  phaseId: string;
};

type TeacherSubject = {
  id: string;
  teacherId: string;
  subjectId: string;
  academicYearId: string;
  phaseId: string;
  branchId: string;
  courseId: string;
};

// Form field type for template construction
type FieldDefinition = {
  fieldName: string;
  fieldLabel: string;
  fieldType: "text" | "number" | "date" | "select" | "textarea" | "file";
  isRequired: boolean;
  options?: string[];
  validationRegex?: string;
  defaultValue?: string;
};

// Group of fields
type FieldGroup = {
  groupName: string;
  fields: FieldDefinition[];
};

// Template schema
type LogBookTemplateSchema = {
  groups: FieldGroup[];
};

// Form validation schema for template details
const templateDetailsSchema = z.object({
  name: z.string().min(3, "Template name must be at least 3 characters"),
  description: z.string().optional(),
  templateType: z.enum(["general", "subject"]),
  academicYearId: z.string().optional(),
  phaseId: z.string().optional(),
  subjectId: z.string().optional(),
  teacherSubjectId: z.string().optional(),
});

// LogBook Template Creation Page
export default function TemplateCreationPage() {
  const router = useRouter();
  const [templateType, setTemplateType] = useState<"general" | "subject">("general");
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teacherSubjects, setTeacherSubjects] = useState<TeacherSubject[]>([]);
  
  // State for dynamic form building
  const [templateSchema, setTemplateSchema] = useState<LogBookTemplateSchema>({
    groups: [{ groupName: "General Information", fields: [] }]
  });
  
  // Form for template details
  const form = useForm<z.infer<typeof templateDetailsSchema>>({
    resolver: zodResolver(templateDetailsSchema),
    defaultValues: {
      name: "",
      description: "",
      templateType: "general",
    },
  });

  // Watch for changes to templateType
  const watchTemplateType = form.watch("templateType");
  const watchAcademicYear = form.watch("academicYearId");
  const watchPhase = form.watch("phaseId");

  useEffect(() => {
    // Fetch academic years
    const fetchAcademicYears = async () => {
      // Replace with actual API call
      const response = await fetch('/api/academicYears');
      const data = await response.json();
      setAcademicYears(data);
    };

    fetchAcademicYears();
  }, []);

  useEffect(() => {
    setTemplateType(watchTemplateType);
    
    // Reset related fields when template type changes
    if (watchTemplateType === "general") {
      form.setValue("academicYearId", undefined);
      form.setValue("phaseId", undefined);
      form.setValue("subjectId", undefined);
      form.setValue("teacherSubjectId", undefined);
    }
  }, [watchTemplateType, form]);

  useEffect(() => {
    // Fetch phases when academic year changes
    if (watchAcademicYear) {
      const fetchPhases = async () => {
        // Replace with actual API call
        const response = await fetch(`/api/phase?academicYears=${watchAcademicYear}`);
        const data = await response.json();
        setPhases(data);
      };

      fetchPhases();
      form.setValue("phaseId", undefined);
      form.setValue("subjectId", undefined);
      form.setValue("teacherSubjectId", undefined);
    }
  }, [watchAcademicYear, form]);

  useEffect(() => {
    // Fetch subjects when phase changes
    if (watchPhase) {
      const fetchSubjects = async () => {
        // Replace with actual API call
        const response = await fetch(`/api/subjects?phaseId=${watchPhase}`);
        const data = await response.json();
        setSubjects(data);
      };

      fetchSubjects();
      form.setValue("subjectId", undefined);
      form.setValue("teacherSubjectId", undefined);
    }
  }, [watchPhase, form]);

  useEffect(() => {
    // Fetch teacher subjects when subject changes
    const subjectId = form.getValues("subjectId");
    if (subjectId) {
      const fetchTeacherSubjects = async () => {
        // Replace with actual API call
        const response = await fetch(`/api/teacher-subjects?subjectId=${subjectId}`);
        const data = await response.json();
        setTeacherSubjects(data);
      };

      fetchTeacherSubjects();
      form.setValue("teacherSubjectId", undefined);
    }
  }, [form.getValues("subjectId"), form]);

  // Add a new group
  const addGroup = () => {
    setTemplateSchema(prev => ({
      ...prev,
      groups: [...prev.groups, { groupName: `Group ${prev.groups.length + 1}`, fields: [] }]
    }));
  };

  // Remove a group
  const removeGroup = (index: number) => {
    setTemplateSchema(prev => ({
      ...prev,
      groups: prev.groups.filter((_, i) => i !== index)
    }));
  };

  // Update group name
  const updateGroupName = (index: number, name: string) => {
    setTemplateSchema(prev => {
      const newGroups = [...prev.groups];
      newGroups[index] = { ...newGroups[index], groupName: name };
      return { ...prev, groups: newGroups };
    });
  };

  // Add a field to a group
  const addField = (groupIndex: number) => {
    setTemplateSchema(prev => {
      const newGroups = [...prev.groups];
      newGroups[groupIndex] = {
        ...newGroups[groupIndex],
        fields: [
          ...newGroups[groupIndex].fields,
          {
            fieldName: `field_${Date.now()}`,
            fieldLabel: `Field ${newGroups[groupIndex].fields.length + 1}`,
            fieldType: "text",
            isRequired: false
          }
        ]
      };
      return { ...prev, groups: newGroups };
    });
  };

  // Remove a field from a group
  const removeField = (groupIndex: number, fieldIndex: number) => {
    setTemplateSchema(prev => {
      const newGroups = [...prev.groups];
      newGroups[groupIndex] = {
        ...newGroups[groupIndex],
        fields: newGroups[groupIndex].fields.filter((_, i) => i !== fieldIndex)
      };
      return { ...prev, groups: newGroups };
    });
  };

  // Update a field
  const updateField = (groupIndex: number, fieldIndex: number, field: Partial<FieldDefinition>) => {
    setTemplateSchema(prev => {
      const newGroups = [...prev.groups];
      newGroups[groupIndex] = {
        ...newGroups[groupIndex],
        fields: newGroups[groupIndex].fields.map((f, i) => {
          if (i === fieldIndex) {
            return { ...f, ...field };
          }
          return f;
        })
      };
      return { ...prev, groups: newGroups };
    });
  };

  // Move field up
  const moveFieldUp = (groupIndex: number, fieldIndex: number) => {
    if (fieldIndex === 0) return;
    
    setTemplateSchema(prev => {
      const newGroups = [...prev.groups];
      const fields = [...newGroups[groupIndex].fields];
      const temp = fields[fieldIndex];
      fields[fieldIndex] = fields[fieldIndex - 1];
      fields[fieldIndex - 1] = temp;
      
      newGroups[groupIndex] = {
        ...newGroups[groupIndex],
        fields
      };
      
      return { ...prev, groups: newGroups };
    });
  };

  // Move field down
  const moveFieldDown = (groupIndex: number, fieldIndex: number) => {
    const fields = templateSchema.groups[groupIndex].fields;
    if (fieldIndex === fields.length - 1) return;
    
    setTemplateSchema(prev => {
      const newGroups = [...prev.groups];
      const fields = [...newGroups[groupIndex].fields];
      const temp = fields[fieldIndex];
      fields[fieldIndex] = fields[fieldIndex + 1];
      fields[fieldIndex + 1] = temp;
      
      newGroups[groupIndex] = {
        ...newGroups[groupIndex],
        fields
      };
      
      return { ...prev, groups: newGroups };
    });
  };

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof templateDetailsSchema>) => {
    try {
      // Validate that there are fields in the template
      if (templateSchema.groups.every(group => group.fields.length === 0)) {
        alert("Please add at least one field to your template");
        return;
      }

      // Prepare the final data for submission
      const templateData = {
        ...data,
        dynamicSchema: templateSchema
      };

      // Send data to API
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateData),
      });

      if (!response.ok) {
        throw new Error('Failed to create template');
      }

      // Navigate to templates list on success
      router.push('/dashboard/templates');
      
    } catch (error) {
      console.error('Error creating template:', error);
      alert('Failed to create template. Please try again.');
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Create LogBook Template</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Template Details</CardTitle>
              <CardDescription>
                Define the basic information for your logbook template
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter template name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter template description" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="templateType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="general" id="general" />
                          <Label htmlFor="general">General Template</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="subject" id="subject" />
                          <Label htmlFor="subject">Subject-Specific Template</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {templateType === "subject" && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="academicYearId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Academic Year</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Academic Year" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {academicYears.map((year) => (
                              <SelectItem key={year.id} value={year.id}>
                                {year.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phaseId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phase/Batch</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          disabled={!form.watch("academicYearId")}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Phase/Batch" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {phases.map((phase) => (
                              <SelectItem key={phase.id} value={phase.id}>
                                {phase.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subjectId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          disabled={!form.watch("phaseId")}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Subject" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {subjects.map((subject) => (
                              <SelectItem key={subject.id} value={subject.id}>
                                {subject.name} ({subject.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="teacherSubjectId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teacher Assignment (Optional)</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          disabled={!form.watch("subjectId")}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Teacher Assignment" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {teacherSubjects.map((ts) => (
                              <SelectItem key={ts.id} value={ts.id}>
                                {/* Replace with actual teacher name from your data */}
                                Teacher ID: {ts.teacherId}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Form Builder</CardTitle>
              <CardDescription>
                Design your logbook template by adding fields and organizing them into groups
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {templateSchema.groups.map((group, groupIndex) => (
                  <div key={groupIndex} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <Input
                        value={group.groupName}
                        onChange={(e) => updateGroupName(groupIndex, e.target.value)}
                        className="font-semibold w-64"
                      />
                      {templateSchema.groups.length > 1 && (
                        <Button 
                          type="button" 
                          variant="destructive" 
                          size="sm"
                          onClick={() => removeGroup(groupIndex)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Remove Group
                        </Button>
                      )}
                    </div>

                    {group.fields.length === 0 ? (
                      <Alert className="mb-4">
                        <AlertDescription>
                          No fields added to this group yet. Click "Add Field" below to get started.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <div className="space-y-4">
                        {group.fields.map((field, fieldIndex) => (
                          <div key={fieldIndex} className="border rounded p-4 bg-gray-50">
                            <div className="grid grid-cols-12 gap-4">
                              <div className="col-span-4">
                                <Label>Field Label</Label>
                                <Input
                                  value={field.fieldLabel}
                                  onChange={(e) => updateField(groupIndex, fieldIndex, { fieldLabel: e.target.value })}
                                  className="mt-1"
                                />
                              </div>
                              <div className="col-span-3">
                                <Label>Field Name (ID)</Label>
                                <Input
                                  value={field.fieldName}
                                  onChange={(e) => updateField(groupIndex, fieldIndex, { fieldName: e.target.value })}
                                  className="mt-1"
                                />
                              </div>
                              <div className="col-span-3">
                                <Label>Field Type</Label>
                                <Select
                                  value={field.fieldType}
                                  onValueChange={(value) => updateField(groupIndex, fieldIndex, { 
                                    fieldType: value as FieldDefinition["fieldType"] 
                                  })}
                                >
                                  <SelectTrigger className="mt-1">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="text">Text</SelectItem>
                                    <SelectItem value="number">Number</SelectItem>
                                    <SelectItem value="date">Date</SelectItem>
                                    <SelectItem value="select">Dropdown</SelectItem>
                                    <SelectItem value="textarea">Text Area</SelectItem>
                                    <SelectItem value="file">File Upload</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="col-span-2 flex justify-end items-end space-x-1">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={() => moveFieldUp(groupIndex, fieldIndex)}
                                  disabled={fieldIndex === 0}
                                >
                                  <MoveUp className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={() => moveFieldDown(groupIndex, fieldIndex)}
                                  disabled={fieldIndex === group.fields.length - 1}
                                >
                                  <MoveDown className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={() => removeField(groupIndex, fieldIndex)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            <div className="mt-2">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`required-${groupIndex}-${fieldIndex}`}
                                  checked={field.isRequired}
                                  onCheckedChange={(checked) => 
                                    updateField(groupIndex, fieldIndex, { isRequired: !!checked })
                                  }
                                />
                                <Label htmlFor={`required-${groupIndex}-${fieldIndex}`}>Required Field</Label>
                              </div>
                            </div>

                            {field.fieldType === "select" && (
                              <div className="mt-2">
                                <Label>Options (comma separated)</Label>
                                <Input
                                  value={field.options?.join(", ") || ""}
                                  onChange={(e) => {
                                    const options = e.target.value.split(",").map(opt => opt.trim()).filter(Boolean);
                                    updateField(groupIndex, fieldIndex, { options });
                                  }}
                                  className="mt-1"
                                  placeholder="Option 1, Option 2, Option 3"
                                />
                              </div>
                            )}

                            {(field.fieldType === "text" || field.fieldType === "number") && (
                              <div className="mt-2">
                                <Label>Default Value (optional)</Label>
                                <Input
                                  value={field.defaultValue || ""}
                                  onChange={(e) => updateField(groupIndex, fieldIndex, { defaultValue: e.target.value })}
                                  className="mt-1"
                                  type={field.fieldType === "number" ? "number" : "text"}
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addField(groupIndex)}
                      className="mt-4"
                    >
                      <PlusCircle className="h-4 w-4 mr-1" /> Add Field
                    </Button>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addGroup}
                  className="mt-2"
                >
                  <PlusCircle className="h-4 w-4 mr-1" /> Add Group
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-1" /> Save Template
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}