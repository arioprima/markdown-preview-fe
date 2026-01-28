"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  Files,
  Trash2,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  FolderOpen,
  MoreHorizontal,
  Pencil,
  Trash,
  Check,
  X,
  GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { filesApi, groupsApi } from "@/lib/api";
import { MarkdownFile, Group } from "@/types";
import { useRouter } from "next/navigation";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";

const menuItems = [
  { href: "/dashboard", icon: Files, label: "All Files" },
  { href: "/trash", icon: Trash2, label: "Trash" },
];

interface SidebarProps {
  isMobile?: boolean;
}

// Droppable Group Item Component
function GroupItem({
  group,
  isActive,
  onUpdate,
  onDelete,
}: {
  group: Group;
  isActive: boolean;
  onUpdate: (id: string, name: string) => void;
  onDelete: (id: string) => void;
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
            onClick={(e) => e.stopPropagation()}
          />
          <Button
            size="icon"
            variant="ghost"
            className="h-5 w-5"
            onClick={(e) => {
              e.stopPropagation();
              handleSave();
            }}
          >
            <Check className="h-3 w-3 text-green-600" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-5 w-5"
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
            className="flex-1 text-sm truncate"
          >
            {group.name}
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
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
        </>
      )}
    </div>
  );
}

// Sidebar File Item with Move Menu AND Drag-Drop
function SidebarFileItem({
  file,
  isActive,
  formatDate,
  groups,
  onMoveToGroup,
}: {
  file: MarkdownFile;
  isActive: boolean;
  formatDate: (date: string) => string;
  groups: Group[];
  onMoveToGroup: (fileId: string, groupId: string | null) => void;
}) {
  const router = useRouter();
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `sidebar-file-${file.id}`,
      data: {
        type: "file",
        fileId: file.id,
        file: file,
      },
    });

  const handleClick = () => {
    if (!isDragging) {
      router.push(`/editor/${file.id}`);
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={cn("group/file relative", isDragging && "opacity-40")}
    >
      <div
        className={cn(
          "w-full flex items-center gap-2 h-auto py-2 px-3 text-left rounded-lg transition-colors",
          isActive
            ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300"
            : "hover:bg-slate-100 dark:hover:bg-slate-800",
        )}
      >
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-0.5 -ml-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
        >
          <GripVertical className="h-3 w-3 text-slate-400" />
        </div>
        <FileText className="h-4 w-4 flex-shrink-0 text-slate-400" />
        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => router.push(`/editor/${file.id}`)}
        >
          <p className="text-sm font-medium truncate">
            {file.title || "Untitled"}
          </p>
          {file.updated_at && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {formatDate(file.updated_at)}
            </p>
          )}
        </div>

        {/* Move to Group Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover/file:opacity-100 transition-opacity flex-shrink-0"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/editor/${file.id}`);
              }}
            >
              <FileText className="h-4 w-4 mr-2" />
              Open
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5 text-xs font-semibold text-slate-500">
              Move to Project
            </div>
            {groups.map((group) => (
              <DropdownMenuItem
                key={group.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveToGroup(file.id, group.id);
                }}
                disabled={file.group_id === group.id}
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                {group.name}
                {file.group_id === group.id && (
                  <Check className="h-3 w-3 ml-auto text-green-600" />
                )}
              </DropdownMenuItem>
            ))}
            {file.group_id && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveToGroup(file.id, null);
                  }}
                  className="text-orange-600"
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove from Project
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// All Files Section - Droppable to remove files from groups
function AllFilesSection({
  isLoading,
  files,
  pathname,
  formatDate,
  groups,
  onMoveToGroup,
}: {
  isLoading: boolean;
  files: MarkdownFile[];
  pathname: string;
  formatDate: (date: string) => string;
  groups: Group[];
  onMoveToGroup: (fileId: string, groupId: string | null) => void;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: "group-ungrouped",
    data: {
      type: "group",
      groupId: null,
    },
  });

  return (
    <div className="px-3 py-1">
      <div
        ref={setNodeRef}
        className={cn(
          "flex items-center gap-2 px-3 py-3 mb-2 rounded-xl transition-all duration-200 min-h-[44px]",
          isOver &&
            "ring-2 ring-green-500 bg-green-100 dark:bg-green-900/50 scale-[1.02] shadow-lg shadow-green-500/20",
        )}
      >
        <Files
          className={cn(
            "h-5 w-5 transition-colors",
            isOver
              ? "text-green-600 dark:text-green-400"
              : "text-slate-500 dark:text-slate-400",
          )}
        />
        <span
          className={cn(
            "text-xs font-semibold uppercase tracking-wide transition-colors",
            isOver
              ? "text-green-600 dark:text-green-400"
              : "text-slate-500 dark:text-slate-400",
          )}
        >
          All Files
        </span>
        {isOver && (
          <span className="text-xs text-green-600 dark:text-green-400 ml-auto font-medium">
            Drop to remove from project
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-10 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : files.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
          No ungrouped files
        </p>
      ) : (
        <div className="space-y-0">
          {files.map((file) => (
            <SidebarFileItem
              key={file.id}
              file={file}
              isActive={pathname === `/editor/${file.id}`}
              formatDate={formatDate}
              groups={groups}
              onMoveToGroup={onMoveToGroup}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar({ isMobile = false }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { collapsed, setCollapsed } = useSidebar();
  const router = useRouter();
  const [recentFiles, setRecentFiles] = useState<MarkdownFile[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGroupsLoading, setIsGroupsLoading] = useState(true);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [isSavingGroup, setIsSavingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  // Fetch ungrouped files only
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await filesApi.getAll({
          limit: 50,
          orderBy: "updated_at",
          order: "desc",
          ungrouped: true,
        });
        setRecentFiles(response.data);
      } catch (error) {
        console.error("Failed to fetch files:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFiles();
  }, []);

  // Fetch groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await groupsApi.getAll({ limit: 100 });
        setGroups(response.data);
      } catch (error) {
        console.error("Failed to fetch groups:", error);
      } finally {
        setIsGroupsLoading(false);
      }
    };
    fetchGroups();
  }, []);

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
    try {
      const response = await groupsApi.update(id, name);
      setGroups((prev) => prev.map((g) => (g.id === id ? response.data : g)));
      toast.success("Group updated");
    } catch (error) {
      console.error("Failed to update group:", error);
      toast.error("Failed to update group");
    }
  };

  const handleDeleteGroup = async (id: string) => {
    try {
      await groupsApi.delete(id);
      setGroups((prev) => prev.filter((g) => g.id !== id));
      toast.success("Group deleted");
    } catch (error) {
      console.error("Failed to delete group:", error);
      toast.error("Failed to delete group");
    }
  };

  const handleMoveToGroup = async (fileId: string, groupId: string | null) => {
    try {
      await filesApi.updateGroup(fileId, groupId);
      // Refresh files list
      const response = await filesApi.getAll({
        limit: 50,
        orderBy: "updated_at",
        order: "desc",
        ungrouped: true,
      });
      setRecentFiles(response.data);
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

      {/* New File Button */}
      <div className="p-3">
        <Button
          onClick={createNewFile}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white gap-2"
        >
          <Plus className="h-4 w-4" />
          New Document
        </Button>
      </div>

      <Separator />

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* Projects Section (formerly Groups) - ChatGPT Style */}
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
          ) : (
            <div className="space-y-0">
              {groups.map((group) => (
                <GroupItem
                  key={group.id}
                  group={group}
                  isActive={pathname.includes(`group=${group.id}`)}
                  onUpdate={handleUpdateGroup}
                  onDelete={handleDeleteGroup}
                />
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* All Files - Droppable to remove from groups */}
        <AllFilesSection
          isLoading={isLoading}
          files={recentFiles}
          pathname={pathname}
          formatDate={formatDate}
          groups={groups}
          onMoveToGroup={handleMoveToGroup}
        />
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
