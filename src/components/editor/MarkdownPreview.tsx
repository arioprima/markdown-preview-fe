"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { cn } from "@/lib/utils";

// --- KOMPONEN CAROUSEL ---
const SimpleCarousel = ({ content }: { content: string }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Split berdasarkan <!-- slide -->
  const slides = content
    .split(/<!--\s*slide\s*-->/i)
    .map((s) => s.trim())
    .filter(Boolean);

  if (slides.length === 0) {
    return (
      <div className="p-4 bg-amber-50 text-amber-700 rounded-md border border-amber-200 text-sm">
        ⚠️ Carousel kosong. Gunakan <code>&lt;!-- slide --&gt;</code> untuk
        memisahkan slide.
      </div>
    );
  }

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="my-4 md:my-6 w-full border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
      {/* Slide Content */}
      <div className="p-3 md:p-6 bg-slate-50 dark:bg-slate-800 min-h-[250px] md:min-h-[400px]">
        <div className="prose prose-sm md:prose-base prose-slate dark:prose-invert max-w-none prose-pre:my-0 prose-code:bg-slate-100 dark:prose-code:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-normal prose-code:before:content-none prose-code:after:content-none prose-pre:bg-slate-900 prose-pre:text-slate-50 prose-pre:rounded-lg prose-pre:p-3 md:prose-pre:p-4 [&_pre_code]:bg-transparent dark:[&_pre_code]:bg-transparent [&_pre_code]:p-0 prose-pre:overflow-x-auto">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
          >
            {slides[currentSlide]}
          </ReactMarkdown>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between px-3 md:px-6 py-2 md:py-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={prevSlide}
          disabled={slides.length <= 1}
          className="group flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:border-indigo-400 dark:hover:border-indigo-600 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
        >
          <svg
            className="w-4 h-4 text-slate-600 dark:text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="hidden sm:inline text-sm font-medium text-slate-700 dark:text-slate-300">
            Previous
          </span>
        </button>

        <div className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs md:text-sm font-semibold text-indigo-600 dark:text-indigo-400">
            {currentSlide + 1}
          </span>
          <span className="text-xs md:text-sm text-slate-400 dark:text-slate-600">
            /
          </span>
          <span className="text-xs md:text-sm font-medium text-slate-600 dark:text-slate-400">
            {slides.length}
          </span>
        </div>

        <button
          onClick={nextSlide}
          disabled={slides.length <= 1}
          className="group flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:border-indigo-400 dark:hover:border-indigo-600 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
        >
          <span className="hidden sm:inline text-sm font-medium text-slate-700 dark:text-slate-300">
            Next
          </span>
          <svg
            className="w-4 h-4 text-slate-600 dark:text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

// --- KOMPONEN UTAMA ---
interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export function MarkdownPreview({ content, className }: MarkdownPreviewProps) {
  return (
    <div
      className={cn(
        // Base responsive prose styles
        "prose prose-sm md:prose-base lg:prose-lg prose-slate dark:prose-invert",
        "max-w-none w-full",
        "p-3 md:p-6 lg:p-8",

        // Prevent overflow
        "overflow-x-hidden overflow-y-auto",
        "[overflow-wrap:break-word] [word-wrap:break-word]",

        // Headings - responsive
        "prose-headings:font-bold",
        "prose-h1:text-xl md:prose-h1:text-2xl lg:prose-h1:text-4xl",
        "prose-h1:mb-3 md:prose-h1:mb-6 prose-h1:mt-4 md:prose-h1:mt-8",
        "prose-h1:border-b prose-h1:pb-2 md:prose-h1:pb-3 prose-h1:border-slate-200 dark:prose-h1:border-slate-800",
        "prose-h2:text-lg md:prose-h2:text-xl lg:prose-h2:text-3xl prose-h2:mb-2 md:prose-h2:mb-4 prose-h2:mt-6 md:prose-h2:mt-10",
        "prose-h3:text-base md:prose-h3:text-lg lg:prose-h3:text-2xl prose-h3:mb-2 md:prose-h3:mb-3 prose-h3:mt-4 md:prose-h3:mt-8",

        // Paragraphs
        "prose-p:mb-3 md:prose-p:mb-6 prose-p:leading-relaxed prose-p:text-slate-700 dark:prose-p:text-slate-300",
        "prose-ul:my-3 md:prose-ul:my-6 prose-ol:my-3 md:prose-ol:my-6",
        "prose-li:my-1 md:prose-li:my-2",

        // Links
        "prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline",
        "prose-a:break-words",

        // Inline code
        "prose-code:bg-slate-100 dark:prose-code:bg-slate-800",
        "prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs md:prose-code:text-sm",
        "prose-code:before:content-none prose-code:after:content-none",
        "prose-code:text-indigo-600 dark:prose-code:text-indigo-400",
        "prose-code:break-words",

        // Code blocks (pre) - horizontal scroll inside
        "prose-pre:bg-[#1a1b26] dark:prose-pre:bg-[#1a1b26]",
        "prose-pre:text-slate-50 prose-pre:rounded-lg",
        "prose-pre:p-3 md:prose-pre:p-4 lg:prose-pre:p-6",
        "prose-pre:my-3 md:prose-pre:my-6",
        "prose-pre:overflow-x-auto prose-pre:max-w-full",
        "prose-pre:shadow-lg md:prose-pre:shadow-2xl",
        "prose-pre:border prose-pre:border-slate-800",
        "[&_pre_code]:bg-transparent dark:[&_pre_code]:bg-transparent",
        "[&_pre_code]:p-0 [&_pre_code]:text-xs md:[&_pre_code]:text-sm",
        "[&_pre_code]:whitespace-pre",

        // Blockquotes
        "prose-blockquote:border-l-4 prose-blockquote:border-indigo-500",
        "prose-blockquote:bg-slate-50 dark:prose-blockquote:bg-slate-900",
        "prose-blockquote:py-1 prose-blockquote:px-3 md:prose-blockquote:px-4",
        "prose-blockquote:my-3 md:prose-blockquote:my-6 prose-blockquote:italic",

        // Tables - horizontal scroll
        "prose-table:my-3 md:prose-table:my-8",
        "prose-table:block prose-table:overflow-x-auto prose-table:w-full",
        "prose-thead:bg-slate-100 dark:prose-thead:bg-slate-800",
        "prose-th:p-2 md:prose-th:p-3 prose-td:p-2 md:prose-td:p-3",
        "prose-th:text-xs md:prose-th:text-sm prose-td:text-xs md:prose-td:text-sm",

        // Strong
        "prose-strong:font-bold prose-strong:text-slate-900 dark:prose-strong:text-slate-100",

        // Images
        "prose-img:max-w-full prose-img:h-auto prose-img:rounded-lg",

        className
      )}
    >
      {content ? (
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={{
            code({ node, inline, className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || "");
              const lang = match ? match[1] : "";

              if (!inline && lang === "carousel") {
                return (
                  <SimpleCarousel
                    content={String(children).replace(/\n$/, "")}
                  />
                );
              }

              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      ) : (
        <p className="text-muted-foreground italic">
          Start typing to see the preview...
        </p>
      )}
    </div>
  );
}
