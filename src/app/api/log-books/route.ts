import { db } from '@/db';
import { LogBookEntryTable } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Zod schema for creating log book entries (without ID)
const logBookEntryCreateSchema = z.object({
  logBookTemplateId: z.string().uuid(),
  studentId: z.string().uuid(),
  studentSubjectId: z.string().uuid().nullable().optional(), // ✅ allows null
  teacherId: z.string().uuid().optional(),
  dynamicFields: z.record(z.any()).optional(),
  studentRemarks: z.string().optional(),
  status: z.enum(["DRAFT", "SUBMITTED", "REVIEWED"]).default("DRAFT"),
  teacherRemarks: z.string().optional(),
}).strict();



// Zod schema for updating log book entries (with ID)
const logBookEntryUpdateSchema = logBookEntryCreateSchema.extend({
  id: z.string().uuid()
});
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = logBookEntryCreateSchema.parse(body);

    const [newLogBookEntry] = await db
      .insert(LogBookEntryTable)
      .values({
        logBookTemplateId: validatedData.logBookTemplateId,
        studentId: validatedData.studentId,
        teacherId: validatedData.teacherId || null,
        dynamicFields: validatedData.dynamicFields,
        studentRemarks: validatedData.studentRemarks || null,
        status: validatedData.status,
        // ✅ add required field missing from payload
        studentSubjectId: validatedData.studentSubjectId, 
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    return NextResponse.json(newLogBookEntry, { status: 201 });
  } catch (error) {
    console.error('Log Book Entry Creation Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation Failed',
          details: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


export async function GET(req: NextRequest) {
  try {
    // Extract query parameters
    const searchParams = req.nextUrl.searchParams;
    const studentId = searchParams.get('studentId');
    const logBookTemplateId = searchParams.get('logBookTemplateId');
    const status = searchParams.get('status');
    const teacherId = searchParams.get('teacherId');

    // Build query conditions
    const conditions = [];
    if (teacherId) conditions.push(eq(LogBookEntryTable.teacherId, teacherId));
    if (studentId) conditions.push(eq(LogBookEntryTable.studentId, studentId));
    if (logBookTemplateId) conditions.push(eq(LogBookEntryTable.logBookTemplateId, logBookTemplateId));
    if (status) conditions.push(eq(LogBookEntryTable.status, status));

    // Fetch log book entries based on conditions
    const logBookEntries = await db
      .select()
      .from(LogBookEntryTable)
      .where(and(...conditions));

    return NextResponse.json(logBookEntries);
  } catch (error) {
    console.error('Fetching Log Book Entries Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    // Get the ID from query parameters
    const searchParams = req.nextUrl.searchParams;
    const entryId = searchParams.get('id');

    // Validate that ID is present and is a valid UUID
    if (!entryId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(entryId)) {
      return NextResponse.json(
        { error: 'Invalid or missing log book entry ID' }, 
        { status: 400 }
      );
    }

    // Parse the request body
    const body = await req.json();

    // Validate the combined data
    const validatedData = logBookEntryUpdateSchema.parse({
      id: entryId,
      ...body
    });

    // Update the log book entry
    const updatedEntries = await db
      .update(LogBookEntryTable)
      .set({ 
        status: validatedData.status,
        ...(validatedData.logBookTemplateId && { logBookTemplateId: validatedData.logBookTemplateId }),
        ...(validatedData.studentId && { studentId: validatedData.studentId }),
        ...(validatedData.dynamicFields && { dynamicFields: validatedData.dynamicFields }),
        ...(validatedData.studentRemarks && { studentRemarks: validatedData.studentRemarks }),
        ...(validatedData.teacherRemarks && { teacherRemarks: validatedData.teacherRemarks }),
        ...(validatedData.teacherId && { teacherId: validatedData.teacherId }),
        updatedAt: new Date()
      })
      .where(eq(LogBookEntryTable.id, validatedData.id))
      .returning();

    // Check if any entries were updated
    if (updatedEntries.length === 0) {
      return NextResponse.json(
        { error: 'No matching log book entry found' }, 
        { status: 404 }
      );
    }

    return NextResponse.json(updatedEntries[0], { status: 200 });
  } catch (error) {
    console.error('Log Book Entry Update Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation Failed', 
          details: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        }, 
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}