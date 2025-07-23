import { connectDb } from "@api/db";
import { getAuth } from "@hono/clerk-auth";

import type { Database } from "@api/db";
import type { SessionAuthObject } from "@clerk/backend";
import type { Context as HonoContext } from "hono";

type TRPCContext = {
  auth: SessionAuthObject;
  db: Database;
};

export const createContext = async (
  _: unknown,
  c: HonoContext
): Promise<TRPCContext> => {
  const db = await connectDb();
  const auth = getAuth(c) as SessionAuthObject;

  return { auth, db };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
