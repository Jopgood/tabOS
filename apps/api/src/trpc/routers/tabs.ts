import { getTabs } from "@api/db/api/tabs";
import { router, protectedProcedure } from "@api/trpc/alt";

export const tabsRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.auth.userId;
    return getTabs(ctx.db, userId);
  }),
});
