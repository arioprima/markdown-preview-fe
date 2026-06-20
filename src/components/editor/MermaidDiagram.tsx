"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { AlertTriangle } from "lucide-react";

interface MermaidDiagramProps {
  chart: string;
}

/**
 * Render Mermaid diagrams (flowchart, sequence, gantt, pie, class, dll).
 * Mermaid butuh DOM, jadi di-import dinamis & dirender di useEffect (client only).
 * securityLevel "strict" mencegah eksekusi script dari konten diagram —
 * penting karena konten bisa berasal dari dokumen yang dibagikan publik.
 */
export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const [error, setError] = useState<string | null>(null);

  // ID stabil & unik per instance untuk render mermaid
  const rawId = useId();
  const renderId = `mermaid-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;

  useEffect(() => {
    let cancelled = false;
    const code = chart.trim();

    if (!code) {
      setError(null);
      if (containerRef.current) containerRef.current.innerHTML = "";
      return;
    }

    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: resolvedTheme === "dark" ? "dark" : "default",
          fontFamily: "inherit",
        });

        // mermaid.render melempar error kalau sintaks tidak valid
        const { svg } = await mermaid.render(renderId, code);

        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Gagal merender diagram");
          if (containerRef.current) containerRef.current.innerHTML = "";
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chart, resolvedTheme, renderId]);

  if (error) {
    return (
      <div className="not-prose my-6 p-4 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-900/50 text-sm">
        <div className="flex items-center gap-2 font-semibold mb-2">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          Diagram tidak valid
        </div>
        <pre className="whitespace-pre-wrap break-words opacity-90 text-xs font-mono">
          {error}
        </pre>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="not-prose my-6 flex justify-center overflow-x-auto [&_svg]:max-w-full [&_svg]:h-auto"
    />
  );
}
