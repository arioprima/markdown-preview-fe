"use client";

import Link from "next/link";
import { MarkdownFile } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar } from "lucide-react";
import { formatDistanceToNow } from "@/lib/utils";

interface FileCardProps {
  file: MarkdownFile;
}

export function FileCard({ file }: FileCardProps) {
  const getPreview = (content: string | undefined, maxLength = 120) => {
    if (!content) return "📄 Click to view content...";
    const stripped = content.replace(/[#*`\[\]()]/g, "").trim();
    if (!stripped) return "📝 Empty document - click to edit...";
    return stripped.length > maxLength
      ? stripped.slice(0, maxLength) + "..."
      : stripped;
  };

  return (
    <Link href={`/editor/${file.id}`}>
      <Card className="group h-full hover:shadow-lg hover:shadow-indigo-500/10 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-300 cursor-pointer bg-white dark:bg-slate-900">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 flex items-center justify-center flex-shrink-0 group-hover:from-indigo-200 group-hover:to-purple-200 dark:group-hover:from-indigo-800/50 dark:group-hover:to-purple-800/50 transition-colors">
                <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="font-semibold text-sm truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {file.title || "Untitled"}
              </h3>
            </div>
            <Badge variant="secondary" className="text-xs flex-shrink-0">
              .md
            </Badge>
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
  );
}
