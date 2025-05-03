import { InferModel, relations } from "drizzle-orm";
import {
  boolean,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  integer
} from "drizzle-orm/pg-core";

// ===== ENUMS =====
export const UserRole = pgEnum("user_role", ["ADMIN", "TEACHER", "STUDENT", "USER" , "COLLEGE_ADMIN"]);
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

// New enum for log book entry status
export const LogBookEntryStatus = pgEnum("logbook_entry_status", [
  "DRAFT",
  "SUBMITTED",
  "REVIEWED",
  "APPROVED",
  "REJECTED"
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

// College Table
export const CollegeTable = pgTable(
  "colleges",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    createdBy : uuid("user_id").references(() => UsersTable.id).notNull(),
    collegeAdminId: uuid("college_admin_id").references(() => UsersTable.id),
    name: text("name").notNull(),
    code: text("code").notNull(),
    address: text("address"),
    country: text("country"),
    city: text("city"),
    state: text("state"),
    phone: text("phone"),
    email: text("email"),
    website: text("website"),
    description: text("description"),
    logo: text("logo"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("college_code_key").on(table.code),
    uniqueIndex("college_Admin_key").on(table.collegeAdminId),
  ]
);

// Branch/Department Table
export const BranchTable = pgTable(
  "branches",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    collegeId: uuid("college_id").references(() => CollegeTable.id),
    name: text("name").notNull(),
    code: text("code").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
);

// Course Table
export const CourseTable = pgTable(
  "courses",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    branchId: uuid("branch_id").references(() => BranchTable.id),
    name: text("name").notNull(),
    duration: text("duration").notNull(), // in years or semesters
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  }
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

// Subject Table - Now linked to courses
export const SubjectTable = pgTable(
  "subjects",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    name: text("name").notNull(),
    code: text("code").notNull(),
    phaseId: uuid("phase_id").references(() => PhaseTable.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    // Ensure subject code is unique within a course
    uniqueIndex("subject_course_code_key").on( table.code),
  ]
);

// Teacher Profile Table - Modified
export const TeacherProfileTable = pgTable(
  "teacher_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").references(() => UsersTable.id).notNull(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    mobileNo: text("mobile_no").notNull(),
    profilePhoto: text("profile_photo"),
    teacherIdProof: text("teacher_id_proof"),
    Address: text("location"),
    collegeId: uuid("college_id").references(() => CollegeTable.id).notNull(),
    designation: text("designation").notNull(), // Professor, Assistant Professor, etc.
    employeeId: text("employee_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("teacher_user_id_key").on(table.userId),
    uniqueIndex("teacher_college_employee_id_key").on(
      table.collegeId,
      table.employeeId
    ),
  ]
);

// Student Profile Table - Modified to better support enrollment
export const StudentProfileTable = pgTable(
  "student_profiles",
  {
    // Primary identifiers
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").references(() => UsersTable.id).notNull(),
    
    // Personal Information
    name: text("name").notNull(),
    rollNo: text("roll_no"),
    mobileNo: text("mobile_no").notNull(),
    email: text("email").notNull(),
    profilePhoto: text("profile_photo"),
    dateOfBirth: text("date_of_birth"), // Changed to timestamp
    Address: text("local_address"),
    country: text("country"),
    state: text("state"),
    city: text("city"),
    adharNo: text("adhar_no"),
    maritalStatus: text("marital_status"),
    
    // Academic Information
    collegeId: uuid("college_id").references(() => CollegeTable.id),
    branchId: uuid("branch_id").references(() => BranchTable.id),
    courseId: uuid("course_id").references(() => CourseTable.id),
    academicYearId: uuid("academic_year_id").references(() => AcademicYearTable.id),
    collegeIdProof: text("college_id_proof"),
    yearOfPassing: text("year_of_passing"), // Changed from text to integer
    
    // Verification Information
    verificationStatus: VerificationStatus("verification_status").default("PENDING"),
    teacherId: uuid("teacher_id").references(() => TeacherProfileTable.id),
    rejectionReason: text("rejection_reason"),
    
    // Metadata
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("student_user_id_key").on(table.userId),
    uniqueIndex("student_roll_no_key").on(table.rollNo),
    uniqueIndex("student_enrollment_key").on(
      table.id,
      table.collegeId,
      table.courseId,
      table.academicYearId
    ),
  ]
);

// TeacherSubject Table - Teacher-Subject Assignment (Many-to-Many relationship)
export const TeacherSubjectTable = pgTable(
  "teacher_subjects",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    teacherId: uuid("teacher_id").references(() => TeacherProfileTable.id).notNull(),
    subjectId: uuid("subject_id").references(() => SubjectTable.id).notNull(),
    academicYearId: uuid("academic_year_id").references(() => AcademicYearTable.id),
    phaseId: uuid("phase_id").references(() => PhaseTable.id),
    branchId: uuid("branch_id").references(() => BranchTable.id),
    courseId: uuid("course_id").references(() => CourseTable.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    // Ensure unique teacher-subject combination per course, academic year and phase
    uniqueIndex("teacher_subject_unique").on(
      table.teacherId,
      table.subjectId,
      table.academicYearId,
      table.phaseId,
      table.branchId,
      table.courseId
    ),
  ]
);

// StudentSubject Table - Student Subject Selection with Teacher Assignment
export const StudentSubjectTable = pgTable(
  "student_subjects",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    studentId: uuid("student_id").references(() => StudentProfileTable.id).notNull(),
    subjectId: uuid("subject_id").references(() => SubjectTable.id).notNull(),
    teacherSubjectId: uuid("teacher_subject_id").references(() => TeacherSubjectTable.id).notNull(), // Reference to the teacher-subject assignment
    academicYearId: uuid("academic_year_id").references(() => AcademicYearTable.id).notNull(),
    phaseId: uuid("phase_id").references(() => PhaseTable.id).notNull(),
    
    // Approval status for this specific subject-teacher pair
    verificationStatus: VerificationStatus("verification_status").default("PENDING"),
    rejectionReason: text("rejection_reason"),
    
    // Approval timestamp
    approvedAt: timestamp("approved_at"),
    
    // Access control for e-logbook (only accessible after approval)
    hasLogbookAccess: text("has_logbook_access").default("false"), // Changed from text to boolean
    
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    // Ensure unique student-subject-teacher combination per academic year and phase
    uniqueIndex("student_subject_teacher_unique").on(
      table.studentId,
      table.subjectId,
      table.teacherSubjectId,
      table.academicYearId,
      table.phaseId,
      
    ),
  ]
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
    teacherSubjectId: uuid("teacher_subject_id").references(() => TeacherSubjectTable.id), // Link to specific teacher-subject assignment
    
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
    
    // Link to the specific student-subject-teacher registration
    studentSubjectId: uuid("student_subject_id").references(() => StudentSubjectTable.id).notNull(),
    
    // Dynamic Field Values
    dynamicFields: jsonb("dynamic_fields").default({}),
    
    // Tracking and Feedback
    studentRemarks: text("student_remarks"),
    teacherRemarks: text("teacher_remarks"),
    status: text("status").default("DRAFT"), // Changed to use the proper enum
    
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

// New types for the relationship tables
export type TeacherSubject = InferModel<typeof TeacherSubjectTable>;
export type NewTeacherSubject = InferModel<typeof TeacherSubjectTable, "insert">;

export type StudentSubject = InferModel<typeof StudentSubjectTable>;
export type NewStudentSubject = InferModel<typeof StudentSubjectTable, "insert">;

// Relations
export const collegeRelations = relations(CollegeTable, ({ many }) => ({
  branches: many(BranchTable),
  teachers: many(TeacherProfileTable),
  students: many(StudentProfileTable)
}));

export const branchRelations = relations(BranchTable, ({ one, many }) => ({
  college: one(CollegeTable, {
    fields: [BranchTable.collegeId],
    references: [CollegeTable.id]
  }),
  courses: many(CourseTable),
  students: many(StudentProfileTable)
}));

export const courseRelations = relations(CourseTable, ({ one, many }) => ({
  branch: one(BranchTable, {
    fields: [CourseTable.branchId],
    references: [BranchTable.id]
  }),
  subjects: many(SubjectTable),
  students: many(StudentProfileTable)
}));

export const subjectRelations = relations(SubjectTable, ({ one, many }) => ({

  phase: one(PhaseTable, {
    fields: [SubjectTable.phaseId],
    references: [PhaseTable.id]
  }),
  teacherAssignments: many(TeacherSubjectTable),
  studentSelections: many(StudentSubjectTable),
  logBookTemplates: many(LogBookTemplateTable)
}));

export const academicYearRelations = relations(AcademicYearTable, ({ many }) => ({
  phases: many(PhaseTable),
  teacherSubjects: many(TeacherSubjectTable),
  studentSubjects: many(StudentSubjectTable),
  logBookTemplates: many(LogBookTemplateTable)
}));

export const phaseRelations = relations(PhaseTable, ({ one, many }) => ({
  academicYear: one(AcademicYearTable, {
    fields: [PhaseTable.academicYearId],
    references: [AcademicYearTable.id]
  }),
  subjects: many(SubjectTable), // Added subjects relation
  teacherSubjects: many(TeacherSubjectTable),
  studentSubjects: many(StudentSubjectTable),
  logBookTemplates: many(LogBookTemplateTable)
}));

export const teacherProfileRelations = relations(TeacherProfileTable, ({ one, many }) => ({
  user: one(UsersTable, {
    fields: [TeacherProfileTable.userId],
    references: [UsersTable.id]
  }),
  college: one(CollegeTable, {
    fields: [TeacherProfileTable.collegeId],
    references: [CollegeTable.id]
  }),
  subjectAssignments: many(TeacherSubjectTable),
  studentVerifications: many(StudentProfileTable), // Added student verification relation
  studentSubjectVerifications: many(StudentSubjectTable)
}));

export const studentProfileRelations = relations(StudentProfileTable, ({ one, many }) => ({
  user: one(UsersTable, {
    fields: [StudentProfileTable.userId],
    references: [UsersTable.id]
  }),
  college: one(CollegeTable, {
    fields: [StudentProfileTable.collegeId],
    references: [CollegeTable.id]
  }),
  branch: one(BranchTable, {
    fields: [StudentProfileTable.branchId],
    references: [BranchTable.id]
  }),
  course: one(CourseTable, {
    fields: [StudentProfileTable.courseId],
    references: [CourseTable.id]
  }),
  academicYear: one(AcademicYearTable, {
    fields: [StudentProfileTable.academicYearId],
    references: [AcademicYearTable.id]
  }),
  verifier: one(TeacherProfileTable, {
    fields: [StudentProfileTable.teacherId],
    references: [TeacherProfileTable.id]
  }),
  subjectEnrollments: many(StudentSubjectTable),
  logBookEntries: many(LogBookEntryTable)
}));

// Relation for TeacherSubject (many-to-many)
export const teacherSubjectRelations = relations(TeacherSubjectTable, ({ one, many }) => ({
  teacher: one(TeacherProfileTable, {
    fields: [TeacherSubjectTable.teacherId],
    references: [TeacherProfileTable.id]
  }),
  subject: one(SubjectTable, {
    fields: [TeacherSubjectTable.subjectId],
    references: [SubjectTable.id]
  }),
  academicYear: one(AcademicYearTable, {
    fields: [TeacherSubjectTable.academicYearId],
    references: [AcademicYearTable.id]
  }),
  phase: one(PhaseTable, {
    fields: [TeacherSubjectTable.phaseId],
    references: [PhaseTable.id]
  }),
  branch: one(BranchTable, {
    fields: [TeacherSubjectTable.branchId],
    references: [BranchTable.id]
  }),
  course: one(CourseTable, {
    fields: [TeacherSubjectTable.courseId],
    references: [CourseTable.id]
  }),
  studentEnrollments: many(StudentSubjectTable),
  logBookTemplates: many(LogBookTemplateTable)
}));

// Relation for StudentSubject
export const studentSubjectRelations = relations(StudentSubjectTable, ({ one, many }) => ({
  student: one(StudentProfileTable, {
    fields: [StudentSubjectTable.studentId],
    references: [StudentProfileTable.id]
  }),
  subject: one(SubjectTable, {
    fields: [StudentSubjectTable.subjectId],
    references: [SubjectTable.id]
  }),
  teacherSubject: one(TeacherSubjectTable, {
    fields: [StudentSubjectTable.teacherSubjectId],
    references: [TeacherSubjectTable.id]
  }),
  // Link to teacher through teacherSubject
  academicYear: one(AcademicYearTable, {
    fields: [StudentSubjectTable.academicYearId],
    references: [AcademicYearTable.id]
  }),
  phase: one(PhaseTable, {
    fields: [StudentSubjectTable.phaseId],
    references: [PhaseTable.id]
  }),
  logBookEntries: many(LogBookEntryTable)
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
  teacherSubject: one(TeacherSubjectTable, {
    fields: [LogBookTemplateTable.teacherSubjectId],
    references: [TeacherSubjectTable.id]
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
  }),
  teacher: one(TeacherProfileTable, {
    fields: [LogBookEntryTable.teacherId],
    references: [TeacherProfileTable.id]
  }),
  studentSubject: one(StudentSubjectTable, {
    fields: [LogBookEntryTable.studentSubjectId],
    references: [StudentSubjectTable.id]
  })
}));

export const userRelations = relations(UsersTable, ({ one, many }) => ({
  studentProfile: one(StudentProfileTable, {
    fields: [UsersTable.id],
    references: [StudentProfileTable.userId]
  }),
  teacherProfile: one(TeacherProfileTable, {
    fields: [UsersTable.id],
    references: [TeacherProfileTable.userId]
  }),
  createdColleges: one(CollegeTable, { 
    fields: [UsersTable.id],
    references: [CollegeTable.createdBy] 
  }),
  collegeAdmin: one(CollegeTable, {
    fields: [UsersTable.id],
    references: [CollegeTable.collegeAdminId]
  }),

  createdTemplates: many(LogBookTemplateTable),
}));