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

 export async function POST(request: NextRequest) {
    try {
      // Parse the request body
      const body = await request.json();
      
      // Insert the new subject record
      const newSubject = await db.insert(SubjectTable).values(body).returning();
      
      // Return the newly created record
      return NextResponse.json(newSubject[0], { status: 201 });
      
    } catch (error) {
      console.error("Error creating subject:", error);
      return NextResponse.json({
        message: "Failed to create subject",
        error,
        status: 500
      }, { status: 500 });
    }
  }


export async function PUT(request: Request) {
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ message: "Missing ID" }, { status: 400 });
  try {
    const {...data } = await request.json();
    const updated = await db.update(SubjectTable).set(data).where(eq(SubjectTable.id, id)).returning();
    if (!updated.length) return NextResponse.json({ message: "Subject not found" }, { status: 404 });

    return NextResponse.json(updated[0]);
  } catch (error) {
    return NextResponse.json({ message: "Failed to update subject" }, { status: 500 });
  }
}


export async function DELETE(request: Request) {
  const id = new URL(request.url).searchParams.get('id');
  if (!id) {
    return NextResponse.json({ message: "Missing ID" }, { status: 400 });
  }

  try {
    const deleted = await db
      .delete(SubjectTable)
      .where(eq(SubjectTable.id, id))
      .returning();

    if (!deleted.length) {
      return NextResponse.json({ message: "Subject not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Subject deleted successfully", deleted: deleted[0] }, { status: 200 });
  } catch (error) {
    console.error("Error deleting subject:", error);
    return NextResponse.json({ message: "Failed to delete subject", error }, { status: 500 });
  }
}
