// /api/courses/route.ts
/* eslint-disable @typescript-eslint/no-unused-vars */
import { db } from "@/db";
import { CourseTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const branchId = req.nextUrl.searchParams.get('branchId');
  const id = req.nextUrl.searchParams.get('id');

  try {
    if (id) {
      const course = await db.select().from(CourseTable).where(eq(CourseTable.id, id));
      return NextResponse.json(course[0]);
    }
    const data = branchId
      ? await db.select().from(CourseTable).where(eq(CourseTable.branchId, branchId))
      : await db.select().from(CourseTable);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch courses" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const courses = Array.isArray(body) ? body : [body];
    const result = [];

    for (const course of courses) {
      const inserted = await db.insert(CourseTable).values(course).returning();
      result.push(inserted[0]);
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to create course" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ message: "Missing ID" }, { status: 400 });
  try {
    const {  ...data } = await request.json();
    const updated = await db.update(CourseTable).set(data).where(eq(CourseTable.id, id)).returning();
    if (!updated.length) return NextResponse.json({ message: "Course not found" }, { status: 404 });

    return NextResponse.json(updated[0]);
  } catch (error) {
    return NextResponse.json({ message: "Failed to update course" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ message: "Missing ID" }, { status: 400 });

  try {
    const deleted = await db.delete(CourseTable).where(eq(CourseTable.id, id)).returning();
    return NextResponse.json(deleted[0]);
  } catch (error) {
    return NextResponse.json({ message: "Failed to delete course" }, { status: 500 });
  }
}
