import type { Database } from "@api/db";

export type Context = {
  Variables: {
    db: Database;
    userId: string;
  };
};
