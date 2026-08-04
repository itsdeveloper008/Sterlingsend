export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2_000);
}

export function downloadBytes(
  bytes: Uint8Array,
  filename: string,
  mime = "application/pdf",
) {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  downloadBlob(new Blob([copy], { type: mime }), filename);
}

export function stemName(file: File) {
  return file.name.replace(/\.[^.]+$/, "") || "document";
}
