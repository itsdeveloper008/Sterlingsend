/** Parse "1,3-5,8" into 0-based unique sorted indices within [0, pageCount). */
export function parsePageSpec(spec: string, pageCount: number): number[] {
  const raw = spec.trim();
  if (!raw) return Array.from({ length: pageCount }, (_, i) => i);

  const set = new Set<number>();
  for (const part of raw.split(",")) {
    const token = part.trim();
    if (!token) continue;
    if (token.includes("-")) {
      const [a, b] = token.split("-").map((n) => Number.parseInt(n.trim(), 10));
      if (!Number.isFinite(a) || !Number.isFinite(b)) {
        throw new Error(`Invalid page range: ${token}`);
      }
      const start = Math.min(a, b);
      const end = Math.max(a, b);
      for (let p = start; p <= end; p++) {
        if (p >= 1 && p <= pageCount) set.add(p - 1);
      }
    } else {
      const p = Number.parseInt(token, 10);
      if (!Number.isFinite(p) || p < 1 || p > pageCount) {
        throw new Error(`Page ${token} is out of range (1-${pageCount}).`);
      }
      set.add(p - 1);
    }
  }

  if (set.size === 0) throw new Error("No valid pages selected.");
  return Array.from(set).sort((x, y) => x - y);
}
