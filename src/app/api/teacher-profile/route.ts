// // pages/api/teacher-profile.ts
// import { NextRequest, NextResponse } from "next/server";
// import { db } from "@/db";
// import { TeacherProfileTable, UsersTable } from "@/db/schema";
// import { eq } from "drizzle-orm";

// export async function GET(req: NextRequest) {
//   try {

//     const searchParams = req.nextUrl.searchParams;
//     const ID = searchParams.get("id");
//     let teacher = await db
//     .select()
//     .from(TeacherProfileTable)

//     if(ID){
//       teacher = await db
//       .select()
//       .from(TeacherProfileTable)
//       .where(eq(TeacherProfileTable.userId, ID));

//     }
     
//     return NextResponse.json(teacher);
//   } catch (error) {
//     console.log(error);
//     return NextResponse.json(
//       { message: "Error fetching teacher profile" },
//       { status: 500 }
//     );
//   }
// }

// export async function POST(req: NextRequest) {
//   try {
//     const searchParams = req.nextUrl.searchParams;
//     const userId = searchParams.get("id");

//     if (!userId) {
//       return NextResponse.json(
//         { message: "User ID is required" },
//         { status: 400 }
//       );
//     }

//     // Parse the request body
//     const body = await req.json();

//     // Check if user exists
//     const existingUser = await db
//       .select()
//       .from(UsersTable)
//       .where(eq(UsersTable.id, userId))
//       .limit(1);

//     if (existingUser.length === 0) {
//       return NextResponse.json(
//         { message: "User not found" },
//         { status: 404 }
//       );
//     }

//     // Check if profile already exists
//     const existingProfile = await db
//       .select()
//       .from(TeacherProfileTable)
//       .where(eq(TeacherProfileTable.userId, userId))
//       .limit(1);

//     if (existingProfile.length > 0) {
//       return NextResponse.json(
//         { message: "Teacher profile already exists" },
//         { status: 400 }
//       );
//     }

//     // Create new teacher profile
//     const newProfile = await db
//       .insert(TeacherProfileTable)
//       .values({
//         ...body,
//         userId,
//         createdAt: new Date(),
//         updatedAt: new Date()
//       })
//       .returning();

//     return NextResponse.json(newProfile[0], { status: 201 });
//   } catch (error) {
//     console.error("Teacher Profile Creation Error:", error);
//     return NextResponse.json(
//       { 
//         message: "Error creating teacher profile",
//         error: error instanceof Error ? error.message : "Unknown error"
//       },
//       { status: 500 }
//     );
//   }
// }

// export async function PUT(req: NextRequest) {
//   try {
//     const searchParams = req.nextUrl.searchParams;
//     const userId = searchParams.get("id");

//     if (!userId) {
//       return NextResponse.json(
//         { message: "User ID is required" },
//         { status: 400 }
//       );
//     }

//     // Parse the request body
//     const body = await req.json();

//     // Check if profile exists
//     const existingProfile = await db
//       .select()
//       .from(TeacherProfileTable)
//       .where(eq(TeacherProfileTable.userId, userId))
//       .limit(1);

//     if (existingProfile.length === 0) {
//       return NextResponse.json(
//         { message: "Teacher profile not found" },
//         { status: 404 }
//       );
//     }

//     // Update teacher profile
//     const updatedProfile = await db
//       .update(TeacherProfileTable)
//       .set({
//         ...body,
//         updatedAt: new Date()
//       })
//       .where(eq(TeacherProfileTable.userId, userId))
//       .returning();

//     return NextResponse.json(updatedProfile[0], { status: 200 });
//   } catch (error) {
//     console.error("Teacher Profile Update Error:", error);
//     return NextResponse.json(
//       { 
//         message: "Error updating teacher profile",
//         error: error instanceof Error ? error.message : "Unknown error"
//       },
//       { status: 500 }
//     );
//   }
// }


import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { TeacherProfileTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }
    
    const profile = await db
      .select()
      .from(TeacherProfileTable)
      .where(eq(TeacherProfileTable.userId, id));
    
    return NextResponse.json(profile);
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
