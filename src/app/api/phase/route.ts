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