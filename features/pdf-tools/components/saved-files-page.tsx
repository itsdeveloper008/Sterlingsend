"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Download, FileText, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { routes } from "@/config/routes";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageHeader, PageShell } from "@/components/design-system";
import { formatFileSize } from "@/features/pdf-tools/lib/download";
import type { PdfHistoryItem } from "@/firebase/pdf-history";

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/** Files the user chose to keep after running a PDF tool. */
export function SavedFilesPage() {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<PdfHistoryItem[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PdfHistoryItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [openingId, setOpeningId] = useState<string | null>(null);

  const load = useCallback(async (uid: string) => {
    setLoadError(false);
    try {
      const { listPdfHistory } = await import("@/firebase/pdf-history");
      setItems(await listPdfHistory(uid));
    } catch (error) {
      console.error("[pdf-history] load failed", error);
      setLoadError(true);
      setItems([]);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setItems([]);
      return;
    }
    void load(user.uid);
  }, [authLoading, user, load]);

  async function onDownload(item: PdfHistoryItem) {
    setOpeningId(item.id);
    try {
      const { getPdfHistoryUrl } = await import("@/firebase/pdf-history");
      window.location.assign(await getPdfHistoryUrl(item));
    } catch (error) {
      console.error("[pdf-history] download failed", error);
      toast.error("Could not download this file. It may have been removed.");
    } finally {
      setOpeningId(null);
    }
  }

  async function onConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const { deletePdfHistoryItem } = await import("@/firebase/pdf-history");
      await deletePdfHistoryItem(deleteTarget);
      setItems((prev) => prev?.filter((i) => i.id !== deleteTarget.id) ?? prev);
      toast.success("File deleted");
      setDeleteTarget(null);
    } catch (error) {
      console.error("[pdf-history] delete failed", error);
      toast.error("Could not delete this file. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <PageShell className="ss-calm-zone">
      <PageHeader
        title="Saved files"
        description="Files you chose to keep after using the PDF tools."
        action={
          <ButtonLink href={routes.tools} variant="outline">
            Open PDF tools
          </ButtonLink>
        }
      />

      {loadError ? (
        <div className="rounded-[var(--radius-lg)] border border-destructive/30 bg-card px-6 py-10 text-center">
          <p className="text-sm text-foreground">Could not load your saved files.</p>
          <Button
            type="button"
            className="mt-4"
            onClick={() => user && void load(user.uid)}
          >
            Retry
          </Button>
        </div>
      ) : items === null ? (
        <div className="space-y-3" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-border-subtle bg-card px-6 py-16 text-center">
          <div
            className="ss-float clay mb-6 size-16 rounded-[28%] opacity-80"
            aria-hidden
          />
          <h2 className="type-h3 text-foreground">No saved files yet</h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            When you download a file from any PDF tool, choose Download &amp;
            save to keep it here.
          </p>
          <ButtonLink href={routes.tools} className="mt-6">
            Browse PDF tools
          </ButtonLink>
        </div>
      ) : (
        <ul className="divide-y divide-border-subtle overflow-hidden rounded-[var(--radius-lg)] border border-border-subtle bg-card">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center gap-3 px-4 py-3 sm:flex-nowrap"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary">
                <FileText className="h-5 w-5" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground" title={item.name}>
                  {item.name}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {[
                    item.toolTitle,
                    formatFileSize(item.size),
                    item.createdAt ? dateFormat.format(item.createdAt) : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={openingId === item.id}
                  onClick={() => void onDownload(item)}
                >
                  <Download className="mr-1.5 h-4 w-4" />
                  Download
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label={`Delete ${item.name}`}
                  onClick={() => setDeleteTarget(item)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeleteTarget(null);
        }}
        title="Delete file"
        description={
          <>
            This will permanently remove{" "}
            <span className="font-medium text-foreground">{deleteTarget?.name}</span>{" "}
            from your saved files. This cannot be undone.
          </>
        }
        confirmLabel="Delete file"
        destructive
        loading={deleting}
        onConfirm={() => void onConfirmDelete()}
      />
    </PageShell>
  );
}
