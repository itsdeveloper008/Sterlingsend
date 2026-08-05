"use client";

import { useEffect, useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  openPdfDocument,
  renderPageToCanvas,
} from "@/features/pdf-tools/lib/engine/pdfjs-helpers";

type PageThumb = {
  page: number;
  url: string;
  width: number;
  height: number;
};

type PreviewState =
  | { kind: "loading" }
  | { kind: "pages"; pages: PageThumb[]; pageCount: number }
  | { kind: "image"; url: string }
  | { kind: "fallback"; label: string }
  | { kind: "error"; message: string };

function isPdf(file: File) {
  return (
    file.type === "application/pdf" ||
    /\.pdf$/i.test(file.name)
  );
}

function isImage(file: File) {
  return (
    file.type.startsWith("image/") ||
    /\.(jpe?g|png|gif|webp)$/i.test(file.name)
  );
}

async function buildPdfPreview(file: File): Promise<PreviewState> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const pdf = await openPdfDocument(bytes);
  const pageCount = pdf.numPages;
  // Cap thumbnails so large docs stay snappy; still show full page count.
  const limit = Math.min(pageCount, 24);
  const pages: PageThumb[] = [];

  for (let i = 1; i <= limit; i++) {
    const { canvas } = await renderPageToCanvas(pdf, i, pageCount === 1 ? 1.25 : 0.7);
    pages.push({
      page: i,
      url: canvas.toDataURL("image/jpeg", 0.88),
      width: canvas.width,
      height: canvas.height,
    });
  }

  return { kind: "pages", pages, pageCount };
}

export function FilePreview({
  file,
  index,
  className,
}: {
  file: File;
  index: number;
  className?: string;
}) {
  const [state, setState] = useState<PreviewState>({ kind: "loading" });

  useEffect(() => {
    let alive = true;
    const objectUrls: string[] = [];

    (async () => {
      try {
        if (isPdf(file)) {
          const next = await buildPdfPreview(file);
          if (alive) setState(next);
          return;
        }

        if (isImage(file)) {
          const url = URL.createObjectURL(file);
          objectUrls.push(url);
          if (alive) setState({ kind: "image", url });
          return;
        }

        if (alive) {
          setState({
            kind: "fallback",
            label: file.name.split(".").pop()?.toUpperCase() || "FILE",
          });
        }
      } catch {
        if (alive) {
          setState({
            kind: "error",
            message: "Could not preview this file.",
          });
        }
      }
    })();

    return () => {
      alive = false;
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [file]);

  return (
    <div className={cn("space-y-3", className)}>
      {state.kind === "loading" ? (
        <div className="flex min-h-[220px] items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-muted/20 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Rendering preview…
        </div>
      ) : null}

      {state.kind === "error" ? (
        <div className="flex min-h-[120px] items-center justify-center rounded-2xl border border-border bg-muted/20 px-4 text-center text-sm text-muted-foreground">
          {state.message}
        </div>
      ) : null}

      {state.kind === "fallback" ? (
        <div className="flex min-h-[180px] flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-muted/20">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <FileText className="h-7 w-7" />
          </span>
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {state.label}
          </span>
        </div>
      ) : null}

      {state.kind === "image" ? (
        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={state.url}
            alt={`Preview of ${file.name}`}
            className="mx-auto max-h-[520px] w-full object-contain"
          />
        </div>
      ) : null}

      {state.kind === "pages" ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-foreground">
              Document preview
            </p>
            <p className="text-xs text-muted-foreground">
              {state.pageCount} page{state.pageCount === 1 ? "" : "s"}
              {state.pageCount > state.pages.length
                ? ` · showing first ${state.pages.length}`
                : ""}
            </p>
          </div>
          <div
            className={cn(
              "grid gap-3",
              state.pages.length === 1
                ? "grid-cols-1"
                : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
            )}
          >
            {state.pages.map((page) => (
              <figure
                key={page.page}
                className="overflow-hidden rounded-xl border border-border bg-white"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={page.url}
                  alt={`Page ${page.page}`}
                  className="block w-full h-auto"
                />
                {state.pages.length > 1 ? (
                  <figcaption className="border-t border-border/60 px-2 py-1.5 text-center text-[11px] font-medium text-muted-foreground">
                    Page {page.page}
                  </figcaption>
                ) : null}
              </figure>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-[11px] font-bold text-primary">
          {index + 1}
        </span>
        <span className="min-w-0 truncate font-medium text-foreground">
          {file.name}
        </span>
        <span className="shrink-0">{(file.size / 1024).toFixed(0)} KB</span>
      </div>
    </div>
  );
}
