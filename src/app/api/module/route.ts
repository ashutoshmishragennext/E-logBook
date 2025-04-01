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
export async function POST(request: NextRequest) {
    try {
      // Parse the request body
      const body = await request.json();
      
      // Insert the new module record
      const newModule = await db.insert(ModuleTable).values(body).returning();
      
      // Return the newly created record
      return NextResponse.json(newModule[0], { status: 201 });
      
    } catch (error) {
      console.error("Error creating module:", error);
      return NextResponse.json({
        message: "Failed to create module",
        error,
        status: 500
      }, { status: 500 });
    }
  }