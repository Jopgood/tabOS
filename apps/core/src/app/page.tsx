import type { Metadata } from "next";
import { HydrateClient } from "@/trpc/server";
import { Main } from "@/components/main";

export const metadata: Metadata = {
  title: "Overview | TabOS",
};

export default async function Overview() {
  return (
    <HydrateClient>
      <div>
        <div className="h-[530px] mb-4">
          <div className="mt-8 relative"></div>
        </div>
      </div>
    </HydrateClient>
  );
}
