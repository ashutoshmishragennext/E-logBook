import { db } from "@/db";
import { PhaseTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// GET: Fetch all or filtered by academicYearId
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const academicYearId = searchParams.get("academicYears");
  const collegeId = searchParams.get("collegeId");
  const id = searchParams.get("id");

  try {
    // If both academicYearId and collegeId are present, filter
    if (id) {
      const phase = await db
        .select()
        .from(PhaseTable)
        .where(eq(PhaseTable.id, id));
      return NextResponse.json(phase[0]);
    }
    if (academicYearId && collegeId) {
      const phases = await db
        .select()
        .from(PhaseTable)
        .where(
          and(
            eq(PhaseTable.academicYearId, academicYearId),
            eq(PhaseTable.collegeId, collegeId)
          )
        );

      return NextResponse.json(phases);
    }
    if (academicYearId) {
      const phases = await db.select().from(PhaseTable).where(
        eq(PhaseTable.academicYearId, academicYearId) 
      );
      return NextResponse.json(phases);
    }
    if (collegeId) {
      const phases = await db.select().from(PhaseTable).where(
        eq(PhaseTable.collegeId, collegeId) 
      );
      return NextResponse.json(phases);
    }

    // Return empty if required query params are not provided
    return NextResponse.json([], { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching phases", error },
      { status: 500 }
    );
  }
}


// POST: Create new phase
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const newPhase = await db.insert(PhaseTable).values(body).returning();

    return NextResponse.json(newPhase[0], { status: 201 });
  } catch (error) {
    console.error("Error creating phase:", error);
    return NextResponse.json(
      { message: "Failed to create phase", error },
      { status: 500 }
    );
  }
}

// PUT: Update a phase by id (requires id in body)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { message: "Missing phase ID" },
        { status: 400 }
      );
    }

    const updated = await db
      .update(PhaseTable)
      .set(updateData)
      .where(eq(PhaseTable.id, id))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (error) {
    return NextResponse.json(
      { message: "Error updating phase", error },
      { status: 500 }
    );
  }
}

// DELETE: Delete a phase by ID passed as a search param (?id=...)
export async function DELETE(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { message: "Missing phase ID" },
      { status: 400 }
    );
  }

  try {
    const deleted = await db
      .delete(PhaseTable)
      .where(eq(PhaseTable.id, id))
      .returning();

    return NextResponse.json(
      { message: "Phase deleted", deleted: deleted[0] }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error deleting phase", error },
      { status: 500 }
    );
  }
}
