import { db } from '@/db';
import { LogBookTable } from '@/db/schema';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Zod schema for log book creation
const logBookCreationSchema = z.object({
  subject: z.string().min(1),
  course: z.string().min(1),
  batch: z.string().min(1),
  dynamicFields: z.array(
    z.object({
      fieldName: z.string().min(1),
      fieldType: z.enum(["text", "number", "date", "select", "textarea"]),
      isRequired: z.boolean(),
      options: z.array(z.string()).optional()
    })
  ).min(1)
  studentId:
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate the request body
    const validatedData = logBookCreationSchema.parse(body);
    
    // Create the log book template
    const [newLogBook] = await db
      .insert(LogBookTable)
      .values({
        ...validatedData,
        dynamicSchema: { 
          groups: [{
            groupName: validatedData.subject,
            fields: validatedData.dynamicFields
          }]
        },
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    return NextResponse.json(newLogBook, { status: 201 });
  } catch (error) {
    console.error('Log Book Creation Error:', error);
    
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