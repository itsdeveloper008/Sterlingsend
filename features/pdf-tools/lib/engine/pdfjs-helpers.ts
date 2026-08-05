"use client";

import type { PDFDocumentProxy } from "pdfjs-dist";

export async function getPdfjs() {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
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
) {
  const page = await pdf.getPage(pageNumber);
  const content = await page.getTextContent();
  const lines: string[] = [];
  let current = "";
  let lastY: number | null = null;

  for (const item of content.items) {
    if (!("str" in item) || typeof item.str !== "string") continue;
    const y = "transform" in item && Array.isArray(item.transform)
      ? Number(item.transform[5] ?? 0)
      : 0;
    if (lastY !== null && Math.abs(y - lastY) > 6 && current.trim()) {
      lines.push(current.trimEnd());
      current = "";
    }
    current += (current && !current.endsWith(" ") ? " " : "") + item.str;
    lastY = y;
  }
  if (current.trim()) lines.push(current.trimEnd());
  return lines.join("\n").trim();
}

export async function extractAllText(data: Uint8Array) {
  const pdf = await openPdfDocument(data);
  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    pages.push(await extractPageText(pdf, i));
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
