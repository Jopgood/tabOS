import { useTabStore } from "../tab-store";
import { type Tab } from "@tabos/api/db/schema";

export const useTabUI = () => {
  const store = useTabStore();

  return {
    ...store,

    // Simple helper to automatically set first tab as active
    ensureActiveTab: (tabs: Tab[]) => {
      if (!store.activeTabId && tabs.length > 0 && tabs[0]) {
        store.setActiveTab(tabs[0].id);
      }
    },
  };
};
