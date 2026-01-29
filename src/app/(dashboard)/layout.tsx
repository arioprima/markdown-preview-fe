"use client";

import { ReactNode, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import { filesApi } from "@/lib/api";
import { MarkdownFile } from "@/types";
import { toast } from "sonner";

function DashboardLayoutContent({ children }: { children: ReactNode }) {
  const { collapsed } = useSidebar();
  const [activeFile, setActiveFile] = useState<MarkdownFile | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const fileData = active.data.current?.file as MarkdownFile | undefined;
    if (fileData) {
      setActiveFile(fileData);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveFile(null);

    console.log("=== DRAG END ===");
    console.log("Active:", active.id, active.data.current);
    console.log("Over:", over?.id, over?.data.current);

    if (!over) {
      console.log("No drop target!");
      return;
    }

    const fileId = active.data.current?.fileId as string | undefined;
    const targetGroupId = over.data.current?.groupId as
      | string
      | null
      | undefined;

    console.log("FileId:", fileId);
    console.log("TargetGroupId:", targetGroupId);

    if (!fileId || targetGroupId === undefined) {
      console.log("Missing fileId or targetGroupId is undefined");
      return;
    }

    // Get the file from active data
    const file = active.data.current?.file as MarkdownFile | undefined;
    if (!file) {
      console.log("No file in active data");
      return;
    }

    // If file is already in this group, do nothing
    if (file.group_id === targetGroupId) {
      console.log("File already in this group, skipping");
      return;
    }

    console.log("Updating file group...");
    try {
      await filesApi.updateGroup(fileId, targetGroupId);
      toast.success(
        targetGroupId ? "File moved to group" : "File removed from group",
      );
      // Dispatch custom event for sidebar to update without full page reload
      window.dispatchEvent(
        new CustomEvent("file-moved", {
          detail: { fileId, targetGroupId, file },
        }),
      );
    } catch (error) {
      console.error("Failed to update file group:", error);
      toast.error("Failed to move file");
    }
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
        {/* Desktop Sidebar - component handles its own visibility */}
        <Sidebar />

        {/* Main Content */}
        <div
          className={cn(
            "h-full flex flex-col min-w-0 transition-all duration-300 overflow-hidden",
            collapsed ? "lg:ml-16" : "lg:ml-64",
          )}
        >
          {children}
        </div>
      </div>

      {/* Drag Overlay - simpler design */}
      <DragOverlay>
        {activeFile && (
          <div className="px-4 py-2 bg-white dark:bg-slate-800 rounded-lg shadow-xl border-2 border-purple-500">
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              {activeFile.title || "Untitled"}
            </p>
            <p className="text-xs text-purple-600">Drag to project...</p>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-2xl" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SidebarProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SidebarProvider>
  );
}
