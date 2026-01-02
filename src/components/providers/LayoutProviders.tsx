"use client";

import { ReactNode, Suspense } from "react";
import dynamic from "next/dynamic";
import { ThemeProvider } from "./ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";

// Only lazy load Toaster - it's not critical for initial paint
const Toaster = dynamic(
  () =>
    import("@/components/ui/sonner").then((mod) => ({ default: mod.Toaster })),
  { ssr: false }
);

interface LayoutProvidersProps {
  children: ReactNode;
}

export function LayoutProviders({ children }: LayoutProvidersProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        {children}
        <Suspense fallback={null}>
          <Toaster richColors position="top-right" />
        </Suspense>
      </AuthProvider>
    </ThemeProvider>
  );
}
