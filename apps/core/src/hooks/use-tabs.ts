import { api } from "@/trpc/client";
import type { Tab } from "@tabos/api/db/schema";

// Helper to build tab order from after_id chain
const buildTabOrder = (tabs: Tab[]) => {
  if (!tabs || tabs.length === 0) return [];

  const ordered = [];
  let current = tabs.find((t) => t.afterId === null); // Find first tab

  while (current) {
    ordered.push(current);
    current = tabs.find((t) => t.afterId === current!.id); // Find next tab
  }

  return ordered;
};

// Get ordered tabs
export const useOrderedTabs = () => {
  return api.tabs.list.useQuery(undefined, {
    select: (tabs) => buildTabOrder(tabs),
  });
};

// Create tab
export const useCreateTab = () => {
  const utils = api.useUtils();

  return api.tabs.create.useMutation({
    onSuccess: () => {
      utils.tabs.list.invalidate();
      utils.tabs.getActive.invalidate();
    },
  });
};

// Delete tab with optimistic update
export const useDeleteTab = () => {
  const utils = api.useUtils();

  return api.tabs.delete.useMutation({
    onMutate: async ({ id }) => {
      // Cancel ongoing queries
      await utils.tabs.list.cancel();
      await utils.tabs.getActive.cancel();

      // Get current data
      const previousTabs = utils.tabs.list.getData();

      if (previousTabs) {
        // Optimistically remove the tab and relink the chain
        const updatedTabs = previousTabs
          .filter((t) => t.id !== id)
          .map((tab) => {
            // If this tab was after the deleted one, update its afterId
            if (tab.afterId === id) {
              const deletedTab = previousTabs.find((t) => t.id === id);
              return { ...tab, afterId: deletedTab?.afterId || null };
            }
            return tab;
          });

        utils.tabs.list.setData(undefined, updatedTabs);
      }

      return { previousTabs };
    },

    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousTabs) {
        utils.tabs.list.setData(undefined, context.previousTabs);
      }
    },

    onSettled: () => {
      // Refetch to ensure consistency
      utils.tabs.list.invalidate();
      utils.tabs.getActive.invalidate();
    },
  });
};

// Set active tab
export const useSetActiveTab = () => {
  const utils = api.useUtils();

  return api.tabs.setActive.useMutation({
    onMutate: async ({ id }) => {
      // Cancel ongoing queries
      await utils.tabs.list.cancel();
      await utils.tabs.getActive.cancel();

      // Get current data
      const previousTabs = utils.tabs.list.getData();

      if (previousTabs) {
        // Optimistically update active state
        const updatedTabs = previousTabs.map((tab) => ({
          ...tab,
          isActive: tab.id === id,
        }));

        utils.tabs.list.setData(undefined, updatedTabs);
      }

      return { previousTabs };
    },

    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousTabs) {
        utils.tabs.list.setData(undefined, context.previousTabs);
      }
    },

    onSuccess: () => {
      // Refetch to ensure consistency
      utils.tabs.list.invalidate();
      utils.tabs.getActive.invalidate();
    },
  });
};

// Get active tab
export const useActiveTab = () => {
  return api.tabs.getActive.useQuery();
};
