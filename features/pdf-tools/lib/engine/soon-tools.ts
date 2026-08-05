"use client";

import { PDFDocument, StandardFonts, rgb, PDFTextField } from "@cantoo/pdf-lib";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import * as XLSX from "xlsx";
import mammoth from "mammoth";
import { jsPDF } from "jspdf";
import { stemName } from "@/features/pdf-tools/lib/download";
import {
  canvasToJpegBytes,
  extractAllText,
  extractPageText,
  openPdfDocument,
  renderPageToCanvas,
} from "@/features/pdf-tools/lib/engine/pdfjs-helpers";
import type { ProcessResult, ToolOptions } from "@/features/pdf-tools/lib/engine/types";

type PptxSlide = {
  addImage: (options: {
    data: string;
    x: number;
    y: number;
    w: string;
    h: string;
  }) => void;
  addNotes: (notes: string) => void;
};

type PptxInstance = {
  author: string;
  title: string;
  addSlide: () => PptxSlide;
  write: (options: { outputType: "arraybuffer" }) => Promise<ArrayBuffer>;
};

type PptxConstructor = new () => PptxInstance;

declare global {
  interface Window {
    PptxGenJS?: PptxConstructor;
  }
}

let pptxLoader: Promise<PptxConstructor> | null = null;

function loadPptxGenJs() {
  if (window.PptxGenJS) return Promise.resolve(window.PptxGenJS);
  if (pptxLoader) return pptxLoader;

  pptxLoader = new Promise<PptxConstructor>((resolve, reject) => {
    const script = document.createElement("script");
    script.src =
      "https://unpkg.com/pptxgenjs@4.0.1/dist/pptxgen.bundle.js";
    script.async = true;
    script.onload = () => {
      if (window.PptxGenJS) resolve(window.PptxGenJS);
      else reject(new Error("PowerPoint converter failed to initialize."));
    };
    script.onerror = () =>
      reject(new Error("Could not load the PowerPoint converter."));
    document.head.appendChild(script);
  });

  return pptxLoader;
}

async function readBytes(file: File) {
  return new Uint8Array(await file.arrayBuffer());
}

async function savePdf(doc: PDFDocument) {
  return doc.save({ useObjectStreams: true });
}

function winAnsiSafe(text: string) {
  return text
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, "?");
}

async function translateChunks(texts: string[], targetLang: string) {
  const lang = targetLang || "es";
  const out: string[] = [];

  for (const text of texts) {
    if (!text.trim()) {
      out.push("");
      continue;
    }
    // MyMemory free endpoint, chunked to stay under query limits
    const chunks = text.match(/[\s\S]{1,450}/g) ?? [text];
    const translated: string[] = [];
    for (const chunk of chunks) {
      try {
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=en|${encodeURIComponent(lang)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("translate failed");
        const data = (await res.json()) as {
          responseData?: { translatedText?: string };
        };
        translated.push(data.responseData?.translatedText || chunk);
      } catch {
        translated.push(chunk);
      }
    }
    out.push(translated.join(""));
  }
  return out;
}

/* -------------------------------------------------------------------------- */
/* Repair                                                                      */
/* -------------------------------------------------------------------------- */

export async function repairPdf(file: File): Promise<ProcessResult> {
  const bytes = await readBytes(file);
  const out = await PDFDocument.create();
  let recovered = 0;

  try {
    const src = await PDFDocument.load(bytes, {
      ignoreEncryption: true,
      updateMetadata: false,
    });
    const indices = src.getPageIndices();
    for (const i of indices) {
      try {
        const [page] = await out.copyPages(src, [i]);
        out.addPage(page);
        recovered += 1;
      } catch {
        // skip broken page
      }
    }
  } catch {
    // Fall back to rendering recoverable pages via pdf.js
    try {
      const pdf = await openPdfDocument(bytes);
      for (let i = 1; i <= pdf.numPages; i++) {
        try {
          const { canvas } = await renderPageToCanvas(pdf, i, 1.4);
          const jpg = await canvasToJpegBytes(canvas, 0.9);
          const image = await out.embedJpg(jpg);
          const page = out.addPage([image.width, image.height]);
          page.drawImage(image, {
            x: 0,
            y: 0,
            width: image.width,
            height: image.height,
          });
          recovered += 1;
        } catch {
          // skip
        }
      }
    } catch {
      throw new Error("Could not recover any pages from this PDF.");
    }
  }

  if (recovered === 0) {
    throw new Error("Could not recover any pages from this PDF.");
  }

  out.setProducer("SterlingSend Repair");
  out.setCreator("SterlingSend");

  return {
    files: [
      {
        name: `${stemName(file)}-repaired.pdf`,
        bytes: await savePdf(out),
        mime: "application/pdf",
      },
    ],
  };
}

/* -------------------------------------------------------------------------- */
/* OCR                                                                         */
/* -------------------------------------------------------------------------- */

export async function ocrPdf(file: File, options: ToolOptions): Promise<ProcessResult> {
  const lang = options.ocrLang || "eng";
  const bytes = await readBytes(file);
  const pdf = await openPdfDocument(bytes);
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker(lang);
  const out = await PDFDocument.create();
  const font = await out.embedFont(StandardFonts.Helvetica);

  try {
    for (let i = 1; i <= pdf.numPages; i++) {
      const { canvas } = await renderPageToCanvas(pdf, i, 2);
      const {
        data: { text },
      } = await worker.recognize(canvas);
      const jpg = await canvasToJpegBytes(canvas, 0.88);
      const image = await out.embedJpg(jpg);
      const page = out.addPage([image.width, image.height]);
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height,
      });

      // Invisible selectable text layer for search
      const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
      let y = image.height - 28;
      for (const line of lines.slice(0, 80)) {
        const safe = winAnsiSafe(line).slice(0, 120);
        if (!safe) continue;
        page.drawText(safe, {
          x: 24,
          y: Math.max(12, y),
          size: 9,
          font,
          color: rgb(1, 1, 1),
          opacity: 0.01,
        });
        y -= 12;
      }
    }
  } finally {
    await worker.terminate();
  }

  return {
    files: [
      {
        name: `${stemName(file)}-ocr.pdf`,
        bytes: await savePdf(out),
        mime: "application/pdf",
      },
    ],
  };
}

/* -------------------------------------------------------------------------- */
/* PDF → Word / PPT / Excel / Markdown                                         */
/* -------------------------------------------------------------------------- */

export async function pdfToWord(file: File): Promise<ProcessResult> {
  const { pages } = await extractAllText(await readBytes(file));
  const children: Paragraph[] = [
    new Paragraph({
      text: stemName(file),
      heading: HeadingLevel.HEADING_1,
    }),
  ];

  pages.forEach((text, index) => {
    children.push(
      new Paragraph({
        text: `Page ${index + 1}`,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 120 },
      }),
    );
    const lines = text ? text.split(/\n/) : ["(No extractable text on this page)"];
    for (const line of lines) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: line || " ", size: 22 })],
          spacing: { after: 80 },
        }),
      );
    }
  });

  const doc = new Document({ sections: [{ children }] });
  const buffer = await Packer.toArrayBuffer(doc);
  return {
    files: [
      {
        name: `${stemName(file)}.docx`,
        bytes: new Uint8Array(buffer),
        mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      },
    ],
  };
}

export async function pdfToPowerpoint(file: File): Promise<ProcessResult> {
  const bytes = await readBytes(file);
  const pdf = await openPdfDocument(bytes);
  const PptxGenJS = await loadPptxGenJs();
  const pptx = new PptxGenJS();
  pptx.author = "SterlingSend";
  pptx.title = stemName(file);

  for (let i = 1; i <= pdf.numPages; i++) {
    const { canvas } = await renderPageToCanvas(pdf, i, 1.6);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
    const slide = pptx.addSlide();
    slide.addImage({
      data: dataUrl,
      x: 0,
      y: 0,
      w: "100%",
      h: "100%",
    });
    const text = await extractPageText(pdf, i);
    if (text) {
      slide.addNotes(text.slice(0, 4000));
    }
  }

  const output = (await pptx.write({ outputType: "arraybuffer" })) as ArrayBuffer;
  return {
    files: [
      {
        name: `${stemName(file)}.pptx`,
        bytes: new Uint8Array(output),
        mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      },
    ],
  };
}

export async function pdfToExcel(file: File): Promise<ProcessResult> {
  const { pages } = await extractAllText(await readBytes(file));
  const workbook = XLSX.utils.book_new();

  pages.forEach((text, index) => {
    const rows = (text || "(No extractable text)")
      .split(/\n/)
      .map((line) => {
        if (line.includes("\t")) return line.split("\t");
        if (line.includes("|")) {
          return line.split("|").map((c) => c.trim()).filter(Boolean);
        }
        // Split on 2+ spaces for loosely tabular content
        const parts = line.split(/\s{2,}/).map((c) => c.trim()).filter(Boolean);
        return parts.length > 1 ? parts : [line];
      });
    const sheet = XLSX.utils.aoa_to_sheet(rows.length ? rows : [["(empty)"]]);
    XLSX.utils.book_append_sheet(workbook, sheet, `Page ${index + 1}`.slice(0, 31));
  });

  const out = XLSX.write(workbook, { type: "array", bookType: "xlsx" }) as number[];
  return {
    files: [
      {
        name: `${stemName(file)}.xlsx`,
        bytes: new Uint8Array(out),
        mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    ],
  };
}

export async function pdfToMarkdown(file: File): Promise<ProcessResult> {
  const { pages } = await extractAllText(await readBytes(file));
  const parts = [`# ${stemName(file)}`, ""];

  pages.forEach((text, index) => {
    parts.push(`## Page ${index + 1}`, "");
    if (!text.trim()) {
      parts.push("_No extractable text on this page._", "");
      return;
    }
    for (const line of text.split(/\n/)) {
      const trimmed = line.trim();
      if (!trimmed) {
        parts.push("");
        continue;
      }
      if (/^#{1,6}\s/.test(trimmed)) {
        parts.push(trimmed);
      } else if (/^[-*•]\s+/.test(trimmed)) {
        parts.push(`- ${trimmed.replace(/^[-*•]\s+/, "")}`);
      } else if (/^\d+[\.)]\s+/.test(trimmed)) {
        parts.push(trimmed);
      } else if (trimmed === trimmed.toUpperCase() && trimmed.length < 80 && /[A-Z]/.test(trimmed)) {
        parts.push(`### ${trimmed}`);
      } else {
        parts.push(trimmed);
      }
    }
    parts.push("");
  });

  const md = parts.join("\n");
  return {
    files: [
      {
        name: `${stemName(file)}.md`,
        bytes: new TextEncoder().encode(md),
        mime: "text/markdown",
      },
    ],
  };
}

/* -------------------------------------------------------------------------- */
/* Word / HTML → PDF                                                           */
/* -------------------------------------------------------------------------- */

export async function wordToPdf(files: File[]): Promise<ProcessResult> {
  const results: ProcessResult["files"] = [];

  for (const file of files) {
    if (!/\.docx$/i.test(file.name)) {
      throw new Error("Word to PDF supports .docx files. Save as DOCX and try again.");
    }
    const arrayBuffer = await file.arrayBuffer();
    const { value: html } = await mammoth.convertToHtml({ arrayBuffer });
    const bytes = await htmlStringToPdf(html, stemName(file));
    results.push({
      name: `${stemName(file)}.pdf`,
      bytes,
      mime: "application/pdf",
    });
  }

  if (results.length === 1) return { files: results };

  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  results.forEach((f) => zip.file(f.name, f.bytes));
  return {
    files: [
      {
        name: "word-to-pdf.zip",
        bytes: await zip.generateAsync({ type: "uint8array" }),
        mime: "application/zip",
      },
    ],
  };
}

export async function htmlToPdf(file: File | null, options: ToolOptions): Promise<ProcessResult> {
  let html = options.htmlContent?.trim() || "";
  let name = "document";

  if (file) {
    name = stemName(file);
    if (!html) {
      html = await file.text();
    }
  }

  if (!html) {
    throw new Error("Paste HTML or upload an .html file.");
  }

  // If user pasted a URL, wrap a note (cannot fetch arbitrary URLs client-side due to CORS)
  if (/^https?:\/\//i.test(html) && !html.includes("<")) {
    throw new Error(
      "Paste HTML source or upload an .html file. Live webpage URLs cannot be fetched from the browser due to CORS.",
    );
  }

  const bytes = await htmlStringToPdf(html, name);
  return {
    files: [{ name: `${name}.pdf`, bytes, mime: "application/pdf" }],
  };
}

async function htmlStringToPdf(html: string, title: string) {
  const container = document.createElement("div");
  container.setAttribute("data-html-pdf-root", "true");
  container.style.cssText = [
    "position:fixed",
    "left:-10000px",
    "top:0",
    "width:794px",
    "padding:48px",
    "background:#ffffff",
    "color:#0f172a",
    "font:16px/1.55 Helvetica,Arial,sans-serif",
    "z-index:-1",
  ].join(";");
  container.innerHTML = `
    <h1 style="font-size:22px;margin:0 0 16px;font-family:Helvetica,Arial,sans-serif;">${escapeHtml(title)}</h1>
    <div class="html-body">${html}</div>
  `;
  document.body.appendChild(container);

  try {
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      windowWidth: 794,
    });

    const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const imgData = canvas.toDataURL("image/jpeg", 0.92);

    let heightLeft = imgHeight;
    let position = 0;
    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    return new Uint8Array(pdf.output("arraybuffer"));
  } finally {
    container.remove();
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* -------------------------------------------------------------------------- */
/* PDF/A                                                                       */
/* -------------------------------------------------------------------------- */

export async function pdfToPdfa(file: File): Promise<ProcessResult> {
  const bytes = await readBytes(file);
  let src: PDFDocument;
  try {
    src = await PDFDocument.load(bytes, { ignoreEncryption: true });
  } catch {
    throw new Error("Could not open this PDF for archival conversion.");
  }

  const out = await PDFDocument.create();
  const pages = await out.copyPages(src, src.getPageIndices());
  pages.forEach((p) => out.addPage(p));

  out.setTitle(src.getTitle() || stemName(file));
  out.setAuthor(src.getAuthor() || "SterlingSend");
  out.setSubject("PDF/A archival document");
  out.setKeywords(["PDF/A", "archive", "SterlingSend"]);
  out.setProducer("SterlingSend PDF/A");
  out.setCreator("SterlingSend");
  out.setCreationDate(new Date());
  out.setModificationDate(new Date());

  return {
    files: [
      {
        name: `${stemName(file)}-pdfa.pdf`,
        bytes: await savePdf(out),
        mime: "application/pdf",
      },
    ],
  };
}

/* -------------------------------------------------------------------------- */
/* Edit / Forms / Sign                                                         */
/* -------------------------------------------------------------------------- */

export async function editPdf(file: File, options: ToolOptions): Promise<ProcessResult> {
  const text = (options.editText || "").trim();
  if (!text) throw new Error("Enter the text you want to add to the PDF.");

  const doc = await PDFDocument.load(await readBytes(file), {
    ignoreEncryption: true,
  });
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const pages = doc.getPages();
  const pageIndex = Math.min(
    Math.max((options.editPage ?? 1) - 1, 0),
    pages.length - 1,
  );
  const page = pages[pageIndex];
  const { width, height } = page.getSize();
  const x = Math.min(Math.max(options.editX ?? 72, 12), width - 24);
  const yFromTop = options.editY ?? 72;
  const y = Math.min(Math.max(height - yFromTop, 12), height - 12);
  const size = Math.min(Math.max(options.editFontSize ?? 14, 8), 48);

  page.drawText(winAnsiSafe(text), {
    x,
    y,
    size,
    font,
    color: rgb(0.06, 0.09, 0.16),
  });

  return {
    files: [
      {
        name: `${stemName(file)}-edited.pdf`,
        bytes: await savePdf(doc),
        mime: "application/pdf",
      },
    ],
  };
}

export async function pdfForms(file: File, options: ToolOptions): Promise<ProcessResult> {
  const doc = await PDFDocument.load(await readBytes(file), {
    ignoreEncryption: true,
  });
  const form = doc.getForm();
  const fields = form.getFields();
  const font = await doc.embedFont(StandardFonts.Helvetica);

  if (fields.length > 0) {
    for (const field of fields) {
      if (!(field instanceof PDFTextField)) continue;
      const name = field.getName().toLowerCase();
      if (name.includes("email") && options.formEmail) {
        field.setText(options.formEmail);
      } else if ((name.includes("date") || name.includes("day")) && options.formDate) {
        field.setText(options.formDate);
      } else if (name.includes("name") && options.formName) {
        field.setText(options.formName);
      }
    }
    if (options.flattenForms !== false) {
      form.flatten();
    }
  } else {
    // No existing fields: stamp a clean fillable-style block on the last page
    const page = doc.getPages()[doc.getPageCount() - 1];
    const { width } = page.getSize();
    const blockY = 48;
    page.drawRectangle({
      x: 40,
      y: blockY,
      width: width - 80,
      height: 110,
      color: rgb(0.97, 0.98, 0.99),
      borderColor: rgb(0.8, 0.84, 0.88),
      borderWidth: 1,
    });
    page.drawText("Form details", {
      x: 56,
      y: blockY + 84,
      size: 11,
      font,
      color: rgb(0.06, 0.09, 0.16),
    });
    const rows = [
      ["Name", options.formName || ""],
      ["Email", options.formEmail || ""],
      ["Date", options.formDate || new Date().toISOString().slice(0, 10)],
    ];
    rows.forEach(([label, value], i) => {
      const y = blockY + 58 - i * 20;
      page.drawText(`${label}:`, {
        x: 56,
        y,
        size: 10,
        font,
        color: rgb(0.4, 0.45, 0.5),
      });
      page.drawText(winAnsiSafe(value || "-"), {
        x: 110,
        y,
        size: 10,
        font,
        color: rgb(0.06, 0.09, 0.16),
      });
    });
  }

  return {
    files: [
      {
        name: `${stemName(file)}-form.pdf`,
        bytes: await savePdf(doc),
        mime: "application/pdf",
      },
    ],
  };
}

export async function signPdf(file: File, options: ToolOptions): Promise<ProcessResult> {
  const signatureDataUrl = options.signatureDataUrl?.trim();
  if (!signatureDataUrl?.startsWith("data:image")) {
    throw new Error("Draw or upload a signature first.");
  }

  const doc = await PDFDocument.load(await readBytes(file), {
    ignoreEncryption: true,
  });
  const pages = doc.getPages();
  const pageIndex = Math.min(
    Math.max((options.signPage ?? pages.length) - 1, 0),
    pages.length - 1,
  );
  const page = pages[pageIndex];
  const { width } = page.getSize();

  const res = await fetch(signatureDataUrl);
  const imgBytes = new Uint8Array(await res.arrayBuffer());
  const isPng = signatureDataUrl.includes("image/png");
  const image = isPng ? await doc.embedPng(imgBytes) : await doc.embedJpg(imgBytes);

  const sigWidth = Math.min(180, width * 0.35);
  const sigHeight = (image.height / image.width) * sigWidth;
  const x = options.signX ?? width - sigWidth - 48;
  const y = options.signY ?? 48;

  page.drawImage(image, {
    x,
    y,
    width: sigWidth,
    height: sigHeight,
  });

  if (options.signerName?.trim()) {
    const font = await doc.embedFont(StandardFonts.Helvetica);
    page.drawText(winAnsiSafe(options.signerName.trim()), {
      x,
      y: y - 14,
      size: 9,
      font,
      color: rgb(0.25, 0.3, 0.35),
    });
  }

  return {
    files: [
      {
        name: `${stemName(file)}-signed.pdf`,
        bytes: await savePdf(doc),
        mime: "application/pdf",
      },
    ],
  };
}

/* -------------------------------------------------------------------------- */
/* Compare / Translate                                                         */
/* -------------------------------------------------------------------------- */

export async function comparePdf(files: File[]): Promise<ProcessResult> {
  if (files.length < 2) throw new Error("Add two PDFs to compare.");
  const [aFile, bFile] = files;
  const aBytes = await readBytes(aFile);
  const bBytes = await readBytes(bFile);
  const aPdf = await openPdfDocument(aBytes);
  const bPdf = await openPdfDocument(bBytes);
  const aText = await extractAllText(aBytes);
  const bText = await extractAllText(bBytes);

  const out = await PDFDocument.create();
  const font = await out.embedFont(StandardFonts.Helvetica);
  const bold = await out.embedFont(StandardFonts.HelveticaBold);

  // Summary page
  const summary = out.addPage([595.28, 841.89]);
  summary.drawText("PDF comparison report", {
    x: 48,
    y: 780,
    size: 20,
    font: bold,
    color: rgb(0.06, 0.09, 0.16),
  });
  const summaryLines = [
    `File A: ${aFile.name} (${aPdf.numPages} pages)`,
    `File B: ${bFile.name} (${bPdf.numPages} pages)`,
    "",
    "Text differences by page:",
  ];
  const maxPages = Math.max(aPdf.numPages, bPdf.numPages);
  let changed = 0;
  for (let i = 0; i < maxPages; i++) {
    const left = (aText.pages[i] || "").trim();
    const right = (bText.pages[i] || "").trim();
    const same = left === right;
    if (!same) changed += 1;
    summaryLines.push(
      `Page ${i + 1}: ${same ? "identical text" : "text differs"}`,
    );
  }
  summaryLines.splice(3, 0, `Pages with text changes: ${changed} / ${maxPages}`, "");

  let y = 740;
  for (const line of summaryLines) {
    summary.drawText(winAnsiSafe(line).slice(0, 90), {
      x: 48,
      y,
      size: 11,
      font,
      color: rgb(0.2, 0.25, 0.3),
    });
    y -= 16;
    if (y < 60) break;
  }

  // Side-by-side visual pages (up to 10 for performance)
  const visualPages = Math.min(maxPages, 10);
  for (let i = 1; i <= visualPages; i++) {
    const page = out.addPage([842, 595]); // landscape A4
    page.drawText(`Page ${i} comparison`, {
      x: 36,
      y: 560,
      size: 12,
      font: bold,
      color: rgb(0.06, 0.09, 0.16),
    });
    page.drawText("A", {
      x: 36,
      y: 538,
      size: 10,
      font,
      color: rgb(0.4, 0.45, 0.5),
    });
    page.drawText("B", {
      x: 430,
      y: 538,
      size: 10,
      font,
      color: rgb(0.4, 0.45, 0.5),
    });

    if (i <= aPdf.numPages) {
      const { canvas } = await renderPageToCanvas(aPdf, i, 1.1);
      const jpg = await canvasToJpegBytes(canvas, 0.85);
      const image = await out.embedJpg(jpg);
      const maxW = 380;
      const maxH = 480;
      const scale = Math.min(maxW / image.width, maxH / image.height);
      page.drawImage(image, {
        x: 36,
        y: 40,
        width: image.width * scale,
        height: image.height * scale,
      });
    }
    if (i <= bPdf.numPages) {
      const { canvas } = await renderPageToCanvas(bPdf, i, 1.1);
      const jpg = await canvasToJpegBytes(canvas, 0.85);
      const image = await out.embedJpg(jpg);
      const maxW = 380;
      const maxH = 480;
      const scale = Math.min(maxW / image.width, maxH / image.height);
      page.drawImage(image, {
        x: 430,
        y: 40,
        width: image.width * scale,
        height: image.height * scale,
      });
    }
  }

  return {
    files: [
      {
        name: `compare-${stemName(aFile)}-${stemName(bFile)}.pdf`,
        bytes: await savePdf(out),
        mime: "application/pdf",
      },
    ],
  };
}

export async function translatePdf(
  file: File,
  options: ToolOptions,
): Promise<ProcessResult> {
  const targetLang = options.targetLang || "es";
  const { pages } = await extractAllText(await readBytes(file));
  if (!pages.some((p) => p.trim())) {
    throw new Error(
      "No extractable text found. Run OCR PDF first on scanned documents.",
    );
  }

  const translated = await translateChunks(pages, targetLang);
  const out = await PDFDocument.create();
  const font = await out.embedFont(StandardFonts.Helvetica);
  const bold = await out.embedFont(StandardFonts.HelveticaBold);

  for (let index = 0; index < translated.length; index++) {
    let page = out.addPage([595.28, 841.89]);
    page.drawText(`Translated page ${index + 1} (${targetLang})`, {
      x: 48,
      y: 800,
      size: 12,
      font: bold,
      color: rgb(0.05, 0.45, 0.42),
    });
    const lines = winAnsiSafe(translated[index] || "(empty)").split(/\n/);
    let y = 770;
    for (const line of lines) {
      for (const part of wrapText(line, 90)) {
        if (y < 48) {
          page = out.addPage([595.28, 841.89]);
          y = 800;
        }
        page.drawText(part, {
          x: 48,
          y,
          size: 11,
          font,
          color: rgb(0.06, 0.09, 0.16),
        });
        y -= 14;
      }
    }
  }

  return {
    files: [
      {
        name: `${stemName(file)}-${targetLang}.pdf`,
        bytes: await savePdf(out),
        mime: "application/pdf",
      },
    ],
  };
}

function wrapText(text: string, maxChars: number) {
  if (text.length <= maxChars) return [text];
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

/* -------------------------------------------------------------------------- */
/* Better compress (image recompress)                                          */
/* -------------------------------------------------------------------------- */

export async function compressPdfStrong(file: File): Promise<ProcessResult> {
  const bytes = await readBytes(file);
  const pdf = await openPdfDocument(bytes);
  const out = await PDFDocument.create();

  for (let i = 1; i <= pdf.numPages; i++) {
    const { canvas } = await renderPageToCanvas(pdf, i, 1.25);
    const jpg = await canvasToJpegBytes(canvas, 0.72);
    const image = await out.embedJpg(jpg);
    const page = out.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });
  }

  out.setProducer("SterlingSend");
  out.setCreator("SterlingSend");

  return {
    files: [
      {
        name: `${stemName(file)}-compressed.pdf`,
        bytes: await savePdf(out),
        mime: "application/pdf",
      },
    ],
  };
}
