"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentUser } from "@/hooks/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { InfoIcon, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { FieldBuilder } from "./FieldBuilder";
import {
  GeneralTemplate,
  LogBookTemplateSchema,
  TemplateFormValues,
} from "./types";
import { toast } from 'sonner';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

// Form validation schema for general template details
const generalTemplateSchema = z.object({
  name: z.string().min(3, "Template name must be at least 3 characters"),
  description: z.string().optional(),
  templateType: z.literal("general"),
  createdBy: z.string(),
});

interface GeneralTemplateFormProps {
  initialData?: GeneralTemplate;
  onSuccess?: () => void;
}

export function GeneralTemplateForm({
  initialData,
  onSuccess,
}: GeneralTemplateFormProps) {
  const user = useCurrentUser();
  const userId = user?.id || "1875bc17-47cd-4273-a8d5-d2fd0503e702";
  const router = useRouter();
  const isEditing = !!initialData;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [templateSchema, setTemplateSchema] = useState<LogBookTemplateSchema>(
    initialData?.dynamicSchema || {
      groups: [{ groupName: "General Information", fields: [] }],
    }
  );

  const form = useForm<z.infer<typeof generalTemplateSchema>>({
    resolver: zodResolver(generalTemplateSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      templateType: "general",
      createdBy: userId,
    },
  });

  const onSubmit = async (data: z.infer<typeof generalTemplateSchema>) => {
    // Prevent multiple submissions
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      // Validate that at least one field exists
      if (templateSchema.groups.every((group) => group.fields.length === 0)) {
        toast.error("Please add at least one field to your template");
        return;
      }

      const templateData: TemplateFormValues = {
        ...data,
        dynamicSchema: templateSchema,
      };

      console.log("Submitting template data:", templateData); // Debug log

      const response = await fetch("/api/log-book-template", {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          isEditing ? { ...templateData, id: initialData.id } : templateData
        ),
      });

      const responseData = await response.json();
      console.log("API Response:", responseData); // Debug log

      if (!response.ok) {
        throw new Error(responseData?.message || `HTTP error! status: ${response.status}`);
      }

      // Success handling
      toast.success(isEditing ? "Template updated successfully!" : "Template created successfully!");
      
      // Reset form and template schema after successful save
      if (!isEditing) {
        form.reset({
          name: "",
          description: "",
          templateType: "general",
          createdBy: userId,
        });
        setTemplateSchema({
          groups: [{ groupName: "General Information", fields: [] }],
        });
      }
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      } else {
        // Optional: redirect or refresh page if no callback
        router.refresh();
      }

    } catch (error) {
      console.error("Error saving template:", error); // Debug log
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Error saving template: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    form.handleSubmit(onSubmit)();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">General Templates</h2>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>

      <Alert className="bg-blue-50 border-blue-200">
        <InfoIcon className="h-4 w-4 text-blue-500" />
        <AlertTitle className="text-blue-800">About General Templates</AlertTitle>
        <AlertDescription className="text-blue-700">
          <div className="space-y-2">
            <p>
              <strong>General Templates</strong> are reusable form structures that can be applied to multiple log books or records.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Create custom fields to capture specific information</li>
              <li>Organize fields into logical groups</li>
              <li>Set fields as required or optional</li>
              <li>Choose from different field types (text, number, date, etc.)</li>
            </ul>
            <p>
              Once saved, these templates can be selected when creating new log books, ensuring consistent data collection.
            </p>
          </div>
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" id="template-form">
          <Card>
            <CardHeader>
              <CardTitle>Template Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 p-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter template name (e.g., 'Patient Intake Form')"
                        {...field}
                      />
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
                        placeholder="Describe the purpose of this template"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <FieldBuilder
            templateSchema={templateSchema}
            setTemplateSchema={setTemplateSchema}
          />

          {/* Save button at the bottom */}
          <div className="flex justify-end pt-4">
            <Button 
              type="button" 
              onClick={handleSaveClick}
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              <Save className="h-4 w-4 mr-2" /> 
              {isSubmitting ? "Saving..." : "Save Template"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}