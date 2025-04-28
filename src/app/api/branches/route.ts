import {db } from "@/db";
import { BranchTable } from "@/db/schema";
import { NextResponse } from "next/server";


export async function GET() {
  try {
    const branches = await db.select().from(BranchTable);
    return NextResponse.json(branches);
  } catch (error) {
    return NextResponse.json({
      message: error,
      status: 500,
    });
  }
}
export async function POST(request: Request) {
  const body = await request.json();
  try {
    const newBranch = await db.insert(BranchTable).values({
      ...body,
    }).returning();
    return NextResponse.json(newBranch[0], { status: 201 });
  } catch (error) {
    console.error("Error creating branch:", error);
    return NextResponse.json({
      message: "Failed to create branch",
      error,
      status: 500
    }, { status: 500 });
  }
}