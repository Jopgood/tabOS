// apps/backend/routers/tabs.ts
import { z } from "zod";
import { router, protectedProcedure } from "../alt";
import { tabsTable } from "@api/db/schema";
import { eq, and, asc } from "drizzle-orm";

// Helper function for backend position generation
function generateEndPosition(tabs: any[]) {
  if (tabs.length === 0) return 1000;

  const sortedTabs = tabs.sort((a, b) => a.position - b.position);
  const lastPosition = sortedTabs[sortedTabs.length - 1].position;

  return lastPosition + 1000;
}

export const tabsRouter = router({
  getTabs: protectedProcedure.query(async ({ ctx }) => {
    const userTabs = await ctx.db
      .select()
      .from(tabsTable)
      .where(eq(tabsTable.userId, ctx.auth.userId))
      .orderBy(asc(tabsTable.position)); // CHANGED: numeric ordering

    return userTabs;
  }),

  addTab: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        type: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get current user tabs to calculate position
      const userTabs = await ctx.db
        .select()
        .from(tabsTable)
        .where(eq(tabsTable.userId, ctx.auth.userId));

      // Generate position for new tab (always at the end)
      const newPosition = generateEndPosition(userTabs);

      const newTab = await ctx.db
        .insert(tabsTable)
        .values({
          userId: ctx.auth.userId,
          title: input.title,
          type: input.type,
          position: newPosition,
        })
        .returning();

      return newTab;
    }),

  updateTabPosition: protectedProcedure
    .input(
      z.object({
        tabId: z.string(),
        newPosition: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updatedTab = await ctx.db
        .update(tabsTable)
        .set({ position: input.newPosition })
        .where(
          and(
            eq(tabsTable.id, input.tabId),
            eq(tabsTable.userId, ctx.auth.userId)
          )
        )
        .returning();

      return updatedTab;
    }),

  deleteTab: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(tabsTable)
        .where(
          and(eq(tabsTable.id, input), eq(tabsTable.userId, ctx.auth.userId))
        );

      return { success: true };
    }),
});
