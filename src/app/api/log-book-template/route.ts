// app/api/templates/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { LogBookTemplateTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";

import { z } from "zod";

// Define validation schemas for templates
const fieldSchema = z.object({
  fieldName: z.string(),
  fieldLabel: z.string(),
  fieldType: z.string(),
  isRequired: z.boolean(),
  options: z.array(z.string()).optional(),
  validationRegex: z.string().optional(),
  defaultValue: z.string().optional(),
});

const groupSchema = z.object({
  groupName: z.string(),
  fields: z.array(fieldSchema),
});

const dynamicSchemaValidation = z.object({
  groups: z.array(groupSchema),
});

// Base template validation schema
const baseTemplateSchema = z.object({
  name: z.string().min(3, "Template name must be at least 3 characters"),
  description: z.string().optional(),
  dynamicSchema: dynamicSchemaValidation,
  createdBy: z.string().uuid(),

});

// General template schema
const generalTemplateSchema = baseTemplateSchema.extend({
  templateType: z.literal("general"),
});

// Subject-specific template schema
const subjectTemplateSchema = baseTemplateSchema.extend({
  templateType: z.literal("subject"),
  academicYearId: z.string().uuid().optional(),
  phaseId: z.string().uuid().optional(),
  subjectId: z.string().uuid(),
  teacherSubjectId: z.string().uuid().optional(),

});

// Combined template schema
const templateFormSchema = z.discriminatedUnion("templateType", [
  generalTemplateSchema,
  subjectTemplateSchema,
]);

// GET handler for templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const templateType = searchParams.get("templateType");
    const academicYearId = searchParams.get("academicYearId");
    const phaseId = searchParams.get("phaseId");
    const subjectId = searchParams.get("subjectId");

    const conditions = [];

    if (templateType === "general") {
      conditions.push(eq(LogBookTemplateTable.templateType, "general"));
    } else if (templateType === "subject" && subjectId) {
      conditions.push(eq(LogBookTemplateTable.templateType, "subject"));
      conditions.push(eq(LogBookTemplateTable.subjectId, subjectId));
    }

    if (academicYearId) {
      conditions.push(eq(LogBookTemplateTable.academicYearId, academicYearId));
    }

    if (phaseId) {
      conditions.push(eq(LogBookTemplateTable.batchId, phaseId));
    }

    const templates = await db
      .select()
      .from(LogBookTemplateTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}


// POST handler for templates
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = templateFormSchema.parse(body);
    
    // Prepare data for insertion
    const templateData = {
      ...validatedData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Insert template
    const result = await db.insert(LogBookTemplateTable).values(templateData).returning();
    
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Error creating template:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    );
  }
}

// PATCH handler for templates
export async function PATCH(request: NextRequest) {
  try {
    
    const body = await request.json();
    
    // Validate template ID
    if (!body.id) {
      return NextResponse.json(
        { error: "Template ID is required" },
        { status: 400 }
      );
    }
    
    // Validate request body
    const { id, ...updateData } = body;
    const validatedData = templateFormSchema.parse(updateData);
    
    // Prepare data for update
    const templateData = {
      ...validatedData,
      updatedAt: new Date(),
    };
    
    // Update template
    const result = await db
      .update(LogBookTemplateTable)
      .set(templateData)
      .where(eq(LogBookTemplateTable.id, id))
      .returning();
    
    if (result.length === 0) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error updating template:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to update template" },
      { status: 500 }
    );
  }
}

// DELETE handler for templates
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { error: "Template ID is required" },
        { status: 400 }
      );
    }
    
    // Delete template
    const result = await db
      .delete(LogBookTemplateTable)
      .where(eq(LogBookTemplateTable.id, id))
      .returning();
    
    if (result.length === 0) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting template:", error);
    return NextResponse.json(
      { error: "Failed to delete template" },
      { status: 500 }
    );
  }
}