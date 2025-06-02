/* eslint-disable @typescript-eslint/no-unused-vars */ 
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
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import SubjectSelector from "../clgAdmin/SubjectComponent";

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
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // New state for SubjectSelector
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<{
    id: string;
    name: string;
    code?: string;
  } | null>(null);
  const [selectedPhaseId, setSelectedPhaseId] = useState(""); // You may need to set this based on your app logic

  const { college, fetchCollegeDetail } = useCollegeStore();

  // State for dynamic form building
  const [templateSchema, setTemplateSchema] = useState<LogBookTemplateSchema>(
    initialData?.dynamicSchema || {
      groups: [{ groupName: "Subject Information", fields: [] }],
    }
  );

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

  useEffect(() => {
    if (userId) {
      fetchCollegeDetail(userId);
    }
  }, [userId, fetchCollegeDetail]);

  useEffect(() => {
    if (college) {
      setCollegeId(college.id);
    }
  }, [college]);

  // Initialize selected subject when editing
  useEffect(() => {
    if (initialData?.subjectId && subjects.length > 0) {
      const subject = subjects.find(s => s.id === initialData.subjectId);
      if (subject) {
        setSelectedSubject({
          id: subject.id,
          name: subject.name,
          code: subject.code,
        });
        setSearchQuery(subject.name);
      }
    }
  }, [initialData?.subjectId, subjects]);

  // Fetch subjects on component mount (for initialization purposes)
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch(`/api/subject`);
        if (!response.ok) throw new Error("Failed to fetch subjects");
        const data = await response.json();
        setSubjects(data);
      } catch (error) {
        toast.error(
          `Error fetching subjects: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    };

    fetchSubjects();
  }, []);

  // Set a default phase ID - you may need to adjust this based on your app logic
  useEffect(() => {
    // If you have a way to determine the phase ID, set it here
    // For now, setting a placeholder - you'll need to replace this with actual logic
    setSelectedPhaseId("default-phase-id"); // Replace with actual phase selection logic
  }, []);

  // Handle subject selection from SubjectSelector
  const handleSubjectSelect = (subjectId: string) => {
    form.setValue("subjectId", subjectId);
    // The SubjectSelector will handle updating the searchQuery and selectedSubject internally
  };

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof subjectTemplateSchema>) => {
    // Prevent multiple submissions
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      // Validate that there are fields in the template
      if (templateSchema.groups.every((group) => group.fields.length === 0)) {
        toast.error("Please add at least one field to your template");
        return;
      }

      // Prepare the final data for submission
      const templateData: TemplateFormValues = {
        ...data,
        dynamicSchema: templateSchema,
      };

      console.log("Submitting template data:", templateData); // Debug log

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
          templateType: "subject",
          subjectId: "",
          createdBy: userId,
          collegeId: collegeId ?? undefined,
        });
        setTemplateSchema({
          groups: [{ groupName: "Subject Information", fields: [] }],
        });
        // Reset SubjectSelector state
        setSearchQuery("");
        setSelectedSubject(null);
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
        <h2 className="text-2xl font-bold">Subject-Specific Templates</h2>
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
        <AlertTitle className="text-blue-800">About Subject Templates</AlertTitle>
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
                        placeholder="Enter template name (e.g., 'Chemistry Lab Report')" 
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

              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="subjectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <SubjectSelector
                          selectedPhaseId={selectedPhaseId}
                          onSelectSubject={handleSubjectSelect}
                          disabled={!selectedPhaseId}
                          searchQuery={searchQuery}
                          setSearchQuery={setSearchQuery}
                          selectedSubject={selectedSubject}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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