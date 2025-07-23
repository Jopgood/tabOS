// hooks/useTabMutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

function generateEndPosition(tabs: any[]) {
  if (tabs.length === 0) return 1000;

  const sortedTabs = tabs.sort((a, b) => a.position - b.position);
  const lastPosition = sortedTabs[sortedTabs.length - 1].position;

  return lastPosition + 1000;
}

function generatePositionBetween(
  beforePos: number | null,
  afterPos: number | null
) {
  if (!beforePos) return 1000; // First position
  if (!afterPos) return beforePos + 1000; // After last position

  // Between two positions - simple midpoint
  return (beforePos + afterPos) / 2;
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
            status: "creating",
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

  const reorderTab = useMutation(
    trpc.tabs.updateTabPosition.mutationOptions({
      onMutate: async ({ tabId, newPosition }) => {
        console.log("⚡ onMutate START");

        await queryClient.cancelQueries({
          queryKey: trpc.tabs.getTabs.queryKey(),
        });

        const previousTabs = queryClient.getQueryData(
          trpc.tabs.getTabs.queryKey()
        );

        queryClient.setQueryData(trpc.tabs.getTabs.queryKey(), (old) => {
          const updated = (old || []).map((tab) =>
            tab.id === tabId ? { ...tab, position: newPosition } : tab
          );
          console.log("✨ Cache updated optimistically");
          return updated;
        });

        return { previousTabs };
      },
      onError: (err, variables, context) => {
        console.error("❌ DETAILED ERROR:", {
          message: err?.message,
          cause: err?.cause,
          data: err?.data,
          shape: err?.shape,
          code: err?.code,
          fullError: err,
        });
        if (context?.previousTabs) {
          queryClient.setQueryData(
            trpc.tabs.getTabs.queryKey(),
            context.previousTabs
          );
        }
      },
    })
  );

  const removeTab = useMutation(
    trpc.tabs.deleteTab.mutationOptions({
      onMutate: async (tabId) => {
        await queryClient.cancelQueries({
          queryKey: trpc.tabs.getTabs.queryKey(),
        });

        const previousTabs = queryClient.getQueryData(
          trpc.tabs.getTabs.queryKey()
        );

        queryClient.setQueryData(trpc.tabs.getTabs.queryKey(), (old) =>
          (old || []).filter((tab) => tab.id !== tabId)
        );

        return { previousTabs };
      },
      onError: (err, tabId, context) => {
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

  return {
    createTab,
    removeTab,
    reorderTab,
    generatePositionBetween,
  };
}
