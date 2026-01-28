"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { FileGrid } from "@/components/files/FileGrid";
import { filesApi, groupsApi } from "@/lib/api";
import { MarkdownFile, Group } from "@/types";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Plus,
  FileText,
  Files,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const groupId = searchParams.get("group");
  const isUngrouped = searchParams.get("ungrouped") === "true";

  const [files, setFiles] = useState<MarkdownFile[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFiles, setTotalFiles] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const limit = 12;

  // Fetch files with proper API parameters
  const fetchFiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: {
        page: number;
        limit: number;
        orderBy: string;
        order: "desc" | "asc";
        group_id?: string;
        ungrouped?: boolean;
      } = {
        page,
        limit,
        orderBy: "updated_at",
        order: "desc",
      };

      // Apply filters based on URL params
      if (groupId) {
        params.group_id = groupId;
      } else if (isUngrouped) {
        params.ungrouped = true;
      }
      // If neither groupId nor isUngrouped, fetch all files (no filter)

      const response = await filesApi.getAll(params);
      setFiles(response.data);
      setTotalPages(response.pagination.totalPages || 1);
      setTotalFiles(response.pagination.total || 0);
      setHasNextPage(response.pagination.hasNextPage || false);
      setHasPrevPage(response.pagination.hasPrevPage || false);
    } catch (error) {
      console.error("Failed to fetch files:", error);
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, groupId, isUngrouped, limit]);

  // Fetch groups
  const fetchGroups = useCallback(async () => {
    try {
      const response = await groupsApi.getAll({ limit: 100 });
      setGroups(response.data);
    } catch (error) {
      console.error("Failed to fetch groups:", error);
    }
  }, []);

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [groupId, isUngrouped]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // Get current group name
  const currentGroup = groupId ? groups.find((g) => g.id === groupId) : null;

  const handleCreateNew = () => {
    if (groupId) {
      router.push(`/editor/new?group=${groupId}`);
    } else {
      router.push("/editor/new");
    }
  };

  // Determine page title and icon
  const getPageInfo = () => {
    if (groupId && currentGroup) {
      return {
        title: currentGroup.name,
        icon: FolderOpen,
        subtitle: `${totalFiles} file${totalFiles !== 1 ? "s" : ""} in this project`,
      };
    } else if (isUngrouped) {
      return {
        title: "Ungrouped Files",
        icon: FileText,
        subtitle: `${totalFiles} file${totalFiles !== 1 ? "s" : ""} without a project`,
      };
    } else {
      return {
        title: "All Files",
        icon: Files,
        subtitle: `${totalFiles} file${totalFiles !== 1 ? "s" : ""} total`,
      };
    }
  };

  const pageInfo = getPageInfo();
  const PageIcon = pageInfo.icon;

  // Show welcome page when no project is selected (default view)
  if (!groupId && !isUngrouped) {
    return (
      <>
        <Header groupId={groupId} />

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className="max-w-4xl mx-auto">
            {/* Welcome Section */}
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-8 shadow-2xl shadow-indigo-500/30">
                <FileText className="w-12 h-12 text-white" />
              </div>

              <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Welcome to MD Preview
              </h1>

              <p className="text-muted-foreground text-lg mb-8 max-w-md">
                Create beautiful markdown documents with live preview. Select a
                project from the sidebar or create a new file to get started.
              </p>

              <div className="flex gap-4">
                <Button
                  onClick={handleCreateNew}
                  size="lg"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white gap-2 shadow-lg shadow-indigo-500/25"
                >
                  <Plus className="h-5 w-5" />
                  Create New File
                </Button>
              </div>

              {/* Quick Tips */}
              <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mb-4">
                    <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="font-semibold mb-2">Create Files</h3>
                  <p className="text-sm text-muted-foreground">
                    Click "New Document" in the sidebar to create markdown files
                  </p>
                </div>

                <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center mb-4">
                    <FolderOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-semibold mb-2">Organize with Projects</h3>
                  <p className="text-sm text-muted-foreground">
                    Create projects to organize your files. Drag files to move
                    them.
                  </p>
                </div>

                <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left">
                  <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center mb-4">
                    <svg
                      className="w-5 h-5 text-green-600 dark:text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-2">Live Preview</h3>
                  <p className="text-sm text-muted-foreground">
                    See your markdown rendered in real-time as you type
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  // Show file list
  return (
    <>
      <Header groupId={groupId} />

      <main className="flex-1 p-4 lg:p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {/* Page Title */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 flex items-center justify-center">
                  <PageIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{pageInfo.title}</h1>
                  <p className="text-muted-foreground">{pageInfo.subtitle}</p>
                </div>
              </div>
            </div>
          </div>

          {/* File Grid */}
          <FileGrid files={files} groups={groups} isLoading={isLoading} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!hasPrevPage || isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground px-4">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={!hasNextPage || isLoading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
