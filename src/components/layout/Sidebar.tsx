"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  Trash2,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Plus,
  FolderOpen,
  MoreHorizontal,
  Pencil,
  Trash,
  Check,
  X,
  Search,
  MessageSquare,
  GripVertical,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { filesApi, groupsApi } from "@/lib/api";
import { Group, MarkdownFile } from "@/types";
import { useRouter } from "next/navigation";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { toast } from "sonner";

const menuItems = [{ href: "/trash", icon: Trash2, label: "Trash" }];

interface SidebarProps {
  isMobile?: boolean;
}

// Droppable Group Item Component
function GroupItem({
  group,
  isActive,
  onUpdate,
  onDelete,
  isUpdating,
  isDeleting,
}: {
  group: Group;
  isActive: boolean;
  onUpdate: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(group.name);

  const { isOver, setNodeRef } = useDroppable({
    id: `group-${group.id}`,
    data: {
      type: "group",
      groupId: group.id,
    },
  });

  const handleSave = () => {
    if (editName.trim() && editName.trim() !== group.name) {
      onUpdate(group.id, editName.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") {
      setEditName(group.name);
      setIsEditing(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "group flex items-center gap-2 px-3 py-2 rounded-xl transition-all cursor-pointer",
        isActive
          ? "bg-slate-100 dark:bg-slate-800"
          : "hover:bg-slate-50 dark:hover:bg-slate-900",
        isOver && "ring-2 ring-purple-500 bg-purple-100 dark:bg-purple-900/60",
      )}
    >
      <FolderOpen
        className={cn(
          "h-5 w-5 flex-shrink-0 transition-colors",
          isOver
            ? "text-purple-600 dark:text-purple-400"
            : "text-slate-500 dark:text-slate-400",
        )}
      />

      {isEditing ? (
        <div className="flex-1 flex items-center gap-1">
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-6 text-sm py-0 px-1"
            autoFocus
            disabled={isUpdating}
            onClick={(e) => e.stopPropagation()}
          />
          <Button
            size="icon"
            variant="ghost"
            className="h-5 w-5"
            disabled={isUpdating}
            onClick={(e) => {
              e.stopPropagation();
              handleSave();
            }}
          >
            {isUpdating ? (
              <Loader2 className="h-3 w-3 animate-spin text-green-600" />
            ) : (
              <Check className="h-3 w-3 text-green-600" />
            )}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-5 w-5"
            disabled={isUpdating}
            onClick={(e) => {
              e.stopPropagation();
              setEditName(group.name);
              setIsEditing(false);
            }}
          >
            <X className="h-3 w-3 text-red-600" />
          </Button>
        </div>
      ) : (
        <>
          <Link
            href={`/dashboard?group=${group.id}`}
            className={cn(
              "flex-1 text-sm truncate",
              (isUpdating || isDeleting) && "opacity-50",
            )}
          >
            {group.name}
          </Link>
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin text-red-500" />
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                  disabled={isUpdating || isDeleting}
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                >
                  <Pencil className="h-3 w-3 mr-2" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(group.id);
                  }}
                >
                  <Trash className="h-3 w-3 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </>
      )}
    </div>
  );
}

// Draggable File Item Component
function DraggableFileItem({
  file,
  isActive,
  formatDate,
  groups,
  onDelete,
  onMoveToGroup,
}: {
  file: MarkdownFile;
  isActive: boolean;
  formatDate: (date: string) => string;
  groups?: Group[];
  onDelete?: (fileId: string) => void;
  onMoveToGroup?: (fileId: string, groupId: string | null) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `file-${file.id}`,
    data: {
      type: "file",
      fileId: file.id,
      file: file,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "group/file flex items-center gap-1 px-2 py-2 rounded-lg transition-colors",
        isActive
          ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300"
          : "hover:bg-slate-50 dark:hover:bg-slate-900",
        isDragging && "opacity-40",
      )}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
      >
        <GripVertical className="h-3 w-3 text-slate-400" />
      </div>

      {/* Clickable Link */}
      <Link
        href={`/editor/${file.id}`}
        className="flex-1 min-w-0 flex items-center gap-2"
      >
        <FileText className="h-4 w-4 flex-shrink-0 text-slate-400" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {file.title || "Untitled"}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {formatDate(file.updated_at)}
          </p>
        </div>
      </Link>

      {/* Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover/file:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {/* Move to Project submenu */}
          {groups && groups.length > 0 && onMoveToGroup && (
            <>
              <DropdownMenuItem
                className="text-slate-600 dark:text-slate-400"
                disabled
              >
                <FolderOpen className="h-3 w-3 mr-2" />
                Move to project...
              </DropdownMenuItem>
              {groups.map((group) => (
                <DropdownMenuItem
                  key={group.id}
                  className="pl-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveToGroup(file.id, group.id);
                  }}
                >
                  {group.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
            </>
          )}

          {/* Delete option */}
          {onDelete && (
            <DropdownMenuItem
              className="text-red-600"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(file.id);
              }}
            >
              <Trash className="h-3 w-3 mr-2" />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// Droppable zone for ungrouped files (Chats section)
function ChatsDropZone({ children }: { children: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({
    id: "ungrouped",
    data: {
      type: "ungrouped",
      groupId: null,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "p-3 rounded-lg transition-all",
        isOver && "ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/30",
      )}
    >
      {children}
    </div>
  );
}

export function Sidebar({ isMobile = false }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { collapsed, setCollapsed } = useSidebar();
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [ungroupedFiles, setUngroupedFiles] = useState<MarkdownFile[]>([]);
  const [isFilesLoading, setIsFilesLoading] = useState(true);
  const [isGroupsLoading, setIsGroupsLoading] = useState(true);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [isSavingGroup, setIsSavingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [updatingGroupId, setUpdatingGroupId] = useState<string | null>(null);
  const [deletingGroupId, setDeletingGroupId] = useState<string | null>(null);

  // Group search and show more state
  const [groupSearch, setGroupSearch] = useState("");
  const [showAllGroups, setShowAllGroups] = useState(false);
  const [isSearchingGroups, setIsSearchingGroups] = useState(false);
  const GROUPS_LIMIT = 5;

  // Initial fetch: groups and ungrouped files in parallel
  useEffect(() => {
    const fetchInitialData = async () => {
      const [filesResult, groupsResult] = await Promise.allSettled([
        filesApi.getAll({
          limit: 20,
          orderBy: "updated_at",
          order: "desc",
          ungrouped: true,
        }),
        groupsApi.getAll({ limit: 100 }),
      ]);

      if (filesResult.status === "fulfilled") {
        setUngroupedFiles(filesResult.value.data);
      } else {
        console.error("Failed to fetch files:", filesResult.reason);
      }

      if (groupsResult.status === "fulfilled") {
        setGroups(groupsResult.value.data);
      } else {
        console.error("Failed to fetch groups:", groupsResult.reason);
      }

      setIsFilesLoading(false);
      setIsGroupsLoading(false);
    };

    fetchInitialData();
  }, []);

  // Listen for file-moved events (from drag-drop in layout)
  useEffect(() => {
    const handleFileMoved = (
      event: CustomEvent<{
        fileId: string;
        targetGroupId: string | null;
        file: MarkdownFile;
      }>,
    ) => {
      const { fileId, targetGroupId, file } = event.detail;

      if (targetGroupId) {
        // File moved to a group - remove from ungrouped
        setUngroupedFiles((prev) => prev.filter((f) => f.id !== fileId));
      } else {
        // File moved to ungrouped - add to ungrouped list
        setUngroupedFiles((prev) => {
          // Check if file already exists
          if (prev.some((f) => f.id === fileId)) {
            return prev;
          }
          // Add file with updated group_id
          return [{ ...file, group_id: null }, ...prev];
        });
      }
    };

    window.addEventListener("file-moved", handleFileMoved as EventListener);
    return () => {
      window.removeEventListener(
        "file-moved",
        handleFileMoved as EventListener,
      );
    };
  }, []);

  // Search groups with debounce (only when searching)
  useEffect(() => {
    if (!groupSearch) return; // Skip if no search query

    setIsSearchingGroups(true);
    const timer = setTimeout(async () => {
      try {
        const response = await groupsApi.getAll({
          limit: 100,
          search: groupSearch,
        });
        setGroups(response.data);
      } catch (error) {
        console.error("Failed to search groups:", error);
      } finally {
        setIsSearchingGroups(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [groupSearch]);

  // Computed: visible groups (limit 5 or show all)
  const visibleGroups = useMemo(() => {
    if (showAllGroups || groupSearch) {
      return groups;
    }
    return groups.slice(0, GROUPS_LIMIT);
  }, [groups, showAllGroups, groupSearch]);

  const hasMoreGroups = groups.length > GROUPS_LIMIT && !groupSearch;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const createNewFile = () => {
    router.push("/editor/new");
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || isSavingGroup) return;

    setIsSavingGroup(true);
    try {
      const response = await groupsApi.create(newGroupName.trim());
      setGroups((prev) => [...prev, response.data]);
      setNewGroupName("");
      setIsCreatingGroup(false);
      toast.success("Group created");
    } catch (error) {
      console.error("Failed to create group:", error);
      toast.error("Failed to create group");
    } finally {
      setIsSavingGroup(false);
    }
  };

  const handleUpdateGroup = async (id: string, name: string) => {
    setUpdatingGroupId(id);
    try {
      const response = await groupsApi.update(id, name);
      setGroups((prev) => prev.map((g) => (g.id === id ? response.data : g)));
      toast.success("Group updated");
    } catch (error) {
      console.error("Failed to update group:", error);
      toast.error("Failed to update group");
    } finally {
      setUpdatingGroupId(null);
    }
  };

  const handleDeleteGroup = async (id: string) => {
    setDeletingGroupId(id);
    try {
      await groupsApi.delete(id);
      setGroups((prev) => prev.filter((g) => g.id !== id));
      toast.success("Group deleted");
    } catch (error) {
      console.error("Failed to delete group:", error);
      toast.error("Failed to delete group");
    } finally {
      setDeletingGroupId(null);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      await filesApi.delete(fileId);
      setUngroupedFiles((prev) => prev.filter((f) => f.id !== fileId));
      toast.success("File deleted");
    } catch (error) {
      console.error("Failed to delete file:", error);
      toast.error("Failed to delete file");
    }
  };

  const handleMoveFileToGroup = async (
    fileId: string,
    groupId: string | null,
  ) => {
    try {
      await filesApi.updateGroup(fileId, groupId);
      // Remove from ungrouped files if moving to a group
      if (groupId) {
        setUngroupedFiles((prev) => prev.filter((f) => f.id !== fileId));
      }
      toast.success(
        groupId ? "File moved to project" : "File removed from project",
      );
    } catch (error) {
      console.error("Failed to move file:", error);
      toast.error("Failed to move file");
    }
  };

  // Collapsed sidebar
  if (collapsed && !isMobile) {
    return (
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex-col transition-all duration-300 z-20 w-16">
        <div className="p-4 flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-indigo-950 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200 shadow-sm"
            onClick={() => setCollapsed(false)}
            title="Expand sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Separator />

        <nav className="flex-1 p-3 space-y-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={createNewFile}
            className="w-full"
            title="New File"
          >
            <Plus className="h-5 w-5" />
          </Button>
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "w-full",
                  pathname === item.href &&
                    "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400",
                )}
                title={item.label}
              >
                <item.icon className="h-5 w-5" />
              </Button>
            </Link>
          ))}
        </nav>

        <Separator />

        <div className="p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs">
                    {user ? getInitials(user.username) : "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={logout}
                className="text-red-600 dark:text-red-400"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={cn(
        "bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 w-64 overflow-x-hidden",
        !isMobile && "hidden lg:flex fixed left-0 top-0 h-screen z-20",
        isMobile && "h-full",
      )}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            MD Preview
          </span>
        </Link>
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            onClick={() => setCollapsed(true)}
            title="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </Button>
        )}
      </div>

      <Separator />

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* Projects Section (formerly Groups) */}
        <div className="p-3">
          <div className="flex items-center justify-between px-2 py-1 mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Projects
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={() => setIsCreatingGroup(true)}
              title="New project"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {/* Search Projects Input */}
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              value={groupSearch}
              onChange={(e) => setGroupSearch(e.target.value)}
              placeholder="Search projects..."
              className="h-8 text-sm pl-8 pr-3"
            />
            {isSearchingGroups && (
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                <div className="h-3 w-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Create Project Input */}
          {isCreatingGroup && (
            <div className="flex items-center gap-1 mb-2 px-2">
              <FolderOpen className="h-4 w-4 text-slate-500 flex-shrink-0" />
              <Input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isSavingGroup) {
                    e.preventDefault();
                    handleCreateGroup();
                  }
                  if (e.key === "Escape") {
                    setNewGroupName("");
                    setIsCreatingGroup(false);
                  }
                }}
                placeholder="Project name..."
                className="h-7 text-sm"
                autoFocus
                disabled={isSavingGroup}
              />
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={handleCreateGroup}
                disabled={isSavingGroup}
              >
                {isSavingGroup ? (
                  <div className="h-3 w-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check className="h-3 w-3 text-green-600" />
                )}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={() => {
                  setNewGroupName("");
                  setIsCreatingGroup(false);
                }}
                disabled={isSavingGroup}
              >
                <X className="h-3 w-3 text-red-600" />
              </Button>
            </div>
          )}

          {/* Projects List */}
          {isGroupsLoading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-8 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : groups.length === 0 && !isCreatingGroup ? (
            <button
              onClick={() => setIsCreatingGroup(true)}
              className="w-full text-left px-2 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              + New project
            </button>
          ) : showAllGroups || groupSearch ? (
            // Show all groups with scroll area
            <ScrollArea className="h-[200px]">
              <div className="space-y-0 pr-2">
                {visibleGroups.map((group) => (
                  <GroupItem
                    key={group.id}
                    group={group}
                    isActive={pathname.includes(`group=${group.id}`)}
                    onUpdate={handleUpdateGroup}
                    onDelete={handleDeleteGroup}
                    isUpdating={updatingGroupId === group.id}
                    isDeleting={deletingGroupId === group.id}
                  />
                ))}
              </div>
            </ScrollArea>
          ) : (
            // Show limited groups (max 5)
            <div className="space-y-0">
              {visibleGroups.map((group) => (
                <GroupItem
                  key={group.id}
                  group={group}
                  isActive={pathname.includes(`group=${group.id}`)}
                  onUpdate={handleUpdateGroup}
                  onDelete={handleDeleteGroup}
                  isUpdating={updatingGroupId === group.id}
                  isDeleting={deletingGroupId === group.id}
                />
              ))}
            </div>
          )}

          {/* More Button */}
          {hasMoreGroups && !groupSearch && (
            <button
              onClick={() => setShowAllGroups(!showAllGroups)}
              className="w-full flex items-center justify-center gap-1.5 px-2 py-2 mt-1 text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg transition-colors"
            >
              {showAllGroups ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5" />
                  More ({groups.length - GROUPS_LIMIT} more)
                </>
              )}
            </button>
          )}

          {/* No results */}
          {groupSearch && groups.length === 0 && !isSearchingGroups && (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-3">
              No projects found
            </p>
          )}
        </div>

        <Separator />

        {/* Chats Section - Ungrouped Files (Droppable) */}
        <ChatsDropZone>
          <div className="flex items-center gap-2 px-2 py-1 mb-2">
            <MessageSquare className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Chats
            </span>
          </div>

          {isFilesLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-10 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : ungroupedFiles.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
              No chats yet
            </p>
          ) : (
            <div className="space-y-0.5">
              {ungroupedFiles.map((file) => (
                <DraggableFileItem
                  key={file.id}
                  file={file}
                  isActive={pathname === `/editor/${file.id}`}
                  formatDate={formatDate}
                  groups={groups}
                  onDelete={handleDeleteFile}
                  onMoveToGroup={handleMoveFileToGroup}
                />
              ))}
            </div>
          )}
        </ChatsDropZone>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="p-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-10",
                  isActive &&
                    "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100",
                )}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                <span>{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </nav>

      <Separator />

      {/* User Profile */}
      <div className="p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full h-auto py-3 px-3 justify-start gap-3"
            >
              <Avatar className="h-9 w-9 flex-shrink-0">
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm">
                  {user ? getInitials(user.username) : "U"}
                </AvatarFallback>
              </Avatar>
              {user && (
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user.username}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
