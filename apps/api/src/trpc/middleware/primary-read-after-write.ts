import type { Database, DatabaseWithPrimary } from "@api/db";
import { logger } from "@api/utils/logger";

// Database middleware that handles replication lag based on mutation operations
// For mutations: always use primary DB
// For queries: use primary DB if the team recently performed a mutation
export const withPrimaryReadAfterWrite = async <TReturn>(opts: {
  ctx: {
    db: Database;
  };
  type: "query" | "mutation" | "subscription";
  next: (opts: {
    ctx: {
      db: Database;
    };
  }) => Promise<TReturn>;
}) => {
  const { ctx, type, next } = opts;

  // When no team ID is present, always use primary DB
  const dbWithPrimary = ctx.db as DatabaseWithPrimary;
  if (dbWithPrimary.usePrimaryOnly) {
    ctx.db = dbWithPrimary.usePrimaryOnly();
  }
  // If usePrimaryOnly doesn't exist, we're already using the primary DB

  const start = performance.now();
  const result = await next({ ctx });
  const duration = performance.now() - start;

  if (duration > 500) {
    logger.warn({
      msg: "Slow DB operation detected",
      operationType: type,
      durationMs: Math.round(duration),
    });
  }

  return result;
};
