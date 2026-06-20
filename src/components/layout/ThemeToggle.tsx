"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // next-themes baru tahu tema sebenarnya setelah mount (hindari hydration mismatch)
  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn("h-9 w-9", className)}
      title={isDark ? "Mode terang" : "Mode gelap"}
      aria-label="Ganti tema"
    >
      {mounted ? (
        isDark ? (
          <Sun className="h-5 w-5 text-yellow-500" />
        ) : (
          <Moon className="h-5 w-5 text-slate-600 dark:text-slate-300" />
        )
      ) : (
        // Placeholder transparan agar ukuran tetap & tidak mismatch saat hydration
        <Sun className="h-5 w-5 opacity-0" />
      )}
    </Button>
  );
}
