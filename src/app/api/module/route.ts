import { db } from "@/db";
import { ModuleTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req:NextRequest){
    const searchParams = req.nextUrl.searchParams;
    const subjectId = searchParams.get('subjectId');
    try {
        
        let module1= await db.select().from(ModuleTable)
                if(subjectId){
                     module1= await db.select().from(ModuleTable).where(eq(ModuleTable.subjectId,subjectId))
                }
        
        return NextResponse.json(module1)
        
    } catch (error) {
       return  NextResponse.json({
        message:error,
       })
    }
}