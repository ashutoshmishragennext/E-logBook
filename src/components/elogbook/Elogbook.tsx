/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { redirect } from 'next/navigation';
import { LogBookTemplateForm } from './DynamicForm';

export default  function LogBookCreationPage() {
  // Dummy data for now
  const academicYears = [
    { id: '2f8ab354-1f21-4d0f-ad41-87a39e44b0be', name: '2023-2024' },
    { id: '9ee19da7-9848-4db8-8190-46ff29ab561a', name: '2024-2025' },
  ];

  const batches = [
    { id: '1dc6324e-c7d5-4b95-9f50-160ceb9d799a', name: 'Batch A' },
    { id: '515077b6-0863-4d30-8a69-c9a572226d0e', name: 'Batch B' },
  ];

  const subjects = [
    { id: '15d52e34-7803-428d-93a5-d3a2e3b73f11', name: 'Mathematics', code: 'MATH101' },
    { id: 'aa6e23d4-0e95-4b29-bd7a-26c3c71a56c5', name: 'Science', code: 'SCI101' },
  ];

  const modules = [
    { id: '05ac612a-b8c5-482d-bd3b-9d1233e1f0a4', name: 'Module 1' },
    { id: '0b7de291-39c3-47c6-9c6c-8d5a7d13b751', name: 'Module 2' },
  ];

  const handleSubmit = async (templateData: any) => {
    // Server action to create log book template
    const response = await fetch('/api/log-book-template', {
      method: 'POST',
      body: JSON.stringify(templateData),
    });

    if (response.ok) {
      // Handle successful creation
      redirect('/log-book/templates');
    }
  };

  return (
    <div>
      <h1>Create Log Book Template</h1>
      <LogBookTemplateForm
        academicYears={academicYears}
        batches={batches}
        subjects={subjects}
        modules={modules}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
