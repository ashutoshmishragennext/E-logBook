import { db } from "@/db";
import { SubjectTable } from "@/db/schema";
import { ilike } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: { url: string | URL; }) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";
  
  if (!query) {
    return Response.json([]);
  }

  const results = await db
    .select()
    .from(SubjectTable)
    .where(ilike(SubjectTable.name, `%${query}%`))
    .limit(10);

  return Response.json(results);
}

export async function POST(req: { json: () => any; }) {
  const body = await req.json();
  const { name } = body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return NextResponse.json(
      { success: false, message: "Invalid subject name" },
      { status: 400 }
    );
  }

  try {
    // Generate a default code from the name (first 3 letters uppercase)
    const defaultCode = name.substring(0, 3).toUpperCase();
    
    // Insert the new subject with approved=false
    await db.insert(SubjectTable).values({
      name: name.trim(),
      code: defaultCode,
      approved: false,
    });

    return NextResponse.json({ 
      success: true, 
      message: "Request sent to admin for approval" 
    });
  } catch (error) {
    console.error("Error adding subject request:", error);
    return NextResponse.json(
      { success: false, message: "Failed to submit request" },
      { status: 500 }
    );
  }
}