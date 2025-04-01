import { db } from "@/db";
import { SubjectTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

 export async function GET(req : NextRequest){
    try {
        const searchParams = req.nextUrl.searchParams;
        const PhaseId = searchParams.get('PhaseId');
        let subject = await db.select().from(SubjectTable)
        if(PhaseId){
             subject= await db.select().from(SubjectTable).where(eq(SubjectTable.phaseId,PhaseId))
        }
        return NextResponse.json(subject)
    } catch (error) {
        return NextResponse.json({
            message:error,
        })
    }
 }

 export async function POST(request: NextRequest) {
    try {
      // Parse the request body
      const body = await request.json();
      
      // Insert the new subject record
      const newSubject = await db.insert(SubjectTable).values(body).returning();
      
      // Return the newly created record
      return NextResponse.json(newSubject[0], { status: 201 });
      
    } catch (error) {
      console.error("Error creating subject:", error);
      return NextResponse.json({
        message: "Failed to create subject",
        error,
        status: 500
      }, { status: 500 });
    }
  }