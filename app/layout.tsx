import type { Metadata, Viewport } from "next";

import { PwaRegister } from "@/components/pwa/pwa-register";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

export const metadata: Metadata = {
  applicationName: "Rythm",
  title: {
    default: "Rythm",
    template: "%s | Rythm",
  },
  description:
    "Rythm is a focused life rhythm tracker for recurring quests, streaks, and simple daily structure.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Rythm",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    {
      media: "(prefers-color-scheme: light)",
      color: "#ffffff",
    },
    {
      media: "(prefers-color-scheme: dark)",
      color: "#111111",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <PwaRegister />
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  );
}
