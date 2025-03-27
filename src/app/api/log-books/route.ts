import { db } from '@/db';
import { AcademicYearTable, LogBookTemplateTable, ModuleTable, PhaseTable, SubjectTable } from '@/db/schema';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Zod schema for log book template creation
const logBookTemplateCreationSchema = z.object({
  academicYearId: z.string().uuid(),
  batchId: z.string().uuid(),
  subjectId: z.string().uuid(),
  moduleId: z.string().uuid().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  dynamicSchema: z.object({
    groups: z.array(
      z.object({
        groupName: z.string().min(1),
        fields: z.array(
          z.object({
            fieldName: z.string().min(1),
            fieldLabel: z.string().min(1),
            fieldType: z.enum(["text", "number", "date", "select", "textarea", "file"]),
            isRequired: z.boolean(),
            options: z.array(z.string()).optional(),
            validationRegex: z.string().optional(),
            defaultValue: z.string().optional()
          })
        ).min(1)
      })
    ).min(1)
  }),
  createdBy: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate the request body
    const validatedData = logBookTemplateCreationSchema.parse(body);
    
    // Get the authenticated user's ID (you'll need to implement authentication)
    // For this example, I'll use a placeholder
    // const authenticatedUserId = 'user-uuid-placeholder';

    // Create the log book template
    const [newLogBookTemplate] = await db
      .insert(LogBookTemplateTable)
      .values({
        academicYearId: validatedData.academicYearId,
        batchId: validatedData.batchId,
        subjectId: validatedData.subjectId,
        moduleId: validatedData.moduleId,
        name: validatedData.name,
        description: validatedData.description,
        dynamicSchema: validatedData.dynamicSchema,
        createdBy: validatedData.createdBy,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    return NextResponse.json(newLogBookTemplate, { status: 201 });
  } catch (error) {
    console.error('Log Book Template Creation Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation Failed', details: error.errors }, 
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}

// Optional: Add a GET route to fetch available academic years, batches, subjects, etc.
export async function GET() {
  try {
    const academicYears = await db.select().from(AcademicYearTable);
    const batches = await db.select().from(PhaseTable);
    const subjects = await db.select().from(SubjectTable);
    const modules = await db.select().from(ModuleTable);

    return NextResponse.json({
      academicYears,
      batches,
      subjects,
      modules
    });
  } catch (error) {
    console.error('Fetching reference data error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}