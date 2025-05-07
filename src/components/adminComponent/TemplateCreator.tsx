// src/components/templates/TemplateCreator.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GeneralTemplateForm from "./General";
import SubjectTemplateForm from "./Subject";

export default function TemplateCreator() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"general" | "subject">("general");
  const [initialValues, setInitialValues] = useState<{
    name?: string;
    description?: string;
  }>({});

  // Handle submission of the general template form
  const handleGeneralTemplateSubmit = async (data: any) => {
    try {
      // Make an API call to save the template
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create template');
      }

      // Redirect to the templates list page
      router.push('/templates');
      router.refresh();
    } catch (error) {
      console.error('Error creating template:', error);
      alert('Failed to create template. Please try again.');
    }
  };

  // Handle submission of the subject template form
  const handleSubjectTemplateSubmit = async (data: any) => {
    try {
      // Make an API call to save the template
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create template');
      }

      // Redirect to the templates list page
      router.push('/templates');
      router.refresh();
    } catch (error) {
      console.error('Error creating template:', error);
      alert('Failed to create template. Please try again.');
    }
  };

  // Handle template type change
  const handleTemplateTypeChange = (type: "general" | "subject") => {
    // Save the current values from the general form
    const generalForm = document.getElementById('general-template-form') as HTMLFormElement;
    if (generalForm) {
      const formData = new FormData(generalForm);
      setInitialValues({
        name: formData.get('name') as string,
        description: formData.get('description') as string,
      });
    }
    
    setActiveTab(type);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Create Template</h1>
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "general" | "subject")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general">General Template</TabsTrigger>
          <TabsTrigger value="subject">Subject-Specific Template</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <div id="general-template-form">
            <GeneralTemplateForm
              onSubmit={handleGeneralTemplateSubmit}
              onTemplateTypeChange={handleTemplateTypeChange}
            />
          </div>
        </TabsContent>
        <TabsContent value="subject">
          <SubjectTemplateForm
            onSubmit={handleSubjectTemplateSubmit}
            onBack={() => setActiveTab("general")}
            initialValues={initialValues}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}