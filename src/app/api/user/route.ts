import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { TeacherProfileTable, UsersTable } from "@/db/schema";
import { hash } from "bcryptjs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const user = await db
      .select()
      .from(UsersTable)
      .where(eq(UsersTable.id, userId)) // if `id` is number, convert `userId` to number
      .limit(1)
      .then(res => res[0]);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate request
    if (!body.email || !body.name) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Default to USER role if not specified
    const role = body.role || "USER";
    const password = body.password || generateTempPassword();
    console.log("Generated password:", password);

    // Create user
    const [user] = await db.insert(UsersTable)
      .values({
        name: body.name,
        email: body.email,
        password: await hash(password, 10),
        role: role,
        phone: body.phone || null
      })
      .returning({ 
        id: UsersTable.id,
        email: UsersTable.email,
        role: UsersTable.role
      });

    console.log("User created:", user);

    let teacherId = null;

    // Handle teacher profile creation
    if (role === "TEACHER" && body.teacherData) {
      if (!body.teacherData.collegeId || !body.teacherData.employeeId) {
        return NextResponse.json(
          { error: "College ID and Employee ID are required for teachers" },
          { status: 400 }
        );
      }

      const [teacher] = await db.insert(TeacherProfileTable)
        .values({
          userId: user.id,
          name: body.name,
          email: body.email,
          collegeId: body.teacherData.collegeId,
          designation: body.teacherData.designation || "Lecturer",
          employeeId: body.teacherData.employeeId,
          mobileNo: body.phone || ""
        })
        .returning({ id: TeacherProfileTable.id });

      teacherId = teacher.id;
      console.log("Teacher profile created with ID:", teacherId);
    }

    return NextResponse.json({
      teacherId: body.teacherData ? teacherId : null,
      userId: user.id,
          name: body.name,
          email: body.email,
          collegeId: body.teacherData.collegeId,
          designation: body.teacherData.designation || "Lecturer",
          employeeId: body.teacherData.employeeId,
          mobileNo: body.phone || "",
      ...(!body.password && { tempPassword: password })
    });

  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper functions
function generateTempPassword(): string {
  return Math.random().toString(36).slice(-8);
}

// async function sendWelcomeEmail(email: string, tempPassword: string) {
//   // Implement your email logic
// }
