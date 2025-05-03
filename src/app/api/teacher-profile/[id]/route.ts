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

    if (!teacherId) {
      return NextResponse.json({ error: "Teacher ID is required" }, { status: 400 });
    }

    const subjects = await db
      .select()
      .from(TeacherSubjectTable)
      .where(eq(TeacherSubjectTable.teacherId, teacherId))
      .then(res => res[0]);

    if (!subjects) {
      return NextResponse.json({ error: "No subjects found for this teacher" }, { status: 404 });
    }

    return NextResponse.json(subjects, { status: 200 });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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
