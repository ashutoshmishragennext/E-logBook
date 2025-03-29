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