import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { BranchTable } from "@/db/schema";
import { eq, like, or, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const collegeId = searchParams.get("collegeId");
    const search = searchParams.get("search") || "";
    
    if (!collegeId) {
      return NextResponse.json(
        { error: "College ID is required" },
        { status: 400 }
      );
    }
    
    let query = db.select().from(BranchTable).where(eq(BranchTable.collegeId, collegeId));
    
    if (search) {
      query = query.where(
        and(
          eq(BranchTable.collegeId, collegeId),
          or(
            like(BranchTable.name, `%${search}%`),
            like(BranchTable.code, `%${search}%`)
          )
        )
      );
    }
    
    const branches = await query.limit(10);
    return NextResponse.json(branches);
  } catch (error) {
    console.error("Error fetching branches:", error);
    return NextResponse.json(
      { error: "Failed to fetch branches" },
      { status: 500 }
    );
  }
}
