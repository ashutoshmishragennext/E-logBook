import { TeacherSubjectTable } from '@/db/schema';
import { NextResponse } from "next/server";
import {db} from "@//db"; // Your DB connection
import { v4 as uuidv4 } from "uuid";
import { eq } from 'drizzle-orm';

// POST - Assign subjects to a teacher

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get("teacherId");
    const collegeId = searchParams.get("collegeId");

    // Validate query params
    if (!teacherId && collegeId) {
      return NextResponse.json(
        { error: "Either teacherId or clgId is required." },
        { status: 400 }
      );
    }

    // If teacherId is provided, fetch single teacher's subjects
    if (teacherId) {
      const teacher = await db
        .select()
        .from(TeacherSubjectTable)
        .where(eq(TeacherSubjectTable.teacherId, teacherId));

      if (!teacher || teacher.length === 0) {
        return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
      }

      return NextResponse.json({ data: teacher }, { status: 200 });
    }

    // If clgId is provided, fetch all teachers related to that college
    if (collegeId) {
      const teachers = await db
        .select()
        .from(TeacherSubjectTable)
        .where(eq(TeacherSubjectTable.collegeId,collegeId));

      if (!teachers || teachers.length === 0) {
        return NextResponse.json({ error: "No teachers found for this college" }, { status: 404 });
      }

      return NextResponse.json({ data: teachers }, { status: 200 });
    }
  } catch (error) {
    console.error("Error fetching teacher data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const teacherId = params.id; // ✅ use params.id, not params.teacherId
  console.log("Teacher ID:", teacherId);

  const { assignments } = await req.json();

  if (!teacherId || !Array.isArray(assignments)) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  

  try {
    const dataToInsert = assignments.map((item) => ({
      teacherId,
      subjectId: item.subjectId,
      academicYearId: item.academicYearId,
      phaseId: item.phaseId,
      createdAt: new Date(),
    }));
    console.log("Data to insert:", dataToInsert);

    await db.insert(TeacherSubjectTable).values(dataToInsert).onConflictDoNothing();

    return NextResponse.json({
      message: "Subjects assigned successfully",
      count: dataToInsert.length,
    });
  } catch (error) {
    console.error("Assignment error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
