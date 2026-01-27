"use client";

import { useState, useEffect } from "react";
import { Group, MarkdownFile } from "@/types";
import { GroupCard } from "./GroupCard";
import { Button } from "@/components/ui/button";
import { Plus, FolderOpen, Files } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useDroppable } from "@dnd-kit/core";

interface GroupListProps {
  groups: Group[];
  files: MarkdownFile[];
  isLoading?: boolean;
  selectedGroupId: string | null;
  onSelectGroup: (groupId: string | null) => void;
  onCreateGroup: () => void;
  onUpdateGroup: (id: string, name: string) => void;
  onDeleteGroup: (id: string) => void;
}

export function GroupList({
  groups,
  files,
  isLoading,
  selectedGroupId,
  onSelectGroup,
  onCreateGroup,
  onUpdateGroup,
  onDeleteGroup,
}: GroupListProps) {
  // Calculate file count for each group
  const getFileCount = (groupId: string) => {
    return files.filter((f) => f.group_id === groupId).length;
  };

  const ungroupedCount = files.filter((f) => !f.group_id).length;

  // Droppable for "Ungrouped" area
  const { isOver: isOverUngrouped, setNodeRef: setUngroupedRef } = useDroppable(
    {
      id: "group-ungrouped",
      data: {
        type: "group",
        groupId: null,
      },
    },
  );

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Create Group Button */}
      <Button
        variant="outline"
        className="w-full justify-start gap-2 border-dashed"
        onClick={onCreateGroup}
      >
        <Plus className="h-4 w-4" />
        Create Group
      </Button>

      {/* All Files Button */}
      <Button
        variant={selectedGroupId === null ? "secondary" : "ghost"}
        className={cn(
          "w-full justify-start gap-3 h-12",
          selectedGroupId === null && "bg-slate-100 dark:bg-slate-800",
        )}
        onClick={() => onSelectGroup(null)}
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
          <Files className="h-4 w-4 text-slate-600 dark:text-slate-400" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-medium">All Files</p>
          <p className="text-xs text-muted-foreground">{files.length} files</p>
        </div>
      </Button>

      {/* Ungrouped Files (Droppable) */}
      <div
        ref={setUngroupedRef}
        className={cn(
          "rounded-lg border transition-all duration-200 cursor-pointer",
          selectedGroupId === "ungrouped"
            ? "ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200"
            : "border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800",
          isOverUngrouped &&
            "ring-2 ring-green-500 bg-green-50 dark:bg-green-950/30",
        )}
        onClick={() => onSelectGroup("ungrouped")}
      >
        <div className="p-3 flex items-center gap-3">
          <div
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              selectedGroupId === "ungrouped"
                ? "bg-indigo-500 text-white"
                : "bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50",
            )}
          >
            <FolderOpen
              className={cn(
                "h-4 w-4",
                selectedGroupId !== "ungrouped" &&
                  "text-amber-600 dark:text-amber-400",
              )}
            />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Ungrouped</p>
            <p className="text-xs text-muted-foreground">
              {ungroupedCount} files
            </p>
          </div>
        </div>
      </div>

      {/* Group Cards */}
      {groups.length > 0 && (
        <div className="space-y-0.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2">
            Groups
          </p>
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              isActive={selectedGroupId === group.id}
              onSelect={onSelectGroup}
              onUpdate={onUpdateGroup}
              onDelete={onDeleteGroup}
              fileCount={getFileCount(group.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
