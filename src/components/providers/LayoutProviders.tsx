"use client";

import dynamic from "next/dynamic";
import { ReactNode } from "react";

// Lazy load ThemeProvider to reduce initial bundle
const ThemeProvider = dynamic(
  () =>
    import("./ThemeProvider").then((mod) => ({ default: mod.ThemeProvider })),
  { ssr: false }
);

// Lazy load AuthProvider
const AuthProvider = dynamic(
  () =>
    import("@/contexts/AuthContext").then((mod) => ({
      default: mod.AuthProvider,
    })),
  { ssr: false }
);

// Lazy load Toaster
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
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </ThemeProvider>
  );
}
