import { db } from "@/db";
import { CollegeTable } from "@/db/schema";
import { NextResponse } from "next/server";


export async function GET() {
  try {
    const colleges = await db.select().from(CollegeTable);
    return NextResponse.json(colleges);
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
    const newCollege = await db.insert(CollegeTable).values({
      ...body,
    }).returning();
    return NextResponse.json(newCollege[0], { status: 201 });
  } catch (error) {
    console.error("Error creating college:", error);
    return NextResponse.json({
      message: "Failed to create college",
      error,
      status: 500
    }, { status: 500 });
  }

}