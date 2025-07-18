"use client";

import { ReactNode } from "react";
import { Toaster } from "@tabos/ui/toaster";
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ThemeProvider } from "@/components/theme-provider";

import { TRPCReactProvider } from "@/trpc/client";

export default function ClientProvider({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <TRPCReactProvider>
        {/* <header className="flex justify-end items-center p-4 gap-4 h-16">
          <SignedOut>
            <SignInButton />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </header> */}
        <NuqsAdapter>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
          <Toaster />
        </NuqsAdapter>
      </TRPCReactProvider>
    </ClerkProvider>
  );
}
