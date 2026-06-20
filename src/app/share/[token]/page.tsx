"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MarkdownPreview } from "@/components/editor/MarkdownPreview";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { shareApi } from "@/lib/api";
import { SharedFile } from "@/types";
import { FileText, FileX2 } from "lucide-react";

export default function SharedFilePage() {
  const params = useParams();
  const token = params?.token as string;

  const [file, setFile] = useState<SharedFile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!token) return;

    (async () => {
      try {
        const res = await shareApi.getShared(token);
        if (!cancelled) {
          setFile(res.data);
          setError(false);
        }
      } catch (e) {
        console.error("Failed to load shared file:", e);
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <header className="h-14 md:h-16 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm md:text-base truncate">
              {file?.title || (isLoading ? "Memuat…" : "Dokumen Dibagikan")}
            </p>
            {file?.username && (
              <p className="text-xs text-muted-foreground truncate">
                oleh {file.username}
              </p>
            )}
          </div>
        </div>

        <ThemeToggle className="shrink-0" />
      </header>

      {/* Content */}
      <main className="flex-1">
        {isLoading ? (
          <div className="max-w-3xl mx-auto px-6 py-12 space-y-4">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-64 w-full mt-8" />
          </div>
        ) : error || !file ? (
          <div className="flex flex-col items-center justify-center py-32 px-6 text-center">
            <div className="w-16 h-16 mb-6 rounded-2xl bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center border border-slate-200 dark:border-slate-800">
              <FileX2 className="w-8 h-8 text-slate-400" />
            </div>
            <h1 className="text-xl font-semibold mb-2">
              Dokumen tidak ditemukan
            </h1>
            <p className="text-muted-foreground max-w-md mb-6">
              Tautan ini mungkin salah, atau pemiliknya telah menonaktifkan
              berbagi untuk dokumen ini.
            </p>
            <Link href="/">
              <Button variant="outline">Kembali ke beranda</Button>
            </Link>
          </div>
        ) : (
          <MarkdownPreview content={file.content} />
        )}
      </main>

      {/* Footer */}
      {!isLoading && !error && file && (
        <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-muted-foreground">
          Dibuat dengan{" "}
          <Link href="/" className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            MD Preview
          </Link>
        </footer>
      )}
    </div>
  );
}
