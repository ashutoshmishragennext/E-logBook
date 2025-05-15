import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { StudentSubjectTable } from '@/db/schema';
import { eq } from 'drizzle-orm';



export async function POST(req: Request) {
  const body = await req.json();
  const data = await db.insert(StudentSubjectTable).values(body).returning();
  return NextResponse.json(data[0]);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const teacherId = searchParams.get('teacherId');
  const studentId = searchParams.get('studentId');
  if (!id && !teacherId && !studentId) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  if (teacherId) {
    const data = await db.select().from(StudentSubjectTable).where(eq(StudentSubjectTable.teacherId, teacherId));
    return NextResponse.json(data);
  }
  if (studentId) {
    const data = await db.select().from(StudentSubjectTable).where(eq(StudentSubjectTable.studentId, studentId));
    return NextResponse.json(data);
  }
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  const data = await db.select().from(StudentSubjectTable).where(eq(StudentSubjectTable.id, id));
  return NextResponse.json(data[0]);
}



export async function PUT(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const body = await req.json();

  // Parse approvedAt if present and not null
  const approvedAt = body.approvedAt ? new Date(body.approvedAt) : null;

  await db.update(StudentSubjectTable)
    .set({
      verificationStatus: body.verificationStatus,
      hasLogbookAccess: body.hasLogbookAccess,
      approvedAt,
      updatedAt: new Date(), // always set this to current time
    })
    .where(eq(StudentSubjectTable.id, id));

  return NextResponse.json({ success: true });
}



export async function DELETE(_: Request) {
  const { searchParams } = new URL(_.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  await db.delete(StudentSubjectTable).where(eq(StudentSubjectTable.id, id));
  return NextResponse.json({ success: true });
}

