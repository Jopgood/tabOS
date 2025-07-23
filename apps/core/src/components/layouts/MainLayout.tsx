"use client";

import { SidebarInset, SidebarProvider } from "@tabos/ui/sidebar";
import {
  ListCollapse,
  SquareLibrary,
  Library,
  Music2,
  FileText,
  PlusCircle,
  UserCircle,
  FolderKanban,
} from "lucide-react";

import { AppSidebar } from "./AppSidebar";
import { SiteHeader } from "./SiteHeader";
import { TabBar } from "./TabBar";
import { TabContent } from "./TabContent";

// Icon renderer for tabs
function renderTabIcon(tab: any) {
  switch (tab.type) {
    case "projects":
      return <FolderKanban className="h-4 w-4" />;
    case "project_details":
      return <ListCollapse className="h-4 w-4" />;
    case "project_create":
      return <PlusCircle className="h-4 w-4" />;
    case "releases":
      return <SquareLibrary className="h-4 w-4" />;
    case "products":
      return <Library className="h-4 w-4" />;
    case "tracks":
      return <Music2 className="h-4 w-4" />;
    case "invoices":
      return <FileText className="h-4 w-4" />;
    case "profile":
      return <UserCircle className="h-4 w-4" />;
    default:
      return null;
  }
}

export function MainLayout() {
  return (
    <div className="[--header-height:calc(theme(spacing.14))]">
      <SidebarProvider defaultOpen={false}>
        {/* <AppSidebar /> */}
        <SidebarInset>
          <SiteHeader />
          {/* <TabBar renderIcon={renderTabIcon} /> */}
          <TabBar />
          <TabContent className="flex-1" />
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
