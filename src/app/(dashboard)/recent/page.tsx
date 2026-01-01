"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { FileGrid } from "@/components/files/FileGrid";
import { filesApi } from "@/lib/api";
import { MarkdownFile } from "@/types";
import { Clock } from "lucide-react";

export default function RecentPage() {
  const [files, setFiles] = useState<MarkdownFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRecentFiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await filesApi.getRecent(10); // Get 10 most recent files
      setFiles(response.data);
    } catch (error) {
      console.error("Failed to fetch recent files:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecentFiles();
  }, [fetchRecentFiles]);

  return (
    <>
      <Header />

      <main className="flex-1 p-4 lg:p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Clock className="h-6 w-6 text-muted-foreground" />
              Recent Files
            </h1>
            <p className="text-muted-foreground">
              Your recently accessed documents
            </p>
          </div>

          {/* File Grid */}
          <FileGrid files={files} isLoading={isLoading} />
        </div>
      </main>
    </>
  );
}
