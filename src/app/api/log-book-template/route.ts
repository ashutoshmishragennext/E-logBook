
import { db } from '@/db';
import {
  LogBookTemplateTable
} from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const {
      academicYearId,
      batchId,
      subjectId,
      moduleId,
      createdBy,
      name,
      description,
      dynamicSchema,

    } = body;


    //   const batchId="86f6cdd7-281c-4eba-b423-e835360b012e";
    //  const subjectId ="21f6eaf4-878d-4c8b-aa14-e9ae7c854d32"
    //  const moduleId ="05ac612a-b8c5-482d-bd3b-9d1233e1f0a4"
    //   const createdBy="913d6747-dab3-4432-8e7e-4706377a920c";

    console.log("bodyyyyyyyyyyyyyyyyyyy", body);

    // Ensure the UUIDs are valid and not empty
    if (!academicYearId || !batchId || !subjectId || !moduleId) {
      return NextResponse.json(
        { error: 'Missing required fields (UUIDs)' },
        { status: 400 }
      );
    }

    // Optionally, generate a new UUID for the createdBy field if it's missing or empty
    // This may not be necessary if createdBy is always sent from the client.
    // if (!createdBy) {
    //   createdBy = "913d6747-dab3-4432-8e7e-4706377a920c"; // Generate a new UUID if missing
    // }

    // Insert log book template
    const newTemplate = await db.insert(LogBookTemplateTable).values({
      academicYearId,
      batchId,
      subjectId,
      moduleId,
      name,
      description,
      dynamicSchema: dynamicSchema || { groups: [] },
      createdBy
    }).returning();

    return NextResponse.json(newTemplate[0], { status: 201 });
  } catch (error) {
    console.error('Error creating log book template:', error);
    return NextResponse.json(
      { error: 'Failed to create log book template' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const academicYearId = searchParams.get('academicYearId');
    const batchId = searchParams.get('batchId');
    const subjectId = searchParams.get('subjectId');
    const moduleId = searchParams.get('moduleId');
    const templateId = searchParams.get('templateId');

    // Build query conditions using drizzle-orm's filtering
    const conditions = [];
    
    if (academicYearId) {
      conditions.push(eq(LogBookTemplateTable.academicYearId, academicYearId));
    }
    
    if (batchId) {
      conditions.push(eq(LogBookTemplateTable.batchId, batchId));
    }
    
    if (subjectId) {
      conditions.push(eq(LogBookTemplateTable.subjectId, subjectId));
    }
    
    if (moduleId) {
      conditions.push(eq(LogBookTemplateTable.moduleId, moduleId));
    }
    
    if (templateId) {
      conditions.push(eq(LogBookTemplateTable.id, templateId));
    }
    
    // Fetch log book templates
    const templates = await db.query.LogBookTemplateTable.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        academicYear: true,
        batch: true,
        subject: true,
        module: true
      }
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching log book templates:', error);
    
    // Log the full error for more detailed debugging
    if (error instanceof Error) {
      console.error('Detailed error:', error.message);
      console.error('Stack trace:', error.stack);
    }

    return NextResponse.json(
      { 
        error: 'Failed to fetch log book templates', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
