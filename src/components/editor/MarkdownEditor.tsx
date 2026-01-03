"use client";

import { useRef, useCallback, forwardRef, useImperativeHandle } from "react";
import { Toolbar } from "./Toolbar";
import { cn } from "@/lib/utils";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export interface MarkdownEditorRef {
  focus: () => void;
}

export const MarkdownEditor = forwardRef<
  MarkdownEditorRef,
  MarkdownEditorProps
>(function MarkdownEditor({ value, onChange, className }, ref) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => textareaRef.current?.focus(),
  }));

  // No auto-resize - use fixed height with scroll for independent scrolling

  const handleToolbarAction = useCallback(
    (action: string, wrapper?: { before: string; after: string }) => {
      const textarea = textareaRef.current;
      if (!textarea || !wrapper) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.substring(start, end);

      const newText =
        value.substring(0, start) +
        wrapper.before +
        (selectedText || "text") +
        wrapper.after +
        value.substring(end);

      onChange(newText);

      // Restore cursor position
      setTimeout(() => {
        const newStart = start + wrapper.before.length;
        const newEnd = newStart + (selectedText || "text").length;
        textarea.focus();
        textarea.setSelectionRange(newStart, newEnd);
      }, 0);
    },
    [value, onChange]
  );

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case "b":
            e.preventDefault();
            handleToolbarAction("bold", { before: "**", after: "**" });
            break;
          case "i":
            e.preventDefault();
            handleToolbarAction("italic", { before: "_", after: "_" });
            break;
          case "k":
            e.preventDefault();
            handleToolbarAction("link", { before: "[", after: "](url)" });
            break;
        }
      }

      // Handle Tab for indentation
      if (e.key === "Tab") {
        e.preventDefault();
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        const newValue =
          value.substring(0, start) + "  " + value.substring(end);
        onChange(newValue);

        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2;
        }, 0);
      }
    },
    [value, onChange, handleToolbarAction]
  );

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <Toolbar onAction={handleToolbarAction} />
      <div className="flex-1 relative bg-white dark:bg-slate-950 overflow-hidden">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full h-full min-h-[400px] p-4 resize-none focus:outline-none bg-transparent font-mono text-sm leading-relaxed placeholder:text-muted-foreground overflow-y-auto overscroll-contain"
          placeholder="Start writing your markdown here..."
          spellCheck={false}
        />
      </div>
    </div>
  );
});
