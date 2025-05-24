
// File: /app/api/teacher-subjects/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { TeacherSubjectTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("teacherId");
    const subjectId = searchParams.get("subjectId");
    const CollegeId = searchParams.get("collegeId");
    const id = searchParams.get("id");

    if (!teacherId && !subjectId && !id && !CollegeId) {
      return NextResponse.json(
        { error: "Missing teacherId or subjectId" },
        { status: 400 }
      );
    }

    // If subjectId is provided, filter by it

    if (id) {
      const teacherSubject = await db
        .select()
        .from(TeacherSubjectTable)
        .where(eq(TeacherSubjectTable.id, id));
      return NextResponse.json(teacherSubject);
    }
    if (subjectId && CollegeId) {
      const teacherSubjects = await db
        .select()
        .from(TeacherSubjectTable)
        .where(and(
          eq(TeacherSubjectTable.collegeId, CollegeId),
            eq(TeacherSubjectTable.subjectId, subjectId))
        );
      return NextResponse.json(teacherSubjects);
    }
     if (subjectId) {
      const teacherSubjects = await db
        .select()
        .from(TeacherSubjectTable)
        .where(
            eq(TeacherSubjectTable.subjectId, subjectId)
        );
      return NextResponse.json(teacherSubjects);
    }

    
    const teacherSubjects = await db
      .select()
      .from(TeacherSubjectTable)
      .where(eq(TeacherSubjectTable.teacherId, teacherId!));
    
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
    const { teacherId, academicYearId, phaseId , collegeId} = firstAssignment;

    if (!teacherId || !academicYearId || !phaseId || !collegeId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }



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
