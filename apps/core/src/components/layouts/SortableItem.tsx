import { X } from "lucide-react";
import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import type { Tab } from "@tabos/api/db/schema";
import { cn } from "@tabos/ui/cn";
import { Button } from "@tabos/ui/button";
import { useDeleteTab } from "@/hooks/use-tabs";
import { useTabStore } from "@tabos/tab-sync";

export function SortableItem({
  tab,
  renderIcon,
  children,
  orderedTabs,
}: {
  tab: Tab;
  renderIcon: (tab: Tab) => React.ReactNode;
  children: React.ReactNode;
  orderedTabs: Tab[];
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tab.id });

  const tabs = useTabStore((state) => state.state.tabs);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Handle tab close
  const handleCloseTab = (event: React.MouseEvent, tabId: string) => {
    event.stopPropagation();
  };

  return (
    <div
      key={tab.id}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        tab.id === activeTabId
          ? "dark:bg-gray-900 border-b-2 border-b-primary cursor-default"
          : "cursor-pointer border-b-2 border-b-gray-200 dark:border-gray-800",
        "flex items-center bg-background px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 border-r",
        isDragging && "opacity-50 z-50"
      )}
      onClick={() => setActiveTabId(tab.id)}
    >
      <div className="flex min-w-0 flex-grow items-center">
        {renderIcon(tab)}
        <span className="ml-2 truncate text-sm">{children}</span>
      </div>

      {/* Only show close button if closable is true and we have more than one tab */}
      {orderedTabs.length > 1 && (
        <Button
          variant="ghost"
          size="icon"
          className="ml-1 h-5 w-5 cursor-pointer rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          onClick={(e) => handleCloseTab(e, tab.id)}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
