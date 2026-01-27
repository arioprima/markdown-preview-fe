"use client";

import Link from "next/link";
import { MarkdownFile, Group } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, GripVertical } from "lucide-react";
import { formatDistanceToNow } from "@/lib/utils";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

interface FileCardProps {
  file: MarkdownFile;
  group?: Group | null;
  isDraggable?: boolean;
}

export function FileCard({ file, group, isDraggable = true }: FileCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `file-${file.id}`,
      data: {
        type: "file",
        fileId: file.id,
        file: file,
      },
      disabled: !isDraggable,
    });

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 100 : undefined,
      }
    : undefined;

  const getPreview = (content: string | undefined, maxLength = 120) => {
    if (!content) return "📄 Click to view content...";
    const stripped = content.replace(/[#*`\[\]()]/g, "").trim();
    if (!stripped) return "📝 Empty document - click to edit...";
    return stripped.length > maxLength
      ? stripped.slice(0, maxLength) + "..."
      : stripped;
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // If we're clicking on the drag handle, don't navigate
    if ((e.target as HTMLElement).closest("[data-drag-handle]")) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("relative", isDragging && "opacity-50 z-50")}
    >
      {/* Drag Handle - Positioned absolutely */}
      {isDraggable && (
        <div
          data-drag-handle
          {...attributes}
          {...listeners}
          className="absolute left-2 top-4 z-10 cursor-grab active:cursor-grabbing p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4 text-slate-500" />
        </div>
      )}

      <Link href={`/editor/${file.id}`} onClick={handleCardClick}>
        <Card
          className={cn(
            "group h-full hover:shadow-lg hover:shadow-indigo-500/10 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-300 cursor-pointer bg-white dark:bg-slate-900",
            isDragging && "shadow-2xl rotate-2",
          )}
        >
          <CardHeader className="pb-3 pl-10">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 flex items-center justify-center flex-shrink-0 group-hover:from-indigo-200 group-hover:to-purple-200 dark:group-hover:from-indigo-800/50 dark:group-hover:to-purple-800/50 transition-colors">
                  <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="font-semibold text-sm truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {file.title || "Untitled"}
                </h3>
              </div>
              <div className="flex gap-1">
                {group && (
                  <Badge
                    variant="outline"
                    className="text-xs flex-shrink-0 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800"
                  >
                    {group.name}
                  </Badge>
                )}
                <Badge variant="secondary" className="text-xs flex-shrink-0">
                  .md
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground line-clamp-3 mb-4 min-h-[3.75rem]">
              {getPreview(file.content)}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>{formatDistanceToNow(file.created_at)}</span>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
