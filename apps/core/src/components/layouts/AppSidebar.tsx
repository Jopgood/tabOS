"use client";

import {
  Command,
  FolderKanban,
  SquareLibrary,
  Library,
  Music2,
  FileText,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@tabos/ui/sidebar";

import { NavPrimary } from "./NavPrimary";
import { NavSecondary } from "./NavSecondary";
import { NavUser } from "./NavUser";

const data = {
  navPrimary: [
    {
      title: "Projects",
      icon: FolderKanban,
      type: "projects",
    },
    {
      title: "Releases",
      icon: SquareLibrary,
      type: "releases",
    },
    {
      title: "Products",
      icon: Library,
      type: "products",
    },
    {
      title: "Tracks",
      icon: Music2,
      type: "tracks",
    },
    {
      title: "Invoices",
      icon: FileText,
      type: "invoices",
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">AnjunaHub</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavPrimary items={data.navPrimary} />
        <NavSecondary className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
