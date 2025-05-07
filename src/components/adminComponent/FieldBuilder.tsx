// src/components/templates/FieldBuilder.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoveDown, MoveUp, PlusCircle, Trash2 } from "lucide-react";

// Import types
import { FieldDefinition, LogBookTemplateSchema } from "./types";

interface FieldBuilderProps {
  templateSchema: LogBookTemplateSchema;
  setTemplateSchema: React.Dispatch<
    React.SetStateAction<LogBookTemplateSchema>
  >;
}

export function FieldBuilder({
  templateSchema,
  setTemplateSchema,
}: FieldBuilderProps) {
  // Add a new group
  const addGroup = () => {
    setTemplateSchema((prev: { groups: string | any[] }) => ({
      ...prev,
      groups: [
        ...prev.groups,
        { groupName: `Group ${prev.groups.length + 1}`, fields: [] },
      ],
    }));
  };

  // Remove a group
  const removeGroup = (index: number) => {
    setTemplateSchema((prev: { groups: any[] }) => ({
      ...prev,
      groups: prev.groups.filter((_, i) => i !== index),
    }));
  };

  // Update group name
  const updateGroupName = (index: number, name: string) => {
    setTemplateSchema((prev: { groups: any }) => {
      const newGroups = [...prev.groups];
      newGroups[index] = { ...newGroups[index], groupName: name };
      return { ...prev, groups: newGroups };
    });
  };

  // Add a field to a group
  const addField = (groupIndex: number) => {
    setTemplateSchema((prev: { groups: any }) => {
      const newGroups = [...prev.groups];
      newGroups[groupIndex] = {
        ...newGroups[groupIndex],
        fields: [
          ...newGroups[groupIndex].fields,
          {
            fieldName: `field_${Date.now()}`,
            fieldLabel: `Field ${newGroups[groupIndex].fields.length + 1}`,
            fieldType: "text",
            isRequired: false,
          },
        ],
      };
      return { ...prev, groups: newGroups };
    });
  };

  // Remove a field from a group
  const removeField = (groupIndex: number, fieldIndex: number) => {
    setTemplateSchema((prev: { groups: any }) => {
      const newGroups = [...prev.groups];
      newGroups[groupIndex] = {
        ...newGroups[groupIndex],
        fields: newGroups[groupIndex].fields.filter(
          (_: any, i: number) => i !== fieldIndex
        ),
      };
      return { ...prev, groups: newGroups };
    });
  };

  // Update a field
  const updateField = (
    groupIndex: number,
    fieldIndex: number,
    field: Partial<FieldDefinition>
  ) => {
    setTemplateSchema((prev: { groups: any }) => {
      const newGroups = [...prev.groups];
      newGroups[groupIndex] = {
        ...newGroups[groupIndex],
        fields: newGroups[groupIndex].fields.map(
          (f: FieldDefinition, i: number) => {
            if (i === fieldIndex) {
              return { ...f, ...field };
            }
            return f;
          }
        ),
      };
      return { ...prev, groups: newGroups };
    });
  };

  // Move field up
  const moveFieldUp = (groupIndex: number, fieldIndex: number) => {
    if (fieldIndex === 0) return;

    setTemplateSchema((prev: { groups: any }) => {
      const newGroups = [...prev.groups];
      const fields = [...newGroups[groupIndex].fields];
      const temp = fields[fieldIndex];
      fields[fieldIndex] = fields[fieldIndex - 1];
      fields[fieldIndex - 1] = temp;

      newGroups[groupIndex] = {
        ...newGroups[groupIndex],
        fields,
      };

      return { ...prev, groups: newGroups };
    });
  };

  // Move field down
  const moveFieldDown = (groupIndex: number, fieldIndex: number) => {
    const fields = templateSchema.groups[groupIndex].fields;
    if (fieldIndex === fields.length - 1) return;

    setTemplateSchema((prev: { groups: any }) => {
      const newGroups = [...prev.groups];
      const fields = [...newGroups[groupIndex].fields];
      const temp = fields[fieldIndex];
      fields[fieldIndex] = fields[fieldIndex + 1];
      fields[fieldIndex + 1] = temp;

      newGroups[groupIndex] = {
        ...newGroups[groupIndex],
        fields,
      };

      return { ...prev, groups: newGroups };
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Form Builder</CardTitle>
      </CardHeader>
      <CardContent className="px-4 py-3">
        <div className="space-y-4">
          {templateSchema.groups.map((group, groupIndex) => (
            <div key={groupIndex} className="border rounded-md p-3">
              <div className="flex justify-between items-center mb-2">
                <Input
                  value={group.groupName}
                  onChange={(e) => updateGroupName(groupIndex, e.target.value)}
                  className="font-medium text-sm h-8 w-60"
                />
                {templateSchema.groups.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="h-8"
                    onClick={() => removeGroup(groupIndex)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
                  </Button>
                )}
              </div>

              {group.fields.length === 0 ? (
                <></>
              ) : (
                <div className="space-y-2">
                  {group.fields.map((field, fieldIndex) => (
                    <div
                      key={fieldIndex}
                      className="border rounded p-2 bg-muted/50"
                    >
                      <div className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-3">
                          <Label className="text-xs">Label</Label>
                          <Input
                            value={field.fieldLabel}
                            onChange={(e) =>
                              updateField(groupIndex, fieldIndex, {
                                fieldLabel: e.target.value,
                              })
                            }
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label className="text-xs">Name (ID)</Label>
                          <Input
                            value={field.fieldName}
                            onChange={(e) =>
                              updateField(groupIndex, fieldIndex, {
                                fieldName: e.target.value,
                              })
                            }
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label className="text-xs">Type</Label>
                          <Select
                            value={field.fieldType}
                            onValueChange={(value) =>
                              updateField(groupIndex, fieldIndex, {
                                fieldType:
                                  value as FieldDefinition["fieldType"],
                              })
                            }
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text" className="text-xs">
                                Text
                              </SelectItem>
                              <SelectItem value="number" className="text-xs">
                                Number
                              </SelectItem>
                              <SelectItem value="date" className="text-xs">
                                Date
                              </SelectItem>
                              <SelectItem value="select" className="text-xs">
                                Select
                              </SelectItem>
                              <SelectItem value="textarea" className="text-xs">
                                Text Area
                              </SelectItem>
                              <SelectItem value="file" className="text-xs">
                                File Upload
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-2 flex items-center space-x-2 mt-4">
                          <Checkbox
                            id={`required-${groupIndex}-${fieldIndex}`}
                            checked={field.isRequired}
                            onCheckedChange={(checked) =>
                              updateField(groupIndex, fieldIndex, {
                                isRequired: !!checked,
                              })
                            }
                            className="h-4 w-4"
                          />
                          <Label
                            htmlFor={`required-${groupIndex}-${fieldIndex}`}
                            className="text-xs"
                          >
                            Required
                          </Label>
                        </div>
                        <div className="col-span-3 flex justify-end space-x-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => moveFieldUp(groupIndex, fieldIndex)}
                            disabled={fieldIndex === 0}
                          >
                            <MoveUp className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() =>
                              moveFieldDown(groupIndex, fieldIndex)
                            }
                            disabled={fieldIndex === group.fields.length - 1}
                          >
                            <MoveDown className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => removeField(groupIndex, fieldIndex)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      {field.fieldType === "select" && (
                        <div className="mt-1">
                          <Label className="text-xs">
                            Options (one per line)
                          </Label>
                          <textarea
                            value={field.options?.join("\n") || ""}
                            onChange={(e) => {
                              const options = e.target.value
                                .split("\n")
                                .map((opt) => opt.trim())
                                .filter(Boolean);
                              updateField(groupIndex, fieldIndex, { options });
                            }}
                            className="w-full h-20 text-xs p-2 border rounded-md"
                            placeholder="Option 1&#10;Option 2&#10;Option 3"
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
                className="mt-2 h-8 text-xs"
              >
                <PlusCircle className="h-3.5 w-3.5 mr-1" /> Add Field
              </Button>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addGroup}
            className="mt-1 h-8 text-xs"
          >
            <PlusCircle className="h-3.5 w-3.5 mr-1" /> Add Group
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
