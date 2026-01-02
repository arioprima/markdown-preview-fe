import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LayoutProviders } from "@/components/providers/LayoutProviders";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MD Preview - Modern Markdown Editor",
  description:
    "Create and preview beautiful markdown documents with real-time live preview",
  keywords: ["markdown", "editor", "preview", "documentation", "notes"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to API domain for faster connections */}
        <link rel="preconnect" href="https://api-readme.kayacodelab.com" />
        <link rel="dns-prefetch" href="https://api-readme.kayacodelab.com" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LayoutProviders>{children}</LayoutProviders>
      </body>
    </html>
  );
}
