import type { Database } from "@api/db";
import { and, eq } from "drizzle-orm";
import { type NewTab, type Tab, tabs } from "../schema";

// Input types for API functions
export interface CreateTabInput {
  userId: string;
  title: string;
  type?: string;
  content?: any;
  afterId?: string;
}

export interface UpdateTabInput {
  title?: string;
  content?: any;
  afterId?: string;
  isActive?: boolean;
}

// Helper function to detect cycles in tab positioning
async function wouldCreateCycle(
  db: Database,
  movingTabId: string,
  afterTabId: string,
  userId: string
): Promise<boolean> {
  // Get all user's tabs to build the chain
  const userTabs = await db
    .select({ id: tabs.id, afterId: tabs.afterId })
    .from(tabs)
    .where(eq(tabs.userId, userId));

  const tabMap = new Map(userTabs.map((t) => [t.id, t.afterId]));

  // Walk the chain from afterTabId to see if we reach movingTabId
  let current: string | null | undefined = afterTabId;
  const visited = new Set();

  while (current && !visited.has(current)) {
    if (current === movingTabId) {
      return true; // Cycle detected
    }
    visited.add(current);
    current = tabMap.get(current);
  }

  return false;
}

// Core API functions - transport agnostic
export const tabsApi = {
  // List all tabs for a user
  list: async (db: Database, userId: string): Promise<Tab[]> => {
    return await db
      .select()
      .from(tabs)
      .where(eq(tabs.userId, userId))
      .orderBy(tabs.createdAt);
  },

  // Get a single tab by ID
  getById: async (
    db: Database,
    id: string,
    userId: string
  ): Promise<Tab | null> => {
    const [tab] = await db
      .select()
      .from(tabs)
      .where(and(eq(tabs.id, id), eq(tabs.userId, userId)))
      .limit(1);

    return tab || null;
  },

  // Create a new tab
  create: async (db: Database, input: CreateTabInput): Promise<Tab> => {
    // Validate afterId belongs to user if provided
    if (input.afterId) {
      const afterTab = await db
        .select({ id: tabs.id })
        .from(tabs)
        .where(and(eq(tabs.id, input.afterId), eq(tabs.userId, input.userId)))
        .limit(1);

      if (afterTab.length === 0) {
        throw new Error("Invalid afterId - tab not found or not owned by user");
      }
    }

    const [newTab] = await db
      .insert(tabs)
      .values({
        userId: input.userId,
        title: input.title,
        type: input.type,
        afterId: input.afterId,
        content: input.content,
        isActive: false, // New tabs are not active by default
        updatedAt: new Date(),
      })
      .returning();

    if (!newTab) {
      throw new Error("Failed to create tab");
    }

    return newTab;
  },

  // Update an existing tab
  update: async (
    db: Database,
    id: string,
    userId: string,
    input: UpdateTabInput
  ): Promise<Tab> => {
    const updateData: Partial<NewTab> = {
      updatedAt: new Date(),
    };

    if (input.title !== undefined) updateData.title = input.title;
    if (input.content !== undefined) updateData.content = input.content;
    if (input.isActive !== undefined) updateData.isActive = input.isActive;

    const [updatedTab] = await db
      .update(tabs)
      .set(updateData)
      .where(and(eq(tabs.id, id), eq(tabs.userId, userId)))
      .returning();

    if (!updatedTab) {
      throw new Error("Tab not found or not owned by user");
    }

    return updatedTab;
  },

  // Update tab position in the linked list
  updatePosition: async (
    db: Database,
    id: string,
    userId: string,
    afterId?: string
  ): Promise<Tab> => {
    // Validate tab belongs to user
    const tabCheck = await db
      .select({ id: tabs.id })
      .from(tabs)
      .where(and(eq(tabs.id, id), eq(tabs.userId, userId)))
      .limit(1);

    if (tabCheck.length === 0) {
      throw new Error("Tab not found or not owned by user");
    }

    // Validate afterId if provided
    if (afterId) {
      const afterTabCheck = await db
        .select({ id: tabs.id })
        .from(tabs)
        .where(and(eq(tabs.id, afterId), eq(tabs.userId, userId)))
        .limit(1);

      if (afterTabCheck.length === 0) {
        throw new Error("Invalid afterId - tab not found or not owned by user");
      }

      // Prevent cycles
      if (await wouldCreateCycle(db, id, afterId, userId)) {
        throw new Error("Invalid move - would create cycle");
      }
    }

    const [updatedTab] = await db
      .update(tabs)
      .set({
        afterId: afterId,
        updatedAt: new Date(),
      })
      .where(and(eq(tabs.id, id), eq(tabs.userId, userId)))
      .returning();

    if (!updatedTab) {
      throw new Error("Failed to update tab position");
    }

    return updatedTab;
  },

  // Delete a tab and handle chain relinking
  delete: async (
    db: Database,
    id: string,
    userId: string
  ): Promise<{ success: boolean }> => {
    // First, verify the tab belongs to the user and get its afterId
    const [tabToDelete] = await db
      .select({ afterId: tabs.afterId })
      .from(tabs)
      .where(and(eq(tabs.id, id), eq(tabs.userId, userId)))
      .limit(1);

    if (!tabToDelete) {
      throw new Error("Tab not found or not owned by user");
    }

    // Handle cascade positioning in single transaction
    await db.transaction(async (tx) => {
      // Update any tabs that were after the deleted one
      await tx
        .update(tabs)
        .set({
          afterId: tabToDelete.afterId,
          updatedAt: new Date(),
        })
        .where(and(eq(tabs.afterId, id), eq(tabs.userId, userId)));

      // Delete the tab
      await tx
        .delete(tabs)
        .where(and(eq(tabs.id, id), eq(tabs.userId, userId)));
    });

    return { success: true };
  },

  // Set a tab as active (and clear others)
  setActive: async (db: Database, id: string, userId: string): Promise<Tab> => {
    // Verify the tab exists and belongs to user
    const tabExists = await db
      .select({ id: tabs.id })
      .from(tabs)
      .where(and(eq(tabs.id, id), eq(tabs.userId, userId)))
      .limit(1);

    if (tabExists.length === 0) {
      throw new Error("Tab not found or not owned by user");
    }

    // Use transaction to ensure atomicity
    return await db.transaction(async (tx) => {
      // Clear all active tabs for this user
      await tx
        .update(tabs)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(tabs.userId, userId));

      // Set the specified tab as active
      const [activeTab] = await tx
        .update(tabs)
        .set({ isActive: true, updatedAt: new Date() })
        .where(and(eq(tabs.id, id), eq(tabs.userId, userId)))
        .returning();

      if (!activeTab) {
        throw new Error("Failed to set tab as active");
      }

      return activeTab;
    });
  },

  // Get the currently active tab for a user
  getActive: async (db: Database, userId: string): Promise<Tab | null> => {
    const [activeTab] = await db
      .select()
      .from(tabs)
      .where(and(eq(tabs.userId, userId), eq(tabs.isActive, true)))
      .limit(1);

    return activeTab || null;
  },

  // Clear active tab (set none as active)
  clearActive: async (db: Database, userId: string): Promise<void> => {
    await db
      .update(tabs)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(tabs.userId, userId));
  },
};

// Export types for use in other modules
export type { Tab, NewTab };
