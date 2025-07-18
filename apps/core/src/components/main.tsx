// components/main.tsx
"use client";
import { TabBar } from "./tab-bar";

export function Main() {
  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="flex gap-2">
        <TabBar />
      </div>
    </div>
  );
}
