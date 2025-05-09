import { NextResponse } from 'next/server';
import { db } from '@/db'; 
import { StudentSubjectTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  const body = await req.json();
  const data = await db.insert(StudentSubjectTable).values(body).returning();
  return NextResponse.json(data[0]);
}

export async function GET() {
  const data = await db.select().from(StudentSubjectTable);
  return NextResponse.json(data);
}



export async function PUT(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  const body = await req.json();
  await db.update(StudentSubjectTable)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(StudentSubjectTable.id,id));
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

