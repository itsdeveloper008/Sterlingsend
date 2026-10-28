import { PDF_TOOL_ENTRIES, urlsetResponse } from "@/lib/sitemap";

export const dynamic = "force-static";

export function GET() {
  return urlsetResponse(PDF_TOOL_ENTRIES);
}
