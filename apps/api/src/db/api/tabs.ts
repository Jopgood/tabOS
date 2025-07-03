import type { Database } from "@api/db";

export async function getTabs(db: Database, userId: string) {
  // Execute the query
  const data = await db.query.tabs.findMany({
    columns: {
      id: true,
      name: true,
      insertedAt: true,
      updatedAt: true,
      type: true,
    },
  });

  return data;
}
