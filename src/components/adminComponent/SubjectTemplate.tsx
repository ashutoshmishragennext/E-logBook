"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { FieldBuilder } from "./FieldBuilder";
import {
  LogBookTemplateSchema,
  Subject,
  SubjectTemplate,
  TemplateFormValues,
} from "./types";

import { toast } from "sonner";
import { useCollegeStore } from "@/store/college";
import { Alert, AlertDescription } from "../ui/alert";
import SearchableSubjectSelect from "./SubjectSerachSelect";
import { Save } from "lucide-react";

// Simplified form validation schema
const subjectTemplateSchema = z.object({
  name: z.string().min(3, "Template name must be at least 3 characters"),
  description: z.string().optional(),
  templateType: z.literal("subject"),
  subjectId: z.string().min(1, "Subject is required"),
  createdBy: z.string(),
  collegeId: z.string().optional(),
});

interface SubjectTemplateFormProps {
  initialData?: SubjectTemplate;
  onSuccess?: () => void;
}

export function SubjectTemplateForm({
  initialData,
  onSuccess,
}: SubjectTemplateFormProps) {
  const user = useCurrentUser();
  const userId = user?.id || "1875bc17-47cd-4273-a8d5-d2fd0503e702";
  const router = useRouter();
  const isEditing = !!initialData;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [collegeId, setCollegeId] = useState<string | null>(null);

  const { college, fetchCollegeDetail } = useCollegeStore();

  useEffect(() => {
    if (userId) {
      fetchCollegeDetail(userId);
    }
  }, [userId, fetchCollegeDetail]);
  console.log("College:", college);
  useEffect(() => {
    if (college) {
      setCollegeId(college.id);
    }
  }, [college]);

  console.log("College ID:", collegeId);

  // State for dynamic form building
  const [templateSchema, setTemplateSchema] = useState<LogBookTemplateSchema>(
    initialData?.dynamicSchema || {
      groups: [{ groupName: "Subject Information", fields: [] }],
    }
  );

  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Form for template details
  const form = useForm<z.infer<typeof subjectTemplateSchema>>({
    resolver: zodResolver(subjectTemplateSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      templateType: "subject",
      subjectId: initialData?.subjectId || "",
      createdBy: userId,
      collegeId: collegeId ?? undefined,
    },
  });

  // Fetch subjects on component mount
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch(`/api/subject`);
        if (!response.ok) throw new Error("Failed to fetch subjects");
        const data = await response.json();
        setSubjects(data);
      } catch (error) {
        toast(
          `Error fetching subjects: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    };

    fetchSubjects();
  }, []);

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof subjectTemplateSchema>) => {
    try {
      setIsSubmitting(true);

      // Validate that there are fields in the template
      if (templateSchema.groups.every((group) => group.fields.length === 0)) {
        toast("Please add at least one field to your template");
        setIsSubmitting(false);
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

      // Show success toast
      toast(`Template ${isEditing ? "updated" : "created"} successfully!`);

      // Execute success callback or navigate to templates list
      if (onSuccess) {
        onSuccess();
        toast("Template saved successfully!");
      } else {
        // If no callback provided, you might want to redirect
        toast("Template saved successfully!");
      }
    } catch (error) {
      toast(error instanceof Error ? error.message : "Error saving template");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-1">
      <h2 className="text-2xl font-bold mb-1">Subject-Specific Templates</h2>
      <Alert className="bg-blue-50 border-blue-200 mb-4">
        <AlertDescription className="text-blue-700">
          <div className="space-y-2">
            <p>
              <strong>Subject Templates</strong> are structured log book formats
              designed specifically for individual academic subjects. These
              templates ensure consistency in how data is collected for
              subject-specific activities like lab work, assignments, or
              practicals.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Assign the template to a specific subject (e.g., Physics,
                Chemistry, Math)
              </li>
              <li>
                Provide a meaningful name and description for the template
              </li>
              <li>
                Create dynamic fields to capture important academic details
              </li>
              <li>
                Organize fields into logical groups (e.g., Experiment Info,
                Observations)
              </li>
              <li>
                Choose from a variety of input types (text, number, date,
                textarea, etc.)
              </li>
              <li>
                Mark fields as required or optional depending on importance
              </li>
            </ul>
            <p>
              Once created, these templates can be reused whenever log books
              need to be maintained for the assigned subject, saving time and
              improving data standardization.
            </p>
          </div>
        </AlertDescription>
      </Alert>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="p-2">
            <CardContent className="grid grid-cols-2 gap-4 p-2">
              {/* First Row: Name + Description */}
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
                name="subjectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <SearchableSubjectSelect
                        options={subjects.map((subject) => ({
                          label: `${subject.name} (${subject.code})`, // This will be displayed
                          value: subject.id, // This will be the actual form value
                        }))}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Subject"
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

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-1" />
              {isSubmitting ? "Saving..." : "Save Template"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
