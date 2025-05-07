// src/components/templates/types.ts

// Field definition types
export type FieldType = "text" | "number" | "date" | "select" | "textarea" | "file";

export interface FieldDefinition {
  fieldName: string;
  fieldLabel: string;
  fieldType: FieldType;
  isRequired: boolean;
  options?: string[]; // For select fields
  defaultValue?: string | number; // Default value for the field
  placeholder?: string; // Placeholder text
  helpText?: string; // Additional help information
}

export interface FieldGroup {
  groupName: string;
  fields: FieldDefinition[];
}

export interface LogBookTemplateSchema {
  groups: FieldGroup[];
}

// Template data types
export interface TemplateBase {
  id?: string;
  name: string;
  description?: string;
  templateType: "general" | "subject";
  createdAt?: Date;
  updatedAt?: Date;
  dynamicSchema: LogBookTemplateSchema;
}

export interface GeneralTemplate extends TemplateBase {
  templateType: "general";
}

export interface SubjectTemplate extends TemplateBase {
  templateType: "subject";
  academicYearId: string;
  phaseId: string;
  subjectId: string;
  teacherSubjectId?: string;
}

export type LogBookTemplate = GeneralTemplate | SubjectTemplate;

// Template form values
export interface TemplateFormValues {
  name: string;
  description?: string;
  templateType: "general" | "subject";
  academicYearId?: string;
  phaseId?: string;
  subjectId?: string;
  teacherSubjectId?: string;
  dynamicSchema?: LogBookTemplateSchema;
}

// Types for academic year, phase, and subject data
export interface AcademicYear {
  id: string;
  name: string;
}

export interface Phase {
  id: string;
  name: string;
  academicYearId: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  phaseId: string;
}

export interface TeacherSubject {
  id: string;
  teacherId: string;
  subjectId: string;
  academicYearId: string;
  phaseId: string;
  branchId: string;
  courseId: string;
  teacher?: {
    id: string;
    name: string;
  };
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  templateType: "general" | "subject";
  createdAt: string;
  updatedAt: string;
  userId: string;
  dynamicSchema: LogBookTemplateSchema;
  academicYearId?: string;
  phaseId?: string;
  subjectId?: string;
  teacherSubjectId?: string;
}