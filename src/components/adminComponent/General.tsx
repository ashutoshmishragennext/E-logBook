"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Save } from "lucide-react";
import { FieldBuilder } from "./FieldBuilder";
import {
  LogBookTemplateSchema,
  GeneralTemplate,
  TemplateFormValues,
} from "./types";
import { useCurrentUser } from "@/hooks/auth";

// Form validation schema for general template details
const generalTemplateSchema = z.object({
  name: z.string().min(3, "Template name must be at least 3 characters"),
  description: z.string().optional(),
  templateType: z.literal("general"),
  createdBy: z.string(), // Add createdBy to the schema
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
  const userId = user?.id || "1875bc17-47cd-4273-a8d5-d2fd0503e702"; // Replace with actual user ID retrieval logic
  const router = useRouter();
  const isEditing = !!initialData;

  // State for dynamic form building
  const [templateSchema, setTemplateSchema] = useState<LogBookTemplateSchema>(
    initialData?.dynamicSchema || {
      groups: [{ groupName: "General Information", fields: [] }],
    }
  );

  // Form for template details
  const form = useForm<z.infer<typeof generalTemplateSchema>>({
    resolver: zodResolver(generalTemplateSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      templateType: "general",
      createdBy: userId,
    },
  });

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof generalTemplateSchema>) => {
    console.log("Form data:", data);
    try {
      // Validate that there are fields in the template
      if (templateSchema.groups.every((group) => group.fields.length === 0)) {
        alert("Please add at least one field to your template");
        return;
      }

      // Prepare the final data for submission
      const templateData: TemplateFormValues = {
        ...data,
        dynamicSchema: templateSchema,
      };

      // Send data to API
      const response = await fetch("/api/log-book-template", {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          isEditing ? { ...templateData, id: initialData.id } : templateData
        ),
      });

      if (!response.ok) {
        throw new Error("Failed to save template");
      }

      // Execute success callback or navigate to templates list
     if (onSuccess) {
        onSuccess();
        alert("Template saved successfully!");
      }
    } catch (error) {
      console.error("Error saving template:", error);
      alert("Failed to save template. Please try again.");
    }
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">General Templates</h2>
            <div className="flex space-x-2">
              <Button type="button" variant="outline" size="sm" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                <Save className="h-3.5 w-3.5 mr-1" /> Save
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="grid grid-cols-2 gap-4 p-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Template Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter template name"
                        {...field}
                        className="h-8 text-sm"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter template description"
                        {...field}
                        className="h-8 text-sm"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <FieldBuilder
            templateSchema={templateSchema}
            setTemplateSchema={setTemplateSchema}
          />
        </form>
      </Form>
    </div>
  );
}