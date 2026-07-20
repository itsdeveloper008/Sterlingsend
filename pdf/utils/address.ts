export function formatAddressLines(parts: Array<string | undefined>) {
  return parts.map((part) => part?.trim()).filter(Boolean) as string[];
}
