import "@/styles/globals.css";
import { cn } from "@tabos/ui/cn";
import "@tabos/ui/globals.css";
import { TRPCReactProvider } from "@/trpc/client";
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Toaster } from "@tabos/ui/toaster";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { Lora } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactElement } from "react";
import { Providers } from "./providers";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "TabOS",
};

const lora = Lora({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)" },
    { media: "(prefers-color-scheme: dark)" },
  ],
};

export default async function Layout({
  children,
}: {
  children: ReactElement;
  params: Promise<{ locale: string }>;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }
  return (
    <ClerkProvider>
      <TRPCReactProvider>
        <html suppressHydrationWarning>
          <body
            className={cn(
              `${GeistSans.variable} ${GeistMono.variable} ${lora.variable} font-sans`,
              "whitespace-pre-line overscroll-none antialiased",
            )}
          >
            <header className="flex justify-end items-center p-4 gap-4 h-16">
              <SignedOut>
                <SignInButton />
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </header>
            <NuqsAdapter>
              <Providers>{children}</Providers>
              <Toaster />
            </NuqsAdapter>
          </body>
        </html>
      </TRPCReactProvider>
    </ClerkProvider>
  );
}
