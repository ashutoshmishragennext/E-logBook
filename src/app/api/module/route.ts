import { db } from "@/db";
import { ModuleTable, PhaseTable } from "@/db/schema";
import { NextResponse } from "next/server";


export async function GET(){

    try {
        const module= await db.select().from(ModuleTable)
        return NextResponse.json(module)
        
    } catch (error) {
       return  NextResponse.json({
        message:error,
       })
    }
}