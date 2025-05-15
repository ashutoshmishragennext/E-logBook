
// /api/colleges/route.ts
/* eslint-disable @typescript-eslint/no-unused-vars */
import { db } from "@/db";
import { BranchTable, CollegeTable, CourseTable } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// GET: Get all or by userId
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  const collegeAdminId = req.nextUrl.searchParams.get('collegeAdminId');
  const collegeId = req.nextUrl.searchParams.get('collegeId');

  try {
    if (collegeAdminId) {
      const data = await db.select().from(CollegeTable).where(eq(CollegeTable.collegeAdminId, collegeAdminId));
      return NextResponse.json(data);
    }
    if (collegeId) {
      const data = await db.select().from(CollegeTable).where(eq(CollegeTable.id, collegeId));
      return NextResponse.json(data[0]);
    }
    if(userId){
      const data = await db.select().from(CollegeTable).where(eq(CollegeTable.createdBy, userId));
      return NextResponse.json(data[0]);
    }
    const data = await db.select().from(CollegeTable);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch colleges" }, { status: 500 });
  }
}

// POST: Create a college
export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.createdBy) {
      return NextResponse.json({ message: "Missing userId" }, { status: 400 });
    }

    const newCollege = await db.insert(CollegeTable).values(body).returning();
    return NextResponse.json(newCollege[0], { status: 201 });
  } catch (error) {
    console.error("Error creating college:", error);
    return NextResponse.json({ message: "Failed to create college", error: String(error) }, { status: 500 });
  }

}

// PUT: Update college by ID
export async function PUT(request: Request) {
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ message: "Missing ID" }, { status: 400 });
  try {
    const { ...data } = await request.json();
    const updated = await db.update(CollegeTable).set(data).where(eq(CollegeTable.id, id)).returning();
    if (!updated.length) return NextResponse.json({ message: "College not found" }, { status: 404 });

    return NextResponse.json(updated[0]);
  } catch (error) {
    return NextResponse.json({ message: "Failed to update college" }, { status: 500 });
  }
}

// DELETE: Delete college by ID
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ message: "Missing ID" }, { status: 400 });
  }

  try {
    // Step 1: Get all branches for the college
    const branches = await db
      .select({ id: BranchTable.id })
      .from(BranchTable)
      .where(eq(BranchTable.collegeId, id));

    const branchIds = branches.map((b) => b.id);

    if (branchIds.length > 0) {
      // Step 2: Delete courses associated with these branches
      await db
        .delete(CourseTable)
        .where(inArray(CourseTable.branchId, branchIds));

      // Step 3: Delete branches
      await db
        .delete(BranchTable)
        .where(inArray(BranchTable.id, branchIds));
    }

    // Step 4: Delete college
    const deleted = await db
      .delete(CollegeTable)
      .where(eq(CollegeTable.id, id))
      .returning();

    return NextResponse.json(deleted[0]);
  } catch (error) {
    console.error("Failed to delete college:", error);
    return NextResponse.json(
      { message: "Failed to delete college" },
      { status: 500 }
    );
  }
}
