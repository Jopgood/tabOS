import type { Database } from "@api/db";
import { and, eq } from "drizzle-orm";
import { type NewTab, type Tab, tabs } from "../schema";

// Input types for API functions
export interface CreateTabInput {
  userId: string;
  title: string;
  type?: string;
  position?: number;
}

export interface UpdateTabInput {
  title?: string;
  position?: number;
}

// Helper function to get next available position
async function getNextPosition(
  db: Database,
  userId: string
): Promise<number> {
  const result = await db
    .select({ maxPosition: tabs.position })
    .from(tabs)
    .where(eq(tabs.userId, userId))
    .orderBy(tabs.position);
  
  const maxPos = result.reduce((max, tab) => Math.max(max, tab.maxPosition || 0), -1);
  return maxPos + 1;
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

  // Add create method for sync
  create: async (
    db: Database,
    userId: string,
    tabData: {
      id: string;
      type: string;
      title: string;
      position: number;
    }
  ): Promise<void> => {
    await db.insert(tabs).values({
      id: tabData.id,
      userId,
      type: tabData.type,
      title: tabData.title,
      position: tabData.position,
      createdAt: new Date(),
    });
  },

  // Create a new tab
  createNew: async (db: Database, input: CreateTabInput): Promise<Tab> => {
    const position = input.position ?? (await getNextPosition(db, input.userId));

    const [newTab] = await db
      .insert(tabs)
      .values({
        userId: input.userId,
        title: input.title,
        type: input.type || 'default',
        position,
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
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (input.title !== undefined) updateData.title = input.title;
    if (input.position !== undefined) updateData.position = input.position;

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

  // Update tab position
  updatePosition: async (
    db: Database,
    id: string,
    userId: string,
    newPosition: number
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

    const [updatedTab] = await db
      .update(tabs)
      .set({
        position: newPosition,
        updatedAt: new Date(),
      })
      .where(and(eq(tabs.id, id), eq(tabs.userId, userId)))
      .returning();

    if (!updatedTab) {
      throw new Error("Failed to update tab position");
    }

    return updatedTab;
  },

  // Delete a tab
  delete: async (
    db: Database,
    id: string,
    userId: string
  ): Promise<{ success: boolean }> => {
    // Verify the tab belongs to the user
    const [tabToDelete] = await db
      .select({ id: tabs.id })
      .from(tabs)
      .where(and(eq(tabs.id, id), eq(tabs.userId, userId)))
      .limit(1);

    if (!tabToDelete) {
      throw new Error("Tab not found or not owned by user");
    }

    // Delete the tab
    await db
      .delete(tabs)
      .where(and(eq(tabs.id, id), eq(tabs.userId, userId)));

    return { success: true };
  },
};

// Export types for use in other modules
export type { Tab, NewTab };
