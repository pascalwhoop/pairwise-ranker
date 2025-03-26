// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner"; // Use Sonner

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Pairwise Ranker",
  description: "Rank items using pairwise comparisons",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        // Force light theme by removing dark class logic if needed,
        // or configure theme provider if you want toggling later
        className={cn(
          "min-h-screen bg-background font-sans antialiased light", // Added 'light' class explicitly
          inter.variable
        )}
      >
        {children}
        <Toaster richColors /> {/* Use Sonner's Toaster */}
      </body>
    </html>
  );
}