import {
  PDFDocument,
  StandardFonts,
  degrees,
  rgb,
  type PDFPage,
} from "@cantoo/pdf-lib";
import JSZip from "jszip";
import { stemName } from "@/features/pdf-tools/lib/download";
import { parsePageSpec } from "@/features/pdf-tools/lib/engine/pages";
import {
  comparePdf,
  compressPdfStrong,
  editPdf,
  htmlToPdf,
  ocrPdf,
  pdfForms,
  pdfToExcel,
  pdfToMarkdown,
  pdfToPdfa,
  pdfToPowerpoint,
  pdfToWord,
  repairPdf,
  signPdf,
  translatePdf,
  wordToPdf,
} from "@/features/pdf-tools/lib/engine/soon-tools";
import type {
  ProcessInput,
  ProcessResult,
  ToolOptions,
} from "@/features/pdf-tools/lib/engine/types";

async function readBytes(file: File) {
  return new Uint8Array(await file.arrayBuffer());
}

async function loadPdf(file: File, password?: string) {
  const bytes = await readBytes(file);
  try {
    return await PDFDocument.load(bytes, {
      ignoreEncryption: !password,
      password: password || undefined,
    });
  } catch {
    if (!password) {
      throw new Error(
        "This PDF is encrypted. Enter the password and try again.",
      );
    }
    throw new Error("Could not open the PDF. Check the password and try again.");
  }
}

async function savePdf(doc: PDFDocument) {
  return doc.save({ useObjectStreams: true });
}

function drawWatermark(page: PDFPage, text: string, font: Awaited<ReturnType<PDFDocument["embedFont"]>>) {
  const { width, height } = page.getSize();
  const size = Math.min(width, height) * 0.08;
  page.drawText(text, {
    x: width * 0.15,
    y: height * 0.45,
    size,
    font,
    color: rgb(0.55, 0.55, 0.55),
    opacity: 0.28,
    rotate: degrees(35),
  });
}

async function mergePdf(files: File[]): Promise<ProcessResult> {
  const out = await PDFDocument.create();
  for (const file of files) {
    const src = await loadPdf(file);
    const pages = await out.copyPages(src, src.getPageIndices());
    pages.forEach((p) => out.addPage(p));
  }
  const bytes = await savePdf(out);
  return {
    files: [{ name: "merged.pdf", bytes, mime: "application/pdf" }],
  };
}

async function splitPdf(file: File): Promise<ProcessResult> {
  const src = await loadPdf(file);
  const zip = new JSZip();
  const base = stemName(file);
  for (let i = 0; i < src.getPageCount(); i++) {
    const one = await PDFDocument.create();
    const [page] = await one.copyPages(src, [i]);
    one.addPage(page);
    zip.file(`${base}-page-${i + 1}.pdf`, await savePdf(one));
  }
  const zipped = await zip.generateAsync({ type: "uint8array" });
  return {
    files: [
      {
        name: `${base}-split.zip`,
        bytes: zipped,
        mime: "application/zip",
      },
    ],
  };
}

async function removePages(file: File, options: ToolOptions): Promise<ProcessResult> {
  const src = await loadPdf(file);
  const remove = new Set(parsePageSpec(options.pages || "", src.getPageCount()));
  if (remove.size >= src.getPageCount()) {
    throw new Error("Cannot remove every page. Keep at least one.");
  }
  const keep = src.getPageIndices().filter((i) => !remove.has(i));
  const out = await PDFDocument.create();
  const pages = await out.copyPages(src, keep);
  pages.forEach((p) => out.addPage(p));
  return {
    files: [
      {
        name: `${stemName(file)}-removed.pdf`,
        bytes: await savePdf(out),
        mime: "application/pdf",
      },
    ],
  };
}

async function extractPages(file: File, options: ToolOptions): Promise<ProcessResult> {
  const src = await loadPdf(file);
  const indices = parsePageSpec(options.pages || "1", src.getPageCount());
  const out = await PDFDocument.create();
  const pages = await out.copyPages(src, indices);
  pages.forEach((p) => out.addPage(p));
  return {
    files: [
      {
        name: `${stemName(file)}-extract.pdf`,
        bytes: await savePdf(out),
        mime: "application/pdf",
      },
    ],
  };
}

async function organizePdf(file: File, options: ToolOptions): Promise<ProcessResult> {
  const src = await loadPdf(file);
  const count = src.getPageCount();
  const order =
    options.pageOrder && options.pageOrder.length === count
      ? options.pageOrder
      : src.getPageIndices();
  for (const i of order) {
    if (i < 0 || i >= count) throw new Error("Invalid page order.");
  }
  const out = await PDFDocument.create();
  const pages = await out.copyPages(src, order);
  pages.forEach((p) => out.addPage(p));
  return {
    files: [
      {
        name: `${stemName(file)}-organized.pdf`,
        bytes: await savePdf(out),
        mime: "application/pdf",
      },
    ],
  };
}

async function rotatePdf(files: File[], options: ToolOptions): Promise<ProcessResult> {
  const rotation = options.rotation ?? 90;
  const results: ProcessResult["files"] = [];
  for (const file of files) {
    const doc = await loadPdf(file);
    doc.getPages().forEach((page) => {
      const current = page.getRotation().angle;
      page.setRotation(degrees((current + rotation) % 360));
    });
    results.push({
      name: `${stemName(file)}-rotated.pdf`,
      bytes: await savePdf(doc),
      mime: "application/pdf",
    });
  }
  if (results.length === 1) return { files: results };
  const zip = new JSZip();
  results.forEach((f) => zip.file(f.name, f.bytes));
  return {
    files: [
      {
        name: "rotated.zip",
        bytes: await zip.generateAsync({ type: "uint8array" }),
        mime: "application/zip",
      },
    ],
  };
}

async function cropPdf(file: File, options: ToolOptions): Promise<ProcessResult> {
  const margin = Math.max(0, options.cropMargin ?? 36);
  const doc = await loadPdf(file);
  for (const page of doc.getPages()) {
    const { width, height } = page.getSize();
    const box = {
      x: margin,
      y: margin,
      width: Math.max(24, width - margin * 2),
      height: Math.max(24, height - margin * 2),
    };
    page.setCropBox(box.x, box.y, box.width, box.height);
    page.setMediaBox(box.x, box.y, box.width, box.height);
  }
  return {
    files: [
      {
        name: `${stemName(file)}-cropped.pdf`,
        bytes: await savePdf(doc),
        mime: "application/pdf",
      },
    ],
  };
}

async function pageNumbers(file: File): Promise<ProcessResult> {
  const doc = await loadPdf(file);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const pages = doc.getPages();
  pages.forEach((page, i) => {
    const { width } = page.getSize();
    const label = `${i + 1} / ${pages.length}`;
    const size = 10;
    const textWidth = font.widthOfTextAtSize(label, size);
    page.drawText(label, {
      x: (width - textWidth) / 2,
      y: 18,
      size,
      font,
      color: rgb(0.25, 0.25, 0.25),
    });
  });
  return {
    files: [
      {
        name: `${stemName(file)}-numbered.pdf`,
        bytes: await savePdf(doc),
        mime: "application/pdf",
      },
    ],
  };
}

async function watermark(file: File, options: ToolOptions): Promise<ProcessResult> {
  const text = (options.watermarkText || "CONFIDENTIAL").trim() || "CONFIDENTIAL";
  const doc = await loadPdf(file);
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  doc.getPages().forEach((page) => drawWatermark(page, text, font));
  return {
    files: [
      {
        name: `${stemName(file)}-watermarked.pdf`,
        bytes: await savePdf(doc),
        mime: "application/pdf",
      },
    ],
  };
}

async function protectPdf(file: File, options: ToolOptions): Promise<ProcessResult> {
  const password = options.password?.trim();
  if (!password || password.length < 4) {
    throw new Error("Choose a password with at least 4 characters.");
  }
  const doc = await loadPdf(file);
  doc.encrypt({ userPassword: password, ownerPassword: password });
  const bytes = await savePdf(doc);
  return {
    files: [
      {
        name: `${stemName(file)}-protected.pdf`,
        bytes,
        mime: "application/pdf",
      },
    ],
  };
}

async function unlockPdf(file: File, options: ToolOptions): Promise<ProcessResult> {
  const password = options.password?.trim();
  if (!password) throw new Error("Enter the current PDF password.");
  const doc = await loadPdf(file, password);
  // Re-save without encryption
  const bytes = await doc.save({ useObjectStreams: true });
  return {
    files: [
      {
        name: `${stemName(file)}-unlocked.pdf`,
        bytes,
        mime: "application/pdf",
      },
    ],
  };
}

async function compressPdf(file: File): Promise<ProcessResult> {
  // Re-render pages as optimized JPEGs for a meaningful size reduction.
  try {
    return await compressPdfStrong(file);
  } catch {
    const doc = await loadPdf(file);
    doc.setTitle("");
    doc.setAuthor("");
    doc.setSubject("");
    doc.setKeywords([]);
    doc.setProducer("SterlingSend");
    doc.setCreator("SterlingSend");
    const bytes = await doc.save({ useObjectStreams: true });
    return {
      files: [
        {
          name: `${stemName(file)}-compressed.pdf`,
          bytes,
          mime: "application/pdf",
        },
      ],
    };
  }
}

async function redactPdf(file: File, options: ToolOptions): Promise<ProcessResult> {
  const band = options.redactBand ?? "middle";
  const doc = await loadPdf(file);
  for (const page of doc.getPages()) {
    const { width, height } = page.getSize();
    const h = height * 0.18;
    const y =
      band === "top"
        ? height - h - height * 0.08
        : band === "bottom"
          ? height * 0.08
          : (height - h) / 2;
    page.drawRectangle({
      x: width * 0.08,
      y,
      width: width * 0.84,
      height: h,
      color: rgb(0, 0, 0),
    });
  }
  return {
    files: [
      {
        name: `${stemName(file)}-redacted.pdf`,
        bytes: await savePdf(doc),
        mime: "application/pdf",
      },
    ],
  };
}

async function jpgToPdf(files: File[]): Promise<ProcessResult> {
  const out = await PDFDocument.create();
  for (const file of files) {
    const bytes = await readBytes(file);
    const isPng = file.type === "image/png" || /\.png$/i.test(file.name);
    const image = isPng
      ? await out.embedPng(bytes)
      : await out.embedJpg(bytes);
    const page = out.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });
  }
  return {
    files: [
      {
        name: "images.pdf",
        bytes: await savePdf(out),
        mime: "application/pdf",
      },
    ],
  };
}

async function pdfToJpg(file: File): Promise<ProcessResult> {
  const pdfjs = await import("pdfjs-dist");
  // Use CDN worker that matches the installed major version when possible
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

  const data = await readBytes(file);
  const pdf = await pdfjs.getDocument({ data }).promise;
  const zip = new JSZip();
  const base = stemName(file);

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not create canvas for rendering.");
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", 0.92),
    );
    if (!blob) throw new Error("Failed to encode JPG.");
    zip.file(`${base}-page-${i}.jpg`, await blob.arrayBuffer());
  }

  return {
    files: [
      {
        name: `${base}-jpg.zip`,
        bytes: await zip.generateAsync({ type: "uint8array" }),
        mime: "application/zip",
      },
    ],
  };
}

export async function processTool(input: ProcessInput): Promise<ProcessResult> {
  const { slug, files, options } = input;

  // html-to-pdf can run from pasted HTML with no file
  if (slug === "html-to-pdf") {
    return htmlToPdf(files[0] ?? null, options);
  }

  if (!files.length) throw new Error("Add at least one file.");

  switch (slug) {
    case "merge-pdf":
      return mergePdf(files);
    case "split-pdf":
      return splitPdf(files[0]);
    case "remove-pages":
      return removePages(files[0], options);
    case "extract-pages":
      return extractPages(files[0], options);
    case "organize-pdf":
      return organizePdf(files[0], options);
    case "rotate-pdf":
      return rotatePdf(files, options);
    case "crop-pdf":
      return cropPdf(files[0], options);
    case "page-numbers":
      return pageNumbers(files[0]);
    case "watermark":
      return watermark(files[0], options);
    case "protect-pdf":
      return protectPdf(files[0], options);
    case "unlock-pdf":
      return unlockPdf(files[0], options);
    case "compress-pdf":
      return compressPdf(files[0]);
    case "redact-pdf":
      return redactPdf(files[0], options);
    case "jpg-to-pdf":
      return jpgToPdf(files);
    case "pdf-to-jpg":
      return pdfToJpg(files[0]);
    case "repair-pdf":
      return repairPdf(files[0]);
    case "ocr-pdf":
      return ocrPdf(files[0], options);
    case "pdf-to-word":
      return pdfToWord(files[0]);
    case "pdf-to-powerpoint":
      return pdfToPowerpoint(files[0]);
    case "pdf-to-excel":
      return pdfToExcel(files[0]);
    case "word-to-pdf":
      return wordToPdf(files);
    case "pdf-to-pdfa":
      return pdfToPdfa(files[0]);
    case "pdf-to-markdown":
      return pdfToMarkdown(files[0]);
    case "edit-pdf":
      return editPdf(files[0], options);
    case "pdf-forms":
      return pdfForms(files[0], options);
    case "sign-pdf":
      return signPdf(files[0], options);
    case "compare-pdf":
      return comparePdf(files);
    case "translate-pdf":
      return translatePdf(files[0], options);
    default:
      throw new Error("This tool is not available for processing yet.");
  }
}
