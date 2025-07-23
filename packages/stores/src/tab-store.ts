import { create } from "zustand";
import { type Tab } from "@tabos/api/db/schema";

interface TabStore {
  // Simple UI state
  activeTabId: string | null;

  // Basic actions
  setActiveTab: (id: string) => void;
  clearActiveTab: () => void;
}

export const useTabStore = create<TabStore>((set, get) => ({
  activeTabId: null,

  setActiveTab: (id) => set({ activeTabId: id }),

  clearActiveTab: () => set({ activeTabId: null }),
}));

export type { TabStore };
