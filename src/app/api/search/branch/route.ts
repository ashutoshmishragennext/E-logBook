import {db} from "@/db";
import { BranchTable } from "@/db/schema";
import { ilike } from "drizzle-orm"; // ✅ Add this import


export async function GET(req: { url: string | URL }) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.toLowerCase() || "";

  const results = await db
    .select()
    .from(BranchTable)
    .where(ilike(BranchTable.name, `%${query}%`)) // ✅ Use `ilike` here
    .limit(10);

  return Response.json(results);
}