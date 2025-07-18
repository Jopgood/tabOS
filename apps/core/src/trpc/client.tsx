// trpc/client.ts
"use client";

import { useAuth } from "@clerk/nextjs";
import type { AppRouter } from "@tabos/api/trpc/routers/_app";
import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider, isServer } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { useEffect, useRef, useState } from "react";
import superjson from "superjson";
import { makeQueryClient } from "./query-client";

// Use standard createTRPCReact instead
export const api = createTRPCReact<AppRouter>();

let browserQueryClient: QueryClient;

function getQueryClient() {
  if (isServer) {
    return makeQueryClient();
  }

  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

export function TRPCReactProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();
  const getTokenRef = useRef(getToken);

  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  const queryClient = getQueryClient();

  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        httpBatchLink({
          url: `${process.env.NEXT_PUBLIC_API_URL}/trpc`,
          transformer: superjson,
          async headers() {
            try {
              const authToken = await getTokenRef.current();
              return {
                Authorization: authToken ? `Bearer ${authToken}` : "",
              };
            } catch (error) {
              console.warn("Failed to get auth token:", error);
              return { Authorization: "" };
            }
          },
        }),
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === "development" ||
            (opts.direction === "down" && opts.result instanceof Error),
        }),
      ],
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </api.Provider>
    </QueryClientProvider>
  );
}
