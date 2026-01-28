"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, FileText, FolderOpen, X, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { filesApi, groupsApi } from "@/lib/api";
import { MarkdownFileWithGroup, Group } from "@/types";
import { cn } from "@/lib/utils";

interface GlobalSearchProps {
  className?: string;
}

export function GlobalSearch({ className }: GlobalSearchProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MarkdownFileWithGroup[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Keyboard shortcut (Ctrl+K / Cmd+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Focus & reset
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults([]);
      setSelectedFilter(null);
      setSelectedIndex(0);
    }
  }, [open]);

  // Fetch groups
  useEffect(() => {
    groupsApi
      .getAll({ limit: 50 })
      .then((r) => setGroups(r.data))
      .catch(() => {});
  }, []);

  // Search
  const search = useCallback(async (q: string, filter: string | null) => {
    if (!q.trim() && !filter) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const params: Record<string, unknown> = {
        limit: 8,
        orderBy: "updated_at",
        order: "desc",
      };
      if (q.trim()) params.search = q.trim();
      if (filter === "ungrouped") params.ungrouped = true;
      else if (filter) params.group_id = filter;

      const res = await filesApi.getAll(
        params as Parameters<typeof filesApi.getAll>[0],
      );
      setResults(res.data as MarkdownFileWithGroup[]);
      setSelectedIndex(0);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query, selectedFilter), 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, selectedFilter, search]);

  // Keyboard nav
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      selectFile(results[selectedIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const selectFile = (file: MarkdownFileWithGroup) => {
    setOpen(false);
    router.push(`/editor/${file.id}`);
  };

  const timeAgo = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "now";
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}d`;
  };

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "flex items-center gap-3 h-10 px-4 w-full text-sm text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors",
          className,
        )}
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">Search files...</span>
        <kbd className="hidden sm:inline-flex ml-auto items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium bg-white dark:bg-slate-700 border rounded">
          ⌘K
        </kbd>
      </button>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden !rounded-xl">
          <VisuallyHidden>
            <DialogTitle>Search</DialogTitle>
          </VisuallyHidden>

          {/* Input */}
          <div className="flex items-center gap-3 px-4 h-14 border-b">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
            ) : (
              <Search className="h-4 w-4 text-slate-400" />
            )}
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Search files..."
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-slate-400"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
              >
                <X className="h-4 w-4 text-slate-400" />
              </button>
            )}
          </div>

          {/* Filters */}
          {query && (
            <div className="flex gap-1.5 px-4 py-2 border-b overflow-x-auto">
              <FilterChip
                active={selectedFilter === null}
                onClick={() => setSelectedFilter(null)}
              >
                All
              </FilterChip>
              <FilterChip
                active={selectedFilter === "ungrouped"}
                onClick={() => setSelectedFilter("ungrouped")}
              >
                Ungrouped
              </FilterChip>
              {groups.map((g) => (
                <FilterChip
                  key={g.id}
                  active={selectedFilter === g.id}
                  onClick={() => setSelectedFilter(g.id)}
                >
                  {g.name}
                </FilterChip>
              ))}
            </div>
          )}

          {/* Results */}
          <div className="max-h-72 overflow-y-auto">
            {results.length > 0 ? (
              <div className="py-1">
                {results.map((file, i) => (
                  <button
                    key={file.id}
                    onClick={() => selectFile(file)}
                    onMouseEnter={() => setSelectedIndex(i)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                      i === selectedIndex
                        ? "bg-indigo-50 dark:bg-indigo-950/40"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/50",
                    )}
                  >
                    <FileText
                      className={cn(
                        "h-4 w-4 shrink-0",
                        i === selectedIndex
                          ? "text-indigo-500"
                          : "text-slate-400",
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div
                        className={cn(
                          "text-sm font-medium truncate",
                          i === selectedIndex &&
                            "text-indigo-600 dark:text-indigo-400",
                        )}
                      >
                        {file.title || "Untitled"}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        {file.group ? (
                          <span className="flex items-center gap-1">
                            <FolderOpen className="h-3 w-3" />
                            {file.group.name}
                          </span>
                        ) : (
                          <span>No group</span>
                        )}
                        <span>·</span>
                        <span>{timeAgo(file.updated_at)}</span>
                      </div>
                    </div>
                    {i === selectedIndex && (
                      <span className="text-xs text-slate-400">↵</span>
                    )}
                  </button>
                ))}
              </div>
            ) : query && !loading ? (
              <div className="py-12 text-center text-sm text-slate-400">
                No results found
              </div>
            ) : !query ? (
              <div className="py-12 text-center text-sm text-slate-400">
                Type to search...
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-4 px-4 py-2 border-t text-xs text-slate-400 bg-slate-50 dark:bg-slate-900">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-white dark:bg-slate-800 border rounded text-[10px]">
                ↑↓
              </kbd>
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-white dark:bg-slate-800 border rounded text-[10px]">
                ↵
              </kbd>
              open
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-white dark:bg-slate-800 border rounded text-[10px]">
                esc
              </kbd>
              close
            </span>
            {results.length > 0 && (
              <span className="ml-auto">{results.length} results</span>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function FilterChip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors",
        active
          ? "bg-indigo-500 text-white"
          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700",
      )}
    >
      {children}
    </button>
  );
}
