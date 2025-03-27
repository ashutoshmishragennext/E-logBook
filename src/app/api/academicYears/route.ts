import { db } from "@/db";
import { AcademicYearTable } from "@/db/schema";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req){
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