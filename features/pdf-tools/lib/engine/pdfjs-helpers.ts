"use client";

import type { PDFDocumentProxy } from "pdfjs-dist";

let workerReady = false;

export async function getPdfjs() {
  const pdfjs = await import("pdfjs-dist");
  if (!workerReady) {
    // Local worker via bundler URL — no unpkg CDN on first paint of the tool page
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url,
    ).toString();
    workerReady = true;
  }
  return pdfjs;
}

export async function openPdfDocument(data: Uint8Array) {
  const pdfjs = await getPdfjs();
  // Copy buffer so pdf.js can transfer/detach safely
  const copy = new Uint8Array(data.byteLength);
  copy.set(data);
  return pdfjs.getDocument({ data: copy }).promise;
}

export async function extractPageText(
  pdf: PDFDocumentProxy,
  pageNumber: number,
  /** columns: mark wide gaps (table columns) with a tab instead of a space. */
  options: { columns?: boolean } = {},
) {
  const page = await pdf.getPage(pageNumber);
  const content = await page.getTextContent();
  const lines: string[] = [];
  let current = "";
  let lastY: number | null = null;
  let lastXEnd: number | null = null;
  let pendingColumn = false;

  for (const item of content.items) {
    if (!("str" in item) || typeof item.str !== "string") continue;
    const transform =
      "transform" in item && Array.isArray(item.transform)
        ? item.transform
        : null;
    const y = transform ? Number(transform[5] ?? 0) : 0;
    const x = transform ? Number(transform[4] ?? 0) : 0;
    const fontSize = transform
      ? Math.abs(Number(transform[0] ?? transform[3] ?? 12)) || 12
      : 12;
    const width =
      "width" in item && typeof item.width === "number"
        ? item.width
        : item.str.length * fontSize * 0.5;
    const hasEOL =
      "hasEOL" in item && typeof item.hasEOL === "boolean" && item.hasEOL;

    if (lastY !== null && Math.abs(y - lastY) > Math.max(6, fontSize * 0.45)) {
      if (current.trim()) lines.push(current.trimEnd());
      current = "";
      lastXEnd = null;
      pendingColumn = false;
    }

    const gap = lastXEnd === null ? 0 : x - lastXEnd;
    const needsSpace =
      current.length > 0 &&
      !current.endsWith(" ") &&
      !current.endsWith("\n") &&
      !item.str.startsWith(" ") &&
      gap > fontSize * 0.28;

    // pdf.js often fills a column gap with one wide whitespace item.
    if (options.columns && !item.str.trim() && width > fontSize * 1.5) {
      if (current.length > 0) pendingColumn = true;
      lastXEnd = x + width;
      lastY = y;
      continue;
    }
    const columnBreak =
      options.columns &&
      current.length > 0 &&
      (pendingColumn || gap > fontSize * 1.5);
    pendingColumn = false;

    current +=
      (columnBreak ? "\t" : needsSpace ? " " : "") +
      (columnBreak ? item.str.trimStart() : item.str);
    lastXEnd = x + width;
    lastY = y;

    if (hasEOL) {
      if (current.trim()) lines.push(current.trimEnd());
      current = "";
      lastXEnd = null;
    }
  }
  if (current.trim()) lines.push(current.trimEnd());
  return lines.join("\n").trim();
}

export async function extractAllText(
  data: Uint8Array,
  options: { columns?: boolean } = {},
) {
  const pdf = await openPdfDocument(data);
  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    pages.push(await extractPageText(pdf, i, options));
  }
  return { pdf, pages, pageCount: pdf.numPages };
}

export async function renderPageToCanvas(
  pdf: PDFDocumentProxy,
  pageNumber: number,
  scale = 1.5,
) {
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create canvas for rendering.");
  await page.render({ canvasContext: ctx, viewport, canvas }).promise;
  return { canvas, viewport, page };
}

export function canvasToJpegBytes(canvas: HTMLCanvasElement, quality = 0.85) {
  return new Promise<Uint8Array>((resolve, reject) => {
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          reject(new Error("Failed to encode image."));
          return;
        }
        resolve(new Uint8Array(await blob.arrayBuffer()));
      },
      "image/jpeg",
      quality,
    );
  });
}

export function canvasToPngBytes(canvas: HTMLCanvasElement) {
  return new Promise<Uint8Array>((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        reject(new Error("Failed to encode image."));
        return;
      }
      resolve(new Uint8Array(await blob.arrayBuffer()));
    }, "image/png");
  });
}
