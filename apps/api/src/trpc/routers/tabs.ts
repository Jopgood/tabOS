import { tabsApi } from "@api/db/api/tabs";
// apps/api/src/trpc/routers/tabs.ts
import { protectedProcedure, router } from "@api/trpc/alt";
import { z } from "zod";

// Input validation schemas
const createTabSchema = z.object({
  title: z.string().min(1),
  afterId: z.string().uuid().optional(),
  content: z.any().optional(),
});

const updateTabSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).optional(),
  content: z.any().optional(),
});

const updatePositionSchema = z.object({
  id: z.string().uuid(),
  afterId: z.string().uuid().optional(),
});

const idSchema = z.object({
  id: z.string().uuid(),
});

// tRPC router - thin wrapper around API functions
export const tabsRouter = router({
  // List all tabs for the authenticated user
  list: protectedProcedure.query(async ({ ctx }) => {
    return tabsApi.list(ctx.db, ctx.auth.userId);
  }),

  // Get a single tab by ID
  getById: protectedProcedure.input(idSchema).query(async ({ ctx, input }) => {
    const tab = await tabsApi.getById(ctx.db, input.id, ctx.auth.userId);
    if (!tab) {
      throw new Error("Tab not found or not owned by user");
    }
    return tab;
  }),

  // Create a new tab
  create: protectedProcedure
    .input(createTabSchema)
    .mutation(async ({ ctx, input }) => {
      return tabsApi.create(ctx.db, {
        ...input,
        userId: ctx.auth.userId,
      });
    }),

  // Update an existing tab
  update: protectedProcedure
    .input(updateTabSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      return tabsApi.update(ctx.db, id, ctx.auth.userId, updateData);
    }),

  // Update tab position in the linked list
  updatePosition: protectedProcedure
    .input(updatePositionSchema)
    .mutation(async ({ ctx, input }) => {
      return tabsApi.updatePosition(
        ctx.db,
        input.id,
        ctx.auth.userId,
        input.afterId,
      );
    }),

  // Delete a tab
  delete: protectedProcedure
    .input(idSchema)
    .mutation(async ({ ctx, input }) => {
      return tabsApi.delete(ctx.db, input.id, ctx.auth.userId);
    }),

  // Set a tab as active (clears other active tabs)
  setActive: protectedProcedure
    .input(idSchema)
    .mutation(async ({ ctx, input }) => {
      return tabsApi.setActive(ctx.db, input.id, ctx.auth.userId);
    }),

  // Get the currently active tab
  getActive: protectedProcedure.query(async ({ ctx }) => {
    return tabsApi.getActive(ctx.db, ctx.auth.userId);
  }),

  // Clear active tab (set none as active)
  clearActive: protectedProcedure.mutation(async ({ ctx }) => {
    await tabsApi.clearActive(ctx.db, ctx.auth.userId);
    return { success: true };
  }),
});
