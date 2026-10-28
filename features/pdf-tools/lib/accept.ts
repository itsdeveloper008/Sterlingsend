import type { PdfTool } from "@/features/pdf-tools/catalog";

export function acceptAttr(tool: PdfTool) {
  if (tool.accept === "image") {
    return "image/jpeg,image/png,image/jpg,.jpg,.jpeg,.png";
  }
  if (tool.accept === "pdf-or-image") {
    return "application/pdf,image/jpeg,image/png,.pdf,.jpg,.jpeg,.png";
  }
  if (tool.accept === "word") {
    return ".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  if (tool.accept === "html") {
    return ".html,.htm,text/html";
  }
  return "application/pdf,.pdf";
}

export function acceptHint(tool: PdfTool) {
  if (tool.accept === "image") return "JPG or PNG";
  if (tool.accept === "word") return "DOCX";
  if (tool.accept === "html") return "HTML file or pasted markup";
  if (tool.accept === "pdf-or-image") return "PDF, JPG, or PNG";
  return "PDF";
}
