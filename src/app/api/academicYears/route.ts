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
     // Parse the request body
     const body = await request.json();
     
     // Insert the new academic year record
     const newAcademicYear = await db.insert(AcademicYearTable).values(body).returning();
     
     // Return the newly created record
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