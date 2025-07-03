import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const primaryPool = postgres(process.env.DATABASE_PRIMARY_URL!, {
  prepare: false,
});

export const primaryDb = drizzle(primaryPool, {
  schema,
  casing: "snake_case",
});

export const connectDb = async () => {
  return primaryDb;
};

export type Database = Awaited<ReturnType<typeof connectDb>>;

export type DatabaseWithPrimary = Database & {
  $primary?: Database;
  usePrimaryOnly?: () => Database;
};
