// src/components/templates/TemplatePreview.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { LogBookTemplateSchema, FieldDefinition } from "./types";

interface TemplatePreviewProps {
  templateSchema: LogBookTemplateSchema;
  title?: string;
  description?: string;
}

export function TemplatePreview({ 
  templateSchema, 
  title = "Template Preview", 
  description = "Preview how your logbook template will appear to users"
}: TemplatePreviewProps) {
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  // Handle input change
  const handleInputChange = (fieldName: string, value: string | number | Date) => {
    setFormValues(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  // Render a field based on its type
  const renderField = (field: FieldDefinition) => {
    switch (field.fieldType) {
      case "text":
        return (
          <Input
            id={field.fieldName}
            placeholder={`Enter ${field.fieldLabel.toLowerCase()}`}
            defaultValue={field.defaultValue as string}
            onChange={(e) => handleInputChange(field.fieldName, e.target.value)}
            required={field.isRequired}
          />
        );
      case "textarea":
        return (
          <Textarea
            id={field.fieldName}
            placeholder={`Enter ${field.fieldLabel.toLowerCase()}`}
            defaultValue={field.defaultValue as string}
            onChange={(e) => handleInputChange(field.fieldName, e.target.value)}
            required={field.isRequired}
          />
        );
      case "number":
        return (
          <Input
            id={field.fieldName}
            type="number"
            placeholder={`Enter ${field.fieldLabel.toLowerCase()}`}
            defaultValue={field.defaultValue as number}
            onChange={(e) => handleInputChange(field.fieldName, parseFloat(e.target.value))}
            required={field.isRequired}
          />
        );
      case "date":
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : `Select ${field.fieldLabel.toLowerCase()}`}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date);
                  handleInputChange(field.fieldName, date as Date);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );
      case "select":
        return (
          <Select
            onValueChange={(value) => handleInputChange(field.fieldName, value)}
            defaultValue={field.defaultValue as string}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${field.fieldLabel.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "file":
        return (
          <Input
            id={field.fieldName}
            type="file"
            required={field.isRequired}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-8">
          {templateSchema.groups.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-4">
              <h3 className="text-lg font-medium">{group.groupName}</h3>
              <div className="grid gap-4">
                {group.fields.map((field, fieldIndex) => (
                  <div key={fieldIndex} className="space-y-2">
                    <Label 
                      htmlFor={field.fieldName}
                      className={field.isRequired ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}
                    >
                      {field.fieldLabel}
                    </Label>
                    {renderField(field)}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="flex justify-end">
            <Button type="button">Submit Logbook Entry</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}