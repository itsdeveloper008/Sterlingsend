export type ToolOptions = {
  password?: string;
  pages?: string;
  rotation?: 90 | 180 | 270;
  watermarkText?: string;
  cropMargin?: number;
  redactBand?: "top" | "middle" | "bottom";
  pageOrder?: number[];
};

export type ProcessResult = {
  files: { name: string; bytes: Uint8Array; mime: string }[];
};

export type ProcessInput = {
  slug: string;
  files: File[];
  options: ToolOptions;
};
