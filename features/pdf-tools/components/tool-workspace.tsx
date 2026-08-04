"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  FileUp,
  Loader2,
  Trash2,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { routes } from "@/config/routes";
import type { PdfTool } from "@/features/pdf-tools/catalog";
import { downloadBytes } from "@/features/pdf-tools/lib/download";
import { processTool } from "@/features/pdf-tools/lib/engine/process";
import type { ToolOptions } from "@/features/pdf-tools/lib/engine/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function acceptAttr(tool: PdfTool) {
  if (tool.accept === "image") return "image/jpeg,image/png,image/jpg,.jpg,.jpeg,.png";
  if (tool.accept === "pdf-or-image") {
    return "application/pdf,image/jpeg,image/png,.pdf,.jpg,.jpeg,.png";
  }
  return "application/pdf,.pdf";
}

function needsPages(slug: string) {
  return slug === "remove-pages" || slug === "extract-pages";
}

export function ToolWorkspace({ tool }: { tool: PdfTool }) {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [password, setPassword] = useState("");
  const [pages, setPages] = useState("1");
  const [rotation, setRotation] = useState<90 | 180 | 270>(90);
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [cropMargin, setCropMargin] = useState(36);
  const [redactBand, setRedactBand] = useState<"top" | "middle" | "bottom">(
    "middle",
  );
  const [pageOrder, setPageOrder] = useState<number[]>([]);

  const canRun = files.length >= tool.minFiles && !busy;

  const options: ToolOptions = useMemo(
    () => ({
      password,
      pages,
      rotation,
      watermarkText,
      cropMargin,
      redactBand,
      pageOrder: pageOrder.length ? pageOrder : undefined,
    }),
    [password, pages, rotation, watermarkText, cropMargin, redactBand, pageOrder],
  );

  const onFiles = useCallback(
    (list: FileList | null) => {
      if (!list?.length) return;
      const next = Array.from(list);
      setFiles((prev) => {
        const merged =
          tool.maxFiles === 1 ? next.slice(0, 1) : [...prev, ...next];
        const capped =
          tool.maxFiles > 0 ? merged.slice(0, tool.maxFiles) : merged;
        return capped;
      });
      if (tool.slug === "organize-pdf" && next[0]) {
        // page order filled after first process peek — default sequential later
        setPageOrder([]);
      }
    },
    [tool.maxFiles, tool.slug],
  );

  const moveFile = (index: number, dir: -1 | 1) => {
    setFiles((prev) => {
      const next = [...prev];
      const j = index + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  };

  const movePage = (index: number, dir: -1 | 1) => {
    setPageOrder((prev) => {
      const next = [...prev];
      const j = index + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  };

  async function ensureOrganizeOrder() {
    if (tool.slug !== "organize-pdf" || !files[0]) return;
    if (pageOrder.length) return;
    const { PDFDocument } = await import("@cantoo/pdf-lib");
    const bytes = new Uint8Array(await files[0].arrayBuffer());
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    setPageOrder(doc.getPageIndices());
  }

  async function onProcess() {
    if (tool.status === "soon") {
      toast.message("Server processing coming soon", {
        description: `${tool.title} will run in our processing pipeline. We’ll notify you when it’s ready.`,
      });
      return;
    }
    if (!canRun) return;
    setBusy(true);
    try {
      let order = pageOrder;
      if (tool.slug === "organize-pdf") {
        if (!order.length && files[0]) {
          const { PDFDocument } = await import("@cantoo/pdf-lib");
          const bytes = new Uint8Array(await files[0].arrayBuffer());
          const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
          order = doc.getPageIndices();
          setPageOrder(order);
        }
      }
      const result = await processTool({
        slug: tool.slug,
        files,
        options: { ...options, pageOrder: order.length ? order : undefined },
      });
      for (const out of result.files) {
        downloadBytes(out.bytes, out.name, out.mime);
      }
      toast.success(
        result.files.length === 1
          ? `Downloaded ${result.files[0].name}`
          : "Download ready",
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not process file",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href={routes.tools}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All PDF tools
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
            {tool.title}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {tool.description}
          </p>
        </div>
        <Badge
          className={
            tool.status === "ready"
              ? "bg-primary/15 text-primary hover:bg-primary/15"
              : undefined
          }
          variant={tool.status === "soon" ? "secondary" : "default"}
        >
          {tool.status === "ready" ? "Ready" : "Coming soon"}
        </Badge>
      </div>

      {tool.status === "soon" ? (
        <Card className="border-dashed border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base">Server processing coming soon</CardTitle>
            <CardDescription>
              You can still stage files here. Full conversion / OCR / signing for
              this tool will run on our processing pipeline — no fake downloads.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Files</CardTitle>
          <CardDescription>
            {tool.minFiles > 1
              ? `Add at least ${tool.minFiles} files.`
              : "Drop a file or browse from your device."}
            {tool.maxFiles > 1 ? ` Up to ${tool.maxFiles} files.` : null}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/40 px-6 py-12 text-center transition",
              "hover:border-primary/50 hover:bg-primary/5",
            )}
          >
            <FileUp className="h-8 w-8 text-primary" />
            <span className="text-sm font-medium text-foreground">
              Drop files here or click to browse
            </span>
            <span className="text-xs text-muted-foreground">
              Processing stays in your browser for Ready tools.
            </span>
            <input
              type="file"
              className="sr-only"
              accept={acceptAttr(tool)}
              multiple={tool.maxFiles !== 1}
              onChange={(e) => {
                onFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </label>

          {files.length > 0 ? (
            <ul className="space-y-2">
              {files.map((file, index) => (
                <li
                  key={`${file.name}-${index}`}
                  className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  <span className="min-w-0 flex-1 truncate font-medium">
                    {file.name}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(0)} KB
                  </span>
                  {tool.slug === "merge-pdf" || tool.slug === "jpg-to-pdf" ? (
                    <>
                      <button
                        type="button"
                        className="rounded p-1 text-muted-foreground hover:text-foreground"
                        onClick={() => moveFile(index, -1)}
                        aria-label="Move up"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        className="rounded p-1 text-muted-foreground hover:text-foreground"
                        onClick={() => moveFile(index, 1)}
                        aria-label="Move down"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    </>
                  ) : null}
                  <button
                    type="button"
                    className="rounded p-1 text-muted-foreground hover:text-destructive"
                    onClick={() =>
                      setFiles((prev) => prev.filter((_, i) => i !== index))
                    }
                    aria-label="Remove file"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </CardContent>
      </Card>

      <ToolOptionsPanel
        tool={tool}
        password={password}
        setPassword={setPassword}
        pages={pages}
        setPages={setPages}
        rotation={rotation}
        setRotation={setRotation}
        watermarkText={watermarkText}
        setWatermarkText={setWatermarkText}
        cropMargin={cropMargin}
        setCropMargin={setCropMargin}
        redactBand={redactBand}
        setRedactBand={setRedactBand}
        pageOrder={pageOrder}
        ensureOrganizeOrder={ensureOrganizeOrder}
        movePage={movePage}
        needsPages={needsPages(tool.slug)}
      />

      <div className="flex flex-wrap gap-3">
        <Button onClick={onProcess} disabled={!canRun && tool.status === "ready"}>
          {busy ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing…
            </>
          ) : tool.status === "soon" ? (
            "Notify me when ready"
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Process & download
            </>
          )}
        </Button>
        {files.length > 0 ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setFiles([]);
              setPageOrder([]);
            }}
          >
            Clear files
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function ToolOptionsPanel({
  tool,
  password,
  setPassword,
  pages,
  setPages,
  rotation,
  setRotation,
  watermarkText,
  setWatermarkText,
  cropMargin,
  setCropMargin,
  redactBand,
  setRedactBand,
  pageOrder,
  ensureOrganizeOrder,
  movePage,
  needsPages,
}: {
  tool: PdfTool;
  password: string;
  setPassword: (v: string) => void;
  pages: string;
  setPages: (v: string) => void;
  rotation: 90 | 180 | 270;
  setRotation: (v: 90 | 180 | 270) => void;
  watermarkText: string;
  setWatermarkText: (v: string) => void;
  cropMargin: number;
  setCropMargin: (v: number) => void;
  redactBand: "top" | "middle" | "bottom";
  setRedactBand: (v: "top" | "middle" | "bottom") => void;
  pageOrder: number[];
  ensureOrganizeOrder: () => Promise<void>;
  movePage: (index: number, dir: -1 | 1) => void;
  needsPages: boolean;
}) {
  const showPassword =
    tool.slug === "protect-pdf" || tool.slug === "unlock-pdf";
  const showRotation = tool.slug === "rotate-pdf";
  const showWatermark = tool.slug === "watermark";
  const showCrop = tool.slug === "crop-pdf";
  const showRedact = tool.slug === "redact-pdf";
  const showOrganize = tool.slug === "organize-pdf";

  if (
    !showPassword &&
    !needsPages &&
    !showRotation &&
    !showWatermark &&
    !showCrop &&
    !showRedact &&
    !showOrganize
  ) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Options</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        {showPassword ? (
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="pdf-password">
              {tool.slug === "unlock-pdf" ? "Current password" : "New password"}
            </Label>
            <Input
              id="pdf-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
        ) : null}

        {needsPages ? (
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="pdf-pages">Pages (e.g. 1,3-5)</Label>
            <Input
              id="pdf-pages"
              value={pages}
              onChange={(e) => setPages(e.target.value)}
              placeholder="1-3,7"
            />
          </div>
        ) : null}

        {showRotation ? (
          <div className="space-y-2">
            <Label htmlFor="pdf-rotation">Rotation</Label>
            <select
              id="pdf-rotation"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              value={rotation}
              onChange={(e) =>
                setRotation(Number(e.target.value) as 90 | 180 | 270)
              }
            >
              <option value={90}>90°</option>
              <option value={180}>180°</option>
              <option value={270}>270°</option>
            </select>
          </div>
        ) : null}

        {showWatermark ? (
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="pdf-watermark">Watermark text</Label>
            <Input
              id="pdf-watermark"
              value={watermarkText}
              onChange={(e) => setWatermarkText(e.target.value)}
            />
          </div>
        ) : null}

        {showCrop ? (
          <div className="space-y-2">
            <Label htmlFor="pdf-crop">Margin (points)</Label>
            <Input
              id="pdf-crop"
              type="number"
              min={0}
              max={200}
              value={cropMargin}
              onChange={(e) => setCropMargin(Number(e.target.value) || 0)}
            />
          </div>
        ) : null}

        {showRedact ? (
          <div className="space-y-2">
            <Label htmlFor="pdf-redact">Redact band</Label>
            <select
              id="pdf-redact"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              value={redactBand}
              onChange={(e) =>
                setRedactBand(e.target.value as "top" | "middle" | "bottom")
              }
            >
              <option value="top">Top</option>
              <option value="middle">Middle</option>
              <option value="bottom">Bottom</option>
            </select>
          </div>
        ) : null}

        {showOrganize ? (
          <div className="space-y-3 sm:col-span-2">
            <div className="flex items-center justify-between gap-2">
              <Label>Page order</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => void ensureOrganizeOrder()}
              >
                Load pages
              </Button>
            </div>
            {pageOrder.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Add a PDF, then load pages to reorder them.
              </p>
            ) : (
              <ul className="space-y-1">
                {pageOrder.map((pageIndex, i) => (
                  <li
                    key={`${pageIndex}-${i}`}
                    className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm"
                  >
                    <span className="flex-1">Page {pageIndex + 1}</span>
                    <button
                      type="button"
                      className="rounded p-1 text-muted-foreground hover:text-foreground"
                      onClick={() => movePage(i, -1)}
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      className="rounded p-1 text-muted-foreground hover:text-foreground"
                      onClick={() => movePage(i, 1)}
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
