"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { shareApi } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Check, Copy, ExternalLink, Globe, Loader2, Lock } from "lucide-react";

interface ShareDialogProps {
  fileId: string;
  initialIsPublic?: boolean;
  initialToken?: string | null;
  children: React.ReactNode;
}

export function ShareDialog({
  fileId,
  initialIsPublic = false,
  initialToken = null,
  children,
}: ShareDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [token, setToken] = useState<string | null>(initialToken);
  const [isToggling, setIsToggling] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sinkronkan kalau file dimuat ulang dengan status share berbeda
  useEffect(() => {
    setIsPublic(initialIsPublic);
    setToken(initialToken);
  }, [initialIsPublic, initialToken]);

  const shareUrl =
    token && typeof window !== "undefined"
      ? `${window.location.origin}/share/${token}`
      : "";

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      if (!isPublic) {
        const res = await shareApi.enable(fileId);
        setIsPublic(true);
        setToken(res.data.token);
        toast.success("Tautan publik diaktifkan", { duration: 1500 });
      } else {
        await shareApi.disable(fileId);
        setIsPublic(false);
        setToken(null);
        toast.success("Tautan publik dinonaktifkan", { duration: 1500 });
      }
    } catch (error) {
      console.error("Failed to toggle share:", error);
      toast.error("Gagal mengubah status berbagi", { duration: 1500 });
    } finally {
      setIsToggling(false);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Tautan disalin", { duration: 1500 });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Gagal menyalin tautan");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bagikan dokumen</DialogTitle>
          <DialogDescription>
            Aktifkan tautan publik agar siapa saja yang memiliki tautan bisa
            melihat dokumen ini (hanya-baca, tanpa perlu login).
          </DialogDescription>
        </DialogHeader>

        {/* Toggle publik */}
        <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                isPublic
                  ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
                  : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
              )}
            >
              {isPublic ? (
                <Globe className="w-5 h-5" />
              ) : (
                <Lock className="w-5 h-5" />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm">
                {isPublic ? "Tautan publik aktif" : "Privat"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {isPublic
                  ? "Siapa saja dengan tautan bisa melihat"
                  : "Hanya Anda yang bisa mengakses"}
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant={isPublic ? "outline" : "default"}
            size="sm"
            onClick={handleToggle}
            disabled={isToggling}
            className="shrink-0"
          >
            {isToggling ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isPublic ? (
              "Nonaktifkan"
            ) : (
              "Aktifkan"
            )}
          </Button>
        </div>

        {/* Tautan share */}
        {isPublic && shareUrl && (
          <div className="flex items-center gap-2">
            <Input
              readOnly
              value={shareUrl}
              onFocus={(e) => e.currentTarget.select()}
              className="font-mono text-xs"
            />
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={handleCopy}
              title="Salin tautan"
              className="shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              asChild
              title="Buka tautan"
              className="shrink-0"
            >
              <a href={shareUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
