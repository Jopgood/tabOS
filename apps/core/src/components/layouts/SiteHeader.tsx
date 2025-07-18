"use client";

import { SidebarIcon } from "lucide-react";

import { Button } from "@tabos/ui/button";
import { Separator } from "@tabos/ui/separator";
import { useSidebar } from "@tabos/ui/sidebar";

export function SiteHeader() {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="sticky top-0 z-50 flex h-[var(--header-height)] items-center border-b bg-background">
      <div className="flex h-[--header-height] w-full items-center gap-2 px-4">
        <Button
          className="h-8 w-8"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
        >
          <SidebarIcon />
        </Button>
        <Separator orientation="vertical" className="h-4" />
        <h2 className="text-md font-bold">AnjunaHub</h2>
      </div>
    </header>
  );
}
