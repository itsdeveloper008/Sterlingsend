"use client";

/** Largest stored logo edge in px; plenty for the invoice header and PDF. */
const MAX_EDGE = 512;
/** Keep the stored string well under Firestore's 1 MiB document limit. */
export const MAX_LOGO_DATA_URL_LENGTH = 400_000;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read that image"));
    img.src = src;
  });
}

/**
 * Downscale a logo file in the browser and return it as a data URL, so the
 * business record can hold it directly (no Cloud Storage bucket needed).
 */
export async function logoFileToDataUrl(file: File): Promise<string> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(objectUrl);
    const width = img.naturalWidth || MAX_EDGE;
    const height = img.naturalHeight || MAX_EDGE;
    const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not process that image");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // PNG keeps transparency; fall back to WebP (also transparent) if too large.
    let dataUrl = canvas.toDataURL("image/png");
    if (dataUrl.length > MAX_LOGO_DATA_URL_LENGTH) {
      dataUrl = canvas.toDataURL("image/webp", 0.9);
    }
    if (dataUrl.length > MAX_LOGO_DATA_URL_LENGTH) {
      throw new Error("Logo is too detailed. Try a simpler or smaller image.");
    }
    return dataUrl;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
