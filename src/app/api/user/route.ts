/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { TeacherProfileTable, UsersTable, StudentProfileTable } from "@/db/schema";
import { hash } from "bcryptjs";
import { sendEmail } from "@/lib/mailer";

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

// Generate a random default password (4-5 characters)
function generateDefaultPassword(length = 5) {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
}

async function sendWelcomeEmail(name: string, email: string, password: string, role: string) {
  try {
    const loginUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/login`;

    await sendEmail(
      "Elog Book",
      email,
      "Welcome to Elog Book - Account Created",
      `<!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Elog Book</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Elog Book!</h1>
          <p style="color: #f0f0f0; margin: 10px 0 0 0; font-size: 16px;">Your digital learning companion</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
          <p style="font-size: 18px; margin-bottom: 20px;">Hello <strong>${name}</strong>,</p>
          
          <p style="margin-bottom: 20px;">Your account has been successfully created! Here are your login credentials:</p>
          
          <div style="background: #f8f9fa; border-left: 4px solid #4f46e5; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
            <h3 style="color: #4f46e5; margin: 0 0 15px 0; font-size: 18px;">📧 Login Details</h3>
            <p style="margin: 8px 0;"><strong>Email:</strong> <code style="background: #e9ecef; padding: 2px 6px; border-radius: 4px; font-size: 14px;">${email}</code></p>
            <p style="margin: 8px 0;"><strong>Password:</strong> <code style="background: #e9ecef; padding: 2px 6px; border-radius: 4px; font-size: 16px; font-weight: bold; color: #d63384;">${password}</code></p>
            <p style="margin: 8px 0;"><strong>Role:</strong> <span style="background: #198754; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; text-transform: uppercase;">${role}</span></p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px; transition: transform 0.2s;">
              🚀 Login to Elog Book
            </a>
          </div>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <h4 style="color: #856404; margin: 0 0 10px 0; display: flex; align-items: center;">
              <span style="font-size: 20px; margin-right: 8px;">⚠️</span>
              Important Security Notice
            </h4>
            <p style="color: #856404; margin: 0; font-weight: 500;">
              Please <strong>change your password immediately</strong> after your first login for security purposes.
            </p>
          </div>
          
          <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; margin-top: 30px; text-align: center; color: #666;">
            <p style="margin: 0;">Need help? Contact our support team</p>
            <p style="margin: 5px 0 0 0; font-size: 14px;">Best regards, <strong>The Elog Book Team</strong></p>
          </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #666;">
          <p style="margin: 0;">This is an automated message. Please do not reply to this email.</p>
        </div>
      </body>
      </html>`
    );

    console.log(`Welcome email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error(`Failed to send welcome email to ${email}:`, error);
    return false;
  }
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

  // Generate default password for TEACHER and STUDENT roles, use provided password otherwise
  let password: string;
  let isTemporaryPassword = false;

  if (!userData.password && (role === "TEACHER" || role === "STUDENT" || role === "COLLEGE_ADMIN")) {
    password = generateDefaultPassword(5); // Generate 5-character default password
    isTemporaryPassword = true;
  } else {
    password = userData.password || userData.email; // Fallback to email if no password provided
    isTemporaryPassword = !userData.password;
  }

  console.log("Generated password:", password);

  // Create user
  const [user] = await db.insert(UsersTable)
    .values({
      name: userData.name,
      email: userData.email,
      password: await hash(password, 10),
      role: role,
      phone: userData.phone || null,
      defaultpassword: isTemporaryPassword ? password : null // Store default password if generated
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

  // Send welcome email with login credentials
  const emailSent = await sendWelcomeEmail(userData.name, userData.email, password, role);

  return NextResponse.json({
    teacherId: teacherId,
    studentId: studentId,
    userId: user.id,
    name: userData.name,
    email: userData.email,
    role: user.role,
    emailSent: emailSent,
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
    ...(isTemporaryPassword && { tempPassword: password })
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
    users: [] as any[],
    emailResults: {
      sent: 0,
      failed: 0
    }
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

      // Default to USER role if not specified
      const role = userData.role || "USER";

      // Generate default password for TEACHER and STUDENT roles, use provided password otherwise
      let password: string;
      let isTemporaryPassword = false;

      if (!userData.password && (role === "TEACHER" || role === "STUDENT" || role === "COLLEGE_ADMIN")) {
        password = generateDefaultPassword(5); // Generate 5-character default password
        isTemporaryPassword = true;
      } else {
        password = userData.password || userData.email; // Fallback to email if no password provided
        isTemporaryPassword = !userData.password;
      }

      console.log("Generated password:", password);

      // Create user
      const [user] = await db.insert(UsersTable)
        .values({
          name: userData.name,
          email: userData.email,
          password: await hash(password, 10),
          role: role,
          phone: userData.phone || null,
          defaultpassword: isTemporaryPassword ? password : null // Store default password if generated
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

      // Send welcome email with login credentials
      const emailSent = await sendWelcomeEmail(userData.name, userData.email, password, role);

      if (emailSent) {
        results.emailResults.sent++;
      } else {
        results.emailResults.failed++;
      }

      // Add successful user to results
      results.successful++;
      results.users.push({
        userId: user.id,
        email: userData.email,
        role: role,
        emailSent: emailSent,
        ...(teacherId && { teacherId }),
        ...(studentId && { studentId }),
        ...(isTemporaryPassword && { tempPassword: password })
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
    message: `Processed ${usersData.length} users. Created: ${results.successful}, Failed: ${results.failed}. Emails sent: ${results.emailResults.sent}, Email failures: ${results.emailResults.failed}`,
    results
  });
}