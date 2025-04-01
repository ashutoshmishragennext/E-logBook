import { db } from "@/db";
import { PhaseTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req :NextRequest){

    const searchParams = req.nextUrl.searchParams;
    const Ay = searchParams.get('academicYears');

    try {
        let phase= await db.select().from(PhaseTable)

        if(Ay){
            phase= await db.select().from(PhaseTable).where(eq(PhaseTable.academicYearId,Ay))
        }
        return NextResponse.json(phase)
        
    } catch (error) {
       return  NextResponse.json({
        message:error,
       })
    }
}
export async function POST(request: NextRequest) {
    try {
      // Parse the request body
      const body = await request.json();
      
      // Insert the new phase record
      const newPhase = await db.insert(PhaseTable).values(body).returning();
      
      // Return the newly created record
      return NextResponse.json(newPhase[0], { status: 201 });
      
    } catch (error) {
      console.error("Error creating phase:", error);
      return NextResponse.json({
        message: "Failed to create phase",
        error,
        status: 500
      }, { status: 500 });
    }
  }