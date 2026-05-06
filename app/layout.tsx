import type { Metadata, Viewport } from "next";
import {
  IBM_Plex_Mono,
  Instrument_Sans,
  Newsreader,
} from "next/font/google";

import { PwaRegister } from "@/components/pwa/pwa-register";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const instrumentSans = Instrument_Sans({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-sans",
});

const newsreader = Newsreader({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-serif",
});

const ibmPlexMono = IBM_Plex_Mono({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  applicationName: "Rythm",
  title: {
    default: "Rythm",
    template: "%s | Rythm",
  },
  description:
    "Rythm is a focused life rhythm tracker for recurring tasks, streaks, and simple daily structure.",
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
      color: "hsl(214 28% 97%)",
    },
    {
      media: "(prefers-color-scheme: dark)",
      color: "hsl(222 24% 12%)",
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
      <body
        className={`${instrumentSans.variable} ${newsreader.variable} ${ibmPlexMono.variable} min-h-screen bg-background font-sans text-foreground antialiased`}
      >
        <PwaRegister />
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  );
}
