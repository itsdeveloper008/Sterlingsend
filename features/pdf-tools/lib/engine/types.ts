export type ToolOptions = {
  password?: string;
  pages?: string;
  rotation?: 90 | 180 | 270;
  watermarkText?: string;
  cropMargin?: number;
  redactBand?: "top" | "middle" | "bottom";
  pageOrder?: number[];
  /** OCR language code for tesseract (e.g. eng, spa) */
  ocrLang?: string;
  /** Translation target language code (e.g. es, fr, de) */
  targetLang?: string;
  /** Raw HTML for html-to-pdf */
  htmlContent?: string;
  /** Edit PDF overlay */
  editText?: string;
  editPage?: number;
  editX?: number;
  editY?: number;
  editFontSize?: number;
  /** Forms */
  formName?: string;
  formEmail?: string;
  formDate?: string;
  flattenForms?: boolean;
  /** Sign PDF */
  signatureDataUrl?: string;
  signerName?: string;
  signPage?: number;
  signX?: number;
  signY?: number;
};

export type ProcessResult = {
  files: { name: string; bytes: Uint8Array; mime: string }[];
};

export type ProcessInput = {
  slug: string;
  files: File[];
  options: ToolOptions;
};
