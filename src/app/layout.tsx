import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: { default: "Mindora — AI Mental Wellness", template: "%s | Mindora" },
  description:
    "Mindora is your compassionate AI-powered mental wellness companion. Track moods, journal, and chat with Mira — your empathetic AI therapist.",
  keywords: ["mental health", "mood tracker", "AI therapy", "wellness", "journaling"],
  authors: [{ name: "Mindora" }],
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: "Mindora — AI Mental Wellness",
    description: "Your compassionate AI-powered mental wellness companion.",
    siteName: "Mindora",
  },
};

export const viewport: Viewport = {
  themeColor: "#6366f1",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
