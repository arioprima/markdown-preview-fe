"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  Code,
  CodeSquare,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Minus,
  Image,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolbarProps {
  onAction: (
    action: string,
    wrapper?: { before: string; after: string }
  ) => void;
  className?: string;
}

const toolbarItems = [
  {
    group: "format",
    items: [
      {
        icon: Bold,
        label: "Bold (Ctrl+B)",
        action: "bold",
        before: "**",
        after: "**",
      },
      {
        icon: Italic,
        label: "Italic (Ctrl+I)",
        action: "italic",
        before: "_",
        after: "_",
      },
    ],
  },
  {
    group: "heading",
    items: [
      {
        icon: Heading1,
        label: "Heading 1",
        action: "h1",
        before: "# ",
        after: "",
      },
      {
        icon: Heading2,
        label: "Heading 2",
        action: "h2",
        before: "## ",
        after: "",
      },
      {
        icon: Heading3,
        label: "Heading 3",
        action: "h3",
        before: "### ",
        after: "",
      },
    ],
  },
  {
    group: "code",
    items: [
      {
        icon: Code,
        label: "Inline Code",
        action: "code",
        before: "`",
        after: "`",
      },
      {
        icon: CodeSquare,
        label: "Code Block",
        action: "codeblock",
        before: "```\n",
        after: "\n```",
      },
    ],
  },
  {
    group: "list",
    items: [
      {
        icon: List,
        label: "Bullet List",
        action: "bullet",
        before: "- ",
        after: "",
      },
      {
        icon: ListOrdered,
        label: "Numbered List",
        action: "numbered",
        before: "1. ",
        after: "",
      },
    ],
  },
  {
    group: "insert",
    items: [
      {
        icon: LinkIcon,
        label: "Link",
        action: "link",
        before: "[",
        after: "](url)",
      },
      {
        icon: Image,
        label: "Image",
        action: "image",
        before: "![alt](",
        after: ")",
      },
      { icon: Quote, label: "Quote", action: "quote", before: "> ", after: "" },
      {
        icon: Minus,
        label: "Horizontal Rule",
        action: "hr",
        before: "\n---\n",
        after: "",
      },
    ],
  },
];

export function Toolbar({ onAction, className }: ToolbarProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 p-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex-wrap",
        className
      )}
    >
      {toolbarItems.map((group, groupIndex) => (
        <div key={group.group} className="flex items-center">
          {groupIndex > 0 && (
            <Separator orientation="vertical" className="mx-1 h-6" />
          )}
          <div className="flex items-center gap-0.5">
            {group.items.map((item) => (
              <Button
                key={item.action}
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-slate-200 dark:hover:bg-slate-800"
                onClick={() =>
                  onAction(item.action, {
                    before: item.before,
                    after: item.after,
                  })
                }
                title={item.label}
              >
                <item.icon className="h-4 w-4" />
              </Button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
