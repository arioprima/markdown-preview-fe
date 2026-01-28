"use client";

import { MarkdownFile, Group } from "@/types";
import { FileCard } from "./FileCard";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface FileGridProps {
  files: MarkdownFile[];
  groups?: Group[];
  isLoading?: boolean;
  isDraggable?: boolean;
  showGroup?: boolean;
}

export function FileGrid({
  files,
  groups = [],
  isLoading,
  isDraggable = true,
  showGroup = true,
}: FileGridProps) {
  // Helper to find group for a file
  const getGroupForFile = (file: MarkdownFile): Group | null => {
    if (!file.group_id) return null;
    return groups.find((g) => g.id === file.group_id) || null;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-[180px] w-full rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 flex items-center justify-center mb-6">
          <FileText className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No files yet</h3>
        <p className="text-muted-foreground text-center mb-6 max-w-md">
          Create your first markdown file to get started with beautiful
          documentation.
        </p>
        <Link href="/editor/new">
          <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 gap-2">
            <Plus className="h-4 w-4" />
            Create your first file
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {files.map((file) => (
        <FileCard
          key={file.id}
          file={file}
          group={getGroupForFile(file)}
          isDraggable={isDraggable}
          showGroup={showGroup}
        />
      ))}
    </div>
  );
}
