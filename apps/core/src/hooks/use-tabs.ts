import { trpc } from "@/trpc/trpc";
import type { Tab } from "@tabos/api/db/schema";

// Helper to build tab order from after_id chain
const buildTabOrder = (tabs: Tab[]) => {
  if (!tabs || tabs.length === 0) return [];

  const orderedTabs: Tab[] = [];

  // Find the first tab (afterId is null)
  let currentTab = tabs.find((tab) => tab.afterId === null);

  while (currentTab) {
    orderedTabs.push(currentTab);
    // Find the next tab that comes after the current one
    currentTab = tabs.find((tab) => tab.afterId === currentTab!.id);
  }

  return orderedTabs;
};

// Get ordered tabs
export const useOrderedTabs = () => {
  return trpc.tabs.getTabs.useQuery(undefined, {
    select: buildTabOrder,
  });
};

// Create tab
export const useCreateTab = () => {
  const utils = trpc.useUtils();

  return trpc.tabs.create.useMutation({
    onSuccess: () => {
      utils.tabs.getTabs.invalidate();
    },
  });
};

// Delete tab with optimistic update
export const useDeleteTab = () => {
  const utils = trpc.useUtils();

  return trpc.tabs.delete.useMutation({
    onSuccess: () => {
      // Just invalidate and refetch from server
      utils.tabs.getTabs.invalidate();
    },

    onError: () => {
      utils.tabs.getTabs.invalidate();
    },
  });
};

// Reorder tabs with proper chain repair
export const useReorderTabs = () => {
  const utils = trpc.useUtils();
  const updatePosition = trpc.tabs.updatePosition.useMutation();

  return {
    mutate: async ({
      activeId,
      afterId,
    }: {
      activeId: string;
      afterId: string | null;
    }) => {
      const previousTabs = utils.tabs.getTabs.getData();
      if (!previousTabs) return;

      const activeTab = previousTabs.find((tab) => tab.id === activeId);
      if (!activeTab) return;

      // Optimistic visual update first
      const currentOrder = buildTabOrder(previousTabs);
      const activeIndex = currentOrder.findIndex((tab) => tab.id === activeId);
      if (activeIndex === -1) return;

      const newOrder = [...currentOrder];
      const [movedTab] = newOrder.splice(activeIndex, 1);

      let targetIndex;
      if (!afterId) {
        targetIndex = 0;
      } else {
        targetIndex = newOrder.findIndex((tab) => tab.id === afterId) + 1;
      }

      newOrder.splice(targetIndex, 0, movedTab);
      utils.tabs.getTabs.setData(undefined, newOrder);

      // Now do the proper chain repair on server
      try {
        // Step 1: Move the active tab to its new position
        await updatePosition.mutateAsync({
          id: activeId,
          afterId: afterId,
        });

        // Step 2: Fix the tab that was after the moved tab (if any)
        // const tabThatWasAfterMoved = previousTabs.find(
        //   (tab) => tab.afterId === activeId
        // );
        // if (tabThatWasAfterMoved) {
        //   await updatePosition.mutateAsync({
        //     id: tabThatWasAfterMoved.id,
        //     afterId: activeTab.afterId,
        //   });
        // }

        // Step 3: Fix the tab that was after the target (if any)
        if (afterId) {
          const tabThatWasAfterTarget = previousTabs.find(
            (tab) => tab.afterId === afterId
          );
          if (tabThatWasAfterTarget && tabThatWasAfterTarget.id !== activeId) {
            await updatePosition.mutateAsync({
              id: tabThatWasAfterTarget.id,
              afterId: activeId,
            });
          }
        }

        // Refresh to get the authoritative state
        utils.tabs.getTabs.invalidate();
      } catch (error) {
        console.error("Reorder failed:", error);
        utils.tabs.getTabs.invalidate();
      }
    },
  };
};
