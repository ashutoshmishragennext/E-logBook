import { db } from "@/db";
import { ModuleTable, PhaseTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req:NextRequest){
    const searchParams = req.nextUrl.searchParams;
    const subjectId = searchParams.get('subjectId');
    try {
        
        let module= await db.select().from(ModuleTable)
                if(subjectId){
                     module= await db.select().from(ModuleTable).where(eq(ModuleTable.subjectId,subjectId))
                }
        
        return NextResponse.json(module)
        
    } catch (error) {
       return  NextResponse.json({
        message:error,
       })
    }
}