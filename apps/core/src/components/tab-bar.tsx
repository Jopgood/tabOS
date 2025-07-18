import { useTabStore } from "@tabos/stores";
import { cn } from "@tabos/ui/cn";
import { Plus, X } from "lucide-react";
import {
  useActiveTab,
  useCreateTab,
  useDeleteTab,
  useOrderedTabs,
  useSetActiveTab,
} from "../hooks/use-tabs";

export const TabBar = () => {
  const { data: orderedTabs, isLoading } = useOrderedTabs();
  const deleteTab = useDeleteTab();
  const createTab = useCreateTab();
  const setActiveTab = useSetActiveTab();
  const { data: activeTab } = useActiveTab();

  const { handleTabDeletion, setActiveTab: storeSetActiveTab } = useTabStore();

  const handleCreateTab = () => {
    const lastTab = orderedTabs?.[orderedTabs.length - 1];

    createTab.mutate(
      {
        title: "New Tab " + (orderedTabs?.length || 0),
        afterId: lastTab?.id,
      },
      {
        onSuccess: (newTab) => {
          // Set the new tab as active
          setActiveTab.mutate({ id: newTab.id });
          storeSetActiveTab(newTab.id);
        },
      }
    );
  };

  const handleSetActiveTab = (tabId: string) => () => {
    setActiveTab.mutate({ id: tabId });
    storeSetActiveTab(tabId);
  };

  const handleDeleteTab = (tabId: string) => {
    if (!orderedTabs) return;
    handleTabDeletion(tabId, orderedTabs);
    deleteTab.mutate({ id: tabId });
  };

  if (isLoading) {
    return (
      <div className="h-10 bg-gray-100 border-b border-gray-200 flex items-center px-2">
        <div className="text-sm text-gray-500">Loading tabs...</div>
      </div>
    );
  }

  return (
    <div className="flex items-end bg-gray-100 border-b border-gray-200 overflow-hidden">
      {/* Tab container with horizontal scroll */}
      <div className="flex overflow-x-auto scrollbar-hide">
        {orderedTabs?.map((tab, index) => (
          <div
            key={tab.id}
            className={cn(
              "relative group flex items-center min-w-[120px] max-w-[240px] h-8 px-3 cursor-pointer select-none",
              "border-t border-l border-r border-gray-300 bg-white",
              "hover:bg-gray-50 transition-colors duration-150",
              // Tab shape styling
              "before:absolute before:bottom-0 before:left-0 before:w-2 before:h-2",
              "before:bg-gray-100 before:rounded-br-lg",
              "after:absolute after:bottom-0 after:right-0 after:w-2 after:h-2",
              "after:bg-gray-100 after:rounded-bl-lg",
              // Active tab styling
              activeTab?.id === tab.id
                ? "bg-white border-gray-400 z-10 -mb-px border-b-0"
                : "bg-gray-50 border-gray-300 mb-px border-b",
              // First tab special styling
              index === 0 ? "ml-0" : "-ml-2",
              // Rounded top corners for browser look
              "rounded-t-lg"
            )}
            onClick={handleSetActiveTab(tab.id)}
          >
            {/* Favicon placeholder */}
            <div className="w-4 h-4 rounded bg-blue-500 mr-2 flex-shrink-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-sm"></div>
            </div>

            {/* Tab title */}
            <span
              className="flex-1 text-sm text-gray-700 truncate pr-1"
              title={tab.title}
            >
              {tab.title}
            </span>

            {/* Close button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteTab(tab.id);
              }}
              className={cn(
                "flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center",
                "hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-150",
                "ml-1 text-gray-500 hover:text-gray-700"
              )}
              aria-label={`Close ${tab.title}`}
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>

      {/* New tab button */}
      <button
        onClick={handleCreateTab}
        className={cn(
          "flex items-center justify-center w-8 h-8 ml-2 mr-2",
          "hover:bg-gray-200 rounded transition-colors duration-150",
          "text-gray-600 hover:text-gray-800"
        )}
        aria-label="Add new tab"
      >
        <Plus size={16} />
      </button>
    </div>
  );
};
