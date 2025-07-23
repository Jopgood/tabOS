// Updated component with DnD
"use client";
import { useTRPC } from "@/trpc/client";
import { cn } from "@tabos/ui/cn";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTabMutations } from "@/hooks/useTabMutations";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import {
  useSortable,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Sortable Tab Component
function SortableTab({
  tab,
  onRemove,
}: {
  tab: any;
  onRemove: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tab.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "flex items-center px-4 py-2 bg-white border cursor-move",
        isDragging && "shadow-lg"
      )}
    >
      <span>{tab.title}</span>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(tab.id);
        }}
        className="ml-2 text-red-500 hover:text-red-700"
      >
        ×
      </button>
    </div>
  );
}

export function TabBar() {
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const tabsQuery = useQuery(trpc.tabs.getTabs.queryOptions());
  const {
    createTab,
    removeTab,
    reorderTab,
    generatePositionBetween,
    shouldTriggerGlobalRebalance,
    rebalanceAllTabs,
    batchUpdateTabs,
  } = useTabMutations();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Sort tabs by position for display (CHANGED: numeric sort instead of string)
  const sortedTabs = (tabsQuery.data || []).sort(
    (a, b) => a.position - b.position
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const oldIndex = sortedTabs.findIndex((tab) => tab.id === active.id);
    const newIndex = sortedTabs.findIndex((tab) => tab.id === over.id);

    // Create a new array with the item moved to simulate the final order
    const reorderedTabs = [...sortedTabs];
    const [movedTab] = reorderedTabs.splice(oldIndex, 1);
    if (!movedTab) return;
    reorderedTabs.splice(newIndex, 0, movedTab);

    // Calculate new position for the moved tab
    let newPosition: number;
    if (newIndex === 0) {
      newPosition = generatePositionBetween(
        null,
        reorderedTabs[1]?.position || null
      );
    } else if (newIndex === reorderedTabs.length - 1) {
      newPosition = generatePositionBetween(
        reorderedTabs[newIndex - 1]?.position || null,
        null
      );
    } else {
      const beforePos = reorderedTabs[newIndex - 1]?.position || null;
      const afterPos = reorderedTabs[newIndex + 1]?.position || null;
      newPosition = generatePositionBetween(beforePos, afterPos);
    }

    // Update the moved tab's position in our simulation
    const finalTabs = reorderedTabs.map((tab) =>
      tab.id === active.id ? { ...tab, position: newPosition } : tab
    );

    // Check if we need to rebalance
    const needsRebalance = shouldTriggerGlobalRebalance(finalTabs);

    if (needsRebalance) {
      // Rebalance all tabs to clean positions
      const rebalancedTabs = rebalanceAllTabs(finalTabs);

      // Optimistically update the cache immediately
      queryClient.setQueryData(trpc.tabs.getTabs.queryKey(), (oldData) => {
        if (!oldData) return oldData;

        // Create a map of new positions for quick lookup
        const positionMap = new Map(
          rebalancedTabs.map((tab) => [tab.id, tab.position])
        );

        // Update only the positions, preserve all other properties
        return oldData.map((tab) => ({
          ...tab,
          position: positionMap.get(tab.id) ?? tab.position,
        }));
      });

      // Prepare batch update data
      const batchUpdates = rebalancedTabs.map((tab) => ({
        tabId: tab.id,
        newPosition: tab.position,
      }));

      // Perform batch update in background
      batchUpdateTabs.mutate(batchUpdates, {
        onError: () => {
          // If batch update fails, revert the optimistic update
          queryClient.invalidateQueries({
            queryKey: trpc.tabs.getTabs.queryKey(),
          });
        },
      });
    } else {
      // Standard single tab update
      reorderTab.mutate({
        tabId: active.id as string,
        newPosition,
      });
    }
  };

  const handleDragOver = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sortedTabs.findIndex((tab) => tab.id === active.id);
      const newIndex = sortedTabs.findIndex((tab) => tab.id === over.id);

      // Calculate new position based on where the tab was dropped
      let newPosition: number;

      // Create a new array with the item moved to simulate the final order
      const reorderedTabs = [...sortedTabs];
      const [movedTab] = reorderedTabs.splice(oldIndex, 1);
      if (!movedTab) return;
      reorderedTabs.splice(newIndex, 0, movedTab);

      // Now calculate position based on the new neighbors
      if (newIndex === 0) {
        // Moved to beginning
        newPosition = generatePositionBetween(
          null,
          reorderedTabs[1]?.position || null
        );
      } else if (newIndex === reorderedTabs.length - 1) {
        // Moved to end
        newPosition = generatePositionBetween(
          reorderedTabs[newIndex - 1]?.position || null,
          null
        );
      } else {
        // Moved between two tabs
        const beforePos = reorderedTabs[newIndex - 1]?.position || null;
        const afterPos = reorderedTabs[newIndex + 1]?.position || null;
        newPosition = generatePositionBetween(beforePos, afterPos);
      }

      queryClient.setQueryData(trpc.tabs.getTabs.queryKey(), (old) => {
        return (old || []).map((tab) =>
          tab.id === active.id ? { ...tab, position: newPosition } : tab
        );
      });
    }
  };

  return (
    <div
      className={cn(
        "sticky top-[var(--header-height)] z-40 flex items-center dark:border-gray-800"
      )}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToHorizontalAxis]}
      >
        <div className="scrollbar-hide flex flex-grow overflow-x-auto  p-4">
          <SortableContext
            items={sortedTabs.map((tab) => tab.id)}
            strategy={horizontalListSortingStrategy}
          >
            {sortedTabs.map((tab) => (
              <SortableTab
                key={tab.id}
                tab={tab}
                onRemove={(id) => removeTab.mutate(id)}
              />
            ))}
          </SortableContext>

          <button
            onClick={() =>
              createTab.mutate({
                title: "New Tab",
                type: "default",
              })
            }
            disabled={createTab.isPending}
            className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600"
          >
            +
          </button>
        </div>
      </DndContext>
    </div>
  );
}
