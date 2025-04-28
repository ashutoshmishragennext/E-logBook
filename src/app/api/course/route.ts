import {db } from "@/db";
import { CourseTable } from "@/db/schema";
import { NextResponse } from "next/server";


export async function GET() {
  try {
    const courses = await db.select().from(CourseTable);
    return NextResponse.json(courses);
  } catch (error) {
    return NextResponse.json({
      message: error,
      status: 500,
    });
  }
}
export async function POST (request: Request){
  const body = await request.json()
  try {
    const newCourse = await db.insert(CourseTable).values({
      ...body,
    }).returning();
    return NextResponse.json(newCourse[0], { status: 201 });
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json({
      message: "Failed to create course",
      error,
      status: 500
    }, { status: 500 });
  }

}