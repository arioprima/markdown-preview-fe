"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import {
  MarkdownEditor,
  MarkdownEditorRef,
} from "@/components/editor/MarkdownEditor";
import { MarkdownPreview } from "@/components/editor/MarkdownPreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { filesApi } from "@/lib/api";
import { MarkdownFile } from "@/types";
import { toast } from "sonner";
import {
  Save,
  Trash2,
  Loader2,
  ArrowLeft,
  PanelLeftClose,
  PanelLeft,
  Eye,
  Edit,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditorPage() {
  const router = useRouter();
  const params = useParams();
  const fileId = params?.id as string;
  const isNewFile = fileId === "new";
  const editorRef = useRef<MarkdownEditorRef>(null);

  const [title, setTitle] = useState("Untitled");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(!isNewFile);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewMode, setViewMode] = useState<"split" | "editor" | "preview">(
    "split"
  );
  const [originalFile, setOriginalFile] = useState<MarkdownFile | null>(null);

  // Fetch existing file
  useEffect(() => {
    if (!isNewFile && fileId) {
      fetchFile();
    }
  }, [fileId, isNewFile]);

  const fetchFile = async () => {
    try {
      const response = await filesApi.getById(fileId);
      setTitle(response.data.title);
      setContent(response.data.content);
      setOriginalFile(response.data);
    } catch (error) {
      console.error("Failed to fetch file:", error);
      toast.error("Failed to load file");
      router.push("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    setIsSaving(true);
    try {
      if (isNewFile) {
        const response = await filesApi.create(title, content);
        toast.success("File created successfully");
        router.push(`/editor/${response.data.id}`);
      } else {
        await filesApi.update(fileId, title, content);
        toast.success("File saved successfully");
      }
    } catch (error) {
      console.error("Failed to save:", error);
      toast.error("Failed to save file");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await filesApi.delete(fileId);
      toast.success("File moved to trash");
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to delete:", error);
      toast.error("Failed to delete file");
    } finally {
      setIsDeleting(false);
    }
  };

  // Check for unsaved changes
  const hasChanges = isNewFile
    ? content.length > 0
    : originalFile &&
      (title !== originalFile.title || content !== originalFile.content);

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-[500px] w-full" />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Editor Header */}
      <header className="h-14 md:h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-between px-2 md:px-4 lg:px-6 sticky top-0 z-10">
        <div className="flex items-center gap-1 md:gap-4 flex-1 min-w-0 overflow-hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard")}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled"
            className="flex-1 min-w-0 max-w-[150px] md:max-w-xs font-semibold text-sm md:text-lg border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0 truncate"
          />
          {hasChanges && (
            <span className="hidden md:inline text-xs text-muted-foreground whitespace-nowrap">
              Unsaved changes
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Switcher (Desktop) */}
          <div className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <Button
              variant={viewMode === "editor" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("editor")}
              className={
                viewMode === "editor"
                  ? "bg-white dark:bg-slate-700 shadow-sm"
                  : ""
              }
              title="Editor Only"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "split" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("split")}
              className={
                viewMode === "split"
                  ? "bg-white dark:bg-slate-700 shadow-sm"
                  : ""
              }
              title="Split View"
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "preview" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("preview")}
              className={
                viewMode === "preview"
                  ? "bg-white dark:bg-slate-700 shadow-sm"
                  : ""
              }
              title="Preview Only"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>

          {/* Delete Button */}
          {!isNewFile && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Move to Trash?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This file will be moved to trash. You can restore it later.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-red-500 hover:bg-red-600"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Move to Trash"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {/* Save Button */}
          <Button
            onClick={handleSave}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white gap-2"
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Save</span>
          </Button>
        </div>
      </header>

      {/* Editor Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Mobile: Tabs View */}
        <div className="flex-1 md:hidden overflow-hidden">
          <Tabs defaultValue="edit" className="h-full flex flex-col">
            <TabsList className="w-full rounded-none border-b shrink-0">
              <TabsTrigger value="edit" className="flex-1 gap-1.5 text-sm">
                <Edit className="h-3.5 w-3.5" />
                Edit
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex-1 gap-1.5 text-sm">
                <Eye className="h-3.5 w-3.5" />
                Preview
              </TabsTrigger>
            </TabsList>
            <TabsContent value="edit" className="flex-1 mt-0 overflow-hidden">
              <MarkdownEditor
                ref={editorRef}
                value={content}
                onChange={setContent}
                className="h-full"
              />
            </TabsContent>
            <TabsContent
              value="preview"
              className="flex-1 mt-0 overflow-auto bg-white dark:bg-slate-950"
            >
              <MarkdownPreview
                content={content}
                className="w-full max-w-full"
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Desktop: Split View */}
        <div className="hidden md:flex flex-1">
          {/* Editor Panel */}
          {(viewMode === "editor" || viewMode === "split") && (
            <div
              className={
                viewMode === "split"
                  ? "w-1/2 border-r border-slate-200 dark:border-slate-800"
                  : "w-full"
              }
            >
              <MarkdownEditor
                ref={editorRef}
                value={content}
                onChange={setContent}
                className="h-full"
              />
            </div>
          )}

          {/* Preview Panel */}
          {(viewMode === "preview" || viewMode === "split") && (
            <div
              className={
                viewMode === "split"
                  ? "w-1/2 overflow-auto bg-white dark:bg-slate-950"
                  : "w-full overflow-auto bg-white dark:bg-slate-950"
              }
            >
              <MarkdownPreview content={content} className="h-full" />
            </div>
          )}
        </div>
      </main>
    </>
  );
}
