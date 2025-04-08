import { db } from "@/db";
import { AcademicYearTable } from "@/db/schema";
import { NextResponse } from "next/server";


export async function GET(){
 try {
    const academicYear=await db.select().from(AcademicYearTable)
    return NextResponse.json(academicYear)
    
 } catch (error) {
    return NextResponse.json({
        message:error,
        status:500
    })
 }
}
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const newAcademicYear = await db.insert(AcademicYearTable).values({
      ...body,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
    }).returning();

    return NextResponse.json(newAcademicYear[0], { status: 201 });
  } catch (error) {
    console.error("Error creating academic year:", error);
    return NextResponse.json({
      message: "Failed to create academic year",
      error,
      status: 500
    }, { status: 500 });
  }
}
