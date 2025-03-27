import { db } from "@/db";
import { SubjectTable } from "@/db/schema";
import { NextResponse } from "next/server";

 export async function GET(){
    try {
        const subject = await db.select().from(SubjectTable)
        return NextResponse.json(subject)
    } catch (error) {
        return NextResponse.json({
            message:error,
        })
    }
 }