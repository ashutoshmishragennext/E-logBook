import { db } from "@/db";
import { PhaseTable } from "@/db/schema";
import { NextResponse } from "next/server";


export async function GET(){

    try {
        const phase= await db.select().from(PhaseTable)
        return NextResponse.json(phase)
        
    } catch (error) {
       return  NextResponse.json({
        message:error,
       })
    }
}