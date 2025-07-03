import { sql } from "drizzle-orm";
import { connectDb } from "../db";

export async function checkHealth() {
  const db = await connectDb();
  await db.execute(sql`SELECT 1`);
}
