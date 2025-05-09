import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { TeacherProfileTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const collegeId = searchParams.get("collegeId");

    if (!id && !collegeId) {
      return NextResponse.json(
        { error: "Either 'id' or 'collegeId' query parameter is required." },
        { status: 400 }
      );
    }

    // Fetch by teacher ID
    if (id) {
      const profile = await db
        .select()
        .from(TeacherProfileTable)
        .where(eq(TeacherProfileTable.userId, id));

      if (!profile || profile.length === 0) {
        return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
      }

      return NextResponse.json({ data: profile }, { status: 200 });
    }

    // Fetch all teachers by college ID
    if (collegeId) {
      const profiles = await db
        .select()
        .from(TeacherProfileTable)
        .where(eq(TeacherProfileTable.collegeId, collegeId));

      if (!profiles || profiles.length === 0) {
        return NextResponse.json({ error: "No teachers found for this college" }, { status: 404 });
      }

      return NextResponse.json({ data: profiles }, { status: 200 });
    }
  } catch (error) {
    console.error("Error fetching teacher profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch teacher profile" },
      { status: 500 }
    );
  }
}


export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Validate required fields
    if (!data.userId || !data.name || !data.email || !data.mobileNo ||
        !data.collegeId || !data.branchId || !data.courseId ||
        !data.academicYearId || !data.phaseId || !data.designation ||
        !data.employeeId || !data.joiningDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Check if profile already exists
    const existingProfile = await db
      .select()
      .from(TeacherProfileTable)
      .where(eq(TeacherProfileTable.userId, data.userId));
    
    if (existingProfile.length > 0) {
      return NextResponse.json(
        { error: "Profile already exists for this user" },
        { status: 400 }
      );
    }
    
    // Create new profile
    const result = await db.insert(TeacherProfileTable).values({
      userId: data.userId,
      name: data.name,
      email: data.email,
      mobileNo: data.mobileNo,
      location: data.location,
      profilePhoto: data.profilePhoto,
      teacherIdProof: data.teacherIdProof,
      collegeId: data.collegeId,
      branchId: data.branchId,
      courseId: data.courseId,
      academicYearId: data.academicYearId,
      phaseId: data.phaseId,
      designation: data.designation,
      employeeId: data.employeeId,
      joiningDate: new Date(data.joiningDate),
      isActive: data.isActive || "true",
    }).returning();
    
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error creating teacher profile:", error);
    return NextResponse.json(
      { error: "Failed to create teacher profile" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const data = await req.json();
    
    if (!id) {
      return NextResponse.json(
        { error: "Profile ID is required" },
        { status: 400 }
      );
    }
    
    // Update profile
    const result = await db.update(TeacherProfileTable)
      .set({
        name: data.name,
        email: data.email,
        mobileNo: data.mobileNo,
        location: data.location,
        profilePhoto: data.profilePhoto,
        teacherIdProof: data.teacherIdProof,
        collegeId: data.collegeId,
        branchId: data.branchId,
        courseId: data.courseId,
        academicYearId: data.academicYearId,
        phaseId: data.phaseId,
        designation: data.designation, 
        employeeId: data.employeeId,
        joiningDate: new Date(data.joiningDate),
        isActive: data.isActive,
        updatedAt: new Date(),
      })
      .where(eq(TeacherProfileTable.id, id))
      .returning();
    
    if (result.length === 0) {
      return NextResponse.json(
        { error: "Teacher profile not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error updating teacher profile:", error);
    return NextResponse.json(
      { error: "Failed to update teacher profile" },
      { status: 500 }
    );
  }
}
