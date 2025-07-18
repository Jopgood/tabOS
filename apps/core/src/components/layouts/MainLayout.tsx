"use client";

import { SidebarInset, SidebarProvider } from "@tabos/ui/sidebar";

import { AppSidebar } from "./AppSidebar";
import { SiteHeader } from "./SiteHeader";
import { TabBar } from "./TabBar";
import { TabContent } from "./TabContent";

export function MainLayout() {
  return (
    <div className="[--header-height:calc(theme(spacing.14))]">
      <SidebarProvider defaultOpen={false}>
        <AppSidebar />
        <SidebarInset>
          <SiteHeader />
          <TabBar
            className="sticky top-[var(--header-height)] z-40"
            tabClassName="flex items-center bg-background px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 border-r"
          />
          <TabContent className="flex-1" />
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
