import "@tabos/ui/globals.css";
import { cn } from "@tabos/ui/cn";

import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { Lora } from "next/font/google";

import type { ReactElement } from "react";
import ClientProvider from "./ClientProvider";

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
  return (
    <html suppressHydrationWarning>
      <body
        className={cn(
          `${GeistSans.variable} ${GeistMono.variable} ${lora.variable} font-sans`,
          "whitespace-pre-line overscroll-none antialiased"
        )}
      >
        {children}
      </body>
    </html>
  );
}
