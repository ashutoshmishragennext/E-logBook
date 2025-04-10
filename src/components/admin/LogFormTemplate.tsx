/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Stethoscope, ArrowUp, ArrowDown } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCurrentUser } from "@/hooks/auth";

// Predefined medical field types
const MEDICAL_FIELD_TYPES = [
  { value: "text", label: "Text Input" },
  { value: "number", label: "Numeric Input" },
  { value: "date", label: "Date" },
  { value: "textarea", label: "Long Text" },
  { value: "select", label: "Dropdown Selection" },
  { value: "checkbox", label: "Checkbox" },
];

// Updated Zod schema to include sequence number
const LogBookTemplateSchema = z.object({
  academicYearId: z.string().min(1, "Academic year is required"),
  batchId: z.string().min(1, "Batch is required"),
  subjectId: z.string().min(1, "Subject is required"),
  moduleId: z.string().min(1, "Module is required"),
  templateName: z.string().min(1, "Template name is required"),
  name: z.string().min(1, "Name is required"),
  department: z.string().min(1, "Department is required"),
  description: z.string().optional(),
  dynamicSchema: z
    .object({
      groups: z.array(
        z.object({
          name: z.string().min(1, "Group name is required"),
          sequence: z.number(), // Added sequence field
          fields: z.array(
            z.object({
              label: z.string().min(1, "Field label is required"),
              type: z.enum([
                "text",
                "number",
                "date",
                "textarea",
                "select",
                "checkbox",
              ]),
              required: z.boolean().optional(),
              options: z.array(z.string()).optional(),
            })
          ),
        })
      ),
    })
    .optional(),
});

type AcademicYear = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
};

type Batch = {
  id: string;
  name: string;
  academicYearId: string;
};

type Subject = {
  id: string;
  name: string;
  code: string;
  batchId: string;
};

type Module = {
  id: string;
  name: string;
  subjectId: string;
};

export default function LogBookTemplateForm() {
  const user = useCurrentUser();
  const userId = user?.id || "current-user-id";

  // State for dropdown options
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState({
    academicYears: true,
    batches: true,
    subjects: true,
    modules: true,
  });

  // Form state and validation
  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(LogBookTemplateSchema),
    defaultValues: {
      academicYearId: "",
      batchId: "",
      subjectId: "",
      moduleId: "",
      templateName: "",
      name: "",
      department: "",
      description: "",
      dynamicSchema: { groups: [] },
    },
  });

  // Watch selected values
  const selectedAcademicYearId = watch("academicYearId");
  const selectedBatchId = watch("batchId");
  const selectedSubjectId = watch("subjectId");

  // Fetch academic years on mount
  useEffect(() => {
    const fetchAcademicYears = async () => {
      try {
        const response = await fetch("/api/academicYears");
        if (response.ok) {
          const data = await response.json();
          setAcademicYears(data);
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
      if (!selectedAcademicYearId) {
        setBatches([]);
        setValue("batchId", "");
        setLoading((prev) => ({ ...prev, batches: false }));
        return;
      }

      try {
        setLoading((prev) => ({ ...prev, batches: true }));
        const response = await fetch(
          `/api/phase?academicYears=${selectedAcademicYearId}`
        );
        if (response.ok) {
          const data = await response.json();
          setBatches(data);
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
  }, [selectedAcademicYearId, setValue]);

  // Fetch subjects when batch changes
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!selectedBatchId) {
        setSubjects([]);
        setValue("subjectId", "");
        setLoading((prev) => ({ ...prev, subjects: false }));
        return;
      }

      try {
        setLoading((prev) => ({ ...prev, subjects: true }));
        const response = await fetch(`/api/subject?PhaseId=${selectedBatchId}`);
        if (response.ok) {
          const data = await response.json();
          setSubjects(data);
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
  }, [selectedBatchId, setValue]);

  // Fetch modules when subject changes
  useEffect(() => {
    const fetchModules = async () => {
      if (!selectedSubjectId) {
        setModules([]);
        setValue("moduleId", "");
        setLoading((prev) => ({ ...prev, modules: false }));
        return;
      }

      try {
        setLoading((prev) => ({ ...prev, modules: true }));
        const response = await fetch(
          `/api/module?subjectId=${selectedSubjectId}`
        );
        if (response.ok) {
          const data = await response.json();
          setModules(data);
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
  }, [selectedSubjectId, setValue]);

  // State to manage dropdown option input
  const [dropdownOptionInput, setDropdownOptionInput] = useState<{
    [key: string]: string;
  }>({});

  // Add a new group to dynamic schema with sequence number
  const addGroup = () => {
    const currentGroups = watch("dynamicSchema.groups") || [];
    const newSequence =
      currentGroups.length > 0
        ? Math.max(...currentGroups.map((group) => group.sequence)) + 1
        : 1;

    setValue("dynamicSchema.groups", [
      ...currentGroups,
      {
        name: "",
        sequence: newSequence, // Set sequence for new group
        fields: [
          {
            label: "",
            type: "text",
            required: false,
          },
        ],
      },
    ]);
  };

  // Remove a group from dynamic schema
  const removeGroup = (groupIndex: number) => {
    const currentGroups = watch("dynamicSchema.groups") || [];
    const updatedGroups = currentGroups.filter(
      (_, index) => index !== groupIndex
    );

    // No need to update sequences as we'll sort by sequence when submitting
    setValue("dynamicSchema.groups", updatedGroups);
  };

  // Move group up in sequence
  const moveGroupUp = (groupIndex: number) => {
    if (groupIndex === 0) return; // Already at top

    const currentGroups = [...(watch("dynamicSchema.groups") || [])];
    const currentSequence = currentGroups[groupIndex].sequence;
    const prevSequence = currentGroups[groupIndex - 1].sequence;

    // Swap sequences
    currentGroups[groupIndex].sequence = prevSequence;
    currentGroups[groupIndex - 1].sequence = currentSequence;

    // Sort groups by sequence
    const sortedGroups = [...currentGroups].sort(
      (a, b) => a.sequence - b.sequence
    );
    setValue("dynamicSchema.groups", sortedGroups);
  };

  // Move group down in sequence
  const moveGroupDown = (groupIndex: number) => {
    const currentGroups = watch("dynamicSchema.groups") || [];
    if (groupIndex === currentGroups.length - 1) return; // Already at bottom

    const groupsCopy = [...currentGroups];
    const currentSequence = groupsCopy[groupIndex].sequence;
    const nextSequence = groupsCopy[groupIndex + 1].sequence;

    // Swap sequences
    groupsCopy[groupIndex].sequence = nextSequence;
    groupsCopy[groupIndex + 1].sequence = currentSequence;

    // Sort groups by sequence
    const sortedGroups = [...groupsCopy].sort(
      (a, b) => a.sequence - b.sequence
    );
    setValue("dynamicSchema.groups", sortedGroups);
  };

  // Add a field to a specific group
  const addField = (groupIndex: number) => {
    const currentGroups = watch("dynamicSchema.groups") || [];
    const updatedGroups = [...currentGroups];
    updatedGroups[groupIndex].fields.push({
      label: "",
      type: "text",
      required: false,
    });
    setValue("dynamicSchema.groups", updatedGroups);
  };

  // Remove a field from a specific group
  const removeField = (groupIndex: number, fieldIndex: number) => {
    const currentGroups = watch("dynamicSchema.groups") || [];
    const updatedGroups = [...currentGroups];
    updatedGroups[groupIndex].fields = updatedGroups[groupIndex].fields.filter(
      (_, index) => index !== fieldIndex
    );
    setValue("dynamicSchema.groups", updatedGroups);
  };

  // Add dropdown option
  const addDropdownOption = (groupIndex: number, fieldIndex: number) => {
    const currentGroups = watch("dynamicSchema.groups") || [];
    const updatedGroups = [...currentGroups];
    const currentOptions =
      updatedGroups[groupIndex].fields[fieldIndex].options || [];

    const newOptionKey = `${groupIndex}-${fieldIndex}-${currentOptions.length}`;
    const newOption = dropdownOptionInput[newOptionKey] || "";

    if (newOption.trim()) {
      updatedGroups[groupIndex].fields[fieldIndex].options = [
        ...currentOptions,
        newOption,
      ];
      setValue("dynamicSchema.groups", updatedGroups);

      // Clear the input
      const updatedOptionInput = { ...dropdownOptionInput };
      delete updatedOptionInput[newOptionKey];
      setDropdownOptionInput(updatedOptionInput);
    }
  };

  // Remove dropdown option
  const removeDropdownOption = (
    groupIndex: number,
    fieldIndex: number,
    optionIndex: number
  ) => {
    const currentGroups = watch("dynamicSchema.groups") || [];
    const updatedGroups = [...currentGroups];
    updatedGroups[groupIndex].fields[fieldIndex].options = updatedGroups[
      groupIndex
    ].fields[fieldIndex].options?.filter((_, idx) => idx !== optionIndex);
    setValue("dynamicSchema.groups", updatedGroups);
  };

  // Update name field when templateName changes
  React.useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "templateName") {
        setValue("name", value.templateName || "");
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setValue]);

  // Submit form handler
  const onSubmit = async (data: any) => {
    try {
      // Ensure all required fields are present
      const formData = {
        ...data,
        name: data.templateName, // Ensure name matches templateName
        createdBy: userId,
      };

      // Validate dynamic schema - ensure all groups have names and fields have labels
      if (formData.dynamicSchema?.groups) {
        // First filter out invalid groups and fields
        formData.dynamicSchema.groups = formData.dynamicSchema.groups
          .filter((group: { name: string }) => group.name.trim() !== "") // Remove empty groups
          .map((group: { fields: any[] }) => ({
            ...group,
            fields: group.fields.filter(
              (field: { label: string }) => field.label.trim() !== ""
            ), // Remove empty fields
          }))
          .filter(
            (group: { fields: string | any[] }) => group.fields.length > 0
          ); // Remove groups with no fields

        // Then sort groups by sequence number to preserve order
        formData.dynamicSchema.groups.sort(
          (a: { sequence: number }, b: { sequence: number }) =>
            a.sequence - b.sequence
        );
      }

      console.log("Submitting form data:", formData);

      const response = await fetch("/api/log-book-template", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Medical Log Book Template Created Successfully!");
        // Optional: Reset form or navigate away
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || "Failed to create template"}`);
      }
    } catch (error) {
      console.error("Submission error", error);
      alert("Failed to create medical log book template");
    }
  };

  return (
    <div className="h-full w-full flex flex-col p-6 bg-gray-50">
      <Card className="w-full h-full flex flex-col">
        <CardHeader className="border-b p-4">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <Stethoscope className="mr-2 h-6 w-6 text-primary" />
              Create Medical Log Book Template
            </CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addGroup}
                    className="hover:bg-primary/10"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Group
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add a new group to your medical log book template</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent className="flex-grow overflow-y-auto p-4 space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Academic Hierarchy Selection */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Academic Year */}
                  <div className="space-y-2">
                    <Label htmlFor="academicYear">Academic Year</Label>
                    <Controller
                      name="academicYearId"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={loading.academicYears}
                        >
                          <SelectTrigger id="academicYear">
                            <SelectValue placeholder="Select Academic Year" />
                          </SelectTrigger>
                          <SelectContent>
                            {academicYears.length > 0 ? (
                              academicYears.map((year) => (
                                <SelectItem key={year.id} value={year.id}>
                                  {year.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="Loading" disabled>
                                {loading.academicYears
                                  ? "Loading..."
                                  : "No academic years found"}
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.academicYearId && (
                      <p className="text-destructive text-sm mt-1">
                        {errors.academicYearId.message}
                      </p>
                    )}
                    {!loading.academicYears && academicYears.length === 0 && (
                      <Button
                        type="button"
                        variant="link"
                        className="text-sm p-0 h-auto"
                        onClick={() => {
                          // Navigate to create academic year page or open a modal
                          console.log("Navigate to create academic year");
                        }}
                      >
                        + Create New Academic Year
                      </Button>
                    )}
                  </div>

                  {/* Batch/Phase */}
                  <div className="space-y-2">
                    <Label htmlFor="batch">Batch/Phase</Label>
                    <Controller
                      name="batchId"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={!selectedAcademicYearId || loading.batches}
                        >
                          <SelectTrigger id="batch">
                            <SelectValue placeholder="Select Batch" />
                          </SelectTrigger>
                          <SelectContent>
                            {batches.length > 0 ? (
                              batches.map((batch) => (
                                <SelectItem key={batch.id} value={batch.id}>
                                  {batch.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="loading" disabled>
                                {loading.batches
                                  ? "Loading..."
                                  : selectedAcademicYearId
                                  ? "No batches found"
                                  : "Select academic year first"}
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.batchId && (
                      <p className="text-destructive text-sm mt-1">
                        {errors.batchId.message}
                      </p>
                    )}
                    {!loading.batches &&
                      batches.length === 0 &&
                      selectedAcademicYearId && (
                        <Button
                          type="button"
                          variant="link"
                          className="text-sm p-0 h-auto"
                          onClick={() => {
                            // Navigate to create batch page or open a modal
                            console.log("Navigate to create batch");
                          }}
                        >
                          + Create New Batch
                        </Button>
                      )}
                  </div>

                  {/* Subject */}
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Controller
                      name="subjectId"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={!selectedBatchId || loading.subjects}
                        >
                          <SelectTrigger id="subject">
                            <SelectValue placeholder="Select Subject" />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects.length > 0 ? (
                              subjects.map((subject) => (
                                <SelectItem key={subject.id} value={subject.id}>
                                  {subject.name} ({subject.code})
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="loading" disabled>
                                {loading.subjects
                                  ? "Loading..."
                                  : selectedBatchId
                                  ? "No subjects found"
                                  : "Select batch first"}
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.subjectId && (
                      <p className="text-destructive text-sm mt-1">
                        {errors.subjectId.message}
                      </p>
                    )}
                    {!loading.subjects &&
                      subjects.length === 0 &&
                      selectedBatchId && (
                        <Button
                          type="button"
                          variant="link"
                          className="text-sm p-0 h-auto"
                          onClick={() => {
                            // Navigate to create subject page or open a modal
                            console.log("Navigate to create subject");
                          }}
                        >
                          + Create New Subject
                        </Button>
                      )}
                  </div>

                  {/* Module */}
                  <div className="space-y-2">
                    <Label htmlFor="module">Module</Label>
                    <Controller
                      name="moduleId"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={!selectedSubjectId || loading.modules}
                        >
                          <SelectTrigger id="module">
                            <SelectValue placeholder="Select Module" />
                          </SelectTrigger>
                          <SelectContent>
                            {modules.length > 0 ? (
                              modules.map((module) => (
                                <SelectItem key={module.id} value={module.id}>
                                  {module.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="loading" disabled>
                                {loading.modules
                                  ? "Loading..."
                                  : selectedSubjectId
                                  ? "No modules found"
                                  : "Select subject first"}
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.moduleId && (
                      <p className="text-destructive text-sm mt-1">
                        {errors.moduleId.message}
                      </p>
                    )}
                    {!loading.modules &&
                      modules.length === 0 &&
                      selectedSubjectId && (
                        <Button
                          type="button"
                          variant="link"
                          className="text-sm p-0 h-auto"
                          onClick={() => {
                            // Navigate to create module page or open a modal
                            console.log("Navigate to create module");
                          }}
                        >
                          + Create New Module
                        </Button>
                      )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Template Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="templateName" className="mb-2 block">
                  Template Name
                </Label>
                <Input
                  id="templateName"
                  {...register("templateName")}
                  placeholder="Enter template name"
                  className="focus:ring-2 focus:ring-primary/50"
                />
                {errors.templateName && (
                  <p className="text-destructive text-sm mt-1">
                    {errors.templateName.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="department" className="mb-2 block">
                  Department
                </Label>
                <Controller
                  name="department"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="department">
                        <SelectValue placeholder="Select Department" />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "Internal Medicine",
                          "Pediatrics",
                          "Cardiology",
                          "Neurology",
                          "Oncology",
                          "Emergency Medicine",
                          "Other",
                        ].map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.department && (
                  <p className="text-destructive text-sm mt-1">
                    {errors.department.message}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="mb-2 block">
                Description (Optional)
              </Label>
              <Input
                id="description"
                {...register("description")}
                placeholder="Enter template description"
                className="focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Dynamic Schema Builder */}
            <div className="space-y-4">
              {watch("dynamicSchema.groups")?.map((group, groupIndex) => (
                <Card key={groupIndex} className="border-primary/20 shadow-sm">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="w-full mr-2">
                        <div className="flex items-center mb-2">
                          <div className="flex-shrink-0 mr-2 bg-primary/10 px-2 py-1 rounded text-primary font-medium">
                            {group.sequence}
                          </div>
                          <Label
                            htmlFor={`group-${groupIndex}`}
                            className="block"
                          >
                            Group Name
                          </Label>
                        </div>
                        <Input
                          id={`group-${groupIndex}`}
                          placeholder="Enter Group Name"
                          {...register(
                            `dynamicSchema.groups.${groupIndex}.name`
                          )}
                          className="w-full focus:ring-2 focus:ring-primary/50"
                        />
                        {errors.dynamicSchema?.groups?.[groupIndex]?.name && (
                          <p className="text-destructive text-sm mt-1">
                            {
                              errors.dynamicSchema.groups[groupIndex].name
                                .message
                            }
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2 mt-6">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => moveGroupUp(groupIndex)}
                                disabled={groupIndex === 0}
                                className={
                                  groupIndex === 0
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                                }
                              >
                                <ArrowUp className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Move group up</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => moveGroupDown(groupIndex)}
                                disabled={
                                  groupIndex ===
                                  watch("dynamicSchema.groups")?.length - 1
                                }
                                className={
                                  groupIndex ===
                                  watch("dynamicSchema.groups")?.length - 1
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                                }
                              >
                                <ArrowDown className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Move group down</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                onClick={() => removeGroup(groupIndex)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Remove this group</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>

                    {/* Hidden field to store sequence */}
                    <input
                      type="hidden"
                      {...register(
                        `dynamicSchema.groups.${groupIndex}.sequence` as const
                      )}
                    />

                    {/* Fields within Group */}
                    <div className="space-y-2">
                      {group.fields.map((field, fieldIndex) => (
                        <div key={fieldIndex} className="space-y-2">
                          <div className="flex items-center space-x-2">
                            {/* Field Label */}
                            <div className="flex-grow">
                              <Input
                                placeholder="Field Label"
                                {...register(
                                  `dynamicSchema.groups.${groupIndex}.fields.${fieldIndex}.label`
                                )}
                                className="focus:ring-2 focus:ring-primary/50"
                              />
                              {errors.dynamicSchema?.groups?.[groupIndex]
                                ?.fields?.[fieldIndex]?.label && (
                                <p className="text-destructive text-sm mt-1">
                                  Field label is required
                                </p>
                              )}
                            </div>

                            {/* Field Type Select */}
                            <Controller
                              name={`dynamicSchema.groups.${groupIndex}.fields.${fieldIndex}.type`}
                              control={control}
                              render={({ field }) => (
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <SelectTrigger className="w-44">
                                    <SelectValue placeholder="Field Type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {MEDICAL_FIELD_TYPES.map((type) => (
                                      <SelectItem
                                        key={type.value}
                                        value={type.value}
                                      >
                                        {type.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            />

                            {/* Required Field Switch */}
                            <div className="flex items-center space-x-1">
                              <Controller
                                name={`dynamicSchema.groups.${groupIndex}.fields.${fieldIndex}.required`}
                                control={control}
                                render={({ field }) => (
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    id={`required-${groupIndex}-${fieldIndex}`}
                                  />
                                )}
                              />
                              <Label
                                htmlFor={`required-${groupIndex}-${fieldIndex}`}
                                className="text-sm"
                              >
                                Required
                              </Label>
                            </div>

                            {/* Delete Button with Tooltip */}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    onClick={() =>
                                      removeField(groupIndex, fieldIndex)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Remove this field</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>

                          {/* Dropdown Options Section */}
                          {watch(
                            `dynamicSchema.groups.${groupIndex}.fields.${fieldIndex}.type`
                          ) === "select" && (
                            <div className="ml-4 mt-2 border rounded-md p-3 bg-gray-50">
                              <h4 className="font-medium text-sm mb-2">
                                Dropdown Options
                              </h4>
                              <div className="flex items-center space-x-2 mb-2">
                                <Input
                                  placeholder="Add option"
                                  value={
                                    dropdownOptionInput[
                                      `${groupIndex}-${fieldIndex}-${
                                        watch(
                                          `dynamicSchema.groups.${groupIndex}.fields.${fieldIndex}.options`
                                        )?.length || 0
                                      }`
                                    ] || ""
                                  }
                                  onChange={(e) =>
                                    setDropdownOptionInput({
                                      ...dropdownOptionInput,
                                      [`${groupIndex}-${fieldIndex}-${
                                        watch(
                                          `dynamicSchema.groups.${groupIndex}.fields.${fieldIndex}.options`
                                        )?.length || 0
                                      }`]: e.target.value,
                                    })
                                  }
                                  className="flex-grow"
                                />
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    addDropdownOption(groupIndex, fieldIndex)
                                  }
                                >
                                  Add
                                </Button>
                              </div>
                              <div>
                                {watch(
                                  `dynamicSchema.groups.${groupIndex}.fields.${fieldIndex}.options`
                                )?.map((option, optionIndex) => (
                                  <div
                                    key={optionIndex}
                                    className="flex items-center justify-between mb-1 bg-white p-2 rounded-md"
                                  >
                                    <span>{option}</span>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() =>
                                        removeDropdownOption(
                                          groupIndex,
                                          fieldIndex,
                                          optionIndex
                                        )
                                      }
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Add Field Button */}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addField(groupIndex)}
                      className="w-full mt-2"
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Field
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-center mt-4 mb-2">
              <Button
                type="button"
                variant="outline"
                onClick={addGroup}
                className="bg-primary/5 hover:bg-primary/10 border-primary/20 transition-all"
              >
                <Plus className="mr-2 h-5 w-5" /> Add Group
              </Button>
            </div>

            {/* Submit Button */}
            <div className="mt-8">
              <Button type="submit" className="w-full">
                Create Medical Log Book Template
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
