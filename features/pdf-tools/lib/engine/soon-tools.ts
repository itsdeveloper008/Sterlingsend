"use client";

import { applyPdfA2b } from "@/features/pdf-tools/lib/engine/pdfa";
import { PDFDocument, StandardFonts, rgb, PDFTextField } from "@cantoo/pdf-lib";
import { jsPDF } from "jspdf";
import { formatFileSize, stemName } from "@/features/pdf-tools/lib/download";
import { buildDocx, type DocxBlock } from "@/features/pdf-tools/lib/engine/docx-writer";
import {
  canvasToJpegBytes,
  extractAllText,
  extractPageText,
  openPdfDocument,
  renderPageToCanvas,
} from "@/features/pdf-tools/lib/engine/pdfjs-helpers";
import type { ProcessResult, ToolOptions } from "@/features/pdf-tools/lib/engine/types";

async function loadPptxGenJs() {
  const mod = await import("pptxgenjs");
  return (mod.default ?? mod) as new () => {
    author: string;
    title: string;
    addSlide: () => {
      addImage: (options: {
        data: string;
        x: number;
        y: number;
        w: string;
        h: string;
      }) => void;
      addNotes: (notes: string) => void;
    };
    write: (options: { outputType: "arraybuffer" }) => Promise<ArrayBuffer>;
  };
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
        const raw = data.responseData?.translatedText || chunk;
        // MyMemory sometimes mangles dashes / quotes into odd tokens
        translated.push(
          raw
            .replace(/\s*!'+\s*/g, " – ")
            .replace(/\s{2,}/g, " ")
            .trim(),
        );
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
  const blocks: DocxBlock[] = [{ text: stemName(file), level: 1 }];

  pages.forEach((text, index) => {
    blocks.push({ text: `Page ${index + 1}`, level: 2 });
    const lines = text ? text.split(/\n/) : ["(No extractable text on this page)"];
    for (const line of lines) {
      blocks.push({ text: line });
    }
  });

  return {
    files: [
      {
        name: `${stemName(file)}.docx`,
        bytes: await buildDocx(blocks),
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
  const { pages } = await extractAllText(await readBytes(file), { columns: true });
  const XLSX = await import("xlsx");
  const workbook = XLSX.utils.book_new();

  pages.forEach((text, index) => {
    const rows = (text || "(No extractable text)")
      .split(/\n/)
      .map((line) => {
        if (line.includes("\t")) return line.split("\t").map(toCell);
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

/** Excel cell: real numbers for plain numeric text (e.g. "1,200.50"). */
function toCell(value: string): string | number {
  const trimmed = value.trim();
  if (/^-?[\d,]*\.?\d+$/.test(trimmed) && !/^0\d/.test(trimmed)) {
    const n = Number(trimmed.replace(/,/g, ""));
    if (Number.isFinite(n)) return n;
  }
  return trimmed;
}

function markdownCell(value: string) {
  return value.trim().replace(/\|/g, "\\|");
}

/** Runs of 2+ lines with the same number (2+) of tab-separated cells become a table. */
function linesToMarkdown(lines: string[]): string[] {
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const cells = lines[i].split("\t");
    if (cells.length >= 2) {
      let j = i + 1;
      while (j < lines.length && lines[j].split("\t").length === cells.length) j++;
      if (j - i >= 2) {
        const rows = lines.slice(i, j).map((l) => l.split("\t").map(markdownCell));
        out.push(`| ${rows[0].join(" | ")} |`);
        out.push(`| ${rows[0].map(() => "---").join(" | ")} |`);
        rows.slice(1).forEach((r) => out.push(`| ${r.join(" | ")} |`));
        out.push("");
        i = j;
        continue;
      }
    }
    out.push(lines[i].replace(/\t/g, " "));
    i++;
  }
  return out;
}

export async function pdfToMarkdown(file: File): Promise<ProcessResult> {
  const { pages } = await extractAllText(await readBytes(file), { columns: true });
  const parts = [`# ${stemName(file)}`, ""];

  pages.forEach((text, index) => {
    parts.push(`## Page ${index + 1}`, "");
    if (!text.trim()) {
      parts.push("_No extractable text on this page._", "");
      return;
    }
    for (const line of linesToMarkdown(text.split(/\n/))) {
      const trimmed = line.trim();
      if (!trimmed) {
        parts.push("");
        continue;
      }
      if (/^#{1,6}\s/.test(trimmed) || trimmed.startsWith("|")) {
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
  const mammoth = (await import("mammoth")).default;

  for (const file of files) {
    if (!/\.docx$/i.test(file.name)) {
      throw new Error("Word to PDF supports .docx files. Save as DOCX and try again.");
    }
    const arrayBuffer = await file.arrayBuffer();
    const { value: html } = await mammoth.convertToHtml({ arrayBuffer });
    const bytes = await htmlStringToPdf(html);
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

  const bytes = await htmlStringToPdf(html);
  return {
    files: [{ name: `${name}.pdf`, bytes, mime: "application/pdf" }],
  };
}

async function htmlStringToPdf(html: string) {
  // Render in a sandboxed frame: the site's own CSS can't leak in (it made
  // headings overlap), and scripts in the uploaded HTML never run.
  const iframe = document.createElement("iframe");
  iframe.setAttribute("sandbox", "allow-same-origin");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText =
    "position:fixed;left:-10000px;top:0;width:794px;height:1123px;border:0;background:#fff";
  const isFullDocument = /<html[\s>]/i.test(html);
  iframe.srcdoc = isFullDocument
    ? html
    : `<!doctype html><html><head><meta charset="utf-8"><style>
        html,body{margin:0;background:#fff}
        body{padding:48px;color:#0f172a;font:16px/1.55 Helvetica,Arial,sans-serif}
        h1,h2,h3{line-height:1.25;margin:0 0 .6em}
        p,ul,ol,table{margin:0 0 1em}
        img{max-width:100%;height:auto}
        table{border-collapse:collapse}
        th,td{border:1px solid #cbd5e1;padding:4px 8px;text-align:left}
      </style></head><body>${html}</body></html>`;
  const loaded = new Promise<void>((resolve) => {
    iframe.onload = () => resolve();
  });
  document.body.appendChild(iframe);

  try {
    await loaded;
    const body = iframe.contentDocument?.body;
    if (!body) throw new Error("Could not render this HTML.");
    if (isFullDocument) body.style.background ||= "#fff";
    iframe.style.height = `${Math.max(body.scrollHeight, 1123)}px`;

    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(body, {
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
    iframe.remove();
  }
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

  applyPdfA2b(out, {
    title: src.getTitle() || stemName(file),
    author: src.getAuthor() || "SterlingSend",
    producer: "SterlingSend PDF/A",
    date: new Date(),
  });

  return {
    files: [
      {
        name: `${stemName(file)}-pdfa.pdf`,
        // PDF/A metadata streams must stay readable, so skip object streams.
        bytes: await out.save({ useObjectStreams: false }),
        mime: "application/pdf",
      },
    ],
    note: "Saved as PDF/A-2b. Fonts that weren't embedded in the original stay un-embedded.",
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

/** Words that appear more often in one text than the other (first 12 each). */
function wordChanges(a: string, b: string) {
  const count = (text: string) => {
    const map = new Map<string, number>();
    for (const w of text.split(/\s+/).filter(Boolean)) {
      map.set(w, (map.get(w) ?? 0) + 1);
    }
    return map;
  };
  const ca = count(a);
  const cb = count(b);
  const diff = (x: Map<string, number>, y: Map<string, number>) =>
    [...x].flatMap(([w, n]) => Array(Math.max(0, n - (y.get(w) ?? 0))).fill(w)).slice(0, 12);
  return { removed: diff(ca, cb), added: diff(cb, ca) };
}

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
    if (!same) {
      const { removed, added } = wordChanges(left, right);
      if (removed.length) summaryLines.push(`   Only in A: ${removed.join(" ")}`);
      if (added.length) summaryLines.push(`   Only in B: ${added.join(" ")}`);
    }
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

/** Script fonts for canvas rendering (Helvetica cannot draw Hindi/CJK/Arabic). */
const TRANSLATE_FONT_STACK: Record<string, { family: string; url: string }[]> = {
  hi: [
    {
      family: "Noto Sans Devanagari",
      url: "https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-devanagari@5.2.5/files/noto-sans-devanagari-devanagari-400-normal.woff",
    },
  ],
  mr: [
    {
      family: "Noto Sans Devanagari",
      url: "https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-devanagari@5.2.5/files/noto-sans-devanagari-devanagari-400-normal.woff",
    },
  ],
  ar: [
    {
      family: "Noto Sans Arabic",
      url: "https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-arabic@5.2.5/files/noto-sans-arabic-arabic-400-normal.woff",
    },
  ],
  "zh-CN": [
    {
      family: "Noto Sans SC",
      url: "https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-sc@5.2.5/files/noto-sans-sc-chinese-simplified-400-normal.woff",
    },
  ],
  ja: [
    {
      family: "Noto Sans JP",
      url: "https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-jp@5.2.5/files/noto-sans-jp-japanese-400-normal.woff",
    },
  ],
  ko: [
    {
      family: "Noto Sans KR",
      url: "https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-kr@5.2.5/files/noto-sans-kr-korean-400-normal.woff",
    },
  ],
};

const LATIN_TRANSLATE_FONT = {
  family: "Noto Sans",
  url: "https://cdn.jsdelivr.net/npm/@fontsource/noto-sans@5.2.5/files/noto-sans-latin-400-normal.woff",
};

const loadedTranslateFonts = new Set<string>();

async function ensureTranslateFonts(lang: string) {
  const stack = [
    LATIN_TRANSLATE_FONT,
    ...(TRANSLATE_FONT_STACK[lang] ?? []),
  ];
  await Promise.all(
    stack.map(async ({ family, url }) => {
      const key = `${family}:${url}`;
      if (loadedTranslateFonts.has(key)) return;
      try {
        const face = new FontFace(family, `url(${url}) format("woff")`, {
          style: "normal",
          weight: "400",
        });
        const loaded = await face.load();
        document.fonts.add(loaded);
        loadedTranslateFonts.add(key);
      } catch {
        // Fall back to system fonts if CDN fetch fails
      }
    }),
  );
  return stack.map((f) => `"${f.family}"`).join(", ") + ", sans-serif";
}

function wrapTextToWidth(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
) {
  const words = text.split(/\s+/).filter(Boolean);
  if (!words.length) return [""];
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && current) {
      lines.push(current);
      // Long unbroken token: hard-split by measured width
      if (ctx.measureText(word).width > maxWidth) {
        let chunk = "";
        for (const ch of word) {
          const tryChunk = chunk + ch;
          if (ctx.measureText(tryChunk).width > maxWidth && chunk) {
            lines.push(chunk);
            chunk = ch;
          } else {
            chunk = tryChunk;
          }
        }
        current = chunk;
      } else {
        current = word;
      }
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function renderTranslatedPageCanvas(
  title: string,
  body: string,
  fontFamily: string,
  rtl: boolean,
) {
  const pageW = 595.28;
  const pageH = 841.89;
  const margin = 48;
  const scale = 2;
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(pageW * scale);
  canvas.height = Math.ceil(pageH * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create canvas for translation.");

  ctx.scale(scale, scale);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, pageW, pageH);
  ctx.fillStyle = "#0c7380";
  ctx.font = `600 12px ${fontFamily}`;
  ctx.direction = rtl ? "rtl" : "ltr";
  ctx.textAlign = rtl ? "right" : "left";
  const titleX = rtl ? pageW - margin : margin;
  ctx.fillText(title, titleX, 52);

  ctx.fillStyle = "#0f172a";
  ctx.font = `400 11px ${fontFamily}`;
  const maxWidth = pageW - margin * 2;
  let y = 78;
  const lineHeight = 16;
  const paragraphs = (body || "(empty)").split(/\n/);

  for (const paragraph of paragraphs) {
    const lines = wrapTextToWidth(ctx, paragraph || " ", maxWidth);
    for (const line of lines) {
      if (y > pageH - margin) break;
      ctx.fillText(line, titleX, y);
      y += lineHeight;
    }
    y += 4;
  }

  return canvas;
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

  const fontFamily = await ensureTranslateFonts(targetLang);
  const translated = await translateChunks(pages, targetLang);
  const out = await PDFDocument.create();
  const rtl = targetLang === "ar";

  for (let index = 0; index < translated.length; index++) {
    const text = translated[index] || "(empty)";
    // Overflow onto extra pages when body is long
    const pageW = 595.28;
    const pageH = 841.89;
    const margin = 48;
    const measure = document.createElement("canvas").getContext("2d");
    if (!measure) throw new Error("Could not measure translated text.");
    measure.font = `400 11px ${fontFamily}`;
    const maxWidth = pageW - margin * 2;
    const allLines: string[] = [];
    for (const paragraph of text.split(/\n/)) {
      allLines.push(...wrapTextToWidth(measure, paragraph || " ", maxWidth));
      allLines.push("");
    }
    const linesPerPage = Math.floor((pageH - 78 - margin) / 16);
    const chunks: string[][] = [];
    for (let i = 0; i < allLines.length; i += linesPerPage) {
      chunks.push(allLines.slice(i, i + linesPerPage));
    }
    if (!chunks.length) chunks.push([""]);

    for (let c = 0; c < chunks.length; c++) {
      const title =
        chunks.length > 1
          ? `Translated page ${index + 1}.${c + 1} (${targetLang})`
          : `Translated page ${index + 1} (${targetLang})`;
      const canvas = renderTranslatedPageCanvas(
        title,
        chunks[c].join("\n"),
        fontFamily,
        rtl,
      );
      const jpg = await canvasToJpegBytes(canvas, 0.92);
      const image = await out.embedJpg(jpg);
      const page = out.addPage([pageW, pageH]);
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: pageW,
        height: pageH,
      });
    }
  }

  out.setProducer("SterlingSend Translate");
  out.setCreator("SterlingSend");

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

/* -------------------------------------------------------------------------- */
/* Better compress (image recompress)                                          */
/* -------------------------------------------------------------------------- */

type RenderedPage = {
  canvas: HTMLCanvasElement;
  /** Page size in PDF points (scale 1), so output pages keep their size. */
  width: number;
  height: number;
};

/** A piece of the original text, in output-page points (origin bottom-left). */
type TextRun = { text: string; x: number; y: number; size: number; width: number };

/** Render scales tried for a target size, sharpest first. */
const COMPRESS_SCALES = [1.5, 1.25, 1, 0.8, 0.65, 0.5, 0.4];
const COMPRESS_MIN_QUALITY = 0.3;
const COMPRESS_MAX_QUALITY = 0.92;

async function renderAllPages(
  pdf: Awaited<ReturnType<typeof openPdfDocument>>,
  scale: number,
): Promise<RenderedPage[]> {
  const pages: RenderedPage[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const { canvas, page } = await renderPageToCanvas(pdf, i, scale);
    const base = page.getViewport({ scale: 1 });
    pages.push({ canvas, width: base.width, height: base.height });
  }
  return pages;
}

/**
 * Read the original text with positions so the image-only output can carry an
 * invisible copy: compressed PDFs stay selectable, searchable and copyable.
 */
async function extractTextRuns(
  pdf: Awaited<ReturnType<typeof openPdfDocument>>,
): Promise<TextRun[][]> {
  const all: TextRun[][] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1 });
    const content = await page.getTextContent();
    const runs: TextRun[] = [];
    for (const item of content.items) {
      if (!("str" in item) || !item.str.trim()) continue;
      const [a, b, c, d, e, f] = item.transform as number[];
      const size = Math.hypot(c, d) || Math.hypot(a, b);
      if (size < 1) continue;
      // Viewport handles crop-box offsets and page rotation.
      const [vx, vy] = viewport.convertToViewportPoint(e, f);
      runs.push({
        text: winAnsiSafe(item.str),
        x: vx,
        y: viewport.height - vy,
        size,
        width: item.width,
      });
    }
    all.push(runs);
  }
  return all;
}

function releasePages(pages: RenderedPage[]) {
  for (const p of pages) {
    p.canvas.width = 0;
    p.canvas.height = 0;
  }
}

async function buildJpegPdf(
  pages: RenderedPage[],
  quality: number,
  text: TextRun[][],
) {
  const out = await PDFDocument.create();
  const font = text.some((runs) => runs.length)
    ? await out.embedFont(StandardFonts.Helvetica)
    : null;
  for (const [index, p] of pages.entries()) {
    const jpg = await canvasToJpegBytes(p.canvas, quality);
    const image = await out.embedJpg(jpg);
    const page = out.addPage([p.width, p.height]);
    page.drawImage(image, { x: 0, y: 0, width: p.width, height: p.height });
    if (!font) continue;
    for (const run of text[index] ?? []) {
      // Match the original run width so selection lines up with the image.
      const natural = font.widthOfTextAtSize(run.text, run.size);
      const size =
        run.width > 0 && natural > 0
          ? Math.min(run.size * 1.5, Math.max(run.size * 0.5, (run.size * run.width) / natural))
          : run.size;
      try {
        page.drawText(run.text, { x: run.x, y: run.y, size, font, opacity: 0 });
      } catch {
        // Skip runs the standard font cannot encode.
      }
    }
  }
  out.setProducer("SterlingSend");
  out.setCreator("SterlingSend");
  return savePdf(out);
}

/**
 * Re-render pages as JPEGs with an invisible text layer. With `targetBytes`, search render scale and JPEG
 * quality for the sharpest result at or under the target; if it cannot be
 * reached, return the smallest result and say so in `note`.
 */
export async function compressPdfStrong(
  file: File,
  targetBytes?: number,
): Promise<ProcessResult> {
  const bytes = await readBytes(file);
  const pdf = await openPdfDocument(bytes);
  const name = `${stemName(file)}-compressed.pdf`;
  const result = (out: Uint8Array, note?: string): ProcessResult => ({
    files: [{ name, bytes: out, mime: "application/pdf" }],
    note,
  });

  const text = await extractTextRuns(pdf);

  // Lossless pass: re-save with object streams; keeps vectors and fonts.
  let lossless: Uint8Array | null = null;
  try {
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    doc.setProducer("SterlingSend");
    doc.setCreator("SterlingSend");
    const saved = await savePdf(doc);
    if (saved.byteLength < bytes.byteLength) lossless = saved;
  } catch {
    // Damaged or encrypted: rely on the image pass.
  }

  if (!targetBytes) {
    const pages = await renderAllPages(pdf, 1.25);
    const out = await buildJpegPdf(pages, 0.72, text);
    releasePages(pages);
    const best = [out, lossless].reduce<Uint8Array | null>(
      (acc, b) => (b && (!acc || b.byteLength < acc.byteLength) ? b : acc),
      null,
    )!;
    // Never hand back a bigger file than the user uploaded.
    if (best.byteLength >= bytes.byteLength) {
      return result(
        bytes,
        `This PDF is already well compressed (${formatFileSize(bytes.byteLength)}), so it was not changed.`,
      );
    }
    return result(best);
  }

  const target = formatFileSize(targetBytes);
  if (bytes.byteLength <= targetBytes) {
    return result(
      bytes,
      `This PDF is already ${formatFileSize(bytes.byteLength)}, under your ${target} target, so it was not changed.`,
    );
  }
  if (lossless && lossless.byteLength <= targetBytes) {
    return result(
      lossless,
      `Compressed from ${formatFileSize(bytes.byteLength)} to ${formatFileSize(lossless.byteLength)} without losing quality (target ${target}).`,
    );
  }

  let smallest: Uint8Array | null = null;
  for (const scale of COMPRESS_SCALES) {
    const pages = await renderAllPages(pdf, scale);
    try {
      const low = await buildJpegPdf(pages, COMPRESS_MIN_QUALITY, text);
      if (!smallest || low.byteLength < smallest.byteLength) smallest = low;
      if (low.byteLength > targetBytes) continue;

      let best = low;
      let lo = COMPRESS_MIN_QUALITY;
      let hi = COMPRESS_MAX_QUALITY;
      for (let i = 0; i < 6; i++) {
        const mid = (lo + hi) / 2;
        const out = await buildJpegPdf(pages, mid, text);
        if (out.byteLength <= targetBytes) {
          best = out;
          lo = mid;
        } else {
          hi = mid;
        }
      }
      return result(
        best,
        `Compressed from ${formatFileSize(bytes.byteLength)} to ${formatFileSize(best.byteLength)} (target ${target}).`,
      );
    } finally {
      releasePages(pages);
    }
  }

  const out = smallest!;
  return result(
    out,
    `Could not reach ${target}. The smallest this PDF can go is ${formatFileSize(out.byteLength)}.`,
  );
}
