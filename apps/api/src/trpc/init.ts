import { connectDb } from "@api/db";
import type { Database } from "@api/db";
import { createClient } from "@api/services/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";
import { initTRPC } from "@trpc/server";
import type { Context } from "hono";
import superjson from "superjson";
import { withPrimaryReadAfterWrite } from "./middleware/primary-read-after-write";

type TRPCContext = {
  supabase: SupabaseClient;
  db: Database;
};

export const createTRPCContext = async (
  _: unknown,
  c: Context,
): Promise<TRPCContext> => {
  const supabase = await createClient();
  const db = await connectDb();

  return {
    supabase,
    db,
  };
};

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;

const withPrimaryDbMiddleware = t.middleware(async (opts) => {
  return withPrimaryReadAfterWrite({
    ctx: opts.ctx,
    type: opts.type,
    next: opts.next,
  });
});

export const publicProcedure = t.procedure.use(withPrimaryDbMiddleware);

export const protectedProcedure = t.procedure
  .use(withPrimaryDbMiddleware)
  .use(async (opts) => {
    return opts.next({
      ctx: {},
    });
  });
