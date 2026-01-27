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
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const groupId = searchParams.get("group");

  const [files, setFiles] = useState<MarkdownFile[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 12;

  // Fetch files - only when viewing a specific group
  const fetchFiles = useCallback(async () => {
    if (!groupId) {
      setFiles([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await filesApi.getAll({
        page,
        limit,
        orderBy: "created_at",
        order: "desc",
        search: searchQuery || undefined,
      });
      // Filter by group
      const groupFiles = response.data.filter((f) => f.group_id === groupId);
      setFiles(groupFiles);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error("Failed to fetch files:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, searchQuery, groupId]);

  // Fetch groups
  const fetchGroups = useCallback(async () => {
    try {
      const response = await groupsApi.getAll({ limit: 100 });
      setGroups(response.data);
    } catch (error) {
      console.error("Failed to fetch groups:", error);
    }
  }, []);

  useEffect(() => {
    const debounce = setTimeout(
      () => {
        fetchFiles();
      },
      searchQuery ? 300 : 0,
    );

    return () => clearTimeout(debounce);
  }, [fetchFiles, searchQuery]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // Get current group name
  const currentGroup = groupId ? groups.find((g) => g.id === groupId) : null;

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleCreateNew = () => {
    router.push("/editor/new");
  };

  // If no group selected, show welcome/create page
  if (!groupId) {
    return (
      <>
        <Header onSearch={handleSearch} searchQuery={searchQuery} />

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

  // Show group content when a group is selected
  return (
    <>
      <Header onSearch={handleSearch} searchQuery={searchQuery} />

      <main className="flex-1 p-4 lg:p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {/* Page Title */}
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {currentGroup?.name || "Project"}
                </h1>
                <p className="text-muted-foreground">
                  {files.length} file{files.length !== 1 ? "s" : ""} in this
                  project
                </p>
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
                disabled={page === 1 || isLoading}
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
                disabled={page === totalPages || isLoading}
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
