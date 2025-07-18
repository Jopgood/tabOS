import { create } from "zustand";
import { type Tab } from "@tabos/api/db/schema";

interface TabStore {
  // Simple UI state
  activeTabId: string | null;

  // Basic actions
  setActiveTab: (id: string) => void;
  clearActiveTab: () => void;

  // Handle tab deletion fallback
  handleTabDeletion: (deletedId: string, tabs: Tab[]) => void;
}

export const useTabStore = create<TabStore>((set, get) => ({
  activeTabId: null,

  setActiveTab: (id) => set({ activeTabId: id }),

  clearActiveTab: () => set({ activeTabId: null }),

  handleTabDeletion: (deletedId, tabs) =>
    set((state) => {
      // If we're not deleting the active tab, do nothing
      if (state.activeTabId !== deletedId) return {};

      // Find a replacement tab (prefer the next one, then previous, then first)
      const currentIndex = tabs.findIndex((t) => t.id === deletedId);
      const remainingTabs = tabs.filter((t) => t.id !== deletedId);

      const fallbackTab =
        remainingTabs[currentIndex] || // Next tab
        remainingTabs[currentIndex - 1] || // Previous tab
        remainingTabs[0] || // First tab
        null; // No tabs left

      return { activeTabId: fallbackTab?.id || null };
    }),
}));

export type { TabStore };
