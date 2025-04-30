import { ilike } from "drizzle-orm"
import { db } from "@/db";
import { ModuleTable } from "@/db/schema";

export async function GET(req: { url: string | URL; }) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.toLowerCase() || "";

  const results = await db
    .select()
    .from(ModuleTable)
    .where(ilike(ModuleTable.name, `%${query}%`))
    .limit(10);

  return Response.json(results);
}
