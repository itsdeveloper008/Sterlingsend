const RATE_LIMIT_KEY = "valix_guest_pdf_rate";
const MAX_PDFS_PER_HOUR = 12;
const WINDOW_MS = 60 * 60 * 1000;

function readTimestamps(): number[] {
  if (typeof window === "undefined") return [];

  const raw = sessionStorage.getItem(RATE_LIMIT_KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as number[];
  } catch {
    return [];
  }
}

function writeTimestamps(timestamps: number[]) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(timestamps));
}

export function canGenerateGuestPdf() {
  const now = Date.now();
  const recent = readTimestamps().filter((timestamp) => now - timestamp < WINDOW_MS);
  writeTimestamps(recent);
  return recent.length < MAX_PDFS_PER_HOUR;
}

export function recordGuestPdfGeneration() {
  const now = Date.now();
  const recent = readTimestamps().filter((timestamp) => now - timestamp < WINDOW_MS);
  recent.push(now);
  writeTimestamps(recent);
}

export function getGuestPdfRateLimitMessage() {
  return "You've reached the hourly PDF limit. Please try again later or create a free account.";
}
