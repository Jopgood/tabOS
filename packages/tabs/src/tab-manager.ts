// packages/tabs/src/tab-manager.ts
import { eq, gt, gte, and, max, sql, desc } from "drizzle-orm";

export class TabManager {
  static async getUserTabs(db: any, tabsTable: any, userId: string) {
    return await db
      .select()
      .from(tabsTable)
      .where(eq(tabsTable.userId, userId))
      .orderBy(tabsTable.position);
  }

  static async createTab(
    db: any,
    tabsTable: any,
    input: {
      userId: string;
      title: string;
      type?: string;
      url?: string;
      data?: any;
    }
  ) {
    return await db.transaction(async (tx: any) => {
      const maxPositionResult = await tx
        .select({ maxPosition: max(tabsTable.position) })
        .from(tabsTable)
        .where(eq(tabsTable.userId, input.userId));

      const nextPosition = (maxPositionResult[0]?.maxPosition || 0) + 1;

      const [newTab] = await tx
        .insert(tabsTable)
        .values({
          name: input.title,
          type: input.type || "note",
          userId: input.userId,
          position: nextPosition,
          data: input.data || null,
        })
        .returning();

      return newTab;
    });
  }

  static async insertTabAtPosition(
    db: any,
    tabsTable: any,
    input: {
      userId: string;
      title: string;
      type?: string;
      url?: string;
      position: number;
      data?: any;
    }
  ) {
    return await db.transaction(async (tx: any) => {
      await tx
        .update(tabsTable)
        .set({
          position: sql`${tabsTable.position} + 1`,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(tabsTable.userId, input.userId),
            gte(tabsTable.position, input.position)
          )
        );

      const [newTab] = await tx
        .insert(tabsTable)
        .values({
          name: input.title,
          type: input.type || "note",
          userId: input.userId,
          position: input.position,
          data: input.data || null,
        })
        .returning();

      return newTab;
    });
  }

  static async repairTabOrder(db: any, tabsTable: any, userId: string) {
    return await db.transaction(async (tx: any) => {
      const userTabs = await tx
        .select()
        .from(tabsTable)
        .where(eq(tabsTable.userId, userId))
        .orderBy(tabsTable.position, tabsTable.insertedAt);

      for (let i = 0; i < userTabs.length; i++) {
        const tab = userTabs[i];
        const correctPosition = i + 1;
        
        if (tab.position !== correctPosition) {
          await tx
            .update(tabsTable)
            .set({
              position: correctPosition,
              updatedAt: new Date(),
            })
            .where(eq(tabsTable.id, tab.id));
        }
      }

      return { success: true, repairedCount: userTabs.length };
    });
  }

  static async deleteTab(db: any, tabsTable: any, tabId: string) {
    return await db.transaction(async (tx: any) => {
      // Get the tab being deleted and all user tabs for debugging
      const [deletedTab] = await tx
        .select()
        .from(tabsTable)
        .where(eq(tabsTable.id, parseInt(tabId)));

      if (!deletedTab) {
        throw new Error("Tab not found");
      }

      // Get all tabs for this user to understand current state
      const allUserTabs = await tx
        .select()
        .from(tabsTable)
        .where(eq(tabsTable.userId, deletedTab.userId))
        .orderBy(tabsTable.position);

      console.log('Before deletion - all user tabs:', allUserTabs.map((t: any) => ({ id: t.id, position: t.position })));
      console.log('Deleting tab:', { id: deletedTab.id, position: deletedTab.position });

      // Delete the tab first
      await tx.delete(tabsTable).where(eq(tabsTable.id, parseInt(tabId)));

      // Get all tabs that need to be shifted (position > deleted position)
      const tabsToShift = await tx
        .select()
        .from(tabsTable)
        .where(
          and(
            eq(tabsTable.userId, deletedTab.userId),
            gt(tabsTable.position, deletedTab.position)
          )
        );

      console.log('Tabs to shift:', tabsToShift.map((t: any) => ({ id: t.id, position: t.position, newPosition: t.position - 1 })));

      // Safer approach: rebuild all positions from scratch
      // Get remaining tabs ordered by position
      const remainingTabs = await tx
        .select()
        .from(tabsTable)
        .where(eq(tabsTable.userId, deletedTab.userId))
        .orderBy(tabsTable.position);

      // Update each remaining tab with correct sequential position
      for (let i = 0; i < remainingTabs.length; i++) {
        const tab = remainingTabs[i];
        const correctPosition = i + 1;
        
        if (tab.position !== correctPosition) {
          await tx
            .update(tabsTable)
            .set({
              position: correctPosition,
              updatedAt: new Date(),
            })
            .where(eq(tabsTable.id, tab.id));
        }
      }

      return { success: true, deletedPosition: deletedTab.position };
    });
  }

  static async reorderTabs(
    db: any,
    tabsTable: any,
    input: {
      userId: string;
      tabId: string;
      fromPosition: number;
      toPosition: number;
    }
  ) {
    const { userId, tabId, fromPosition, toPosition } = input;

    if (fromPosition === toPosition) return { success: true };

    return await db.transaction(async (tx: any) => {
      // Get all affected tabs
      const affectedTabs = await tx
        .select()
        .from(tabsTable)
        .where(eq(tabsTable.userId, userId))
        .orderBy(tabsTable.position);

      // Update positions in memory first
      const updatedTabs = affectedTabs.map((tab: any) => {
        if (tab.id === parseInt(tabId)) {
          return { ...tab, position: toPosition };
        }

        if (fromPosition < toPosition) {
          // Moving right
          if (tab.position > fromPosition && tab.position <= toPosition) {
            return { ...tab, position: tab.position - 1 };
          }
        } else {
          // Moving left
          if (tab.position >= toPosition && tab.position < fromPosition) {
            return { ...tab, position: tab.position + 1 };
          }
        }

        return tab;
      });

      // Apply updates
      for (const tab of updatedTabs) {
        const originalTab = affectedTabs.find((t: any) => t.id === tab.id);
        if (originalTab && originalTab.position !== tab.position) {
          await tx
            .update(tabsTable)
            .set({
              position: tab.position,
              updatedAt: new Date(),
            })
            .where(eq(tabsTable.id, tab.id));
        }
      }

      return { success: true };
    });
  }
}