export type ToolCategory =
  | "optimize"
  | "convert"
  | "organize"
  | "edit"
  | "security";

export type ToolStatus = "ready" | "soon";

export type ToolAccept = "pdf" | "image" | "pdf-or-image" | "word" | "html";

export type PdfTool = {
  slug: string;
  title: string;
  description: string;
  category: ToolCategory;
  status: ToolStatus;
  accept: ToolAccept;
  /** Minimum files required to run */
  minFiles: number;
  /** Soft max for UI (0 = unlimited) */
  maxFiles: number;
  icon: string;
};

export const CATEGORY_META: Record<
  ToolCategory,
  { title: string; description: string }
> = {
  optimize: {
    title: "Optimize & Compress",
    description: "Reduce size, repair, and make scanned PDFs searchable.",
  },
  convert: {
    title: "Convert to & from PDF",
    description: "Turn documents and images into PDFs, or the other way around.",
  },
  organize: {
    title: "Organize PDF",
    description: "Merge, split, reorder, and extract pages.",
  },
  edit: {
    title: "Edit PDF & Forms",
    description: "Annotate, rotate, crop, number pages, and add watermarks.",
  },
  security: {
    title: "PDF Security & Signing",
    description: "Protect, unlock, redact, sign, and compare documents.",
  },
};

export const PDF_TOOLS: PdfTool[] = [
  // Optimize
  {
    slug: "compress-pdf",
    title: "Compress PDF",
    description: "Reduce file size while keeping usable quality.",
    category: "optimize",
    status: "ready",
    accept: "pdf",
    minFiles: 1,
    maxFiles: 1,
    icon: "Minimize2",
  },
  {
    slug: "repair-pdf",
    title: "Repair PDF",
    description: "Recover data from damaged or corrupt PDF files.",
    category: "optimize",
    status: "ready",
    accept: "pdf",
    minFiles: 1,
    maxFiles: 1,
    icon: "Wrench",
  },
  {
    slug: "ocr-pdf",
    title: "OCR PDF",
    description: "Convert scanned PDFs into searchable, selectable text.",
    category: "optimize",
    status: "ready",
    accept: "pdf",
    minFiles: 1,
    maxFiles: 1,
    icon: "ScanText",
  },
  // Convert
  {
    slug: "pdf-to-word",
    title: "PDF to Word",
    description: "Convert PDFs into editable DOC/DOCX documents.",
    category: "convert",
    status: "ready",
    accept: "pdf",
    minFiles: 1,
    maxFiles: 1,
    icon: "FileType",
  },
  {
    slug: "pdf-to-powerpoint",
    title: "PDF to PowerPoint",
    description: "Turn PDFs into editable PPT/PPTX slideshows.",
    category: "convert",
    status: "ready",
    accept: "pdf",
    minFiles: 1,
    maxFiles: 1,
    icon: "Presentation",
  },
  {
    slug: "pdf-to-excel",
    title: "PDF to Excel",
    description: "Pull table data from PDFs into spreadsheets.",
    category: "convert",
    status: "ready",
    accept: "pdf",
    minFiles: 1,
    maxFiles: 1,
    icon: "Sheet",
  },
  {
    slug: "pdf-to-jpg",
    title: "PDF to JPG",
    description: "Export each PDF page as a high-quality JPG image.",
    category: "convert",
    status: "ready",
    accept: "pdf",
    minFiles: 1,
    maxFiles: 1,
    icon: "Image",
  },
  {
    slug: "jpg-to-pdf",
    title: "JPG to PDF",
    description: "Convert images into a single PDF document.",
    category: "convert",
    status: "ready",
    accept: "image",
    minFiles: 1,
    maxFiles: 40,
    icon: "Images",
  },
  {
    slug: "word-to-pdf",
    title: "Word to PDF",
    description: "Convert DOC/DOCX files into polished PDFs.",
    category: "convert",
    status: "ready",
    accept: "word",
    minFiles: 1,
    maxFiles: 5,
    icon: "FileText",
  },
  {
    slug: "html-to-pdf",
    title: "HTML to PDF",
    description: "Turn HTML files or pasted markup into PDF documents.",
    category: "convert",
    status: "ready",
    accept: "html",
    minFiles: 0,
    maxFiles: 1,
    icon: "Globe",
  },
  {
    slug: "pdf-to-pdfa",
    title: "PDF to PDF/A",
    description: "Create archival PDF/A for long-term storage.",
    category: "convert",
    status: "ready",
    accept: "pdf",
    minFiles: 1,
    maxFiles: 1,
    icon: "Archive",
  },
  {
    slug: "pdf-to-markdown",
    title: "PDF to Markdown",
    description: "Turn PDFs into Markdown with headings, tables, and lists.",
    category: "convert",
    status: "ready",
    accept: "pdf",
    minFiles: 1,
    maxFiles: 1,
    icon: "FileCode",
  },
  // Organize
  {
    slug: "merge-pdf",
    title: "Merge PDF",
    description: "Combine multiple PDFs into one file in any order.",
    category: "organize",
    status: "ready",
    accept: "pdf",
    minFiles: 2,
    maxFiles: 40,
    icon: "Combine",
  },
  {
    slug: "split-pdf",
    title: "Split PDF",
    description: "Separate pages into independent PDF files.",
    category: "organize",
    status: "ready",
    accept: "pdf",
    minFiles: 1,
    maxFiles: 1,
    icon: "Scissors",
  },
  {
    slug: "remove-pages",
    title: "Remove pages",
    description: "Delete specific pages from your PDF.",
    category: "organize",
    status: "ready",
    accept: "pdf",
    minFiles: 1,
    maxFiles: 1,
    icon: "FileMinus",
  },
  {
    slug: "extract-pages",
    title: "Extract pages",
    description: "Pull out selected pages into a new PDF.",
    category: "organize",
    status: "ready",
    accept: "pdf",
    minFiles: 1,
    maxFiles: 1,
    icon: "FileOutput",
  },
  {
    slug: "organize-pdf",
    title: "Organize PDF",
    description: "Reorder pages visually before downloading.",
    category: "organize",
    status: "ready",
    accept: "pdf",
    minFiles: 1,
    maxFiles: 1,
    icon: "LayoutList",
  },
  // Edit
  {
    slug: "edit-pdf",
    title: "Edit PDF",
    description: "Add text overlays to any page of your PDF.",
    category: "edit",
    status: "ready",
    accept: "pdf",
    minFiles: 1,
    maxFiles: 1,
    icon: "PenLine",
  },
  {
    slug: "rotate-pdf",
    title: "Rotate PDF",
    description: "Rotate pages 90°, 180°, or 270°.",
    category: "edit",
    status: "ready",
    accept: "pdf",
    minFiles: 1,
    maxFiles: 10,
    icon: "RotateCw",
  },
  {
    slug: "crop-pdf",
    title: "Crop PDF",
    description: "Trim margins from every page.",
    category: "edit",
    status: "ready",
    accept: "pdf",
    minFiles: 1,
    maxFiles: 1,
    icon: "Crop",
  },
  {
    slug: "page-numbers",
    title: "Page numbers",
    description: "Insert customizable page numbers.",
    category: "edit",
    status: "ready",
    accept: "pdf",
    minFiles: 1,
    maxFiles: 1,
    icon: "Hash",
  },
  {
    slug: "watermark",
    title: "Watermark",
    description: "Stamp text across every page.",
    category: "edit",
    status: "ready",
    accept: "pdf",
    minFiles: 1,
    maxFiles: 1,
    icon: "Stamp",
  },
  {
    slug: "pdf-forms",
    title: "PDF Forms",
    description: "Fill existing form fields or stamp form details.",
    category: "edit",
    status: "ready",
    accept: "pdf",
    minFiles: 1,
    maxFiles: 1,
    icon: "ClipboardList",
  },
  // Security
  {
    slug: "unlock-pdf",
    title: "Unlock PDF",
    description: "Remove password protection when you know the password.",
    category: "security",
    status: "ready",
    accept: "pdf",
    minFiles: 1,
    maxFiles: 1,
    icon: "Unlock",
  },
  {
    slug: "protect-pdf",
    title: "Protect PDF",
    description: "Encrypt a PDF with a password.",
    category: "security",
    status: "ready",
    accept: "pdf",
    minFiles: 1,
    maxFiles: 1,
    icon: "Lock",
  },
  {
    slug: "sign-pdf",
    title: "Sign PDF",
    description: "Draw your e-signature and place it on the document.",
    category: "security",
    status: "ready",
    accept: "pdf",
    minFiles: 1,
    maxFiles: 1,
    icon: "Signature",
  },
  {
    slug: "redact-pdf",
    title: "Redact PDF",
    description: "Permanently black out sensitive regions on every page.",
    category: "security",
    status: "ready",
    accept: "pdf",
    minFiles: 1,
    maxFiles: 1,
    icon: "Square",
  },
  {
    slug: "compare-pdf",
    title: "Compare PDF",
    description: "Side-by-side comparison to spot changes.",
    category: "security",
    status: "ready",
    accept: "pdf",
    minFiles: 2,
    maxFiles: 2,
    icon: "Columns2",
  },
  {
    slug: "translate-pdf",
    title: "Translate PDF",
    description: "Translate document text into another language.",
    category: "security",
    status: "ready",
    accept: "pdf",
    minFiles: 1,
    maxFiles: 1,
    icon: "Languages",
  },
];

export const CATEGORY_ORDER: ToolCategory[] = [
  "optimize",
  "convert",
  "organize",
  "edit",
  "security",
];

export function getToolBySlug(slug: string): PdfTool | undefined {
  return PDF_TOOLS.find((t) => t.slug === slug);
}

export function toolsByCategory(category: ToolCategory): PdfTool[] {
  return PDF_TOOLS.filter((t) => t.category === category);
}
