import { db } from '@/db';
import { LogBookEntryTable } from '@/db/schema';
import { eq , and } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Zod schema for log book entry creation
const logBookEntryUpdateSchema = z.object({
  id: z.string().uuid(),
  logBookTemplateId: z.string().uuid(),
  studentId: z.string().uuid(),
  dynamicFields: z.record(z.any()).optional(),
  studentRemarks: z.string().optional(),
  status: z.enum(["DRAFT", "SUBMITTED", "REVIEWED"])
}).strict();

export async function POST(req: NextRequest) {
  try {
    // Parse and validate the request body
    const body = await req.json();
    const newId = crypto.randomUUID(); // Generate a new UUID for the entry
    
    // Validate the request body against the schema
    const validatedData = logBookEntryUpdateSchema.parse({
      id: newId, // Use the generated UUID
      ...body,
      // Ensure default status if not provided
      status: body.status || "DRAFT"
    });

    // Create the log book entry
    const [newLogBookEntry] = await db
      .insert(LogBookEntryTable)
      .values({
        id: validatedData.id,
        logBookTemplateId: validatedData.logBookTemplateId,
        studentId: validatedData.studentId, // Assuming you pass the student ID
        dynamicFields: validatedData.dynamicFields,
        studentRemarks: validatedData.studentRemarks,
        status: validatedData.status,
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
          details: error.errors 
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

// Optional: GET route to fetch log book entries
export async function GET(req: NextRequest) {
  try {
    // Extract query parameters
    const searchParams = req.nextUrl.searchParams;
    const studentId = searchParams.get('studentId');
    const logBookTemplateId = searchParams.get('logBookTemplateId');
    const status = searchParams.get('status');

    // Build query conditions
    const conditions = [];
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


// Create a separate schema for updating log book entries


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

    // Log the raw request body for debugging
    console.log('Received body:', body);

    // Validate the request body against the schema
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
    console.error('Log Book Entry Status Update Error:', error);
    
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