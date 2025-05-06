// File: /app/api/teacher-subjects/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { TeacherSubjectTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("teacherId");
    
    if (!teacherId) {
      return NextResponse.json(
        { error: "Teacher ID is required" },
        { status: 400 }
      );
    }
    
    const teacherSubjects = await db
      .select()
      .from(TeacherSubjectTable)
      .where(eq(TeacherSubjectTable.teacherId, teacherId));
    
    return NextResponse.json(teacherSubjects);
  } catch (error) {
    console.error("Error fetching teacher subjects:", error);
    return NextResponse.json(
      { error: "Failed to fetch teacher subjects" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    // Handle the case where the frontend sends an array of assignments
    const assignments = Array.isArray(data) ? data : [data];
    
    // Validate only the required fields from the first assignment
    const firstAssignment = assignments[0];
    const { teacherId, academicYearId, phaseId } = firstAssignment;

    if (!teacherId || !academicYearId || !phaseId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Delete existing assignments for this teacher in this academic year and phase
    await db.delete(TeacherSubjectTable).where(
      and(
        eq(TeacherSubjectTable.teacherId, teacherId),
        eq(TeacherSubjectTable.academicYearId, academicYearId),
        eq(TeacherSubjectTable.phaseId, phaseId)
      )
    );

    // Insert all new assignments with all fields including courseId and branchId
    const result = await db.insert(TeacherSubjectTable)
      .values(assignments)
      .returning();

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error assigning teacher subjects:", error);
    return NextResponse.json(
      { error: "Failed to assign teacher subjects" },
      { status: 500 }
    );
  }
}
