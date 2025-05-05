import { db } from "@/db";
import { AcademicYearTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse  , NextRequest} from "next/server";


export async function GET(){
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

export async function PUT(request: NextRequest ) {
 const id = new URL(request.url).searchParams.get('id');
 if (!id) {
   return NextResponse.json({ message: 'ID is required' }, { status: 400 });
 }

  try {
    const body = await request.json()

    const updatedYear = await db
      .update(AcademicYearTable)
      .set({
        ...body,
        endDate: new Date(body.endDate),
      })
      .where(eq(AcademicYearTable.id, id!))
      .returning()

    if (!updatedYear.length) {
      return NextResponse.json({ message: 'Academic year not found' }, { status: 404 })
    }

    return NextResponse.json(updatedYear[0])
  } catch (error) {
    console.error('Error updating academic year:', error)
    return NextResponse.json({ message: 'Failed to update', error }, { status: 500 })
  }
}
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const newAcademicYear = await db.insert(AcademicYearTable).values({
      ...body,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
    }).returning();

    return NextResponse.json(newAcademicYear[0], { status: 201 });
  } catch (error) {
    console.error("Error creating academic year:", error);
    return NextResponse.json({
      message: "Failed to create academic year",
      error,
      status: 500
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const id = new URL(request.url).searchParams.get('id')
  
  if (!id) {
    return NextResponse.json({ message: 'ID is required' }, { status: 400 })
  }

  try {
    const deletedYear = await db
      .delete(AcademicYearTable)
      .where(eq(AcademicYearTable.id, id))
      .returning()

    if (!deletedYear.length) {
      return NextResponse.json({ message: 'Academic year not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Academic year deleted successfully' })
  } catch (error) {
    console.error('Error deleting academic year:', error)
    return NextResponse.json({ message: 'Failed to delete', error }, { status: 500 })
  }
}

