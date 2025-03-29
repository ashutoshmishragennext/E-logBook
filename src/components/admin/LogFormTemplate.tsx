import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Stethoscope } from "lucide-react";
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

// Zod schema for medical log book template
const LogBookTemplateSchema = z.object({
  academicYearId: z.string(),
  batchId: z.string(),
  subjectId: z.string(),
  moduleId: z.string(),
  templateName: z.string().min(1, "Template name is required"),
  name: z.string().min(1, "Name is required"),
  department: z.string().min(1, "Department is required"),
  description: z.string().optional(),
  dynamicSchema: z
    .object({
      groups: z.array(
        z.object({
          name: z.string().min(1, "Group name is required"),
          fields: z.array(
            z.object({
              label: z.string().min(1, "Field label is required"),
              type: z.enum(["text", "number", "date", "textarea", "select", "checkbox"]),
              required: z.boolean().optional(),
              options: z.array(z.string()).optional(),
            })
          ),
        })
      ),
    })
    .optional(),
});

export default function MedicalLogBookTemplateForm() {
  const ACADEMIC_YEAR_ID = "2f8ab354-1f21-4d0f-ad41-87a39e44b0be";
  const BATCH_ID = "86f6cdd7-281c-4eba-b423-e835360b012e";
  const MODULE_ID = "13f35a6b-2c2a-4386-b99e-d5685127afe2";
  const SUBJECT_ID = "e92e5996-bfcc-4097-8605-63dd00f4156c";
  const user = useCurrentUser();
  const userId = user?.id || "current-user-id"; // Replace with actual user ID
  
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
      academicYearId: ACADEMIC_YEAR_ID,
      batchId: BATCH_ID,
      subjectId: SUBJECT_ID,
      moduleId: MODULE_ID,
      templateName: "",
      name: "",
      department: "",
      description: "",
      dynamicSchema: { groups: [] },
    },
  });

  // State to manage dropdown option input
  const [dropdownOptionInput, setDropdownOptionInput] = useState<{
    [key: string]: string;
  }>({});

  // Add a new group to dynamic schema
  const addGroup = () => {
    const currentGroups = watch("dynamicSchema.groups") || [];
    setValue("dynamicSchema.groups", [
      ...currentGroups,
      {
        name: "",
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
    setValue("dynamicSchema.groups", updatedGroups);
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
        academicYearId: ACADEMIC_YEAR_ID,
        batchId: BATCH_ID,
        subjectId: SUBJECT_ID,
        moduleId: MODULE_ID,
        createdBy: userId,
      };

      // Validate dynamic schema - ensure all groups have names and fields have labels
      if (formData.dynamicSchema?.groups) {
        formData.dynamicSchema.groups = formData.dynamicSchema.groups
          .filter((group: { name: string; }) => group.name.trim() !== "") // Remove empty groups
          .map((group: { fields: any[]; }) => ({
            ...group,
            fields: group.fields.filter((field: { label: string; }) => field.label.trim() !== "") // Remove empty fields
          }))
          .filter((group: { fields: string | any[]; }) => group.fields.length > 0); // Remove groups with no fields
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
                        <Label
                          htmlFor={`group-${groupIndex}`}
                          className="mb-2 block"
                        >
                          Group Name
                        </Label>
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
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="mt-6"
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

                    {/* Fields within Group */}
                    <div className="space-y-2">
                      {group.fields.map((field, fieldIndex) => (
                        <div key={fieldIndex} className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <div className="flex-grow">
                              <Input
                                placeholder="Field Label"
                                {...register(
                                  `dynamicSchema.groups.${groupIndex}.fields.${fieldIndex}.label`
                                )}
                                className="focus:ring-2 focus:ring-primary/50"
                              />
                            </div>
                            <div className="flex-grow">
                              <Controller
                                name={`dynamicSchema.groups.${groupIndex}.fields.${fieldIndex}.type`}
                                control={control}
                                render={({ field: selectField }) => (
                                  <Select
                                    onValueChange={selectField.onChange}
                                    defaultValue={selectField.value}
                                  >
                                    <SelectTrigger>
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
                            </div>
                            <div className="flex items-center space-x-2">
                              <Label
                                htmlFor={`required-${groupIndex}-${fieldIndex}`}
                              >
                                Required
                              </Label>
                              <Controller
                                name={`dynamicSchema.groups.${groupIndex}.fields.${fieldIndex}.required`}
                                control={control}
                                render={({ field: switchField }) => (
                                  <Switch
                                    id={`required-${groupIndex}-${fieldIndex}`}
                                    checked={switchField.value}
                                    onCheckedChange={switchField.onChange}
                                  />
                                )}
                              />
                            </div>
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

                          {/* Dropdown Options for Select Type */}
                          {watch(
                            `dynamicSchema.groups.${groupIndex}.fields.${fieldIndex}.type`
                          ) === "select" && (
                            <div className="space-y-2 pl-4">
                              <div className="flex space-x-2">
                                <Input
                                  placeholder="Enter dropdown option"
                                  value={
                                    dropdownOptionInput[
                                      `${groupIndex}-${fieldIndex}-${
                                        group.fields[fieldIndex].options
                                          ?.length || 0
                                      }`
                                    ] || ""
                                  }
                                  onChange={(e) => {
                                    const key = `${groupIndex}-${fieldIndex}-${
                                      group.fields[fieldIndex].options
                                        ?.length || 0
                                    }`;
                                    setDropdownOptionInput({
                                      ...dropdownOptionInput,
                                      [key]: e.target.value,
                                    });
                                  }}
                                  className="flex-grow focus:ring-2 focus:ring-primary/50"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() =>
                                    addDropdownOption(groupIndex, fieldIndex)
                                  }
                                >
                                  <Plus className="mr-2 h-4 w-4" /> Add Option
                                </Button>
                              </div>

                              {/* Existing Dropdown Options */}
                              {group.fields[fieldIndex].options?.map(
                                (option, optionIndex) => (
                                  <div
                                    key={optionIndex}
                                    className="flex items-center space-x-2"
                                  >
                                    <Input
                                      value={option}
                                      readOnly
                                      className="flex-grow"
                                    />
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="icon"
                                      onClick={() =>
                                        removeDropdownOption(
                                          groupIndex,
                                          fieldIndex,
                                          optionIndex
                                        )
                                      }
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => addField(groupIndex)}
                        className="mt-2 w-full hover:bg-primary/10"
                      >
                        <Plus className="mr-2 h-4 w-4" /> Add Field
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Display any form errors */}
            {Object.keys(errors).length > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <h3 className="text-red-600 font-medium mb-2">Form Errors:</h3>
                <pre className="text-sm text-red-500 whitespace-pre-wrap">
                  {JSON.stringify(errors, null, 2)}
                </pre>
              </div>
            )}

            <Button
              type="submit"
              className="w-full mt-4 bg-primary hover:bg-primary/90 transition-colors"
            >
              Create Medical Log Book Template
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}