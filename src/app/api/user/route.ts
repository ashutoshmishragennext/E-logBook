/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { TeacherProfileTable, UsersTable, StudentProfileTable } from "@/db/schema";
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
      .where(eq(UsersTable.id, userId))
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

function generateTempPassword(length = 10) {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Check if the request is for bulk user creation (array of users)
    const isBulkOperation = Array.isArray(body);
    
    if (isBulkOperation) {
      return handleBulkUserCreation(body);
    } else {
      return handleSingleUserCreation(body);
    }
  } catch (error) {
    console.error("Error creating user(s):", error);
    
    // Check for specific error types
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    
    // Handle duplicate email error (database specific - this example is for PostgreSQL)
    if (errorMessage.includes("duplicate key") && errorMessage.includes("email")) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

async function handleSingleUserCreation(userData: any) {
  // Validate request
  if (!userData.email || !userData.name) {
    return NextResponse.json(
      { error: "Name and email are required" },
      { status: 400 }
    );
  }

  // Default to USER role if not specified
  const role = userData.role || "USER";
  const password = userData.password || generateTempPassword();
  console.log("Generated password:", password);

  // Create user
  const [user] = await db.insert(UsersTable)
    .values({
      name: userData.name,
      email: userData.email,
      password: await hash(password, 10),
      role: role,
      phone: userData.phone || null
    })
    .returning({ 
      id: UsersTable.id,
      email: UsersTable.email,
      role: UsersTable.role
    });

  console.log("User created:", user);

  let teacherId = null;
  let studentId = null;

  // Handle teacher profile creation
  if (role === "TEACHER" && userData.teacherData) {
    if (!userData.teacherData.collegeId || !userData.teacherData.employeeId) {
      return NextResponse.json(
        { error: "College ID and Employee ID are required for teachers" },
        { status: 400 }
      );
    }

    const [teacher] = await db.insert(TeacherProfileTable)
      .values({
        userId: user.id,
        name: userData.name,
        email: userData.email,
        collegeId: userData.teacherData.collegeId,
        designation: userData.teacherData.designation || "Lecturer",
        employeeId: userData.teacherData.employeeId,
        mobileNo: userData.teacherData.mobileNo || userData.phone || ""
      })
      .returning({ id: TeacherProfileTable.id });

    teacherId = teacher.id;
    console.log("Teacher profile created with ID:", teacherId);
  }
  
  // Handle student profile creation
  if (role === "STUDENT" && userData.studentData) {
    if (!userData.studentData.collegeId) {
      return NextResponse.json(
        { error: "College ID is required for students" },
        { status: 400 }
      );
    }

    const [student] = await db.insert(StudentProfileTable)
      .values({
        userId: user.id,
        name: userData.name,
        email: userData.email,

        collegeId: userData.studentData.collegeId,
        rollNo: userData.studentData.rollNo || null,
        branchId: userData.studentData.branchId || null,
        courseId: userData.studentData.courseId || null,
        academicYearId: userData.studentData.academicYearId || null,
        mobileNo: userData.studentData.mobileNo || userData.phone || ""
      })
      .returning({ id: StudentProfileTable.id });

      console.log("Student profile created:", student);
    studentId = student.id;
    console.log("Student profile created with ID:", studentId);
  }

  return NextResponse.json({
    teacherId: teacherId,
    studentId: studentId,
    userId: user.id,
    name: userData.name,
    email: userData.email,
    role: user.role,
    ...(userData.teacherData && { 
      collegeId: userData.teacherData.collegeId,
      designation: userData.teacherData.designation || "Lecturer",
      employeeId: userData.teacherData.employeeId
    }),
    ...(userData.studentData && {
      rollNo: userData.studentData.rollNo,
      mobileNo: userData.studentData.mobileNo,
      collegeId: userData.studentData.collegeId,
      branchId: userData.studentData.branchId,
      courseId: userData.studentData.courseId,
      academicYearId: userData.studentData.academicYearId
    }),
    ...(!userData.password && { tempPassword: password })
  });
}

async function handleBulkUserCreation(usersData: any[]) {
  if (!usersData.length) {
    return NextResponse.json(
      { error: "No users provided for bulk creation" },
      { status: 400 }
    );
  }

  const results = {
    successful: 0,
    failed: 0,
    errors: [] as string[],
    users: [] as any[]
  };

  // Process each user sequentially
  for (const userData of usersData) {
    try {
      // Validate minimum required fields
      if (!userData.email || !userData.name) {
        results.failed++;
        results.errors.push(`Missing name or email for entry: ${JSON.stringify(userData)}`);
        continue;
      }

      // Generate password if not provided
      const password = userData.password || generateTempPassword();
      
      // Default to USER role if not specified
      const role = userData.role || "USER";

      // Create user
      const [user] = await db.insert(UsersTable)
        .values({
          name: userData.name,
          email: userData.email,
          password: await hash(password, 10),
          role: role,
          phone: userData.phone || null
        })
        .returning({ 
          id: UsersTable.id,
          email: UsersTable.email,
          role: UsersTable.role
        });

      let teacherId = null;
      let studentId = null;

      // Handle teacher profile creation if applicable
      if (role === "TEACHER" && userData.teacherData) {
        // Validate teacher-specific required fields
        if (!userData.teacherData.collegeId || !userData.teacherData.employeeId) {
          results.failed++;
          results.errors.push(`Teacher data missing collegeId or employeeId for: ${userData.email}`);
          
          // Delete the created user since we couldn't complete the teacher profile
          await db.delete(UsersTable).where(eq(UsersTable.id, user.id));
          continue;
        }

        const [teacher] = await db.insert(TeacherProfileTable)
          .values({
            userId: user.id,
            name: userData.name,
            email: userData.email,
            collegeId: userData.teacherData.collegeId,
            designation: userData.teacherData.designation || "Lecturer",
            employeeId: userData.teacherData.employeeId,
            mobileNo: userData.teacherData.mobileNo || userData.phone || ""
          })
          .returning({ id: TeacherProfileTable.id });

        teacherId = teacher.id;
      }
      
      // Handle student profile creation if applicable
      if (role === "STUDENT" && userData.studentData) {
        // Validate student-specific required fields
        if (!userData.studentData.collegeId) {
          results.failed++;
          results.errors.push(`Student data missing collegeId for: ${userData.email}`);
          
          // Delete the created user since we couldn't complete the student profile
          await db.delete(UsersTable).where(eq(UsersTable.id, user.id));
          continue;
        }

        const [student] = await db.insert(StudentProfileTable)
          .values({
            userId: user.id,
            name: userData.name,
            email: userData.email,
            rollNo: userData.studentData.rollNo || null,
            collegeId: userData.studentData.collegeId,
            branchId: userData.studentData.branchId || null,
            courseId: userData.studentData.courseId || null,
            academicYearId: userData.studentData.academicYearId || null,
            mobileNo: userData.studentData.mobileNo || userData.phone || ""
          })
          .returning({ id: StudentProfileTable.id });

        studentId = student.id;
      }

      // Add successful user to results
      results.successful++;
      results.users.push({
        userId: user.id,
        email: userData.email,
        role: role,
        ...(teacherId && { teacherId }),
        ...(studentId && { studentId }),
        tempPassword: !userData.password ? password : undefined
      });

    } catch (error) {
      results.failed++;
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      results.errors.push(`Failed to create user ${userData.email}: ${errorMessage}`);
      
      // Log for debugging
      console.error(`Error creating user ${userData.email}:`, error);
    }
  }

  return NextResponse.json({
    message: `Processed ${usersData.length} users. Created: ${results.successful}, Failed: ${results.failed}`,
    results
  });
}

// async function sendWelcomeEmail(email: string, tempPassword: string) {
//   // Implement your email logic
// }