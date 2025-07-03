// components/main.tsx
"use client";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

export function Main() {
  const trpc = useTRPC();

  const { data, isLoading, error } = useQuery({
    ...trpc.tabs.get.queryOptions(),
  });

  if (isLoading) {
    return <div>Loading tabs...</div>;
  }

  if (error) {
    return <div>Error loading tabs: {error.message}</div>;
  }

  return <div>{JSON.stringify(data)}</div>;
}
