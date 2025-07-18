import { Main } from "@/components/main";
import { HydrateClient } from "@/trpc/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TabOS",
};

export default async function HomePage() {
  return (
    <HydrateClient>
      <div>
        <Main />
      </div>
    </HydrateClient>
  );
}
