"use client";

import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";

import { Button } from "@tabos/ui/button";

import { cn } from "@tabos/ui/cn";
import {
  useActiveTab,
  useCreateTab,
  useDeleteTab,
  useOrderedTabs,
  useSetActiveTab,
} from "@/hooks/use-tabs";
import { useTabStore } from "@tabos/stores";

export interface TabBarProps {
  /**
   * Class name for the tab bar container
   */
  className?: string;
  /**
   * Function to render an icon for each tab
   */
  renderIcon?: (tab: any) => React.ReactNode;

  /**
   * Class name for tab elements
   */
  tabClassName?: string;

  /**
   * Class name for the active tab
   */
  activeTabClassName?: string;

  /**
   * Class name for close buttons
   */
  closeButtonClassName?: string;

  /**
   * Class name for scroll buttons
   */
  scrollButtonClassName?: string;
}

export function TabBar({
  className,
  renderIcon = () => null,
  tabClassName = "",
  activeTabClassName = "",
  closeButtonClassName = "",
  scrollButtonClassName = "",
}: TabBarProps) {
  const { data: orderedTabs } = useOrderedTabs();
  const deleteTab = useDeleteTab();
  const setActiveTab = useSetActiveTab();

  const [showScrollButtons, setShowScrollButtons] = useState<boolean>(false);
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  // Check if tabs container needs scroll buttons
  useEffect(() => {
    const checkScrollable = () => {
      if (tabsContainerRef.current) {
        const { scrollWidth, clientWidth } = tabsContainerRef.current;
        setShowScrollButtons(scrollWidth > clientWidth);
      }
    };

    checkScrollable();
    window.addEventListener("resize", checkScrollable);
    return () => window.removeEventListener("resize", checkScrollable);
  }, [orderedTabs]);

  // Scroll tabs container
  const scrollTabs = (direction: "left" | "right") => {
    if (tabsContainerRef.current) {
      const scrollAmount = direction === "left" ? -200 : 200;
      tabsContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Handle tab close
  const handleCloseTab = (event: React.MouseEvent, tabId: string) => {
    event.stopPropagation();
    deleteTab.mutate({ id: tabId });
  };

  return (
    <div className={cn("flex items-center dark:border-gray-800", className)}>
      {/* Left scroll button */}
      {showScrollButtons && (
        <button
          className={`flex-shrink-0 p-2 ${scrollButtonClassName}`}
          onClick={() => scrollTabs("left")}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}

      {/* Tabs container */}
      <div
        ref={tabsContainerRef}
        className="scrollbar-hide flex flex-grow overflow-x-auto"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {orderedTabs?.map((tab) => (
          <div
            key={tab.id}
            className={cn(
              tab.isActive
                ? activeTabClassName
                : "cursor-pointer border-b-2 border-b-gray-200 dark:border-gray-800",
              tabClassName
            )}
            onClick={() => setActiveTab.mutate({ id: tab.id })}
          >
            <div className="flex min-w-0 flex-grow items-center">
              {renderIcon(tab)}
              <span className="ml-2 truncate text-sm">{tab.title}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Right scroll button */}
      {showScrollButtons && (
        <button
          className={`flex-shrink-0 p-2 ${scrollButtonClassName}`}
          onClick={() => scrollTabs("right")}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
