
import { InferModel, relations } from "drizzle-orm";
import {
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid
} from "drizzle-orm/pg-core";

// ===== ENUMS =====
export const UserRole = pgEnum("user_role", ["ADMIN", "TEACHER", "STUDENT","USER"]);
export const VerificationStatus = pgEnum("verification_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
]);
export const FieldType = pgEnum("field_type", [
  "text", 
  "number", 
  "date", 
  "select", 
  "textarea", 
  "file"
]);

// ===== USERS =====
export const UsersTable = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    emailVerified: timestamp("email_verified", { mode: "date" }),
    password: text("password").notNull(),
    role: UserRole("role").default("STUDENT").notNull(),
    phone: text("phone"),
    
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("users_email_key").on(table.email),
  ]
);

// Email Verification Token Table
export const EmailVerificationTokenTable = pgTable(
  "email_verification_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").references(() => UsersTable.id).notNull(),
    email: text("email").notNull(),
    token: uuid("token").notNull(),
    expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  },
  (table) => [
    uniqueIndex("email_verification_tokens_email_token_key").on(
      table.email,
      table.token
    ),
  ]
);

export const PhoneVerificationTable = pgTable(
  "phone_verification_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    phone: text("phone").notNull(),
    otp: text("otp").notNull(),
    expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  },
  (table) => [
    uniqueIndex("phone_verification_tokens_phone_otp_key").on(
      table.phone,
      table.otp
    ),
    uniqueIndex("phone_verification_tokens_otp_key").on(table.otp),
  ]
);

export const PasswordResetTokenTable = pgTable(
  "password_reset_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    email: text("email").notNull(),
    token: uuid("token").notNull(),
    expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  },
  (table) => [
    uniqueIndex("password_reset_tokens_email_token_key").on(
      table.email,
      table.token
    ),
    uniqueIndex("password_reset_tokens_token_key").on(table.token),
  ]
);

// Student Profile Table
export const StudentProfileTable = pgTable(
  "student_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").references(() => UsersTable.id).notNull(),
    
    // Personal Information
    name: text("name").notNull(),
    rollNo: text("roll_no").notNull(),
    mobileNo: text("mobile_no").notNull(),
    email: text("email").notNull(),
    profilePhoto: text("profile_photo"),
    dateOfBirth:text("date_of_birth"),
    
    // Location Information
    localAddress: text("local_address"),

    permanentAddress: text("permanent_address"),
    adharNo:text("adhar_no"),
    previousInstitution:text("previous_institution"), 
    yearOfPassing:text("year_of_passing"),
    attempt:text("attempt"),
    state:text("state"),
    dateOfJoining:text("date_of_joining"),
    previousExperience:text("perivious_experience"),
    maritalStatus:text("merital_status"),
    children:text("children"),
    specialInterest:text("special_interest"),
    dateOfCompletion:text("date_of_completion"),
    nameAndOccpationOfSpouse:text("name_and_occpation_of_spouse"),
    futurePlan:text("future_plan"),
    // Academic Information
    admissionBatch: text("admission_batch"),
    course: text("course"),
    subject: text("subject"),
    collegeIdProof: text("college_id_proof"),
    
    // Metadata
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("student_profile_user_id_key").on(table.userId),
    uniqueIndex("student_profile_roll_no_key").on(table.rollNo),
  ]
);

// Teacher Profile Table
export const TeacherProfileTable = pgTable(
  "teacher_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").references(() => UsersTable.id).notNull(),
    
    // Personal Information
    name: text("name").notNull(),
    email: text("email").notNull(),
    mobileNo: text("mobile_no").notNull(),
    profilePhoto: text("profile_photo"),
    teacherIdProof: text("teacher_id_proof"),
    
    // Location Information
    location: text("location"),
    
    // Metadata
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("teacher_profile_user_id_key").on(table.userId),
  ]
);

// Academic Configuration Tables
export const AcademicYearTable = pgTable(
  "academic_years",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    name: text("name").notNull().unique(), // e.g., "2023-2024"
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
  }
);

export const PhaseTable = pgTable(
  "phase",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    name: text("name").notNull(), // e.g., "Batch A", "Batch B"
    academicYearId: uuid("academic_year_id").references(() => AcademicYearTable.id).notNull(),
  }
);

export const SubjectTable = pgTable(
  "subjects",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    name: text("name").notNull(),
    code: text("code").notNull().unique(),
    phaseId: uuid("phase_id").references(() => PhaseTable.id).notNull(),
  }
);

export const ModuleTable = pgTable(
  "modules",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    name: text("name").notNull(),
    subjectId: uuid("subject_id").references(() => SubjectTable.id).notNull(),
  }
);

// Log Book Template Table
export const LogBookTemplateTable = pgTable(
  "log_book_templates",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    
    // Academic Specifics
    academicYearId: uuid("academic_year_id").references(() => AcademicYearTable.id).notNull(),
    batchId: uuid("phase_id").references(() => PhaseTable.id).notNull(),
    subjectId: uuid("subject_id").references(() => SubjectTable.id).notNull(),
    moduleId: uuid("module_id").references(() => ModuleTable.id),
    
    // Template Configuration
    name: text("name").notNull(), // e.g., "Lab Experiments", "Project Work"
    description: text("description"),
    
    // Dynamic Schema Configuration
    dynamicSchema: jsonb("dynamic_schema").default({
      groups: []
    }),
    
    // Metadata
    createdBy: uuid("created_by").references(() => UsersTable.id).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  }
);

// Log Book Entries Table
export const LogBookEntryTable = pgTable(
  "log_book_entries",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    
    // Reference to Log Book Template
    logBookTemplateId: uuid("log_book_template_id").references(() => LogBookTemplateTable.id).notNull(),
    
    // Student Information
    studentId: uuid("student_id").references(() => StudentProfileTable.id).notNull(),
    teacherId: uuid("teacher_id").references(() => TeacherProfileTable.id),
    
    // Dynamic Field Values
    dynamicFields: jsonb("dynamic_fields").default({}),
    
    // Tracking and Feedback
    studentRemarks: text("student_remarks"),
    teacherRemarks: text("teacher_remarks"),
    status: text("status").default("DRAFT"), // e.g., DRAFT, SUBMITTED, REVIEWED
    
    // Metadata
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  }
);

// TypeScript Types for Dynamic Schema
export type LogBookDynamicSchema = {
  groups: Array<{
    groupName: string;
    fields: Array<{
      fieldName: string;
      fieldLabel: string;
      fieldType: string;
      isRequired: boolean;
      options?: string[];
      validationRegex?: string;
      defaultValue?: string;
    }>;
  }>;
};

// Export Types
export type AcademicYear = InferModel<typeof AcademicYearTable>;
export type NewAcademicYear = InferModel<typeof AcademicYearTable, "insert">;

export type Batch = InferModel<typeof PhaseTable>;
export type NewBatch = InferModel<typeof PhaseTable, "insert">;

export type Subject = InferModel<typeof SubjectTable>;
export type NewSubject = InferModel<typeof SubjectTable, "insert">;

export type Module = InferModel<typeof ModuleTable>;
export type NewModule = InferModel<typeof ModuleTable, "insert">;

export type LogBookTemplate = InferModel<typeof LogBookTemplateTable>;
export type NewLogBookTemplate = InferModel<typeof LogBookTemplateTable, "insert">;

export type LogBookEntry = InferModel<typeof LogBookEntryTable>;
export type NewLogBookEntry = InferModel<typeof LogBookEntryTable, "insert">;

// User-related Types
export type User = InferModel<typeof UsersTable>;
export type NewUser = InferModel<typeof UsersTable, "insert">;

export type EmailVerificationToken = InferModel<typeof EmailVerificationTokenTable>;
export type NewEmailVerificationToken = InferModel<typeof EmailVerificationTokenTable, "insert">;

export type StudentProfile = InferModel<typeof StudentProfileTable>;
export type NewStudentProfile = InferModel<typeof StudentProfileTable, "insert">;

export type TeacherProfile = InferModel<typeof TeacherProfileTable>;
export type NewTeacherProfile = InferModel<typeof TeacherProfileTable, "insert">;



export const academicYearRelations = relations(AcademicYearTable, ({ many }) => ({
  phases: many(PhaseTable),
  logBookTemplates: many(LogBookTemplateTable)
}));

export const phaseRelations = relations(PhaseTable, ({ one, many }) => ({
  academicYear: one(AcademicYearTable, {
    fields: [PhaseTable.academicYearId],
    references: [AcademicYearTable.id]
  }),
  subjects: many(SubjectTable),
  logBookTemplates: many(LogBookTemplateTable)
}));

export const subjectRelations = relations(SubjectTable, ({ one, many }) => ({
  phase: one(PhaseTable, {
    fields: [SubjectTable.phaseId],
    references: [PhaseTable.id]
  }),
  modules: many(ModuleTable),
  logBookTemplates: many(LogBookTemplateTable)
}));

export const moduleRelations = relations(ModuleTable, ({ one, many }) => ({
  subject: one(SubjectTable, {
    fields: [ModuleTable.subjectId],
    references: [SubjectTable.id]
  }),
  logBookTemplates: many(LogBookTemplateTable)
}));

export const logBookTemplateRelations = relations(LogBookTemplateTable, ({ one, many }) => ({
  academicYear: one(AcademicYearTable, {
    fields: [LogBookTemplateTable.academicYearId],
    references: [AcademicYearTable.id]
  }),
  batch: one(PhaseTable, {
    fields: [LogBookTemplateTable.batchId],
    references: [PhaseTable.id]
  }),
  subject: one(SubjectTable, {
    fields: [LogBookTemplateTable.subjectId],
    references: [SubjectTable.id]
  }),
  module: one(ModuleTable, {
    fields: [LogBookTemplateTable.moduleId],
    references: [ModuleTable.id]
  }),
  creator: one(UsersTable, {
    fields: [LogBookTemplateTable.createdBy],
    references: [UsersTable.id]
  }),
  logBookEntries: many(LogBookEntryTable)
}));

export const logBookEntryRelations = relations(LogBookEntryTable, ({ one }) => ({
  logBookTemplate: one(LogBookTemplateTable, {
    fields: [LogBookEntryTable.logBookTemplateId],
    references: [LogBookTemplateTable.id]
  }),
  student: one(StudentProfileTable, {
    fields: [LogBookEntryTable.studentId],
    references: [StudentProfileTable.id]
  })
}));