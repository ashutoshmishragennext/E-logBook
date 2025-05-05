/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { CollegeTable } from "@/db/schema";
import { eq, like, or } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const whereClause = search
      ? or(
          like(CollegeTable.name, `%${search}%`),
          like(CollegeTable.code, `%${search}%`)
        )
      : undefined;

    const colleges = await db
      .select()
      .from(CollegeTable)
      .where(whereClause)
      .limit(10);

    return NextResponse.json(colleges);
  } catch (error) {
    console.error("Error fetching colleges:", error);
    return NextResponse.json(
      { error: "Failed to fetch colleges" },
      { status: 500 }
    );
  }
}