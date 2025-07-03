import { getAuth } from "@hono/clerk-auth";
import { createClient } from "@api/services/supabase";
import { connectDb } from "@api/db";

import type { SessionAuthObject } from "@clerk/backend";
import type { Database } from "@api/db";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Context as HonoContext } from "hono";

type TRPCContext = {
  auth: SessionAuthObject;
  supabase: SupabaseClient;
  db: Database;
};

export const createContext = async (
  _: unknown,
  c: HonoContext
): Promise<TRPCContext> => {
  const supabase = await createClient();
  const db = await connectDb();
  const auth = getAuth(c) as SessionAuthObject;

  return { auth, supabase, db };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
