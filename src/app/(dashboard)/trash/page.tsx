"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { trashApi } from "@/lib/api";
import { MarkdownFile } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
import { toast } from "sonner";
import {
  Trash2,
  RotateCcw,
  FileText,
  Calendar,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { formatDistanceToNow } from "@/lib/utils";

export default function TrashPage() {
  const [files, setFiles] = useState<MarkdownFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isRestoringAll, setIsRestoringAll] = useState(false);
  const [isEmptyingTrash, setIsEmptyingTrash] = useState(false);

  const fetchTrash = useCallback(async () => {
    try {
      const response = await trashApi.getAll({ limit: 50 });
      setFiles(response.data);
    } catch (error) {
      console.error("Failed to fetch trash:", error);
      toast.error("Failed to load trash");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrash();
  }, [fetchTrash]);

  const handleRestore = async (id: string) => {
    setRestoringId(id);
    try {
      await trashApi.restore(id);
      setFiles(files.filter((f) => f.id !== id));
      toast.success("File restored successfully");
    } catch (error) {
      console.error("Failed to restore:", error);
      toast.error("Failed to restore file");
    } finally {
      setRestoringId(null);
    }
  };

  const handlePermanentDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await trashApi.permanentDelete(id);
      setFiles(files.filter((f) => f.id !== id));
      toast.success("File permanently deleted");
    } catch (error) {
      console.error("Failed to delete:", error);
      toast.error("Failed to delete file");
    } finally {
      setDeletingId(null);
    }
  };

  const handleRestoreAll = async () => {
    setIsRestoringAll(true);
    try {
      await trashApi.restoreAll();
      setFiles([]);
      toast.success("All files restored");
    } catch (error) {
      console.error("Failed to restore all:", error);
      toast.error("Failed to restore files");
    } finally {
      setIsRestoringAll(false);
    }
  };

  const handleEmptyTrash = async () => {
    setIsEmptyingTrash(true);
    try {
      await trashApi.emptyTrash();
      setFiles([]);
      toast.success("Trash emptied");
    } catch (error) {
      console.error("Failed to empty trash:", error);
      toast.error("Failed to empty trash");
    } finally {
      setIsEmptyingTrash(false);
    }
  };

  return (
    <>
      <Header />

      <main className="flex-1 p-4 lg:p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Trash2 className="h-6 w-6 text-muted-foreground" />
                Trash
              </h1>
              <p className="text-muted-foreground">
                {files.length} file{files.length !== 1 ? "s" : ""} in trash
              </p>
            </div>

            {files.length > 0 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRestoreAll}
                  disabled={isRestoringAll}
                >
                  {isRestoringAll ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <RotateCcw className="h-4 w-4 mr-2" />
                  )}
                  Restore All
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Empty Trash
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="h-5 w-5" />
                        Empty Trash?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This will <strong>permanently delete</strong> all{" "}
                        {files.length} files in trash. This action cannot be
                        undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleEmptyTrash}
                        className="bg-red-500 hover:bg-red-600"
                        disabled={isEmptyingTrash}
                      >
                        {isEmptyingTrash ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Empty Trash"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && files.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center mb-6">
                <Trash2 className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Trash is empty</h3>
              <p className="text-muted-foreground text-center">
                Files you delete will appear here
              </p>
            </div>
          )}

          {/* File List */}
          {!isLoading && files.length > 0 && (
            <div className="space-y-3">
              {files.map((file) => (
                <Card
                  key={file.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-medium truncate">
                            {file.title || "Untitled"}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>
                              Deleted{" "}
                              {formatDistanceToNow(
                                file.deleted_at || file.updated_at
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRestore(file.id)}
                          disabled={restoringId === file.id}
                        >
                          {restoringId === file.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RotateCcw className="h-4 w-4 mr-2" />
                          )}
                          Restore
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Permanently Delete?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete &quot;{file.title}
                                &quot;. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handlePermanentDelete(file.id)}
                                className="bg-red-500 hover:bg-red-600"
                                disabled={deletingId === file.id}
                              >
                                {deletingId === file.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  "Delete Permanently"
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
