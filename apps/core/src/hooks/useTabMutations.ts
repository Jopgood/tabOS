// hooks/useTabMutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

function generateEndPosition(tabs: any[]) {
  if (tabs.length === 0) return 1000;

  const sortedTabs = tabs.sort((a, b) => a.position - b.position);
  const lastPosition = sortedTabs[sortedTabs.length - 1].position;

  return lastPosition + 1000;
}

function shouldTriggerGlobalRebalance(
  tabs: Array<{ position: number }>
): boolean {
  const positions = tabs.map((t) => t.position).sort((a, b) => a - b);

  for (let i = 0; i < positions.length - 1; i++) {
    if (positions[i + 1]! - positions[i]! < 100) {
      return true;
    }
  }

  // Also check if any position has too many decimal places
  return positions.some((pos) => {
    const str = pos.toString();
    const decimalPart = str.split(".")[1];
    return decimalPart && decimalPart.length > 10;
  });
}

function rebalanceAllTabs(
  tabs: Array<{ id: string; position: number }>
): Array<{ id: string; position: number }> {
  if (tabs.length === 0) return tabs;

  const sortedTabs = [...tabs].sort((a, b) => a.position - b.position);

  // Use clean positions: 1000, 2000, 3000, etc.
  return sortedTabs.map((tab, index) => ({
    ...tab,
    position: (index + 1) * 1000,
  }));
}

function generatePositionBetween(
  beforePos: number | null,
  afterPos: number | null
) {
  if (!beforePos && afterPos) return afterPos / 2; // First position
  if (!afterPos && beforePos) return beforePos + 1000; // After last position

  // Between two positions - simple midpoint
  if (beforePos && afterPos) {
    return (beforePos + afterPos) / 2;
  }

  return 0;
}

export function useTabMutations() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const createTab = useMutation(
    trpc.tabs.addTab.mutationOptions({
      onMutate: async (newTab) => {
        await queryClient.cancelQueries({
          queryKey: trpc.tabs.getTabs.queryKey(),
        });

        const previousTabs = queryClient.getQueryData(
          trpc.tabs.getTabs.queryKey()
        );

        const newPosition = generateEndPosition(previousTabs || []);

        queryClient.setQueryData(trpc.tabs.getTabs.queryKey(), (old) => [
          ...(old || []),
          {
            id: `temp-${Date.now()}`,
            title: newTab.title,
            type: newTab.type,
            position: newPosition,
            userId: "current-user",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]);

        return { previousTabs };
      },
      onError: (err, newTab, context) => {
        if (context?.previousTabs) {
          queryClient.setQueryData(
            trpc.tabs.getTabs.queryKey(),
            context.previousTabs
          );
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.tabs.getTabs.queryKey(),
        });
      },
    })
  );

  const reorderTab = useMutation(trpc.tabs.updateTabPosition.mutationOptions());

  const removeTab = useMutation(trpc.tabs.deleteTab.mutationOptions());

  const batchUpdateTabs = useMutation(
    trpc.tabs.batchUpdateTabPositions.mutationOptions({
      onSuccess: () => {
        // Invalidate to ensure we have the latest data
        queryClient.invalidateQueries({
          queryKey: trpc.tabs.getTabs.queryKey(),
        });
      },
      onError: (error) => {
        console.error("Batch update failed:", error);
        // The optimistic update will be reverted in the onError callback above
      },
    })
  );

  return {
    createTab,
    removeTab,
    reorderTab,
    generatePositionBetween,
    shouldTriggerGlobalRebalance,
    rebalanceAllTabs,
    batchUpdateTabs,
  };
}
