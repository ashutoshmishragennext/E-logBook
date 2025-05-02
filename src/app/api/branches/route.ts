// /api/branches/route.ts
import { db } from "@/db";
import { BranchTable, CourseTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const collegeId = req.nextUrl.searchParams.get('collegeId');

  try {
    const data = collegeId
      ? await db.select().from(BranchTable).where(eq(BranchTable.collegeId, collegeId))
      : await db.select().from(BranchTable);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch branches" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const branches = Array.isArray(body) ? body : [body];
    const result = [];

    for (const branch of branches) {
      const inserted = await db.insert(BranchTable).values(branch).returning();
      result.push(inserted[0]);
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to create branch" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ message: "Missing ID" }, { status: 400 });
  try {
    const { ...data } = await request.json();

    const updated = await db.update(BranchTable).set(data).where(eq(BranchTable.id, id)).returning();
    if (!updated.length) return NextResponse.json({ message: "Branch not found" }, { status: 404 });

    return NextResponse.json(updated[0]);
  } catch (error) {
    return NextResponse.json({ message: "Failed to update branch" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ message: "Missing ID" }, { status: 400 });

  try {
    // Delete related courses first
    await db.delete(CourseTable).where(eq(CourseTable.branchId, id));

    // Now delete the branch
    const deleted = await db.delete(BranchTable).where(eq(BranchTable.id, id)).returning();

    return NextResponse.json(deleted[0]);
  } catch (error) {
    console.error("DELETE /api/branches error:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to delete branch" },
      { status: 500 }
    );
  }
}
