"use client";

import React, { useState } from "react";
import ReactMarkdown, { type ExtraProps } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "@/lib/utils";
import { MermaidDiagram } from "./MermaidDiagram";
import {
  Check,
  Copy,
  Info,
  Lightbulb,
  AlertTriangle,
  AlertCircle,
  Flame,
} from "lucide-react";

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
      <div className="p-4 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 rounded-lg border border-amber-200 dark:border-amber-900/50 text-sm flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 shrink-0" />
        <div>
          <p className="font-semibold mb-1">Carousel kosong</p>
          <p className="opacity-90">
            Gunakan <code>&lt;!-- slide --&gt;</code> untuk memisahkan slide.
          </p>
        </div>
      </div>
    );
  }

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="my-8 w-full border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-950 shadow-sm">
      {/* Slide Content */}
      <div className="p-6 md:p-8 bg-white dark:bg-slate-950 min-h-[300px] flex items-center justify-center">
        <div className="w-full prose prose-slate dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
          >
            {slides[currentSlide]}
          </ReactMarkdown>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={prevSlide}
          disabled={slides.length <= 1}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium text-slate-700 dark:text-slate-200"
        >
          <svg
            className="w-4 h-4"
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
          <span className="hidden sm:inline">Previous</span>
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-200/50 dark:bg-slate-800/50 text-sm font-medium text-slate-600 dark:text-slate-400">
          <span>{currentSlide + 1}</span>
          <span className="text-slate-400 dark:text-slate-500">/</span>
          <span>{slides.length}</span>
        </div>

        <button
          onClick={nextSlide}
          disabled={slides.length <= 1}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium text-slate-700 dark:text-slate-200"
        >
          <span className="hidden sm:inline">Next</span>
          <svg
            className="w-4 h-4"
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

// --- KOMPONEN CODE BLOCK ---
const CodeBlock = ({
  lang,
  children,
}: {
  lang: string;
  children: React.ReactNode;
}) => {
  const [copied, setCopied] = useState(false);
  const content = String(children).replace(/\n$/, "");

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (lang === "carousel") {
    return <SimpleCarousel content={content} />;
  }

  if (lang === "mermaid") {
    return <MermaidDiagram chart={content} />;
  }

  return (
    <div className="not-prose relative my-6 rounded-xl overflow-hidden bg-[#0d1117] border border-slate-800 shadow-sm group">
      {/* Header Panel */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#161b22] border-b border-slate-800/80 select-none">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-slate-700/50" />
            <div className="w-3 h-3 rounded-full bg-slate-700/50" />
            <div className="w-3 h-3 rounded-full bg-slate-700/50" />
          </div>
          <span className="ml-2 text-xs font-medium font-mono text-slate-400">
            {lang === "text" ? "" : lang}
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-all bg-white/5 hover:bg-white/10 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 focus:opacity-100"
          title="Copy code"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
          {copied ? <span className="text-emerald-400">Copied</span> : "Copy"}
        </button>
      </div>

      {/* Code Area */}
      <div className="overflow-x-auto text-[14px] leading-relaxed">
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={lang === "text" ? "text" : lang}
          PreTag="div"
          customStyle={{
            margin: 0,
            padding: "1.25rem 1.5rem",
            background: "transparent",
            fontSize: "inherit",
          }}
          codeTagProps={{
            style: {
              fontFamily:
                'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
            },
          }}
        >
          {content}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

// --- KOMPONEN ALERT BLOCKQUOTE ---
const AlertBlockquote = ({
  children,
  className,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  node: _node, // Destructure and ignore to avoid React warning
  ...props
}: React.ComponentPropsWithoutRef<"blockquote"> & { node?: unknown }) => {
  const childrenArray = React.Children.toArray(children);

  // Cari elemen <p> pertama
  const firstChild = childrenArray.find(
    (child): child is React.ReactElement<{ children?: React.ReactNode }> =>
      React.isValidElement(child) && child.type === "p",
  );

  if (firstChild && firstChild.props && firstChild.props.children) {
    const textContent = Array.isArray(firstChild.props.children)
      ? firstChild.props.children[0]
      : firstChild.props.children;

    if (typeof textContent === "string") {
      const match = textContent.match(
        /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i,
      );

      if (match) {
        const type = match[1].toUpperCase();

        let Icon = Info;
        let colors = "";
        const title = type.charAt(0) + type.slice(1).toLowerCase();

        switch (type) {
          case "NOTE":
            Icon = Info;
            colors =
              "border-blue-500/50 bg-blue-50/50 text-blue-900 dark:bg-blue-950/20 dark:text-blue-200 dark:border-blue-500/30";
            break;
          case "TIP":
            Icon = Lightbulb;
            colors =
              "border-emerald-500/50 bg-emerald-50/50 text-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-200 dark:border-emerald-500/30";
            break;
          case "IMPORTANT":
            Icon = AlertCircle;
            colors =
              "border-indigo-500/50 bg-indigo-50/50 text-indigo-900 dark:bg-indigo-950/20 dark:text-indigo-200 dark:border-indigo-500/30";
            break;
          case "WARNING":
            Icon = AlertTriangle;
            colors =
              "border-amber-500/50 bg-amber-50/50 text-amber-900 dark:bg-amber-950/20 dark:text-amber-200 dark:border-amber-500/30";
            break;
          case "CAUTION":
            Icon = Flame;
            colors =
              "border-red-500/50 bg-red-50/50 text-red-900 dark:bg-red-950/20 dark:text-red-200 dark:border-red-500/30";
            break;
        }

        // Hapus marker [!TYPE]
        const modifiedFirstChild = React.cloneElement(firstChild, {
          ...firstChild.props,
          children: Array.isArray(firstChild.props.children)
            ? [
                textContent.replace(
                  /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i,
                  "",
                ),
                ...firstChild.props.children.slice(1),
              ]
            : textContent.replace(
                /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i,
                "",
              ),
        });

        const modifiedChildren = childrenArray.map((child) =>
          child === firstChild ? modifiedFirstChild : child,
        );

        return (
          <div
            className={cn(
              "my-6 border-l-4 p-4 md:p-5 rounded-r-xl shadow-sm",
              colors,
            )}
          >
            <div className="flex items-center gap-2 font-semibold mb-2">
              <Icon className="w-5 h-5" />
              {title}
            </div>
            <div className="[&>p]:m-0 [&>p]:leading-relaxed opacity-90 text-[0.95em]">
              {modifiedChildren}
            </div>
          </div>
        );
      }
    }
  }

  // Fallback ke blockquote normal
  return (
    <blockquote
      className={cn(
        "border-l-4 border-slate-300 dark:border-slate-700",
        "bg-slate-50 dark:bg-slate-800/30",
        "py-2 px-5 my-6",
        "italic text-slate-700 dark:text-slate-300 rounded-r-lg",
        className,
      )}
      {...props}
    >
      {children}
    </blockquote>
  );
};

// --- FUNGSI GENERATE SLUG UNTUK HEADING ID ---
const generateSlug = (children: React.ReactNode): string => {
  const text = React.Children.toArray(children).reduce((acc, child) => {
    if (typeof child === "string") return acc + child;
    if (React.isValidElement(child)) {
      const childProps = child.props as { children?: React.ReactNode };
      if (childProps.children) {
        return acc + generateSlug(childProps.children);
      }
    }
    return acc;
  }, "");

  return String(text)
    .toLowerCase()
    .replace(/\s+/g, "-")           // Ganti spasi dengan hyphen
    .replace(/[^\w\-]+/g, "")       // Hapus karakter non-alphanumeric (seperti emoji)
    .replace(/\-\-+/g, "-");        // Cegah hyphen ganda
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
        // Typography defaults
        "prose prose-slate dark:prose-invert",

        // UX: Width & Centering for readability
        "w-full max-w-3xl mx-auto",

        // Base styling & breathing room
        "px-6 py-8 md:py-12 lg:py-16",
        "text-slate-800 dark:text-slate-200 leading-loose",
        "break-words antialiased",

        // Premium text selection
        "selection:bg-indigo-100 selection:text-indigo-900 dark:selection:bg-indigo-900/40 dark:selection:text-indigo-100",

        // Headings - styling modern
        "prose-headings:font-bold prose-headings:tracking-tight",
        "prose-h1:text-4xl md:prose-h1:text-5xl prose-h1:border-b prose-h1:border-slate-200 dark:prose-h1:border-slate-800 prose-h1:pb-4 prose-h1:mb-8",
        "prose-h2:text-2xl md:prose-h2:text-3xl prose-h2:border-b prose-h2:border-slate-200/60 dark:prose-h2:border-slate-800/60 prose-h2:pb-2 prose-h2:mt-12 prose-h2:mb-6",
        "prose-h3:text-xl md:prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4",
        "prose-h4:text-lg md:prose-h4:text-xl",

        // Links
        "prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-a:font-medium prose-a:underline prose-a:underline-offset-[3px] prose-a:decoration-indigo-600/30 hover:prose-a:decoration-indigo-600 transition-colors",

        // Lists
        "prose-ul:list-disc prose-ol:list-decimal",
        "prose-li:marker:text-slate-400 dark:prose-li:marker:text-slate-500",
        "prose-li:my-2",

        // UX: Checkboxes (Task Lists)
        // Checkbox styling fix: uses Tailwind forms reset naturally + custom coloring
        "prose-input:rounded-sm prose-input:border-slate-300 dark:prose-input:border-slate-600 prose-input:text-indigo-600 focus:prose-input:ring-indigo-600 prose-input:w-4 prose-input:h-4 prose-input:-mt-1 prose-input:align-middle prose-input:cursor-pointer",
        "[&_li.task-list-item]:list-none [&_li.task-list-item]:pl-0 [&_ul.contains-task-list]:pl-5",

        // Tables
        "prose-table:w-full prose-table:overflow-hidden prose-table:rounded-xl prose-table:border prose-table:border-slate-200 dark:prose-table:border-slate-800 prose-table:shadow-sm",
        "prose-thead:bg-slate-50/80 dark:prose-thead:bg-slate-800/50",
        "prose-th:px-5 prose-th:py-4 prose-th:text-left prose-th:font-semibold prose-th:text-slate-900 dark:prose-th:text-slate-100",
        "prose-td:px-5 prose-td:py-4 prose-td:border-t prose-td:border-slate-200 dark:prose-td:border-slate-800",

        // Images
        "prose-img:rounded-xl prose-img:shadow-md prose-img:mx-auto prose-img:border prose-img:border-slate-200 dark:prose-img:border-slate-800",
        "prose-img:my-12",

        // Hr
        "prose-hr:border-slate-200 dark:prose-hr:border-slate-800 prose-hr:my-12",

        className,
      )}
    >
      {content ? (
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            blockquote: AlertBlockquote,
            h1: ({ children, node, ...rest }) => <h1 id={generateSlug(children)} {...rest}>{children}</h1>,
            h2: ({ children, node, ...rest }) => <h2 id={generateSlug(children)} {...rest}>{children}</h2>,
            h3: ({ children, node, ...rest }) => <h3 id={generateSlug(children)} {...rest}>{children}</h3>,
            h4: ({ children, node, ...rest }) => <h4 id={generateSlug(children)} {...rest}>{children}</h4>,
            h5: ({ children, node, ...rest }) => <h5 id={generateSlug(children)} {...rest}>{children}</h5>,
            h6: ({ children, node, ...rest }) => <h6 id={generateSlug(children)} {...rest}>{children}</h6>,
            pre(props: React.ComponentPropsWithoutRef<"pre"> & ExtraProps) {
              const { children, node, ...rest } = props;
              void node;

              if (React.isValidElement<React.ComponentPropsWithoutRef<"code">>(children)) {
                const childProps = children.props;
                const match = /language-(\w+)/.exec(childProps.className || "");
                const lang = match ? match[1] : "text";
                return <CodeBlock lang={lang}>{childProps.children}</CodeBlock>;
              }

              return (
                <pre className="not-prose" {...rest}>
                  {children}
                </pre>
              );
            },
            code(
              props: React.ComponentPropsWithoutRef<"code"> & {
                node?: unknown;
              },
            ) {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { className, children, node: _node, ...rest } = props;
              return (
                <code
                  className={cn(
                    "px-1.5 py-0.5 mx-0.5 rounded-md",
                    "bg-slate-100 dark:bg-slate-800/60",
                    "text-indigo-600 dark:text-indigo-300",
                    "font-mono text-[0.875em] font-medium",
                    "border border-slate-200/60 dark:border-slate-700/50",
                    "before:content-none after:content-none",
                    className,
                  )}
                  {...rest}
                >
                  {children}
                </code>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 text-slate-400 dark:text-slate-500">
          <div className="w-16 h-16 mb-6 rounded-2xl bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center border border-slate-200 dark:border-slate-800">
            <svg
              className="w-8 h-8 opacity-60"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </div>
          <p className="text-base font-medium text-slate-600 dark:text-slate-400">
            Belum ada konten
          </p>
          <p className="text-sm mt-1 opacity-70">
            Mulai mengetik untuk melihat preview markdown...
          </p>
        </div>
      )}
    </div>
  );
}
