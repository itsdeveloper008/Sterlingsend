"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Loader2, Plus, Type } from "lucide-react";
import { PDFDocument } from "@cantoo/pdf-lib";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  canvasToJpegBytes,
  openPdfDocument,
  renderPageToCanvas,
} from "@/features/pdf-tools/lib/engine/pdfjs-helpers";
import { stemName } from "@/features/pdf-tools/lib/download";

export type EditPdfHandle = {
  exportEdited: () => Promise<{
    name: string;
    bytes: Uint8Array;
    mime: string;
  }>;
  ready: boolean;
};

type TextBlock = {
  id: string;
  pageIndex: number;
  text: string;
  x: number;
  y: number;
  w: number;
  h: number;
  fontSize: number;
  scale: number;
};

type PageModel = {
  pageIndex: number;
  width: number;
  height: number;
  imageUrl: string;
  pdfWidth: number;
  pdfHeight: number;
};

type RawItem = {
  str: string;
  x: number;
  y: number;
  w: number;
  h: number;
  fontSize: number;
};

function uid() {
  return `t-${Math.random().toString(36).slice(2, 10)}`;
}

function groupIntoLines(items: RawItem[]): RawItem[] {
  if (!items.length) return [];
  const sorted = [...items].sort((a, b) => a.y - b.y || a.x - b.x);
  const lines: RawItem[][] = [];
  let current: RawItem[] = [];
  let lineY = sorted[0].y;

  for (const item of sorted) {
    const threshold = Math.max(item.h, 10) * 0.6;
    if (current.length && Math.abs(item.y - lineY) > threshold) {
      lines.push(current);
      current = [item];
      lineY = item.y;
    } else {
      current.push(item);
      lineY =
        current.reduce((sum, it) => sum + it.y, 0) / Math.max(current.length, 1);
    }
  }
  if (current.length) lines.push(current);

  return lines.map((line) => {
    const ordered = [...line].sort((a, b) => a.x - b.x);
    const text = ordered
      .map((it, i) => {
        if (i === 0) return it.str;
        const gap = it.x - (ordered[i - 1].x + ordered[i - 1].w);
        const space = gap > ordered[i - 1].fontSize * 0.2 ? " " : "";
        return space + it.str;
      })
      .join("");
    const x = Math.min(...ordered.map((it) => it.x));
    const y = Math.min(...ordered.map((it) => it.y));
    const right = Math.max(...ordered.map((it) => it.x + it.w));
    const bottom = Math.max(...ordered.map((it) => it.y + it.h));
    const fontSize =
      ordered.reduce((sum, it) => sum + it.fontSize, 0) / ordered.length;
    return {
      str: text,
      x,
      y,
      w: Math.max(right - x, fontSize * 2),
      h: Math.max(bottom - y, fontSize),
      fontSize,
    };
  });
}

async function buildPageModels(file: File, displayScale: number) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const pdf = await openPdfDocument(bytes);
  const pages: PageModel[] = [];
  const blocks: TextBlock[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: displayScale });
    const { canvas } = await renderPageToCanvas(pdf, pageNumber, displayScale);
    const imageUrl = canvas.toDataURL("image/jpeg", 0.92);
    const baseViewport = page.getViewport({ scale: 1 });

    pages.push({
      pageIndex: pageNumber - 1,
      width: viewport.width,
      height: viewport.height,
      imageUrl,
      pdfWidth: baseViewport.width,
      pdfHeight: baseViewport.height,
    });

    const content = await page.getTextContent();
    const raw: RawItem[] = [];

    for (const item of content.items) {
      if (!("str" in item) || typeof item.str !== "string") continue;
      if (!item.str.trim()) continue;
      if (!("transform" in item) || !Array.isArray(item.transform)) continue;

      const tx = item.transform as number[];
      const fontSizePdf = Math.hypot(tx[0] || 0, tx[1] || 0) || 10;
      const fontSize = fontSizePdf * displayScale;
      const [vx, vy] = viewport.convertToViewportPoint(tx[4], tx[5]);
      const widthPdf =
        typeof item.width === "number" && item.width > 0
          ? item.width
          : fontSizePdf * Math.max(item.str.length * 0.5, 1);
      const w = widthPdf * displayScale;
      // PDF baseline maps to viewport; glyphs sit mostly above the baseline.
      const h = fontSize * 1.05;
      const x = vx;
      const y = vy - fontSize;

      raw.push({
        str: item.str,
        x,
        y,
        w: Math.max(w, fontSize * 0.35),
        h,
        fontSize: Math.max(fontSize, 8),
      });
    }

    for (const line of groupIntoLines(raw)) {
      blocks.push({
        id: uid(),
        pageIndex: pageNumber - 1,
        text: line.str,
        x: line.x,
        y: line.y,
        w: Math.max(line.w, line.fontSize * 2),
        h: line.h,
        fontSize: line.fontSize,
        scale: displayScale,
      });
    }
  }

  return { pages, blocks };
}

function EditableLine({
  block,
  selected,
  onSelect,
  onCommit,
}: {
  block: TextBlock;
  selected: boolean;
  onSelect: () => void;
  onCommit: (text: string, width: number, height: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (document.activeElement === el) return;
    if (el.innerText !== block.text) el.innerText = block.text;
  }, [block.text]);

  return (
    <div
      ref={ref}
      className={cn(
        "absolute overflow-hidden rounded-[2px] border bg-white/95 text-slate-900 shadow-sm outline-none",
        selected
          ? "border-primary ring-2 ring-primary/30"
          : "border-transparent hover:border-primary/40",
      )}
      style={{
        left: block.x,
        top: block.y,
        minWidth: Math.max(block.w, block.fontSize * 2),
        minHeight: block.h,
        fontSize: block.fontSize,
        lineHeight: 1.2,
        fontFamily: "Helvetica, Arial, sans-serif",
        padding: "1px 2px",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}
      contentEditable
      suppressContentEditableWarning
      onFocus={onSelect}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onBlur={(e) => {
        const el = e.currentTarget;
        onCommit(
          el.innerText.replace(/\u00a0/g, " "),
          Math.max(el.offsetWidth, block.fontSize * 2),
          Math.max(el.offsetHeight, block.fontSize),
        );
      }}
      onInput={(e) => {
        const el = e.currentTarget;
        onCommit(
          el.innerText.replace(/\u00a0/g, " "),
          Math.max(el.offsetWidth, block.fontSize * 2),
          Math.max(el.offsetHeight, block.fontSize),
        );
      }}
    />
  );
}

export const EditPdfEditor = forwardRef<
  EditPdfHandle,
  {
    file: File;
    className?: string;
    onReadyChange?: (ready: boolean) => void;
  }
>(function EditPdfEditor({ file, className, onReadyChange }, ref) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pages, setPages] = useState<PageModel[]>([]);
  const [blocks, setBlocks] = useState<TextBlock[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const [ready, setReady] = useState(false);
  const blocksRef = useRef<TextBlock[]>([]);
  const displayScale = 1.35;

  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setReady(false);
    onReadyChange?.(false);
    setError("");
    setSelectedId(null);
    setPageIndex(0);
    setPlacing(false);

    (async () => {
      try {
        const model = await buildPageModels(file, displayScale);
        if (!alive) return;
        setPages(model.pages);
        setBlocks(model.blocks);
        setReady(true);
        onReadyChange?.(true);
      } catch (err) {
        if (!alive) return;
        setError(
          err instanceof Error
            ? err.message
            : "Could not open this PDF for editing.",
        );
        setReady(false);
        onReadyChange?.(false);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
      onReadyChange?.(false);
    };
  }, [file, onReadyChange]);

  const pageBlocks = useMemo(
    () => blocks.filter((b) => b.pageIndex === pageIndex),
    [blocks, pageIndex],
  );
  const currentPage = pages[pageIndex];

  const exportEdited = useCallback(async () => {
    if (!pages.length) throw new Error("Nothing to export yet.");
    const active = document.activeElement;
    if (active instanceof HTMLElement) active.blur();
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
    const latestBlocks = blocksRef.current;

    const bytes = new Uint8Array(await file.arrayBuffer());
    const pdf = await openPdfDocument(bytes);
    const out = await PDFDocument.create();
    const exportScale = 2;

    for (let i = 0; i < pages.length; i++) {
      const model = pages[i];
      const { canvas } = await renderPageToCanvas(pdf, i + 1, exportScale);
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not prepare page for export.");

      const scaleRatio = exportScale / displayScale;
      const pageBlocksAll = latestBlocks.filter((b) => b.pageIndex === i);

      ctx.fillStyle = "#ffffff";
      for (const block of pageBlocksAll) {
        const pad = Math.max(2, block.fontSize * 0.15) * scaleRatio;
        ctx.fillRect(
          block.x * scaleRatio - pad,
          block.y * scaleRatio - pad,
          Math.max(block.w * scaleRatio, block.fontSize * scaleRatio * 2) +
            pad * 2,
          block.h * scaleRatio + pad * 2,
        );
      }

      ctx.fillStyle = "#0f172a";
      ctx.textBaseline = "top";
      for (const block of pageBlocksAll) {
        if (!block.text.trim()) continue;
        const fontSize = block.fontSize * scaleRatio;
        ctx.font = `${fontSize}px Helvetica, Arial, sans-serif`;
        const lines = block.text.split(/\n/);
        let y = block.y * scaleRatio;
        for (const line of lines) {
          ctx.fillText(line, block.x * scaleRatio, y);
          y += fontSize * 1.25;
        }
      }

      const jpg = await canvasToJpegBytes(canvas, 0.92);
      const image = await out.embedJpg(jpg);
      const page = out.addPage([model.pdfWidth, model.pdfHeight]);
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: model.pdfWidth,
        height: model.pdfHeight,
      });
    }

    return {
      name: `${stemName(file)}-edited.pdf`,
      bytes: await out.save({ useObjectStreams: true }),
      mime: "application/pdf",
    };
  }, [file, pages]);

  useImperativeHandle(
    ref,
    () => ({
      exportEdited,
      ready,
    }),
    [exportEdited, ready],
  );

  if (loading) {
    return (
      <div
        className={cn(
          "flex min-h-[320px] items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-muted/20 text-sm text-muted-foreground",
          className,
        )}
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        Preparing editable preview…
      </div>
    );
  }

  if (error || !currentPage) {
    return (
      <div
        className={cn(
          "flex min-h-[200px] items-center justify-center rounded-2xl border border-border bg-muted/20 px-4 text-center text-sm text-muted-foreground",
          className,
        )}
      >
        {error || "No pages found."}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-foreground">
            Edit text on the PDF
          </p>
          <p className="text-xs text-muted-foreground">
            Click any line to change the words. Use Add text to place a new line.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant={placing ? "default" : "outline"}
            onClick={() => setPlacing((v) => !v)}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            {placing ? "Click the page…" : "Add text"}
          </Button>
          {pages.length > 1 ? (
            <div className="flex items-center gap-1">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={pageIndex <= 0}
                onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
              >
                Prev
              </Button>
              <span className="px-2 text-xs text-muted-foreground">
                Page {pageIndex + 1} / {pages.length}
              </span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={pageIndex >= pages.length - 1}
                onClick={() =>
                  setPageIndex((p) => Math.min(pages.length - 1, p + 1))
                }
              >
                Next
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      <div
        className={cn(
          "relative mx-auto w-full overflow-auto rounded-xl border border-border bg-white",
          placing && "cursor-crosshair",
        )}
        onClick={(e) => {
          if (!placing) return;
          const stage = e.currentTarget.querySelector("[data-edit-stage]");
          if (!(stage instanceof HTMLElement)) return;
          const rect = stage.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;
          const id = uid();
          setBlocks((prev) => [
            ...prev,
            {
              id,
              pageIndex,
              text: "New text",
              x,
              y,
              w: 180,
              h: 22,
              fontSize: 16,
              scale: displayScale,
            },
          ]);
          setSelectedId(id);
          setPlacing(false);
        }}
      >
        <div
          data-edit-stage
          className="relative mx-auto"
          style={{ width: currentPage.width, height: currentPage.height }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentPage.imageUrl}
            alt={`Page ${pageIndex + 1}`}
            className="pointer-events-none absolute inset-0 h-full w-full select-none"
            draggable={false}
          />

          {pageBlocks.map((block) => (
            <EditableLine
              key={block.id}
              block={block}
              selected={selectedId === block.id}
              onSelect={() => setSelectedId(block.id)}
              onCommit={(text, width, height) => {
                setBlocks((prev) =>
                  prev.map((b) =>
                    b.id === block.id
                      ? { ...b, text, w: width, h: height }
                      : b,
                  ),
                );
              }}
            />
          ))}
        </div>
      </div>

      {selectedId ? (
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Type className="h-3.5 w-3.5" />
          Selected text is editable. Clear it to remove words from that line.
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 text-destructive hover:text-destructive"
            onClick={() => {
              setBlocks((prev) => prev.filter((b) => b.id !== selectedId));
              setSelectedId(null);
            }}
          >
            Delete line
          </Button>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Tip: click a line of text to edit it directly on the page.
        </p>
      )}
    </div>
  );
});
