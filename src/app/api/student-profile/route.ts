// pages/api/student-profile.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { StudentProfileTable, UsersTable } from "@/db/schema";
import { eq } from "drizzle-orm";



export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get("id");
    const byUserId = searchParams.get("byUserId");

    // If neither parameter is provided
    if (!id && !byUserId) {
      return NextResponse.json(
        { message: "Either id or byUserId is required" },
        { status: 400 }
      );
    }

    let student;
    
    if (byUserId) {
      // Search by userId
      student = await db
        .select()
        .from(StudentProfileTable)
        .where(eq(StudentProfileTable.userId, byUserId))
        .limit(1);
    } else {
      // Search by studentId (id parameter)
      student = await db
        .select()
        .from(StudentProfileTable)
        .where(eq(StudentProfileTable.id, id!))
        .limit(1);
    }

    if (!student || student.length === 0) {
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(student[0]);
  } catch (error) {
    console.error("Error fetching student profile:", error);
    return NextResponse.json(
      { message: "Internal server error while fetching student profile" },
      { status: 500 }
    );
  }
}
export async function POST(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get("id");
    
    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    // Parse the request body
    const body = await req.json();

    // Check if user exists
    const existingUser = await db
      .select()
      .from(UsersTable)
      .where(eq(UsersTable.id, userId))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Check if profile already exists
    const existingProfile = await db
      .select()
      .from(StudentProfileTable)
      .where(eq(StudentProfileTable.userId, userId))
      .limit(1);

    if (existingProfile.length > 0) {
      return NextResponse.json(
        { message: "Student profile already exists" },
        { status: 400 }
      );
    }

    // Create new student profile
    const newProfile = await db
      .insert(StudentProfileTable)
      .values({
        ...body,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    return NextResponse.json(newProfile[0], { status: 201 });
  } catch (error) {
    console.error("Student Profile Creation Error:", error);
    return NextResponse.json(
      { 
        message: "Error creating student profile",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    // Parse the request body
    const body = await req.json();

    // Check if profile exists
    const existingProfile = await db
      .select()
      .from(StudentProfileTable)
      .where(eq(StudentProfileTable.userId, userId))
      .limit(1);

    if (existingProfile.length === 0) {
      return NextResponse.json(
        { message: "Student profile not found" },
        { status: 404 }
      );
    }

    // Update student profile
    const updatedProfile = await db
      .update(StudentProfileTable)
      .set({
        ...body,
        updatedAt: new Date()
      })
      .where(eq(StudentProfileTable.userId, userId))
      .returning();

    return NextResponse.json(updatedProfile[0], { status: 200 });
  } catch (error) {
    console.error("Student Profile Update Error:", error);
    return NextResponse.json(
      { 
        message: "Error updating student profile",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}