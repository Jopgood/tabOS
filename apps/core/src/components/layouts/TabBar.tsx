// Updated component with DnD
"use client";
import { useTRPC } from "@/trpc/client";
import { cn } from "@tabos/ui/cn";
import { useQuery } from "@tanstack/react-query";
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
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect } from "react";

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
        "flex items-center px-4 py-2 bg-white border rounded cursor-move",
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
  const trpc = useTRPC();
  const tabsQuery = useQuery(trpc.tabs.getTabs.queryOptions());
  const { createTab, removeTab, reorderTab, generatePositionBetween } =
    useTabMutations();

  // Add effect to log every render and data change
  useEffect(() => {
    console.log("🔄 TabBar render:", {
      timestamp: Date.now(),
      tabsData: tabsQuery.data?.map((t) => ({
        id: t.id,
        position: t.position,
      })),
      isLoading: tabsQuery.isLoading,
      isFetching: tabsQuery.isFetching,
      isPending: tabsQuery.isPending,
    });
  });

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
    console.log("🎯 Drag started");

    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sortedTabs.findIndex((tab) => tab.id === active.id);
      const newIndex = sortedTabs.findIndex((tab) => tab.id === over.id);

      console.log("📊 Drag details:", {
        activeId: active.id,
        overId: over.id,
        oldIndex,
        newIndex,
        currentOrder: sortedTabs.map((t) => ({
          id: t.id,
          position: t.position,
        })),
      });

      // Calculate new position based on where the tab was dropped
      let newPosition: number; // CHANGED: number instead of string

      // Create a new array with the item moved to simulate the final order
      const reorderedTabs = [...sortedTabs];
      const [movedTab] = reorderedTabs.splice(oldIndex, 1);
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

      // Trigger the mutation
      console.log("🚀 Calling reorderTab.mutate with:", {
        tabId: active.id,
        newPosition,
        timestamp: Date.now(),
      });

      reorderTab.mutate({
        tabId: active.id as string,
        newPosition,
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
        onDragEnd={handleDragEnd}
      >
        <div className="scrollbar-hide flex flex-grow overflow-x-auto gap-2">
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
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            +
          </button>
        </div>
      </DndContext>
    </div>
  );
}
