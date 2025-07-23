// Updated component with DnD
"use client";
import { cn } from "@tabos/ui/cn";

export function TabContent() {
  return (
    <div
      className={cn(
        "sticky top-[var(--header-height)] z-40 flex items-center dark:border-gray-800"
      )}
    ></div>
  );
}
