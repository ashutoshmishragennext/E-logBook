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
    
    const query = db
      .select()
      .from(BranchTable)
      .where(
        and(
          eq(BranchTable.collegeId, collegeId),
          search
            ? or(
                like(BranchTable.name, `%${search}%`),
                like(BranchTable.code, `%${search}%`)
              )
            : undefined
        )
      )
      .limit(10);
    
    const branches = await query;
    return NextResponse.json(branches);
  } catch (error) {
    console.error("Error fetching branches:", error);
    return NextResponse.json(
      { error: "Failed to fetch branches" },
      { status: 500 }
    );
  }
}
