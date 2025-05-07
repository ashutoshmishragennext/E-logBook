// src/components/templates/TemplateEditor.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import GeneralTemplateForm from "./General";
import SubjectTemplateForm from "./Subject";
import { Template } from "./types";

interface TemplateEditorProps {
  templateId: string;
}

export default function TemplateEditor({ templateId }: TemplateEditorProps) {
  const router = useRouter();
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [templateType, setTemplateType] = useState<"general" | "subject" | null>(null);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        setLoading(true);
        // Replace with actual API call
        const response = await fetch(`/api/templates/${templateId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch template');
        }
        
        const data = await response.json();
        setTemplate(data);
        setTemplateType(data.templateType);
      } catch (error) {
        console.error('Error fetching template:', error);
        setError('Failed to load template. Please try again or go back to the templates list.');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [templateId]);

  // Handle template update
  const handleUpdateTemplate = async (data: any) => {
    try {
      // Make an API call to update the template
      const response = await fetch(`/api/templates/${templateId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update template');
      }

      // Redirect to the templates list page
      router.push('/templates');
      router.refresh();
    } catch (error) {
      console.error('Error updating template:', error);
      alert('Failed to update template. Please try again.');
    }
  };

  // Handle template type change - actually we won't allow changing template type after creation
  const handleTemplateTypeChange = (type: "general" | "subject") => {
    // In this case, we won't allow changing from general to subject or vice versa after creation
    alert("Changing template type from general to subject or vice versa is not supported after creation.");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-48" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !template) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error || "Template not found"}
        </AlertDescription>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push('/templates')}
        >
          Back to Templates
        </Button>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit Template</h1>
      
      {template.templateType === "general" ? (
        <GeneralTemplateForm
          onSubmit={handleUpdateTemplate}
          onTemplateTypeChange={handleTemplateTypeChange}
          initialValues={{
            name: template.name,
            description: template.description,
            templateSchema: template.dynamicSchema
          }}
        />
      ) : (
        <SubjectTemplateForm
          onSubmit={handleUpdateTemplate}
          onBack={() => router.push('/templates')}
          initialValues={{
            name: template.name,
            description: template.description,
            academicYearId: template.academicYearId,
            phaseId: template.phaseId,
            subjectId: template.subjectId,
            teacherSubjectId: template.teacherSubjectId,
            templateSchema: template.dynamicSchema
          }}
        />
      )}
    </div>
  );
}